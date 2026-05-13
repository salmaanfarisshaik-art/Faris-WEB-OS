import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import Desktop from './components/Desktop'
import Taskbar from './components/Taskbar'
import Window from './components/Window'
import { useOSStore } from './store/osStore'

type AuthPage = 'login' | 'register'

function App() {
  const { isAuthenticated, user, token, setAuth, logout } = useAuthStore()
  const { windows } = useOSStore()
  const [authPage, setAuthPage] = useState<AuthPage>('login')
  const [checking, setChecking] = useState(true)

  // Check existing token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('beast_token')
    if (savedToken) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setAuth(data.user, savedToken)
        })
        .catch(() => {})
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  if (checking) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: '#060810',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#00ff88', fontSize: '24px',
      }}>
        ⚡
      </div>
    )
  }

  if (!isAuthenticated) {
    return authPage === 'login'
      ? <Login onSwitchToRegister={() => setAuthPage('register')} />
      : <Register onSwitchToLogin={() => setAuthPage('login')} />
  }

  // Admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  // Regular user → OS
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Desktop />
      {windows.map(win => (
        <Window key={win.id} window={win} />
      ))}
      <Taskbar />
    </div>
  )
}

export default App