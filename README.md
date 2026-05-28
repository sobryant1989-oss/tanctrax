# Work Order Tracker

A full-stack work order ticket tracking web application for a college campus maintenance department.

## Features

- **User Authentication** - Secure login with Supabase Auth
- **Work Order Dashboard** - Real-time ticket number dashboard with metrics
- **Create & Manage Work Orders** - Comprehensive form to create and manage tickets
- **Automatic Work Order Numbering** - WO-2026-000001 format with incrementing sequences
- **Email Notifications** - Automatic Outlook email sending via Microsoft Graph API
- **Work Order Tracking** - Monitor status changes from New to Closed
- **File Attachments** - Upload documents to work orders
- **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- **Dashboard Metrics** - View open, completed, and total work orders
- **Status Overview** - Real-time breakdown of work orders by status

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Node.js
- **Email**: Microsoft Graph API
- **Authentication**: Supabase Auth with Azure AD integration
- **Hosting**: Vercel (recommended)

## Project Structure

```
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Home/Dashboard page
│   ├── layout.tsx           # Root layout with sidebar
│   ├── login/               # Login page
│   ├── dashboard/           # Dashboard page
│   ├── work-orders/         # Work orders list
│   ├── work-orders/new/     # Create new work order form
│   ├── work-orders/[id]/    # Work order details
│   └── api/                 # API routes
├── components/              # React components
│   ├── Dashboard.tsx        # Main dashboard component
│   ├── MetricCard.tsx       # Metric display card
│   ├── WorkOrdersTable.tsx  # Work orders list table
│   └── Sidebar.tsx          # Navigation sidebar
├── lib/                     # Utility libraries
│   └── supabase.ts          # Supabase client
├── services/                # Business logic
│   └── workOrderService.ts  # Work order CRUD operations
├── types/                   # TypeScript type definitions
│   └── index.ts             # App types
├── utils/                   # Helper functions
│   └── helpers.ts           # Formatting and utility functions
├── supabase/                # Database
│   └── migrations/          # SQL migration files
└── public/                  # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available at supabase.com)
- Azure AD tenant (for Microsoft Graph API)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd TancTrax
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.local` file (already created in project root)
   - Update with your actual credentials

4. **Set up Supabase**:
   - Create a new project at supabase.com
   - Go to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial.sql`
   - Execute the SQL to create tables

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the Work Order Tracker dashboard

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Microsoft Azure / Office 365
AZURE_CLIENT_ID=your_client_id_here
AZURE_CLIENT_SECRET=your_client_secret_here
AZURE_TENANT_ID=your_tenant_id_here
```

## Database Schema

### Tables

- **profiles** - User profiles and roles
- **vendors** - Vendor information and contact details
- **work_orders** - Main work order tickets with all details
- **email_logs** - Log of sent emails
- **status_history** - Track status changes over time
- **attachments** - File attachments for work orders

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Dashboard Features

### Metric Cards
- **Total Work Orders** - All work orders in the system
- **Open Work Orders** - New, Sent, Acknowledged, In Progress, Waiting Parts
- **Completed** - Closed and completed work orders

### Recent Work Orders Table
Displays the 10 most recent work orders with:
- Work order number (clickable link)
- Building location
- Current status
- Priority level
- Assigned vendor
- Creation date

### Status Overview
Real-time breakdown of work orders grouped by status:
- New
- Sent
- Acknowledged
- In Progress
- Waiting Parts
- Completed
- Closed

## Work Order Statuses

- **New** - Work order created, not yet sent
- **Sent** - Email sent to vendor
- **Acknowledged** - Vendor confirmed receipt
- **In Progress** - Work is being performed
- **Waiting Parts** - Awaiting materials/parts
- **Completed** - Work finished, pending closure
- **Closed** - Work order closed

## Priority Levels

- **Low** - Non-urgent maintenance
- **Medium** - Standard priority
- **High** - Urgent attention needed
- **Urgent** - Critical issue requiring immediate action

## Work Order Number Format

Work orders are automatically numbered as: `WO-YYYY-NNNNNN`

Example: `WO-2026-000001`

- **WO** - Prefix
- **YYYY** - Current year
- **NNNNNN** - Six-digit incrementing sequence

## API Routes

### Email Integration
- `POST /api/send-email` - Send work order email via Microsoft Graph API

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy manually
npm run build
npm start
```

## Development Tips

- **Hot Reload**: Changes are automatically reloaded in the browser
- **TypeScript**: All code is type-safe
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Supabase**: Real-time database with built-in authentication

## Troubleshooting

### Dependencies not installing
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
- Verify Supabase URL and keys in `.env.local`
- Check that SQL migrations have been run
- Ensure Supabase project is active

### Email not sending
- Verify Azure AD credentials
- Check Microsoft Graph API permissions
- Review email logs in database

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue in the repository.# tanctrax
# tanctrax
