"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewSellerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Erro ao criar vendedor")
      router.push("/dashboard/sellers")
    } catch (err) {
      setError("Erro ao criar vendedor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link
        href="/dashboard/sellers"
        className="inline-flex items-center gap-2 text-sm mb-6"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para vendedores
      </Link>

      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Novo Vendedor</h1>

        {error && <div className="alert-error mb-4">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Nome</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do vendedor"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendedor@email.com"
                required
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? "Criando..." : "Criar Vendedor"}
              </button>
              <Link href="/dashboard/sellers" className="btn-secondary flex-1 justify-center py-2.5 text-center">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
