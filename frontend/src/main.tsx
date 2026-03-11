// SDK initialization MUST be the first import.
// This sets up global error handlers before any other code runs.
import './autofix'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { NzrErrorBoundary } from '@nzrgroup/autofix/react'
import App from './App'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    background: {
      default: '#0a0a0f',
      paper: '#12121a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        {/*
          NzrErrorBoundary wraps the entire app.
          If a React component throws during render, the SDK captures
          the error and shows the fallback UI instead of a white screen.
        */}
        <NzrErrorBoundary
          fallback={
            <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>
              <h1>Something went wrong</h1>
              <p>The error was captured by NzrErrorBoundary and sent to NZR Autofix.</p>
              <button onClick={() => window.location.reload()}>Reload</button>
            </div>
          }
        >
          <App />
        </NzrErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
