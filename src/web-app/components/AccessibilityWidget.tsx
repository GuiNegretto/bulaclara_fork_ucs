'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  
  const {
    fontSize, setFontSize,
    contrast, setContrast,
    dyslexicFont, setDyslexicFont,
    spacing, setSpacing,
    reducedMotion, setReducedMotion,
    bigClickTargets, setBigClickTargets,
    speechRate, setSpeechRate,
    resetSettings
  } = useAccessibility()

    // Atalhos de teclado (Alt + A para abrir/fechar)
  useEffect(() => {
    // Verificar se está no browser (não durante SSR)
    if (typeof window === 'undefined') return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        const sizes = ['100', '125', '150', '200']
        const currentIndex = sizes.indexOf(fontSize)
        if (currentIndex < sizes.length - 1) setFontSize(sizes[currentIndex + 1])
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        const sizes = ['100', '125', '150', '200']
        const currentIndex = sizes.indexOf(fontSize)
        if (currentIndex > 0) setFontSize(sizes[currentIndex - 1])
      }
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        const contrasts = ['normal', 'high-dark', 'high-light', 'grayscale']
        const currentIndex = contrasts.indexOf(contrast)
        setContrast(contrasts[(currentIndex + 1) % contrasts.length])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fontSize, contrast, setFontSize, setContrast])

    // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <aside aria-label="Painel de Acessibilidade" className="a11y-widget-container" ref={panelRef}>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="a11y-panel"
        className="a11y-toggle-btn"
        title="Abrir Opções de Acessibilidade (Alt + A)"
      >
        <span aria-hidden="true">♿</span>
        <span className="sr-only">Opções de Acessibilidade</span>
      </button>

      {/* Painel de Configurações */}
      {isOpen && (
        <div id="a11y-panel" className="a11y-panel-content" role="dialog" aria-modal="true" aria-labelledby="a11y-title">
          <h2 id="a11y-title">Acessibilidade</h2>

          {/* Tamanho da Fonte */}
          <fieldset>
            <legend>Tamanho da Fonte</legend>
            <div className="btn-group">
              {['100', '125', '150', '200'].map((size) => (
                <button key={size} onClick={() => setFontSize(size)} className={fontSize === size ? 'active' : ''} aria-pressed={fontSize === size}>
                  {size}%
                </button>
              ))}
            </div>
          </fieldset>

          {/* Modo de Contraste */}
          <fieldset>
            <legend>Contraste</legend>
            <select value={contrast} onChange={(e) => setContrast(e.target.value)} aria-label="Selecione o tipo de contraste">
              <option value="normal">Padrão</option>
              <option value="high-dark">Alto Contraste (Escuro)</option>
              <option value="high-light">Alto Contraste (Claro)</option>
              <option value="grayscale">Escala de Cinza</option>
              <option value="protanopia">Filtro Protanopia</option>
              <option value="deuteranopia">Filtro Deuteranopia</option>
              <option value="tritanopia">Filtro Tritanopia</option>
            </select>
          </fieldset>

          {/* Velocidade da Voz */}
          <fieldset>
            <legend>Velocidade da Voz (TTS)</legend>
            <div className="btn-group">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button key={rate} onClick={() => setSpeechRate(rate)} className={speechRate === rate ? 'active' : ''} aria-pressed={speechRate === rate}>
                  {rate}x
                </button>
              ))}
            </div>
          </fieldset>

          {/* Opções Complementares */}
          <fieldset>
            <legend>Ajustes de Leitura e Movimento</legend>
            <label className="checkbox-label">
              <input type="checkbox" checked={dyslexicFont} onChange={(e) => setDyslexicFont(e.target.checked)} />
              Fonte para Dislexia
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={spacing} onChange={(e) => setSpacing(e.target.checked)} />
              Espaçamento de Linhas Ampliado
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
              Reduzir Animações
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={bigClickTargets} onChange={(e) => setBigClickTargets(e.target.checked)} />
              Áreas de Clique Ampliadas
            </label>
          </fieldset>

          <button onClick={resetSettings} className="a11y-reset-btn" aria-label="Restaurar todas as configurações">
            Restaurar Padrões
          </button>
        </div>
      )}
    </aside>
  )
}