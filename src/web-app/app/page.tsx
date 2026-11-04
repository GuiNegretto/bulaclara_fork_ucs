'use client'

import { useState } from 'react'
import { Search, Pill } from 'lucide-react'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [medicamento, setMedicamento] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const buscarMedicamento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    setError('')
    setMedicamento(null)
    
    try {
      const response = await fetch('http://localhost:8000/medicamentos/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: searchTerm, gtin: null }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setMedicamento(data)
      } else if (response.status === 404) {
        setError('Medicamento não encontrado')
      } else {
        setError('Erro na busca')
      }
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">BulaClara Desktop</h1>
      <p className="text-gray-600 mb-8 text-center">Consulta de bulas de medicamentos</p>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <form onSubmit={buscarMedicamento} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome do medicamento..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              disabled={isSearching}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        
        <div className="mt-4 flex gap-2">
          <button onClick={() => setSearchTerm('Tylenol')} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
            Tylenol
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {medicamento && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{medicamento.nome}</h2>
              <p className="text-gray-600">Laboratório: {medicamento.laboratorio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}