import express, { type Response } from "express"
import { pool } from "../index"
import { authMiddleware, type AuthRequest, requireRole } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"
import { FipeService } from "../services/fipe-service";
import { VEHICLE_STATUS, VEHICLE_TYPES } from "../constants/vehicle.constants";

const router = express.Router()
const fipeService = new FipeService();
const status = VEHICLE_STATUS.AVAILABLE;

const getVehiclePersistenceError = (err: any) => {
  if (err?.code === "23505") {
    if (err?.constraint === "idx_vehicles_tenant_plate_unique") {
      return {
        status: 409,
        message: "Placa já cadastrada para esta revenda.",
      };
    }

    return {
      status: 409,
      message: "Já existe um registro com os dados informados.",
    };
  }

  return null;
};

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
        plate,
        renavam,
        chassis,
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

      const hasMissingRequiredFields =
        !title ||
        !brand ||
        !model ||
        year === undefined ||
        year === null ||
        price === undefined ||
        price === null ||
        !plate;

      if (hasMissingRequiredFields) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const vehicleTypeMap: Record<string, string> = {
        Carro: VEHICLE_TYPES.CAR,
        Moto: VEHICLE_TYPES.MOTORCYCLE,
        Caminhão: VEHICLE_TYPES.TRUCK,
        Van: VEHICLE_TYPES.VAN,
        SUV: VEHICLE_TYPES.SUV,
      };

      const normalizedVehicleType =
        vehicleTypeMap[vehicle_type] || VEHICLE_TYPES.CAR;

      // 1️⃣ Criar veículo
      const result = await client.query(
        `INSERT INTO vehicles (
          id, tenant_id, revenda_id,
          title, brand, model, year,
          plate, renavam, chassis,
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
          $19,$20,$21,$22,$23,$24
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
          plate,
          renavam || null,
          chassis || null,
          color,
          fuel_type,
          transmission,
          mileage,
          price,
          purchase_price || null,
          description,
          interior_color,
          doors,
          normalizedVehicleType,
          financial_state || "paid",
          JSON.stringify(documentation || []),
          JSON.stringify(conservation || []),
          JSON.stringify(features || []),
        ]
      );

      const vehicle = result.rows[0];

      // 2️⃣ Buscar últimas 3 referências direto da FIPE
      // 2️⃣ Histórico FIPE automático
      let currentValue: number | null = null;

      if (marca_codigo && modelo_codigo && ano_codigo && tipoVeiculo) {
        console.log("ENTROU NO BLOCO FIPE");
        try {
          const referenciasFipe = await fipeService.getUltimas3Referencias();
          console.log("REFERENCIAS FIPE:", referenciasFipe);

          for (let i = 0; i < referenciasFipe.length; i++) {
            console.log("PROCESSANDO REFERENCIA:", referenciasFipe[i]);
            const refFipe = referenciasFipe[i];

            // Upsert da referência
            console.log("SALVANDO HISTORICO");
            const insertRef = await client.query(
              `
        INSERT INTO fipe_reference (codigo_tabela, mes_referencia, ano, mes)
        VALUES ($1,$2,$3,$4)
        ON CONFLICT (codigo_tabela)
        DO UPDATE SET mes_referencia = EXCLUDED.mes_referencia
        RETURNING *
        `,
              [
                refFipe.Codigo,
                refFipe.Mes,
                new Date().getFullYear(),
                new Date().getMonth() + 1,
              ]
            );

            const ref = insertRef.rows[0];

            // 🔥 Consulta valor FIPE
            const consulta = await fipeService.getValorComReferencia(
              ref.codigo_tabela,
              Number(tipoVeiculo),
              marca_codigo,
              modelo_codigo,
              ano_codigo
            );

            if (!consulta || !consulta.Valor) continue;

            const valorNumerico = parseFloat(
              consulta.Valor.replace("R$ ", "")
                .replace(/\./g, "")
                .replace(",", ".")
            );

            await client.query(
              `
        INSERT INTO fipe_consult_history (
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
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        `,
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
                JSON.stringify(consulta),
              ]
            );

            if (i === 0) {
              currentValue = valorNumerico;
            }
          }
        } catch (fipeError) {
          console.error("Erro ao gerar histórico FIPE:", fipeError);
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

      const persistenceError = getVehiclePersistenceError(err);
      if (persistenceError) {
        return res
          .status(persistenceError.status)
          .json({ message: persistenceError.message });
      }

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
        plate,
        renavam,
        chassis,
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
      const vehicleTypeMap: Record<string, string> = {
        Carro: VEHICLE_TYPES.CAR,
        Moto: VEHICLE_TYPES.MOTORCYCLE,
        Caminhão: VEHICLE_TYPES.TRUCK,
        Van: VEHICLE_TYPES.VAN,
        SUV: VEHICLE_TYPES.SUV,
      };

      const normalizedVehicleType =
        vehicleTypeMap[vehicle_type] || vehicle_type;

      const result = await pool.query(
        `UPDATE vehicles SET title = $1, brand = $2, model = $3, year = $4, plate = $5, renavam = $6, chassis = $7, color = $8, fuel_type = $9, transmission = $10, mileage = $11, price = $12, purchase_price = $13, description = $14, status = $15, interior_color = $16, doors = $17, vehicle_type = $18, financial_state = $19, documentation = $20, conservation = $21, features = $22, updated_at = CURRENT_TIMESTAMP
         WHERE id = $23 AND tenant_id = $24 RETURNING *`,
        [
          title,
          brand,
          model,
          year,
          plate,
          renavam || null,
          chassis || null,
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
          normalizedVehicleType,
          financial_state || "paid",
          JSON.stringify(documentation || []),
          JSON.stringify(conservation || []),
          JSON.stringify(features || []),
          req.params.id,
          req.user?.tenant_id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Vehicle not found" })
      }

      res.json(result.rows[0])
    } catch (err) {
      console.error("Error:", err)

      const persistenceError = getVehiclePersistenceError(err);
      if (persistenceError) {
        return res
          .status(persistenceError.status)
          .json({ message: persistenceError.message });
      }

      res.status(500).json({ message: "Error updating vehicle" })
    }
  },
)

export default router
