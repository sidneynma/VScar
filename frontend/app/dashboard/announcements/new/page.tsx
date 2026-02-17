"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Vehicle {
  id: string
  title: string
  brand: string
  model: string
}

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Novo Anúncio</h1>
          <Link href="/dashboard/announcements" className="text-blue-600 hover:underline">
            Voltar
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {vehicles.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Você precisa criar veículos antes de fazer anúncios.{" "}
            <Link href="/dashboard/vehicles/new" className="font-semibold underline">
              Criar veículo
            </Link>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Veículo</label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Título do Anúncio</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Honda Civic 2020 impecável"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o veículo em detalhes para atrair compradores..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Preço (R$)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || vehicles.length === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando..." : "Criar Anúncio"}
            </button>
            <Link href="/dashboard/announcements" className="flex-1 btn-secondary text-center">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
