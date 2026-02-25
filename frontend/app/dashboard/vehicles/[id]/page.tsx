'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const colors = ['Branco', 'Preto', 'Prata', 'Vermelho', 'Azul', 'Cinza', 'Verde', 'Amarelo', 'Laranja', 'Bege', 'Marrom']
const fuelTypes = ['Gasolina', 'Diesel', 'Álcool', 'Híbrido', 'Elétrico', 'Gasolina/GNV']
const transmissions = ['Manual', 'Automática', 'CVT']
const doors = ['2', '3', '4', '5']
const vehicleStatusOptions = [
  { id: 'available', label: 'Disponível' },
  { id: 'reserved', label: 'Reservado' },
  { id: 'sold', label: 'Vendido' },
  { id: 'maintenance', label: 'Em manutenção' }
]

const financialStateOptions = [
  { id: 'paid', label: 'Veículo quitado' },
  { id: 'financed', label: 'Veículo em financiamento' }
]

const documentationOptions = [
  { id: 'ipva_paid', label: 'IPVA pago' },
  { id: 'with_fines', label: 'Com multas' },
  { id: 'auction_vehicle', label: 'Veículo de leilão' }
]

const conservationOptions = [
  { id: 'single_owner', label: 'Único dono' },
  { id: 'spare_key', label: 'Com chave reserva' },
  { id: 'with_manual', label: 'Com manual' },
  { id: 'factory_warranty', label: 'Com garantia de fábrica' },
  { id: 'dealer_service', label: 'Revisões feitas em concessionária' }
]

const featuresOptions = {
  security: [
    { id: 'airbag', label: 'Airbag' },
    { id: 'alarm', label: 'Alarme' },
    { id: 'rear_camera', label: 'Câmera de ré' },
    { id: 'rear_sensor', label: 'Sensor de ré' },
    { id: 'blind_spot', label: 'Blindado' }
  ],
  comfort: [
    { id: 'ac', label: 'Ar Condicionado' },
    { id: 'sunroof', label: 'Teto Solar' },
    { id: 'leather_seats', label: 'Bancos de Couro' },
    { id: 'power_steering', label: 'Trava elétrica' },
    { id: 'power_windows', label: 'Vidro elétrico' }
  ],
  technology: [
    { id: 'usb', label: 'Conexão USB' },
    { id: 'multifunction_wheel', label: 'Volante multifuncional' },
    { id: 'bluetooth', label: 'Interface Bluetooth' },
    { id: 'sound_system', label: 'Som' },
    { id: 'onboard_computer', label: 'Computador de bordo' },
    { id: 'gps', label: 'Navegador GPS' }
  ],
  performance: [
    { id: 'cruise_control', label: 'Controle automático de velocidade' },
    { id: 'traction_control', label: 'Tração 4x4' },
    { id: 'alloy_wheels', label: 'Rodas de liga leve' },
    { id: 'gnv_kit', label: 'Com Kit GNV' }
  ]
}

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVehicle()
  }, [params.id])

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setVehicle({
          ...data,
          documentation: Array.isArray(data.documentation) ? data.documentation : [],
          conservation: Array.isArray(data.conservation) ? data.conservation : [],
          features: Array.isArray(data.features) ? data.features : []
        })
      } else {
        setError('Veículo não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar veículo')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setVehicle(prev => ({ ...prev, [name]: value }))
  }

  const handleToggleOption = (category: string, optionId: string) => {
    setVehicle(prev => {
      const current = prev[category] || []
      const updated = current.includes(optionId)
        ? current.filter((id: string) => id !== optionId)
        : [...current, optionId]
      return { ...prev, [category]: updated }
    })
  }

  const handleFinancialState = (state: string) => {
    setVehicle(prev => ({ ...prev, financial_state: state }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(vehicle)
      })

      if (!res.ok) {
        throw new Error('Erro ao salvar veículo')
      }

      router.push(`/dashboard/vehicles/${params.id}/details`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (!vehicle) return <div className="p-6">{error || 'Veículo não encontrado'}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-700 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1>Editar Veículo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {error && (
          <div style={{ backgroundColor: 'rgba(218, 54, 51, 0.15)', color: 'var(--accent-red)', border: '1px solid rgba(218, 54, 51, 0.3)' }} className="card mb-4">
            {error}
          </div>
        )}

        {/* Informações Básicas */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Título</label>
              <input type="text" name="title" value={vehicle.title} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Marca</label>
              <input type="text" name="brand" value={vehicle.brand} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Modelo</label>
              <input type="text" name="model" value={vehicle.model} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Ano</label>
              <input type="number" name="year" value={vehicle.year} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Placa</label>
              <input type="text" name="plate" value={vehicle.plate || ''} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Renavam</label>
              <input type="text" name="renavam" value={vehicle.renavam || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Número do Chassi</label>
              <input type="text" name="chassis" value={vehicle.chassis || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Quilometragem</label>
              <input type="number" name="mileage" value={vehicle.mileage} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Cor</label>
              <select name="color" value={vehicle.color} onChange={handleChange} className="form-input" required>
                <option value="">Selecione uma cor</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Cor Interior</label>
              <input type="text" name="interior_color" value={vehicle.interior_color || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Portas</label>
              <select name="doors" value={vehicle.doors} onChange={handleChange} className="form-input" required>
                {doors.map(d => <option key={d} value={d}>{d} portas</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Combustível</label>
              <select name="fuel_type" value={vehicle.fuel_type} onChange={handleChange} className="form-input" required>
                {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Câmbio</label>
              <select name="transmission" value={vehicle.transmission} onChange={handleChange} className="form-input" required>
                {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Preço de Venda (R$)</label>
              <input type="number" name="price" value={vehicle.price} onChange={handleChange} step="0.01" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Valor de Compra (R$)</label>
              <input type="number" name="purchase_price" value={vehicle.purchase_price || 0} onChange={handleChange} step="0.01" className="form-input" />
            </div>
          </div>
        </div>

        {/* Status do Veículo */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Status do Veículo</h2>
          <div>
            <label className="form-label">Status</label>
            <select name="status" value={vehicle.status || 'available'} onChange={handleChange} className="form-input">
              {vehicleStatusOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estado Financeiro */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado Financeiro</h2>
          <div className="flex gap-3 flex-wrap">
            {financialStateOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleFinancialState(option.id)}
                className="option-pill"
                style={{
                  backgroundColor: vehicle.financial_state === option.id ? 'var(--accent-blue)' : 'transparent',
                  color: vehicle.financial_state === option.id ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${vehicle.financial_state === option.id ? 'var(--accent-blue)' : 'var(--border-color)'}`
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documentação */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Documentação e Regularização</h2>
          <div className="flex gap-3 flex-wrap">
            {documentationOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption('documentation', option.id)}
                className="option-pill"
                style={{
                  backgroundColor: vehicle.documentation?.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                  color: vehicle.documentation?.includes(option.id) ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${vehicle.documentation?.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conservação */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Conservação e Garantia</h2>
          <div className="flex gap-3 flex-wrap">
            {conservationOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption('conservation', option.id)}
                className="option-pill"
                style={{
                  backgroundColor: vehicle.conservation?.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                  color: vehicle.conservation?.includes(option.id) ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${vehicle.conservation?.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Itens de Série */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Itens de Série</h2>
          
          {Object.entries(featuresOptions).map(([category, options]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                {category === 'security' ? 'Segurança e Proteção' : category === 'comfort' ? 'Conforto e Conveniência' : category === 'technology' ? 'Tecnologia e Conectividade' : 'Desempenho e Outros'}
              </h3>
              <div className="flex gap-3 flex-wrap">
                {options.map((option: any) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggleOption('features', option.id)}
                    className="option-pill"
                    style={{
                      backgroundColor: vehicle.features?.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                      color: vehicle.features?.includes(option.id) ? 'white' : 'var(--text-secondary)',
                      border: `2px solid ${vehicle.features?.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Descrição */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Descrição</h2>
          <textarea name="description" value={vehicle.description} onChange={handleChange} rows={5} className="form-input" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mb-6">
          <Link href={`/dashboard/vehicles/${params.id}/details`} className="btn-secondary">
            Cancelar
          </Link>
          <Link href={`/dashboard/vehicles/${params.id}/images`} className="btn-secondary">
            Fotos
          </Link>
          <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
