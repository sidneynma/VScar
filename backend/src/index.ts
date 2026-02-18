import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import pool from "./db"

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from "./routes/auth"
import tenantsRoutes from "./routes/tenants"
import usersRoutes from "./routes/users"
import revendasRoutes from "./routes/revendas"
import vehiclesRoutes from "./routes/vehicles"
import announcementsRoutes from "./routes/announcements"
import portalsRoutes from "./routes/portals"
import portalSyncRoutes from "./routes/portal-sync"
import vehicleImagesRoutes from "./routes/vehicle-images"

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Health check
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      query_result: result.rows[0],
    })
  } catch (error) {
    console.error("[v0] Database health check failed:", error)
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/tenants", tenantsRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/revendas", revendasRoutes)
app.use("/api/vehicles", vehiclesRoutes)
app.use("/api/announcements", announcementsRoutes)
app.use("/api/portals", portalsRoutes)
app.use("/api/portals", portalSyncRoutes)
app.use("/api/vehicles", vehicleImagesRoutes)

// Debug endpoints
app.get("/debug/tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    res.json({
      tables: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("[v0] Table listing failed:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
})

app.get("/debug/stats", async (req, res) => {
  try {
    const queries = {
      tenants: "SELECT COUNT(*) FROM tenants",
      users: "SELECT COUNT(*) FROM users",
      revendas: "SELECT COUNT(*) FROM revendas",
      vehicles: "SELECT COUNT(*) FROM vehicles",
      announcements: "SELECT COUNT(*) FROM announcements",
    }

    const stats: Record<string, any> = {}
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query)
      stats[key] = Number.parseInt(result.rows[0].count)
    }

    res.json({ stats, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("[v0] Stats query failed:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
})

app.get("/debug/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT u.id, u.email, u.name, u.role, u.status, t.name as tenant_name FROM users u JOIN tenants t ON u.tenant_id = t.id ORDER BY u.created_at DESC",
    )
    res.json({
      users: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("[v0] Users listing failed:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
})

app.get("/debug/tenants", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, slug, status FROM tenants ORDER BY created_at DESC")
    res.json({
      tenants: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("[v0] Tenants listing failed:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
})

app.post("/debug/reset-admin-password", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs")
    const newPassword = "admin123"
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Reset all users to admin123
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 RETURNING id, email, name",
      [hashedPassword]
    )

    res.json({
      message: "All passwords reset to: admin123",
      hash: hashedPassword,
      users: result.rows,
    })
  } catch (error) {
    console.error("[v0] Password reset failed:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
})

app.get("/debug/verify-password", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs")
    const result = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1",
      ["admin@vscar.com.br"]
    )

    if (result.rows.length === 0) {
      return res.json({ message: "User not found" })
    }

    const user = result.rows[0]
    const match = await bcrypt.compare("admin123", user.password_hash)

    res.json({
      email: user.email,
      name: user.name,
      hash_prefix: user.password_hash.substring(0, 20) + "...",
      password_match_admin123: match,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  })
})

// Start server
pool
  .connect()
  .then(() => {
    console.log("Database connected successfully")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Database connection failed:", err)
    process.exit(1)
  })

export { pool }
