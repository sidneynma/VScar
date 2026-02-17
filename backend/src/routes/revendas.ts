import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// List revendas
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM revendas WHERE tenant_id = $1", [req.user?.tenant_id])
    res.json(result.rows)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching revendas" })
  }
})

// Create revenda
router.post("/", authMiddleware, requireRole("admin", "manager"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      cnpj,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      website,
      contact_person,
      commission_percentage,
    } = req.body

    if (!name || !email || !address || !city || !state) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const result = await pool.query(
      `INSERT INTO revendas (id, tenant_id, name, cnpj, email, phone, address, city, state, postal_code, website, contact_person, commission_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        uuidv4(),
        req.user?.tenant_id,
        name,
        cnpj,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        website,
        contact_person,
        commission_percentage || 5.0,
      ],
    )

    res.status(201).json({ message: "Revenda created", revenda: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error creating revenda" })
  }
})

// Update revenda
router.put("/:id", authMiddleware, requireRole("admin", "manager"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      cnpj,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      website,
      contact_person,
      commission_percentage,
      status,
    } = req.body

    const result = await pool.query(
      `UPDATE revendas SET name = $1, cnpj = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, postal_code = $8, website = $9, contact_person = $10, commission_percentage = $11, status = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 AND tenant_id = $14 RETURNING *`,
      [
        name,
        cnpj,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        website,
        contact_person,
        commission_percentage,
        status,
        req.params.id,
        req.user?.tenant_id,
      ],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Revenda not found" })
    }

    res.json({ message: "Revenda updated", revenda: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error updating revenda" })
  }
})

export default router
