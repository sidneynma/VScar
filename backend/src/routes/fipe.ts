import { Router } from "express";
import { FipeService } from "../services/fipe-service";

const router = Router();
const service = new FipeService();

router.get("/marcas/:tipo", async (req, res) => {
  try {
    const data = await service.getMarcas(Number(req.params.tipo));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar marcas" });
  }
});

router.get("/modelos/:tipo/:marca", async (req, res) => {
  try {
    const data = await service.getModelos(
      Number(req.params.tipo),
      req.params.marca
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar modelos" });
  }
});

router.get("/anos/:tipo/:marca/:modelo", async (req, res) => {
  try {
    const data = await service.getAnos(
      Number(req.params.tipo),
      req.params.marca,
      req.params.modelo
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar anos" });
  }
});

router.get("/valor/:tipo/:marca/:modelo/:ano", async (req, res) => {
  try {
    const data = await service.getValor(
      Number(req.params.tipo),
      req.params.marca,
      req.params.modelo,
      req.params.ano
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar valor" });
  }
});

export default router;
