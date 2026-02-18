"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Car,
  Megaphone,
  Globe,
  Users,
  BarChart3,
  Store,
  UserCheck,
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/vehicles", label: "Veiculos", icon: Car },
  { href: "/dashboard/announcements", label: "Anuncios", icon: Megaphone },
  { href: "/dashboard/sellers", label: "Vendedores", icon: UserCheck },
  { href: "/dashboard/revendas", label: "Revendas", icon: Store },
  { href: "/dashboard/portals", label: "Portais", icon: Globe },
  { href: "/dashboard/users", label: "Usuarios", icon: Users },
  { href: "/dashboard/analytics", label: "Relatorios", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col"
      style={{
        width: "16rem",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--accent-blue)" }}
        >
          <Car className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          VSCar
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? "rgba(47, 129, 247, 0.15)" : "transparent",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                borderLeft: isActive ? "3px solid var(--accent-blue)" : "3px solid transparent",
              }}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings & Version */}
      <div style={{ borderTop: "1px solid var(--border-color)", padding: "0.75rem" }}>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--text-muted)" }}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span>Configuracoes</span>
        </Link>
        <p className="px-3 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          VSCar v1.0.0
        </p>
      </div>
    </aside>
  )
}
