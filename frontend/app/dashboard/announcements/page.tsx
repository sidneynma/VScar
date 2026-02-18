"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Announcement {
  id: string
  title: string
  vehicle_id: string
  status: string
  published_at: string
  views_count: number
  contacts_count: number
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchAnnouncements()
  }, [router])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnnouncements(response.data)
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
        <h1 className="text-3xl font-bold">Anúncios</h1>
        <Link href="/dashboard/announcements/new" className="btn-primary">
          Novo Anúncio
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <p className="text-gray-500">Nenhum anúncio publicado</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm opacity-60">
                    <span>Visualizacoes: {announcement.views_count}</span>
                    <span>Contatos: {announcement.contacts_count}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${announcement.status === "active" ? "bg-green-600 text-white" : "bg-gray-600 text-white"}`}
                >
                  {announcement.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
