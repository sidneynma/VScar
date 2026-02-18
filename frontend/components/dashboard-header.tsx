"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, Bell, Search } from "lucide-react"

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header
        className="md:ml-64"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="spinner" />
        </div>
      </header>
    )
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <header
      className="md:ml-64"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Buscar veiculos, clientes..."
            className="search-input"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Notificacoes"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: "var(--accent-blue)",
                color: "#ffffff",
              }}
            >
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {user?.name || "Usuario"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
