import { NextResponse } from 'next/server'

export async function GET() {
  const redirectUri = process.env.BOX_REDIRECT_URI

  if (!redirectUri) {
    return NextResponse.json(
      { error: 'Missing BOX_REDIRECT_URI environment variable' },
      { status: 500 },
    )
  }

  const parsedRedirectUri = new URL(redirectUri)
  const isLocalhost = parsedRedirectUri.hostname === 'localhost' || parsedRedirectUri.hostname === '127.0.0.1'

  if (parsedRedirectUri.protocol !== 'https:' && !isLocalhost) {
    return NextResponse.json(
      {
        error: 'Box requires HTTPS redirect URIs unless you are using localhost.',
        redirect_uri: redirectUri,
      },
      { status: 400 },
    )
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.BOX_CLIENT_ID!,
    redirect_uri: redirectUri,
  })

  return NextResponse.redirect(
    `https://account.box.com/api/oauth2/authorize?${params}`,
  )
}
