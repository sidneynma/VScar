"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao criar usuario")
      }
      router.push("/dashboard/users")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm mb-6"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para usuarios
      </Link>

      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Novo Usuario</h1>

        {error && <div className="alert-error mb-4">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Nome</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input" placeholder="Joao Silva" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input" placeholder="joao@example.com" />
            </div>
            <div>
              <label className="label">Senha</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input" placeholder="Minimo 6 caracteres" />
            </div>
            <div>
              <label className="label">Funcao</label>
              <select name="role" value={formData.role} onChange={handleChange} className="select">
                <option value="user">Usuario</option>
                <option value="manager">Gerenciador</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? "Criando..." : "Criar Usuario"}
              </button>
              <Link href="/dashboard/users" className="btn-secondary flex-1 justify-center py-2.5 text-center">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
