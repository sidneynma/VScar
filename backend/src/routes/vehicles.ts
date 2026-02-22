import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"
import { FipeService } from "../services/fipe-service";

const router = express.Router()
const fipeService = new FipeService();

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
router.post(
  "/",
  authMiddleware,
  requireRole("admin", "manager", "seller"),
  async (req: AuthRequest, res: Response) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

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
        purchase_price,
        description,
        interior_color,
        doors,
        vehicle_type,
        financial_state,
        documentation,
        conservation,
        features,
        revenda_id,

        // FIPE códigos enviados do frontend
        marca_codigo,
        modelo_codigo,
        ano_codigo,
        tipoVeiculo,
      } = req.body;

      if (!title || !brand || !model || !year || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 1️⃣ Criar veículo
      const result = await client.query(
        `INSERT INTO vehicles (
          id, tenant_id, revenda_id,
          title, brand, model, year,
          color, fuel_type, transmission,
          mileage, price, purchase_price,
          description, interior_color,
          doors, vehicle_type,
          financial_state,
          documentation, conservation, features
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,
          $19,$20,$21
        )
        RETURNING *`,
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
          purchase_price || null,
          description,
          interior_color,
          doors,
          vehicle_type || "car",
          financial_state || "paid",
          documentation || [],
          conservation || [],
          features || [],
        ]
      );

      const vehicle = result.rows[0];

      // 2️⃣ Buscar últimas 3 referências
      const refResult = await client.query(`
        SELECT *
        FROM fipe_reference
        ORDER BY codigo_tabela DESC
        LIMIT 3
      `);

      const referencias = refResult.rows;

      let currentValue = null;

      for (let i = 0; i < referencias.length; i++) {
        const ref = referencias[i];

        // 🔥 Aqui você chama seu service FIPE
        const consulta = await fipeService.getValorComReferencia(
          ref.codigo_tabela, // 1️⃣ referência
          tipoVeiculo, // 2️⃣ tipo veículo
          marca_codigo, // 3️⃣ marca
          modelo_codigo, // 4️⃣ modelo
          ano_codigo // 5️⃣ ano
        );
        
        const valorNumerico = parseFloat(
          consulta.Valor.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
        );

        await client.query(
          `INSERT INTO fipe_consult_history (
            vehicle_id,
            fipe_reference_id,
            valor,
            codigo_fipe,
            marca,
            modelo,
            ano_modelo,
            combustivel,
            autenticacao,
            sigla_combustivel,
            data_consulta,
            raw_json
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
          )`,
          [
            vehicle.id,
            ref.id,
            valorNumerico,
            consulta.CodigoFipe,
            consulta.Marca,
            consulta.Modelo,
            consulta.AnoModelo,
            consulta.Combustivel,
            consulta.Autenticacao,
            consulta.SiglaCombustivel,
            new Date(),
            consulta,
          ]
        );

        if (i === 0) {
          currentValue = valorNumerico;
        }
      }

      // 3️⃣ Atualizar valor atual
      if (currentValue) {
        await client.query(
          `UPDATE vehicles
           SET current_fipe_value = $1
           WHERE id = $2`,
          [currentValue, vehicle.id]
        );
      }

      await client.query("COMMIT");

      res.status(201).json(vehicle);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ message: "Error creating vehicle" });
    } finally {
      client.release();
    }
  }
);

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
        purchase_price,
        description,
        status,
        interior_color,
        doors,
        vehicle_type,
        financial_state,
        documentation,
        conservation,
        features,
      } = req.body

      const result = await pool.query(
        `UPDATE vehicles SET title = $1, brand = $2, model = $3, year = $4, color = $5, fuel_type = $6, transmission = $7, mileage = $8, price = $9, purchase_price = $10, description = $11, status = $12, interior_color = $13, doors = $14, vehicle_type = $15, financial_state = $16, documentation = $17, conservation = $18, features = $19, updated_at = CURRENT_TIMESTAMP
         WHERE id = $20 AND tenant_id = $21 RETURNING *`,
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
          purchase_price || null,
          description,
          status,
          interior_color,
          doors,
          vehicle_type,
          financial_state || "paid",
          documentation || [],
          conservation || [],
          features || [],
          req.params.id,
          req.user?.tenant_id,
        ],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      res.json(result.rows[0])
    } catch (err) {
      console.error("Error:", err)
      res.status(500).json({ message: "Error updating vehicle" })
    }
  },
)

export default router
