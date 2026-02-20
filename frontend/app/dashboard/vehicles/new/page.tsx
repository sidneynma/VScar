'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const vehicleTypes = ['Carro', 'Moto', 'Caminhão']
const colors = ['Branco', 'Preto', 'Prata', 'Vermelho', 'Azul', 'Cinza', 'Verde', 'Amarelo', 'Laranja', 'Bege', 'Marrom']
const fuelTypes = ['Gasolina', 'Diesel', 'Álcool', 'Híbrido', 'Elétrico', 'Gasolina/GNV']
const transmissions = ['Manual', 'Automática', 'CVT']
const doors = ['2', '3', '4', '5']

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

export default function NewVehiclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [brands, setBrands] = useState<Array<{ nome: string }>>([])
  const [loadingBrands, setLoadingBrands] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    fuel_type: 'Gasolina',
    transmission: 'Manual',
    mileage: 0,
    price: 0,
    purchase_price: 0,
    doors: '4',
    vehicle_type: 'Carro',
    description: '',
    interior_color: '',
    financial_state: 'paid',
    documentation: [] as string[],
    conservation: [] as string[],
    features: [] as string[]
  })

  useEffect(() => {
    fetchBrands()
  }, [formData.vehicle_type])

  const fetchBrands = async () => {
    setLoadingBrands(true)
    try {
      const typeMap: Record<string, string> = {
        'Carro': 'carros',
        'Moto': 'motos',
        'Caminhão': 'caminhoes'
      }
      const apiType = typeMap[formData.vehicle_type] || 'carros'
      const apiUrl = process.env.NEXT_PUBLIC_BRASIL_API_URL || 'https://brasilapi.com.br'
      const fullUrl = `${apiUrl}/api/fipe/marcas/v1/${apiType}`
      console.log('[v0] Fetching brands from:', fullUrl)
      const res = await fetch(fullUrl)
      if (res.ok) {
        const data = await res.json()
        setBrands(data)
      }
    } catch (err) {
      console.error('Erro ao buscar marcas:', err)
      setBrands([])
    } finally {
      setLoadingBrands(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'year' || name === 'mileage' || name === 'doors' ? parseInt(value) : value }))
  }

  const handleToggleOption = (category: string, optionId: string) => {
    setFormData(prev => {
      const current = prev[category as keyof typeof prev] as string[]
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId]
      return { ...prev, [category]: updated }
    })
  }

  const handleFinancialState = (state: string) => {
    setFormData(prev => ({ ...prev, financial_state: state }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro ao criar veículo')
      }

      const newVehicle = await res.json()
      router.push(`/dashboard/vehicles/${newVehicle.id}/details`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-700 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1>Novo Veículo</h1>
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
              <label className="form-label">Tipo de Veículo</label>
              <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="form-input">
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Título/Nome</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Volkswagen Gol 2020"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Marca</label>
              <select name="brand" value={formData.brand} onChange={handleChange} className="form-input" required disabled={loadingBrands}>
                <option value="">{loadingBrands ? 'Carregando marcas...' : 'Selecione uma marca'}</option>
                {brands.map(brand => (
                  <option key={brand.nome} value={brand.nome}>{brand.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ex: Gol"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Ano</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1980"
                max={new Date().getFullYear() + 1}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Quilometragem</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Cor</label>
              <select name="color" value={formData.color} onChange={handleChange} className="form-input" required>
                <option value="">Selecione uma cor</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Cor Interior</label>
              <input
                type="text"
                name="interior_color"
                value={formData.interior_color}
                onChange={handleChange}
                placeholder="Ex: Preto"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Portas</label>
              <select name="doors" value={formData.doors} onChange={handleChange} className="form-input" required>
                {doors.map(door => (
                  <option key={door} value={door}>{door} portas</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Combustível</label>
              <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="form-input" required>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Câmbio</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="form-input" required>
                {transmissions.map(trans => (
                  <option key={trans} value={trans}>{trans}</option>
                ))}
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
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Valor de Compra (R$)</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                className="form-input"
              />
            </div>
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
                  backgroundColor: formData.financial_state === option.id ? 'var(--accent-blue)' : 'transparent',
                  color: formData.financial_state === option.id ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${formData.financial_state === option.id ? 'var(--accent-blue)' : 'var(--border-color)'}`
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
                  backgroundColor: formData.documentation.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                  color: formData.documentation.includes(option.id) ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${formData.documentation.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
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
                  backgroundColor: formData.conservation.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                  color: formData.conservation.includes(option.id) ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${formData.conservation.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
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
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Segurança e Proteção</h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.security.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption('features', option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                    color: formData.features.includes(option.id) ? 'white' : 'var(--text-secondary)',
                    border: `2px solid ${formData.features.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Conforto e Conveniência</h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.comfort.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption('features', option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                    color: formData.features.includes(option.id) ? 'white' : 'var(--text-secondary)',
                    border: `2px solid ${formData.features.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Tecnologia e Conectividade</h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.technology.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption('features', option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                    color: formData.features.includes(option.id) ? 'white' : 'var(--text-secondary)',
                    border: `2px solid ${formData.features.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Desempenho e Outros</h3>
            <div className="flex gap-3 flex-wrap">
              {featuresOptions.performance.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleOption('features', option.id)}
                  className="option-pill"
                  style={{
                    backgroundColor: formData.features.includes(option.id) ? 'var(--accent-blue)' : 'transparent',
                    color: formData.features.includes(option.id) ? 'white' : 'var(--text-secondary)',
                    border: `2px solid ${formData.features.includes(option.id) ? 'var(--accent-blue)' : 'var(--border-color)'}`
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Descrição</h2>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva detalhes adicionais sobre o veículo..."
            rows={5}
            className="form-input"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mb-6">
          <Link href="/dashboard/vehicles" className="btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Criando...' : 'Criar Veículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
