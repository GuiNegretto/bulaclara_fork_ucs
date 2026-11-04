'use client'

import React, { useEffect, useState } from 'react'

interface PageTransitionLoaderProps {
  isLoading: boolean
  message?: string
}

export const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = ({ 
  isLoading, 
  message = "Carregando acessibilidade e conteúdos..." 
}) => {
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    // Garante que o corpo já possui a marcação do script do head
    document.documentElement.classList.add('a11y-ready')

    if (!isLoading) {
      const timer = setTimeout(() => setMounted(false), 300) // tempo para o fade-out
      return () => clearTimeout(timer)
    } else {
      setMounted(true)
    }
  }, [isLoading])

  if (!mounted && !isLoading) return null

  return (
    <div 
      className={`page-loader-overlay ${!isLoading ? 'hidden' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      aria-label={message}
    >
      <div className="loader-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loader-spinner-loop" aria-hidden="true"></div>
        <span className="loader-brand-icon" aria-hidden="true">BC</span>
      </div>
      
      {/* Mensagem visível e ajustada pela fonte do usuário */}
      <p style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '1.1em' }}>
        {message}
      </p>

      {/* Texto exclusivo para Leitores de Tela */}
      <span className="sr-only">
        {isLoading ? "Aguarde, a página está aplicando suas preferências de acessibilidade." : "Página carregada."}
      </span>
    </div>
  )
}