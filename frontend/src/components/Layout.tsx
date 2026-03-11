import { AppBar, Toolbar, Typography, Button, Container, Box, Chip } from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../App'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: 'rgba(124, 77, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <BugReportIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            NZR Autofix Demo
          </Typography>
          {user && (
            <>
              <Chip
                label={`${user.name} (${user.role})`}
                size="small"
                sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.1)' }}
              />
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={logout}
              >
                Sair
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}
