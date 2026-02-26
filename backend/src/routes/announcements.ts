import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// List announcements
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              v.id as vehicle_id_ref,
              v.title as vehicle_title,
              v.brand as vehicle_brand,
              v.model as vehicle_model,
              v.plate as vehicle_plate,
              v.year as vehicle_year,
              v.price as vehicle_price,
              v.fuel_type as vehicle_fuel_type,
              v.transmission as vehicle_transmission,
              v.mileage as vehicle_mileage,
              v.color as vehicle_color,
              v.interior_color as vehicle_interior_color,
              v.doors as vehicle_doors,
              v.vehicle_type as vehicle_vehicle_type,
              v.financial_state as vehicle_financial_state,
              v.documentation as vehicle_documentation,
              v.conservation as vehicle_conservation,
              v.features as vehicle_features,
              v.description as vehicle_description
       FROM announcements a
       JOIN vehicles v ON v.id = a.vehicle_id
       WHERE a.tenant_id = $1
       ORDER BY a.created_at DESC`,
      [req.user?.tenant_id],
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching announcements" })
  }
})

// Create announcement
router.post("/", authMiddleware, requireRole("admin", "manager", "seller"), async (req: AuthRequest, res: Response) => {
  try {
    const { vehicle_id, title, description, portal_ids, status } = req.body

    if (!vehicle_id || !title) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const announcementId = uuidv4()

    const result = await pool.query(
      `INSERT INTO announcements (id, tenant_id, vehicle_id, title, description, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *`,
      [announcementId, req.user?.tenant_id, vehicle_id, title, description, status || "draft"],
    )

    // Create portal mappings if portal_ids provided
    if (portal_ids && portal_ids.length > 0) {
      for (const portal_id of portal_ids) {
        await pool.query("INSERT INTO portal_mappings (id, announcement_id, portal_id) VALUES ($1, $2, $3)", [
          uuidv4(),
          announcementId,
          portal_id,
        ])
      }
    }

    res.status(201).json({ message: "Announcement created", announcement: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error creating announcement" })
  }
})

// Get announcement with contacts
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const announcementResult = await pool.query(
      `SELECT a.*, 
              v.id as vehicle_id_ref,
              v.title as vehicle_title,
              v.brand as vehicle_brand,
              v.model as vehicle_model,
              v.plate as vehicle_plate,
              v.year as vehicle_year,
              v.price as vehicle_price,
              v.fuel_type as vehicle_fuel_type,
              v.transmission as vehicle_transmission,
              v.mileage as vehicle_mileage,
              v.color as vehicle_color,
              v.interior_color as vehicle_interior_color,
              v.doors as vehicle_doors,
              v.vehicle_type as vehicle_vehicle_type,
              v.financial_state as vehicle_financial_state,
              v.documentation as vehicle_documentation,
              v.conservation as vehicle_conservation,
              v.features as vehicle_features,
              v.description as vehicle_description
       FROM announcements a
       JOIN vehicles v ON v.id = a.vehicle_id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [req.params.id, req.user?.tenant_id],
    )

    if (announcementResult.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    const contactsResult = await pool.query(
      "SELECT * FROM contacts WHERE announcement_id = $1 ORDER BY created_at DESC",
      [req.params.id],
    )

    const announcement = announcementResult.rows[0]
    announcement.contacts = contactsResult.rows

    res.json(announcement)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching announcement" })
  }
})

// Update announcement status
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin", "manager", "seller"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, featured, featured_until, title, description } = req.body

      const result = await pool.query(
        `UPDATE announcements
         SET status = COALESCE($1, status),
             featured = COALESCE($2, featured),
             featured_until = COALESCE($3, featured_until),
             title = COALESCE($4, title),
             description = COALESCE($5, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 AND tenant_id = $7 RETURNING *`,
        [status, featured, featured_until, title, description, req.params.id, req.user?.tenant_id],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      res.json({ message: "Announcement updated", announcement: result.rows[0] })
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error updating announcement" })
    }
  },
)

export default router
