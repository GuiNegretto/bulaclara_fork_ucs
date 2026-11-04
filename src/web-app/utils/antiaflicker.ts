// Script Antiaflicker de Acessibilidade
// Este script deve ser injetado no <head> do documento para execução síncrona
// antes do body ser renderizado, evitando FOUC (Flash of Unstyled Content)

export const antiaflickerScript = `
(function () {
  try {
    // 1. Recupera as configurações salvas no localStorage
    var savedFontSize = localStorage.getItem('a11y_fontSize') || '100';
    var savedContrast = localStorage.getItem('a11y_contrast') || 'normal';
    var isDyslexic = localStorage.getItem('a11y_dyslexic') === 'true';
    var hasSpacing = localStorage.getItem('a11y_spacing') === 'true';
    var hasReducedMotion = localStorage.getItem('a11y_motion') === 'true';
    var hasBigTargets = localStorage.getItem('a11y_bigTargets') === 'true';

    // 2. Aplica imediatamente no HTML raiz antes do render
    var root = document.documentElement;
    
    // Define tamanho da fonte
    root.setAttribute('data-font-size', savedFontSize);
    
    // Define modo de contraste
    root.setAttribute('data-contrast', savedContrast);
    
    // Ativa/desativa fonte para dislexia
    if (isDyslexic) {
      root.classList.add('a11y-dyslexic');
    }
    
    // Espaçamento ampliado
    if (hasSpacing) {
      root.classList.add('a11y-expanded-spacing');
    }
    
    // Redução de animações
    if (hasReducedMotion) {
      root.classList.add('a11y-reduce-motion');
    }
    
    // Áreas de clique ampliadas
    if (hasBigTargets) {
      root.classList.add('a11y-big-targets');
    }

    // 3. Marca como pre-inicializado para liberar a renderização
    root.classList.add('a11y-ready');
  } catch (e) {
    console.error('Erro ao pré-carregar acessibilidade:', e);
    // Mesmo com erro, marca como ready para não travar a página
    document.documentElement.classList.add('a11y-ready');
  }
})();
`

// Função para injetar o script no head (para uso em _document.tsx ou layout.tsx)
export const injectAntiaflickerScript = () => {
  return `
    <script>
      ${antiaflickerScript}
    </script>
  `
}