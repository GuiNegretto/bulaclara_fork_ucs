'use client'

import { useState } from 'react'
import { Search, Pill, AlertCircle, CheckCircle, Building, Pill as PillIcon, Clock, Shield, AlertTriangle, Info, Download, Copy } from 'lucide-react'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    try {
      // Chamada para a API do backend FastAPI
      const response = await fetch('http://localhost:8000/medicamentos/consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: searchTerm, gtin: null }),
      })
      
      if (response.ok) {
        const data = await response.json()
        // Converte o resultado do backend para o formato esperado pelo frontend
        const result = [{
          id: 1,
          nome: data.nome || searchTerm,
          gtin: data.gtin || 'Não informado',
          apresentacao: data.laboratorio || 'Não informado',
          laboratorio: data.laboratorio || 'Não informado',
          principioAtivo: data.principios_ativos?.join(', ') || 'Não informado',
          bulaSimplificada: data.bula_simplificada || null,
          ...data // Inclui todos os dados originais
        }]
        setSearchResults(result)
      } else {
        if (response.status === 404) {
          alert('Medicamento não encontrado. Tente outro nome ou GTIN.')
        } else {
          alert(`Erro na busca: ${response.status} - ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
    } finally {
      setIsSearching(false)
    }
  }

  const mockResults = [
    {
      id: 1,
      nome: 'Dipirona',
      apresentacao: 'Comprimido 500mg',
      laboratorio: 'EMS',
      principioAtivo: 'Dipirona Monoidratada',
    },
    {
      id: 2,
      nome: 'Paracetamol',
      apresentacao: 'Comprimido 750mg',
      laboratorio: 'Medley',
      principioAtivo: 'Paracetamol',
    },
    {
      id: 3,
      nome: 'Ibuprofeno',
      apresentacao: 'Comprimido 400mg',
      laboratorio: 'Eurofarma',
      principioAtivo: 'Ibuprofeno',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Consulte bulas de medicamentos de forma simples
        </h1>
        <p className="text-gray-600 text-lg">
          Busque por nome do medicamento, laboratório ou princípio ativo
        </p>
      </div>
      {/* Barra de busca */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do medicamento, laboratório ou princípio ativo..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-l-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-r-xl flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="text-gray-500">Sugestões:</span>
            {['Dipirona', 'Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Omeprazol'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setSearchTerm(suggestion)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Resultados da busca */}
      {searchResults.length > 0 ? (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Resultados da busca</h2>
            <div className="text-sm text-gray-500">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                1 medicamento encontrado
              </span>
            </div>
          </div>
          
          {searchResults.map((medicamento) => (
            <div key={medicamento.id} className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              {/* Cabeçalho do medicamento */}
              <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <PillIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{medicamento.nome}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">Laboratório:</span> {medicamento.laboratorio}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">GTIN:</span> {medicamento.gtin}
                      </div>
                      <div className="flex items-center gap-1">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">Princípio Ativo:</span> {medicamento.principioAtivo}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copiar Informações
                  </button>
                </div>
              </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Exemplos de medicamentos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockResults.map((medicamento) => (
              <div key={medicamento.id} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{medicamento.nome}</h3>
                <p className="text-gray-600 mb-1"><strong>Apresentação:</strong> {medicamento.apresentacao}</p>
                <p className="text-gray-600 mb-1"><strong>Laboratório:</strong> {medicamento.laboratorio}</p>
                <p className="text-gray-600"><strong>Princípio Ativo:</strong> {medicamento.principioAtivo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recursos */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Pill className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Bulas Simplificadas</h3>
          <p className="text-gray-600">
            Linguagem acessível e organização por tópicos para facilitar a compreensão.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Informações Confiáveis</h3>
          <p className="text-gray-600">
            Dados baseados na ANVISA e fontes oficiais de saúde.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Uso Offline</h3>
          <p className="text-gray-600">
            Acesso às consultas recentes mesmo sem conexão com a internet.
          </p>
        </div>
      </div>
    </div>
  )
}