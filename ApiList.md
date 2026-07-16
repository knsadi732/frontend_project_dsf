# API Endpoints

Base URL: `http://localhost:4000/api/v1`
(port/prefix override hoga agar `.env` me `PORT` / `API_PREFIX` set hai)

## Auth
- POST `localhost:4000/api/v1/auth/login`  — body: `{ "identifier": "email or phone", "password": "..." }`
- POST `localhost:4000/api/v1/auth/refresh`
- POST `localhost:4000/api/v1/auth/logout`
- GET  `localhost:4000/api/v1/auth/me`

## Users
- GET    `localhost:4000/api/v1/users`
- POST   `localhost:4000/api/v1/users`
- GET    `localhost:4000/api/v1/users/:id`
- PATCH  `localhost:4000/api/v1/users/:id`
- DELETE `localhost:4000/api/v1/users/:id`

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
- GET   `localhost:4000/api/v1/purchase-orders/:id`
- PATCH `localhost:4000/api/v1/purchase-orders/:id/status`

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
