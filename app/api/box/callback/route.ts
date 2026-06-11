import { saveBoxConnection } from '@/lib/boxRepository'

type BoxTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type BoxMeResponse = {
  login?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return Response.json(
      { error: 'No authorization code' },
      { status: 400 },
    )
  }

  const response = await fetch('https://api.box.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.BOX_CLIENT_ID!,
      client_secret: process.env.BOX_CLIENT_SECRET!,
    }),
  })

  const token = await response.json() as BoxTokenResponse

  if (!response.ok || !token.access_token) {
    return Response.json(
      {
        error: token.error || 'Unable to connect Box',
        error_description: token.error_description,
      },
      { status: response.status || 500 },
    )
  }

  const meResponse = await fetch('https://api.box.com/2.0/users/me', {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  })

  const me = await meResponse.json() as BoxMeResponse

  if (!meResponse.ok) {
    return Response.json(
      { error: 'Unable to load Box user profile' },
      { status: meResponse.status || 500 },
    )
  }

  const connection = await saveBoxConnection({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
  }, me.login)

  return Response.json({
    connected: true,
    connection,
  })
}
