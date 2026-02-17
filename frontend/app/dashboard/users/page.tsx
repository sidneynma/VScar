"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  last_login?: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:3001/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar usuários")
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando usuários...</div>
  }

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Link href="/dashboard/users/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Novo Usuário
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Função</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${u.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline">Editar</button>
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
