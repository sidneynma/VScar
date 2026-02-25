"use client"

import type React from "react"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Vehicle {
  id: string
  title: string
  brand: string
  model: string
  plate?: string
}

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [formData, setFormData] = useState({
    vehicle_id: "",
    title: "",
    description: "",
    price: 0,
    status: "draft",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVehicles(response.data)
    } catch (err) {
      console.error("Error fetching vehicles:", err)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const filteredVehicles = useMemo(() => {
    const term = vehicleSearch.toLowerCase()
    return vehicles.filter((v) => `${v.brand} ${v.model} ${v.title} ${v.plate || ""}`.toLowerCase().includes(term))
  }, [vehicles, vehicleSearch])

  const selectedVehicle = useMemo(() => vehicles.find((v) => v.id === formData.vehicle_id), [vehicles, formData.vehicle_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      router.push("/dashboard/announcements")
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar anúncio")
    } finally {
      setLoading(false)
    }
  }

  if (loadingVehicles) {
    return <div className="flex items-center justify-center min-h-screen">Carregando veículos...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between">
        <h1>Novo Anúncio</h1>
        <Link href="/dashboard/announcements" className="btn-secondary">Voltar</Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {error && <div className="card mb-4 border border-red-600 text-red-400">{error}</div>}

        {vehicles.length === 0 ? (
          <div className="card mb-4 border border-yellow-600 text-yellow-400">
            Você precisa criar veículos antes de fazer anúncios. <Link href="/dashboard/vehicles/new" className="underline">Criar veículo</Link>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="form-label">Buscar Veículo (modelo ou placa)</label>
            <input
              className="form-input"
              placeholder="Ex: Corolla ou ABC1D23"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Veículo</label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Selecione um veículo</option>
              {filteredVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} • Placa: {vehicle.plate || "-"}
                </option>
              ))}
            </select>
            {selectedVehicle && (
              <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                Veículo selecionado: <b>{selectedVehicle.brand} {selectedVehicle.model}</b> • Placa <b>{selectedVehicle.plate || "-"}</b>
              </p>
            )}
          </div>

          <div>
            <label className="form-label">Título do Anúncio</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" required />
          </div>

          <div>
            <label className="form-label">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={7} className="form-input" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Preço (R$)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" required />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="inactive">Desativado</option>
                <option value="sold">Vendido</option>
                <option value="preparing">Aguardando preparação</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Link href="/dashboard/announcements" className="btn-secondary">Cancelar</Link>
            <button type="submit" disabled={loading || vehicles.length === 0} className="btn-primary">
              {loading ? "Criando..." : "Criar Anúncio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
