import requests
import json
import time

base_url = 'http://localhost:8000'

print('Testando API do BulaClara...')

# Primeiro testa o health check
try:
    health = requests.get(base_url + '/health', timeout=5)
    print(f'Health Check: {health.status_code}')
    if health.status_code == 200:
        print(f'Response: {health.json()}')
    else:
        print(f'Error: {health.text}')
except requests.exceptions.ConnectionError:
    print('❌ API não está rodando na porta 8000!')
    print('Execute: uvicorn src.main:app --reload --port 8000')
    exit(1)
except Exception as e:
    print(f'❌ Erro ao testar health: {e}')
    exit(1)

print('\nTestando POST /medicamentos/consulta...')
payload = {'nome': 'Tylenol', 'gtin': None}

try:
    response = requests.post(base_url + '/medicamentos/consulta', json=payload, timeout=5)
    print(f'Status: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print(f'✅ Sucesso! Medicamento: {data["nome"]}')
        print(f'GTIN: {data["gtin"]}')
        print(f'Laboratório: {data["laboratorio"]}')
    else:
        print(f'❌ Erro: {response.text}')
except requests.exceptions.ConnectionError:
    print('❌ Falha na conexão com a API')
except Exception as e:
    print(f'❌ Erro: {e}')