import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = express.Router()

// List vehicles
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status
    let query = "SELECT * FROM vehicles WHERE tenant_id = $1"
    const params: any[] = [req.user?.tenant_id]

    if (status) {
      query += " AND status = $2"
      params.push(status)
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching vehicles" })
  }
})

// Create vehicle
router.post("/", authMiddleware, requireRole("admin", "manager", "seller"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      brand,
      model,
      year,
      color,
      fuel_type,
      transmission,
      mileage,
      price,
      description,
      interior_color,
      doors,
      vehicle_type,
      revenda_id,
    } = req.body

    if (!title || !brand || !model || !year || !price) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const result = await pool.query(
      `INSERT INTO vehicles (id, tenant_id, revenda_id, title, brand, model, year, color, fuel_type, transmission, mileage, price, description, interior_color, doors, vehicle_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        uuidv4(),
        req.user?.tenant_id,
        revenda_id || null,
        title,
        brand,
        model,
        year,
        color,
        fuel_type,
        transmission,
        mileage,
        price,
        description,
        interior_color,
        doors,
        vehicle_type || "car",
      ],
    )

    res.status(201).json({ message: "Vehicle created", vehicle: result.rows[0] })
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error creating vehicle" })
  }
})

// Get vehicle with images
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const vehicleResult = await pool.query("SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2", [
      req.params.id,
      req.user?.tenant_id,
    ])

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    const imagesResult = await pool.query(
      "SELECT * FROM vehicle_images WHERE vehicle_id = $1 ORDER BY is_primary DESC, created_at ASC",
      [req.params.id],
    )

    const vehicle = vehicleResult.rows[0]
    vehicle.images = imagesResult.rows

    res.json(vehicle)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Error fetching vehicle" })
  }
})

// Update vehicle
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin", "manager", "seller"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        title,
        brand,
        model,
        year,
        color,
        fuel_type,
        transmission,
        mileage,
        price,
        description,
        status,
        interior_color,
        doors,
        vehicle_type,
      } = req.body

      const result = await pool.query(
        `UPDATE vehicles SET title = $1, brand = $2, model = $3, year = $4, color = $5, fuel_type = $6, transmission = $7, mileage = $8, price = $9, description = $10, status = $11, interior_color = $12, doors = $13, vehicle_type = $14, updated_at = CURRENT_TIMESTAMP
       WHERE id = $15 AND tenant_id = $16 RETURNING *`,
        [
          title,
          brand,
          model,
          year,
          color,
          fuel_type,
          transmission,
          mileage,
          price,
          description,
          status,
          interior_color,
          doors,
          vehicle_type,
          req.params.id,
          req.user?.tenant_id,
        ],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      res.json({ message: "Vehicle updated", vehicle: result.rows[0] })
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error updating vehicle" })
    }
  },
)

export default router
