"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

interface User {
  id: string
  email: string
  name: string
  role: string
  tenant_id: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  tenant_name: string
  tenant_slug: string
  name: string
  email: string
  password: string
}

export function useAuth(): AuthContextType {
  const router = useRouter()

  const getStoredAuth = useCallback(() => {
    if (typeof window === "undefined") {
      return { user: null, token: null }
    }

    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    return {
      token,
      user: user ? JSON.parse(user) : null,
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password })

        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        router.push("/dashboard")
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erro ao fazer login")
      }
    },
    [router],
  )

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, data)

        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        router.push("/dashboard")
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erro ao criar conta")
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth/login")
  }, [router])

  const { user, token } = getStoredAuth()

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    isLoading: false,
  }
}
