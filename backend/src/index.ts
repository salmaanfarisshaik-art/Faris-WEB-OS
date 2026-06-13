import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { spawn } from 'child_process'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

import { initDB } from './db'
import { connectRedis, redisClient } from './redisClient'
import authRoutes from './authRoutes'

const app = express()
const httpServer = createServer(app)

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// ─── AUTH ROUTES ─────────────────────────────────────────
app.use('/api/auth', authRoutes)

// ─── HEALTH ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'Beast OS Backend Running 🔥' })
})

// ─── FILE ROUTES ─────────────────────────────────────────
const ROOT_DIR = `C:\\Users\\Shaik.salmaan`

app.get('/api/files/list', (req, res) => {
  const dirPath = (req.query.path as string) || ROOT_DIR
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
    const result = items.map(item => {
      const fullPath = path.join(dirPath, item.name)
      let size = 0
      let modified = new Date()
      try {
        const stat = fs.statSync(fullPath)
        size = stat.size
        modified = stat.mtime
      } catch {}
      return {
        name: item.name,
        isDirectory: item.isDirectory(),
        path: fullPath,
        size,
        modified,
      }
    })
    res.json({ success: true, items: result, currentPath: dirPath })
  } catch (err) {
    res.json({ success: false, error: 'Cannot read directory' })
  }
})

app.get('/api/files/read', (req, res) => {
  const filePath = req.query.path as string
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    res.json({ success: true, content })
  } catch {
    res.json({ success: false, error: 'Cannot read file' })
  }
})

app.post('/api/files/create', (req, res) => {
  const { path: filePath, type } = req.body
  try {
    if (type === 'folder') {
      fs.mkdirSync(filePath, { recursive: true })
    } else {
      fs.writeFileSync(filePath, '')
    }
    res.json({ success: true })
  } catch {
    res.json({ success: false, error: 'Cannot create' })
  }
})

app.delete('/api/files/delete', (req, res) => {
  const { path: filePath } = req.body
  try {
    fs.rmSync(filePath, { recursive: true, force: true })
    res.json({ success: true })
  } catch {
    res.json({ success: false, error: 'Cannot delete' })
  }
})

app.post('/api/files/rename', (req, res) => {
  const { oldPath, newName } = req.body
  const dir = path.dirname(oldPath)
  const newPath = path.join(dir, newName)
  try {
    fs.renameSync(oldPath, newPath)
    res.json({ success: true })
  } catch {
    res.json({ success: false, error: 'Cannot rename' })
  }
})

app.post('/api/files/write', (req, res) => {
  const { path: filePath, content } = req.body
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    res.json({ success: true })
  } catch {
    res.json({ success: false, error: 'Cannot write file' })
  }
})

// ─── SYSTEM STATS ────────────────────────────────────────
app.get('/api/system/stats', (req, res) => {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  const cpuInfo = cpus.map((cpu, i) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
    const idle = cpu.times.idle
    const usage = Math.round(((total - idle) / total) * 100)
    return { core: i + 1, usage, model: cpu.model, speed: cpu.speed }
  })

  res.json({
    success: true,
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      usage: cpuInfo,
      avgUsage: Math.round(cpuInfo.reduce((a, b) => a + b.usage, 0) / cpuInfo.length)
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usedPercent: Math.round((usedMem / totalMem) * 100)
    },
    os: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      type: os.type(),
    }
  })
})

// ─── BROWSER PROXY ───────────────────────────────────────
app.get('/api/browser/fetch', async (req, res) => {
  const url = req.query.url as string
  if (!url) return res.json({ success: false, error: 'No URL provided' })

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    })

    let html = await response.text()
    const finalUrl = response.url

    html = html.replace(
      '<head>',
      `<head><base href="${finalUrl}"><style>::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}</style>`
    )

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(html)
  } catch (err: any) {
    res.json({ success: false, error: err.message })
  }
})

// ─── WEBSOCKET ───────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  // ── Terminal ──
  const shell = spawn('powershell.exe', ['-NoLogo'], {
    env: process.env as { [key: string]: string },
    cwd: ROOT_DIR,
    windowsHide: false,
  })

  shell.stdout.on('data', (data) => {
    socket.emit('terminal:output', data.toString())
  })

  shell.stderr.on('data', (data) => {
    socket.emit('terminal:output', data.toString())
  })

  socket.on('terminal:input', (data: string) => {
    if (data === '\r') {
      shell.stdin.write('\r\n')
    } else if (data === '\x7f') {
      shell.stdin.write('\b')
    } else {
      shell.stdin.write(data)
    }
  })

  shell.on('close', () => {
    socket.emit('terminal:output', `\r\n\x1b[1;31m[Session ended]\x1b[0m\r\n`)
  })

  // ── OS State Sync ──
  socket.on('os:join', async () => {
    try {
      const token = (socket.handshake.auth as any).token
      if (!token) return

      const session = await redisClient.get(`session:${token}`)
      if (!session) return

      const parsed = JSON.parse(session as string)
      const userId = parsed.userId
      const room = `os:${userId}`

      socket.join(room)
      console.log(`User ${userId} joined OS room`)

      // Send saved state to this device
      const state = await redisClient.get(`os_state:${userId}`)
      if (state) {
        socket.emit('os:state', JSON.parse(state as string))
      }
    } catch (err) {
      console.error('os:join error:', err)
    }
  })

  socket.on('os:action', async (data: { action: string; payload: any }) => {
    try {
      const token = (socket.handshake.auth as any).token
      if (!token) return

      const session = await redisClient.get(`session:${token}`)
      if (!session) return

      const parsed = JSON.parse(session as string)
      const userId = parsed.userId
      const room = `os:${userId}`

      // Save to Redis
      await redisClient.setEx(
        `os_state:${userId}`,
        86400,
        JSON.stringify(data.payload)
      )

      // Broadcast to other devices
      socket.to(room).emit('os:state', data.payload)
    } catch (err) {
      console.error('os:action error:', err)
    }
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
    shell.kill()
  })
})

// ─── START ────────────────────────────────────────────────
httpServer.listen(3001, async () => {
  await connectRedis()
  await initDB()
  console.log('✅ Beast OS Backend running on http://localhost:3001')
})