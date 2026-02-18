"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Seller {
  id: string
  name: string
  email: string
  phone: string
  status: string
}

export default function SellersPage() {
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSellers(response.data)
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendedores</h1>
        <Link href="/dashboard/sellers/new" className="btn-primary">
          Novo Vendedor
        </Link>
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Telefone</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4">{seller.name}</td>
                <td className="p-4">{seller.email}</td>
                <td className="p-4">{seller.phone}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-sm bg-green-500">{seller.status}</span>
                </td>
                <td className="p-4">
                  <Link href={`/dashboard/sellers/${seller.id}`} className="text-blue-400 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sellers.length === 0 && <p className="text-gray-500 mt-4">Nenhum vendedor cadastrado</p>}
    </div>
  )
}
