"use client"

import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">VSCar</h1>
          <p className="text-xl mb-8">Sistema de Revenda de Veículos - Multi-Tenant SaaS</p>

          <div className="space-y-4">
            <Link href="/auth/register" className="btn-primary inline-block">
              Criar Conta
            </Link>
            <span className="text-white mx-4">ou</span>
            <Link href="/auth/login" className="btn-primary inline-block">
              Login
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Gerenciamento de Veículos</h3>
              <p>Controle completo de seu inventário de veículos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Múltiplos Portais</h3>
              <p>Publique em OLX, Marketplace e outros portais</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
              <p>Gerencie múltiplas revendas em uma plataforma</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
