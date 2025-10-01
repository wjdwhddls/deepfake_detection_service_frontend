import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5050

// --- DB ---
const dbFile = path.join(__dirname, 'data.db')
const db = new sqlite3.Database(dbFile)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    source TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`)
})

// --- Middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: true, credentials: false }))
app.use(express.json())

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
})
app.use(limiter)

// --- API ---
app.get('/health', (_, res) => res.json({ ok: true }))

app.post('/api/subscribe', (req, res) => {
  const { email, source } = req.body || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: '유효한 이메일을 입력하세요.' })
  }
  db.run(
    'INSERT OR IGNORE INTO subscribers(email, source) VALUES(?, ?)',
    [email.trim().toLowerCase(), (source || 'landing').substring(0, 64)],
    function(err) {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: '저장 중 오류가 발생했습니다.' })
      }
      const inserted = this.changes > 0
      res.json({ message: inserted ? '구독이 완료되었습니다!' : '이미 등록된 이메일입니다.' })
    }
  )
})

app.get('/api/subscribe/count', (_, res) => {
  db.get('SELECT COUNT(*) as count FROM subscribers', (err, row) => {
    if (err) return res.status(500).json({ error: 'DB 오류' })
    res.json({ count: row?.count || 0 })
  })
})

// --- Static (optional): serve built frontend if copied to ../frontend/dist ---
const dist = path.resolve(__dirname, '../frontend/dist')
app.use(express.static(dist))
app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('Not Found')
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('DB file:', dbFile)
})
