"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Users, Plus, Link2 } from "lucide-react"

interface VehicleParty {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string
  profile_type: "owner" | "buyer" | "both"
  status: "active" | "inactive"
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
}

const profileLabel: Record<VehicleParty["profile_type"], string> = {
  owner: "Proprietário",
  buyer: "Comprador",
  both: "Ambos",
}

export default function VehiclePartiesPage() {
  const [tab, setTab] = useState<"all" | "owner" | "buyer">("all")
  const [parties, setParties] = useState<VehicleParty[]>([])
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [selectedParty, setSelectedParty] = useState<VehicleParty | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    profile_type: "both",
    notes: "",
  })

  const [linkForm, setLinkForm] = useState({
    vehicle_id: "",
    relation_type: "owner",
    event_date: "",
    sale_price: "",
    notes: "",
  })

  useEffect(() => {
    fetchBaseData()
  }, [])

  useEffect(() => {
    fetchParties(tab)
  }, [tab])

  const fetchBaseData = async () => {
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

  const fetchParties = async (profile: "all" | "owner" | "buyer") => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties?profile=${profile}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Erro ao buscar cadastros")

      const data = await response.json()
      setParties(data)

      if (selectedParty) {
        const stillExists = data.find((item: VehicleParty) => item.id === selectedParty.id)
        setSelectedParty(stillExists || null)
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
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties/${party.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Erro ao buscar histórico")

      setHistory(await response.json())
    } catch (err) {
      setError("Não foi possível carregar o histórico do cadastro selecionado")
      console.error(err)
    }
  }

  const createParty = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: "Erro ao salvar" }))
        throw new Error(payload.message)
      }

      setForm({ name: "", email: "", phone: "", document: "", profile_type: "both", notes: "" })
      await fetchParties(tab)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar cadastro")
    } finally {
      setSaving(false)
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
      await fetchParties(tab)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Proprietários e Compradores</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Cadastro único com histórico de veículos vendidos e comprados
          </p>
        </div>
      </div>

      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

      <div className="card mb-6">
        <div className="flex gap-2 mb-4">
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

        <form onSubmit={createParty} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="Nome" className="search-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input placeholder="Telefone" className="search-input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <input placeholder="CPF/CNPJ" className="search-input" value={form.document} onChange={(e) => setForm((p) => ({ ...p, document: e.target.value }))} />
          <input placeholder="Email" className="search-input" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <select className="search-input" value={form.profile_type} onChange={(e) => setForm((p) => ({ ...p, profile_type: e.target.value }))}>
            <option value="both">Proprietário e Comprador</option>
            <option value="owner">Somente Proprietário</option>
            <option value="buyer">Somente Comprador</option>
          </select>
          <button className="btn-primary" type="submit" disabled={saving}>
            <Plus className="w-4 h-4" />
            Cadastrar
          </button>
          <textarea placeholder="Observações" className="search-input md:col-span-3" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
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
                  className="w-full text-left p-3 rounded border"
                  style={{ borderColor: selectedParty?.id === party.id ? "var(--accent-blue)" : "var(--border-color)" }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{party.name}</p>
                    <span className="badge badge-blue">{profileLabel[party.profile_type]}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{party.document || "Sem documento"}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Vendidos: {party.vehicles_sold || 0} • Comprados: {party.vehicles_bought || 0}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Histórico do Cadastro</h2>
          {!selectedParty ? (
            <p style={{ color: "var(--text-secondary)" }}>Selecione um cadastro para visualizar e vincular veículos.</p>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {selectedParty.name} • {profileLabel[selectedParty.profile_type]}
              </p>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Veículos vendidos</h3>
                  {soldHistory.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sem registros.</p>
                  ) : (
                    <ul className="space-y-2">
                      {soldHistory.map((item) => (
                        <li key={item.id} className="p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>
                          <p className="text-sm font-medium">{item.title || `${item.brand} ${item.model}`} ({item.year})</p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Placa: {item.plate || "-"} • {item.event_date}</p>
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
                        <li key={item.id} className="p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>
                          <p className="text-sm font-medium">{item.title || `${item.brand} ${item.model}`} ({item.year})</p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Placa: {item.plate || "-"} • {item.event_date}</p>
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
