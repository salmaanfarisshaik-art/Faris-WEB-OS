import { useState, useEffect, useCallback } from 'react'

interface FileItem {
  name: string
  isDirectory: boolean
  path: string
  size: number
  modified: string
}

const API = 'http://localhost:3001'
const ROOT = 'C:\\Users\\Shaik.salmaan'

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(name: string, isDir: boolean): string {
  if (isDir) return '📁'
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    js: '📜', ts: '📘', tsx: '📘', jsx: '📜',
    py: '🐍', go: '🔵', rs: '🦀',
    html: '🌐', css: '🎨', json: '📋',
    md: '📝', txt: '📄', pdf: '📕',
    png: '🖼️', jpg: '🖼️', gif: '🖼️', svg: '🖼️',
    mp4: '🎬', mp3: '🎵',
    zip: '📦', rar: '📦', gz: '📦',
    exe: '⚙️', sh: '⚡', bat: '⚡',
  }
  return icons[ext || ''] || '📄'
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState(ROOT)
  const [items, setItems] = useState<FileItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [showNewMenu, setShowNewMenu] = useState(false)

  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/files/list?path=${encodeURIComponent(dirPath)}`)
      const data = await res.json()
      if (data.success) {
        // Sort: folders first, then files
        const sorted = data.items.sort((a: FileItem, b: FileItem) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
        setItems(sorted)
        setCurrentPath(data.currentPath)
        setSelected(null)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Cannot connect to backend')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadDirectory(ROOT) }, [])

  const navigate = (item: FileItem) => {
    if (item.isDirectory) {
      loadDirectory(item.path)
    }
  }

  const goUp = () => {
    const parts = currentPath.split('\\')
    if (parts.length > 1) {
      parts.pop()
      loadDirectory(parts.join('\\') || ROOT)
    }
  }

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    await fetch(`${API}/api/files/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: item.path })
    })
    loadDirectory(currentPath)
    setContextMenu(null)
  }

  const handleRename = async (item: FileItem) => {
    if (!newName.trim()) return
    await fetch(`${API}/api/files/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath: item.path, newName: newName.trim() })
    })
    setRenaming(null)
    setNewName('')
    loadDirectory(currentPath)
  }

  const handleCreate = async (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`)
    if (!name) return
    const newPath = currentPath + '\\' + name
    await fetch(`${API}/api/files/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: newPath, type: type === 'folder' ? 'folder' : 'file' })
    })
    setShowNewMenu(false)
    loadDirectory(currentPath)
  }

  const pathParts = currentPath.split('\\').filter(Boolean)

  return (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#060810' }}
      onClick={() => { setContextMenu(null); setShowNewMenu(false) }}
    >
      {/* Toolbar */}
      <div style={{
        height: '44px', background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '8px', flexShrink: 0,
      }}>
        {/* Back button */}
        <button
          onClick={goUp}
          disabled={currentPath === ROOT}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', color: currentPath === ROOT ? '#484f58' : '#f0f4ff',
            padding: '4px 10px', cursor: currentPath === ROOT ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          ←
        </button>

        {/* Breadcrumb */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
          padding: '4px 10px', fontSize: '12px', color: '#8b949e',
          overflow: 'hidden',
        }}>
          {pathParts.map((part, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ color: '#484f58' }}>›</span>}
              <span style={{ color: i === pathParts.length - 1 ? '#f0f4ff' : '#8b949e' }}>
                {part}
              </span>
            </span>
          ))}
        </div>

        {/* New button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setShowNewMenu(!showNewMenu) }}
            style={{
              background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '6px', color: '#00ff88',
              padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
            }}
          >
            + New
          </button>
          {showNewMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '4px',
              background: '#161b22', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', overflow: 'hidden', zIndex: 1000, minWidth: '140px',
            }}>
              <MenuItem label="📄 New File" onClick={() => handleCreate('file')} />
              <MenuItem label="📁 New Folder" onClick={() => handleCreate('folder')} />
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={() => loadDirectory(currentPath)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', color: '#8b949e',
            padding: '4px 10px', cursor: 'pointer', fontSize: '14px',
          }}
        >
          ↻
        </button>
      </div>

      {/* File list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#484f58' }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{ color: '#ff4444', padding: '16px', fontSize: '13px' }}>
            ⚠ {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ color: '#484f58', padding: '16px', fontSize: '13px' }}>
            Empty folder
          </div>
        )}

        {/* Table header */}
        {!loading && items.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 140px',
            padding: '4px 12px', marginBottom: '4px',
            fontSize: '11px', color: '#484f58', letterSpacing: '0.5px',
          }}>
            <span>NAME</span>
            <span style={{ textAlign: 'right' }}>SIZE</span>
            <span style={{ textAlign: 'right' }}>MODIFIED</span>
          </div>
        )}

        {!loading && items.map(item => (
          <div
            key={item.path}
            onClick={() => setSelected(item.path)}
            onDoubleClick={() => navigate(item)}
            onContextMenu={e => {
              e.preventDefault()
              e.stopPropagation()
              setContextMenu({ x: e.clientX, y: e.clientY, item })
            }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 140px',
              padding: '7px 12px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px',
              background: selected === item.path ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: selected === item.path ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              transition: 'all 0.1s',
              alignItems: 'center',
            }}
            onMouseEnter={e => {
              if (selected !== item.path)
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
            onMouseLeave={e => {
              if (selected !== item.path)
                e.currentTarget.style.background = 'transparent'
            }}
          >
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>
                {getFileIcon(item.name, item.isDirectory)}
              </span>
              {renaming === item.path ? (
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename(item)
                    if (e.key === 'Escape') { setRenaming(null); setNewName('') }
                  }}
                  onBlur={() => { setRenaming(null); setNewName('') }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: '#0d1117', border: '1px solid #3b82f6',
                    borderRadius: '4px', color: '#f0f4ff',
                    padding: '2px 6px', fontSize: '13px', width: '160px',
                  }}
                />
              ) : (
                <span style={{
                  color: item.isDirectory ? '#60a5fa' : '#f0f4ff',
                  fontWeight: item.isDirectory ? 500 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.name}
                </span>
              )}
            </div>

            {/* Size */}
            <span style={{ color: '#484f58', fontSize: '12px', textAlign: 'right' }}>
              {formatSize(item.size)}
            </span>

            {/* Modified */}
            <span style={{ color: '#484f58', fontSize: '11px', textAlign: 'right' }}>
              {new Date(item.modified).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div style={{
        height: '28px', background: '#0d1117',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', flexShrink: 0,
        fontSize: '11px', color: '#484f58', gap: '16px',
      }}>
        <span>{items.length} items</span>
        <span>{items.filter(i => i.isDirectory).length} folders</span>
        <span>{items.filter(i => !i.isDirectory).length} files</span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: contextMenu.y, left: contextMenu.x,
            background: '#161b22', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', overflow: 'hidden',
            zIndex: 99999, minWidth: '160px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {contextMenu.item.isDirectory && (
            <MenuItem label="📂 Open" onClick={() => { navigate(contextMenu.item); setContextMenu(null) }} />
          )}
          <MenuItem
            label="✏️ Rename"
            onClick={() => {
              setRenaming(contextMenu.item.path)
              setNewName(contextMenu.item.name)
              setContextMenu(null)
            }}
          />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <MenuItem
            label="🗑️ Delete"
            onClick={() => handleDelete(contextMenu.item)}
            danger
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({ label, onClick, danger }: {
  label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(255,68,68,0.15)' : 'rgba(255,255,255,0.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      style={{
        padding: '8px 14px', cursor: 'pointer',
        fontSize: '13px',
        color: danger ? '#ff4444' : '#f0f4ff',
        transition: 'background 0.1s',
      }}
    >
      {label}
    </div>
  )
}