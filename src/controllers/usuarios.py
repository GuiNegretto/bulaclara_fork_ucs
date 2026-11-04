from fastapi import APIRouter
from ..models.schemas import (
    MedicamentoSchema,
    BulaSimplificadaSchema,
    BulaOficialSchema,
    SugestaoBuscaSchema,
)

router = APIRouter(prefix="/api/v1/usuarios", tags=["Preferências de Acessibilidade"])

# Mock local de preferências
PREFERENCIAS_MOCK = PreferenciasAcessibilidadeSchema(
    tamanhoFonte="Normal",
    modoAltoContraste=False,
    tipoDeficiencia="baixa_visao"
)

@router.get("/preferencias", response_model=PreferenciasAcessibilidadeSchema)
async def obter_preferencias():
    """RF07: Retorna os ajustes de interface do usuário."""
    return PREFERENCIAS_MOCK

@router.put("/preferencias", response_model=MensagemResposta)
async def atualizar_preferencias(novas_prefs: PreferenciasAcessibilidadeSchema):
    """RF07: Salva os ajustes visuais (tamanho de fonte e alto contraste)."""
    global PREFERENCIAS_MOCK
    PREFERENCIAS_MOCK = novas_prefs
    return MensagemResposta(mensagem="Preferências de acessibilidade atualizadas com sucesso!")