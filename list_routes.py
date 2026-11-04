import sys
import os
sys.path.append('src')

from main import app

print("=== Rotas disponíveis no FastAPI ===")
for route in app.routes:
    path = route.path
    methods = ", ".join(route.methods) if hasattr(route, 'methods') else "N/A"
    print(f"  {path} [{methods}]")

print("\n=== Testando se /medicamentos está no path ===")
medicamentos_routes = [r for r in app.routes if '/medicamentos' in r.path]
if medicamentos_routes:
    for route in medicamentos_routes:
        print(f"✓ {route.path}")
else:
    print("❌ Nenhuma rota com '/medicamentos' encontrada!")

print("\n=== Verificando prefixos dos routers ===")
try:
    from controllers.medicamentos import router as med_router
    print(f"✓ Router de medicamentos: prefix='{med_router.prefix}'")
    print(f"  Rotas no router:")
    for route in med_router.routes:
        print(f"    {route.path}")
except Exception as e:
    print(f"❌ Erro ao importar medicamentos router: {e}")