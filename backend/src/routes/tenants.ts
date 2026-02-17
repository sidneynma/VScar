import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest } from "../middleware/auth"

const router = express.Router()

// Get tenant info
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const result = await pool.query("SELECT * FROM tenants WHERE id = $1", [req.user.tenant_id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching tenant" })
  }
})

// Update tenant
router.put("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { name, email, phone, cnpj, address, city, state, postal_code, website, logo_url } = req.body

    const result = await pool.query(
      `UPDATE tenants SET name = $1, email = $2, phone = $3, cnpj = $4, address = $5, city = $6, state = $7, postal_code = $8, website = $9, logo_url = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *`,
      [name, email, phone, cnpj, address, city, state, postal_code, website, logo_url, req.user.tenant_id],
    )

    res.json({ message: "Tenant updated", tenant: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error updating tenant" })
  }
})

export default router
