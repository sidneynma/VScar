"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Vehicle {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  status: string
  mileage: number
  color: string
  fuel_type: string
  transmission: string
  description: string
}

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVehicle()
  }, [params.id])

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVehicle(response.data)
    } catch (err) {
      setError("Erro ao carregar veículo")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}`, vehicle, {
        headers: { Authorization: `Bearer ${token}` },
      })
      router.push("/dashboard/vehicles")
    } catch (err) {
      setError("Erro ao salvar veículo")
      console.error("Error:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (!vehicle) return <div className="p-6">Veículo não encontrado</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editar Veículo</h1>
        <Link href="/dashboard/vehicles" className="btn-secondary">
          Voltar
        </Link>
      </div>

      {error && <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Título</label>
            <input
              type="text"
              className="input"
              value={vehicle.title}
              onChange={(e) => setVehicle({ ...vehicle, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Preço</label>
            <input
              type="number"
              className="input"
              value={vehicle.price}
              onChange={(e) => setVehicle({ ...vehicle, price: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Marca</label>
            <input
              type="text"
              className="input"
              value={vehicle.brand}
              onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Modelo</label>
            <input
              type="text"
              className="input"
              value={vehicle.model}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Ano</label>
            <input
              type="number"
              className="input"
              value={vehicle.year}
              onChange={(e) => setVehicle({ ...vehicle, year: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Kilometragem</label>
            <input
              type="number"
              className="input"
              value={vehicle.mileage}
              onChange={(e) => setVehicle({ ...vehicle, mileage: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              className="input"
              value={vehicle.status}
              onChange={(e) => setVehicle({ ...vehicle, status: e.target.value })}
            >
              <option value="available">Disponível</option>
              <option value="sold">Vendido</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Cor</label>
            <input
              type="text"
              className="input"
              value={vehicle.color}
              onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Combustível</label>
            <input
              type="text"
              className="input"
              value={vehicle.fuel_type}
              onChange={(e) => setVehicle({ ...vehicle, fuel_type: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Descrição</label>
          <textarea
            className="input h-24"
            value={vehicle.description}
            onChange={(e) => setVehicle({ ...vehicle, description: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <Link href={`/dashboard/vehicles/${params.id}/images`} className="btn-secondary">
            Gerenciar Fotos
          </Link>
        </div>
      </form>
    </div>
  )
}
