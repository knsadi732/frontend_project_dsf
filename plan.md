DS Footwear ERP SaaS Frontend Documentation v1.0 (Enterprise Edition)

Target Audience: Frontend Developers Only

System Version: 1.0.0 (SaaS Multi-Tenant UI Core)

Application Type: Enterprise ERP SaaS

Architecture Type: Feature-Based Modular Frontend Architecture

Technology Stack

ReactJS 18+
Vite
Tailwind CSS
React Router DOM
TanStack Query v5
Zustand
Axios
React Hook Form
Zod
Socket.IO Client
Recharts
Lucide React
Chapter-1
Frontend Architecture
Enterprise Directory Structure
src/
├── assets/
├── components/
├── config/
├── constants/
├── contexts/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── socket/
├── store/
├── styles/
├── types/
├── utils/
├── App.jsx
└── main.jsx
Global Layout Engine
Browser

↓

React Router

↓

Authentication

↓

RBAC

↓

Layout

↓

Page

↓

Components

↓

API

↓

Backend
UI Principles
Modern Enterprise SaaS
Keyboard Friendly
Responsive
Accessible
Reusable
High Density Tables
Fast Rendering
Chapter-2
Authentication & RBAC
Service-01 Authentication

Contains

Login
Logout
Forgot Password
Reset Password
Refresh Token
Session Expiry
Remember Login
Token Refresh
Protected Route
Public Route
UI Flow
Phone

↓

Password

↓

Validation

↓

Axios

↓

Backend

↓

JWT

↓

Zustand

↓

Dashboard
RBAC UI Engine
Role

↓

Permission

↓

Sidebar

↓

Page

↓

Component

↓

Action

↓

API

ERP Roles

Super Admin
Owner
Accountant
CA
Purchase
Inventory
Production
Sales
Dispatch
Customer Support
Employee

Permission Types

Menu
Page
Button
Export
Import
Print
Chapter-3
Core Frontend Services
Service-02 Company & Settings

Contains

Company Profile
Branch Switch
Warehouse Switch
Theme
Currency
Language
Financial Year
Service-03 User Management

Contains

Users
Roles
Permission
Departments
Designation
Profile
Password
Login History
Service-04 Document Management

Contains

Upload
Preview
Download
Delete

Supported Files

Product Image
GST Certificate
Vendor Documents
Employee Documents
Invoice PDF
Service-05 Dashboard

Contains

KPI Cards
Charts
Today's Orders
Sales
Payments
Pending Orders
Low Stock
Notifications

Socket.IO

Realtime Dashboard

Service-06 Notification

Contains

Toast
Alert
Socket Notification
Email Status
SMS Status
Service-07 Analytics

Contains

Dashboard
Sales Report
Purchase Report
Inventory Report
Finance Report
Chapter-4
Business Rules
Form Validation

Every Form

↓

React Hook Form

↓

Zod

↓

API

↓

Backend Validation

Optimistic Update

Used In

Product
Inventory
Orders
Global UI Rules
All Forms use React Hook Form
All Validation uses Zod
All APIs use Axios
All Data Fetching uses TanStack Query
Global Error Handler Mandatory
Global Loader Mandatory
Chapter-5
Frontend Standards
Folder Naming
camelCase

PascalCase

kebab-case

Global API Response

Every API should expect

Success

↓

Data

↓

Error

↓

Pagination
Pagination Component

Every Table

Search
Filter
Sort
Export
Pagination
Global Components
Button
Input
Select
DatePicker
Table
Modal
Drawer
Card
Loader
Skeleton
Pagination
Search
Filter
Chart
Toast
Avatar
Badge
Timeline
Breadcrumb
Tabs
Chapter-6
Performance & Security
TanStack Query Cache

Cache Types

Dashboard
Products
Inventory
Users
Settings
Lazy Loading

All Pages

↓

React.lazy()

↓

Suspense

Bundle Optimization
Route Splitting
Lazy Import
Memo
useCallback
useMemo
Security
Protected Routes
Token Validation
Permission Check
XSS Safe Rendering
Secure Local Storage
Session Expiry
ERP 1.0 Frontend Modules
Authentication
Dashboard
Company
Users
Roles
Permissions
Customers
Vendors
Products
Categories
Inventory
Purchase
Production
Orders
Sales
Dispatch
Finance
Reports
Notifications
Settings
Chapter-7
Module Development & Coding Standards
Module Development Standard

Every feature module under features/ must follow the same internal structure

features/
└── products/
    ├── api/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── queries/
    ├── mutations/
    ├── validators/
    ├── utils/
    └── index.js

Rule

Every module follows this exact shape, no ad-hoc folders

API Layer Convention

services/
├── api/
│   └── axios.js
├── auth.api.js
├── product.api.js
├── inventory.api.js
├── sales.api.js
└── finance.api.js

Rule

One Service File = One Backend Service

Query Key Convention

queryKeys.js centralizes every TanStack Query key

products
products.list
products.detail
orders
orders.list
orders.detail
dashboard
inventory

Rule

Every query and mutation references queryKeys, never a hardcoded key array

Component Naming Standard

BaseButton
AppButton
ProductTable
OrderTable
InventoryCard
DashboardWidget

Rule

Common components → components/ui
Business components → features/<module>/components
Chapter-8
Documentation Roadmap (Volumes)
Volume-1 Frontend Architecture
Volume-2 Authentication Service
Volume-3 RBAC UI Engine
Volume-4 User Management
Volume-5 Dashboard Service
Volume-6 Product Service
Volume-7 Purchase Service
Volume-8 Inventory Service
Volume-9 Production Service
Volume-10 Sales Service
Volume-11 Finance Service
Volume-12 Notification Service
Volume-13 Report Service
Volume-14 API Integration
Volume-15 UI Component Library
Volume-16 Security & Performance