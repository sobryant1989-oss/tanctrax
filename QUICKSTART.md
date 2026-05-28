# Quick Start Guide

## Prerequisites

- Node.js 18+ (download from nodejs.org)
- npm (comes with Node.js)
- A Supabase account (free at supabase.com)
- (Optional) Microsoft Azure account for email functionality

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will download all required packages (~500MB).

### 2. Set Up Supabase

Follow the guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Get your API credentials
- Create database tables

### 3. Configure Environment Variables

The `.env.local` file is already created. Update it with your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here

AZURE_CLIENT_ID=optional_for_now
AZURE_CLIENT_SECRET=optional_for_now
AZURE_TENANT_ID=optional_for_now
```

### 4. Run the Development Server

```bash
npm run dev
```

You should see:
```
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

### 5. Open in Browser

- Go to [http://localhost:3000](http://localhost:3000)
- You should see the Work Order Tracker dashboard

## What You're Seeing

The dashboard displays:

**Metric Cards** (Top):
- Total Work Orders
- Open Work Orders
- Completed Work Orders

**Recent Work Orders Table** (Bottom Left):
- List of recent tickets
- Work order number, building, status, priority, vendor, date

**Status Overview** (Bottom Right):
- Breakdown of work orders by status
- Shows count for each status

## Making Your First Work Order

1. Click the "New Work Order" link in the sidebar (➕)
2. Fill in the form:
   - Building: Select from list
   - Location: Room or area
   - Description: What needs to be fixed
   - Vendor: Who will do the work
   - Vendor Email: Their email address
   - Priority: Low/Medium/High/Urgent
   - Estimated Cost: Budget amount
3. Click "Create Work Order"

The work order will:
- Be saved to the database
- Get a unique number (WO-2026-000001)
- Appear in the dashboard

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Check for TypeScript errors
npm run lint
```

## Project Structure

```
TancTrax/
├── app/                    # Next.js pages & layout
├── components/             # React components
├── lib/                    # Utilities (Supabase client)
├── services/               # Business logic
├── types/                  # TypeScript definitions
├── utils/                  # Helper functions
├── supabase/              # Database migrations
├── public/                # Static files
├── .env.local             # Environment variables
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind CSS config
└── README.md              # Full documentation
```

## Troubleshooting

### "npm command not found"
- Install Node.js from nodejs.org
- Restart your terminal

### "Cannot find module errors"
- Run: `npm install`
- Delete `node_modules`: `rm -r node_modules`
- Try installing again

### "Supabase connection error"
- Check `.env.local` has correct URL and keys
- Verify Supabase project is active
- Check that database tables exist

### "Port 3000 already in use"
```bash
# Use a different port
npm run dev -- -p 3001
```

### "Changes not appearing"
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check browser console for errors (F12)

## Next Steps

1. **Customize Settings**:
   - Edit building list in database
   - Add your vendors
   - Adjust priority levels

2. **Enable Email** (Optional):
   - Follow [AZURE_SETUP.md](./AZURE_SETUP.md)
   - Configure Microsoft Graph API
   - Test email sending

3. **Customization**:
   - Edit colors in `tailwind.config.js`
   - Modify dashboard layout in `components/Dashboard.tsx`
   - Add new work order fields

4. **Deployment**:
   - Deploy to Vercel (recommended)
   - Deploy to other services via `npm run build`

## Getting Help

1. Check the logs in browser console (F12)
2. Read the full [README.md](./README.md)
3. Review [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database issues
4. Check [AZURE_SETUP.md](./AZURE_SETUP.md) for email issues

## FAQ

**Q: Can I use this without Supabase?**
A: No, the app requires a database. Supabase is free and easy to set up.

**Q: Is email sending required?**
A: No, the dashboard works without email. Email is optional.

**Q: Can I add more fields to work orders?**
A: Yes, add them to the database schema and update the form.

**Q: How do I add users?**
A: Enable authentication in Supabase, then users can sign up.

**Q: What's the maximum number of work orders?**
A: Supabase free tier supports millions of records.

## Support

For detailed information, see:
- [README.md](./README.md) - Full documentation
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
- [AZURE_SETUP.md](./AZURE_SETUP.md) - Email setup