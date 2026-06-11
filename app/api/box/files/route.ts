import { getLatestBoxConnection } from '@/lib/boxRepository'

export async function GET() {
  const connection = await getLatestBoxConnection()

  if (!connection?.access_token) {
    return Response.json(
      { error: 'Box is not connected' },
      { status: 401 },
    )
  }

  const response = await fetch('https://api.box.com/2.0/folders/0/items', {
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
    },
  })

  const files = await response.json()

  return Response.json(files, { status: response.status })
}
