# BulaClara — Arquitetura Desktop (Electron) + Prompt para o Cline (VS Code)

Versão atualizada da arquitetura do documento original, adaptada para uma **aplicação desktop empacotada em Electron**, com **PostgreSQL em servidor remoto** como banco principal e **cache local em SQLite** para uso offline.

---

## 1. Visão geral

BulaClara passa a ser um aplicativo instalável (`.exe`/`.dmg`/`.AppImage`) que roda localmente na máquina do usuário, mas continua seguindo a mesma organização MVC do documento original: View (React/Next.js), Controller (FastAPI) e Model/Service (regras de negócio, cache, integrações externas).

## 2. Diagrama geral

```
┌───────────────────────────────────────────┐        ┌────────────────────┐
│  Electron (app instalado no computador)    │        │  Servidor remoto   │
│                                             │        │                    │
│  ┌───────────────┐   HTTP localhost        │        │   PostgreSQL       │
│  │ View            │────────────┐           │        │  (dados oficiais   │
│  │ React/Next.js   │            ▼           │        │   já processados,  │
│  └───────────────┘   ┌──────────────────┐   │  HTTP  │   histórico geral) │
│                       │ Controller        │──┼──────▶│                    │
│                       │ FastAPI (local)   │   │        └────────────────────┘
│                       └──────────────────┘   │
│                                │              │
│                                ▼              │
│                       ┌──────────────────┐   │
│                       │ Model/Service     │   │
│                       │ - cache_service   │   │
│                       │ - anvisa_service  │───┼──────▶  API Bulário/ANVISA
│                       │ - ia_service      │───┼──────▶  API de IA generativa
│                       │ - ocr_service     │   │
│                       │ - etiqueta_service│   │
│                       └──────────────────┘   │
│                                │              │
│                                ▼              │
│                       ┌──────────────────┐   │
│                       │ SQLite local      │   │
│                       │ (cache offline)   │   │
│                       └──────────────────┘   │
└───────────────────────────────────────────┘
```

## 3. Stack tecnológica

| Camada | Tecnologia | Papel |
|---|---|---|
| Empacotamento desktop | Electron | Cria a janela do app e inicia o backend local como subprocesso |
| Frontend (View) | React + Next.js (export estático ou servidor local) | Telas de busca, resultado, etiqueta, histórico |
| Backend (Controller) | Python + FastAPI, rodando em `localhost` dentro do processo do Electron | Endpoints REST, validação, orquestração |
| Model / Services | Python | Regras de negócio, decisão de cache local vs. remoto |
| Banco principal | PostgreSQL (servidor remoto) | Fonte de verdade — medicamentos e bulas já processados, compartilhados entre instalações |
| Cache local | SQLite (arquivo local no computador do usuário) | Últimos medicamentos consultados naquele dispositivo, para uso offline |
| API externa | Bulário Eletrônico / CMED (ANVISA) | Fonte oficial da bula |
| IA generativa | API de LLM | Simplificação de linguagem e separação por tópicos |
| OCR / código de barras | Tesseract + leitor GTIN/EAN | Leitura da foto da caixa do medicamento |
| Geração de etiqueta | ReportLab / WeasyPrint | Etiqueta em PDF |

## 4. Estratégia de cache (2 níveis)

1. **SQLite local** — primeira consulta ao clicar em "buscar":
   - Se o medicamento já foi consultado nesse dispositivo, responde na hora, sem rede.
2. **PostgreSQL remoto** — se não houver no SQLite local:
   - Consulta o servidor remoto; se outro usuário/dispositivo já processou aquele medicamento, reaproveita o resultado sem precisar chamar ANVISA/IA de novo.
   - Resultado também é salvo no SQLite local, para consultas futuras offline.
3. **ANVISA + IA generativa** — só é chamado se não houver cache em nenhum dos dois níveis.
4. **Sincronização**: quando o app tiver conexão, os resultados novos processados localmente são enviados ao Postgres remoto (upsert), mantendo a base central atualizada.
5. **Fallback total offline**: se não houver internet e o item não estiver no SQLite local, o app avisa que não é possível concluir a consulta agora.

## 5. Estrutura de pastas

```
bulaclara-desktop/
├── electron/
│   ├── main.js              # inicia o backend FastAPI como subprocesso e abre a janela
│   └── preload.js
│
├── frontend/                 # Next.js (View)
│   ├── app/
│   │   ├── busca/
│   │   ├── resultado/
│   │   ├── etiqueta/
│   │   └── historico/        # histórico local (localStorage do navegador embutido)
│   ├── components/
│   └── services/api.ts       # chamadas HTTP para http://localhost:8000
│
├── backend/                  # FastAPI (Controller + Model)
│   ├── app/
│   │   ├── main.py
│   │   ├── controllers/
│   │   │   ├── medicamento_controller.py
│   │   │   └── etiqueta_controller.py
│   │   ├── models/            # entidades SQLAlchemy (comuns aos 2 bancos)
│   │   ├── services/
│   │   │   ├── anvisa_service.py
│   │   │   ├── ia_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── etiqueta_service.py
│   │   │   └── cache_service.py     # decide: SQLite local -> Postgres remoto -> ANVISA/IA
│   │   ├── repositories/
│   │   │   ├── local_repository.py    # acesso ao SQLite
│   │   │   └── remote_repository.py   # acesso ao Postgres remoto
│   │   ├── schemas/
│   │   └── core/                # config (URLs, chaves de API, connection strings)
│   ├── tests/
│   └── requirements.txt
│
├── package.json               # scripts do Electron
└── README.md
```

## 6. Fluxo principal — Consulta de medicamento (atualizado)

1. **View** envia nome/GTIN/foto → **Controller** (`POST /medicamentos/consulta`)
2. **Controller** aciona `MedicamentoService`
3. `cache_service` consulta o **SQLite local** primeiro
   - Se encontrado → retorna direto (rápido, offline-friendly)
4. Se não encontrado localmente, consulta o **Postgres remoto**
   - Se encontrado → salva cópia no SQLite local e retorna
5. Se não encontrado em nenhum dos dois, chama `anvisa_service` (API externa)
6. `ia_service` simplifica o texto e separa por tópicos
7. Resultado é salvo no SQLite local **e** enviado ao Postgres remoto (se houver conexão)
8. **Controller** devolve o JSON formatado → **View** exibe a bula por tópicos

## 7. Roadmap de implementação

1. **Fase 0 — Setup do monorepo:** estrutura de pastas, `package.json` do Electron, ambiente Python do backend, README
2. **Fase 1 — Esqueleto MVC:** Electron abrindo a janela e subindo o FastAPI local; rotas mockadas; telas Next.js de busca/resultado
3. **Fase 2 — Camada de dados dupla:** modelos SQLAlchemy compartilhados, `local_repository` (SQLite) e `remote_repository` (Postgres remoto), lógica de fallback no `cache_service`
4. **Fase 3 — Integração ANVISA:** `anvisa_service.py` real, testes de indisponibilidade
5. **Fase 4 — IA generativa:** `ia_service.py` abstrato + implementação concreta
6. **Fase 5 — OCR e código de barras:** upload de foto, `ocr_service.py`
7. **Fase 6 — Etiquetas em PDF:** formulário de horários, `etiqueta_service.py`
8. **Fase 7 — Sincronização e empacotamento:** job/rotina de sync SQLite → Postgres remoto quando há conexão; empacotamento final do instalador Electron (Windows/Mac/Linux)
9. **Fase 8 — Testes, acessibilidade e revisão de acoplamento**

---

## 8. Prompt pronto para colar no Cline (VS Code)

```
Você é meu assistente de desenvolvimento no Cline (VS Code) e vai me ajudar a construir o projeto "BulaClara" do zero: uma aplicação DESKTOP empacotada em Electron, seguindo rigorosamente a arquitetura MVC descrita abaixo. Trabalhe de forma incremental: implemente uma fase por vez, rode/valide antes de avançar, e me avise ao final de cada fase para eu revisar antes de continuar.

## Sobre o projeto
BulaClara ajuda pessoas com deficiência visual e cuidadores de idosos a consultarem medicamentos e receberem um resumo simplificado da bula oficial (contraindicações, forma de uso, efeitos colaterais), além de gerar etiquetas de identificação em PDF com horários de uso. A busca pode ser feita por nome, código GTIN/EAN ou foto da caixa do medicamento. É um APLICATIVO DESKTOP instalável, não uma aplicação web hospedada.

## Stack obrigatória
- Empacotamento: Electron (o processo principal inicia o backend Python como subprocesso local e abre a janela apontando para o frontend)
- Frontend: React + Next.js (TypeScript), rodando dentro do Electron, se comunicando com o backend via HTTP em `http://localhost:<porta>`
- Backend: Python + FastAPI, rodando localmente como subprocesso do Electron
- Banco de dados: arquitetura de DOIS níveis
  1. SQLite local (arquivo no computador do usuário) como cache rápido e para uso offline
  2. PostgreSQL em servidor remoto como banco principal/central, compartilhado entre instalações
- ORM: SQLAlchemy + Alembic (compartilhado entre os dois bancos, mudando só a connection string)
- Validação: Pydantic
- IA generativa: integração via API de LLM, abstraída em um serviço único e configurável por variável de ambiente
- OCR: Tesseract (pytesseract) + leitura de código de barras (ex.: pyzbar)
- Geração de PDF: ReportLab ou WeasyPrint

## Regras arquiteturais (MVC) — NÃO PODEM SER VIOLADAS
1. **View (frontend/Next.js):** só apresentação e captura de entrada. Nunca acessa banco de dados ou APIs externas diretamente — sempre via `services/api.ts` chamando o backend local.
2. **Controller (routers do FastAPI):** recebe a requisição, valida entrada com Pydantic, chama o Service correspondente, formata a resposta. Sem lógica de negócio.
3. **Model/Service:** concentra a regra de negócio: decisão de cache (SQLite local → Postgres remoto → ANVISA/IA), processamento da bula, OCR, geração de etiqueta.
4. **Repository:** duas implementações separadas — `local_repository.py` (SQLite) e `remote_repository.py` (Postgres remoto) — usadas pelo `cache_service`, que decide a ordem de consulta e faz o fallback entre elas.
5. Integrações externas (ANVISA/CMED e IA generativa) ficam isoladas em serviços dedicados, substituíveis sem impactar Controller ou View.
6. O histórico de buscas do usuário continua no localStorage do frontend (não requer tabela própria).

## Estratégia de cache em 2 níveis (importante)
Ao consultar um medicamento, a ordem de busca deve ser:
1. SQLite local (rápido, funciona offline)
2. Se não encontrado, PostgreSQL remoto (reaproveita processamento feito por outras instalações)
3. Se não encontrado em nenhum dos dois, chamar ANVISA (`anvisa_service`) e depois IA generativa (`ia_service`) para gerar o resultado
4. Salvar o resultado novo no SQLite local IMEDIATAMENTE
5. Tentar enviar (upsert) o resultado ao PostgreSQL remoto; se falhar por falta de conexão, marcar como "pendente de sincronização" para tentar depois
6. Se estiver totalmente offline e o item não existir no SQLite local, retornar um erro claro avisando que é necessário conexão para essa consulta

## Estrutura de pastas a seguir
bulaclara-desktop/
├── electron/
│   ├── main.js
│   └── preload.js
├── frontend/
│   ├── app/
│   │   ├── busca/
│   │   ├── resultado/
│   │   ├── etiqueta/
│   │   └── historico/
│   ├── components/
│   └── services/api.ts
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── anvisa_service.py
│   │   │   ├── ia_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── etiqueta_service.py
│   │   │   └── cache_service.py
│   │   ├── repositories/
│   │   │   ├── local_repository.py
│   │   │   └── remote_repository.py
│   │   ├── schemas/
│   │   └── core/
│   ├── tests/
│   └── requirements.txt
├── package.json
└── README.md

## Como quero que você trabalhe
Implemente nesta ordem, uma fase por vez, e pare ao final de cada uma para eu revisar antes de continuar:

1. **Fase 0 — Setup do monorepo:** estrutura de pastas acima, `package.json` do Electron, ambiente virtual Python do backend, README com instruções de execução local (dev e produção).
2. **Fase 1 — Esqueleto MVC + Electron:** `electron/main.js` iniciando o FastAPI local como subprocesso e abrindo a janela; rotas FastAPI mockadas; telas Next.js de busca e resultado consumindo a API mockada.
3. **Fase 2 — Camada de dados dupla:** modelos SQLAlchemy compartilhados, `local_repository.py` (SQLite), `remote_repository.py` (Postgres remoto via variável de ambiente com a connection string), e o `cache_service.py` implementando a ordem de busca descrita acima (com testes simulando ausência de conexão).
4. **Fase 3 — Integração ANVISA:** implementar `anvisa_service.py` (pesquisar a API pública do Bulário Eletrônico/dados abertos ANVISA), com tratamento de indisponibilidade.
5. **Fase 4 — IA generativa:** implementar `ia_service.py` de forma abstrata (interface + implementação concreta), prompt que recebe o texto bruto da bula e retorna JSON estruturado por tópicos.
6. **Fase 5 — OCR e código de barras:** endpoint de upload de imagem, `ocr_service.py` usando Tesseract + leitor de GTIN.
7. **Fase 6 — Etiquetas em PDF:** formulário de horários de uso na View, `etiqueta_service.py` gerando PDF para download.
8. **Fase 7 — Sincronização e empacotamento:** rotina de sincronização dos itens "pendentes" do SQLite para o Postgres remoto quando há conexão; configuração do `electron-builder` para gerar instaladores Windows/Mac/Linux.
9. **Fase 8 — Histórico local, acessibilidade e testes finais:** histórico via localStorage, revisão de acessibilidade (ARIA, contraste, leitor de tela), testes unitários dos services (mockando APIs externas) e revisão final de acoplamento entre camadas.

## Antes de começar
Antes de escrever qualquer código, me apresente um plano curto confirmando seu entendimento da Fase 0 e pergunte se pode prosseguir. A cada fase concluída, rode os testes/build disponíveis e me dê um resumo do que foi feito e do que falta.
```

---

### Observações
- A connection string do Postgres remoto e as chaves de API (ANVISA se precisar de credencial, IA generativa) devem ficar em variáveis de ambiente, nunca hardcoded — o Cline não deve embutir segredos no código.
- Para o instalador final (Windows/Mac/Linux), recomenda-se usar `electron-builder`, que o Cline pode configurar na Fase 7.
