import { useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

interface AuthState {
  token: string | null
  user: { username: string; name: string; role: string } | null
}

interface AuthContextType extends AuthState {
  login: (token: string, user: AuthState['user']) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null })

  const login = (token: string, user: AuthState['user']) => {
    setAuth({ token, user })
  }

  const logout = () => {
    setAuth({ token: null, user: null })
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={auth.token ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={auth.token ? '/dashboard' : '/login'} />} />
      </Routes>
    </AuthContext.Provider>
  )
}
