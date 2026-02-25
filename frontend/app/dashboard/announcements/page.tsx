"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Megaphone, Plus, Eye, MessageSquare, Pencil } from "lucide-react"

interface Announcement {
  id: string
  title: string
  status: string
  description?: string
  views_count: number
  contacts_count: number
  vehicle_brand?: string
  vehicle_model?: string
  vehicle_year?: number
  vehicle_price?: number
  vehicle_fuel_type?: string
  vehicle_transmission?: string
  vehicle_mileage?: number
  vehicle_color?: string
  vehicle_interior_color?: string
  vehicle_doors?: number
  vehicle_vehicle_type?: string
  vehicle_financial_state?: string
  vehicle_documentation?: string[] | string
  vehicle_conservation?: string[] | string
  vehicle_features?: string[] | string
}

const statusMap: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "badge badge-gray" },
  active: { label: "Ativo", className: "badge badge-green" },
  inactive: { label: "Desativado", className: "badge badge-yellow" },
  sold: { label: "Vendido", className: "badge badge-red" },
  preparing: { label: "Aguardando preparação", className: "badge badge-blue" },
  archived: { label: "Arquivado", className: "badge badge-gray" },
}

const listMap: Record<string, string> = {
  ipva_paid: "IPVA pago",
  with_fines: "Com multas",
  auction_vehicle: "Veículo de leilão",
  single_owner: "Único dono",
  spare_key: "Com chave reserva",
  with_manual: "Com manual",
  factory_warranty: "Garantia de fábrica",
  dealer_service: "Revisões em concessionária",
  airbag: "Airbag",
  alarm: "Alarme",
  rear_camera: "Câmera de ré",
  rear_sensor: "Sensor de ré",
  blind_spot: "Blindado",
  ac: "Ar-condicionado",
  sunroof: "Teto solar",
  leather_seats: "Bancos de couro",
  power_steering: "Trava elétrica",
  power_windows: "Vidro elétrico",
  usb: "Conexão USB",
  multifunction_wheel: "Volante multifuncional",
  bluetooth: "Bluetooth",
  sound_system: "Som",
  onboard_computer: "Computador de bordo",
  gps: "GPS",
  cruise_control: "Controle de velocidade",
  traction_control: "Tração 4x4",
  alloy_wheels: "Rodas de liga leve",
  gnv_kit: "Kit GNV",
}

const toArray = (value: string[] | string | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const formatPrice = (price?: number) =>
  price ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price) : "Sob consulta"

const buildPortalText = (a: Announcement) => {
  const documentation = toArray(a.vehicle_documentation).map((item) => listMap[item] || item)
  const guarantee = toArray(a.vehicle_conservation).map((item) => listMap[item] || item)
  const features = toArray(a.vehicle_features).map((item) => listMap[item] || item)

  return [
    `📌 ${a.title}`,
    "",
    "🔹 Informações Básicas",
    `• Veículo: ${a.vehicle_brand || ""} ${a.vehicle_model || ""} ${a.vehicle_year || ""}`,
    `• Tipo: ${a.vehicle_vehicle_type || "-"}`,
    `• Cor: ${a.vehicle_color || "-"} | Interior: ${a.vehicle_interior_color || "-"}`,
    "",
    "🔹 Especificações Técnicas",
    `• Combustível: ${a.vehicle_fuel_type || "-"}`,
    `• Câmbio: ${a.vehicle_transmission || "-"}`,
    `• Portas: ${a.vehicle_doors || "-"}`,
    `• Quilometragem: ${a.vehicle_mileage ? `${a.vehicle_mileage.toLocaleString("pt-BR")} km` : "-"}`,
    "",
    "🔹 Valor de Venda",
    `• ${formatPrice(a.vehicle_price)}`,
    "",
    "🔹 Estado Financeiro",
    `• ${a.vehicle_financial_state === "financed" ? "Veículo em financiamento" : "Veículo quitado"}`,
    "",
    "🔹 Documentação",
    documentation.length ? `• ${documentation.join(" • ")}` : "• Não informado",
    "",
    "🔹 Garantia e Conservação",
    guarantee.length ? `• ${guarantee.join(" • ")}` : "• Não informado",
    "",
    "🔹 Itens de Série",
    features.length ? `• ${features.join(" • ")}` : "• Não informado",
  ].join("\n")
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchAnnouncements()
  }, [router])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setAnnouncements(await res.json())
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const summary = useMemo(() => `${announcements.length} anúncios publicados`, [announcements.length])

  if (loading) {
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
          <h1 className="text-2xl font-bold">Anúncios</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {summary}
          </p>
        </div>
        <Link href="/dashboard/announcements/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Anúncio
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Megaphone className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
            <p>Nenhum anúncio publicado ainda</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map((a) => {
            const badge = statusMap[a.status] || { label: a.status, className: "badge badge-gray" }
            return (
              <div key={a.id} className="card">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <div className="flex gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <Eye className="w-3.5 h-3.5" /> {a.views_count} views
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <MessageSquare className="w-3.5 h-3.5" /> {a.contacts_count} contatos
                      </span>
                    </div>
                  </div>
                  <span className={badge.className}>{badge.label}</span>
                </div>

                <div className="mb-4 p-3 rounded" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                  <h4 className="text-sm font-semibold mb-2">Prévia para OLX / Webmotors / outros</h4>
                  <pre style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>{buildPortalText(a)}</pre>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/announcements/${a.id}`} className="btn-secondary">
                    <Pencil className="w-4 h-4" /> Editar
                  </Link>
                  <button className="btn-secondary" onClick={() => updateStatus(a.id, "inactive")} disabled={updatingId === a.id}>
                    Desativar
                  </button>
                  <button className="btn-secondary" onClick={() => updateStatus(a.id, "sold")} disabled={updatingId === a.id}>
                    Vendido
                  </button>
                  <button className="btn-secondary" onClick={() => updateStatus(a.id, "preparing")} disabled={updatingId === a.id}>
                    Aguardando preparação
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
