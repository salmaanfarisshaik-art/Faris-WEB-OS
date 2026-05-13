import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  last_login: string
}

export default function AdminDashboard() {
  const { token, logout } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setUsers(data.users)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleApprove = async (userId: number) => {
    await fetch(`/api/auth/admin/approve/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    setMessage('✅ User approved and email sent!')
    fetchUsers()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleReject = async (userId: number) => {
    await fetch(`/api/auth/admin/reject/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    setMessage('❌ User rejected')
    fetchUsers()
    setTimeout(() => setMessage(''), 3000)
  }

  const pending = users.filter(u => u.status === 'pending')
  const approved = users.filter(u => u.status === 'approved')
  const rejected = users.filter(u => u.status === 'rejected')

  const statusColor = (s: string) =>
    s === 'approved' ? '#00ff88' : s === 'rejected' ? '#ef4444' : '#f59e0b'

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#060810', color: '#f0f4ff',
      fontFamily: 'Inter, sans-serif',
      overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(13,17,30,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #00ff88, #3b82f6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Beast OS Admin</div>
            <div style={{ fontSize: '11px', color: '#6b7a99' }}>User Management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {message && (
            <span style={{ fontSize: '13px', color: '#00ff88' }}>{message}</span>
          )}
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', color: '#ef4444',
              cursor: 'pointer', fontSize: '13px',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { label: 'Pending', count: pending.length, color: '#f59e0b', icon: '⏳' },
            { label: 'Approved', count: approved.length, color: '#00ff88', icon: '✅' },
            { label: 'Rejected', count: rejected.length, color: '#ef4444', icon: '❌' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>
                  {stat.count}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7a99' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: '14px', fontWeight: 600,
          }}>
            All Users ({users.length})
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#484f58' }}>
              Loading...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Name', 'Email', 'Role', 'Status', 'Registered', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '11px', color: '#484f58',
                      letterSpacing: '0.5px', fontWeight: 600,
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8b949e' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                        background: user.role === 'admin' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.06)',
                        color: user.role === 'admin' ? '#00ff88' : '#8b949e',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: '4px', fontSize: '11px',
                        background: `${statusColor(user.status)}15`,
                        color: statusColor(user.status),
                        border: `1px solid ${statusColor(user.status)}30`,
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#484f58' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {user.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(user.id)}
                            style={{
                              padding: '5px 12px', borderRadius: '6px',
                              background: 'rgba(0,255,136,0.1)',
                              border: '1px solid rgba(0,255,136,0.3)',
                              color: '#00ff88', cursor: 'pointer', fontSize: '12px',
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            style={{
                              padding: '5px 12px', borderRadius: '6px',
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', cursor: 'pointer', fontSize: '12px',
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {user.status !== 'pending' && (
                        <span style={{ fontSize: '12px', color: '#484f58' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}