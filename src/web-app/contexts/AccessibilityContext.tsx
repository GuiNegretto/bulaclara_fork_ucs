'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface AccessibilityContextType {
  fontSize: string
  setFontSize: (size: string) => void
  contrast: string
  setContrast: (contrast: string) => void
  dyslexicFont: boolean
  setDyslexicFont: (enabled: boolean) => void
  spacing: boolean
  setSpacing: (enabled: boolean) => void
  reducedMotion: boolean
  setReducedMotion: (enabled: boolean) => void
  bigClickTargets: boolean
  setBigClickTargets: (enabled: boolean) => void
  speechRate: number
  setSpeechRate: (rate: number) => void
  resetSettings: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

// Helper para ler localStorage com segurança
const getLocalStorageItem = (key: string, defaultValue: string): string => {
  if (typeof window === 'undefined') return defaultValue
  return localStorage.getItem(key) || defaultValue
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados de Acessibilidade (inicializados com valores padrão)
  const [fontSize, setFontSize] = useState('100')
  const [contrast, setContrast] = useState('normal')
  const [dyslexicFont, setDyslexicFont] = useState(false)
  const [spacing, setSpacing] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [bigClickTargets, setBigClickTargets] = useState(false)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [mounted, setMounted] = useState(false)

  // Carregar valores do localStorage após montar no browser
  useEffect(() => {
    setFontSize(getLocalStorageItem('a11y_fontSize', '100'))
    setContrast(getLocalStorageItem('a11y_contrast', 'normal'))
    setDyslexicFont(getLocalStorageItem('a11y_dyslexic', 'false') === 'true')
    setSpacing(getLocalStorageItem('a11y_spacing', 'false') === 'true')
    setReducedMotion(getLocalStorageItem('a11y_motion', 'false') === 'true')
    setBigClickTargets(getLocalStorageItem('a11y_bigTargets', 'false') === 'true')
    setSpeechRate(parseFloat(getLocalStorageItem('a11y_speechRate', '1.0')))
    setMounted(true)
  }, [])

    // Aplicação das variáveis no elemento HTML raiz
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement

    // Tamanho da fonte - usando data-attribute para CSS
    root.setAttribute('data-font-size', fontSize)

    // Atributos de Contraste
    root.setAttribute('data-contrast', contrast)

    // Classe para Fonte de Dislexia
    if (dyslexicFont) {
      root.classList.add('a11y-dyslexic')
    } else {
      root.classList.remove('a11y-dyslexic')
    }

    // Espaçamento ampliado
    if (spacing) {
      root.classList.add('a11y-expanded-spacing')
    } else {
      root.classList.remove('a11y-expanded-spacing')
    }

    // Animações reduzidas
    if (reducedMotion) {
      root.classList.add('a11y-reduce-motion')
    } else {
      root.classList.remove('a11y-reduce-motion')
    }

    // Targets de clique ampliados
    if (bigClickTargets) {
      root.classList.add('a11y-big-targets')
    } else {
      root.classList.remove('a11y-big-targets')
    }

    // Persistência local
    localStorage.setItem('a11y_fontSize', fontSize)
    localStorage.setItem('a11y_contrast', contrast)
    localStorage.setItem('a11y_dyslexic', String(dyslexicFont))
    localStorage.setItem('a11y_spacing', String(spacing))
    localStorage.setItem('a11y_motion', String(reducedMotion))
    localStorage.setItem('a11y_bigTargets', String(bigClickTargets))
    localStorage.setItem('a11y_speechRate', String(speechRate))
  }, [fontSize, contrast, dyslexicFont, spacing, reducedMotion, bigClickTargets, speechRate, mounted])

  // Reseta todas as configurações
  const resetSettings = useCallback(() => {
    setFontSize('100')
    setContrast('normal')
    setDyslexicFont(false)
    setSpacing(false)
    setReducedMotion(false)
    setBigClickTargets(false)
    setSpeechRate(1.0)
  }, [])

  return (
    <AccessibilityContext.Provider value={{
      fontSize,
      setFontSize,
      contrast,
      setContrast,
      dyslexicFont,
      setDyslexicFont,
      spacing,
      setSpacing,
      reducedMotion,
      setReducedMotion,
      bigClickTargets,
      setBigClickTargets,
      speechRate,
      setSpeechRate,
      resetSettings
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
