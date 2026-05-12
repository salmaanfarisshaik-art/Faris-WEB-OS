import { useRef } from 'react'
import { useOSStore } from '../store/osStore'
import type { WindowState } from '../store/osStore'
import TerminalApp from '../apps/Terminal'
import FileManager from '../apps/FileManager'
import Editor from '../apps/Editor'
import Settings from '../apps/Settings'
import SystemMonitor from '../apps/SystemMonitor'
import Browser from '../apps/Browser'

const appMeta: Record<string, { emoji: string; color: string; label: string }> = {
  terminal: { emoji: '⌨️', color: '#00ff88', label: 'Terminal' },
  files:    { emoji: '📂', color: '#3b82f6', label: 'File Manager' },
  editor:   { emoji: '⚡', color: '#8b5cf6', label: 'Code Editor' },
  scanner:  { emoji: '🛡️', color: '#06b6d4', label: 'Network Scanner' },
  settings: { emoji: '⚙️', color: '#f59e0b', label: 'Settings' },
  monitor: { emoji: '📊', color: '#06b6d4', label: 'System Monitor' },
  browser: { emoji: '🌐', color: '#06b6d4', label: 'Browser' },
}

export default function Window({ window: win }: { window: WindowState }) {
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, updateWindowPosition } = useOSStore()
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const meta = appMeta[win.app] || { emoji: '🖥️', color: '#00ff88', label: win.title }

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.win-btn')) return
    e.preventDefault()
    isDragging.current = true
    dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y }
    focusWindow(win.id)

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      updateWindowPosition(
        win.id,
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y
      )
    }
    const onUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (win.isMinimized) return null

  const boxStyle: React.CSSProperties = win.isMaximized
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: 'calc(100vh - 52px)', zIndex: win.zIndex }
    : { position: 'fixed', top: win.y, left: win.x, width: win.width, height: win.height, zIndex: win.zIndex }

  return (
    <div
      onMouseDown={() => focusWindow(win.id)}
      style={{
        ...boxStyle,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-bright)',
        borderRadius: win.isMaximized ? '0' : '16px',
        overflow: 'hidden',
        boxShadow: `
          0 32px 80px rgba(0,0,0,0.8),
          0 0 0 1px rgba(255,255,255,0.05),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
        style={{
          height: '44px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          cursor: 'grab',
          flexShrink: 0,
          position: 'relative',
          gap: '12px',
        }}
      >
        {/* Traffic lights */}
        <div className="win-btn" style={{ display: 'flex', gap: '8px' }}>
          <WinBtn color="#ff5f57" hoverColor="#ff3b30" onClick={() => closeWindow(win.id)} symbol="×" />
          <WinBtn color="#febc2e" hoverColor="#ffb000" onClick={() => minimizeWindow(win.id)} symbol="−" />
          <WinBtn color="#28c840" hoverColor="#00c800" onClick={() => toggleMaximize(win.id)} symbol="+" />
        </div>

        {/* Title */}
        <div style={{
          position: 'absolute', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '14px' }}>{meta.emoji}</span>
          <span style={{
            fontSize: '12px', fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.3px'
          }}>
            {win.title}
          </span>
        </div>

        {/* Color accent line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${meta.color}44, transparent)`,
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AppContent app={win.app} meta={meta} winId={win.id} onClose={() => closeWindow(win.id)} />
      </div>
    </div>
  )
}

function WinBtn({ color, hoverColor, onClick, symbol }: {
  color: string; hoverColor: string; onClick: () => void; symbol: string
}) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick() }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverColor
        const s = e.currentTarget.querySelector('span') as HTMLElement
        if (s) s.style.opacity = '1'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = color
        const s = e.currentTarget.querySelector('span') as HTMLElement
        if (s) s.style.opacity = '0'
      }}
      style={{
        width: '14px', height: '14px',
        borderRadius: '50%', background: color,
        cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <span style={{
        fontSize: '10px', lineHeight: 1, opacity: 0,
        color: 'rgba(0,0,0,0.7)', fontWeight: 'bold',
        transition: 'opacity 0.15s', pointerEvents: 'none'
      }}>
        {symbol}
      </span>
    </div>
  )
}

function AppContent({ app, meta, winId, onClose }: {
  app: string
  meta: { emoji: string; color: string; label: string }
  winId: string
  onClose: () => void
}) {
  if (app === 'terminal') return <TerminalApp windowId={winId} onClose={onClose} />
  if (app === 'files') return <FileManager />
  if (app === 'editor') return <Editor />
  if (app === 'settings') return <Settings />
  if (app === 'monitor') return <SystemMonitor />
  if (app === 'browser') return <Browser />

  const descriptions: Record<string, string> = {
    files:    'Browse, edit and manage your container filesystem',
    editor:   'VS Code-powered Monaco editor with syntax highlighting',
    scanner:  'nmap-powered network scanner with visual output',
    settings: 'Customize your Beast OS experience',
  }

  return (
    <div style={{
      height: '100%', minHeight: '400px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
      padding: '40px',
      background: `radial-gradient(ellipse at 50% 0%, ${meta.color}08 0%, transparent 60%)`,
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}08)`,
        border: `1px solid ${meta.color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40px', boxShadow: `0 0 40px ${meta.color}22`,
      }}>
        {meta.emoji}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {meta.label}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.6 }}>
          {descriptions[app] || 'Coming soon'}
        </div>
      </div>
      <div style={{
        padding: '6px 16px', borderRadius: '20px',
        background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
        fontSize: '11px', fontWeight: 500, color: meta.color, letterSpacing: '0.5px',
      }}>
        COMING NEXT
      </div>
    </div>
  )
}