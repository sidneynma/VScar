import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { OLXService } from "../services/olx-service"
import axios from "axios"

const router = express.Router()

// Sync announcement to portal
router.post(
  "/:portal_id/sync/:announcement_id",
  authMiddleware,
  requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { portal_id, announcement_id } = req.params
      const tenant_id = req.user?.tenant_id

      // Get portal configuration
      const portalResult = await pool.query("SELECT * FROM portals WHERE id = $1 AND tenant_id = $2", [
        portal_id,
        tenant_id,
      ])

      if (portalResult.rows.length === 0) {
        return res.status(404).json({ message: "Portal not found" })
      }

      const portal = portalResult.rows[0]

      // Get announcement and vehicle data
      const announcementResult = await pool.query(
        `SELECT a.*, v.*, vi.image_url as primary_image
       FROM announcements a
       JOIN vehicles v ON a.vehicle_id = v.id
       LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = true
       WHERE a.id = $1 AND a.tenant_id = $2`,
        [announcement_id, tenant_id],
      )

      if (announcementResult.rows.length === 0) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      const announcement = announcementResult.rows[0]

      // Get all images
      const imagesResult = await pool.query(
        "SELECT image_url FROM vehicle_images WHERE vehicle_id = $1 ORDER BY is_primary DESC",
        [announcement.vehicle_id],
      )

      const images = imagesResult.rows.map((row) => row.image_url)

      // Get tenant info for seller data
      const tenantResult = await pool.query("SELECT * FROM tenants WHERE id = $1", [tenant_id])
      const tenant = tenantResult.rows[0]

      let syncResult: any

      // Handle different portal types
      if (portal.slug === "olx") {
        const olxService = new OLXService(portal.api_key)

        const payload = {
          title: announcement.title,
          description: announcement.description || announcement.model,
          price: announcement.price,
          images: images,
          category: announcement.vehicle_type === "motorcycle" ? "motorcycles" : "cars",
          brand: announcement.brand,
          model: announcement.model,
          year: announcement.year,
          mileage: announcement.mileage || 0,
          fuel_type: announcement.fuel_type,
          transmission: announcement.transmission,
          doors: announcement.doors || 4,
          color: announcement.color || "Não especificado",
          seller_name: tenant.name,
          seller_phone: tenant.phone || "",
          seller_email: tenant.email,
        }

        // Check if mapping already exists
        const mappingResult = await pool.query(
          "SELECT * FROM portal_mappings WHERE announcement_id = $1 AND portal_id = $2",
          [announcement_id, portal_id],
        )

        if (mappingResult.rows.length > 0 && mappingResult.rows[0].external_id) {
          // Update existing
          syncResult = await olxService.updateListing(mappingResult.rows[0].external_id, payload)
        } else {
          // Create new
          syncResult = await olxService.createListing(payload)
        }
      } else if (portal.slug === "marketplace") {
        // Generic marketplace integration
        syncResult = await syncToGenericPortal(portal, announcement, images, tenant)
      }

      if (!syncResult.success) {
        // Update mapping with error
        await pool.query(
          `UPDATE portal_mappings SET status = 'failed', sync_error = $1, updated_at = CURRENT_TIMESTAMP
         WHERE announcement_id = $2 AND portal_id = $3`,
          [syncResult.error, announcement_id, portal_id],
        )

        return res.status(400).json({ message: "Sync failed", error: syncResult.error })
      }

      // Update or create mapping
      const existingMapping = await pool.query(
        "SELECT * FROM portal_mappings WHERE announcement_id = $1 AND portal_id = $2",
        [announcement_id, portal_id],
      )

      if (existingMapping.rows.length > 0) {
        await pool.query(
          `UPDATE portal_mappings SET external_id = $1, status = 'synced', last_sync = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE announcement_id = $2 AND portal_id = $3`,
          [syncResult.external_id || syncResult.data?.id, announcement_id, portal_id],
        )
      } else {
        await pool.query(
          `INSERT INTO portal_mappings (id, announcement_id, portal_id, external_id, status, last_sync)
         VALUES (uuid_generate_v4(), $1, $2, $3, 'synced', CURRENT_TIMESTAMP)`,
          [announcement_id, portal_id, syncResult.external_id || syncResult.data?.id],
        )
      }

      res.json({
        message: "Sync successful",
        external_id: syncResult.external_id,
        url: syncResult.url,
      })
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error syncing to portal" })
    }
  },
)

// Unsync announcement from portal
router.delete(
  "/:portal_id/sync/:announcement_id",
  authMiddleware,
  requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { portal_id, announcement_id } = req.params
      const tenant_id = req.user?.tenant_id

      const portalResult = await pool.query("SELECT * FROM portals WHERE id = $1 AND tenant_id = $2", [
        portal_id,
        tenant_id,
      ])

      if (portalResult.rows.length === 0) {
        return res.status(404).json({ message: "Portal not found" })
      }

      const portal = portalResult.rows[0]
      const mappingResult = await pool.query(
        "SELECT * FROM portal_mappings WHERE announcement_id = $1 AND portal_id = $2",
        [announcement_id, portal_id],
      )

      if (mappingResult.rows.length === 0 || !mappingResult.rows[0].external_id) {
        return res.status(404).json({ message: "Mapping not found" })
      }

      const mapping = mappingResult.rows[0]

      if (portal.slug === "olx") {
        const olxService = new OLXService(portal.api_key)
        const result = await olxService.deleteListing(mapping.external_id)

        if (!result.success) {
          return res.status(400).json({ message: "Failed to delete from portal" })
        }
      }

      await pool.query("UPDATE portal_mappings SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [
        mapping.id,
      ])

      res.json({ message: "Unsync successful" })
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error unsyncing from portal" })
    }
  },
)

// Get portal sync status for announcement
router.get("/:portal_id/status/:announcement_id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { portal_id, announcement_id } = req.params

    const mappingResult = await pool.query(
      `SELECT pm.*, p.name as portal_name FROM portal_mappings pm
       JOIN portals p ON pm.portal_id = p.id
       WHERE pm.announcement_id = $1 AND pm.portal_id = $2`,
      [announcement_id, portal_id],
    )

    if (mappingResult.rows.length === 0) {
      return res.status(404).json({ message: "No sync found" })
    }

    res.json(mappingResult.rows[0])
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching sync status" })
  }
})

async function syncToGenericPortal(portal: any, announcement: any, images: string[], tenant: any) {
  try {
    const payload = {
      title: announcement.title,
      description: announcement.description || announcement.model,
      price: announcement.price,
      images: images,
      vehicle: {
        brand: announcement.brand,
        model: announcement.model,
        year: announcement.year,
        mileage: announcement.mileage,
        fuel_type: announcement.fuel_type,
        transmission: announcement.transmission,
        color: announcement.color,
      },
      seller: {
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
      },
    }

    const response = await axios.post(`${portal.base_url}/listings`, payload, {
      headers: {
        "X-API-Key": portal.api_key,
        "Content-Type": "application/json",
      },
    })

    return {
      success: true,
      external_id: response.data.id,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
}

export default router
