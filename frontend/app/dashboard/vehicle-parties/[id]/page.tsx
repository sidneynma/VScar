"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const onlyDigits = (value: string) => value.replace(/\D/g, "")
const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}
const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}
const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

export default function EditVehiclePartyPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    fetchParty()
  }, [params.id])

  const fetchParty = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Cadastro não encontrado")

      const data = await response.json()
      setForm({
        ...data,
        person_type: data.person_type || "individual",
        profile_type: data.profile_type || "both",
        status: data.status || "active",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cadastro")
    } finally {
      setLoading(false)
    }
  }

  const handleCepLookup = async () => {
    const cep = onlyDigits(form?.postal_code || "")
    if (cep.length !== 8) return

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`)
      if (!response.ok) return
      const data = await response.json()

      setForm((prev: any) => ({
        ...prev,
        street: data.street || prev.street,
        neighborhood: data.neighborhood || prev.neighborhood,
        city: data.city || prev.city,
        state: data.state || prev.state,
      }))
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-parties/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Erro ao salvar" }))
        throw new Error(body.message)
      }

      router.push("/dashboard/vehicle-parties")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar cadastro")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (!form) return <div className="p-6">Cadastro não encontrado.</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Editar cadastro</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Atualize dados do proprietário/comprador e o status do cadastro.
          </p>
        </div>
        <Link href="/dashboard/vehicle-parties" className="btn-secondary">
          Voltar
        </Link>
      </div>

      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

      <form className="card grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
        <input className="search-input" placeholder="Nome completo" value={form.name || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))} required />
        <input className="search-input" placeholder="Email" type="email" value={form.email || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, email: e.target.value }))} />
        <input className="search-input" placeholder="Telefone" value={form.phone || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, phone: formatPhone(e.target.value) }))} />
        <select className="search-input" value={form.person_type} onChange={(e) => setForm((prev: any) => ({ ...prev, person_type: e.target.value }))}>
          <option value="individual">Pessoa Física</option>
          <option value="company">Pessoa Jurídica</option>
        </select>
        <input className="search-input" placeholder={form.person_type === "company" ? "CNPJ" : "CPF"} value={form.document || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, document: prev.person_type === "company" ? formatCnpj(e.target.value) : formatCpf(e.target.value) }))} />
        <select className="search-input" value={form.profile_type} onChange={(e) => setForm((prev: any) => ({ ...prev, profile_type: e.target.value }))}>
          <option value="both">Proprietário e Comprador</option>
          <option value="owner">Somente Proprietário</option>
          <option value="buyer">Somente Comprador</option>
        </select>
        <select className="search-input" value={form.status} onChange={(e) => setForm((prev: any) => ({ ...prev, status: e.target.value }))}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>

        <input className="search-input" placeholder="CEP" value={form.postal_code || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, postal_code: formatCep(e.target.value) }))} onBlur={handleCepLookup} />
        <input className="search-input" placeholder="Rua" value={form.street || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, street: e.target.value }))} />
        <input className="search-input" placeholder="Número" value={form.number || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, number: e.target.value }))} />
        <input className="search-input" placeholder="Complemento" value={form.complement || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, complement: e.target.value }))} />
        <input className="search-input" placeholder="Bairro" value={form.neighborhood || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, neighborhood: e.target.value }))} />
        <input className="search-input" placeholder="Cidade" value={form.city || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, city: e.target.value }))} />
        <input className="search-input" placeholder="UF" maxLength={2} value={form.state || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, state: e.target.value.toUpperCase() }))} />

        <textarea className="search-input md:col-span-2" placeholder="Observações" rows={3} value={form.notes || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, notes: e.target.value }))} />

        <button type="submit" className="btn-primary md:col-span-2" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  )
}
