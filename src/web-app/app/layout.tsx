import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BulaClara - Consulta de Bulas de Medicamentos',
  description: 'Aplicativo para consulta e simplificação de bulas de medicamentos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white text-blue-600 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">BulaClara</h1>
                <span className="text-sm bg-blue-800 px-2 py-1 rounded">Desktop</span>
              </div>
              <nav className="space-x-4">
                <a href="/" className="hover:text-blue-200 transition">Buscar</a>
                <a href="/historico" className="hover:text-blue-200 transition">Histórico</a>
                <a href="/etiqueta" className="hover:text-blue-200 transition">Etiquetas</a>
                <a href="/conta" className="hover:text-blue-200 transition">Conta</a>
              </nav>
            </div>
          </header>
          
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white py-6 mt-8">
            <div className="container mx-auto text-center">
              <p className="text-sm text-gray-300">
                BulaClara Desktop - Sistema de consulta de bulas de medicamentos
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Versão Electron | Backend: FastAPI | Frontend: Next.js
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}