"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Portal {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export default function PortalsPage() {
  const router = useRouter()
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchPortals()
  }, [router])

  const fetchPortals = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/portals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPortals(response.data)
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portais de Publicação</h1>
        <Link href="/dashboard/portals/new" className="btn-primary">
          Conectar Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {portals.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum portal conectado</p>
            <p className="text-sm opacity-50">Conecte portais como OLX para publicar seus anuncios</p>
          </div>
        ) : (
          portals.map((portal) => (
            <div key={portal.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{portal.name}</h3>
                  <p className="text-sm opacity-60">Slug: {portal.slug}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${portal.is_active ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}
                  >
                    {portal.is_active ? "Ativo" : "Inativo"}
                  </span>
                  <Link href={`/dashboard/portals/${portal.id}`} className="text-blue-400 hover:underline">
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
