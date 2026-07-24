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
- POST  `localhost:4000/api/v1/finance/transactions`  — body: `{ branchId?, transactionDate? (ISO, defaults to now), referenceType: "order"|"purchase_order"|"expense"|"manual", referenceId?, direction: "debit"|"credit", amount (positive number), description? }`. No `account` field exists — this is a flat ledger-entry table (`company_id`/`branch_id` scoped only), not a wallet/chart-of-accounts. Only `referenceType: "manual"` lets the caller choose `direction`; for `order"`/`"purchase_order"`/`"expense"` the backend force-overrides direction (`order`→credit, `purchase_order`/`expense`→debit) regardless of what's sent. To add funds: `{ "referenceType": "manual", "direction": "credit", "amount": ..., "description": "..." }`. Posting date must fall in an open fiscal period or the write is rejected.
- GET   `localhost:4000/api/v1/finance/payment-slips`  — Customer collections (Accounts Receivable) — money coming IN from a customer, not vendor payments.
  POST body: `{ orderId?: uuid (nullable — a payment can be recorded independent of any order), customerId: uuid (required), amount: number (positive), paymentMode?: "cash"|"upi"|"card"|"bank_transfer" }`. Response: `order_id, customer_id, slip_number` (auto: `PS-<timestamp>-<hex>`)`, amount, payment_mode, issued_by, ...`. Auto-creates a linked `manual`/credit `finance_transaction` too.
- GET   `localhost:4000/api/v1/finance/expenses`
- POST  `localhost:4000/api/v1/finance/expenses`
- GET   `localhost:4000/api/v1/finance/bills`  — **Customer sales invoices** (auto-generated from an Order), NOT vendor bills/payables — there is no Accounts-Payable/vendor-bill tracking anywhere in this backend (Purchase Orders have no payable-tracking or GRN either, confirmed separately). "How much debt/payable does the company have" is not answerable from this API surface — would need a new backend module.
  POST `/finance/bills/print` body: `{ orderId: uuid }` only — the backend copies `gst_amount`/`total_amount` from the order itself, claims the next invoice number, and creates a linked credit `finance_transaction`. Idempotent — re-posting the same `orderId` returns the existing bill rather than duplicating it. Response: `order_id, bill_number, gst_amount, total_amount, printed_by, printed_at, ...`.
- GET   `localhost:4000/api/v1/finance/ledger/summary`  — query: `from?`, `to?` (ISO dates; omit both for all-time). Response: `{ "debit": number, "credit": number, "balance": number }` where `balance = credit - debit`. No opening/closing-balance carry-forward — it's a flat sum over the (optionally date-filtered) range, not a running ledger balance. These 3 keys (`debit`/`credit`/`balance`) are the only authoritative source for a displayed balance; `/finance/transactions` rows carry no running-balance field.
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
All three routes are gated by a single flat permission `analytics.view` — there is **no per-widget/per-role data scoping on the backend**. Whoever holds `analytics.view` gets every widget in full; the seeded Accountant/CA roles don't have `analytics.view` at all (only Admin does by default), so today it's all-or-nothing access, not "finance role sees only finance data". Any module-wise filtering of the dashboard has to be done on the frontend.
- GET  `localhost:4000/api/v1/analytics/dashboard`  — returns an array of all widgets:
  ```json
  {
    "data": [
      { "widgetKey": "sales_summary", "data": { "order_count": "12", "total_sales": "45000.00" } | null, "generatedAt": "2026-07-24T00:00:00Z" | null },
      { "widgetKey": "inventory_status", "data": { "total_on_hand": "980", "total_reserved": "120" } | null, "generatedAt": "..." | null }
    ]
  }
  ```
  `data` is `null` (with `generatedAt: null`) if no snapshot has been generated yet for that company. Numeric fields come back as strings (Postgres `NUMERIC`/`COUNT` via `pg`). Widgets are read from a 15-min Redis cache backed by nightly-precomputed snapshot rows — never live-aggregated on request.
- GET  `localhost:4000/api/v1/analytics/dashboard/:key`  — same single-widget shape as one array entry above. `key` must be `sales_summary` or `inventory_status`; anything else → `COMMON_001` error.
- POST `localhost:4000/api/v1/analytics/regenerate`  — forces the snapshot job to run immediately (same job the nightly scheduler runs), returns `{ "companies": <count regenerated> }`. Doesn't take a body.
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
