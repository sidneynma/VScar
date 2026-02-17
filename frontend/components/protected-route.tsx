"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router, user, requiredRole])

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return <>{children}</>
}
