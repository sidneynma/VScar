"use client"

import { useEffect, useState } from "react"

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Análiticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Veículos</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Anúncios Ativos</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Visualizações</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Contatos</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Últimos Anúncios</h2>
        <p className="text-gray-600">Nenhum dado disponível</p>
      </div>
    </div>
  )
}
