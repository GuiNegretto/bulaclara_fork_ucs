/**
 * API Service para integração com o backend FastAPI
 * Centraliza todas as chamadas HTTP da aplicação
 */

const API_BASE_URL = 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = response.ok ? await response.json() : null

    return {
      data: data as T,
      error: !response.ok ? `Erro ${response.status}: ${response.statusText}` : undefined,
      status: response.status,
    }
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Erro de conexão com o servidor',
      status: 0,
    }
  }
}

// Medicamentos API
export const medicamentosApi = {
  async consultar(termo: string, gtin?: string) {
    return apiFetch<MedicamentoResult>('/medicamentos/consulta', {
      method: 'POST',
      body: JSON.stringify({ nome: termo, gtin: gtin || null }),
    })
  },

  async buscarPorGtin(gtin: string) {
    return apiFetch<MedicamentoResult>('/medicamentos/consulta', {
      method: 'POST',
      body: JSON.stringify({ nome: null, gtin }),
    })
  }
}

// Etiquetas API
export const etiquetasApi = {
  async gerar(dados: EtiquetaRequest) {
    return apiFetch<EtiquetaResponse>('/api/v1/etiquetas/gerar', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  }
}

// Usuários API
export const usuariosApi = {
  async obterPreferencias() {
    return apiFetch<PreferenciasAcessibilidadeSchema>('/api/v1/usuarios/preferencias')
  },

  async atualizarPreferencias(prefs: PreferenciasAcessibilidadeSchema) {
    return apiFetch<MensagemResposta>('/api/v1/usuarios/preferencias', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    })
  }
}

// Health Check
export const healthApi = {
  async check() {
    return apiFetch<HealthResponse>('/health')
  }
}

// Tipos (importados do backend)
interface MedicamentoResult {
  nome: string
  gtin: string
  laboratorio: string
  principios_ativos: string[]
  bula_simplificada: BulaSimplificada
}

interface BulaSimplificada {
  contraindicacoes: string[]
  forma_de_uso: string[]
  efeitos_colaterais: string[]
  posologia: string
  armazenamento: string
  interacoes_medicamentosas: string[]
}

interface EtiquetaRequest {
  gtinMedicamento: string
  dosagem: string
  horariosUso: string[]
  observacoes?: string
}

interface EtiquetaResponse {
  idEtiqueta: string
  gtinMedicamento: string
  nomeMedicamento: string
  dosagem: string
  horariosUso: string[]
  observacoes?: string
  larguraCm: number
  alturaCm: number
  downloadPdfUrl: string
}

interface PreferenciasAcessibilidadeSchema {
  tamanhoFonte: string
  modoAltoContraste: boolean
  tipoDeficiencia: string
}

interface MensagemResposta {
  mensagem: string
}

interface HealthResponse {
  status: string
  app: string
}

// Função de utilidade para tratamento de erros em componentes
export function handleApiError(error: unknown, setError?: (msg: string) => void): string {
  let errorMessage = 'Erro desconhecido'
  
  if (typeof error === 'string') {
    errorMessage = error
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (error && typeof error === 'object' && 'error' in error) {
    errorMessage = String((error as any).error)
  }

  const userMessage = errorMessage.includes('Failed to fetch') || errorMessage.includes('ECONNREFUSED')
    ? 'Servidor não disponível. Verifique se o backend está rodando.'
    : errorMessage

  if (setError) {
    setError(userMessage)
  }

  console.error('Erro da API:', errorMessage)
  return userMessage
}