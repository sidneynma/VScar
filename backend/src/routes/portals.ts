import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// List portals
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM portals WHERE tenant_id = $1", [req.user?.tenant_id])
    res.json(result.rows)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching portals" })
  }
})

// Create portal
router.post("/", authMiddleware, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, api_key, api_secret, base_url, config } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const result = await pool.query(
      `INSERT INTO portals (id, tenant_id, name, slug, api_key, api_secret, base_url, config)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [uuidv4(), req.user?.tenant_id, name, slug, api_key, api_secret, base_url, JSON.stringify(config || {})],
    )

    res.status(201).json({ message: "Portal created", portal: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error creating portal" })
  }
})

// Sync announcement to portal
router.post("/:id/sync", authMiddleware, requireRole("admin", "manager"), async (req: AuthRequest, res: Response) => {
  try {
    const { announcement_id } = req.body

    if (!announcement_id) {
      return res.status(400).json({ message: "Announcement ID is required" })
    }

    // Get portal config
    const portalResult = await pool.query("SELECT * FROM portals WHERE id = $1 AND tenant_id = $2", [
      req.params.id,
      req.user?.tenant_id,
    ])

    if (portalResult.rows.length === 0) {
      return res.status(404).json({ message: "Portal not found" })
    }

    const portal = portalResult.rows[0]

    // Get announcement and vehicle data
    const announcementResult = await pool.query(
      `SELECT a.*, v.* FROM announcements a
       JOIN vehicles v ON a.vehicle_id = v.id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [announcement_id, req.user?.tenant_id],
    )

    if (announcementResult.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    // Here you would implement the actual sync logic for each portal
    // For now, we'll just update the mapping status

    const mappingResult = await pool.query(
      `UPDATE portal_mappings SET status = 'synced', last_sync = CURRENT_TIMESTAMP
       WHERE announcement_id = $1 AND portal_id = $2 RETURNING *`,
      [announcement_id, req.params.id],
    )

    res.json({ message: "Portal sync initiated", mapping: mappingResult.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error syncing to portal" })
  }
})

export default router
