import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VSCar - Sistema de Revenda de Veículos",
  description: "Plataforma SaaS para gerenciar revendas de veículos com múltiplos portais",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
