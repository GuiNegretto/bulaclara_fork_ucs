'use client'

import { useState } from 'react'
import { Search, Pill, AlertCircle, CheckCircle, Building, Shield, Volume2, VolumeX } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [medicamento, setMedicamento] = useState<any>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { speechRate } = useAccessibility()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
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
        alert('Medicamento não encontrado. Tente outro nome.')
      } else {
        alert(`Erro na busca: ${response.status}`)
      }
    } catch {
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
    } finally {
      setIsSearching(false)
    }
  }

  // Função para preparar o texto da bula para leitura
  const prepareBulaText = () => {
    if (!medicamento) return ''
    
    let text = `Bula do medicamento ${medicamento.nome}. `
    text += `Laboratório: ${medicamento.laboratorio}. `
    text += `GTIN: ${medicamento.gtin}. `
    
    if (medicamento.bula_simplificada) {
      text += 'Bula Simplificada. '
      
      if (medicamento.bula_simplificada.contraindicacoes?.length > 0) {
        text += 'Contraindicações: '
        text += medicamento.bula_simplificada.contraindicacoes.join('. ')
        text += '. '
      }
      
      if (medicamento.bula_simplificada.forma_de_uso?.length > 0) {
        text += 'Forma de Uso: '
        text += medicamento.bula_simplificada.forma_de_uso.join('. ')
        text += '. '
      }
      
      if (medicamento.bula_simplificada.posologia) {
        text += `Posologia: ${medicamento.bula_simplificada.posologia}.`
      }
    }
    
    return text
  }

  // Função para ler a bula em voz alta
  const handleReadBula = () => {
    if (!medicamento) return
    
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    
    const text = prepareBulaText()
    if (!text) return
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = speechRate
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    window.speechSynthesis.cancel() // Cancela qualquer leitura anterior
    window.speechSynthesis.speak(utterance)
  }

  // Parar leitura ao desmontar componente
  useState(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">BulaClara Desktop</h1>
        <p className="text-gray-600 text-lg">Consulte bulas de medicamentos de forma simples</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do medicamento..."
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
          </div>
                </form>
      </div>

            {medicamento && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{medicamento.nome}</h2>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {medicamento.laboratorio}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    GTIN: {medicamento.gtin}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botão de Leitura de Bula */}
            <button
              onClick={handleReadBula}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isSpeaking 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              aria-label={isSpeaking ? 'Parar leitura da bula' : 'Ler bula em voz alta'}
              title={`Velocidade: ${speechRate}x`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span className="font-medium">Parar Leitura</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span className="font-medium">Ler Bula</span>
                </>
              )}
            </button>
          </div>

          {medicamento.bula_simplificada && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Bula Simplificada</h3>
              
              {medicamento.bula_simplificada.contraindicacoes && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Contraindicações</h4>
                  <ul className="list-disc pl-5 text-red-700 space-y-1">
                    {medicamento.bula_simplificada.contraindicacoes.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicamento.bula_simplificada.forma_de_uso && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Forma de Uso</h4>
                  <ul className="list-disc pl-5 text-green-700 space-y-1">
                    {medicamento.bula_simplificada.forma_de_uso.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicamento.bula_simplificada.posologia && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Posologia</h4>
                  <p className="text-blue-700">{medicamento.bula_simplificada.posologia}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Pill className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Bulas Simplificadas</h3>
          <p className="text-gray-600">Linguagem acessível e organização por tópicos.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Informações Confiáveis</h3>
          <p className="text-gray-600">Dados baseados na ANVISA e fontes oficiais.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Fácil de Usar</h3>
          <p className="text-gray-600">Interface intuitiva e rápida.</p>
        </div>
      </div>
    </div>
  )
}