"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    tenant_name: "",
    tenant_slug: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não conferem")
      return
    }

    setLoading(true)

    try {
      await register({
        tenant_name: formData.tenant_name,
        tenant_slug: formData.tenant_slug,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { backgroundColor: "hsl(217, 27%, 26%)", border: "1px solid hsl(217, 27%, 35%)" }

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ backgroundColor: "hsl(217, 33%, 17%)" }}>
      <div className="rounded-lg shadow-xl p-8 max-w-md w-full" style={{ backgroundColor: "hsl(217, 32%, 21%)" }}>
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Cadastro VSCar</h1>

        {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 font-semibold mb-2">Nome da Empresa</label>
            <input
              type="text"
              name="tenant_name"
              value={formData.tenant_name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              style={inputStyle}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 font-semibold mb-2">Slug da Empresa (URL)</label>
            <input
              type="text"
              name="tenant_slug"
              value={formData.tenant_slug}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              style={inputStyle}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 font-semibold mb-2">Seu Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              style={inputStyle}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              style={inputStyle}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 font-semibold mb-2">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              style={inputStyle}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">Confirmar Senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Ja tem conta?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:underline font-semibold">
            Faca login
          </Link>
        </p>
      </div>
    </div>
  )
}
