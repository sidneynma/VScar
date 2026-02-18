"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Car } from "lucide-react"

export default function RegisterPage() {
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
      setError("As senhas nao conferem")
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: "var(--accent-blue)" }}
          >
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Criar conta VSCar
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Configure sua revenda em minutos
          </p>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Nome da Empresa</label>
            <input type="text" name="tenant_name" value={formData.tenant_name} onChange={handleChange} className="input" placeholder="Minha Revenda" required />
          </div>
          <div className="mb-4">
            <label className="label">Slug (URL)</label>
            <input type="text" name="tenant_slug" value={formData.tenant_slug} onChange={handleChange} className="input" placeholder="minha-revenda" required />
          </div>
          <div className="mb-4">
            <label className="label">Seu Nome</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Joao Silva" required />
          </div>
          <div className="mb-4">
            <label className="label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="joao@revenda.com" required />
          </div>
          <div className="mb-4">
            <label className="label">Senha</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" placeholder="Minimo 6 caracteres" required />
          </div>
          <div className="mb-6">
            <label className="label">Confirmar Senha</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input" placeholder="Repita a senha" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Ja tem conta?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "var(--accent-blue)" }}>
            Faca login
          </Link>
        </p>
      </div>
    </div>
  )
}
