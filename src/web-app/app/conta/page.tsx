'use client'

import { ReadAloudButton } from '@/utils/textToSpeech'

export default function ContaPage() {
  const pageDescription = "Gerencie suas preferências e configurações. Esta funcionalidade será implementada em breve."

  return (
    <div className="max-w-6xl mx-auto p-6" role="main" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 id="page-title" className="text-3xl font-bold text-gray-800">Minha Conta</h1>
          <p className="text-gray-600 mt-2">{pageDescription}</p>
        </div>
        <ReadAloudButton text={pageDescription} label="Ler descrição" />
      </div>
      
      <section className="bg-white rounded-xl shadow-md p-8" aria-label="Conteúdo em construção">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">👤</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Página em construção</h2>
          <p className="text-gray-500">
            Aqui você poderá configurar preferências de acessibilidade e gerenciar sua conta.
          </p>
        </div>
      </section>

      {/* Preview das configurações de acessibilidade */}
      <section className="mt-8 bg-blue-50 rounded-xl p-6" aria-label="Configurações de acessibilidade ativas">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Suas Configurações de Acessibilidade</h2>
        <p className="text-gray-600 mb-4">
          Você já pode ajustar várias configurações de acessibilidade usando o botão flutuante (♿) no canto inferior direito ou pressionando <kbd className="px-2 py-1 bg-gray-200 rounded">Alt + A</kbd>.
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Tamanho de fonte ajustável (100% a 200%)</li>
          <li>Modos de alto contraste (escuro, claro, escala de cinza)</li>
          <li>Fonte para dislexia</li>
          <li>Espaçamento ampliado de linhas</li>
          <li>Redução de animações</li>
          <li>Áreas de clique ampliadas</li>
          <li>Leitor de texto em voz alta (TTS)</li>
        </ul>
      </section>
    </div>
  )
}