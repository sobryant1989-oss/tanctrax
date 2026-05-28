# Supabase Setup Guide

## Creating a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Enter project details:
   - Name: "TancTrax"
   - Database Password: Create a strong password
   - Region: Choose the closest region to your location
5. Click "Create new project"
6. Wait for the project to initialize (1-2 minutes)

## Getting Your Credentials

1. Go to Project Settings → API
2. Copy these values to your `.env.local`:
   - **NEXT_PUBLIC_SUPABASE_URL**: Copy the "Project URL"
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Copy the "anon public" key
   - **SUPABASE_SERVICE_ROLE_KEY**: Copy the "service_role secret" key

## Creating Database Tables

1. In Supabase, go to the SQL Editor
2. Click "New Query"
3. Open `supabase/migrations/001_initial.sql` from this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL editor
6. Click "Run"
7. Wait for the tables to be created

## Verifying the Setup

After running the migrations, you should see these tables in Supabase:
- profiles
- vendors
- work_orders
- email_logs
- status_history
- attachments

## Row Level Security (RLS)

The migrations include basic RLS policies. For production, you should:

1. Enable RLS on all tables (it's already done in the migration)
2. Review and customize the policies in the SQL editor
3. Test access permissions thoroughly

Example policy to add:
```sql
CREATE POLICY "Users can view all work orders" ON work_orders
FOR SELECT USING (true);

CREATE POLICY "Users can create work orders" ON work_orders
FOR INSERT WITH CHECK (auth.uid() = created_by);
```

## Adding Sample Data

To add test data:

1. Go to SQL Editor
2. Create a new query
3. Run:
```sql
INSERT INTO vendors (name, email, phone) VALUES
  ('HVAC Solutions', 'hvac@vendor.com', '555-0100'),
  ('Plumbing Plus', 'plumbing@vendor.com', '555-0101'),
  ('Electrical Works', 'electric@vendor.com', '555-0102');
```

## Connecting from the App

The app automatically connects using the credentials in `.env.local`. The Supabase client is initialized in:
- `lib/supabase.ts`

## Authentication Setup

To enable authentication:

1. In Supabase, go to Authentication → Providers
2. Enable the providers you want:
   - Email/Password
   - Google
   - Azure AD
3. Go to Authentication → URL Configuration
4. Add your application URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
Run: `npm install @supabase/supabase-js`

### "Missing or invalid Supabase URL"
Check that `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL`

### "Database connection timeout"
- Verify the Supabase project is running
- Check your internet connection
- Verify the database password is correct

### Can't see tables after migration
- Check that there were no SQL errors
- Refresh the page in Supabase
- Re-run the migration if needed

## Next Steps

1. Set up authentication providers
2. Configure Microsoft Graph API for email
3. Create initial vendors in the database
4. Test the dashboard with real data