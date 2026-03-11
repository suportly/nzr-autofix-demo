# NZR Autofix Demo

Projeto de demonstracao dos SDKs do NZR Autofix. Inclui exemplos praticos de integracao com **React** (frontend) e **Django** (backend), com cenarios de erro que demonstram cada funcionalidade dos SDKs.

Demo project for the NZR Autofix SDKs. Includes practical integration examples with **React** (frontend) and **Django** (backend), with error scenarios demonstrating each SDK feature.

## Quick Start

### 1. Clone o repositorio

```bash
git clone https://github.com/suportly/nzr-autofix-demo.git
cd nzr-autofix-demo
```

### 2. Configure o DSN

```bash
cp .env.example .env
```

Edite `.env` com o DSN e endpoint do seu projeto NZR Autofix:

```bash
# Obtenha em: NZR Manager > Autofix > Projetos > [Seu Projeto] > DSN
NZR_AUTOFIX_DSN=nzr://seu-token@autofix/seu-projeto-id
NZR_AUTOFIX_ENDPOINT_URL=https://sua-instancia.com/api/v1/autofix/ingest/
VITE_NZR_AUTOFIX_DSN=nzr://seu-token@autofix/seu-projeto-id
VITE_NZR_AUTOFIX_ENDPOINT_URL=https://sua-instancia.com/api/v1/autofix/ingest/
```

### 3. Inicie com Docker

```bash
docker compose up
```

### 4. Abra no navegador

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

### 5. Faca login e teste

Use as credenciais:
- `admin` / `admin123`
- `dev` / `dev123`

Clique nos botoes para disparar erros e veja-os aparecerem no painel do NZR Autofix.

---

## Sem Docker (desenvolvimento local)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Cenarios de Erro

### Frontend SDK (`@nzrgroup/autofix`)

| Cenario | SDK Feature |
|---------|------------|
| Unhandled Exception | `window.onerror` (global handler) |
| Promise Rejection | `onunhandledrejection` (global handler) |
| React Render Crash | `NzrErrorBoundary` (Error Boundary) |
| Manual captureException | `useNzrAutofix()` hook |
| Manual captureMessage | `captureMessage()` |
| Breadcrumb Trail | `addBreadcrumb()` + `captureException()` |

### Backend SDK (`nzr-autofix`)

| Cenario | SDK Feature |
|---------|------------|
| ValueError, KeyError, TypeError, ZeroDivisionError | `AutofixMiddleware` (captura automatica) |
| Manual capture_exception() | `nzr_autofix.capture_exception()` |
| Manual capture_message() | `nzr_autofix.capture_message()` |

---

## Estrutura do Projeto

```
nzr-autofix-demo/
├── frontend/           # React 18 + Vite + MUI + @nzrgroup/autofix
│   └── src/
│       ├── autofix.ts          # SDK initialization
│       ├── main.tsx            # Entry point with NzrErrorBoundary
│       ├── pages/
│       │   ├── LoginPage.tsx   # Fake login
│       │   └── DashboardPage.tsx  # Error scenario cards
│       └── components/
│           ├── ErrorCard.tsx   # Reusable error trigger card
│           └── BuggyComponent.tsx # Intentional render crash
├── backend/            # Django 5 + DRF + nzr-autofix
│   └── demo/
│       ├── settings.py         # SDK init + AutofixMiddleware
│       └── views.py            # Error endpoints
└── docs/
    ├── integration-guide-pt.md # Guia completo (portugues)
    └── integration-guide-en.md # Full guide (English)
```

## Documentacao / Documentation

- [Guia de Integracao (Portugues)](docs/integration-guide-pt.md)
- [Integration Guide (English)](docs/integration-guide-en.md)

## Licenca / License

MIT
