import requests
import json

base_url = 'http://localhost:8000'

print('Testando rota de medicamentos...')
payload = {'nome': 'Tylenol', 'gtin': None}

try:
    response = requests.post(base_url + '/medicamentos/consulta', json=payload, timeout=5)
    print(f'Status: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('✅ Sucesso!')
        print('Dados retornados:')
        print(f'  Nome: {data.get("nome")}')
        print(f'  GTIN: {data.get("gtin")}')
        print(f'  Laboratório: {data.get("laboratorio")}')
        print(f'  Princípios ativos: {data.get("principios_ativos")}')
        
        if data.get('bula_simplificada'):
            bula = data['bula_simplificada']
            print(f'  Tem bula_simplificada: Sim')
            print(f'  Contraindicações: {bula.get("contraindicacoes")}')
            print(f'  Forma de uso: {bula.get("forma_de_uso")}')
            print(f'  Efeitos colaterais: {bula.get("efeitos_colaterais")}')
            print(f'  Posologia: {bula.get("posologia")}')
            print(f'  Armazenamento: {bula.get("armazenamento")}')
            print(f'  Interações medicamentosas: {bula.get("interacoes_medicamentosas")}')
        else:
            print('  Tem bula_simplificada: Não')
    else:
        print(f'❌ Erro: {response.text}')
        
except requests.exceptions.ConnectionError:
    print('❌ API não está rodando na porta 8000!')
except Exception as e:
    print(f'❌ Erro: {e}')