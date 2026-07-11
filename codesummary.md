# Implementation Report v1.0

**Generated from the current source tree:** 11 July 2026  
**Project:** `frontend_project_dsf`

## Purpose

This repository contains the frontend for a footwear ERP application. It provides an authenticated, role-based operational dashboard for managing products, purchases, inventory, production, sales, finance, returns, employees, notifications, reports, and the user profile.

The application can run against a configured API, and also includes a complete in-memory mock data/API layer for local UI development and demo workflows.

## Technology

- React 19 with Vite 8
- React Router 7 with lazy-loaded route pages
- Tailwind CSS 4 for styling
- TanStack React Query 5 for server/cache state
- Zustand with persistence for client state
- Axios for HTTP requests and token refresh handling
- React Hook Form + Zod for forms and validation
- Recharts for dashboards; jsPDF and CSV helpers for exports
- Socket.IO client for real-time events

## Application Bootstrap

`src/main.jsx` renders `App` in React Strict Mode. `src/App.jsx` composes the global providers and runtime behavior:

1. `ErrorBoundary` catches rendering failures.
2. `QueryClientProvider` supplies React Query.
3. `ToastProvider` exposes application notifications.
4. `BrowserRouter` renders `AppRoutes`.
5. The active theme is applied to the root HTML element.
6. Socket connection opens only for authenticated users and is disabled in mock-auth mode.

## Route and Access Model

`src/routes/AppRoutes.jsx` contains public login and protected ERP routes. Feature pages are code-split using `React.lazy` and shown with `BaseLoader` while loading.

Protected routes use two layers:

- `ProtectedRoute`: requires an authenticated session.
- `PermissionGuard`: requires the current role to have `view` access to the relevant module.

Available application routes:

| Area | Route |
| --- | --- |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Products | `/products` |
| Purchases | `/purchases` |
| Inventory | `/inventory` |
| Production | `/production` |
| Sales | `/sales` |
| Finance | `/finance` |
| Returns | `/returns` |
| Employees | `/users` |
| Profile | `/profile` |
| Notifications | `/notifications` |
| Reports | `/reports` |

The app also provides `/403` and a catch-all 404 page.

## Roles and Permissions

Roles and module/action permission definitions are in `src/constants/roles.js`. `SUPER_ADMIN` and `OWNER` have full access. Departmental roles include Accountant, CA, Purchase, Inventory, Production, Sales, Dispatch, Customer Support, and Employee.

Permissions cover `view`, `create`, `edit`, and `delete`. The default role-to-module matrix is persisted through `permissionStore`, allowing the permission UI to change it at runtime. Authentication state and access/refresh tokens are persisted through `authStore`.

## Feature Architecture

Business functionality is organized under `src/features/`. Most operational modules follow a consistent structure:

- `api/`: feature API facade
- `queries/`: React Query read hooks
- `mutations/`: create, update, and delete hooks
- `validators/`: Zod form schema
- `components/`: tables, modals, and detail views
- `pages/`: route page
- `index.js`: public feature exports

Implemented feature areas are:

- Authentication
- Dashboard analytics
- Products
- Purchases
- Inventory
- Production work orders
- Sales orders
- Finance invoices
- Returns
- Employees/users and role permissions
- Departments and designations
- Profile, password change, and login history
- Notifications
- Reports

## UI System and Layout

The authenticated experience uses `DashboardLayout` with a sidebar navigation, header, breadcrumbs, tabs, and footer. Shared UI primitives include buttons, inputs, selects, tables, cards, drawers, modals, pagination, badges, loaders, filter/search controls, charts, timelines, and toast support.

The dashboard is intentionally read-only and shows KPI cards, sales trend, recent activity, forecast, break-even, period comparison, and return-rate widgets calculated from the active data source.

## API, Authentication, and Real-time Behavior

`src/services/api/axios.js` creates an Axios client using `VITE_API_BASE_URL` (default: `http://localhost:4000/api/v1`). It:

- Adds the stored bearer token to outgoing requests.
- Handles network, authorization, and server error toasts.
- Queues requests while a single 401 token refresh is in progress.
- Retries queued requests after a successful refresh.
- Clears the session and shows a session-expired toast if refresh fails.

Environment options are defined in `src/config/env.js`:

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_MOCK_AUTH`

`src/services/socket.js` uses Socket.IO over WebSocket transport, authenticates with the access token, and reconnects up to three times. It does not connect when mock authentication is enabled.

## Mock ERP Data and Cross-module Rules

`src/services/api/mockDb.js` stores shared, mutable in-memory data for products, finished inventory, raw materials, product BOMs, sales orders, work orders, invoices, purchase orders, and returns. The mock CRUD layer is therefore stateful during the browser session and supports module interactions rather than isolated fixture arrays.

`src/services/api/businessRules.js` simulates backend workflow rules:

1. A new sales order creates a review notification.
2. Approving an order reserves available finished stock, schedules dispatch, creates an invoice, and notifies warehouse packing.
3. If finished stock is short, work orders are created. BOM shortages block production and automatically raise urgent purchase orders.
4. Completing a purchase order increases raw-material stock and can unblock its linked work order.
5. Completing production adds finished inventory. Linked sales orders are automatically readied when stock becomes sufficient.
6. Completing a sales order ensures stock reservation and generates an invoice if needed.
7. Cancelling or rejecting an order releases reserved stock and cancels unfinished linked work orders where applicable.
8. Invoice totals use line-level GST rules and apply a 30% advance requirement to high-value orders.
9. Verified returns restock inventory; processed returns update product return/damage costs and recalculate effective cost.

These rules make the demo flow resemble an order-to-cash and procure-to-produce ERP process without requiring a backend service.

## Supporting Utilities

Shared hooks cover authentication, toasts, socket events, keyboard shortcuts, debounce, and date-range filtering. Utility helpers provide class-name merging, CSV download, employee code/name formatting, PDF generation, and an internal toast event bus.

## Commands

```bash
npm run dev      # Start Vite development server
npm run build    # Create production build
npm run lint     # Run ESLint
npm run preview  # Serve the production build locally
```

## Current Implementation Notes

- The repository is JavaScript-based; `jsconfig.json` configures the `@` path alias used throughout `src`.
- `dist/` is present, indicating a previously generated production build.
- `summary.md` and `plan.md` are existing project documents. This file is a source-based snapshot of the current implementation and does not replace either document.
- Mock data is stored in memory, so its mutations are not a persistent backend database.
