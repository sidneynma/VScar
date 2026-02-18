"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Globe, Plus } from "lucide-react"

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
    if (!token) { router.push("/auth/login"); return }
    fetchPortals()
  }, [router])

  const fetchPortals = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setPortals(await res.json())
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portais de Publicacao</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Conecte portais para publicar seus anuncios
          </p>
        </div>
        <Link href="/dashboard/portals/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Conectar Portal
        </Link>
      </div>

      {portals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Globe className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum portal conectado</p>
            <p className="text-xs mt-1">Conecte portais como OLX, Mercado Livre e outros</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {portals.map((portal) => (
            <div key={portal.id} className="card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{portal.name}</h3>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    Slug: {portal.slug}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {portal.is_active
                    ? <span className="badge badge-green">Ativo</span>
                    : <span className="badge badge-gray">Inativo</span>
                  }
                  <Link
                    href={`/dashboard/portals/${portal.id}`}
                    className="text-sm font-medium"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
