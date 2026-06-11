import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.BOX_CLIENT_ID!,
    redirect_uri: process.env.BOX_REDIRECT_URI!,
  })

  return NextResponse.redirect(
    `https://account.box.com/api/oauth2/authorize?${params}`,
  )
}
