import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Create a new connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Initialize Drizzle with the pool
export const db = drizzle(pool)

// Optional: quick connection test
pool.connect()
  .then(client => {
    console.log('✅ Database connected')
    client.release()
  })
  .catch(err => {
    console.error('❌ Database connection error:', err)
  })