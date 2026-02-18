"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"

interface VehicleImage {
  id: string
  vehicle_id: string
  image_url: string
  is_primary: boolean
}

export default function VehicleImagesPage() {
  const router = useRouter()
  const params = useParams()
  const [images, setImages] = useState<VehicleImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchImages()
  }, [params.id])

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setImages(response.data.images || [])
    } catch (err) {
      setError("Erro ao carregar fotos")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      const token = localStorage.getItem("token")
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("image", file)

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
      }
      fetchImages()
    } catch (err) {
      setError("Erro ao fazer upload de fotos")
      console.error("Error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta foto?")) return

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchImages()
    } catch (err) {
      setError("Erro ao deletar foto")
      console.error("Error:", err)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Fotos</h1>
        <Link href={`/dashboard/vehicles/${params.id}`} className="btn-secondary">
          Voltar
        </Link>
      </div>

      {error && <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>}

      <div className="card mb-6">
        <label className="block mb-2 font-semibold">Adicionar Fotos</label>
        <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} className="w-full" />
        {uploading && <p className="text-sm text-gray-500 mt-2">Enviando...</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="card">
            <div className="relative w-full h-40 mb-4 bg-gray-700 rounded">
              <Image src={image.image_url || "/placeholder.svg"} alt="Vehicle" fill className="object-cover rounded" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(image.id)} className="btn-secondary flex-1 text-sm">
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && <p className="text-gray-500">Nenhuma foto adicionada</p>}
    </div>
  )
}
