"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

export default function NewVehiclePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    color: "",
    transmission: "manual",
    fuel_type: "gasoline",
    doors: 4,
    status: "available",
    description: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" || name === "price" || name === "mileage" || name === "doors" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      router.push("/dashboard/vehicles")
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar veículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Novo Veículo</h1>
          <Link href="/dashboard/vehicles" className="text-blue-600 hover:underline">
            Voltar
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Honda Civic 2020"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Honda"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Civic"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ano</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
              <label className="block text-gray-700 font-semibold mb-2">Quilometragem</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Cor</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Preto"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Transmissão</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
                <option value="cvt">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tipo de Combustível</label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diesel</option>
                <option value="ethanol">Álcool</option>
                <option value="hybrid">Híbrido</option>
                <option value="electric">Elétrico</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Portas</label>
              <input
                type="number"
                name="doors"
                value={formData.doors}
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
                <option value="available">Disponível</option>
                <option value="sold">Vendido</option>
                <option value="maintenance">Em Manutenção</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o veículo em detalhes..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando..." : "Criar Veículo"}
            </button>
            <Link href="/dashboard/vehicles" className="flex-1 btn-secondary text-center">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
