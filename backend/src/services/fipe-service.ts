import axios from "axios";
import qs from "qs";

const FIPE_BASE_URL = "https://veiculos.fipe.org.br/api/veiculos";

export class FipeService {
  async getMarcas(tipoVeiculo: number) {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarMarcas`,
      qs.stringify({
        codigoTabelaReferencia: 330,
        codigoTipoVeiculo: tipoVeiculo,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.map((item: any) => ({
      Codigo: item.Value,
      Nome: item.Label,
    }));
  }

  async getModelos(tipoVeiculo: number, codigoMarca: string) {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarModelos`,
      qs.stringify({
        codigoTipoVeiculo: tipoVeiculo,
        codigoTabelaReferencia: 330,
        codigoMarca,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return (response.data.Modelos || []).map((item: any) => ({
      Codigo: item.Value,
      Nome: item.Label,
    }));
  }

  async getAnos(
    tipoVeiculo: number,
    codigoMarca: string,
    codigoModelo: string
  ) {
    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarAnoModelo`,
      qs.stringify({
        codigoTipoVeiculo: tipoVeiculo,
        codigoTabelaReferencia: 330,
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

  async getValor(
    tipoVeiculo: number,
    codigoMarca: string,
    codigoModelo: string,
    anoCodigo: string
  ) {
    const [anoModelo, codigoTipoCombustivel] = anoCodigo.split("-");

    const response = await axios.post(
      `${FIPE_BASE_URL}/ConsultarValorComTodosParametros`,
      qs.stringify({
        codigoTabelaReferencia: 330,
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
