"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Car, Megaphone, BarChart3, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState({ vehicles: 0, available: 0, reserved: 0, sold: 0 })

  useEffect(() => {
    setIsClient(true)
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const vehicles = await res.json()
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
        <h2 className="text-lg font-semibold mb-4">Veiculos Recentes</h2>
        <div className="empty-state">
          <Car className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
          <p>Nenhum veiculo cadastrado ainda.</p>
          <Link href="/dashboard/vehicles/new" className="btn-primary mt-4 inline-flex">
            Adicionar Veiculo
          </Link>
        </div>
      </div>
    </div>
  )
}
