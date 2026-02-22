import { Pool } from "pg";
import { FipeService } from "./fipe-service";

const pool = new Pool();
const fipeService = new FipeService();


export async function createVehicleWithFipeHistory(vehicleData: any) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Inserir veículo
    const vehicleResult = await client.query(
      `
      INSERT INTO vehicles (
        title, brand, model, year, color,
        fuel_type, transmission, mileage,
        price, purchase_price,
        fipe_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        vehicleData.title,
        vehicleData.brand,
        vehicleData.model,
        vehicleData.year,
        vehicleData.color,
        vehicleData.fuel_type,
        vehicleData.transmission,
        vehicleData.mileage,
        vehicleData.price,
        vehicleData.purchase_price,
        vehicleData.fipe_code,
      ]
    );

    const vehicle = vehicleResult.rows[0];

    // 2️⃣ Buscar 3 referências mais recentes
    const refResult = await client.query(
      `
      SELECT * FROM fipe_reference
      ORDER BY codigo_tabela DESC
      LIMIT 3
      `
    );

    const references = refResult.rows;

    let currentValue = null;

    // 3️⃣ Para cada referência consultar FIPE e salvar histórico
    for (let i = 0; i < references.length; i++) {
      const ref = references[i];

      const consulta = await fipeService.getValorComReferencia(
        ref.codigo_tabela,
        vehicleData.tipoVeiculo,
        vehicleData.marca_codigo,
        vehicleData.modelo_codigo,
        vehicleData.ano_codigo
      );

      const valorNumerico = parseFloat(
        consulta.Valor.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
      );

      // Salvar histórico
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
          consulta,
        ]
      );

      if (i === 0) {
        currentValue = valorNumerico;
      }
    }

    // 4️⃣ Atualizar valor atual no veículo
    if (currentValue) {
      await client.query(
        `
        UPDATE vehicles
        SET current_fipe_value = $1
        WHERE id = $2
        `,
        [currentValue, vehicle.id]
      );
    }

    await client.query("COMMIT");

    return vehicle;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
