# Guia de Integracao — NZR Autofix SDKs

Este guia explica como integrar os SDKs do NZR Autofix em seus projetos Python (Django) e JavaScript (React).

## Sumario

1. [Conceitos Basicos](#conceitos-basicos)
2. [SDK Python (Backend)](#sdk-python-backend)
3. [SDK JavaScript (Frontend)](#sdk-javascript-frontend)
4. [Configuracao Avancada](#configuracao-avancada)
5. [Troubleshooting](#troubleshooting)

---

## Conceitos Basicos

### O que e o DSN?

O **DSN** (Data Source Name) e o identificador unico do seu projeto no NZR Autofix. Ele tem o formato:

```
nzr://TOKEN@autofix/PROJECT-ID
```

Voce encontra o DSN em: **NZR Manager > Autofix > Projetos > [Seu Projeto] > DSN**

### O que e o Endpoint URL?

O **Endpoint URL** e o endereco HTTP para onde os erros sao enviados:

```
https://sua-instancia.com/api/v1/autofix/ingest/
```

> **Importante**: O DSN e o Endpoint URL sao configurados separadamente porque o formato do DSN (`nzr://...`) nao e uma URL HTTP.

### Como funciona?

1. O SDK e inicializado com DSN + Endpoint URL
2. Quando um erro ocorre, o SDK coleta: stack trace, variaveis locais, contexto (browser/OS/runtime)
3. Dados sensiveis (senhas, tokens) sao sanitizados automaticamente
4. O evento e enviado via HTTP POST ao endpoint de ingestao
5. O NZR Autofix agrupa erros duplicados, analisa com IA e sugere correcoes

---

## SDK Python (Backend)

### Instalacao

```bash
pip install nzr-autofix
```

### Inicializacao

Adicione ao inicio da sua aplicacao (em Django, no `settings.py`):

```python
import nzr_autofix

nzr_autofix.init(
    dsn='nzr://seu-token@autofix/seu-projeto-id',
    endpoint_url='https://sua-instancia.com/api/v1/autofix/ingest/',
    environment='production',  # ou 'staging', 'development'
    release='1.2.3',           # versao da sua aplicacao
)
```

Ou use variaveis de ambiente (recomendado):

```bash
# .env
NZR_AUTOFIX_DSN=nzr://seu-token@autofix/seu-projeto-id
NZR_AUTOFIX_ENDPOINT_URL=https://sua-instancia.com/api/v1/autofix/ingest/
NZR_AUTOFIX_ENVIRONMENT=production
```

```python
# settings.py — o SDK le as variaveis automaticamente
import nzr_autofix
nzr_autofix.init()
```

### Django Middleware (Captura Automatica)

Adicione o middleware ao `MIDDLEWARE` do Django:

```python
MIDDLEWARE = [
    # ... outros middlewares
    'nzr_autofix.integrations.django.AutofixMiddleware',
]
```

Com o middleware ativo, **qualquer excecao nao tratada em views Django e capturada automaticamente**. Nenhum codigo adicional necessario.

### Captura Manual

Para erros que voce trata com try/except mas quer reportar:

```python
import nzr_autofix

try:
    resultado = operacao_arriscada()
except Exception as exc:
    # Captura o erro sem crashar a view
    event_id = nzr_autofix.capture_exception(exc)
    return Response({'error': 'Algo deu errado', 'event_id': event_id})
```

### Mensagens Customizadas

Para alertas que nao sao excecoes:

```python
import nzr_autofix

# Enviar um aviso ao NZR Autofix
nzr_autofix.capture_message(
    message='Usuario excedeu limite diario de API',
    level='warning',  # 'info', 'warning', 'error'
)
```

### Integracao Celery

Para capturar falhas em tasks Celery:

```python
# No __init__.py do seu projeto Django ou no celery.py
from nzr_autofix.integrations.django import setup_celery_hooks

setup_celery_hooks()
```

Isso conecta ao sinal `task_failure` do Celery e captura automaticamente qualquer task que falhar.

---

## SDK JavaScript (Frontend)

### Instalacao

```bash
npm install @nzrgroup/autofix
```

### Inicializacao

Crie um arquivo de inicializacao e importe-o **antes de qualquer outro codigo**:

```typescript
// src/autofix.ts — DEVE ser o primeiro import
import { init } from '@nzrgroup/autofix'

init({
  dsn: import.meta.env.VITE_NZR_AUTOFIX_DSN,
  endpointUrl: import.meta.env.VITE_NZR_AUTOFIX_ENDPOINT_URL,
  environment: 'production',
  release: '1.0.0',
})
```

```typescript
// src/main.tsx
import './autofix'  // Primeiro import!
import React from 'react'
// ... resto do app
```

Variaveis de ambiente (Vite):

```bash
# .env
VITE_NZR_AUTOFIX_DSN=nzr://seu-token@autofix/seu-projeto-id
VITE_NZR_AUTOFIX_ENDPOINT_URL=https://sua-instancia.com/api/v1/autofix/ingest/
```

### Captura Automatica (Global Handlers)

Apos `init()`, o SDK instala automaticamente:

- **`window.onerror`** — captura excecoes nao tratadas
- **`window.onunhandledrejection`** — captura promises rejeitadas sem `.catch()`

Nenhum codigo adicional necessario. Qualquer `throw` ou `Promise.reject()` nao tratado e capturado.

### React Error Boundary

Envolva componentes com `NzrErrorBoundary` para capturar erros de renderizacao:

```tsx
import { NzrErrorBoundary } from '@nzrgroup/autofix/react'

function App() {
  return (
    <NzrErrorBoundary
      fallback={<div>Algo deu errado. O erro foi reportado.</div>}
    >
      <MeuComponente />
    </NzrErrorBoundary>
  )
}
```

O `fallback` pode ser um ReactNode ou uma funcao que recebe o erro:

```tsx
<NzrErrorBoundary
  fallback={(error) => <ErrorPage message={error.message} />}
>
  <MeuComponente />
</NzrErrorBoundary>
```

### Hook useNzrAutofix

Para captura manual dentro de componentes React:

```tsx
import { useNzrAutofix } from '@nzrgroup/autofix/react'

function MeuComponente() {
  const { captureException, captureMessage, addBreadcrumb } = useNzrAutofix()

  const handleClick = () => {
    try {
      operacaoArriscada()
    } catch (err) {
      captureException(err as Error)
    }
  }

  return <button onClick={handleClick}>Executar</button>
}
```

### Breadcrumbs

Breadcrumbs registram acoes do usuario antes de um erro, ajudando a entender o que levou ao bug:

```typescript
import { addBreadcrumb, captureException } from '@nzrgroup/autofix'

// Registrar acoes do usuario
addBreadcrumb({ category: 'ui', message: 'Clicou no botao Salvar', level: 'info' })
addBreadcrumb({ category: 'api', message: 'Chamou POST /api/save', level: 'info' })
addBreadcrumb({ category: 'ui', message: 'Formulario validado', level: 'info' })

// Quando o erro ocorrer, os breadcrumbs sao enviados junto:
captureException(new Error('Falha ao salvar'))
```

### Captura Manual (sem React)

Fora de componentes React, use as funcoes diretamente:

```typescript
import { captureException, captureMessage } from '@nzrgroup/autofix'

// Capturar uma excecao
try {
  JSON.parse('json invalido')
} catch (err) {
  captureException(err as Error)
}

// Enviar uma mensagem
captureMessage('Limite de requisicoes atingido', 'warning')
```

---

## Configuracao Avancada

### Sanitizacao de Dados

Os SDKs filtram automaticamente dados sensiveis usando padroes regex. Campos cujas chaves contenham essas palavras sao substituidos por `[FILTERED]`:

- password, secret, token, api_key, authorization
- session, cookie, credit_card, private_key, access_key

Para adicionar padroes customizados:

```python
# Python
nzr_autofix.init(
    dsn='...',
    sanitize_patterns=['cpf', 'rg', 'cartao'],
)
```

```typescript
// JavaScript
init({
  dsn: '...',
  sanitizePatterns: [/cpf/i, /rg/i, /cartao/i],
})
```

### Hook beforeSend

Filtre ou modifique eventos antes do envio:

```python
# Python
def before_send(event):
    # Ignorar erros de um modulo especifico
    if 'legacy_module' in str(event.get('exception', {}).get('frames', [])):
        return None  # None = nao enviar
    return event

nzr_autofix.init(dsn='...', before_send=before_send)
```

```typescript
// JavaScript
init({
  dsn: '...',
  beforeSend: (event) => {
    // Ignorar erros em desenvolvimento
    if (window.location.hostname === 'localhost') {
      return null
    }
    return event
  },
})
```

### Sample Rate

Reduza o volume de eventos enviados:

```typescript
init({
  dsn: '...',
  sampleRate: 0.5,  // Envia apenas 50% dos eventos
})
```

---

## Troubleshooting

### Erros nao aparecem no NZR Manager

1. **Verifique o DSN**: Confirme que `NZR_AUTOFIX_DSN` esta configurado corretamente
2. **Verifique o Endpoint URL**: `NZR_AUTOFIX_ENDPOINT_URL` deve apontar para o endpoint de ingestao
3. **Ative debug**: Adicione `debug: true` (JS) ou `NZR_AUTOFIX_DEBUG=1` (Python) para ver logs no console
4. **CORS**: Se o frontend envia direto ao backend NZR, o servidor deve permitir o dominio de origem

### Erro "DSN not configured"

O SDK entra em modo no-op (nao faz nada) quando o DSN esta vazio. Verifique:
- `.env` foi copiado de `.env.example`
- As variaveis tem o prefixo correto (`VITE_` para Vite)
- O servidor foi reiniciado apos alterar `.env`

### Dados sensiveis aparecendo

Adicione os padroes faltantes em `sanitize_patterns`. A sanitizacao e feita no lado do cliente antes do envio.
