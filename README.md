# template-projeto-sistemas
Deve informar:
objetivo do projeto;
tecnologia utilizada;
como instalar e executar;
estrutura das pastas;
comandos para testar;
regras gerais de entrega.

# BulaClara 💊

Aplicação web/desktop para consulta, simplificação e leitura acessível de bulas de medicamentos da ANVISA, focada no público idoso e pessoas com baixa visão.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, Next.js 16 (App Router), TypeScript, CSS Puro
- **Backend:** Python 3.10+, FastAPI, Pydantic, Uvicorn
- **Banco de Dados:** PostgreSQL (Remoto) e SQLite (Cache Local)

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Python](https://www.python.org/) (versão 3.10 ou superior)

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar o Backend (FastAPI) e o Frontend (Next.js) em ambiente de desenvolvimento.

### 1. Configurar e Rodar o Backend (FastAPI) 
Instalar as dependências do Python

# Instalar dependências
pip install -r requirements.txt

### 2. Iniciar o Servidor Backend:
Na raiz do projeto (Grupo03/), execute:

```bash
uvicorn src.main:app --reload --port 8000
```

### 3. Configurar e Rodar o Frontend (Next.js)
Em um novo terminal, navegue até a pasta web-app:
```bash
cd web-app
npm install
npm run dev
```

## O frontend estará rodando em: http://localhost:3000