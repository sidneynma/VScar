import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"
import axios from "axios"

const router = express.Router()

const ACTIVE_STORAGE_SERVICE = process.env.ACTIVE_STORAGE_SERVICE || "local"
const STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || ""
const STORAGE_ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID || ""
const STORAGE_SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY || ""
const STORAGE_REGION = process.env.STORAGE_REGION || "auto"
const STORAGE_ENDPOINT = (process.env.STORAGE_ENDPOINT || "").replace(/\/$/, "")
const STORAGE_FORCE_PATH_STYLE = (process.env.STORAGE_FORCE_PATH_STYLE || "true") === "true"

type IncomingImage = {
  url?: string
  alt_text?: string
  is_primary?: boolean
  data?: string // base64 (sem prefixo)
  filename?: string
  mime_type?: string
}

const sha256Hex = (value: string | Buffer) =>
  crypto.createHash("sha256").update(value).digest("hex")

const hmac = (key: Buffer | string, value: string) =>
  crypto.createHmac("sha256", key).update(value).digest()

const getSigningKey = (secret: string, dateStamp: string, region: string, service: string) => {
  const kDate = hmac(`AWS4${secret}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, "aws4_request")
}

const formatAmzDate = (date: Date) =>
  date.toISOString().replace(/[:-]|\.\d{3}/g, "")

const signRequest = (
  method: "PUT" | "DELETE",
  objectKey: string,
  payloadHash: string,
  options?: {
    contentType?: string
    region?: string
    virtualHostStyle?: boolean
  },
) => {
  const now = new Date()
  const amzDate = formatAmzDate(now)
  const dateStamp = amzDate.slice(0, 8)
  const endpointUrl = new URL(STORAGE_ENDPOINT)
  const objectPath = objectKey
    .split("/")
    .map((chunk) => encodeURIComponent(chunk))
    .join("/")

  const region = options?.region || STORAGE_REGION
  const virtualHostStyle = options?.virtualHostStyle || false

  const host = virtualHostStyle
    ? `${STORAGE_BUCKET_NAME}.${endpointUrl.host}`
    : endpointUrl.host

  const canonicalUri = virtualHostStyle
    ? `/${objectPath}`
    : `/${STORAGE_BUCKET_NAME}/${objectPath}`

  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  }

  if (options?.contentType) headers["content-type"] = options.contentType

  const sortedHeaderEntries = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b))
  const canonicalHeaders = sortedHeaderEntries.map(([k, v]) => `${k}:${v.trim()}\n`).join("")
  const signedHeaders = sortedHeaderEntries.map(([k]) => k).join(";")

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n")

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n")

  const signingKey = getSigningKey(STORAGE_SECRET_ACCESS_KEY, dateStamp, region, "s3")

  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex")

  const authorization = [
    "AWS4-HMAC-SHA256",
    `Credential=${STORAGE_ACCESS_KEY_ID}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ")

  const baseUrl = virtualHostStyle
    ? `${endpointUrl.protocol}//${host}`
    : STORAGE_ENDPOINT

  return {
    url: `${baseUrl}${canonicalUri}`,
    headers: {
      ...headers,
      Authorization: authorization,
    },
  }
}

const uploadToMinio = async (vehicleId: string, tenantId: string, image: IncomingImage) => {
  if (
    !STORAGE_ENDPOINT ||
    !STORAGE_BUCKET_NAME ||
    !STORAGE_ACCESS_KEY_ID ||
    !STORAGE_SECRET_ACCESS_KEY
  ) {
    throw new Error("Configuração do MinIO incompleta")
  }

  if (!image.data) throw new Error("Imagem inválida")

  const ext = image.filename?.split(".").pop() || "jpg"
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "jpg"
  const objectKey = `vehicles/${tenantId}/${vehicleId}/${Date.now()}-${uuidv4()}.${safeExt}`
  const body = Buffer.from(image.data, "base64")
  const payloadHash = sha256Hex(body)
  const contentType = image.mime_type || "image/jpeg"

  const regionsToTry = [STORAGE_REGION, "sa-east-1", "us-east-1"]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)

  const stylesToTry = STORAGE_FORCE_PATH_STYLE ? [false] : [false, true]

  let lastError = "Erro desconhecido"

  for (const region of regionsToTry) {
    for (const virtualHostStyle of stylesToTry) {
      const signed = signRequest("PUT", objectKey, payloadHash, {
        contentType,
        region,
        virtualHostStyle,
      })

      try {
        const response = await axios.put(signed.url, body, {
          headers: {
            ...signed.headers,
            "content-type": contentType,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          validateStatus: () => true,
        })

        if (response.status >= 200 && response.status < 300) {
          return `${STORAGE_ENDPOINT}/${STORAGE_BUCKET_NAME}/${objectKey}`
        }

        const bodyMessage =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data || {})

        lastError = `status ${response.status} (region=${region}, style=${virtualHostStyle ? "virtual" : "path"}) - ${bodyMessage}`
      } catch (error: any) {
        lastError = error?.message || "falha de conexão"
      }
    }
  }

  throw new Error(`Erro ao enviar para MinIO: ${lastError}`)
}

const deleteFromMinio = async (imageUrl: string) => {
  if (!imageUrl.startsWith(`${STORAGE_ENDPOINT}/${STORAGE_BUCKET_NAME}/`)) return

  const objectKey = imageUrl.replace(`${STORAGE_ENDPOINT}/${STORAGE_BUCKET_NAME}/`, "")
  const payloadHash = sha256Hex("")
  const signed = signRequest("DELETE", objectKey, payloadHash, {
    region: STORAGE_REGION,
  })

  await axios.delete(signed.url, {
    headers: signed.headers,
    validateStatus: () => true,
  })
}

// Upload vehicle images
router.post(
  "/:vehicle_id/images",
  authMiddleware,
  requireRole("admin", "manager", "seller"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { vehicle_id } = req.params
      const { images } = req.body as { images?: IncomingImage[] }

      if (!images || images.length === 0) {
        return res.status(400).json({ message: "No images provided" })
      }

      const tenantId = req.user?.tenant_id

      const vehicleResult = await pool.query("SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2", [
        vehicle_id,
        tenantId,
      ])

      if (vehicleResult.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      const hasPrimary = images.some((img) => img.is_primary)
      if (hasPrimary) {
        await pool.query("UPDATE vehicle_images SET is_primary = FALSE WHERE vehicle_id = $1", [vehicle_id])
      }

      const insertedImages = []

      for (const image of images) {
        let imageUrl = image.url || ""

        if (!imageUrl && image.data) {
          if (ACTIVE_STORAGE_SERVICE !== "s3_compatible") {
            return res.status(400).json({ message: "Storage S3/MinIO não está ativo" })
          }
          imageUrl = await uploadToMinio(vehicle_id, String(tenantId), image)
        }

        if (!imageUrl) continue

        const result = await pool.query(
          `INSERT INTO vehicle_images (id, vehicle_id, image_url, alt_text, is_primary)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [uuidv4(), vehicle_id, imageUrl, image.alt_text || "", image.is_primary || false],
        )
        insertedImages.push(result.rows[0])
      }

      res.status(201).json({ message: "Images uploaded", images: insertedImages })
    } catch (err: any) {
      console.error("Error:", err)
      res.status(500).json({ message: err?.message || "Error uploading images" })
    }
  },
)

// Delete vehicle image
router.delete("/:vehicle_id/images/:image_id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { image_id, vehicle_id } = req.params

    const imageResult = await pool.query(
      `SELECT vi.* FROM vehicle_images vi
       JOIN vehicles v ON vi.vehicle_id = v.id
       WHERE vi.id = $1 AND vi.vehicle_id = $2 AND v.tenant_id = $3`,
      [image_id, vehicle_id, req.user?.tenant_id],
    )

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" })
    }

    if (ACTIVE_STORAGE_SERVICE === "s3_compatible") {
      await deleteFromMinio(imageResult.rows[0].image_url)
    }

    await pool.query("DELETE FROM vehicle_images WHERE id = $1", [image_id])

    res.json({ message: "Image deleted" })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error deleting image" })
  }
})

// Set primary image
router.put(
  "/:vehicle_id/images/:image_id/primary",
  authMiddleware,
  requireRole("admin", "manager", "seller"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { vehicle_id, image_id } = req.params

      const vehicleResult = await pool.query("SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2", [
        vehicle_id,
        req.user?.tenant_id,
      ])

      if (vehicleResult.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      await pool.query("UPDATE vehicle_images SET is_primary = FALSE WHERE vehicle_id = $1", [vehicle_id])

      const result = await pool.query(
        "UPDATE vehicle_images SET is_primary = TRUE WHERE id = $1 AND vehicle_id = $2 RETURNING *",
        [image_id, vehicle_id],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Image not found" })
      }

      res.json({ message: "Primary image updated", image: result.rows[0] })
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error updating primary image" })
    }
  },
)

export default router
