"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserCheck, Plus } from "lucide-react"

interface Seller {
  id: string
  name: string
  email: string
  phone: string
  status: string
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setSellers(await res.json())
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendedores</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {sellers.length} vendedores cadastrados
          </p>
        </div>
        <Link href="/dashboard/sellers/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Vendedor
        </Link>
      </div>

      {sellers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <UserCheck className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum vendedor cadastrado</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id}>
                  <td className="font-medium">{seller.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{seller.email}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{seller.phone}</td>
                  <td><span className="badge badge-green">{seller.status}</span></td>
                  <td>
                    <Link
                      href={`/dashboard/sellers/${seller.id}`}
                      className="text-sm font-medium"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
