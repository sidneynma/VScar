import express, { type Request, type Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "../index"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { tenant_name, tenant_slug, email, password, name } = req.body

    // Validate input
    if (!tenant_name || !tenant_slug || !email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const tenantId = uuidv4()
    const userId = uuidv4()

    // Create tenant and user in transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const tenantResult = await client.query(
        "INSERT INTO tenants (id, name, slug, email) VALUES ($1, $2, $3, $4) RETURNING *",
        [tenantId, tenant_name, tenant_slug, email],
      )

      const userResult = await client.query(
        "INSERT INTO users (id, tenant_id, name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, role",
        [userId, tenantId, name, email, hashedPassword, "admin", "active"],
      )

      await client.query("COMMIT")

      const token = jwt.sign(
        { id: userResult.rows[0].id, email: userResult.rows[0].email, tenant_id: tenantId, role: "admin" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      )

      res.status(201).json({
        message: "Tenant and user created successfully",
        tenant: tenantResult.rows[0],
        user: userResult.rows[0],
        token,
      })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ message: "Registration failed" })
  }
})

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    console.log("[v0] Login attempt for email:", email)

    const result = await pool.query(
      "SELECT u.id, u.email, u.name, u.role, u.tenant_id, u.password_hash, t.status FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.email = $1",
      [email],
    )

    if (result.rows.length === 0) {
      console.log("[v0] User not found:", email)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = result.rows[0]
    console.log("[v0] User found:", user.email, "tenant_status:", user.status)

    if (user.status !== "active" && user.status !== null) {
      console.log("[v0] Tenant inactive:", user.status)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    console.log("[v0] Comparing password for user:", user.email)
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log("[v0] Password match result:", passwordMatch)

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login
    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

    const token = jwt.sign(
      { id: user.id, email: user.email, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    )

    console.log("[v0] Login successful for user:", user.email)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    })
  } catch (err) {
    console.error("[v0] Login error:", err)
    res.status(500).json({ message: "Login failed" })
  }
})

export default router
