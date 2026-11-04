const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let frontendProcess = null;
let backendProcess = null;
let serverCheckInterval = null;

// Função para verificar se um servidor está respondendo
function isServerRunning(port, host = 'localhost') {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'ok');
        } catch {
          resolve(res.statusCode === 200);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Função para esperar servidor com retry
async function waitForServer(port, maxAttempts = 15, delay = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`🔍 Tentativa ${i + 1}/${maxAttempts} - Verificando servidor na porta ${port}...`);
    const isRunning = await isServerRunning(port);
    if (isRunning) {
      console.log(`✅ Servidor na porta ${port} está respondendo!`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  console.log(`❌ Servidor na porta ${port} não respondeu após ${maxAttempts} tentativas`);
  return false;
}

function createWindow() {
  console.log('🚀 BulaClara Desktop iniciando...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: true,
    title: 'BulaClara Desktop',
    backgroundColor: '#ffffff'
  });

  if (app.isPackaged) {
    console.log('📦 Modo produção detectado');
    
    // Inicia servidores e depois carrega a URL
    startServersAndLoad();
  } else {
    console.log('🔧 Modo desenvolvimento');
    console.log('🌐 Carregando http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    
    // No desenvolvimento, também verificamos se está rodando
    setTimeout(() => checkFrontendHealth(), 3000);
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log(`⚠️ Falha ao carregar: ${errorCode} - ${errorDescription}`);
    console.log(`📄 URL tentada: ${validatedURL}`);
    
    // Se falhou no modo produção, mostra fallback com instruções específicas
    if (app.isPackaged) {
      setTimeout(() => {
        loadFallbackPage(`Falha ao carregar ${validatedURL}<br>Tente recarregar ou verifique os servidores.`);
      }, 1000);
    } else {
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 2000);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Página carregada com sucesso');
    
    // Adiciona título dinâmico
    mainWindow.webContents.executeJavaScript(`
      if (document.title === '') {
        document.title = 'BulaClara Desktop';
      }
    `);
  });

  console.log('✅ Janela criada com sucesso');

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    console.log('Janela fechada');
    mainWindow = null;
    stopServers();
    clearServerChecks();
  });

  createMenu();
}

async function startServersAndLoad() {
  console.log('⚙️ Iniciando servidores em modo produção...');
  
  // Inicia servidores
  startFrontendServer();
  startBackendServer();
  
  // Mostra status inicial
  loadInitialStatus();
  
  // Espera frontend estar pronto
  console.log('⏳ Aguardando frontend inicializar...');
  const frontendReady = await waitForServer(3000, 15, 2000);
  
  if (frontendReady) {
    console.log('🌐 Frontend pronto! Carregando http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    
    // Verifica backend também
    console.log('⏳ Verificando backend...');
    const backendReady = await waitForServer(8000, 10, 1000);
    if (backendReady) {
      console.log('✅ Ambos servidores funcionando!');
      updateStatus('all_servers_running');
    } else {
      console.log('⚠️ Backend não responde, mas frontend está rodando');
      updateStatus('frontend_only');
    }
  } else {
    console.log('❌ Frontend não iniciou corretamente');
    loadFallbackPage('Frontend não conseguiu iniciar.<br>Verifique os logs para mais detalhes.');
    updateStatus('failed');
  }
  
  // Inicia verificação periódica
  startServerHealthChecks();
}

function loadInitialStatus() {
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>BulaClara Desktop - Iniciando...</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          margin: 0;
        }
        .container {
          max-width: 600px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          font-weight: 700;
        }
        .loading {
          margin: 30px 0;
          text-align: center;
        }
        .spinner {
          display: inline-block;
          width: 60px;
          height: 60px;
          border: 6px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .status-item {
          margin: 10px 0;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          text-align: left;
          display: flex;
          align-items: center;
        }
        .status-icon {
          margin-right: 10px;
          font-size: 1.5rem;
        }
        .pending { color: #ffc107; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .logs {
          margin-top: 30px;
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 10px;
          max-height: 200px;
          overflow-y: auto;
          text-align: left;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .log-item {
          margin: 5px 0;
          color: #e6e6e6;
        }
        .log-item.success { color: #90ee90; }
        .log-item.error { color: #ff6b6b; }
        .log-item.info { color: #add8e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>BulaClara Desktop</h1>
        <p>Inicializando sistema...</p>
        
        <div class="loading">
          <div class="spinner"></div>
          <p>Por favor, aguarde...</p>
        </div>
        
        <div id="status">
          <div class="status-item">
            <span class="status-icon pending">⏳</span>
            <span>Frontend (Next.js): Iniciando...</span>
          </div>
          <div class="status-item">
            <span class="status-icon pending">⏳</span>
            <span>Backend (FastAPI): Iniciando...</span>
          </div>
          <div class="status-item">
            <span class="status-icon pending">⏳</span>
            <span>Interface: Aguardando...</span>
          </div>
        </div>
        
        <div class="logs">
          <div class="log-item info">🚀 BulaClara Desktop iniciando...</div>
          <div class="log-item info">📦 Modo produção detectado</div>
          <div class="log-item info">⚙️ Iniciando servidores...</div>
        </div>
        
        <div style="margin-top: 30px; font-size: 0.8rem; opacity: 0.7;">
          UCS - Universidade de Caxias do Sul
        </div>
      </div>
      
      <script>
        function updateStatus(component, status, message) {
          const statusItems = document.querySelectorAll('.status-item');
          const logs = document.querySelector('.logs');
          
          if (component === 'frontend') {
            statusItems[0].querySelector('.status-icon').textContent = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
            statusItems[0].querySelector('.status-icon').className = 'status-icon ' + status;
            statusItems[0].querySelector('span:last-child').textContent = 'Frontend (Next.js): ' + message;
          } else if (component === 'backend') {
            statusItems[1].querySelector('.status-icon').textContent = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
            statusItems[1].querySelector('.status-icon').className = 'status-icon ' + status;
            statusItems[1].querySelector('span:last-child').textContent = 'Backend (FastAPI): ' + message;
          } else if (component === 'interface') {
            statusItems[2].querySelector('.status-icon').textContent = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
            statusItems[2].querySelector('.status-icon').className = 'status-icon ' + status;
            statusItems[2].querySelector('span:last-child').textContent = 'Interface: ' + message;
          }
          
          if (message) {
            const logItem = document.createElement('div');
            logItem.className = 'log-item ' + status;
            logItem.textContent = new Date().toLocaleTimeString() + ' - ' + message;
            logs.appendChild(logItem);
            logs.scrollTop = logs.scrollHeight;
          }
        }
        
        // Expõe a função para o Electron chamar
        window.updateStatus = updateStatus;
      </script>
    </body>
    </html>
  `));
}

function updateStatus(type) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.executeJavaScript(`
      if (window.updateStatus) {
        if (type === 'all_servers_running') {
          window.updateStatus('frontend', 'success', 'Servidor rodando na porta 3000');
          window.updateStatus('backend', 'success', 'Servidor rodando na porta 8000');
          window.updateStatus('interface', 'success', 'Carregando interface...');
        } else if (type === 'frontend_only') {
          window.updateStatus('frontend', 'success', 'Servidor rodando na porta 3000');
          window.updateStatus('backend', 'error', 'Servidor não responde');
          window.updateStatus('interface', 'success', 'Carregando interface (sem backend)...');
        } else if (type === 'failed') {
          window.updateStatus('frontend', 'error', 'Falha ao iniciar servidor');
          window.updateStatus('backend', 'error', 'Falha ao iniciar servidor');
          window.updateStatus('interface', 'error', 'Carregando página de fallback...');
        }
      }
    `);
  }
}

function startFrontendServer() {
  if (frontendProcess) return;
  
  console.log('🔄 Iniciando servidor frontend...');
  const frontendDir = path.join(__dirname, '..', '..', 'src', 'web-app');
  
  if (!fs.existsSync(frontendDir)) {
    console.error('❌ Diretório frontend não encontrado:', frontendDir);
    return;
  }
  
  try {
    frontendProcess = spawn('npm', ['run', 'start'], {
      cwd: frontendDir,
      shell: true,
      stdio: 'pipe',
      env: { ...process.env, PORT: '3000' }
    });

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`🌐 Frontend: ${output}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`🌐 Frontend Error: ${error}`);
    });

    frontendProcess.on('close', (code) => {
      console.log(`🌐 Frontend process exited with code ${code}`);
      frontendProcess = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.executeJavaScript(`
          if (window.updateStatus) {
            window.updateStatus('frontend', 'error', 'Servidor parado (código ${code})');
          }
        `);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor frontend:', error);
  }
}

function startBackendServer() {
  if (backendProcess) return;
  
  console.log('🔄 Iniciando servidor backend...');
  const backendDir = path.join(__dirname, '..', '..', 'src');
  
  if (!fs.existsSync(backendDir)) {
    console.error('❌ Diretório backend não encontrado:', backendDir);
    return;
  }
  
  try {
    backendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: backendDir,
      shell: true,
      stdio: 'pipe'
    });

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`🐍 Backend: ${output}`);
    });

    backendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`🐍 Backend Error: ${error}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`🐍 Backend process exited with code ${code}`);
      backendProcess = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.executeJavaScript(`
          if (window.updateStatus) {
            window.updateStatus('backend', 'error', 'Servidor parado (código ${code})');
          }
        `);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor backend:', error);
  }
}

function startServerHealthChecks() {
  if (serverCheckInterval) clearInterval(serverCheckInterval);
  
  serverCheckInterval = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    const frontendAlive = await isServerRunning(3000);
    const backendAlive = await isServerRunning(8000);
    
    if (!frontendAlive && frontendProcess) {
      console.log('⚠️ Frontend não responde, tentando reiniciar...');
      startFrontendServer();
    }
    
    if (!backendAlive && backendProcess) {
      console.log('⚠️ Backend não responde, tentando reiniciar...');
      startBackendServer();
    }
  }, 10000); // Verifica a cada 10 segundos
}

function clearServerChecks() {
  if (serverCheckInterval) {
    clearInterval(serverCheckInterval);
    serverCheckInterval = null;
  }
}

function checkFrontendHealth() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  isServerRunning(3000).then(isAlive => {
    if (!isAlive) {
      mainWindow.webContents.executeJavaScript(`
        alert('⚠️ Frontend não está rodando!\\nExecute: npm run dev em src/web-app');
      `);
    }
  });
}

function stopServers() {
  console.log('🛑 Parando servidores...');
  
  if (frontendProcess) {
    console.log('🛑 Parando servidor frontend...');
    frontendProcess.kill();
    frontendProcess = null;
  }
  
  if (backendProcess) {
    console.log('🛑 Parando servidor backend...');
    backendProcess.kill();
    backendProcess = null;
  }
  
  clearServerChecks();
}

function loadFallbackPage(message = '') {
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>BulaClara Desktop - Fallback</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          margin: 0;
        }
        .container {
          max-width: 800px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          font-weight: 700;
        }
        p {
          margin: 15px 0;
          font-size: 1.2rem;
        }
        .warning {
          color: #ffc107;
          background: rgba(255, 193, 7, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin: 25px 0;
          font-size: 1.1rem;
          border-left: 4px solid #ffc107;
          text-align: left;
        }
        .code {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          margin: 15px 0;
          font-size: 0.9rem;
          text-align: left;
          white-space: pre-wrap;
        }
        .button {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          margin: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .logs {
          margin-top: 20px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          text-align: left;
          font-family: monospace;
          font-size: 0.85rem;
          max-height: 200px;
          overflow-y: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>BulaClara Desktop</h1>
        <p>Sistema de consulta de bulas de medicamentos</p>
        <p>Versão 1.0.0</p>
        <p>Grupo03 - Projeto Temático 2</p>
        
        <div class="warning">
          <strong>⚠️ Não foi possível carregar a interface completa</strong>
          ${message ? `<br><br>${message}` : ''}
        </div>
        
        <div class="code">
          Possíveis causas:<br>
          1. Servidor Next.js não iniciou corretamente<br>
          2. Dependências não instaladas<br>
          3. Portas 3000 ou 8000 estão em uso<br>
          4. Erro na configuração do projeto
        </div>
        
        <div class="code">
          Para diagnosticar:<br>
          1. Abra o console (F12)<br>
          2. Verifique os logs abaixo<br>
          3. Tente recarregar a página
        </div>
        
        <div style="margin-top: 25px;">
          <button class="button" onclick="location.reload()">🔄 Recarregar</button>
          <button class="button" onclick="window.open('http://localhost:3000')">🌐 Abrir em navegador</button>
          <button class="button" onclick="window.close()">❌ Fechar</button>
        </div>
        
        <div class="logs">
          <div>🔍 Status dos servidores:</div>
          <div>• Frontend (porta 3000): <span id="frontend-status">Verificando...</span></div>
          <div>• Backend (porta 8000): <span id="backend-status">Verificando...</span></div>
        </div>
        
        <div style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
          UCS - Universidade de Caxias do Sul
        </div>
      </div>
      
      <script>
        async function checkServer(port, elementId) {
          try {
            const response = await fetch('http://localhost:' + port + '/health', { 
              method: 'GET',
              mode: 'no-cors' 
            });
            document.getElementById(elementId).textContent = '✅ Online';
            document.getElementById(elementId).style.color = '#28a745';
          } catch {
            document.getElementById(elementId).textContent = '❌ Offline';
            document.getElementById(elementId).style.color = '#dc3545';
          }
        }
        
        // Verificar servidores
        checkServer(3000, 'frontend-status');
        checkServer(8000, 'backend-status');
      </script>
    </body>
    </html>
  `));
}

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        {
          label: 'Forçar recarregar',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
          }
        },
        { type: 'separator' },
        {
          label: 'Verificar servidores',
          click: async () => {
            if (!mainWindow) return;
            
            const frontendAlive = await isServerRunning(3000);
            const backendAlive = await isServerRunning(8000);
            
            const message = [
              frontendAlive ? '✅ Frontend rodando na porta 3000' : '❌ Frontend não responde',
              backendAlive ? '✅ Backend rodando na porta 8000' : '❌ Backend não responde'
            ].join('\n');
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Status dos servidores',
              message: message
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Sobre BulaClara',
          click: () => {
            showAboutDialog();
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Desenvolvimento',
      submenu: [
        {
          label: 'DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.openDevTools();
          }
        },
        {
          label: 'Logs de servidores',
          click: () => {
            console.log('=== LOGS DOS SERVIDORES ===');
            console.log('Frontend:', frontendProcess ? 'Rodando' : 'Parado');
            console.log('Backend:', backendProcess ? 'Rodando' : 'Parado');
            
            if (mainWindow) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Status dos processos',
                message: `Frontend: ${frontendProcess ? 'Rodando' : 'Parado'}\nBackend: ${backendProcess ? 'Rodando' : 'Parado'}`
              });
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog() {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  aboutWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: #f8f9fa;
        }
        h1 {
          color: #2563eb;
        }
        .logo {
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="logo">💊</div>
      <h1>BulaClara Desktop</h1>
      <p>Versão 1.0.0</p>
      <p>Grupo03 - Projeto Temático 2</p>
      <p>UCS - Universidade de Caxias do Sul</p>
      <p style="margin-top: 20px; font-size: 0.9rem; color: #666;">
        Sistema de consulta de bulas de medicamentos
      </p>
    </body>
    </html>
  `));
}

app.whenReady().then(() => {
  console.log('⚡ App ready - inicializando...');
  createWindow();
});

app.on('window-all-closed', () => {
  stopServers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServers();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado:', error);
});
