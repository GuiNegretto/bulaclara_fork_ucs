from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    MedicamentoSchema,
    BulaSimplificadaSchema,
    BulaOficialSchema,
    SugestaoBuscaSchema,
    CriarEtiquetaRequest,
    EtiquetaResponse,
)

import uuid

router = APIRouter(prefix="/api/v1/etiquetas", tags=["Etiquetas para Impressão"])

@router.post("/gerar", response_model=EtiquetaResponse)
async def gerar_etiqueta_pdf(dados: CriarEtiquetaRequest):
    """RF06: Recebe as informações de posologia e gera a etiqueta PDF pronta em 10x5 cm."""
    if not dados.horariosUso:
        raise HTTPException(status_code=400, detail="É necessário informar ao menos um horário de uso.")
    
    id_gerado = str(uuid.uuid4())[:8]
    
    return EtiquetaResponse(
        idEtiqueta=f"ETQ-{id_gerado}",
        gtinMedicamento=dados.gtinMedicamento,
        nomeMedicamento="Tylenol 750mg (Exemplo)",
        dosagem=dados.dosagem,
        horariosUso=dados.horariosUso,
        observacoes=dados.observacoes,
        larguraCm=10.0,
        alturaCm=5.0,
        downloadPdfUrl=f"/api/v1/etiquetas/download/ETQ-{id_gerado}.pdf"
    )