# Microsoft Graph API Setup Guide

## Overview

This guide will help you set up Microsoft Azure AD and Microsoft Graph API to enable sending emails through Outlook/Office 365.

## Step 1: Create an Azure Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Go to "Azure Active Directory"
4. Click "App registrations" in the left menu
5. Click "New registration"
6. Enter details:
   - Name: "TancTrax Work Order System"
   - Supported account types: "Accounts in any organizational directory"
   - Redirect URI: Web - `http://localhost:3000/api/auth/callback`
7. Click "Register"

## Step 2: Get Your Credentials

On the app registration page:

1. Copy the **Application (client) ID** → `AZURE_CLIENT_ID` in `.env.local`
2. Copy the **Directory (tenant) ID** → `AZURE_TENANT_ID` in `.env.local`

## Step 3: Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Enter description: "Email sending secret"
4. Set expiration to 12 months
5. Click "Add"
6. Copy the secret value → `AZURE_CLIENT_SECRET` in `.env.local`
   (Note: You can only copy this once)

## Step 4: Grant API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Application permissions"
5. Search for and add:
   - `Mail.Send` - Send mail as any user
   - `User.Read` - Read user profiles
6. Click "Grant admin consent"

## Step 5: Configure Email Sender

You have two options:

### Option A: Send as Application (Recommended for Automation)

Your app will send emails as the application. This works with a shared mailbox.

1. In Azure AD, go to "Enterprise applications"
2. Find your app
3. Go to "Permissions"
4. Grant admin consent

### Option B: Send as Specific User

1. Go to Microsoft 365 Admin Center
2. Create a service account for the app
3. Assign Microsoft 365 license
4. Update `AZURE_TENANT_ID` to use that user's tenant

## Step 6: Create Shared Mailbox (Optional)

If you want a dedicated email for work orders:

1. Go to Microsoft 365 Admin Center
2. Go to "Mailboxes" → "Shared mailboxes"
3. Click "Add a shared mailbox"
4. Enter name: "WorkOrderNotifications"
5. Add members
6. Use this email in the application

## Step 7: Update Environment Variables

Add to `.env.local`:

```
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
AZURE_TENANT_ID=your-tenant-id-here
```

## Step 8: Implement Email Sending

Update `app/api/send-email/route.ts` with the actual implementation:

```typescript
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
)

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default'],
})

const client = new Client()
  .init({ authProvider })

// Send email using Graph API
await client.api('/users/{id}/sendMail').post({
  message: {
    subject: 'Work Order: WO-2026-000001',
    body: { contentType: 'HTML', content: emailContent },
    toRecipients: [{ emailAddress: { address: recipientEmail } }],
  },
  saveToSentItems: true,
})
```

## Troubleshooting

### "Invalid tenant"
- Verify `AZURE_TENANT_ID` is correct
- Check in Azure Portal → Directory ID

### "Insufficient permissions"
- Go to API permissions
- Click "Grant admin consent"
- Wait a few minutes for permission propagation

### "Invalid client secret"
- Create a new secret in Certificates & secrets
- Update `.env.local`

### "Invalid redirect URI"
- Add the correct URI in "Authentication"
- For localhost: `http://localhost:3000`
- For production: `https://yourdomain.com`

## Testing Email Sending

Create a test endpoint in `app/api/test-email/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  // Call send-email API
  const response = await fetch('http://localhost:3000/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workOrderNumber: 'WO-2026-000001',
      building: 'Building A',
      description: 'Test work order',
      priority: 'High',
      recipientEmail: 'your-test-email@company.com',
      estimatedCompletionDate: '2026-05-15',
    }),
  })

  return NextResponse.json(await response.json())
}
```

Then visit: `http://localhost:3000/api/test-email`

## Production Considerations

1. **Sender Address**: Use a dedicated service account email
2. **Rate Limiting**: Implement rate limiting on email sending
3. **Retry Logic**: Add retry logic for failed email sends
4. **Logging**: Log all email activity for audit purposes
5. **Templates**: Create email templates for different work order statuses

## Useful Resources

- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/api/overview)
- [Send Email via Graph API](https://learn.microsoft.com/en-us/graph/api/user-sendmail)
- [Azure Identity Documentation](https://learn.microsoft.com/en-us/javascript/api/@azure/identity/)
- [Azure AD Best Practices](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/)