import { useState } from 'react'
import { Typography, Grid, Box, Alert, Divider } from '@mui/material'
import { NzrErrorBoundary } from '@nzrgroup/autofix/react'
import { useNzrAutofix } from '@nzrgroup/autofix/react'
import { captureException, captureMessage, addBreadcrumb } from '@nzrgroup/autofix'
import Layout from '../components/Layout'
import ErrorCard from '../components/ErrorCard'
import BuggyComponent from '../components/BuggyComponent'
import { apiClient } from '../api/client'

export default function DashboardPage() {
  const [showBuggy, setShowBuggy] = useState(false)
  const { captureException: hookCapture, captureMessage: hookMessage, addBreadcrumb: hookBreadcrumb } = useNzrAutofix()

  // =====================================================
  // Frontend Error Scenarios
  // =====================================================

  const frontendScenarios = [
    {
      title: 'Unhandled Exception',
      description: 'Throws an error outside try/catch. The global window.onerror handler (installed by the SDK) captures it automatically.',
      sdkFeature: 'Global Handlers (window.onerror)',
      codeSnippet: `// The SDK installs window.onerror automatically.
// Any unhandled throw is captured.
throw new Error('Unhandled demo error')`,
      onTrigger: () => {
        setTimeout(() => {
          throw new Error('Unhandled demo error — captured by global handler')
        }, 0)
      },
    },
    {
      title: 'Promise Rejection',
      description: 'Rejects a promise without .catch(). The global unhandledrejection handler captures it.',
      sdkFeature: 'Global Handlers (onunhandledrejection)',
      codeSnippet: `// Unhandled promise rejections are also captured.
Promise.reject(new Error('Unhandled rejection'))`,
      onTrigger: () => {
        Promise.reject(new Error('Unhandled promise rejection — captured by global handler'))
      },
    },
    {
      title: 'React Render Crash',
      description: 'Renders a component that throws during render. NzrErrorBoundary catches it and shows fallback UI.',
      sdkFeature: 'NzrErrorBoundary (React)',
      codeSnippet: `// Wrap components with NzrErrorBoundary:
<NzrErrorBoundary fallback={<ErrorUI />}>
  <BuggyComponent />  {/* throws in render */}
</NzrErrorBoundary>`,
      onTrigger: () => {
        setShowBuggy(true)
      },
    },
    {
      title: 'Manual captureException',
      description: 'Catches an error in try/catch and reports it manually using the useNzrAutofix() hook.',
      sdkFeature: 'useNzrAutofix() hook',
      codeSnippet: `const { captureException } = useNzrAutofix()
try {
  JSON.parse('invalid json {{{')
} catch (err) {
  captureException(err)  // Report without crashing
}`,
      onTrigger: () => {
        try {
          JSON.parse('invalid json {{{')
        } catch (err) {
          hookCapture(err as Error)
        }
      },
    },
    {
      title: 'Manual captureMessage',
      description: 'Sends a custom warning message without an actual exception. Useful for business rule violations.',
      sdkFeature: 'captureMessage()',
      codeSnippet: `import { captureMessage } from '@nzrgroup/autofix'

captureMessage(
  'User exceeded daily limit',
  'warning'
)`,
      onTrigger: () => {
        hookMessage('User exceeded daily API limit — demo warning', 'warning')
      },
    },
    {
      title: 'Breadcrumb Trail',
      description: 'Records user actions as breadcrumbs before an error. Helps trace the steps that led to the bug.',
      sdkFeature: 'addBreadcrumb() + captureException()',
      codeSnippet: `addBreadcrumb({ category: 'ui', message: 'Clicked settings' })
addBreadcrumb({ category: 'api', message: 'Fetched user data' })
addBreadcrumb({ category: 'ui', message: 'Opened modal' })
// Error occurs after these steps:
captureException(new Error('Modal crashed'))`,
      onTrigger: () => {
        addBreadcrumb({ category: 'ui', message: 'User clicked settings button', level: 'info' })
        addBreadcrumb({ category: 'api', message: 'Fetched user profile data', level: 'info' })
        addBreadcrumb({ category: 'ui', message: 'Opened configuration modal', level: 'info' })
        captureException(new Error('Configuration modal crashed after user interaction'))
      },
    },
  ]

  // =====================================================
  // Backend Error Scenarios
  // =====================================================

  const backendScenarios = [
    {
      title: 'ValueError',
      description: 'Calls a backend endpoint that parses invalid input. AutofixMiddleware captures the exception.',
      sdkFeature: 'AutofixMiddleware (Django)',
      codeSnippet: `# Django view:
def trigger_value_error(request):
    user_input = "not-a-number"
    age = int(user_input)  # ValueError`,
      onTrigger: () => apiClient.get('/api/demo/errors/value-error/'),
    },
    {
      title: 'KeyError',
      description: 'Calls a backend endpoint that accesses a missing dict key.',
      sdkFeature: 'AutofixMiddleware (Django)',
      codeSnippet: `# Django view:
def trigger_key_error(request):
    config = {'host': 'localhost'}
    port = config['port']  # KeyError`,
      onTrigger: () => apiClient.get('/api/demo/errors/key-error/'),
    },
    {
      title: 'TypeError',
      description: 'Calls a backend endpoint that operates on incompatible types (None + int).',
      sdkFeature: 'AutofixMiddleware (Django)',
      codeSnippet: `# Django view:
def trigger_type_error(request):
    count = None
    total = count + 1  # TypeError`,
      onTrigger: () => apiClient.get('/api/demo/errors/type-error/'),
    },
    {
      title: 'ZeroDivisionError',
      description: 'Calls a backend endpoint that divides by zero.',
      sdkFeature: 'AutofixMiddleware (Django)',
      codeSnippet: `# Django view:
def trigger_zero_division(request):
    items_per_page = 100 / 0  # ZeroDivisionError`,
      onTrigger: () => apiClient.get('/api/demo/errors/zero-division/'),
    },
    {
      title: 'Manual capture_exception()',
      description: 'Backend catches the error gracefully and reports it via capture_exception(). Returns 200.',
      sdkFeature: 'nzr_autofix.capture_exception()',
      codeSnippet: `# Django view:
try:
    total = float('19.99') * int('abc')
except Exception as exc:
    nzr_autofix.capture_exception(exc)
    return Response({'status': 'error_captured'})`,
      onTrigger: () => apiClient.post('/api/demo/errors/manual-capture/'),
    },
    {
      title: 'Manual capture_message()',
      description: 'Backend sends a custom warning message without an exception.',
      sdkFeature: 'nzr_autofix.capture_message()',
      codeSnippet: `# Django view:
nzr_autofix.capture_message(
    message='[Demo] Custom warning',
    level='warning',
)`,
      onTrigger: () => apiClient.post('/api/demo/errors/manual-message/', { message: 'Custom backend warning' }),
    },
  ]

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Error Scenarios Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Click each button to trigger an error. The SDK captures it and sends to your NZR Autofix instance.
          Check your NZR Manager dashboard to see the errors appear in real-time.
        </Typography>
      </Box>

      {/* React ErrorBoundary demo area */}
      {showBuggy && (
        <Box sx={{ mb: 3 }}>
          <NzrErrorBoundary
            fallback={(error: Error) => (
              <Alert severity="error" onClose={() => setShowBuggy(false)} sx={{ mb: 2 }}>
                <strong>NzrErrorBoundary caught a render error!</strong>
                <br />
                {error.message}
                <br />
                <small>This error was sent to NZR Autofix. Click X to dismiss.</small>
              </Alert>
            )}
          >
            <BuggyComponent />
          </NzrErrorBoundary>
        </Box>
      )}

      {/* Frontend Scenarios */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Frontend SDK (@nzrgroup/autofix)
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {frontendScenarios.map((scenario) => (
          <Grid item xs={12} md={6} lg={4} key={scenario.title}>
            <ErrorCard {...scenario} variant="frontend" />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Backend Scenarios */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Backend SDK (nzr-autofix / Python)
      </Typography>
      <Grid container spacing={2}>
        {backendScenarios.map((scenario) => (
          <Grid item xs={12} md={6} lg={4} key={scenario.title}>
            <ErrorCard {...scenario} variant="backend" />
          </Grid>
        ))}
      </Grid>
    </Layout>
  )
}
