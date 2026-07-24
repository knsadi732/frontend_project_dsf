# API Endpoints

Base URL: `http://localhost:4000/api/v1`
(port/prefix override hoga agar `.env` me `PORT` / `API_PREFIX` set hai)

## Auth
- POST `localhost:4000/api/v1/auth/login`  — body: `{ "identifier": "email or phone", "password": "...", "latitude"?: number, "longitude"?: number, "locationLabel"?: string }`. IP, user-agent, and `x-device-signature` header are captured automatically; `latitude`/`longitude` must come from the client's device (browser/app geolocation) — the server has no way to read GPS itself. A successful login auto-marks that day's attendance for the user (see Attendance below); this never blocks or fails the login response.
- POST `localhost:4000/api/v1/auth/refresh`
- POST `localhost:4000/api/v1/auth/logout`
- GET  `localhost:4000/api/v1/auth/me`

## Users
- GET    `localhost:4000/api/v1/users`
- POST   `localhost:4000/api/v1/users`
- GET    `localhost:4000/api/v1/users/:id`
- PATCH  `localhost:4000/api/v1/users/:id`
- DELETE `localhost:4000/api/v1/users/:id`

## Attendance
- GET `localhost:4000/api/v1/attendance`  — query: `user_id?`, `from?` (YYYY-MM-DD), `to?` (YYYY-MM-DD). Rows are auto-created by login (see Auth above), not created via this API.
## Roles
- GET `localhost:4000/api/v1/roles`
## Audit Logs
- GET `localhost:4000/api/v1/audit-logs`
## Documents
- GET    `localhost:4000/api/v1/documents/:id/download`  (public, token-based)
- GET    `localhost:4000/api/v1/documents`
- POST   `localhost:4000/api/v1/documents`
- GET    `localhost:4000/api/v1/documents/:id`
- GET    `localhost:4000/api/v1/documents/:id/download-url`
- DELETE `localhost:4000/api/v1/documents/:id`
## Products
- GET    `localhost:4000/api/v1/products/categories`
- POST   `localhost:4000/api/v1/products/categories`
- PATCH  `localhost:4000/api/v1/products/categories/:id`
- DELETE `localhost:4000/api/v1/products/categories/:id`
- GET    `localhost:4000/api/v1/products/stock`
- POST   `localhost:4000/api/v1/products/stock/receive`
- GET    `localhost:4000/api/v1/products`
- POST   `localhost:4000/api/v1/products`
- GET    `localhost:4000/api/v1/products/:id`
- PATCH  `localhost:4000/api/v1/products/:id`
- DELETE `localhost:4000/api/v1/products/:id`
## Product Variants
- GET    `localhost:4000/api/v1/product-variants/generate-sku`  — reserves and returns the next variant SKU
- GET    `localhost:4000/api/v1/product-variants`
- POST   `localhost:4000/api/v1/product-variants`
- GET    `localhost:4000/api/v1/product-variants/:id`
- PATCH  `localhost:4000/api/v1/product-variants/:id`
- DELETE `localhost:4000/api/v1/product-variants/:id`
## Brands
- GET    `localhost:4000/api/v1/brands`
- POST   `localhost:4000/api/v1/brands`
- GET    `localhost:4000/api/v1/brands/:id`
- PATCH  `localhost:4000/api/v1/brands/:id`
- DELETE `localhost:4000/api/v1/brands/:id`
## Departments
- GET    `localhost:4000/api/v1/departments`
- POST   `localhost:4000/api/v1/departments`
- GET    `localhost:4000/api/v1/departments/:id`
- PATCH  `localhost:4000/api/v1/departments/:id`
- DELETE `localhost:4000/api/v1/departments/:id`
## Designations
- GET    `localhost:4000/api/v1/designations`
- POST   `localhost:4000/api/v1/designations`
- GET    `localhost:4000/api/v1/designations/:id`
- PATCH  `localhost:4000/api/v1/designations/:id`
- DELETE `localhost:4000/api/v1/designations/:id`
## Customers
- GET    `localhost:4000/api/v1/customers`
- POST   `localhost:4000/api/v1/customers`
- GET    `localhost:4000/api/v1/customers/:id`
- PATCH  `localhost:4000/api/v1/customers/:id`
- DELETE `localhost:4000/api/v1/customers/:id`
## Vendors
- GET    `localhost:4000/api/v1/vendors`
- POST   `localhost:4000/api/v1/vendors`
- GET    `localhost:4000/api/v1/vendors/:id`
- PATCH  `localhost:4000/api/v1/vendors/:id`
- DELETE `localhost:4000/api/v1/vendors/:id`
## Orders
- GET   `localhost:4000/api/v1/orders`
- POST  `localhost:4000/api/v1/orders`
- GET   `localhost:4000/api/v1/orders/:id`
- PATCH `localhost:4000/api/v1/orders/:id/status`
- PATCH `localhost:4000/api/v1/orders/:id/payment-status`
## Purchase Orders
- GET   `localhost:4000/api/v1/purchase-orders`
- POST  `localhost:4000/api/v1/purchase-orders`
- GET   `localhost:4000/api/v1/purchase-orders/generate-number`  — reserves and returns the next PO number
- GET   `localhost:4000/api/v1/purchase-orders/:id`
- PATCH `localhost:4000/api/v1/purchase-orders/:id/status`
## Purchase Requests
Internal ask for goods raised *before* any vendor/PO exists (no pricing, no vendor — that's decided later at the Purchase Order stage). Approval workflow: `pending` → `approved` | `rejected` (both terminal; a decided PR can't be re-decided, raise a new one instead).
- GET   `localhost:4000/api/v1/purchase-requests`  — query: `status?` (`pending`/`approved`/`rejected`)
- POST  `localhost:4000/api/v1/purchase-requests`  — body: `{ warehouseId, departmentId?, branchId?, remarks?, items: [{ productId, quantity, remarks? }] }`
- GET   `localhost:4000/api/v1/purchase-requests/generate-number`  — reserves and returns the next PR number (`DSF-PR-0001`)
- GET   `localhost:4000/api/v1/purchase-requests/:id`
- PATCH `localhost:4000/api/v1/purchase-requests/:id/status`  — body: `{ "status": "approved" | "rejected" }`
## Finance
- GET   `localhost:4000/api/v1/finance/transactions`
- POST  `localhost:4000/api/v1/finance/transactions`
- GET   `localhost:4000/api/v1/finance/payment-slips`
- POST  `localhost:4000/api/v1/finance/payment-slips`
- GET   `localhost:4000/api/v1/finance/expenses`
- POST  `localhost:4000/api/v1/finance/expenses`
- GET   `localhost:4000/api/v1/finance/bills`
- POST  `localhost:4000/api/v1/finance/bills/print`
- GET   `localhost:4000/api/v1/finance/ledger/summary`
- GET   `localhost:4000/api/v1/finance/fiscal-periods`
- POST  `localhost:4000/api/v1/finance/fiscal-periods`
- PATCH `localhost:4000/api/v1/finance/fiscal-periods/:id/close`
- GET   `localhost:4000/api/v1/finance/gst`  — CA scope: GSTIN + GST settings profile
- GET   `localhost:4000/api/v1/finance/audits`  — CA scope: statutory audit records
- POST  `localhost:4000/api/v1/finance/audits`  — CA scope: record a statutory audit
- GET   `localhost:4000/api/v1/finance/ledger/cross-verify`  — CA scope: single-tenant ledger cross-verification
## Notifications
- GET  `localhost:4000/api/v1/notifications`
- POST `localhost:4000/api/v1/notifications`
## Analytics
- GET  `localhost:4000/api/v1/analytics/dashboard`
- GET  `localhost:4000/api/v1/analytics/dashboard/:key`
- POST `localhost:4000/api/v1/analytics/regenerate`
## Company / Branches / Warehouses / Settings
- GET    `localhost:4000/api/v1/company`
- PATCH  `localhost:4000/api/v1/company`
- GET    `localhost:4000/api/v1/branches`
- POST   `localhost:4000/api/v1/branches`
- GET    `localhost:4000/api/v1/branches/:id`
- PATCH  `localhost:4000/api/v1/branches/:id`
- DELETE `localhost:4000/api/v1/branches/:id`
- GET    `localhost:4000/api/v1/warehouses`
- POST   `localhost:4000/api/v1/warehouses`
- GET    `localhost:4000/api/v1/warehouses/:id`
- PATCH  `localhost:4000/api/v1/warehouses/:id`
- DELETE `localhost:4000/api/v1/warehouses/:id`
- GET    `localhost:4000/api/v1/settings`
- PATCH  `localhost:4000/api/v1/settings`
