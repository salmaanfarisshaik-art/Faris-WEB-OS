import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

interface Props {
  onSwitchToRegister: () => void
}

export default function Login({ onSwitchToRegister }: Props) {
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return setError('All fields required')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (data.success) {
        setAuth(data.user, data.token)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Cannot connect to server')
    }
    setLoading(false)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: `
        radial-gradient(ellipse at 15% 50%, rgba(59,130,246,0.08) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 20%, rgba(139,92,246,0.08) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 90%, rgba(0,255,136,0.05) 0%, transparent 50%),
        #060810
      `,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      backgroundImage: `
        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }}>
      <div style={{
        width: '420px',
        background: 'rgba(13,17,30,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #00ff88, #3b82f6)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 0 30px rgba(0,255,136,0.3)',
          }}>⚡</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
            Beast OS
          </h1>
          <p style={{ color: '#6b7a99', fontSize: '13px', margin: '6px 0 0' }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#f0f4ff',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = '#00ff88'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#f0f4ff',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = '#00ff88'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '13px',
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(0,255,136,0.1)' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
              border: 'none', borderRadius: '10px',
              color: '#060810', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '24px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: '#484f58' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7a99', margin: 0 }}>
          Don't have an account?{' '}
          <span
            onClick={onSwitchToRegister}
            style={{ color: '#00ff88', cursor: 'pointer', fontWeight: 500 }}
          >
            Request Access
          </span>
        </p>

        {/* Admin hint */}
        <div style={{
          marginTop: '20px', padding: '10px 14px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '8px', fontSize: '11px', color: '#6b7a99',
          textAlign: 'center',
        }}>
          Admin: admin@beastos.com / admin123
        </div>
      </div>
    </div>
  )
}