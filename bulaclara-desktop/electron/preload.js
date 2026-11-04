const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Obter informações do aplicativo
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Reiniciar servidores
  restartServers: () => ipcRenderer.invoke('restart-servers'),
  
  // Logging para debug
  log: (message) => console.log('[Electron Preload]:', message)
});

// Log inicial para confirmar que o preload foi carregado
console.log('[Electron Preload]: Carregado com sucesso');