import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useOSStore } from './store/osStore'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import Desktop from './components/Desktop'
import Taskbar from './components/Taskbar'
import Window from './components/Window'

type AuthPage = 'login' | 'register'

function OSWithSync({ token }: { token: string }) {
  const { windows, initSync } = useOSStore()

  useEffect(() => {
    initSync(token)
  }, [token])

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

function App() {
  const { isAuthenticated, user, token, setAuth } = useAuthStore()
  const [authPage, setAuthPage] = useState<AuthPage>('login')
  const [checking, setChecking] = useState(true)

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
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
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

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  return <OSWithSync token={token!} />
}

export default App