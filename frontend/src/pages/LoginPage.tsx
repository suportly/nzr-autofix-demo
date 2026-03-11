import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Chip,
} from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport'
import { apiClient } from '../api/client'
import { useAuth } from '../App'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (user?: string, pass?: string) => {
    const u = user || username
    const p = pass || password
    setError('')
    setLoading(true)
    try {
      const { data } = await apiClient.post('/api/demo/auth/login/', {
        username: u,
        password: p,
      })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <BugReportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              NZR Autofix Demo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Error tracking SDK demonstration
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            fullWidth
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleLogin()}
            disabled={loading}
            sx={{ mb: 3, textTransform: 'none' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Divider sx={{ mb: 2 }}>
            <Chip label="Quick login" size="small" />
          </Divider>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => handleLogin('admin', 'admin123')}
              sx={{ textTransform: 'none' }}
            >
              admin / admin123
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => handleLogin('dev', 'dev123')}
              sx={{ textTransform: 'none' }}
            >
              dev / dev123
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
