import { useState, useEffect } from 'react'
import { useOSStore } from '../store/osStore'

const appMeta: Record<string, { emoji: string; color: string }> = {
  terminal: { emoji: '⌨️', color: '#00ff88' },
  files:    { emoji: '📂', color: '#3b82f6' },
  editor:   { emoji: '⚡', color: '#8b5cf6' },
  scanner:  { emoji: '🛡️', color: '#06b6d4' },
  settings: { emoji: '⚙️', color: '#f59e0b' },
}

export default function Taskbar() {
  const { windows, minimizeWindow, openWindow } = useOSStore()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '52px',
      background: 'rgba(6,8,16,0.92)',
      backdropFilter: 'blur(30px)',
      borderTop: '1px solid var(--border-bright)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', zIndex: 99999, gap: '12px',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
    }}>

      {/* Logo */}
      <div
        onClick={() => openWindow('terminal', 'Terminal')}
        style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #00ff88, #3b82f6)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 0 20px rgba(0,255,136,0.25)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,136,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.25)'
        }}
      >
        ⚡
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border-bright)' }} />

      {/* Open Windows */}
      <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }}>
        {windows.length === 0 && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '4px' }}>
            No open windows — double click an icon to start
          </span>
        )}
        {windows.map(win => {
          const meta = appMeta[win.app] || { emoji: '🖥️', color: '#00ff88' }
          return (
            <button
              key={win.id}
              onClick={() => minimizeWindow(win.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = win.isMinimized ? 'transparent' : 'rgba(255,255,255,0.05)'}
              style={{
                background: win.isMinimized ? 'transparent' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${win.isMinimized ? 'var(--border)' : meta.color + '33'}`,
                borderRadius: '8px',
                color: 'var(--text-primary)',
                padding: '0 12px', height: '34px',
                cursor: 'pointer', fontSize: '12px',
                maxWidth: '180px', minWidth: '100px',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '8px',
                flexShrink: 0, fontFamily: 'Inter, sans-serif',
                fontWeight: 500, transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '14px' }}>{meta.emoji}</span>
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {win.title}
              </span>
              {/* Active indicator */}
              {!win.isMinimized && (
                <div style={{
                  position: 'absolute', bottom: '3px',
                  left: '50%', transform: 'translateX(-50%)',
                  width: '20px', height: '2px',
                  borderRadius: '1px', background: meta.color,
                  boxShadow: `0 0 6px ${meta.color}`,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border-bright)' }} />

      {/* System Tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {['🤖', '🌐', '🔔'].map(icon => (
          <div
            key={icon}
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '15px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {icon}
          </div>
        ))}

        {/* Clock */}
        <div style={{
          textAlign: 'right', paddingLeft: '8px',
          borderLeft: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {time}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            {date}
          </div>
        </div>
      </div>
    </div>
  )
}