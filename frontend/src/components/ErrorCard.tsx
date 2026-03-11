import { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Alert,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

interface ErrorCardProps {
  title: string
  description: string
  codeSnippet: string
  sdkFeature: string
  variant: 'frontend' | 'backend'
  onTrigger: () => void | Promise<void>
}

export default function ErrorCard({
  title,
  description,
  codeSnippet,
  sdkFeature,
  variant,
  onTrigger,
}: ErrorCardProps) {
  const [status, setStatus] = useState<'idle' | 'triggered' | 'error'>('idle')
  const [result, setResult] = useState<string | null>(null)

  const handleTrigger = async () => {
    setStatus('idle')
    setResult(null)
    try {
      await onTrigger()
      setStatus('triggered')
      setResult('Error sent to NZR Autofix!')
    } catch (err: any) {
      setStatus('error')
      setResult(err?.response?.data?.detail || err?.message || 'Error triggered (check NZR Autofix dashboard)')
    }
  }

  return (
    <Card
      sx={{
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            {title}
          </Typography>
          <Chip
            label={variant === 'frontend' ? 'Frontend SDK' : 'Backend SDK'}
            size="small"
            color={variant === 'frontend' ? 'primary' : 'secondary'}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {description}
        </Typography>

        <Chip label={sdkFeature} size="small" sx={{ mb: 1.5, bgcolor: 'rgba(124,77,255,0.15)' }} />

        <Box
          sx={{
            bgcolor: 'rgba(0,0,0,0.3)',
            borderRadius: 1,
            p: 1.5,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            overflow: 'auto',
            whiteSpace: 'pre',
            color: '#b0bec5',
          }}
        >
          {codeSnippet}
        </Box>

        {result && (
          <Alert
            severity={status === 'error' ? 'warning' : 'success'}
            icon={status === 'error' ? <ErrorIcon /> : <CheckCircleIcon />}
            sx={{ mt: 1.5, fontSize: '0.8rem' }}
          >
            {result}
          </Alert>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={handleTrigger}
          sx={{ textTransform: 'none' }}
        >
          Trigger Error
        </Button>
      </CardActions>
    </Card>
  )
}
