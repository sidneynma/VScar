"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Announcement {
  id: string
  title: string
  description: string
  status: string
}

const statusOptions = [
  { id: "draft", label: "Rascunho" },
  { id: "active", label: "Ativo" },
  { id: "inactive", label: "Desativado" },
  { id: "sold", label: "Vendido" },
  { id: "preparing", label: "Aguardando preparação" },
  { id: "archived", label: "Arquivado" },
]

export default function EditAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Anúncio não encontrado")

        const data = await res.json()
        setFormData({
          id: data.id,
          title: data.title,
          description: data.description || "",
          status: data.status || "draft",
        })
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar anúncio")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncement()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
        }),
      })

      if (!res.ok) throw new Error("Erro ao salvar anúncio")
      router.push("/dashboard/announcements")
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar anúncio")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (!formData) return <div className="p-6">{error || "Anúncio não encontrado"}</div>

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between">
        <h1>Editar Anúncio</h1>
        <Link href="/dashboard/announcements" className="btn-secondary">Voltar</Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto card">
        {error && <div className="mb-4 text-red-400">{error}</div>}

        <div className="mb-4">
          <label className="form-label">Título</label>
          <input className="form-input" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="mb-4">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={8} value={formData.description} onChange={handleChange} required />
        </div>

        <div className="mb-6">
          <label className="form-label">Status</label>
          <select className="form-input" name="status" value={formData.status} onChange={handleChange}>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/announcements" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  )
}
