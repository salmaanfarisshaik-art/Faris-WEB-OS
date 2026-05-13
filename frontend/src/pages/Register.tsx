import { useState } from 'react'

interface Props {
  onSwitchToLogin: () => void
}

export default function Register({ onSwitchToLogin }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password) return setError('All fields required')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
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
        radial-gradient(ellipse at 85% 50%, rgba(139,92,246,0.08) 0%, transparent 55%),
        radial-gradient(ellipse at 15% 20%, rgba(0,255,136,0.06) 0%, transparent 55%),
        #060810
      `,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '420px',
        background: 'rgba(13,17,30,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 0 30px rgba(139,92,246,0.3)',
          }}>⚡</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
            Request Access
          </h1>
          <p style={{ color: '#6b7a99', fontSize: '13px', margin: '6px 0 0' }}>
            Admin approval required to join Beast OS
          </p>
        </div>

        {success ? (
          <div style={{
            textAlign: 'center', padding: '24px',
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#00ff88', marginBottom: '8px' }}>
              Request Submitted!
            </div>
            <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '20px' }}>
              Your request has been sent to the admin. You'll receive an email once approved.
            </div>
            <button
              onClick={onSwitchToLogin}
              style={{
                padding: '10px 24px',
                background: 'rgba(0,255,136,0.1)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: '8px', color: '#00ff88',
                cursor: 'pointer', fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'FULL NAME', value: name, setter: setName, type: 'text', placeholder: 'Shaik Salmaan' },
              { label: 'EMAIL', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'PASSWORD', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.label}>
                <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#f0f4ff',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            ))}

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
              onClick={handleRegister}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                border: 'none', borderRadius: '10px',
                color: 'white', fontSize: '14px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? 'Submitting...' : 'Request Access →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7a99', margin: 0 }}>
              Already have access?{' '}
              <span
                onClick={onSwitchToLogin}
                style={{ color: '#8b5cf6', cursor: 'pointer', fontWeight: 500 }}
              >
                Sign In
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}