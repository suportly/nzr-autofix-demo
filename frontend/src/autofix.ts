/**
 * NZR Autofix SDK Initialization
 *
 * This file MUST be imported before any other code in main.tsx.
 * It initializes the SDK which:
 *   1. Installs global error handlers (window.onerror, unhandledrejection)
 *   2. Makes captureException() and captureMessage() available
 *   3. Enables the React ErrorBoundary and useNzrAutofix() hook
 *
 * Configuration is read from Vite environment variables:
 *   VITE_NZR_AUTOFIX_DSN          — Your project's Data Source Name
 *   VITE_NZR_AUTOFIX_ENDPOINT_URL — The ingest API endpoint
 *   VITE_NZR_AUTOFIX_ENVIRONMENT  — e.g. 'production', 'demo'
 */
import { init } from '@nzrgroup/autofix'

init({
  // DSN identifies your project. Get it from NZR Manager > Autofix > Projects.
  dsn: import.meta.env.VITE_NZR_AUTOFIX_DSN,

  // The HTTP endpoint where error events are sent.
  // Must be set separately because the DSN format (nzr://...) is not a URL.
  endpointUrl: import.meta.env.VITE_NZR_AUTOFIX_ENDPOINT_URL,

  // Environment tag — helps filter errors by deployment context.
  environment: import.meta.env.VITE_NZR_AUTOFIX_ENVIRONMENT || 'demo',

  // Release version — helps track which version introduced a bug.
  release: '1.0.0-demo',

  // Enable debug logging to console (disable in production).
  debug: true,
})
