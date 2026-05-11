import { useState, useEffect } from 'react'
import MonacoEditor from '@monaco-editor/react'

const API = 'http://localhost:3001'

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    py: 'python', go: 'go', rs: 'rust',
    html: 'html', css: 'css', scss: 'scss',
    json: 'json', md: 'markdown',
    sh: 'shell', bat: 'bat',
    xml: 'xml', yaml: 'yaml', yml: 'yaml',
    sql: 'sql', cpp: 'cpp', c: 'c',
    java: 'java', php: 'php', rb: 'ruby',
  }
  return map[ext || ''] || 'plaintext'
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    ts: '📘', tsx: '📘', js: '📜', jsx: '📜',
    py: '🐍', go: '🔵', rs: '🦀',
    html: '🌐', css: '🎨', json: '📋',
    md: '📝', txt: '📄', sh: '⚡',
  }
  return icons[ext || ''] || '📄'
}

interface OpenFile {
  path: string
  name: string
  content: string
  modified: boolean
  language: string
}

export default function Editor() {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [showExplorer, setShowExplorer] = useState(true)
  const [explorerPath, setExplorerPath] = useState('C:\\Users\\Shaik.salmaan\\webos')
  const [explorerItems, setExplorerItems] = useState<any[]>([])

  // Load explorer
  useEffect(() => {
    loadExplorer(explorerPath)
  }, [explorerPath])

  const loadExplorer = async (dirPath: string) => {
    try {
      const res = await fetch(`${API}/api/files/list?path=${encodeURIComponent(dirPath)}`)
      const data = await res.json()
      if (data.success) setExplorerItems(data.items)
    } catch {}
  }

  const openFile = async (filePath: string, fileName: string) => {
    // If already open, just switch to it
    if (openFiles.find(f => f.path === filePath)) {
      setActiveFile(filePath)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/files/read?path=${encodeURIComponent(filePath)}`)
      const data = await res.json()
      if (data.success) {
        const newFile: OpenFile = {
          path: filePath,
          name: fileName,
          content: data.content,
          modified: false,
          language: detectLanguage(fileName),
        }
        setOpenFiles(prev => [...prev, newFile])
        setActiveFile(filePath)
      }
    } catch {}
    setLoading(false)
  }

  const closeFile = (filePath: string) => {
    const file = openFiles.find(f => f.path === filePath)
    if (file?.modified) {
      if (!confirm('Unsaved changes. Close anyway?')) return
    }
    const remaining = openFiles.filter(f => f.path !== filePath)
    setOpenFiles(remaining)
    if (activeFile === filePath) {
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1].path : null)
    }
  }

  const saveFile = async (filePath: string) => {
    const file = openFiles.find(f => f.path === filePath)
    if (!file) return

    try {
      const res = await fetch(`${API}/api/files/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: file.content })
      })
      const data = await res.json()
      if (data.success) {
        setOpenFiles(prev => prev.map(f =>
          f.path === filePath ? { ...f, modified: false } : f
        ))
        setSaveStatus('✓ Saved')
        setTimeout(() => setSaveStatus(''), 2000)
      }
    } catch {
      setSaveStatus('✗ Save failed')
      setTimeout(() => setSaveStatus(''), 2000)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFile || value === undefined) return
    setOpenFiles(prev => prev.map(f =>
      f.path === activeFile ? { ...f, content: value, modified: true } : f
    ))
  }

  const activeFileData = openFiles.find(f => f.path === activeFile)

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#060810',
    }}
      onKeyDown={e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault()
          if (activeFile) saveFile(activeFile)
        }
      }}
      tabIndex={0}
    >
      {/* Top bar */}
      <div style={{
        height: '40px', background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '8px', flexShrink: 0,
      }}>
        {/* Explorer toggle */}
        <button
          onClick={() => setShowExplorer(!showExplorer)}
          style={{
            background: showExplorer ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showExplorer ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px', color: showExplorer ? '#60a5fa' : '#8b949e',
            padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
          }}
        >
          📁 Explorer
        </button>

        {/* Save button */}
        {activeFile && (
          <button
            onClick={() => saveFile(activeFile)}
            style={{
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '6px', color: '#00ff88',
              padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
            }}
          >
            💾 Save
          </button>
        )}

        {/* Save status */}
        {saveStatus && (
          <span style={{
            fontSize: '12px',
            color: saveStatus.includes('✓') ? '#00ff88' : '#ff4444'
          }}>
            {saveStatus}
          </span>
        )}

        {/* Language indicator */}
        {activeFileData && (
          <span style={{
            marginLeft: 'auto', fontSize: '11px',
            color: '#484f58', letterSpacing: '0.5px',
          }}>
            {activeFileData.language.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* File Explorer Sidebar */}
        {showExplorer && (
          <div style={{
            width: '220px', flexShrink: 0,
            background: '#0a0c10',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 12px',
              fontSize: '10px', color: '#484f58',
              letterSpacing: '1px', fontWeight: 600,
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              EXPLORER
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {explorerItems.map(item => (
                <div
                  key={item.path}
                  onClick={() => {
                    if (item.isDirectory) {
                      setExplorerPath(item.path)
                    } else {
                      openFile(item.path, item.name)
                    }
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 12px', cursor: 'pointer',
                    fontSize: '12px',
                    color: item.isDirectory ? '#60a5fa' : '#c9d1d9',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>
                    {item.isDirectory ? '📁' : getFileIcon(item.name)}
                  </span>
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Back button */}
            <div
              onClick={() => {
                const parts = explorerPath.split('\\')
                parts.pop()
                setExplorerPath(parts.join('\\') || 'C:\\')
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{
                padding: '8px 12px', cursor: 'pointer',
                fontSize: '12px', color: '#484f58',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.1s',
              }}
            >
              ← Go up
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* File Tabs */}
          {openFiles.length > 0 && (
            <div style={{
              height: '36px', background: '#0d1117',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center',
              overflowX: 'auto', flexShrink: 0,
            }}>
              {openFiles.map(file => (
                <div
                  key={file.path}
                  onClick={() => setActiveFile(file.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0 14px', height: '100%',
                    cursor: 'pointer', flexShrink: 0,
                    fontSize: '12px',
                    background: activeFile === file.path
                      ? '#060810'
                      : 'transparent',
                    color: activeFile === file.path ? '#f0f4ff' : '#8b949e',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    borderTop: activeFile === file.path
                      ? '1px solid #3b82f6'
                      : '1px solid transparent',
                  }}
                >
                  <span>{getFileIcon(file.name)}</span>
                  <span>{file.name}</span>
                  {file.modified && (
                    <span style={{ color: '#f59e0b', fontSize: '10px' }}>●</span>
                  )}
                  <span
                    onClick={e => { e.stopPropagation(); closeFile(file.path) }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff5f57'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#484f58'}
                    style={{ color: '#484f58', marginLeft: '4px', fontSize: '14px' }}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Editor Area */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {loading && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: '#484f58', fontSize: '13px',
              }}>
                Loading file...
              </div>
            )}

            {!loading && !activeFileData && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: '12px', color: '#484f58',
              }}>
                <span style={{ fontSize: '48px' }}>⚡</span>
                <span style={{ fontSize: '14px' }}>Open a file from the explorer</span>
                <span style={{ fontSize: '12px', color: '#3a4460' }}>
                  Click any file on the left to start editing
                </span>
              </div>
            )}

            {!loading && activeFileData && (
              <MonacoEditor
                height="100%"
                language={activeFileData.language}
                value={activeFileData.content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  minimap: { enabled: true },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  bracketPairColorization: { enabled: true },
                  padding: { top: 12 },
                  automaticLayout: true,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}