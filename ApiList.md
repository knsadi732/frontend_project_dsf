# API Endpoints

Base URL: `http://localhost:4000/api/v1`
(port/prefix override hoga agar `.env` me `PORT` / `API_PREFIX` set hai)

## Auth
- POST `localhost:4000/api/v1/auth/login`  — body: `{ "identifier": "email or phone", "password": "...", "latitude"?: number, "longitude"?: number, "locationLabel"?: string }`. IP, user-agent, and `x-device-signature` header are captured automatically; `latitude`/`longitude` must come from the client's device (browser/app geolocation) — the server has no way to read GPS itself. A successful login auto-marks that day's attendance for the user (see Attendance below); this never blocks or fails the login response.
- POST `localhost:4000/api/v1/auth/refresh`  — body: `{ refreshToken (required) }`
- POST `localhost:4000/api/v1/auth/logout`  — body: `{ refreshToken (required) }`
- GET  `localhost:4000/api/v1/auth/me`

## Users
- GET    `localhost:4000/api/v1/users`  — paginated list
- POST   `localhost:4000/api/v1/users`  — body: `{ branchId?, warehouseId?, roleId (required), additionalRoleIds?: [guid] (default []), fullName (required), email (required), phone?, password (required, min 6), department?, jobTitle? }`
- GET    `localhost:4000/api/v1/users/:id`
- PATCH  `localhost:4000/api/v1/users/:id`  — body (all optional): `{ fullName?, roleId?, additionalRoleIds?: [guid], department?, jobTitle?, status?: "active"|"inactive"|"suspended"|"terminated" }`
- DELETE `localhost:4000/api/v1/users/:id`

## Attendance
- GET `localhost:4000/api/v1/attendance`  — query: `user_id?`, `from?` (YYYY-MM-DD), `to?` (YYYY-MM-DD). Rows are auto-created by login (see Auth above), not created via this API.
## Roles
- GET `localhost:4000/api/v1/roles`  — list of roles (read-only, no create/update/delete API — roles are seeded)
## Audit Logs
- GET `localhost:4000/api/v1/audit-logs`  — paginated, read-only
## Documents
- GET    `localhost:4000/api/v1/documents/:id/download`  (public, token-based, no auth header needed)
- GET    `localhost:4000/api/v1/documents`  — paginated list
- POST   `localhost:4000/api/v1/documents`  — multipart/form-data upload. Fields: `entityType` (required, one of `"product"|"vendor"|"employee"|"invoice"|"gst_certificate"`), `entityId?` (guid), `branchId?`, `warehouseId?`, `isPublic?` (boolean, default `false`), plus the file itself
- GET    `localhost:4000/api/v1/documents/:id`
- GET    `localhost:4000/api/v1/documents/:id/download-url`  — returns a signed/temporary URL
- DELETE `localhost:4000/api/v1/documents/:id`
## Products
- GET    `localhost:4000/api/v1/products/categories`  — paginated list
- POST   `localhost:4000/api/v1/products/categories`  — body: `{ parentId? (guid, for sub-categories), name (required), categoryCode? }`
- PATCH  `localhost:4000/api/v1/products/categories/:id`  — body (all optional): `{ name?, categoryCode?, status?: "active"|"inactive" }`
- DELETE `localhost:4000/api/v1/products/categories/:id`
- GET    `localhost:4000/api/v1/products/stock`  — paginated stock levels
- POST   `localhost:4000/api/v1/products/stock/receive`  — manual/ad-hoc stock-in (not linked to a PO). body: `{ warehouseId (required), productVariantId (required), quantity (required, > 0) }`
- GET    `localhost:4000/api/v1/products`  — paginated list
- POST   `localhost:4000/api/v1/products`  — body: `{ categoryId?, brandId?, productCode?, name (required), description?, gender?: "men"|"women"|"kids_boys"|"kids_girls"|"unisex", uom? (default "pair"), hsnCode?, gstPercentage? (0-100, default 0), productType?: "finished_goods"|"raw_material"|"packaging_material"|"semi_finished_goods"|"consumable"|"service" (default "finished_goods"), bomRequired?, productionRequired?, packagingRequired? }`. `productCode` is a product-level identifier distinct from any variant's `sku` — unique per company when set. `gender` is a customer-facing classification, separate from `productType` (an inventory classification) — neither implies the other.
- GET    `localhost:4000/api/v1/products/:id`  — response now includes a nested `brand: { id, name, brand_code, country, tagline } | null` object
- PATCH  `localhost:4000/api/v1/products/:id`  — same body shape as create (all fields optional), plus `status?: "active"|"inactive"|"discontinued"`
- DELETE `localhost:4000/api/v1/products/:id`
## Product Variants
A variant is a specific SKU (size/color/etc.) of a product — most other modules (orders, PRs, POs, stock) reference `productVariantId`, not `productId`.
- GET    `localhost:4000/api/v1/product-variants/generate-sku`  — reserves and returns the next variant SKU
- GET    `localhost:4000/api/v1/product-variants`  — paginated list
- POST   `localhost:4000/api/v1/product-variants`  — body: `{ productId (required), variantGroupId?, sku? (auto-generated if omitted), barcode?, size?, color?, weight?, mrp?, sellingPrice?, wholesalePrice?, dealerPrice?, costPrice? }`
- GET    `localhost:4000/api/v1/product-variants/:id`
- PATCH  `localhost:4000/api/v1/product-variants/:id`  — body (all optional): `{ variantGroupId?, barcode?, size?, color?, weight?, mrp?, sellingPrice?, wholesalePrice?, dealerPrice?, costPrice?, status?: "active"|"inactive"|"discontinued" }`
- DELETE `localhost:4000/api/v1/product-variants/:id`
## Product Variant Groups
Groups related variants of a product (e.g. same style across colors) under one `groupSku`.
- GET    `localhost:4000/api/v1/product-variant-groups`  — paginated list
- POST   `localhost:4000/api/v1/product-variant-groups`  — body: `{ productId (required), groupSku (required), variantName (required), color? }`
- GET    `localhost:4000/api/v1/product-variant-groups/:id`
- PATCH  `localhost:4000/api/v1/product-variant-groups/:id`  — body (all optional): `{ variantName?, color?, status?: "active"|"inactive" }`
- DELETE `localhost:4000/api/v1/product-variant-groups/:id`
## Brands
- GET    `localhost:4000/api/v1/brands`  — paginated list
- POST   `localhost:4000/api/v1/brands`  — body: `{ name (required), brandCode?, country?, description?, tagline? }`
- GET    `localhost:4000/api/v1/brands/:id`
- PATCH  `localhost:4000/api/v1/brands/:id`  — same body shape as create (all fields optional), plus `status?: "active"|"inactive"`
- DELETE `localhost:4000/api/v1/brands/:id`
## Departments
- GET    `localhost:4000/api/v1/departments`  — paginated list
- POST   `localhost:4000/api/v1/departments`  — body: `{ name (required) }`
- GET    `localhost:4000/api/v1/departments/:id`
- PATCH  `localhost:4000/api/v1/departments/:id`  — body (all optional): `{ name?, status?: "active"|"inactive" }`
- DELETE `localhost:4000/api/v1/departments/:id`
## Designations
- GET    `localhost:4000/api/v1/designations`  — paginated list
- POST   `localhost:4000/api/v1/designations`  — body: `{ name (required) }`
- GET    `localhost:4000/api/v1/designations/:id`
- PATCH  `localhost:4000/api/v1/designations/:id`  — body (all optional): `{ name?, status?: "active"|"inactive" }`
- DELETE `localhost:4000/api/v1/designations/:id`
## Customers
- GET    `localhost:4000/api/v1/customers`  — paginated list
- POST   `localhost:4000/api/v1/customers`  — body: `{ name (required), phone?, email?, gstin?, billingAddress?, shippingAddress? }`
- GET    `localhost:4000/api/v1/customers/:id`
- PATCH  `localhost:4000/api/v1/customers/:id`  — same body shape as create (all fields optional), plus `status?: "active"|"inactive"`
- DELETE `localhost:4000/api/v1/customers/:id`
## Vendors
- GET    `localhost:4000/api/v1/vendors`  — paginated list
- POST   `localhost:4000/api/v1/vendors`  — body: `{ name (required), phone?, email?, gstin?, address? }`
- GET    `localhost:4000/api/v1/vendors/:id`
- PATCH  `localhost:4000/api/v1/vendors/:id`  — same body shape as create (all fields optional), plus `status?: "active"|"inactive"`
- DELETE `localhost:4000/api/v1/vendors/:id`
## Orders
Customer sales order. Item lines reference `productVariantId`, not `productId`.
- GET   `localhost:4000/api/v1/orders`  — paginated list
- POST  `localhost:4000/api/v1/orders`  — body: `{ branchId?, warehouseId (required), customerId (required), items: [{ productVariantId (required), quantity (required, > 0) }] (min 1 item, required) }`
- GET   `localhost:4000/api/v1/orders/:id`
- PATCH `localhost:4000/api/v1/orders/:id/status`  — body: `{ status (required): "confirmed"|"packed"|"dispatched"|"delivered"|"completed" }`
- PATCH `localhost:4000/api/v1/orders/:id/payment-status`  — body: `{ paymentStatus (required): "partial"|"paid"|"refunded" }`
## Purchase Orders
A PO can only be created against an already-**approved** (or `converted_to_rfq`) Purchase Request — `purchaseRequestId` is mandatory. Item lines reference `productVariantId`, not `productId`.
- GET   `localhost:4000/api/v1/purchase-orders`  — paginated list
- POST  `localhost:4000/api/v1/purchase-orders`  — body: `{ branchId?, poNumber? (auto-generated if omitted), purchaseRequestId (required, must be an approved/converted_to_rfq PR), warehouseId (required), vendorId (required), deliveryAddress?, taxAmount? (default 0), paymentTerms?, expectedDeliveryDate?, items: [{ productVariantId (required), quantity (required, > 0), unitCost (required, ≥ 0) }] (min 1 item, required) }`
- GET   `localhost:4000/api/v1/purchase-orders/generate-number`  — reserves and returns the next PO number (`DSF-PO-0001`)
- GET   `localhost:4000/api/v1/purchase-orders/:id`  — includes `items[]`
- PATCH `localhost:4000/api/v1/purchase-orders/:id/status`  — body: `{ status (required): "pending_approval"|"approved"|"sent"|"acknowledged"|"partially_received"|"completed"|"cancelled" }`. Pipeline is sequential (`draft→pending_approval→approved→sent→acknowledged→partially_received→completed`); `cancelled` can fork off any state before `completed`. Moving to `partially_received` auto-credits on-hand stock for every line item (this is also where GRN/material-receipt happens — there's no separate GRN endpoint).
## Purchase Requests
Internal ask for goods raised *before* any vendor/PO exists (no pricing, no vendor — that's decided later at the Purchase Order stage). Item lines reference `productVariantId`, not `productId`.
- GET   `localhost:4000/api/v1/purchase-requests`  — query: `status?` (`draft`/`submitted`/`pending_approval`/`approved`/`rejected`/`converted_to_rfq`)
- POST  `localhost:4000/api/v1/purchase-requests`  — body: `{ branchId?, prNumber? (auto-generated if omitted), warehouseId (required), departmentId?, priority?: "low"|"medium"|"high"|"urgent" (default "medium"), requiredDate?, remarks?, items: [{ productVariantId (required), quantity (required, > 0), remarks? }] (min 1 item, required) }`. Note: `productVariantId` must be a `product_variants.id` (a specific SKU/size), not a `products.id` — Purchase always references the variant level, per the Chapter 7/9 Product/Variant split.
- GET   `localhost:4000/api/v1/purchase-requests/generate-number`  — reserves and returns the next PR number (`DSF-PR-0001`)
- GET   `localhost:4000/api/v1/purchase-requests/:id`
- PATCH `localhost:4000/api/v1/purchase-requests/:id/status`  — body: `{ status (required): "submitted"|"pending_approval"|"approved"|"rejected"|"converted_to_rfq" }`. A PO can only be created once status is `approved` or `converted_to_rfq`.
## Finance
- GET   `localhost:4000/api/v1/finance/transactions`
- POST  `localhost:4000/api/v1/finance/transactions`  — body: `{ branchId?, transactionDate? (ISO, defaults to now), referenceType: "order"|"purchase_order"|"expense"|"manual", referenceId?, direction: "debit"|"credit", amount (positive number), description? }`. No `account` field exists — this is a flat ledger-entry table (`company_id`/`branch_id` scoped only), not a wallet/chart-of-accounts. Only `referenceType: "manual"` lets the caller choose `direction`; for `order"`/`"purchase_order"`/`"expense"` the backend force-overrides direction (`order`→credit, `purchase_order`/`expense`→debit) regardless of what's sent. To add funds: `{ "referenceType": "manual", "direction": "credit", "amount": ..., "description": "..." }`. Posting date must fall in an open fiscal period or the write is rejected.
- GET   `localhost:4000/api/v1/finance/payment-slips`  — paginated list. Customer-side receipts only — there is no vendor-payment endpoint yet.
- POST  `localhost:4000/api/v1/finance/payment-slips`  — body: `{ orderId?, customerId (required), amount (required, > 0), paymentMode?: "cash"|"upi"|"card"|"bank_transfer" }`
- GET   `localhost:4000/api/v1/finance/expenses`  — paginated list
- POST  `localhost:4000/api/v1/finance/expenses`  — body: `{ warehouseId?, category (required), amount (required, > 0), description? }`
- GET   `localhost:4000/api/v1/finance/bills`  — paginated list
- POST  `localhost:4000/api/v1/finance/bills/print`  — body: `{ orderId (required) }`
- GET   `localhost:4000/api/v1/finance/ledger/summary`  — query: `from?`, `to?` (ISO dates; omit both for all-time). Response: `{ "debit": number, "credit": number, "balance": number }` where `balance = credit - debit`. No opening/closing-balance carry-forward — it's a flat sum over the (optionally date-filtered) range, not a running ledger balance. These 3 keys (`debit`/`credit`/`balance`) are the only authoritative source for a displayed balance; `/finance/transactions` rows carry no running-balance field.
- GET   `localhost:4000/api/v1/finance/fiscal-periods`  — paginated list
- POST  `localhost:4000/api/v1/finance/fiscal-periods`  — body: `{ periodStart (ISO date, required), periodEnd (ISO date, required, must be ≥ periodStart) }`
- PATCH `localhost:4000/api/v1/finance/fiscal-periods/:id/close`  — no body
- GET   `localhost:4000/api/v1/finance/gst`  — CA scope: GSTIN + GST settings profile
- GET   `localhost:4000/api/v1/finance/audits`  — CA scope: statutory audit records
- POST  `localhost:4000/api/v1/finance/audits`  — CA scope: record a statutory audit. body: `{ fiscalPeriodId?, auditorName (required), conductedAt (ISO date, required), findings?, remarks? }`
- GET   `localhost:4000/api/v1/finance/ledger/cross-verify`  — CA scope: single-tenant ledger cross-verification
## Loans (Debt Tracking)
Money borrowed by the company from a bank/vendor/other lender. Outstanding balance is never stored — it's always derived as `principal_amount - SUM(repayments.principal_component)`. Disbursement posts an auto credit `finance_transaction`; each repayment posts an auto debit — both flow into `/finance/ledger/summary` automatically.

Permissions follow the same CA-is-read-only convention as the rest of Finance (see `/finance/gst`, `/finance/audits`, `/finance/ledger/cross-verify`):
- `loan.view` (read-only) — CA + Accountant + Owner + Super Admin
- `loan.manage` (create/repay/write-off) — Accountant + Owner + Super Admin only, **not CA**

- GET    `localhost:4000/api/v1/loans/generate-number`  — `loan.manage`. Previews (does not consume) the next loan number, e.g. `DSF-LN-0001`
- GET    `localhost:4000/api/v1/loans`  — `loan.view`. Query: `status?` (`active`/`closed`/`written_off`)
- POST   `localhost:4000/api/v1/loans`  — `loan.manage`. Body: `{ branchId?, loanNumber?, lenderName, lenderType?: "bank"|"vendor"|"other" (default "bank"), principalAmount, interestRate?: 0-100 (default 0), interestType?: "flat"|"reducing" (default "flat"), startDate (ISO), tenureMonths?, remarks? }`
- GET    `localhost:4000/api/v1/loans/:id`  — `loan.view`. Includes derived `repaidPrincipal` and `outstandingBalance`
- PATCH  `localhost:4000/api/v1/loans/:id/write-off`  — `loan.manage`. Manual terminal state for a loan that will never be repaid; only valid from `active`
- GET    `localhost:4000/api/v1/loans/:id/repayments`  — `loan.view`
- POST   `localhost:4000/api/v1/loans/:id/repayments`  — `loan.manage`. Body: `{ amount, principalComponent (0 ≤ principalComponent ≤ amount), paidAt?, remarks? }`; `interestComponent` is derived server-side as `amount - principalComponent`. Loan auto-closes (`status: "closed"`) once `outstandingBalance` hits 0 — no separate close call needed for a normal payoff. Fails with `LOAN_002` if the loan isn't `active`.
## Notifications
- GET  `localhost:4000/api/v1/notifications`  — paginated list
- POST `localhost:4000/api/v1/notifications`  — body: `{ userId? (guid, null = broadcast), channel (required): "email"|"sms"|"push", templateKey (required), recipient (required), payload? (free-form object) }`
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
- PATCH  `localhost:4000/api/v1/company`  — body (all optional): `{ name?, legalName?, gstin?, baseCurrency?, locale?, theme? }`
- GET    `localhost:4000/api/v1/branches`  — paginated list
- POST   `localhost:4000/api/v1/branches`  — body: `{ name (required), code?, address? }`
- GET    `localhost:4000/api/v1/branches/:id`
- PATCH  `localhost:4000/api/v1/branches/:id`  — body (all optional): `{ name?, code?, address?, status?: "active"|"inactive" }`
- DELETE `localhost:4000/api/v1/branches/:id`
- GET    `localhost:4000/api/v1/warehouses`  — paginated list
- POST   `localhost:4000/api/v1/warehouses`  — body: `{ branchId (required), name (required), code?, address? }`
- GET    `localhost:4000/api/v1/warehouses/:id`
- PATCH  `localhost:4000/api/v1/warehouses/:id`  — body (all optional): `{ name?, code?, address?, status?: "active"|"inactive" }`
- DELETE `localhost:4000/api/v1/warehouses/:id`
- GET    `localhost:4000/api/v1/settings`
- PATCH  `localhost:4000/api/v1/settings`  — body (all optional): `{ invoicePrefix?, invoiceSequenceNext? (integer, ≥ 1), fiscalYearStartMonth? (1-12), gstSettings? (free-form object), notificationSettings? (free-form object) }`
