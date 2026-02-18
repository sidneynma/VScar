"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

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

    try {
      const token = localStorage.getItem("token")
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      router.push("/dashboard/sellers")
    } catch (err) {
      setError("Erro ao criar vendedor")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Novo Vendedor</h1>
        <Link href="/dashboard/sellers" className="btn-secondary">
          Voltar
        </Link>
      </div>

      {error && <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Nome</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Telefone</label>
          <input
            type="tel"
            className="input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Criando..." : "Criar Vendedor"}
        </button>
      </form>
    </div>
  )
}
