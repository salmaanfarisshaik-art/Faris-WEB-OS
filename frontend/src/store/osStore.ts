import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

export interface WindowState {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  app: string
}

interface OSStore {
  windows: WindowState[]
  socket: Socket | null
  initSync: (token: string) => void
  openWindow: (app: string, title: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
}

let windowCounter = 0

const broadcast = (socket: Socket | null, action: string, payload: any) => {
  if (socket) socket.emit('os:action', { action, payload })
}

export const useOSStore = create<OSStore>((set, get) => ({
  windows: [],
  socket: null,

  initSync: (token: string) => {
    if (get().socket) return

    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('OS sync connected')
      socket.emit('os:join')
    })

    socket.on('os:state', (windows: WindowState[]) => {
      set({ windows })
    })

    set({ socket })
  },

  openWindow: (app, title) => {
    const id = `${app}-${++windowCounter}`
    const allWindows = get().windows
    const highestZ = allWindows.length > 0
      ? Math.max(...allWindows.map(w => w.zIndex))
      : 0
    const offset = (windowCounter % 8) * 30

    const newWindow: WindowState = {
      id, title,
      x: Math.round(window.innerWidth / 2 - 450) + offset,
      y: Math.round(window.innerHeight / 2 - 290) + offset,
      width: 900, height: 580,
      zIndex: highestZ + 1,
      isMinimized: false,
      isMaximized: false,
      app
    }

    const newWindows = [...allWindows, newWindow]
    set({ windows: newWindows })
    broadcast(get().socket, 'OPEN_WINDOW', newWindows)
  },

  closeWindow: (id) => {
    const newWindows = get().windows.filter(w => w.id !== id)
    set({ windows: newWindows })
    broadcast(get().socket, 'CLOSE_WINDOW', newWindows)
  },

  focusWindow: (id) => {
    const allWindows = get().windows
    if (allWindows.length === 0) return
    const highestZ = Math.max(...allWindows.map(w => w.zIndex))
    const newWindows = allWindows.map(w =>
      w.id === id ? { ...w, zIndex: highestZ + 1 } : w
    )
    set({ windows: newWindows })
    broadcast(get().socket, 'FOCUS_WINDOW', newWindows)
  },

  minimizeWindow: (id) => {
    const newWindows = get().windows.map(w =>
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    )
    set({ windows: newWindows })
    broadcast(get().socket, 'MINIMIZE_WINDOW', newWindows)
  },

  toggleMaximize: (id) => {
    const newWindows = get().windows.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    )
    set({ windows: newWindows })
    broadcast(get().socket, 'MAXIMIZE_WINDOW', newWindows)
  },

  updateWindowPosition: (id, x, y) => {
    const newWindows = get().windows.map(w =>
      w.id === id ? { ...w, x, y } : w
    )
    set({ windows: newWindows })
    broadcast(get().socket, 'MOVE_WINDOW', newWindows)
  },

  updateWindowSize: (id, width, height) => {
    const newWindows = get().windows.map(w =>
      w.id === id ? { ...w, width, height } : w
    )
    set({ windows: newWindows })
    broadcast(get().socket, 'RESIZE_WINDOW', newWindows)
  },
}))