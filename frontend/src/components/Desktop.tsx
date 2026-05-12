import { useOSStore } from '../store/osStore'

const icons = [
  { id: 'terminal', label: 'Terminal', emoji: '⌨️', color: '#00ff88', glow: 'rgba(0,255,136,0.3)' },
  { id: 'files',    label: 'Files',    emoji: '📂', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { id: 'editor',   label: 'Editor',   emoji: '⚡', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
  { id: 'browser',  label: 'Browser',  emoji: '🌐', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  { id: 'scanner',  label: 'Scanner',  emoji: '🛡️', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  { id: 'monitor',  label: 'Monitor',  emoji: '📊', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  { id: 'settings', label: 'Settings', emoji: '⚙️', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
]

export default function Desktop() {
  const { openWindow } = useOSStore()

  return (
    <div
      id="beast-desktop"
      onContextMenu={e => e.preventDefault()}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 15% 50%, rgba(59,130,246,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 20%, rgba(139,92,246,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 90%, rgba(0,255,136,0.05) 0%, transparent 50%),
          #060810
        `,
      }}
    >
      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Glowing orbs */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        top: '-200px', right: '-100px',
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)',
        bottom: '-100px', left: '-100px',
      }} />

      {/* Desktop Icons */}
      <div style={{
        position: 'absolute', left: '24px', top: '24px',
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}>
        {icons.map(icon => (
          <DesktopIcon
            key={icon.id}
            {...icon}
            onClick={() => openWindow(icon.id, icon.label)}
          />
        ))}
      </div>

      {/* Center watermark */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none',
        opacity: 0.03,
      }}>
        <div style={{ fontSize: '180px', lineHeight: 1 }}>⚡</div>
        <div style={{ fontSize: '28px', letterSpacing: '12px', fontWeight: 300 }}>BEAST OS</div>
      </div>
    </div>
  )
}

function DesktopIcon({ label, emoji, color, glow, onClick }: {
  label: string; emoji: string; color: string; glow: string; onClick: () => void
}) {
  return (
    <div
      onDoubleClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.07)'
        el.style.transform = 'scale(1.05) translateX(4px)'
        const iconEl = el.querySelector('.icon-box') as HTMLElement
        if (iconEl) iconEl.style.boxShadow = `0 0 20px ${glow}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.transform = 'scale(1) translateX(0)'
        const iconEl = el.querySelector('.icon-box') as HTMLElement
        if (iconEl) iconEl.style.boxShadow = `0 0 0px transparent`
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '8px 14px 8px 8px',
        borderRadius: '12px', cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid transparent',
      }}
    >
      <div
        className="icon-box"
        style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', flexShrink: 0,
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {emoji}
      
      </div>
      <span style={{
        fontSize: '12px', fontWeight: 500,
        color: 'var(--text-primary)',
        letterSpacing: '0.2px'
      }}>
        {label}
      </span>
    </div>
  )
}