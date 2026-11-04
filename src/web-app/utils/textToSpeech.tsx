'use client'

import React from 'react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

// Utilitário de Text-to-Speech para leitura de bulas
export const useTextToSpeech = () => {
  const { speechRate } = useAccessibility()

  const speak = (text: string) => {
    if (!text || typeof window === 'undefined') return
    
    // Cancela qualquer leitura em andamento
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = speechRate
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
  }

  const isSpeaking = () => {
    if (typeof window === 'undefined') return false
    return window.speechSynthesis.speaking
  }

  return { speak, stop, isSpeaking }
}

// Componente de botão de leitura para ser usado em qualquer texto
interface ReadAloudButtonProps {
  text: string
  label?: string
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, label = 'Ler em voz alta' }) => {
  const { speak, stop, isSpeaking } = useTextToSpeech()
  const { speechRate } = useAccessibility()

  const handleClick = () => {
    if (isSpeaking()) {
      stop()
    } else {
      speak(text)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
      aria-label={isSpeaking() ? 'Parar leitura' : label}
      title={`Velocidade: ${speechRate}x`}
    >
      {isSpeaking() ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
          Parar
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}