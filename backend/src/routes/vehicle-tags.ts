import express, { type Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { pool } from "../index"
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth"

const router = express.Router()

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const revendaId = String(req.query.revenda_id || "")
    const params: any[] = [req.user?.tenant_id]
    let query = "SELECT * FROM vehicle_tags WHERE tenant_id = $1"

    if (revendaId) {
      params.push(revendaId)
      query += ` AND (revenda_id = $${params.length} OR revenda_id IS NULL)`
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching vehicle tags:", error)
    res.status(500).json({ message: "Erro ao buscar tags de veículo" })
  }
})

router.post("/", authMiddleware, requireRole("admin", "manager", "seller"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, color, revenda_id, status } = req.body

    if (!name) {
      return res.status(400).json({ message: "Nome da tag é obrigatório" })
    }

    const result = await pool.query(
      `INSERT INTO vehicle_tags (id, tenant_id, revenda_id, name, color, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), req.user?.tenant_id, revenda_id || null, name, color || "#3B82F6", status || "active"],
    )

    res.status(201).json(result.rows[0])
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ message: "Tag já cadastrada para esta revenda" })
    }

    console.error("Error creating vehicle tag:", error)
    res.status(500).json({ message: "Erro ao criar tag de veículo" })
  }
})

export default router
