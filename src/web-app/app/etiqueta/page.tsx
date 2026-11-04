'use client'

import { ReadAloudButton } from '@/utils/textToSpeech'

export default function EtiquetaPage() {
  const pageDescription = "Crie etiquetas personalizadas para organizar seus medicamentos com horários de uso."

  return (
    <div className="max-w-6xl mx-auto p-6" role="main" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 id="page-title" className="text-3xl font-bold text-gray-800">Gerador de Etiquetas</h1>
          <p className="text-gray-600 mt-2">{pageDescription}</p>
        </div>
        <ReadAloudButton text={pageDescription} label="Ler descrição" />
      </div>
      
      <section className="bg-white rounded-xl shadow-md p-8" aria-label="Conteúdo em construção">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">🏷️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Página em construção</h2>
          <p className="text-gray-500">
            Você poderá gerar etiquetas personalizadas com horários de uso.
          </p>
        </div>
      </section>

      {/* Preview da funcionalidade */}
      <section className="mt-8 bg-gray-50 rounded-xl p-6" aria-label="Funcionalidades planejadas">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">O que você poderá fazer:</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Adicionar nome do medicamento e dosagem</li>
          <li>Configurar múltiplos horários de uso</li>
          <li>Adicionar observações e instruções especiais</li>
          <li>Gerar PDF para impressão</li>
          <li>Salvar rascunhos para usar depois</li>
        </ul>
      </section>
    </div>
  )
}