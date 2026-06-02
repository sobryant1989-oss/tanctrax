import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable')
}

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

const pool = globalThis.__pgPool ?? new Pool({ connectionString })

if (!globalThis.__pgPool) {
  globalThis.__pgPool = pool
}

export const db = pool
