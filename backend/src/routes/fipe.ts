import { Router } from "express";
import { pool } from "../index"; // 🔥 usar pool global
import { FipeService } from "../services/fipe-service";

const router = Router();
const fipeService = new FipeService();

/**
 * Função auxiliar segura para pegar referência.
 * Se banco falhar → usa 330.
 */
async function getReferenciaAtual(): Promise<number> {
  try {
    const result = await pool.query(`
      SELECT codigo_tabela
      FROM fipe_reference
      ORDER BY codigo_tabela DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return 330; // fallback
    }

    return result.rows[0].codigo_tabela;
  } catch (err) {
    console.error("Erro ao buscar referência no banco:", err);
    return 330; // fallback seguro
  }
}

/* ================= MARCAS ================= */

router.get("/marcas/:tipo", async (req, res) => {
  try {
    const { tipo } = req.params;
    const referencia = await getReferenciaAtual();

    const marcas = await fipeService.getMarcas(Number(tipo), referencia);

    res.json(marcas);
  } catch (error) {
    console.error("Erro marcas:", error);
    res.status(500).json({ message: "Erro ao buscar marcas" });
  }
});

/* ================= MODELOS ================= */

router.get("/modelos/:tipo/:marca", async (req, res) => {
  try {
    const { tipo, marca } = req.params;
    const referencia = await getReferenciaAtual();

    const modelos = await fipeService.getModelos(
      Number(tipo),
      marca,
      referencia
    );

    res.json(modelos);
  } catch (error) {
    console.error("Erro modelos:", error);
    res.status(500).json({ message: "Erro ao buscar modelos" });
  }
});

/* ================= ANOS ================= */

router.get("/anos/:tipo/:marca/:modelo", async (req, res) => {
  try {
    const { tipo, marca, modelo } = req.params;
    const referencia = await getReferenciaAtual();

    const anos = await fipeService.getAnos(
      Number(tipo),
      marca,
      modelo,
      referencia
    );

    res.json(anos);
  } catch (error) {
    console.error("Erro anos:", error);
    res.status(500).json({ message: "Erro ao buscar anos" });
  }
});

/* ================= VALOR ================= */

router.get("/valor/:tipo/:marca/:modelo/:ano", async (req, res) => {
  try {
    const { tipo, marca, modelo, ano } = req.params;
    const referencia = await getReferenciaAtual();

    const valor = await fipeService.getValorComReferencia(
      referencia,
      Number(tipo),
      marca,
      modelo,
      ano
    );

    res.json(valor);
  } catch (error) {
    console.error("Erro valor:", error);
    res.status(500).json({ message: "Erro ao buscar valor" });
  }
});

export default router;
