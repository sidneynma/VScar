import express, { type Response } from "express"
import bcrypt from "bcryptjs"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// List users in tenant
router.get("/", authMiddleware, requireRole("admin", "manager"), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, status, last_login, created_at FROM users WHERE tenant_id = $1",
      [req.user?.tenant_id],
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching users" })
  }
})

// Create user
router.post("/", authMiddleware, requireRole("admin", "manager"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    const result = await pool.query(
      "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, status",
      [userId, req.user?.tenant_id, name, email, hashedPassword, role],
    )

    res.status(201).json({ message: "User created", user: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error creating user" })
  }
})

// Update user
router.put("/:id", authMiddleware, requireRole("admin", "manager"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, status } = req.body

    const result = await pool.query(
      "UPDATE users SET name = $1, role = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND tenant_id = $5 RETURNING id, name, email, role, status",
      [name, role, status, req.params.id, req.user?.tenant_id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User updated", user: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error updating user" })
  }
})

export default router
