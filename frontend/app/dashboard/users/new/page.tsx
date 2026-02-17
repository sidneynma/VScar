"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao criar usuário")
      }

      router.push("/dashboard/users")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/users" className="text-blue-600 hover:underline">
          ← Voltar
        </Link>
      </div>

      <div className="max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Novo Usuário</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="joao@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Função</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Usuário</option>
              <option value="manager">Gerenciador</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Criando..." : "Criar Usuário"}
            </button>
            <Link
              href="/dashboard/users"
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded text-center hover:bg-gray-400"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
