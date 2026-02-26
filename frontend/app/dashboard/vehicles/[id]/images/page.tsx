"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
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


  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : ""
        resolve(result.split(",")[1] || "")
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setSelectedFiles([])
      return
    }

    setError("")
    setSelectedFiles(Array.from(files))
  }

  const handleCancelSelection = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      const token = localStorage.getItem("token")
      const preparedImages = await Promise.all(
        selectedFiles.map(async (file, index) => ({
          filename: file.name,
          mime_type: file.type,
          data: await fileToBase64(file),
          is_primary: images.length === 0 && index === 0,
        })),
      )

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}/images`,
        { images: preparedImages },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
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
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelection}
          disabled={uploading}
          className="w-full"
        />
        {selectedFiles.length > 0 && (
          <>
            <p className="text-sm text-gray-400 mt-2">{selectedFiles.length} foto(s) selecionada(s)</p>
            <ul className="text-xs text-gray-500 mt-1 space-y-1">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.lastModified}`}>• {file.name}</li>
              ))}
            </ul>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary"
                type="button"
              >
                Enviar fotos
              </button>
              <button
                onClick={handleCancelSelection}
                disabled={uploading}
                className="btn-secondary"
                type="button"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
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
