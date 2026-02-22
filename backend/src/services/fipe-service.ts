import axios from "axios";
import qs from "qs";

interface FipeReferencia {
  Codigo: number;
  Mes: string;
}

const FIPE_BASE_URL =
  process.env.FIPE_BASE_URL || "https://veiculos.fipe.org.br/api/veiculos";
export class FipeService {
  // =====================================================
  // 🔹 LISTAR TABELAS DE REFERÊNCIA (330, 329, 328...)
  // =====================================================
  async getTabelas(): Promise<FipeReferencia[]> {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarTabelaDeReferencia`,
      {},
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.map(
      (item: any): FipeReferencia => ({
        Codigo: Number(item.Codigo),
        Mes: item.Mes,
      })
    );
  }

  // =====================================================
  // 🔹 PEGAR AS 3 ÚLTIMAS REFERÊNCIAS AUTOMATICAMENTE
  // =====================================================
  async getUltimas3Referencias() {
    const tabelas = await this.getTabelas();

    return tabelas.sort((a, b) => b.Codigo - a.Codigo).slice(0, 3);
  }

  // =====================================================
  // 🔹 BUSCAR MARCAS (REFERÊNCIA DINÂMICA)
  // =====================================================
  async getMarcas(tipoVeiculo: number, codigoTabelaReferencia: number) {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarMarcas`,
      qs.stringify({
        codigoTabelaReferencia,
        codigoTipoVeiculo: tipoVeiculo,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.map((item: any) => ({
      Codigo: item.Value,
      Nome: item.Label,
    }));
  }

  // =====================================================
  // 🔹 BUSCAR MODELOS
  // =====================================================
  async getModelos(
    tipoVeiculo: number,
    codigoMarca: string,
    codigoTabelaReferencia: number
  ) {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarModelos`,
      qs.stringify({
        codigoTipoVeiculo: tipoVeiculo,
        codigoTabelaReferencia,
        codigoMarca,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return (response.data.Modelos || []).map((item: any) => ({
      Codigo: item.Value,
      Nome: item.Label,
    }));
  }

  // =====================================================
  // 🔹 BUSCAR ANOS
  // =====================================================
  async getAnos(
    tipoVeiculo: number,
    codigoMarca: string,
    codigoModelo: string,
    codigoTabelaReferencia: number
  ) {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarAnoModelo`,
      qs.stringify({
        codigoTipoVeiculo: tipoVeiculo,
        codigoTabelaReferencia,
        codigoMarca,
        codigoModelo,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.map((item: any) => ({
      Codigo: item.Value,
      Nome: item.Label,
    }));
  }

  // =====================================================
  // 🔹 CONSULTAR VALOR COM REFERÊNCIA ESPECÍFICA
  // =====================================================
  async getValorComReferencia(
    codigoTabelaReferencia: number,
    tipoVeiculo: number,
    codigoMarca: string,
    codigoModelo: string,
    anoCodigo: string
  ) {
    const [anoModelo, codigoTipoCombustivel] = anoCodigo.split("-");

    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarValorComTodosParametros`,
      qs.stringify({
        codigoTabelaReferencia,
        codigoMarca,
        codigoModelo,
        codigoTipoVeiculo: tipoVeiculo,
        anoModelo,
        codigoTipoCombustivel,
        tipoConsulta: "tradicional",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data;
  }
}