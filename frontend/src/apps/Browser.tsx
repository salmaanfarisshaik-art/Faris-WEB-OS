import { useState, useRef } from 'react'

const QUICK_LINKS = [
  { name: 'CodeChef', url: 'https://www.codechef.com', icon: '👨‍💻', color: '#f59e0b' },
  { name: 'W3Schools', url: 'https://www.w3schools.com', icon: '📚', color: '#00ff88' },
  { name: 'MDN Docs', url: 'https://developer.mozilla.org', icon: '🌐', color: '#3b82f6' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', color: '#8b949e' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '💡', color: '#f59e0b' },
  { name: 'Cisco Learning', url: 'https://learningnetwork.cisco.com', icon: '🔗', color: '#06b6d4' },
  { name: 'TryHackMe', url: 'https://tryhackme.com', icon: '🛡️', color: '#ef4444' },
  { name: 'HackTheBox', url: 'https://hackthebox.com', icon: '🟩', color: '#00ff88' },
  { name: 'Coursera', url: 'https://www.coursera.org', icon: '🎓', color: '#8b5cf6' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '📖', color: '#f0f4ff' },
]

interface Tab {
  id: string
  url: string
  title: string
  loading: boolean
  htmlContent: string
  error: string
}

let tabCounter = 0
function newTab(): Tab {
  return {
    id: `tab-${++tabCounter}`,
    url: '', title: 'New Tab',
    loading: false, htmlContent: '', error: ''
  }
}

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([newTab()])
  const [activeTabId, setActiveTabId] = useState(tabs[0].id)
  const [urlInput, setUrlInput] = useState('')

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const navigate = async (url: string, tabId = activeTabId) => {
    let fullUrl = url.trim()
    if (!fullUrl) return
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      if (fullUrl.includes('.') && !fullUrl.includes(' ')) {
        fullUrl = 'https://' + fullUrl
      } else {
        fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`
      }
    }

    setUrlInput(fullUrl)
    updateTab(tabId, {
      url: fullUrl, loading: true,
      error: '', htmlContent: '',
      title: new URL(fullUrl).hostname
    })

    try {
      const res = await fetch(`/api/browser/fetch?url=${encodeURIComponent(fullUrl)}`)
      const html = await res.text()

      if (html.startsWith('{')) {
        const json = JSON.parse(html)
        throw new Error(json.error || 'Failed to load')
      }

      updateTab(tabId, {
        loading: false,
        htmlContent: html,
        title: new URL(fullUrl).hostname
      })
    } catch (err: any) {
      updateTab(tabId, {
        loading: false,
        error: err.message || 'Failed to load page'
      })
    }
  }

  const addTab = () => {
    const tab = newTab()
    setTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
    setUrlInput('')
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) {
      const t = newTab()
      setTabs([t])
      setActiveTabId(t.id)
      setUrlInput('')
      return
    }
    const remaining = tabs.filter(t => t.id !== id)
    setTabs(remaining)
    if (activeTabId === id) {
      const last = remaining[remaining.length - 1]
      setActiveTabId(last.id)
      setUrlInput(last.url)
    }
  }

  const switchTab = (id: string) => {
    setActiveTabId(id)
    const tab = tabs.find(t => t.id === id)
    if (tab) setUrlInput(tab.url)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#060810' }}>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#0a0c10',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 8px', gap: '4px',
        flexShrink: 0, height: '38px', overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0 10px', height: '30px', borderRadius: '8px',
              cursor: 'pointer', minWidth: '100px', maxWidth: '160px',
              flexShrink: 0, fontSize: '12px',
              background: activeTabId === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: activeTabId === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              color: activeTabId === tab.id ? '#f0f4ff' : '#6b7a99',
            }}
          >
            <span style={{ fontSize: '12px' }}>{tab.loading ? '⟳' : '🌐'}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tab.title || 'New Tab'}
            </span>
            <span
              onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff5f57')}
              onMouseLeave={e => (e.currentTarget.style.color = '#484f58')}
              style={{ color: '#484f58', fontSize: '14px' }}
            >×</span>
          </div>
        ))}
        <div
          onClick={addTab}
          style={{
            width: '28px', height: '28px', borderRadius: '8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', color: '#484f58', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f0f4ff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#484f58' }}
        >+</div>
      </div>

      {/* Navigation Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 12px', background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        {['←', '→', '↻'].map((btn, i) => (
          <button key={btn}
            onClick={() => { if (i === 2) navigate(activeTab.url) }}
            style={{
              width: '30px', height: '30px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', color: '#8b949e',
              cursor: 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{btn}</button>
        ))}

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '0 12px', gap: '8px', height: '30px',
        }}>
          <span style={{ fontSize: '12px' }}>🔒</span>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(urlInput) }}
            onFocus={e => e.target.select()}
            placeholder="Enter URL or search..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: '#f0f4ff', fontSize: '13px',
            }}
          />
        </div>

        <button
          onClick={() => activeTab.url && window.open(activeTab.url, '_blank')}
          style={{
            padding: '4px 10px', height: '30px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', color: '#8b949e',
            cursor: 'pointer', fontSize: '11px', flexShrink: 0,
          }}
        >↗ Open</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* New Tab Page */}
        {!activeTab.htmlContent && !activeTab.loading && !activeTab.error && (
          <div style={{
            height: '100%', overflow: 'auto',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '32px 20px', gap: '28px',
          }}>
            <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#f0f4ff', marginBottom: '16px' }}>
                <span style={{ color: '#00ff88' }}>Beast</span> Browser
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px', padding: '0 16px', height: '48px', gap: '10px',
              }}>
                <span>🔍</span>
                <input
                  autoFocus
                  placeholder="Search or enter URL..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      navigate((e.target as HTMLInputElement).value)
                    }
                  }}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    outline: 'none', color: '#f0f4ff', fontSize: '15px',
                  }}
                />
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: '640px' }}>
              <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '1px', marginBottom: '12px' }}>
                QUICK ACCESS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {QUICK_LINKS.map(link => (
                  <div
                    key={link.url}
                    onClick={() => navigate(link.url)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '8px',
                      padding: '14px 8px', borderRadius: '12px', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{link.icon}</span>
                    <span style={{ fontSize: '10px', color: '#8b949e', textAlign: 'center' }}>
                      {link.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {activeTab.loading && (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#484f58',
          }}>
            <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⟳</div>
            <div style={{ fontSize: '13px' }}>Loading {activeTab.url}...</div>
          </div>
        )}

        {/* Error */}
        {activeTab.error && (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ fontSize: '48px' }}>⚠️</div>
            <div style={{ fontSize: '16px', color: '#f0f4ff', fontWeight: 600 }}>Cannot load page</div>
            <div style={{ fontSize: '13px', color: '#6b7a99', maxWidth: '400px', textAlign: 'center' }}>
              {activeTab.error}
            </div>
            <button
              onClick={() => window.open(activeTab.url, '_blank')}
              style={{
                padding: '8px 20px', borderRadius: '8px',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa', cursor: 'pointer', fontSize: '13px',
              }}
            >↗ Open in real browser</button>
          </div>
        )}

        {/* Render HTML using srcdoc — bypasses Firefox iframe blocking */}
        {activeTab.htmlContent && !activeTab.loading && (
          <iframe
            srcDoc={activeTab.htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="browser"
          />
        )}
      </div>
    </div>
  )
}