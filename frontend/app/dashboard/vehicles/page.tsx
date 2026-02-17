"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchVehicles()
  }, [router])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVehicles(response.data)
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Veículos</h1>
        <Link href="/dashboard/vehicles/new" className="btn-primary">
          Novo Veículo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {vehicles.length === 0 ? (
          <p className="text-gray-500">Nenhum veículo cadastrado</p>
        ) : (
          vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/dashboard/vehicles/${vehicle.id}`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{vehicle.title}</h3>
                  <p className="text-gray-600">
                    {vehicle.brand} {vehicle.model} - {vehicle.year}
                  </p>
                  <p className="text-blue-600 font-semibold">R$ {vehicle.price.toLocaleString("pt-BR")}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${vehicle.status === "available" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {vehicle.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
