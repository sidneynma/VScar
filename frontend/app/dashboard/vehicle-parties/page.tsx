"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Link2, Search, Users } from "lucide-react"

interface VehicleParty {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string
  profile_type: "owner" | "buyer" | "both"
  person_type: "individual" | "company"
  postal_code?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  status: "active" | "inactive"
  notes?: string
  vehicles_sold: number
  vehicles_bought: number
}

interface VehicleOption {
  id: string
  title: string
  brand: string
  model: string
  year: number
  plate?: string
}

interface HistoryItem {
  id: string
  relation_type: "owner" | "buyer"
  event_date: string
  sale_price?: number
  notes?: string
  title?: string
  brand?: string
  model?: string
  year?: number
  plate?: string
  vehicle_status?: string
}

const profileLabel: Record<VehicleParty["profile_type"], string> = {
  owner: "Proprietário",
  buyer: "Comprador",
  both: "Ambos",
}

const relationLabel: Record<HistoryItem["relation_type"], string> = {
  owner: "Vendido pelo proprietário",
  buyer: "Comprado pelo comprador",
}

const formatDateBR = (value?: string) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("pt-BR")
}

const formatCurrencyBRL = (value?: number) => {
  if (value === undefined || value === null) return "Não informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

const fullAddress = (party: VehicleParty | null) => {
  if (!party) return "-"
  const parts = [
    party.street,
    party.number,
    party.complement,
    party.neighborhood,
    party.city,
    party.state,
    party.postal_code,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(" • ") : "Endereço não informado"
}

export default function VehiclePartiesPage() {
  const [tab, setTab] = useState<"all" | "owner" | "buyer">("all")
  const [search, setSearch] = useState("")
  const [parties, setParties] = useState<VehicleParty[]>([])
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [selectedParty, setSelectedParty] = useState<VehicleParty | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [linkForm, setLinkForm] = useState({
    vehicle_id: "",
    relation_type: "owner",
    event_date: "",
    sale_price: "",
    notes: "",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    fetchParties(tab, search)
  }, [tab, search])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setVehicles(await response.json())
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchParties = async (profile: "all" | "owner" | "buyer", term: string) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const query = new URLSearchParams({ profile, search: term }).toString()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Erro ao buscar cadastros")

      const data: VehicleParty[] = await response.json()
      setParties(data)

      if (selectedParty) {
        const updatedSelection = data.find((item) => item.id === selectedParty.id) || null
        setSelectedParty(updatedSelection)
      }
    } catch (err) {
      setError("Não foi possível carregar os cadastros")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (party: VehicleParty) => {
    setSelectedParty(party)
    setSelectedHistory(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties/${party.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Erro ao buscar histórico")

      const data: HistoryItem[] = await response.json()
      setHistory(data)
    } catch (err) {
      setError("Não foi possível carregar o histórico do cadastro selecionado")
      console.error(err)
    }
  }

  const addVehicleLink = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedParty) return

    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const payload = {
        ...linkForm,
        sale_price: linkForm.sale_price ? Number(linkForm.sale_price) : undefined,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties/${selectedParty.id}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Erro ao vincular veículo" }))
        throw new Error(body.message)
      }

      setLinkForm({ vehicle_id: "", relation_type: "owner", event_date: "", sale_price: "", notes: "" })
      await fetchHistory(selectedParty)
      await fetchParties(tab, search)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular veículo")
    } finally {
      setSaving(false)
    }
  }

  const soldHistory = useMemo(() => history.filter((item) => item.relation_type === "owner"), [history])
  const boughtHistory = useMemo(() => history.filter((item) => item.relation_type === "buyer"), [history])

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Proprietários e Compradores</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Lista de cadastros com histórico de vendas e compras por veículo
          </p>
        </div>
        <Link href="/dashboard/vehicle-parties/new" className="btn-primary">
          Novo cadastro
        </Link>
      </div>

      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex gap-2">
            {[
              { value: "all", label: "Todos" },
              { value: "owner", label: "Proprietários" },
              { value: "buyer", label: "Compradores" },
            ].map((item) => (
              <button
                key={item.value}
                className={tab === item.value ? "btn-primary" : "btn-secondary"}
                onClick={() => setTab(item.value as "all" | "owner" | "buyer")}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              className="search-input"
              style={{ maxWidth: "100%", paddingLeft: "2rem" }}
              placeholder="Buscar por nome, documento, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Cadastros</h2>

          {loading ? (
            <div className="spinner" />
          ) : parties.length === 0 ? (
            <div className="empty-state">
              <Users className="w-8 h-8 mx-auto" style={{ color: "var(--text-muted)" }} />
              <p>Nenhum cadastro encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {parties.map((party) => (
                <button
                  key={party.id}
                  type="button"
                  onClick={() => fetchHistory(party)}
                  className="w-full text-left p-3 rounded border transition-all"
                  style={{
                    borderColor: selectedParty?.id === party.id ? "var(--accent-blue)" : "var(--border-color)",
                    backgroundColor: selectedParty?.id === party.id ? "rgba(47,129,247,0.08)" : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{party.name}</p>
                    <span className="badge badge-blue">{profileLabel[party.profile_type]}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {party.document || "Sem documento"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Vendidos: {party.vehicles_sold || 0} • Comprados: {party.vehicles_bought || 0}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card lg:col-span-3">
          <h2 className="text-lg font-semibold mb-3">Detalhes e Histórico</h2>

          {!selectedParty ? (
            <p style={{ color: "var(--text-secondary)" }}>Selecione um cadastro na lista para abrir os detalhes.</p>
          ) : (
            <>
              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{selectedParty.name}</p>
                  <span className="badge badge-green">{profileLabel[selectedParty.profile_type]}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Documento: {selectedParty.document || "Não informado"} • {selectedParty.email || "Sem email"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Telefone: {selectedParty.phone || "Não informado"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Endereço: {fullAddress(selectedParty)}
                </p>
              </div>

              <form onSubmit={addVehicleLink} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <select className="search-input" value={linkForm.vehicle_id} onChange={(e) => setLinkForm((p) => ({ ...p, vehicle_id: e.target.value }))} required>
                  <option value="">Selecione o veículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.title || `${vehicle.brand} ${vehicle.model}`} - {vehicle.plate || "sem placa"}
                    </option>
                  ))}
                </select>
                <select className="search-input" value={linkForm.relation_type} onChange={(e) => setLinkForm((p) => ({ ...p, relation_type: e.target.value }))}>
                  <option value="owner">Veículo vendido pelo proprietário</option>
                  <option value="buyer">Veículo comprado pelo comprador</option>
                </select>
                <input type="date" className="search-input" value={linkForm.event_date} onChange={(e) => setLinkForm((p) => ({ ...p, event_date: e.target.value }))} />
                <input type="number" className="search-input" placeholder="Valor da venda (R$)" value={linkForm.sale_price} onChange={(e) => setLinkForm((p) => ({ ...p, sale_price: e.target.value }))} />
                <textarea className="search-input md:col-span-2" placeholder="Observações" rows={2} value={linkForm.notes} onChange={(e) => setLinkForm((p) => ({ ...p, notes: e.target.value }))} />
                <button type="submit" className="btn-primary md:col-span-2" disabled={saving}>
                  <Link2 className="w-4 h-4" />
                  Vincular veículo ao histórico
                </button>
              </form>

              {selectedHistory && (
                <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: "rgba(47,129,247,0.12)" }}>
                  <p className="font-semibold mb-1">Detalhes da transação</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Tipo: {relationLabel[selectedHistory.relation_type]} • Data: {formatDateBR(selectedHistory.event_date)}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Valor: {formatCurrencyBRL(selectedHistory.sale_price)}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Veículo: {selectedHistory.title || `${selectedHistory.brand} ${selectedHistory.model}`} ({selectedHistory.year})
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Status do veículo: {selectedHistory.vehicle_status || "-"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Observações: {selectedHistory.notes || "Sem observações"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Veículos vendidos</h3>
                  {soldHistory.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sem registros.</p>
                  ) : (
                    <ul className="space-y-2">
                      {soldHistory.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedHistory(item)}
                            className="w-full text-left p-2 rounded"
                            style={{ backgroundColor: "var(--bg-secondary)" }}
                          >
                            <p className="text-sm font-medium">{item.title || `${item.brand} ${item.model}`} ({item.year})</p>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Placa: {item.plate || "-"} • Data: {formatDateBR(item.event_date)}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Veículos comprados</h3>
                  {boughtHistory.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sem registros.</p>
                  ) : (
                    <ul className="space-y-2">
                      {boughtHistory.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedHistory(item)}
                            className="w-full text-left p-2 rounded"
                            style={{ backgroundColor: "var(--bg-secondary)" }}
                          >
                            <p className="text-sm font-medium">{item.title || `${item.brand} ${item.model}`} ({item.year})</p>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Placa: {item.plate || "-"} • Data: {formatDateBR(item.event_date)}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
