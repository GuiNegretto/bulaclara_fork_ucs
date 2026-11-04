# BulaClara Desktop - Electron App

Aplicativo desktop para consulta de bulas de medicamentos desenvolvido com Electron, FastAPI e Next.js.

## 🏗️ **Estrutura Corrigida**

Conforme confirmado pelo usuário:

- **Backend**: `/src` (FastAPI Python)
- **Frontend**: `/src/web-app` (Next.js + TypeScript)

## 📁 Estrutura do Projeto

```
Grupo03/
├── bulaclara-desktop/
│   ├── electron/                # Código do Electron (processo principal)
│   │   ├── main.js            # Processo principal do Electron
│   │   └── preload.js         # Preload script para comunicação segura
│   ├── package.json           # Dependências do Electron
│   └── README.md              # Este arquivo
├── src/                       # Backend FastAPI
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── web-app/               # Frontend Next.js
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── package.json
│   └── main.py                # Entry point do backend
└── docs/                      # Documentação
```

## 🚀 Como Executar

### Pré-requisitos

1. **Node.js 18+** e **npm**
2. **Python 3.8+** e **pip**
3. **FastAPI** (`pip install fastapi uvicorn`)

### Instalação

#### 1. Instalar dependências do Electron
```bash
cd bulaclara-desktop
npm install
```

#### 2. Instalar dependências do Python (backend)
```bash
cd src
pip install -r ../requirements.txt
```

#### 3. Instalar dependências do Next.js (frontend)
```bash
cd src/web-app
npm install
```

### Executar o aplicativo

#### Opção 1: Modo desenvolvimento
```bash
cd bulaclara-desktop
npm start
```

O aplicativo irá:
1. Iniciar o servidor FastAPI na porta 8000
2. Iniciar o servidor Next.js na porta 3000
3. Abrir a janela do Electron apontando para `http://localhost:3000`

#### Opção 2: Modo produção (build)
```bash
# Build do frontend
cd src/web-app
npm run build

# Build do Electron
cd ../../bulaclara-desktop
npm run build
```

## 🔧 Configuração

### Variáveis de Ambiente

Criar arquivo `.env` em `bulaclara-desktop/`:
```env
NODE_ENV=development
ELECTRON_DEV_MODE=true
```

### Portas Utilizadas

- **Backend FastAPI**: `localhost:8000`
- **Frontend Next.js**: `localhost:3000`
- **Electron**: Janela desktop apontando para `localhost:3000`

## 📦 Empacotamento

Para criar executáveis do aplicativo:

### Windows
```bash
npm run package:win
```

### macOS
```bash
npm run package:mac
```

### Linux
```bash
npm run package:linux
```

## 🐛 Depuração

### Logs do Console
O Electron mostrará logs no console com informações sobre:
- Caminhos dos diretórios (backend e frontend)
- Status dos servidores
- Erros de inicialização

### DevTools
No modo desenvolvimento, pressione `F12` ou `Ctrl+Shift+I` para abrir as ferramentas de desenvolvedor.

## 🔄 Comunicação entre Processos

### Frontend → Backend
O frontend se comunica com o backend via HTTP:
```javascript
// Exemplo de chamada API
fetch('http://localhost:8000/api/medicamentos/buscar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ termo: 'paracetamol' })
})
```

### Renderer → Main Process
O frontend pode chamar APIs do Electron através do preload script:
```javascript
// Exemplo
const appInfo = await window.electronAPI.getAppInfo();
console.log('Informações do app:', appInfo);
```

## 🔐 Segurança

- **Context Isolation**: Habilitado para isolar código do renderer
- **Node Integration**: Desabilitado no processo do renderer
- **Content Security Policy**: Implementada no main.js

## 🤝 Contribuição

### Padrões de Código

- **Backend (Python)**: Seguir PEP 8
- **Frontend (TypeScript)**: Usar ESLint configurado
- **Electron (JavaScript)**: Seguir ESLint configurado

### Commits
- Usar [Conventional Commits](https://www.conventionalcommits.org/)
- Referenciar issues nas mensagens de commit

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](../LICENSE) para detalhes.

## 📞 Suporte

### Problemas Conhecidos
1. **Python não encontrado**: Certifique-se que Python está no PATH
2. **Portas ocupadas**: Verifique se as portas 3000 e 8000 estão livres
3. **Node modules faltando**: Execute `npm install` no diretório correto

### Logs de Debug
Se encontrar problemas, verifique:
1. Logs do console do Electron
2. Logs do backend (terminal onde o Python está rodando)
3. Logs do frontend (terminal onde o Next.js está rodando)