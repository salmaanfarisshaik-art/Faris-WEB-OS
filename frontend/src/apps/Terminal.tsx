import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { io, Socket } from 'socket.io-client'
import '@xterm/xterm/css/xterm.css'

interface Props {
  windowId: string
  onClose: () => void
}

export default function TerminalApp({ onClose }: Props) {
  const termRef = useRef<HTMLDivElement>(null)
  const termInstance = useRef<Terminal | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!termRef.current || termInstance.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Courier New, monospace',
      cursorStyle: 'block',
      scrollback: 1000,
      theme: {
        background: '#060810',
        foreground: '#f0f4ff',
        cursor: '#00ff88',
        cursorAccent: '#060810',
        black: '#1e2030',
        red: '#ff5f57',
        green: '#00ff88',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#f0f4ff',
        brightBlack: '#484f58',
        brightGreen: '#00ff88',
        brightBlue: '#60a5fa',
      },
      allowTransparency: true,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(termRef.current)
    setTimeout(() => fitAddon.fit(), 100)
    termInstance.current = term

    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: false,
    })
    socketRef.current = socket

    socket.on('terminal:output', (data: string) => {
      term.write(data)
      // Close window when session ends
      if (data.includes('[Session ended]')) {
        setTimeout(() => onClose(), 800)
      }
    })

    term.onData((data) => {
      socket.emit('terminal:input', data)
    })

    const observer = new ResizeObserver(() => {
      try { fitAddon.fit() } catch (e) {}
    })
    observer.observe(termRef.current)
    termRef.current.addEventListener('click', () => term.focus())

    return () => {
      observer.disconnect()
      socket.disconnect()
      term.dispose()
      termInstance.current = null
      socketRef.current = null
    }
  }, [])

  return (
    <div
      style={{
        width: '100%', height: '100%',
        background: '#060810',
        padding: '8px',
        boxSizing: 'border-box',
        cursor: 'text',
      }}
      onClick={() => termInstance.current?.focus()}
    >
      <div ref={termRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}