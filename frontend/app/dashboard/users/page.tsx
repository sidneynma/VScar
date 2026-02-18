"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Users } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export default function UsersPage() {
  const [isClient, setIsClient] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch users")
        const data = await response.json()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar usuarios")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
      </div>
    )
  }

  const roleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="badge badge-blue">Admin</span>
      case "manager": return <span className="badge badge-blue">Gerente</span>
      default: return <span className="badge badge-gray">Usuario</span>
    }
  }

  const statusBadge = (status: string) => {
    return status === "active"
      ? <span className="badge badge-green">Ativo</span>
      : <span className="badge badge-gray">Inativo</span>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {users.length} usuarios cadastrados
          </p>
        </div>
        <Link href="/dashboard/users/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Usuario
        </Link>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      {users.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum usuario encontrado</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Funcao</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{statusBadge(u.status)}</td>
                  <td>
                    <button className="text-sm font-medium" style={{ color: "var(--accent-blue)" }}>
                      Editar
                    </button>
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
