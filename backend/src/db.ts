import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      )
    `)

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@beastos.com'
    const adminExists = await pool.query(
      `SELECT id FROM users WHERE email = $1`, [adminEmail]
    )

    if (adminExists.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10)
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, 'admin', 'approved')`,
        ['Admin', adminEmail, hash]
      )
      console.log(`✅ Default admin created: ${adminEmail} / admin123`)
    }

    console.log('✅ Database initialized')
  } catch (err) {
    console.error('❌ Database error:', err)
  }
}