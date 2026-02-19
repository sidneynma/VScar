"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Car, Plus, Search, Pencil, Archive, CheckCircle, XCircle, Eye } from "lucide-react"

interface Vehicle {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  status: string
  color?: string
  mileage?: number
  created_at?: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchVehicles()
  }, [router])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id)
    try {
      const token = localStorage.getItem("token")
      const vehicle = vehicles.find((v) => v.id === id)
      if (!vehicle) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...vehicle, status: newStatus }),
      })

      if (response.ok) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        )
      }
    } catch (err) {
      console.error("Error updating status:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const archiveVehicle = async (id: string) => {
    if (!confirm("Tem certeza que deseja arquivar este veiculo?")) return
    await updateStatus(id, "archived")
  }

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase())

    if (filter === "all") return matchesSearch
    return matchesSearch && v.status === filter
  })

  const statusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="badge badge-green">Disponivel</span>
      case "inactive":
        return <span className="badge badge-gray">Inativo</span>
      case "reserved":
        return <span className="badge badge-blue">Reservado</span>
      case "sold":
        return <span className="badge badge-blue">Vendido</span>
      case "archived":
        return <span className="badge badge-red">Arquivado</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  const formatPrice = (price: number) => {
    if (!price) return "Sob consulta"
    return `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Veiculos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {filteredVehicles.length} de {vehicles.length} veiculos
          </p>
        </div>
        <Link href="/dashboard/vehicles/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Veiculo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Buscar por marca, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ maxWidth: "100%" }}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Todos" },
            { value: "available", label: "Ativos" },
            { value: "inactive", label: "Inativos" },
            { value: "archived", label: "Arquivados" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? "btn-primary" : "btn-secondary"}
              style={{ fontSize: "0.8rem", padding: "0.375rem 0.75rem" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredVehicles.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Car className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum veiculo encontrado</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Veiculo</th>
                <th>Ano</th>
                <th>Preco</th>
                <th>KM</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "var(--bg-secondary)",
                        }}
                      >
                        <Car className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ fontSize: "0.875rem" }}>
                          {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {vehicle.brand} {vehicle.model}
                          {vehicle.color ? ` - ${vehicle.color}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{vehicle.year}</td>
                  <td style={{ fontWeight: 600, color: "var(--accent-blue)" }}>
                    {formatPrice(vehicle.price)}
                  </td>
                  <td>
                    {vehicle.mileage
                      ? `${vehicle.mileage.toLocaleString("pt-BR")} km`
                      : "-"}
                  </td>
                  <td>{statusBadge(vehicle.status)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {/* Ver Detalhes */}
                      <button
                        onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}/details`)}
                        title="Ver Detalhes"
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.375rem",
                          color: "var(--text-secondary)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--accent-purple)"
                          e.currentTarget.style.backgroundColor = "rgba(163, 113, 247, 0.1)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-secondary)"
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        disabled={actionLoading === vehicle.id}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                        title="Editar"
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.375rem",
                          color: "var(--text-secondary)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--accent-blue)"
                          e.currentTarget.style.backgroundColor = "rgba(47, 129, 247, 0.1)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-secondary)"
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        disabled={actionLoading === vehicle.id}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Ativar / Inativar */}
                      {vehicle.status === "available" ? (
                        <button
                          onClick={() => updateStatus(vehicle.id, "inactive")}
                          title="Inativar"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.375rem",
                            color: "var(--text-secondary)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--accent-yellow)"
                            e.currentTarget.style.backgroundColor = "rgba(210, 153, 34, 0.1)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-secondary)"
                            e.currentTarget.style.backgroundColor = "transparent"
                          }}
                          disabled={actionLoading === vehicle.id}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : vehicle.status !== "archived" ? (
                        <button
                          onClick={() => updateStatus(vehicle.id, "available")}
                          title="Ativar"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.375rem",
                            color: "var(--text-secondary)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--accent-green-light)"
                            e.currentTarget.style.backgroundColor = "rgba(35, 134, 54, 0.1)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-secondary)"
                            e.currentTarget.style.backgroundColor = "transparent"
                          }}
                          disabled={actionLoading === vehicle.id}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : null}

                      {/* Arquivar */}
                      {vehicle.status !== "archived" && (
                        <button
                          onClick={() => archiveVehicle(vehicle.id)}
                          title="Arquivar"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.375rem",
                            color: "var(--text-secondary)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--accent-red)"
                            e.currentTarget.style.backgroundColor = "rgba(218, 54, 51, 0.1)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-secondary)"
                            e.currentTarget.style.backgroundColor = "transparent"
                          }}
                          disabled={actionLoading === vehicle.id}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
