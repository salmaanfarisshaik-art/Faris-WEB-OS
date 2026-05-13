import { Router, Request, Response } from 'express'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { pool } from './db'
import { redisClient } from './redisClient'
import { sendApprovalEmail, sendRejectionEmail, sendNewRegistrationAlert } from './email'

const router = Router()
const SECRET = process.env.JWT_SECRET || 'beastos_secret'

const getSession = async (req: Request): Promise<any | null> => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  try {
    const session = await redisClient.get(`session:${token}`)
    if (!session) return null
    return JSON.parse(session as string)
  } catch { return null }
}

// REGISTER
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.json({ success: false, error: 'All fields required' }) as any

  if (password.length < 6)
    return res.json({ success: false, error: 'Password must be at least 6 characters' }) as any

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0)
      return res.json({ success: false, error: 'Email already registered' }) as any

    const hash = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name, email, hash]
    )

    try { await sendNewRegistrationAlert(name, email) } catch {}

    res.json({ success: true, message: 'Registration successful! Await admin approval.' })
  } catch (err) {
    res.json({ success: false, error: 'Registration failed' })
  }
})

// LOGIN
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user)
      return res.json({ success: false, error: 'Invalid credentials' }) as any

    if (user.status === 'pending')
      return res.json({ success: false, error: 'Account pending admin approval' }) as any

    if (user.status === 'rejected')
      return res.json({ success: false, error: 'Account not approved' }) as any

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid)
      return res.json({ success: false, error: 'Invalid credentials' }) as any

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '7d' }
    )

    await redisClient.setEx(
      `session:${token}`,
      604800,
      JSON.stringify({ userId: user.id, email: user.email, role: user.role })
    )

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    res.json({
      success: true, token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    res.json({ success: false, error: 'Login failed' })
  }
})

// LOGOUT
router.post('/logout', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) await redisClient.del(`session:${token}`)
  res.json({ success: true })
})

// VERIFY
router.get('/verify', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.json({ success: false }) as any

  try {
    const session = await redisClient.get(`session:${token}`)
    if (!session) return res.json({ success: false }) as any

    const decoded = jwt.verify(token, SECRET) as any
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.userId]
    )
    res.json({ success: true, user: result.rows[0] })
  } catch {
    res.json({ success: false })
  }
})

// ADMIN — get all users
router.get('/admin/users', async (req: Request, res: Response) => {
  const session = await getSession(req)
  if (!session || session.role !== 'admin')
    return res.json({ success: false, error: 'Unauthorized' }) as any

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, status, created_at, last_login FROM users ORDER BY created_at DESC'
    )
    res.json({ success: true, users: result.rows })
  } catch {
    res.json({ success: false, error: 'Failed' })
  }
})

// ADMIN — approve
router.post('/admin/approve/:userId', async (req: Request, res: Response) => {
  const session = await getSession(req)
  if (!session || session.role !== 'admin')
    return res.json({ success: false, error: 'Unauthorized' }) as any

  try {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING name, email',
      ['approved', req.params.userId]
    )
    const user = result.rows[0]
    try { await sendApprovalEmail(user.email, user.name) } catch {}
    res.json({ success: true })
  } catch {
    res.json({ success: false, error: 'Failed' })
  }
})

// ADMIN — reject
router.post('/admin/reject/:userId', async (req: Request, res: Response) => {
  const session = await getSession(req)
  if (!session || session.role !== 'admin')
    return res.json({ success: false, error: 'Unauthorized' }) as any

  try {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING name, email',
      ['rejected', req.params.userId]
    )
    const user = result.rows[0]
    try { await sendRejectionEmail(user.email, user.name) } catch {}
    res.json({ success: true })
  } catch {
    res.json({ success: false, error: 'Failed' })
  }
})

export default router