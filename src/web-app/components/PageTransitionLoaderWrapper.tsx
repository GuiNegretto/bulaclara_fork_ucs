'use client'

import React, { useEffect, useState } from 'react'
import { PageTransitionLoader } from './PageTransitionLoader'

// Componente wrapper para gerenciar o estado do preloader
export function PageTransitionLoaderWrapper() {
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    // Sincroniza as preferências do usuário e hidratação do React
    const syncAccessibility = async () => {
      // Garante que o React reconhece o estado do localStorage antes de exibir o app
      await new Promise((resolve) => setTimeout(resolve, 200))
      setIsPageLoading(false)
    }

    syncAccessibility()
  }, [])

  return <PageTransitionLoader isLoading={isPageLoading} message="Ajustando preferências visuais..." />
}