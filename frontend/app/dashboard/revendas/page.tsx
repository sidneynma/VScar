"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function RevendasPage() {
  const [isClient, setIsClient] = useState(false)
  const [revendas, setRevendas] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    // TODO: Carregar revendas da API
    setRevendas([])
  }, [])

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Revendas</h1>
        <Link href="/dashboard/revendas/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          Nova Revenda
        </Link>
      </div>

      {revendas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Nenhuma revenda encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {revendas.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-6 py-4">{r.name}</td>
                  <td className="px-6 py-4">{r.email}</td>
                  <td className="px-6 py-4">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
