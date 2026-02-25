import express, { type Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { pool } from "../index"
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth"

const router = express.Router()

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenant_id
    const profile = String(req.query.profile || "all")
    const search = String(req.query.search || "").trim().toLowerCase()

    const conditions: string[] = ["vp.tenant_id = $1"]
    const params: any[] = [tenantId]

    if (["owner", "buyer", "both"].includes(profile)) {
      params.push(profile)
      conditions.push(`vp.profile_type = $${params.length} OR vp.profile_type = 'both'`)
    }

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(LOWER(vp.name) LIKE $${params.length} OR LOWER(COALESCE(vp.document, '')) LIKE $${params.length} OR LOWER(COALESCE(vp.phone, '')) LIKE $${params.length})`)
    }

    const result = await pool.query(
      `SELECT vp.*, 
        COUNT(vph.id) FILTER (WHERE vph.relation_type = 'owner')::int AS vehicles_sold,
        COUNT(vph.id) FILTER (WHERE vph.relation_type = 'buyer')::int AS vehicles_bought
       FROM vehicle_parties vp
       LEFT JOIN vehicle_party_history vph ON vph.party_id = vp.id AND vph.tenant_id = vp.tenant_id
       WHERE ${conditions.join(" AND ")}
       GROUP BY vp.id
       ORDER BY vp.created_at DESC`,
      params,
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching vehicle parties:", error)
    res.status(500).json({ message: "Erro ao buscar proprietários/compradores" })
  }
})

router.post("/", authMiddleware, requireRole("admin", "manager", "seller"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, document, profile_type, notes } = req.body

    if (!name) {
      return res.status(400).json({ message: "Nome é obrigatório" })
    }

    const result = await pool.query(
      `INSERT INTO vehicle_parties (id, tenant_id, name, email, phone, document, profile_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [uuidv4(), req.user?.tenant_id, name, email || null, phone || null, document || null, profile_type || "both", notes || null],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating vehicle party:", error)
    res.status(500).json({ message: "Erro ao cadastrar contato" })
  }
})

router.put("/:id", authMiddleware, requireRole("admin", "manager", "seller"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, document, profile_type, notes, status } = req.body

    const result = await pool.query(
      `UPDATE vehicle_parties
       SET name = $1, email = $2, phone = $3, document = $4, profile_type = $5, notes = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND tenant_id = $9
       RETURNING *`,
      [name, email || null, phone || null, document || null, profile_type || "both", notes || null, status || "active", req.params.id, req.user?.tenant_id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cadastro não encontrado" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating vehicle party:", error)
    res.status(500).json({ message: "Erro ao atualizar cadastro" })
  }
})

router.get("/:id/history", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const partyExists = await pool.query(
      `SELECT id FROM vehicle_parties WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user?.tenant_id],
    )

    if (partyExists.rowCount === 0) {
      return res.status(404).json({ message: "Cadastro não encontrado" })
    }

    const result = await pool.query(
      `SELECT vph.*, v.title, v.brand, v.model, v.year, v.plate
       FROM vehicle_party_history vph
       JOIN vehicles v ON v.id = vph.vehicle_id
       WHERE vph.party_id = $1 AND vph.tenant_id = $2
       ORDER BY vph.event_date DESC, vph.created_at DESC`,
      [req.params.id, req.user?.tenant_id],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching vehicle party history:", error)
    res.status(500).json({ message: "Erro ao buscar histórico" })
  }
})

router.post("/:id/history", authMiddleware, requireRole("admin", "manager", "seller"), async (req: AuthRequest, res: Response) => {
  try {
    const { vehicle_id, relation_type, event_date, sale_price, notes } = req.body

    if (!vehicle_id || !relation_type) {
      return res.status(400).json({ message: "Veículo e tipo de vínculo são obrigatórios" })
    }

    if (!["owner", "buyer"].includes(relation_type)) {
      return res.status(400).json({ message: "Tipo de vínculo inválido" })
    }

    const vehicleCheck = await pool.query(
      "SELECT id FROM vehicles WHERE id = $1 AND tenant_id = $2",
      [vehicle_id, req.user?.tenant_id],
    )

    if (vehicleCheck.rowCount === 0) {
      return res.status(404).json({ message: "Veículo não encontrado" })
    }

    const partyCheck = await pool.query(
      "SELECT id FROM vehicle_parties WHERE id = $1 AND tenant_id = $2",
      [req.params.id, req.user?.tenant_id],
    )

    if (partyCheck.rowCount === 0) {
      return res.status(404).json({ message: "Cadastro não encontrado" })
    }

    const result = await pool.query(
      `INSERT INTO vehicle_party_history (id, tenant_id, vehicle_id, party_id, relation_type, event_date, sale_price, notes)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), $7, $8)
       RETURNING *`,
      [uuidv4(), req.user?.tenant_id, vehicle_id, req.params.id, relation_type, event_date || null, sale_price || null, notes || null],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating vehicle party history:", error)
    res.status(500).json({ message: "Erro ao vincular veículo" })
  }
})

export default router
