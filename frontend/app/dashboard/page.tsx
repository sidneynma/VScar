"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !user) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Bem-vindo, {user.name}!</h2>
        <p className="text-gray-600">Função: {user.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/vehicles" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Veículos</h3>
          <p className="text-gray-600">Gerenciar seu inventário de veículos</p>
        </Link>

        <Link href="/dashboard/revendas" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Revendas</h3>
          <p className="text-gray-600">Configurar revendas associadas</p>
        </Link>

        <Link href="/dashboard/announcements" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Anúncios</h3>
          <p className="text-gray-600">Publicar e gerenciar anúncios</p>
        </Link>

        <Link href="/dashboard/portals" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Portais</h3>
          <p className="text-gray-600">Configurar integração com portais</p>
        </Link>

        <Link href="/dashboard/users" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Usuários</h3>
          <p className="text-gray-600">Gerenciar usuários da empresa</p>
        </Link>

        <Link href="/dashboard/analytics" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Análiticas</h3>
          <p className="text-gray-600">Visualizar relatórios e dados</p>
        </Link>
      </div>
    </div>
  )
}
