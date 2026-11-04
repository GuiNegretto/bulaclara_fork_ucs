'use client'

import { ReadAloudButton } from '@/utils/textToSpeech'

export default function LoginPage() {
  const pageDescription = "Acesse sua conta para gerenciar suas preferências e histórico de consultas."

  return (
    <div className="max-w-6xl mx-auto p-6" role="main" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 id="page-title" className="text-3xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-600 mt-2">{pageDescription}</p>
        </div>
        <ReadAloudButton text={pageDescription} label="Ler descrição" />
      </div>
      
      <section className="bg-white rounded-xl shadow-md p-8" aria-label="Formulário de login">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">🔐</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Página em construção</h2>
          <p className="text-gray-500">
            Aqui você poderá fazer login para acessar suas configurações personalizadas e histórico.
          </p>
        </div>
      </section>

      {/* Preview das funcionalidades de login */}
      <section className="mt-8 bg-blue-50 rounded-xl p-6" aria-label="Funcionalidades de login">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Funcionalidades Planejadas</h2>
        <p className="text-gray-600 mb-4">
          Ao fazer login, você terá acesso a recursos personalizados:
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Salvar suas preferências de acessibilidade na nuvem</li>
          <li>Sincronizar configurações entre dispositivos</li>
          <li>Histórico de consultas salvo automaticamente</li>
          <li>Etiquetas favoritas salvas na conta</li>
          <li>Configurações de notificação personalizadas</li>
        </ul>
      </section>
    </div>
  )
}