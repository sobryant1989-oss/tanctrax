# Project Architecture & Design

## System Overview

The Work Order Tracker is a full-stack web application built with modern technologies for managing campus maintenance work orders.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React + TypeScript)               │  │
│  │  - Dashboard                                         │  │
│  │  - Work Order Management                             │  │
│  │  - Responsive UI (Tailwind CSS)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
    ┌───────▼────────┐        ┌────────▼───────────┐
    │   Supabase     │        │  Microsoft Graph   │
    │   PostgreSQL   │        │  API (Email)       │
    │   • Work Orders│        │                    │
    │   • Vendors    │        │  Azure AD OAuth    │
    │   • Logs       │        │                    │
    └────────────────┘        └────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15** - React framework with server-side rendering
- **React 18** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form state management (future)

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - User authentication
- **Node.js** - JavaScript runtime

### External APIs
- **Microsoft Graph API** - Email sending via Outlook
- **Azure AD** - OAuth 2.0 authentication

## Directory Structure

```
app/                          # Next.js App Router
├── api/
│   └── send-email/          # Email API endpoint
├── dashboard/               # Dashboard page
├── login/                   # Authentication page
├── work-orders/
│   ├── [id]/               # Work order detail page
│   └── new/                # Create work order page
├── globals.css             # Global styles
├── layout.tsx              # Root layout with sidebar
└── page.tsx                # Home/dashboard page

components/                  # React components
├── Dashboard.tsx           # Main dashboard component
├── MetricCard.tsx         # Metric display card
├── Sidebar.tsx            # Navigation sidebar
├── WorkOrdersTable.tsx    # Work orders list
└── DashboardSkeleton.tsx  # Loading skeleton

lib/                         # Utilities
└── supabase.ts            # Supabase client initialization

services/                    # Business logic
└── workOrderService.ts    # Work order CRUD operations

hooks/                       # Custom React hooks
└── useDashboardData.ts    # Dashboard data fetching

types/                       # TypeScript types
└── index.ts               # All type definitions

utils/                       # Helper functions
└── helpers.ts             # Formatting and utilities

supabase/                    # Database
└── migrations/
    └── 001_initial.sql    # Database schema

public/                      # Static assets
```

## Database Schema

### Work Orders Table
```sql
work_orders (
  id: UUID (Primary Key)
  work_order_number: TEXT (Unique) - "WO-2026-000001"
  building: TEXT - Building location
  location: TEXT - Specific room/area
  description: TEXT - Issue description
  vendor_id: UUID - Foreign key to vendors
  vendor_email: TEXT - Vendor contact
  priority: ENUM - Low/Medium/High/Urgent
  status: ENUM - New/Sent/Acknowledged/In Progress/Waiting Parts/Completed/Closed
  estimated_cost: DECIMAL
  actual_cost: DECIMAL
  created_at: TIMESTAMP - When created
  completed_at: TIMESTAMP - When finished
  created_by: UUID - Foreign key to profiles
)
```

### Related Tables
- **profiles** - User profiles and roles
- **vendors** - Vendor information
- **email_logs** - Sent email tracking
- **status_history** - Status change audit trail
- **attachments** - File uploads

## Component Architecture

### MetricCard
- Displays a single metric (count/number)
- Props: label, value, icon, color
- Reusable across pages

### WorkOrdersTable
- Displays list of work orders
- Props: orders array
- Shows: number, building, status, priority, vendor, date

### Dashboard
- Main dashboard component
- Fetches: stats, recent orders, status counts
- Loading states and error handling
- Displays: metric cards, table, status overview

### Sidebar
- Navigation menu
- Collapsible on mobile
- Links to all main pages

## Data Flow

### Fetching Dashboard Data
```
Component Mount
    ↓
useDashboardData Hook
    ↓
getWorkOrderStats() ─→ [Promise]
getRecentWorkOrders() ─→ [Promise]
getWorkOrdersByStatus() ─→ [Promise]
    ↓
Promise.all() waits for all
    ↓
setData() updates state
    ↓
Component re-renders
```

### Creating a Work Order
```
User fills form
    ↓
Form validation (react-hook-form + Zod)
    ↓
generateWorkOrderNumber()
    ↓
supabase.from('work_orders').insert()
    ↓
API: POST /api/send-email
    ↓
Microsoft Graph API sendMail
    ↓
Log in email_logs table
    ↓
Redirect to dashboard
```

## API Endpoints

### Email Sending
```
POST /api/send-email

Request:
{
  workOrderNumber: string
  building: string
  description: string
  priority: string
  recipientEmail: string
  estimatedCompletionDate: string
}

Response:
{
  success: boolean
  message: string
  workOrderNumber: string
}
```

## State Management

Currently using React component state. For larger scale:

### Consider Adding:
- React Query (for data fetching)
- Zustand (for global state)
- Redux (for complex state)

## Performance Optimizations

### Implemented
- Code splitting via Next.js
- Image optimization
- CSS bundling via Tailwind

### Recommended Additions
- Server-side rendering for SEO
- Incremental Static Regeneration (ISR)
- Database query optimization
- Caching strategies
- Pagination for large datasets

## Security Considerations

### Current Implementation
- HTTPS recommended (automatic on Vercel)
- Environment variables for secrets
- Supabase Row Level Security (RLS)

### Recommended Additions
- Input validation on all forms
- Rate limiting on API endpoints
- CORS configuration
- JWT token validation
- Audit logging for critical operations

## Scalability Plan

### Phase 1 (Current)
- 100-500 work orders
- Single deployment instance
- Basic metrics

### Phase 2
- 1000-10000 work orders
- Database indexing on frequently queried fields
- Caching layer (Redis)
- Background job queue for emails

### Phase 3
- 100000+ work orders
- Database sharding
- Microservices architecture
- Real-time updates via WebSockets

## Testing Strategy

### Unit Tests (jest)
- Helper functions
- Utility functions

### Integration Tests
- API routes
- Database operations

### E2E Tests (cypress)
- User workflows
- Form submissions
- Navigation

## Deployment

### Development
- Local: `npm run dev`
- PORT: 3000

### Production
- Platform: Vercel (recommended)
- Build: `npm run build`
- Start: `npm start`

## Environment Configuration

```
.env.local
├── NEXT_PUBLIC_SUPABASE_URL
├── NEXT_PUBLIC_SUPABASE_ANON_KEY
├── SUPABASE_SERVICE_ROLE_KEY
├── AZURE_CLIENT_ID
├── AZURE_CLIENT_SECRET
└── AZURE_TENANT_ID
```

## Error Handling

### Frontend
- Try-catch in async functions
- Error states in components
- User-friendly error messages

### Backend
- API error responses with status codes
- Logging to console and database
- Graceful fallbacks

## Future Enhancements

1. **Real-time Updates** - WebSockets via Supabase Realtime
2. **Advanced Search** - Full-text search on work orders
3. **Reporting** - PDF exports, analytics
4. **Mobile App** - React Native companion
5. **Integrations** - Slack, Teams notifications
6. **Approval Workflow** - Manager approval process
7. **Cost Tracking** - Budget management
8. **Vendor Rating** - Performance metrics
9. **Map View** - Campus map with building locations
10. **Mobile App Push Notifications** - Work order alerts