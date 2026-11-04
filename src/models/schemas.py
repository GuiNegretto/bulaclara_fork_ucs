from pydantic import BaseModel
from typing import List, Optional

# Modelo correspondente ao HealthResponse do api.ts
class HealthResponse(BaseModel):
    status: str
    app: str

# Modelo correspondente ao BulaSimplificada do api.ts
class BulaSimplificada(BaseModel):
    contraindicacoes: List[str]
    forma_de_uso: List[str]
    efeitos_colaterais: List[str]
    posologia: str
    armazenamento: str
    interacoes_medicamentosas: List[str]

# Modelo correspondente ao MedicamentoResult do api.ts
class MedicamentoResult(BaseModel):
    nome: str
    gtin: Optional[str] = None
    laboratorio: str
    principios_ativos: List[str]
    bula_simplificada: BulaSimplificada

# Modelo de entrada para o POST /medicamentos/consulta
class ConsultaMedicamentoRequest(BaseModel):
    nome: Optional[str] = None
    gtin: Optional[str] = None