"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Check } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

// ==============================
// CONSTANTES
// ==============================

const vehicleTypes = [
  { id: 1, name: "Carro" },
  { id: 2, name: "Moto" },
  { id: 3, name: "Caminhão" },
];

const colors = [
  "Branco",
  "Preto",
  "Prata",
  "Vermelho",
  "Azul",
  "Cinza",
  "Verde",
  "Amarelo",
  "Laranja",
  "Bege",
  "Marrom",
];

const transmissions = ["Manual", "Automática", "CVT"];
const doors = ["2", "3", "4", "5"];

const financialStateOptions = [
  { id: "paid", label: "Veículo quitado" },
  { id: "financed", label: "Veículo em financiamento" },
];

const documentationOptions = [
  { id: "ipva_paid", label: "IPVA pago" },
  { id: "with_fines", label: "Com multas" },
  { id: "auction_vehicle", label: "Veículo de leilão" },
];

const conservationOptions = [
  { id: "single_owner", label: "Único dono" },
  { id: "spare_key", label: "Com chave reserva" },
  { id: "with_manual", label: "Com manual" },
  { id: "factory_warranty", label: "Com garantia de fábrica" },
  { id: "dealer_service", label: "Revisões feitas em concessionária" },
];

const featuresOptions = {
  security: [
    { id: "airbag", label: "Airbag" },
    { id: "alarm", label: "Alarme" },
    { id: "rear_camera", label: "Câmera de ré" },
    { id: "rear_sensor", label: "Sensor de ré" },
    { id: "blind_spot", label: "Blindado" },
  ],
  comfort: [
    { id: "ac", label: "Ar Condicionado" },
    { id: "sunroof", label: "Teto Solar" },
    { id: "leather_seats", label: "Bancos de Couro" },
    { id: "power_steering", label: "Trava elétrica" },
    { id: "power_windows", label: "Vidro elétrico" },
  ],
  technology: [
    { id: "usb", label: "Conexão USB" },
    { id: "multifunction_wheel", label: "Volante multifuncional" },
    { id: "bluetooth", label: "Interface Bluetooth" },
    { id: "sound_system", label: "Som" },
    { id: "onboard_computer", label: "Computador de bordo" },
    { id: "gps", label: "Navegador GPS" },
  ],
  performance: [
    { id: "cruise_control", label: "Controle automático de velocidade" },
    { id: "traction_control", label: "Tração 4x4" },
    { id: "alloy_wheels", label: "Rodas de liga leve" },
    { id: "gnv_kit", label: "Com Kit GNV" },
  ],
};

// ==============================
// TIPOS
// ==============================

interface FipeResult {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  Autenticacao: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
  DataConsulta: string;
}

interface VehicleFormData {
  title: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  renavam: string;
  chassis: string;
  color: string;
  fuel_type: string;
  transmission: string;
  mileage: number;
  price: number;
  purchase_price: number;
  fipe_value: number;
  doors: string;
  vehicle_type: string;
  description: string;
  interior_color: string;
  financial_state: string;
  documentation: string[];
  conservation: string[];
  features: string[];

  // FIPE extras
  fipe_code: string;
  fipe_reference_month: string;
  fipe_auth: string;
  fipe_vehicle_type: string;
  fipe_fuel_sigla: string;
  fipe_consult_date: string;
}

// ==============================
// COMPONENTE
// ==============================

export default function NewVehiclePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consultLoading, setConsultLoading] = useState(false);
  const [fipeError, setFipeError] = useState(false);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  const [fipeResult, setFipeResult] = useState<FipeResult | null>(null);

  const [fipeConsult, setFipeConsult] = useState({
    tipoVeiculo: 1,
    marca: "",
    modelo: "",
    ano: "",
  });

  const [formData, setFormData] = useState<VehicleFormData>({
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    plate: "",
    renavam: "",
    chassis: "",
    color: "",
    fuel_type: "",
    transmission: "Manual",
    mileage: 0,
    price: 0,
    purchase_price: 0,
    fipe_value: 0,
    doors: "4",
    vehicle_type: "Carro",
    description: "",
    interior_color: "",
    financial_state: "paid",
    documentation: [],
    conservation: [],
    features: [],
    fipe_code: "",
    fipe_reference_month: "",
    fipe_auth: "",
    fipe_vehicle_type: "",
    fipe_fuel_sigla: "",
    fipe_consult_date: "",
  });

  // ==============================
  // FIPE LOADERS (NOVA API)
  // ==============================

  const loadMarcas = async (tipo: number) => {
    try {
      setConsultLoading(true);

      const res = await fetch(`${API}/api/fipe/marcas/${tipo}`);

     if (!res.ok) {
       setFipeError(true);
       setMarcas([]);
       return; // 🔥 não precisa lançar erro
     }

      const data = await res.json();

      setMarcas(Array.isArray(data) ? data : []);
      setModelos([]);
      setAnos([]);
    } catch (err) {
      console.error("Erro ao carregar marcas", err);
      setFipeError(true);
      setMarcas([]); // 🔥 nunca deixa undefined
    } finally {
      setConsultLoading(false);
    }
  };

  const loadModelos = async () => {
    if (!fipeConsult.marca) return;
    setConsultLoading(true);
    try {
      const res = await fetch(
        `${API}/api/fipe/modelos/${fipeConsult.tipoVeiculo}/${fipeConsult.marca}`
      );
      setModelos(await res.json());
      setAnos([]);
    } catch (err) {
      console.error("Erro ao carregar modelos", err);
    } finally {
      setConsultLoading(false);
    }
  };

  const loadAnos = async () => {
    if (!fipeConsult.modelo) return;
    setConsultLoading(true);
    try {
      const res = await fetch(
        `${API}/api/fipe/anos/${fipeConsult.tipoVeiculo}/${fipeConsult.marca}/${fipeConsult.modelo}`
      );
      setAnos(await res.json());
    } catch (err) {
      console.error("Erro ao carregar anos", err);
    } finally {
      setConsultLoading(false);
    }
  };

  const loadValor = async () => {
    if (!fipeConsult.ano) return;

    setConsultLoading(true);
    try {
      const res = await fetch(
        `${API}/api/fipe/valor/${fipeConsult.tipoVeiculo}/${fipeConsult.marca}/${fipeConsult.modelo}/${fipeConsult.ano}`
      );

      const data: FipeResult = await res.json();
      setFipeResult(data);

      setFormData((prev) => ({
        ...prev,
        brand: data.Marca,
        model: data.Modelo,
        year: data.AnoModelo,
        fuel_type: data.Combustivel,
        title: `${data.Marca} ${data.Modelo} ${data.AnoModelo}`,
        fipe_value: parseFloat(
          data.Valor.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
        ),
        fipe_code: data.CodigoFipe,
        fipe_reference_month: data.MesReferencia,
        fipe_auth: data.Autenticacao,
        fipe_vehicle_type: String(data.TipoVeiculo),
        fipe_fuel_sigla: data.SiglaCombustivel,
        fipe_consult_date: data.DataConsulta,
      }));
    } catch (err) {
      console.error("Erro ao carregar valor FIPE", err);
    } finally {
      setConsultLoading(false);
    }
  };

  useEffect(() => {
    loadMarcas(fipeConsult.tipoVeiculo);
  }, [fipeConsult.tipoVeiculo]);

  useEffect(() => {
    if (fipeConsult.marca) loadModelos();
  }, [fipeConsult.marca]);

  useEffect(() => {
    if (fipeConsult.modelo) loadAnos();
  }, [fipeConsult.modelo]);

  useEffect(() => {
    if (fipeConsult.ano) loadValor();
  }, [fipeConsult.ano]);

  // ==============================
  // HANDLERS
  // ==============================

  const handleFipeChange = (e: any) => {
    const { name, value } = e.target;
    setFipeConsult((prev) => ({
      ...prev,
      [name]: name === "tipoVeiculo" ? Number(value) : value,
    }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["year", "mileage", "price", "purchase_price", "fipe_value"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleToggleOption = (
    field: "documentation" | "conservation" | "features",
    optionId: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(optionId)
        ? prev[field].filter((id) => id !== optionId)
        : [...prev[field], optionId],
    }));
  };

  const handleFinancialState = (state: string) => {
    setFormData((prev) => ({ ...prev, financial_state: state }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,

        // 🔥 CÓDIGOS FIPE NECESSÁRIOS PARA HISTÓRICO
        marca_codigo: fipeConsult.marca,
        modelo_codigo: fipeConsult.modelo,
        ano_codigo: fipeConsult.ano,
        tipoVeiculo: fipeConsult.tipoVeiculo,
      };

      const res = await fetch(`${API}/api/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar veículo");
      }

      router.push("/dashboard/vehicles");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="page-container">
    <div className="page-header">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-700 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1>Novo Veículo</h1>
      </div>
    </div>

    <div className="max-w-4xl mx-auto">
      {/* ===================== FIPE ===================== */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Consultar Dados da FIPE</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Tipo de Veículo</label>
            <select
              name="tipoVeiculo"
              value={fipeConsult.tipoVeiculo}
              onChange={handleFipeChange}
              className="form-input"
            >
              {vehicleTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            {fipeError && !consultLoading && (
              <div className="text-red-500 text-sm">
                Serviço FIPE temporariamente indisponível
              </div>
            )}
            <label className="form-label">Marca</label>
            <select
              name="marca"
              value={fipeConsult.marca}
              onChange={handleFipeChange}
              className="form-input"
              disabled={consultLoading}
            >
              <option value="">Selecione uma marca</option>
              {marcas?.map((m) => (
                <option key={m.Codigo} value={m.Codigo}>
                  {m.Nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Modelo</label>
            <select
              name="modelo"
              value={fipeConsult.modelo}
              onChange={handleFipeChange}
              className="form-input"
              disabled={consultLoading}
            >
              <option value="">Selecione um modelo</option>
              {modelos.map((m) => (
                <option key={m.Codigo} value={m.Codigo}>
                  {m.Nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Ano</label>
            <select
              name="ano"
              value={fipeConsult.ano}
              onChange={handleFipeChange}
              className="form-input"
              disabled={consultLoading}
            >
              <option value="">Selecione um ano</option>
              {anos.map((a) => (
                <option key={a.Codigo} value={a.Codigo}>
                  {a.Nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fipeResult && (
          <div className="mt-4 p-4 rounded bg-green-900/40 border border-green-700 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="font-semibold">
              Valor FIPE: {fipeResult.Valor}
            </span>
          </div>
        )}
      </div>

      {/* ===================== FORM ===================== */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="card mb-4 border border-red-600 text-red-400">
            {error}
          </div>
        )}

        {/* ================= Informações Básicas ================= */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tipo de Veículo</label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                className="form-input"
              >
                {vehicleTypes.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Título</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Marca</label>
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Modelo</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Ano</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Placa</label>
              <input
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                className="form-input"
                placeholder="ABC1D23"
                required
              />
            </div>

            <div>
              <label className="form-label">Renavam</label>
              <input
                name="renavam"
                value={formData.renavam}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Número do Chassi</label>
              <input
                name="chassis"
                value={formData.chassis}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Quilometragem</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Cor</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Selecione uma cor</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Cor Interior</label>
              <input
                name="interior_color"
                value={formData.interior_color}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Portas</label>
              <select
                name="doors"
                value={formData.doors}
                onChange={handleChange}
                className="form-input"
              >
                {doors.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Combustível</label>
              <input
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Câmbio</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="form-input"
              >
                {transmissions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================= Valores ================= */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Valor FIPE (R$)</label>
              <input
                type="number"
                name="fipe_value"
                value={formData.fipe_value}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                className="form-input"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Data da Consulta FIPE</label>
              <input
                name="fipe_consult_date"
                value={formData.fipe_consult_date}
                onChange={handleChange}
                className="form-input"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Preço de Venda (R$)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Valor de Compra (R$)</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Estado Financeiro */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado Financeiro</h2>
          <div className="flex gap-3 flex-wrap">
            {financialStateOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleFinancialState(option.id)}
                className="option-pill"
                style={{
                  backgroundColor:
                    formData.financial_state === option.id
                      ? "var(--accent-blue)"
                      : "transparent",
                  color:
                    formData.financial_state === option.id
                      ? "white"
                      : "var(--text-secondary)",
                  border: `2px solid ${
                    formData.financial_state === option.id
                      ? "var(--accent-blue)"
                      : "var(--border-color)"
                  }`,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documentação */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Documentação e Regularização
          </h2>
          <div className="flex gap-3 flex-wrap">
            {documentationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption("documentation", option.id)}
                className="option-pill"
                style={{
                  backgroundColor: formData.documentation.includes(option.id)
                    ? "var(--accent-blue)"
                    : "transparent",
                  color: formData.documentation.includes(option.id)
                    ? "white"
                    : "var(--text-secondary)",
                  border: `2px solid ${
                    formData.documentation.includes(option.id)
                      ? "var(--accent-blue)"
                      : "var(--border-color)"
                  }`,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conservação */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Conservação e Garantia</h2>
          <div className="flex gap-3 flex-wrap">
            {conservationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption("conservation", option.id)}
                className="option-pill"
                style={{
                  backgroundColor: formData.conservation.includes(option.id)
                    ? "var(--accent-blue)"
                    : "transparent",
                  color: formData.conservation.includes(option.id)
                    ? "white"
                    : "var(--text-secondary)",
                  border: `2px solid ${
                    formData.conservation.includes(option.id)
                      ? "var(--accent-blue)"
                      : "var(--border-color)"
                  }`,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Itens de Série */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Itens de Série</h2>

          <div className="mb-6">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Segurança e Proteção
            </h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.security.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption("features", option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id)
                      ? "var(--accent-blue)"
                      : "transparent",
                    color: formData.features.includes(option.id)
                      ? "white"
                      : "var(--text-secondary)",
                    border: `2px solid ${
                      formData.features.includes(option.id)
                        ? "var(--accent-blue)"
                        : "var(--border-color)"
                    }`,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Conforto e Conveniência
            </h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.comfort.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption("features", option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id)
                      ? "var(--accent-blue)"
                      : "transparent",
                    color: formData.features.includes(option.id)
                      ? "white"
                      : "var(--text-secondary)",
                    border: `2px solid ${
                      formData.features.includes(option.id)
                        ? "var(--accent-blue)"
                        : "var(--border-color)"
                    }`,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Tecnologia e Conectividade
            </h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.technology.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption("features", option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id)
                      ? "var(--accent-blue)"
                      : "transparent",
                    color: formData.features.includes(option.id)
                      ? "white"
                      : "var(--text-secondary)",
                    border: `2px solid ${
                      formData.features.includes(option.id)
                        ? "var(--accent-blue)"
                        : "var(--border-color)"
                    }`,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Desempenho e Outros
            </h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.performance.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption("features", option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id)
                      ? "var(--accent-blue)"
                      : "transparent",
                    color: formData.features.includes(option.id)
                      ? "white"
                      : "var(--text-secondary)",
                    border: `2px solid ${
                      formData.features.includes(option.id)
                        ? "var(--accent-blue)"
                        : "var(--border-color)"
                    }`,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= Descrição ================= */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Descrição</h2>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="form-input"
          />
        </div>
        <div className="flex gap-3 justify-end mb-6">
          <Link href="/dashboard/vehicles" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Criando..." : "Criar Veículo"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
