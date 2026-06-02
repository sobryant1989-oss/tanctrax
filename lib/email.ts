import nodemailer from 'nodemailer'
import { ConfidentialClientApplication } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'

export type WorkOrderEmailData = {
  workOrderNumber: string
  generatedAt: string
  engineerName: string
  engineerEmail: string
  pcrSoNumber: string
  buildingAbbr: string
  building: string
  roomNumber: string
  scopeOfWork: string
}

const recipientEmail = 'sheltonbryant@lsu.edu'

function buildSubject(input: WorkOrderEmailData) {
  return `PCR SO# ${input.pcrSoNumber} - ${input.buildingAbbr}`
}

function buildHtml(input: WorkOrderEmailData) {
  return `
    <h2>New Work Order</h2>
    <p><strong>Work Order Number:</strong> ${input.workOrderNumber}</p>
    <p><strong>Generated At:</strong> ${input.generatedAt}</p>
    <p><strong>Engineer:</strong> ${input.engineerName} &lt;${input.engineerEmail}&gt;</p>
    <p><strong>PCR SO#:</strong> ${input.pcrSoNumber}</p>
    <p><strong>Building:</strong> ${input.building} (${input.buildingAbbr})</p>
    <p><strong>Room:</strong> ${input.roomNumber}</p>
    <p><strong>Scope Of Work:</strong><br/>${input.scopeOfWork}</p>
  `
}

async function sendGraphMail(subject: string, html: string) {
  const clientId = process.env.AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET
  const tenantId = process.env.AZURE_TENANT_ID
  const sendAs = process.env.AZURE_EMAIL_SENDER || 'sheltonbryant@lsu.edu'

  if (!clientId || !clientSecret || !tenantId) {
    throw new Error('Missing Azure AD credentials for Microsoft Graph email')
  }

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  })

  const tokenResp = await cca.acquireTokenByClientCredential({ scopes: ['https://graph.microsoft.com/.default'] })
  const accessToken = tokenResp?.accessToken

  if (!accessToken) {
    throw new Error('Unable to acquire Microsoft Graph access token')
  }

  const graphClient = Client.init({
    authProvider: done => {
      done(null, accessToken)
    },
  })

  const message = {
    subject,
    body: { contentType: 'HTML', content: html },
    toRecipients: [{ emailAddress: { address: recipientEmail } }],
  }

  await graphClient.api(`/users/${encodeURIComponent(sendAs)}/sendMail`).post({ message, saveToSentItems: true })
}

async function sendSmtpMail(subject: string, html: string) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user || 'no-reply@lsu.edu'

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration for fallback email send')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from,
    to: recipientEmail,
    subject,
    html,
  })
}

export async function sendWorkOrderNotificationEmail(input: WorkOrderEmailData) {
  const subject = buildSubject(input)
  const html = buildHtml(input)

  try {
    await sendGraphMail(subject, html)
    return { provider: 'graph' }
  } catch (graphError) {
    console.error('Graph email failed, falling back to SMTP:', graphError)
    await sendSmtpMail(subject, html)
    return { provider: 'smtp' }
  }
}
