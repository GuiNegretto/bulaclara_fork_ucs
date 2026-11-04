'use client'

import { ReadAloudButton } from '@/utils/textToSpeech'

export default function HistoricoPage() {
  const pageDescription = "Acompanhe suas consultas e etiquetas geradas. Esta funcionalidade será implementada em breve."

  return (
    <div className="max-w-6xl mx-auto p-6" role="main" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 id="page-title" className="text-3xl font-bold text-gray-800">Histórico de Consultas</h1>
          <p className="text-gray-600 mt-2">{pageDescription}</p>
        </div>
        <ReadAloudButton text={pageDescription} label="Ler descrição" />
      </div>
      
      <section className="bg-white rounded-xl shadow-md p-8" aria-label="Conteúdo em construção">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Página em construção</h2>
          <p className="text-gray-500">
            Enquanto isso, você pode usar a busca de medicamentos na página inicial.
          </p>
          <a 
            href="/" 
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-500"
            aria-label="Ir para página de busca de medicamentos"
          >
            Ir para Busca
          </a>
        </div>
      </section>
    </div>
  )
}