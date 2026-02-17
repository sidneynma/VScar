"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Car, Megaphone, Globe, Users, BarChart3 } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/vehicles", label: "Veículos", icon: Car },
  { href: "/dashboard/announcements", label: "Anúncios", icon: Megaphone },
  { href: "/dashboard/portals", label: "Portais", icon: Globe },
  { href: "/dashboard/users", label: "Usuários", icon: Users },
  { href: "/dashboard/analytics", label: "Análiticas", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col bg-secondary text-secondary-foreground border-r border-border">
      {/* Logo */}
      <Link href="/dashboard" className="px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold text-accent">VSCar</h1>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-4">
        <p className="text-xs text-muted-foreground">VSCar v1.0.0</p>
      </div>
    </aside>
  )
}
