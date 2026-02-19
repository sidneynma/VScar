"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Car, Megaphone, BarChart3, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState({ vehicles: 0, available: 0, reserved: 0, sold: 0 })
  const [recentVehicles, setRecentVehicles] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          // Handle both array and object responses
          const vehicles = Array.isArray(data) ? data : Object.values(data)
          setRecentVehicles(vehicles.slice(0, 5))
          setStats({
            vehicles: vehicles.length,
            available: vehicles.filter((v: any) => v.status === "available").length,
            reserved: vehicles.filter((v: any) => v.status === "reserved").length,
            sold: vehicles.filter((v: any) => v.status === "sold").length,
          })
        }
      } catch (err) {
        console.error("Error fetching stats:", err)
      }
    }
    fetchStats()
  }, [])

  if (!isClient || !user) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Visao geral da {user.name}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.vehicles}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total em Estoque</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.available}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Disponiveis</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.reserved}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Reservados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.sold}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Vendidos</p>
          </div>
        </div>
      </div>

      {/* Recent vehicles section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Veiculos Recentes</h2>
          <Link href="/dashboard/vehicles" className="text-sm" style={{ color: "var(--accent-blue)" }}>
            Ver todos
          </Link>
        </div>
        {recentVehicles.length === 0 ? (
          <div className="empty-state">
            <Car className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum veiculo cadastrado ainda.</p>
            <Link href="/dashboard/vehicles/new" className="btn-primary mt-4 inline-flex">
              Adicionar Veiculo
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Veiculo</th>
                  <th>Marca/Modelo</th>
                  <th>Ano</th>
                  <th>Preco</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVehicles.map((v: any) => (
                  <tr 
                    key={v.id} 
                    onClick={() => router.push(`/dashboard/vehicles/${v.id}/details`)}
                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(66, 153, 225, 0.08)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <td className="font-medium">{v.title}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{v.brand} {v.model}</td>
                    <td>{v.year}</td>
                    <td style={{ color: "var(--accent-green)" }}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v.price))}
                    </td>
                    <td>
                      <span className={`badge ${v.status === "available" ? "badge-green" : v.status === "sold" ? "badge-red" : "badge-yellow"}`}>
                        {v.status === "available" ? "Disponivel" : v.status === "sold" ? "Vendido" : v.status === "reserved" ? "Reservado" : v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
