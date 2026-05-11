import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { spawn } from 'child_process'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'

const app = express()
const httpServer = createServer(app)

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
})

const ROOT_DIR = `C:\\Users\\Shaik.salmaan`

// ─── FILE ROUTES ─────────────────────────────────────────

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

app.get('/health', (req, res) => {
  res.json({ status: 'Beast OS Backend Running 🔥' })
})

// ─── TERMINAL ────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Terminal connected:', socket.id)

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

  shell.on('error', (err) => {
    socket.emit('terminal:output', `\r\n\x1b[1;31m[Error: ${err.message}]\x1b[0m\r\n`)
  })

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id)
    shell.kill()
  })
})
import * as os from 'os'

// System stats route
app.get('/api/system/stats', (req, res) => {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  // Calculate CPU usage per core
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
    },
    network: os.networkInterfaces()
  })
})

// ─── START ────────────────────────────────────────────────

httpServer.listen(3001, () => {
  console.log('✅ Beast OS Backend running on http://localhost:3001')
})