import { create } from 'zustand'

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
  openWindow: (app: string, title: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
}

let windowCounter = 0

export const useOSStore = create<OSStore>((set, get) => ({
  windows: [],

  openWindow: (app, title) => {
    const id = `${app}-${++windowCounter}`
    const allWindows = get().windows
    const highestZ = allWindows.length > 0
      ? Math.max(...allWindows.map(w => w.zIndex))
      : 0
    const offset = (windowCounter % 8) * 30

    set(state => ({
      windows: [...state.windows, {
        id, title,
        x: 120 + offset,
        y: 80 + offset,
        width: 900,
        height: 580,
        zIndex: highestZ + 1,
        isMinimized: false,
        isMaximized: false,
        app
      }]
    }))
  },

  closeWindow: (id) =>
    set(state => ({ windows: state.windows.filter(w => w.id !== id) })),

  focusWindow: (id) => {
    const highestZ = Math.max(...get().windows.map(w => w.zIndex))
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, zIndex: highestZ + 1 } : w
      )
    }))
  },

  minimizeWindow: (id) =>
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      )
    })),

  toggleMaximize: (id) =>
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    })),

  updateWindowPosition: (id, x, y) =>
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, x, y } : w
      )
    }))
}))