"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Store, Plus } from "lucide-react"

export default function RevendasPage() {
  const [isClient, setIsClient] = useState(false)
  const [revendas, setRevendas] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    setRevendas([])
  }, [])

  if (!isClient) {
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
          <h1 className="text-2xl font-bold">Revendas</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Gerencie suas revendas associadas
          </p>
        </div>
        <Link href="/dashboard/revendas/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova Revenda
        </Link>
      </div>

      {revendas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Store className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhuma revenda encontrada</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {revendas.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{r.email}</td>
                  <td><span className="badge badge-green">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
