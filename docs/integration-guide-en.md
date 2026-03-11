# Integration Guide — NZR Autofix SDKs

This guide explains how to integrate the NZR Autofix SDKs into your Python (Django) and JavaScript (React) projects.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Python SDK (Backend)](#python-sdk-backend)
3. [JavaScript SDK (Frontend)](#javascript-sdk-frontend)
4. [Advanced Configuration](#advanced-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### What is the DSN?

The **DSN** (Data Source Name) is the unique identifier for your project in NZR Autofix. Format:

```
nzr://TOKEN@autofix/PROJECT-ID
```

Find your DSN at: **NZR Manager > Autofix > Projects > [Your Project] > DSN**

### What is the Endpoint URL?

The **Endpoint URL** is the HTTP address where errors are sent:

```
https://your-instance.com/api/v1/autofix/ingest/
```

> **Important**: The DSN and Endpoint URL are configured separately because the DSN format (`nzr://...`) is not an HTTP URL.

### How it works

1. The SDK is initialized with DSN + Endpoint URL
2. When an error occurs, the SDK collects: stack trace, local variables, context (browser/OS/runtime)
3. Sensitive data (passwords, tokens) is automatically sanitized
4. The event is sent via HTTP POST to the ingestion endpoint
5. NZR Autofix groups duplicate errors, analyzes with AI, and suggests fixes

---

## Python SDK (Backend)

### Installation

```bash
pip install nzr-autofix
```

### Initialization

Add to your application startup (in Django, use `settings.py`):

```python
import nzr_autofix

nzr_autofix.init(
    dsn='nzr://your-token@autofix/your-project-id',
    endpoint_url='https://your-instance.com/api/v1/autofix/ingest/',
    environment='production',  # or 'staging', 'development'
    release='1.2.3',           # your application version
)
```

Or use environment variables (recommended):

```bash
# .env
NZR_AUTOFIX_DSN=nzr://your-token@autofix/your-project-id
NZR_AUTOFIX_ENDPOINT_URL=https://your-instance.com/api/v1/autofix/ingest/
NZR_AUTOFIX_ENVIRONMENT=production
```

```python
# settings.py — the SDK reads env vars automatically
import nzr_autofix
nzr_autofix.init()
```

### Django Middleware (Automatic Capture)

Add the middleware to your Django `MIDDLEWARE`:

```python
MIDDLEWARE = [
    # ... other middlewares
    'nzr_autofix.integrations.django.AutofixMiddleware',
]
```

With the middleware active, **any unhandled exception in Django views is captured automatically**. No additional code needed.

### Manual Capture

For errors you handle with try/except but still want to report:

```python
import nzr_autofix

try:
    result = risky_operation()
except Exception as exc:
    # Capture the error without crashing the view
    event_id = nzr_autofix.capture_exception(exc)
    return Response({'error': 'Something went wrong', 'event_id': event_id})
```

### Custom Messages

For alerts that aren't exceptions:

```python
import nzr_autofix

# Send a warning to NZR Autofix
nzr_autofix.capture_message(
    message='User exceeded daily API limit',
    level='warning',  # 'info', 'warning', 'error'
)
```

### Celery Integration

To capture Celery task failures:

```python
# In your Django project's __init__.py or celery.py
from nzr_autofix.integrations.django import setup_celery_hooks

setup_celery_hooks()
```

This connects to Celery's `task_failure` signal and automatically captures any failing task.

---

## JavaScript SDK (Frontend)

### Installation

```bash
npm install @nzrgroup/autofix
```

### Initialization

Create an initialization file and import it **before any other code**:

```typescript
// src/autofix.ts — MUST be the first import
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
import './autofix'  // First import!
import React from 'react'
// ... rest of your app
```

Environment variables (Vite):

```bash
# .env
VITE_NZR_AUTOFIX_DSN=nzr://your-token@autofix/your-project-id
VITE_NZR_AUTOFIX_ENDPOINT_URL=https://your-instance.com/api/v1/autofix/ingest/
```

### Automatic Capture (Global Handlers)

After `init()`, the SDK automatically installs:

- **`window.onerror`** — captures unhandled exceptions
- **`window.onunhandledrejection`** — captures unhandled promise rejections

No additional code needed. Any unhandled `throw` or `Promise.reject()` is captured.

### React Error Boundary

Wrap components with `NzrErrorBoundary` to capture render errors:

```tsx
import { NzrErrorBoundary } from '@nzrgroup/autofix/react'

function App() {
  return (
    <NzrErrorBoundary
      fallback={<div>Something went wrong. The error was reported.</div>}
    >
      <MyComponent />
    </NzrErrorBoundary>
  )
}
```

The `fallback` can be a ReactNode or a function that receives the error:

```tsx
<NzrErrorBoundary
  fallback={(error) => <ErrorPage message={error.message} />}
>
  <MyComponent />
</NzrErrorBoundary>
```

### useNzrAutofix Hook

For manual capture inside React components:

```tsx
import { useNzrAutofix } from '@nzrgroup/autofix/react'

function MyComponent() {
  const { captureException, captureMessage, addBreadcrumb } = useNzrAutofix()

  const handleClick = () => {
    try {
      riskyOperation()
    } catch (err) {
      captureException(err as Error)
    }
  }

  return <button onClick={handleClick}>Execute</button>
}
```

### Breadcrumbs

Breadcrumbs record user actions before an error, helping understand what led to the bug:

```typescript
import { addBreadcrumb, captureException } from '@nzrgroup/autofix'

// Record user actions
addBreadcrumb({ category: 'ui', message: 'Clicked Save button', level: 'info' })
addBreadcrumb({ category: 'api', message: 'Called POST /api/save', level: 'info' })
addBreadcrumb({ category: 'ui', message: 'Form validated', level: 'info' })

// When the error occurs, breadcrumbs are sent along:
captureException(new Error('Failed to save'))
```

### Manual Capture (without React)

Outside React components, use the functions directly:

```typescript
import { captureException, captureMessage } from '@nzrgroup/autofix'

// Capture an exception
try {
  JSON.parse('invalid json')
} catch (err) {
  captureException(err as Error)
}

// Send a message
captureMessage('Rate limit reached', 'warning')
```

---

## Advanced Configuration

### Data Sanitization

The SDKs automatically filter sensitive data using regex patterns. Fields whose keys contain these words are replaced with `[FILTERED]`:

- password, secret, token, api_key, authorization
- session, cookie, credit_card, private_key, access_key

To add custom patterns:

```python
# Python
nzr_autofix.init(
    dsn='...',
    sanitize_patterns=['ssn', 'social_security', 'credit_card'],
)
```

```typescript
// JavaScript
init({
  dsn: '...',
  sanitizePatterns: [/ssn/i, /social_security/i],
})
```

### beforeSend Hook

Filter or modify events before sending:

```python
# Python
def before_send(event):
    # Ignore errors from a specific module
    if 'legacy_module' in str(event.get('exception', {}).get('frames', [])):
        return None  # None = don't send
    return event

nzr_autofix.init(dsn='...', before_send=before_send)
```

```typescript
// JavaScript
init({
  dsn: '...',
  beforeSend: (event) => {
    // Ignore errors in development
    if (window.location.hostname === 'localhost') {
      return null
    }
    return event
  },
})
```

### Sample Rate

Reduce the volume of events sent:

```typescript
init({
  dsn: '...',
  sampleRate: 0.5,  // Send only 50% of events
})
```

---

## Troubleshooting

### Errors don't appear in NZR Manager

1. **Check the DSN**: Confirm `NZR_AUTOFIX_DSN` is set correctly
2. **Check the Endpoint URL**: `NZR_AUTOFIX_ENDPOINT_URL` must point to the ingestion endpoint
3. **Enable debug mode**: Add `debug: true` (JS) or `NZR_AUTOFIX_DEBUG=1` (Python) to see console logs
4. **CORS**: If the frontend sends directly to the NZR backend, the server must allow the origin domain

### "DSN not configured" error

The SDK enters no-op mode (does nothing) when the DSN is empty. Check:
- `.env` was copied from `.env.example`
- Variables have the correct prefix (`VITE_` for Vite)
- The server was restarted after changing `.env`

### Sensitive data appearing

Add the missing patterns to `sanitize_patterns`. Sanitization is performed client-side before sending.
