"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Megaphone, Plus, Eye, MessageSquare } from "lucide-react"

interface Announcement {
  id: string
  title: string
  status: string
  views_count: number
  contacts_count: number
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    fetchAnnouncements()
  }, [router])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setAnnouncements(await res.json())
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
          <h1 className="text-2xl font-bold">Anuncios</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {announcements.length} anuncios publicados
          </p>
        </div>
        <Link href="/dashboard/announcements/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Anuncio
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Megaphone className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum anuncio publicado ainda</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <Eye className="w-3.5 h-3.5" /> {a.views_count} views
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <MessageSquare className="w-3.5 h-3.5" /> {a.contacts_count} contatos
                    </span>
                  </div>
                </div>
                {a.status === "active"
                  ? <span className="badge badge-green">Ativo</span>
                  : <span className="badge badge-gray">{a.status}</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
