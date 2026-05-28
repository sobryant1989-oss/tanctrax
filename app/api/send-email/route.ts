import { NextRequest, NextResponse } from 'next/server'

interface SendEmailRequest {
  workOrderNumber: string
  building: string
  description: string
  priority: string
  recipientEmail: string
  estimatedCompletionDate: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json()

    // TODO: Implement Microsoft Graph API call
    // This is a placeholder for the actual implementation
    // You'll need to:
    // 1. Get an access token from Azure AD
    // 2. Call the Microsoft Graph API to send email
    // 3. Log the email in the database

    const emailContent = `
      <h2>Work Order: ${body.workOrderNumber}</h2>
      <p><strong>Building:</strong> ${body.building}</p>
      <p><strong>Description:</strong> ${body.description}</p>
      <p><strong>Priority:</strong> ${body.priority}</p>
      <p><strong>Estimated Completion Date:</strong> ${body.estimatedCompletionDate}</p>
      <p>Please acknowledge receipt of this work order.</p>
    `

    // Placeholder response
    return NextResponse.json(
      {
        success: true,
        message: 'Email would be sent to ' + body.recipientEmail,
        workOrderNumber: body.workOrderNumber,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}