"use client"

import { useEffect, useState } from "react"
import { Car, Eye, MessageSquare, TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatorios</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Visao geral de desempenho
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-icon blue"><Car className="w-5 h-5" /></div>
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total de Veiculos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Anuncios Ativos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Eye className="w-5 h-5" /></div>
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Visualizacoes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><MessageSquare className="w-5 h-5" /></div>
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Contatos</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Ultimos Anuncios</h2>
        <div className="empty-state">
          <TrendingUp className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
          <p>Nenhum dado disponivel ainda</p>
        </div>
      </div>
    </div>
  )
}
