import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// Upload vehicle images
router.post(
  "/:vehicle_id/images",
  authMiddleware,
  requireRole("admin", "manager", "seller"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { vehicle_id } = req.params
      const { images } = req.body // Array of {url, alt_text, is_primary}

      if (!images || images.length === 0) {
        return res.status(400).json({ message: "No images provided" })
      }

      // Verify vehicle belongs to tenant
      const vehicleResult = await pool.query("SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2", [
        vehicle_id,
        req.user?.tenant_id,
      ])

      if (vehicleResult.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      // If setting a new primary, unset others
      const hasPrimary = images.some((img: any) => img.is_primary)
      if (hasPrimary) {
        await pool.query("UPDATE vehicle_images SET is_primary = FALSE WHERE vehicle_id = $1", [vehicle_id])
      }

      const insertedImages = []

      for (const image of images) {
        const result = await pool.query(
          `INSERT INTO vehicle_images (id, vehicle_id, image_url, alt_text, is_primary)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [uuidv4(), vehicle_id, image.url, image.alt_text || "", image.is_primary || false],
        )
        insertedImages.push(result.rows[0])
      }

      res.status(201).json({ message: "Images uploaded", images: insertedImages })
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error uploading images" })
    }
  },
)

// Delete vehicle image
router.delete("/images/:image_id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { image_id } = req.params

    // Verify image belongs to tenant's vehicle
    const imageResult = await pool.query(
      `SELECT vi.* FROM vehicle_images vi
       JOIN vehicles v ON vi.vehicle_id = v.id
       WHERE vi.id = $1 AND v.tenant_id = $2`,
      [image_id, req.user?.tenant_id],
    )

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" })
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

      // Verify vehicle belongs to tenant
      const vehicleResult = await pool.query("SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2", [
        vehicle_id,
        req.user?.tenant_id,
      ])

      if (vehicleResult.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      // Unset other primary images
      await pool.query("UPDATE vehicle_images SET is_primary = FALSE WHERE vehicle_id = $1", [vehicle_id])

      // Set this one as primary
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
