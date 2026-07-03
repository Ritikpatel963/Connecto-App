# Connecting People Admin Frontend

A schema-driven administration frontend for the Connecting People voice-calling social platform.

## Stack

- React 19 + React Router
- TypeScript 4.9 (the latest version supported by the existing Create React App toolchain)
- Existing WowDash Bootstrap theme for layout, cards, forms, badges, buttons, and modals
- TanStack Query for server state, cache invalidation, loading/error states, and mutations
- Axios for typed REST requests
- Reusable server-mode `AdminDataTable` for pagination, search, sorting, filters, and column visibility
- React Toastify for action feedback
- ApexCharts for dashboard metrics

## Run

```powershell
npm install
npm start
```

Production validation:

```powershell
npx tsc --noEmit
npm run build
```

## API mode

Mock mode is enabled by default:

```env
REACT_APP_USE_MOCK_API=true
```

Set it to `false` to call the live REST API at `/api/admin`.

List endpoints receive `page`, `pageSize`, `search`, `sortBy`, `sortDirection`, and serialized `filters`.

Standard CRUD follows:

- `GET /api/admin/<resource>`
- `GET /api/admin/<resource>/:id`
- `POST /api/admin/<resource>`
- `PATCH /api/admin/<resource>/:id`
- `DELETE /api/admin/<resource>/:id`

Workflow actions include verification approve/reject, wallet recharge approve/reject, referral redemption approve/credit, and the bulk role-permission matrix PATCH.

## Structure

```text
src/admin/
  api/          typed REST clients and mock fallback
  components/   data grid, modals, badges, cells, page states
  layout/       permission-aware AdminLayout
  pages/        module pages
  AppRoutes.tsx
  types.ts
```

Admin & Roles navigation is shown only when `GET /api/admin/me` returns the `manage_admins` permission.
