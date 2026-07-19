# Connecto Admin API

## Existing backend context

- Existing backend framework in this repo: none.
- Existing DB/query layer: Supabase/Postgres. The admin panel previously queried Supabase directly from React.
- Existing public/user API: none in this checkout; the React Native app uses local mock data.
- Admin needs visible in the app: users, verifications/moderation, calls, chat, ratings, wallet payments, referrals, subscriptions, notifications, RBAC, dashboard analytics.

## Added structure

```text
backend/admin-api/
  openapi/admin-api.yaml
  src/
    controllers/       HTTP request/response mapping
    services/          Supabase/Postgres business/data operations
    middleware/        admin auth, RBAC, rate limiting
    lib/               Supabase REST adapter
    routes/            /api/admin/v1 route table
    server.js
```

The full OpenAPI contract is in `openapi/admin-api.yaml`. The implemented end-to-end sample resource is subscriptions:

```text
GET   /api/admin/v1/subscriptions
GET   /api/admin/v1/subscriptions/:id
PATCH /api/admin/v1/subscriptions/:id
GET   /api/admin/v1/subscriptions/stats
```

## Environment

```env
ADMIN_API_PORT=4100
ADMIN_PANEL_ORIGIN=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Run the DB contract first:

```sql
-- admin/supabase/admin_api_core.sql
```

Then start:

```powershell
cd backend/admin-api
npm start
```

## Notes

- Admin login is separate at `/api/admin/v1/auth/login`, rate-limited, and only returns a token if the Supabase user maps to an active `admins` row.
- Implemented admin routes call `requireAdmin(permission)`; super admin has `*`, support/read-only get read permissions only.
- Write actions call `admin_audit_log`.
- Subscription stats read `admin_subscription_stats`; refresh the materialized view from cron after payment/webhook processing.
