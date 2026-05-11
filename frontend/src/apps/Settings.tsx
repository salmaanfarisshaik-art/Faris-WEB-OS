import { useState } from 'react'

interface SettingsState {
  theme: 'dark' | 'darker' | 'midnight'
  accentColor: string
  fontSize: number
  wallpaper: string
  dockPosition: 'bottom' | 'left'
  terminalFont: string
  terminalFontSize: number
  animationsEnabled: boolean
  notificationsEnabled: boolean
}

const ACCENT_COLORS = [
  { name: 'Green', value: '#00ff88' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'White', value: '#f0f4ff' },
]

const WALLPAPERS = [
  { name: 'Default Dark', value: 'default', preview: 'linear-gradient(135deg, #060810, #0d1117)' },
  { name: 'Deep Ocean', value: 'ocean', preview: 'linear-gradient(135deg, #0a0a2e, #003366)' },
  { name: 'Forest', value: 'forest', preview: 'linear-gradient(135deg, #0a1a0a, #003300)' },
  { name: 'Sunset', value: 'sunset', preview: 'linear-gradient(135deg, #1a0a0a, #330022)' },
  { name: 'Nebula', value: 'nebula', preview: 'linear-gradient(135deg, #0d0a1a, #1a0033)' },
  { name: 'Matrix', value: 'matrix', preview: 'linear-gradient(135deg, #000a00, #001a00)' },
]

const WALLPAPER_STYLES: Record<string, string> = {
  default: `
    radial-gradient(ellipse at 15% 50%, rgba(59,130,246,0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 20%, rgba(139,92,246,0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 90%, rgba(0,255,136,0.05) 0%, transparent 50%),
    #060810
  `,
  ocean: `
    radial-gradient(ellipse at 20% 50%, rgba(0,100,255,0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 30%, rgba(0,200,255,0.08) 0%, transparent 50%),
    #020820
  `,
  forest: `
    radial-gradient(ellipse at 30% 60%, rgba(0,180,50,0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 20%, rgba(0,255,100,0.06) 0%, transparent 50%),
    #020a02
  `,
  sunset: `
    radial-gradient(ellipse at 50% 80%, rgba(255,50,100,0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 20% 20%, rgba(200,0,150,0.08) 0%, transparent 50%),
    #0a0205
  `,
  nebula: `
    radial-gradient(ellipse at 40% 40%, rgba(150,0,255,0.12) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 70%, rgba(0,100,255,0.10) 0%, transparent 50%),
    #05020f
  `,
  matrix: `
    radial-gradient(ellipse at 50% 50%, rgba(0,255,0,0.06) 0%, transparent 70%),
    #000200
  `,
}

const TERMINAL_FONTS = [
  'JetBrains Mono',
  'Fira Code',
  'Courier New',
  'Consolas',
  'Monaco',
  'Source Code Pro',
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('appearance')
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    accentColor: '#00ff88',
    fontSize: 14,
    wallpaper: 'default',
    dockPosition: 'bottom',
    terminalFont: 'JetBrains Mono',
    terminalFontSize: 14,
    animationsEnabled: true,
    notificationsEnabled: true,
  })
  const [saved, setSaved] = useState(false)

  const update = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // Apply changes live
    if (key === 'accentColor') {
      document.documentElement.style.setProperty('--accent-green', value)
    }
    if (key === 'wallpaper') {
      const desktop = document.querySelector('#beast-desktop') as HTMLElement
      if (desktop) desktop.style.background = WALLPAPER_STYLES[value]
    }
  }

  const saveSettings = () => {
    localStorage.setItem('beast-os-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'terminal', label: 'Terminal', icon: '⌨️' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'about', label: 'About', icon: '⚡' },
  ]

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', background: '#060810',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '200px', flexShrink: 0,
        background: '#0a0c10',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 8px',
      }}>
        <div style={{
          fontSize: '10px', color: '#484f58',
          letterSpacing: '1px', fontWeight: 600,
          padding: '0 8px', marginBottom: '8px',
        }}>
          SETTINGS
        </div>
        {sections.map(s => (
          <div
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            onMouseEnter={e => {
              if (activeSection !== s.id)
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              if (activeSection !== s.id)
                e.currentTarget.style.background = 'transparent'
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
              background: activeSection === s.id
                ? 'rgba(0,255,136,0.1)' : 'transparent',
              color: activeSection === s.id ? '#00ff88' : '#8b949e',
              fontSize: '13px', fontWeight: activeSection === s.id ? 500 : 400,
              border: activeSection === s.id
                ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </div>
        ))}

        {/* Save button */}
        <div style={{ marginTop: 'auto', padding: '8px' }}>
          <button
            onClick={saveSettings}
            style={{
              width: '100%', padding: '8px',
              background: saved ? 'rgba(0,255,136,0.2)' : 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '8px', color: '#00ff88',
              cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {saved ? '✓ Saved!' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

        {/* APPEARANCE */}
        {activeSection === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionTitle title="Appearance" subtitle="Customize how Beast OS looks" />

            {/* Accent Color */}
            <SettingGroup title="Accent Color" description="Used for highlights and active states">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(color => (
                  <div
                    key={color.value}
                    onClick={() => update('accentColor', color.value)}
                    title={color.name}
                    style={{
                      width: '36px', height: '36px',
                      borderRadius: '50%',
                      background: color.value,
                      cursor: 'pointer',
                      border: settings.accentColor === color.value
                        ? `3px solid white`
                        : '3px solid transparent',
                      boxShadow: settings.accentColor === color.value
                        ? `0 0 12px ${color.value}` : 'none',
                      transition: 'all 0.15s',
                      transform: settings.accentColor === color.value
                        ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </SettingGroup>

            {/* Wallpaper */}
            <SettingGroup title="Wallpaper" description="Desktop background style">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {WALLPAPERS.map(wp => (
                  <div
                    key={wp.value}
                    onClick={() => update('wallpaper', wp.value)}
                    style={{
                      width: '80px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: '6px',
                    }}
                  >
                    <div style={{
                      width: '80px', height: '50px',
                      borderRadius: '8px',
                      background: wp.preview,
                      border: settings.wallpaper === wp.value
                        ? '2px solid #00ff88'
                        : '2px solid rgba(255,255,255,0.08)',
                      transition: 'border 0.15s',
                      boxShadow: settings.wallpaper === wp.value
                        ? '0 0 12px rgba(0,255,136,0.3)' : 'none',
                    }} />
                    <span style={{
                      fontSize: '10px', color: '#8b949e',
                      textAlign: 'center', lineHeight: 1.2,
                    }}>
                      {wp.name}
                    </span>
                  </div>
                ))}
              </div>
            </SettingGroup>

            {/* Font Size */}
            <SettingGroup title="UI Font Size" description={`Current: ${settings.fontSize}px`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#484f58' }}>12</span>
                <input
                  type="range" min="12" max="18" step="1"
                  value={settings.fontSize}
                  onChange={e => update('fontSize', parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: settings.accentColor }}
                />
                <span style={{ fontSize: '12px', color: '#484f58' }}>18</span>
                <span style={{
                  fontSize: '12px', color: settings.accentColor,
                  minWidth: '32px', textAlign: 'right', fontWeight: 600,
                }}>
                  {settings.fontSize}px
                </span>
              </div>
            </SettingGroup>

            {/* Animations */}
            <SettingGroup title="Animations" description="Window transitions and effects">
              <Toggle
                value={settings.animationsEnabled}
                onChange={v => update('animationsEnabled', v)}
                accentColor={settings.accentColor}
              />
            </SettingGroup>
          </div>
        )}

        {/* TERMINAL */}
        {activeSection === 'terminal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionTitle title="Terminal" subtitle="Customize your terminal experience" />

            <SettingGroup title="Font Family" description="Terminal font">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {TERMINAL_FONTS.map(font => (
                  <div
                    key={font}
                    onClick={() => update('terminalFont', font)}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                      background: settings.terminalFont === font
                        ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)',
                      border: settings.terminalFont === font
                        ? '1px solid rgba(0,255,136,0.25)'
                        : '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontFamily: font, fontSize: '14px', color: '#f0f4ff' }}>
                      {font}
                    </span>
                    <span style={{ fontFamily: font, fontSize: '12px', color: '#484f58' }}>
                      echo "hello"
                    </span>
                  </div>
                ))}
              </div>
            </SettingGroup>

            <SettingGroup
              title="Terminal Font Size"
              description={`Current: ${settings.terminalFontSize}px`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#484f58' }}>10</span>
                <input
                  type="range" min="10" max="20" step="1"
                  value={settings.terminalFontSize}
                  onChange={e => update('terminalFontSize', parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: settings.accentColor }}
                />
                <span style={{ fontSize: '12px', color: '#484f58' }}>20</span>
                <span style={{
                  fontSize: '12px', color: settings.accentColor,
                  minWidth: '32px', textAlign: 'right', fontWeight: 600,
                }}>
                  {settings.terminalFontSize}px
                </span>
              </div>
            </SettingGroup>

            {/* Preview */}
            <SettingGroup title="Preview" description="How your terminal will look">
              <div style={{
                background: '#060810', borderRadius: '10px',
                padding: '16px', border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: settings.terminalFont,
                fontSize: `${settings.terminalFontSize}px`,
                lineHeight: 1.6,
              }}>
                <div style={{ color: '#00ff88' }}>⚡ Beast OS Terminal — Connected</div>
                <div style={{ color: '#8b949e' }}>
                  PS C:\Users\Shaik.salmaan&gt; <span style={{ color: '#f0f4ff' }}>nmap -sV 192.168.1.1</span>
                </div>
                <div style={{ color: '#3b82f6' }}>Starting Nmap scan...</div>
                <div style={{ color: '#f0f4ff' }}>PORT     STATE  SERVICE  VERSION</div>
                <div style={{ color: '#00ff88' }}>80/tcp   open   http     Apache 2.4</div>
                <div style={{ color: '#f59e0b' }}>443/tcp  open   https    OpenSSL</div>
              </div>
            </SettingGroup>
          </div>
        )}

        {/* SYSTEM */}
        {activeSection === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionTitle title="System" subtitle="OS behavior and notifications" />

            <SettingGroup title="Notifications" description="Show system notifications">
              <Toggle
                value={settings.notificationsEnabled}
                onChange={v => update('notificationsEnabled', v)}
                accentColor={settings.accentColor}
              />
            </SettingGroup>

            <SettingGroup
              title="Dock Position"
              description="Where the taskbar appears"
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                {['bottom', 'left'].map(pos => (
                  <div
                    key={pos}
                    onClick={() => update('dockPosition', pos)}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                      background: settings.dockPosition === pos
                        ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                      border: settings.dockPosition === pos
                        ? '1px solid rgba(0,255,136,0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: settings.dockPosition === pos ? '#00ff88' : '#8b949e',
                      fontSize: '13px', textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            </SettingGroup>

            {/* Keyboard shortcuts */}
            <SettingGroup
              title="Keyboard Shortcuts"
              description="Default keybindings"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { keys: 'Ctrl + S', action: 'Save file in editor' },
                  { keys: 'Double Click', action: 'Open app from desktop' },
                  { keys: 'Click Taskbar', action: 'Minimize / Restore window' },
                  { keys: 'Drag Title Bar', action: 'Move window' },
                  { keys: 'Double Click Title', action: 'Maximize window' },
                ].map(({ keys, action }) => (
                  <div key={keys} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>{action}</span>
                    <kbd style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '5px', padding: '3px 8px',
                      fontSize: '11px', color: '#f0f4ff',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </SettingGroup>
          </div>
        )}

        {/* ABOUT */}
        {activeSection === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionTitle title="About" subtitle="Beast OS system information" />

            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '16px', padding: '40px',
              background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #00ff88, #3b82f6)',
                borderRadius: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px',
                boxShadow: '0 0 40px rgba(0,255,136,0.3)',
              }}>
                ⚡
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff' }}>
                  Beast OS
                </div>
                <div style={{ fontSize: '13px', color: '#8b949e', marginTop: '4px' }}>
                  Version 0.1.0 — Alpha
                </div>
              </div>
            </div>

            {[
              { label: 'Version', value: '0.1.0 Alpha' },
              { label: 'Build', value: 'Local Development' },
              { label: 'Frontend', value: 'React + TypeScript + Vite' },
              { label: 'Backend', value: 'Node.js + Express + Socket.io' },
              { label: 'Editor', value: 'Monaco (VS Code Engine)' },
              { label: 'Terminal', value: 'xterm.js + PowerShell' },
              { label: 'Built by', value: 'Shaik Salmaan — BTech 3rd Year' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '13px', color: '#8b949e' }}>{label}</span>
                <span style={{ fontSize: '13px', color: '#f0f4ff', fontWeight: 500 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable components
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f4ff', margin: 0 }}>
        {title}
      </h2>
      <p style={{ fontSize: '13px', color: '#6b7a99', margin: '4px 0 0' }}>
        {subtitle}
      </p>
    </div>
  )
}

function SettingGroup({ title, description, children }: {
  title: string; description: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#f0f4ff' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>{description}</div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange, accentColor }: {
  value: boolean; onChange: (v: boolean) => void; accentColor: string
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px',
        borderRadius: '12px',
        background: value ? accentColor : 'rgba(255,255,255,0.1)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '3px',
        left: value ? '23px' : '3px',
        width: '18px', height: '18px',
        borderRadius: '50%', background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}