from fastapi import APIRouter, HTTPException
from ..models.schemas import MedicamentoResult, BulaSimplificada, ConsultaMedicamentoRequest

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])

# Mock de dados alinhado ao tipo MedicamentoResult
MOCK_MEDICAMENTOS = {
    "7896541200031": MedicamentoResult(
        nome="Tylenol 750mg",
        gtin="7896541200031",
        laboratorio="Kenvue",
        principios_ativos=["Paracetamol"],
        bula_simplificada=BulaSimplificada(
            contraindicacoes=["Pessoas com alergia ao paracetamol", "Pacientes com doença grave no fígado"],
            forma_de_uso=["Uso oral", "Ingerir o comprimido com água"],
            efeitos_colaterais=["Raramente pode causar reações na pele", "Náuseas leves"],
            posologia="Tomar 1 comprimido de 6 em 6 horas ou de 8 em 8 horas. Não passar de 4 comprimidos por dia.",
            armazenamento="Conservar em temperatura ambiente (15°C a 30°C) e proteger da umidade.",
            interacoes_medicamentosas=["Evitar o consumo concomitante de bebidas alcoólicas."]
        )
    )
}

@router.post("/consulta", response_model=MedicamentoResult)
async def consultar_medicamento(payload: ConsultaMedicamentoRequest):
    """Atende à função consultarMedicamento do api.ts no frontend."""
    # Busca por GTIN
    if payload.gtin and payload.gtin in MOCK_MEDICAMENTOS:
        return MOCK_MEDICAMENTOS[payload.gtin]
    
    # Busca por Nome
    if payload.nome:
        termo = payload.nome.lower()
        for med in MOCK_MEDICAMENTOS.values():
            if termo in med.nome.lower() or any(termo in p.lower() for p in med.principios_ativos):
                return med

    raise HTTPException(status_code=404, detail="Medicamento não encontrado.")