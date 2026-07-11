# DS Footwear ERP SaaS Frontend — Summary

**Doc Version:** 1.4.0 (V2 - Enterprise Edition)
**System Version:** 1.0.0 (SaaS Multi-Tenant UI Core)

## Core Stack
- ReactJS (v18+)
- Vite
- Tailwind CSS
- TanStack Query (v5)
- Zustand
- Axios

## UI Design Principles
- **Minimal & Clean:** No decorative clutter; balance white space with high-density data layout.
- **Enterprise Focused:** Compact padding for fast corporate data entry.
- **Responsive:** Fluid grids across desktop, warehouse tablets, and floor monitors.
- **Keyboard Friendly:** Focus traps and keyboard navigation (`Tab`, `Enter`, `Esc`) on forms/modals.
- **Accessible (WCAG Aligned):** High contrast, semantic HTML labels on forms/buttons/tables.
- **Fast & Performant:** Interactions must render under 100ms.
- **Reusable:** Atomic, deterministic, prop-driven components.

## Directory Structure (`src/`)
| Folder | Purpose |
| :--- | :--- |
| `assets/` | Static media, brand assets, localized fallback icons |
| `components/` | Global core UI atom component library (theme standardized) |
| `config/` | Network clients, API constants, environment variables |
| `contexts/` | Global React context providers (tenant scope) |
| `constants/` | Role configs, status enums, toast mappings |
| `features/` | Domain-driven feature slices (e.g. `analytics/`, `billing/`, `inventory/`) |
| `hooks/` | Shared custom hooks (`useDebounce`, `useAuth`, `useKeyPress`) |
| `layouts/` | Structural UI shell wrappers |
| `pages/` | Route-level views mapping layouts to features |
| `routes/` | Router registries with code-splitting |
| `services/` | Axios transport clients, token handling |
| `store/` | Zustand state engines |
| `styles/` | Tailwind config, resets, typography |
| `types/` | Core type/schema definitions |
| `utils/` | Stateless helpers (currency, date formatting) |
| `App.jsx` | Bootstraps global providers |
| `main.jsx` | React root entry point |

## Notes
- `plan.md` now spans Chapter 1 through Chapter 9 (Employee Data Model, added 2026-07-11 — authoritative employee schema, phone-based login flow, employee create flow, shared-document model).

## Reusable Build Prompt

Use this prompt whenever asking an AI/dev to build or extend a module for this project, so output stays consistent with `plan.md`:

```
You are building a feature for the DS Footwear ERP SaaS Frontend (Enterprise Edition).

Stack: ReactJS (v18+), Vite, Tailwind CSS, TanStack Query (v5), Zustand, Axios.

Follow these non-negotiable UI principles:
- Minimal & clean — no decorative clutter, but keep data density high.
- Enterprise-focused — compact padding, built for fast operational data entry.
- Responsive across desktop, warehouse tablets, and floor monitor screens.
- Keyboard-friendly — native focus traps and Tab/Enter/Esc navigation on all forms and modals.
- WCAG-accessible — high contrast, semantic HTML, proper labels on forms/buttons/tables.
- Fast — interactions must feel instant (<100ms).
- Reusable — atomic, prop-driven components, no one-off logic duplication.

Place new code in the correct directory:
- assets/       static media, brand assets, icons
- components/   global reusable UI atoms (theme-standardized)
- config/       API clients, constants, env vars
- contexts/     global React context (tenant scope)
- constants/    role configs, status enums, toast mappings
- features/     domain feature slices (e.g. analytics/, billing/, inventory/) with their own hooks & query logic
- hooks/        shared global hooks (useDebounce, useAuth, useKeyPress)
- layouts/      structural UI shell wrappers
- pages/        route-level views composing layouts + features
- routes/       router registry with code-splitting
- services/     Axios transport + token handling
- store/        Zustand state slices
- styles/       Tailwind config, resets, typography
- types/        shared type/schema definitions
- utils/        stateless helpers (currency, date formatting)

When building a new feature module:
1. Create a folder under features/<module-name>/ with its own hooks, query/mutation logic, and components.
2. Wire it into pages/ via a route in routes/.
3. Use Zustand only for cross-cutting client state; use TanStack Query for all server state.
4. All network calls go through services/ (Axios instance with interceptors), never inline fetch/axios calls in components.
5. Match existing enterprise-dense table/form patterns — no ad-hoc styling outside Tailwind conventions.
```

---

## Gaps Identified in `plan.md` (Missing Sections)

`plan.md` (Chapter 1) covers stack, UI principles, and directory structure — but as a full Enterprise ERP frontend spec, the following are missing:

### 1. Layout Engine (Request/Render Flow)
No documented flow for how a request resolves into a rendered page.
```
Browser
  ↓
React Router
  ↓
Auth Provider
  ↓
RBAC Provider
  ↓
Layout
  ↓
Page
  ↓
Feature
  ↓
Component
```

### 2. Authentication Flow
No login → session flow documented.
```
Login
  ↓
Validation
  ↓
Axios
  ↓
Backend
  ↓
JWT
  ↓
Zustand (Auth Store)
  ↓
Protected Route
  ↓
Dashboard
```

### 3. RBAC (Role-Based Access Control)
Only role *names* exist conceptually — no permission-to-UI mapping.
```
Role
  ↓
Permission
  ↓
Sidebar (menu visibility)
  ↓
Page (route guard)
  ↓
Component (conditional render)
  ↓
Action (button/CTA enable-disable)
  ↓
API (server-side enforcement)
```

### 4. Layout Documentation
Missing concrete layout specs:
- Login Layout
- Dashboard Layout
- Sidebar
- Header
- Footer
- Breadcrumb
- Tabs

### 5. Global Component Library
Biggest gap — no documented atom/molecule inventory:
- Button, Input, Select, Table, Modal, Drawer, Card, Chart, Loader, Toast, Pagination, Search, Filter, Avatar, Badge, Timeline

### 6. API Layer
No interceptor/error pipeline documented.
```
Axios
  ↓
Request Interceptor (attach token)
  ↓
Refresh Token (on 401)
  ↓
Response Interceptor
  ↓
Error Handler
  ↓
Toast (user feedback)
```

### 7. State Management
**TanStack Query:** Query Keys, Mutations, Cache, Optimistic Updates, Invalidation — undocumented.

**Zustand:**
```
Zustand
  ↓
Auth Store
  ↓
Theme Store
  ↓
Layout Store
  ↓
Permission Store
```

### 8. Form Engine
No validation/submit pipeline documented.
```
React Hook Form
  ↓
Zod
  ↓
Validation
  ↓
Submit
  ↓
API
```

### 9. Dashboard Widgets
Missing: Cards, Charts, Realtime updates, Socket.IO, Analytics widgets.

### 10. Theme
Missing: Light/Dark modes, Colors, Typography, Spacing scale, Icon system.

### 11. Security
Missing: Protected Route guard, Permission Guard, Token Expiry handling, Session Timeout.

### 12. Performance
Missing: Lazy Loading, Memoization strategy, Virtual Scroll (for large tables), Code Splitting, Bundle Optimization.

---

## Proposed Documentation Volumes

To close the gaps above, the full documentation should be split into the following volumes:

| Volume | Title |
| :--- | :--- |
| 1 | Frontend Architecture |
| 2 | Authentication Service |
| 3 | RBAC UI Engine |
| 4 | User Management |
| 5 | Dashboard Service |
| 6 | Product Service |
| 7 | Purchase Service |
| 8 | Inventory Service |
| 9 | Production Service |
| 10 | Sales Service |
| 11 | Finance Service |
| 12 | Notification Service |
| 13 | Report Service |
| 14 | API Integration |
| 15 | UI Component Library |
| 16 | Security & Performance |

---

## Development Standards & Conventions

### 1. Module Development Standard
Every feature module must follow the same internal structure so any developer can navigate any module identically:

```
features/
└── products/
    ├── api/          # Module-specific API calls (wraps services/)
    ├── components/   # Module-specific business components
    ├── hooks/        # Module-specific custom hooks
    ├── pages/        # Route-level views for this module
    ├── queries/      # TanStack Query hooks (useProductsQuery, etc.)
    ├── mutations/    # TanStack Mutation hooks (useCreateProduct, etc.)
    ├── validators/   # Zod schemas for this module's forms
    ├── utils/        # Module-specific stateless helpers
    └── index.js      # Public exports (barrel file)
```
**Rule:** Every module under `features/` follows this exact shape — no ad-hoc folders.

### 2. API Layer Convention
`services/` holds one Axios instance plus one file per backend service — never mixed:

```
services/
├── api/
│   └── axios.js       # Single configured Axios instance (interceptors, base URL)
├── auth.api.js
├── product.api.js
├── inventory.api.js
├── sales.api.js
└── finance.api.js
```
**Rule:** One Service File = One Backend Service. This keeps the frontend service map a 1:1 mirror of backend services, so mapping between layers is always unambiguous.

### 3. Query Key Convention
`queryKeys.js` centralizes all TanStack Query keys — no inline string/array keys in components or hooks:

```js
export const queryKeys = {
  products: {
    all: ['products'],
    list: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
  },
  orders: {
    all: ['orders'],
    list: (filters) => ['orders', 'list', filters],
    detail: (id) => ['orders', 'detail', id],
  },
  dashboard: { all: ['dashboard'] },
  inventory: { all: ['inventory'] },
};
```
**Rule:** Every query/mutation must reference `queryKeys.*` — never hardcode key arrays. This keeps cache invalidation and refetching predictable across modules.

### 4. Component Naming Standard
```
BaseButton        # Lowest-level primitive (styling only, no business logic)
AppButton         # App-themed wrapper around BaseButton (used everywhere)
ProductTable      # Business component — products module
OrderTable        # Business component — sales/orders module
InventoryCard     # Business component — inventory module
DashboardWidget   # Business component — dashboard module
```
**Rule:**
- Common/reusable primitives → `components/ui/`
- Business/domain-specific components → `features/<module>/components/`
