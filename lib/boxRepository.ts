import { db } from './db'

type BoxTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

async function ensureBoxConnectionTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS box_connections (
      id SERIAL PRIMARY KEY,
      user_email TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

export async function saveBoxConnection(token: BoxTokenResponse, userEmail?: string | null) {
  await ensureBoxConnectionTable()

  const expiresAt = token.expires_in
    ? new Date(Date.now() + token.expires_in * 1000).toISOString()
    : null

  const result = await db.query(
    `
      INSERT INTO box_connections (
        user_email,
        access_token,
        refresh_token,
        expires_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, user_email, expires_at, created_at, updated_at
    `,
    [
      userEmail || null,
      token.access_token,
      token.refresh_token || null,
      expiresAt,
    ],
  )

  return result.rows[0]
}

export async function getLatestBoxConnection() {
  await ensureBoxConnectionTable()

  const result = await db.query(`
    SELECT *
    FROM box_connections
    ORDER BY created_at DESC
    LIMIT 1
  `)

  return result.rows[0] || null
}
