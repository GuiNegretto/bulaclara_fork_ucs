import sys
import os
sys.path.append('src')

from main import app

print("=== Rotas disponíveis no FastAPI ===")
for route in app.routes:
    try:
        if hasattr(route, 'path'):
            path = route.path
            methods = ", ".join(route.methods) if hasattr(route, 'methods') else "N/A"
            print(f"  {path} [{methods}]")
        elif hasattr(route, 'prefix'):
            print(f"  Router com prefixo: {route.prefix}")
    except Exception as e:
        print(f"  Erro ao processar rota: {e}")

print("\n=== Testando se o router de medicamentos foi incluído ===")
try:
    from controllers.medicamentos import router as med_router
    print(f"✓ Router de medicamentos encontrado")
    print(f"  Prefixo: {med_router.prefix}")
    print(f"  Tem rotas: {len(med_router.routes)}")
    
    print("\n  Rotas dentro do router de medicamentos:")
    for r in med_router.routes:
        if hasattr(r, 'path'):
            path = r.path
            full_path = f"{med_router.prefix}{path}"
            print(f"    {full_path}")
except Exception as e:
    print(f"❌ Erro ao verificar router de medicamentos: {e}")

print("\n=== Verificando como o router está incluído no app ===")
try:
    # Verifica se o router está na lista de rotas incluídas
    for i, route in enumerate(app.routes):
        if hasattr(route, 'prefix') and route.prefix == '/medicamentos':
            print(f"✓ Router de medicamentos encontrado na posição {i} com prefixo {route.prefix}")
            break
    else:
        print("❌ Router de medicamentos NÃO encontrado nas rotas incluídas!")
except Exception as e:
    print(f"❌ Erro: {e}")