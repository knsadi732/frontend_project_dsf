Document Structure
Cover Page
DS Footwear ERP SaaS

Business Data Model

Version : 1.0

Application : Enterprise ERP SaaS

Document Type : Business Domain Model

Target Audience :
• Backend Developers
• Frontend Developers
• Database Architects
• Product Owners
• QA Team

Chapter 1
Business Domain Overview

Purpose

This document defines every business entity used throughout the ERP.

It serves as the single source of truth for:

Backend
Frontend
PostgreSQL Database
APIs
Reports
Dashboards
Business Workflows

Chapter 2
Organization Domain
Company
↓
Branch
↓
Warehouse
↓
Department
↓
Designation
↓
Employee

Entities
    Company
    Branch
    Warehouse
    Department
    Designation
    Employee

Chapter 3
Employee Domain
Employee
│
├── Employee Profile
├── Login & Authentication
├── Roles
├── Permissions
├── Departments
├── Designations
├── Reporting Manager
├── Branch Assignment
├── Warehouse Assignment
├── Salary & Payroll
├── Attendance
├── Shift Management
├── Leave Management
├── Documents
├── Assets
├── Performance (Future)
├── Training (Future)
├── Audit Logs
└── Employment Lifecycle
Employee Fields
Basic Information
Employee Code
First Name
Middle Name
Last Name
Gender
Date of Birth
Blood Group
Marital Status
Photo
Contact Information
Mobile Number
Alternate Mobile
Email
Emergency Contact
Address
City
State
Country
PIN Code
Employment Information
Employee Code
Joining Date
Employment Type
Employment Status
Probation Period
Confirmation Date
Organization Information
Company
Branch
Warehouse
Department
Designation
Reporting Manager
ERP Access
Login Phone
Password
Roles (Multiple)
Permissions
Last Login
Account Status
Government Information
Aadhaar
PAN
UAN (Optional)
ESIC (Optional)
Banking Information
Bank Name
Account Number
IFSC Code
Account Holder Name
Salary Information
Salary Structure
Basic Salary
Allowances
Deductions
Documents
Aadhaar
PAN
Photograph
Signature
Bank Passbook
Educational Certificates
Experience Certificates
Offer Letter
Appointment Letter
Other Documents
Operational Information
Assigned Branches
Assigned Warehouses
Assigned Departments
Assigned Roles
Audit Information
Created By
Updated By
Created At
Updated At
Business Rules
Employee = ERP User.
No separate User table.
Every Employee has a unique Employee Code.
Phone Number must be unique.
One Employee may belong to one primary Department.
One Employee has one Designation.
One Employee may be assigned to multiple ERP Roles.
ERP Permissions are derived from assigned Roles.
Every Employee belongs to one Company and one primary Branch.
Employee documents are uploaded only once and reused across all ERP modules.
Employee records are soft deleted.
Every Employee activity is recorded in Audit Logs.

Chapter 4
RBAC Domain
Role
↓
Permission
↓
Role Permission
↓
Employee

Entities

Roles
Permissions
Role Permissions

Chapter 5
Customer Domain
Customer
↓
Address
↓
Orders
↓
Payments
↓
Returns

Chapter 6
Vendor Domain
Vendor
↓
Purchase Orders
↓
GRN
↓
Payments

Chapter 7
Product Domain
Category
↓
Sub Category
↓
Brand
↓
Product
↓
Product Variant
↓
Inventory
Business Rule
Product contains only Master Data.
No Stock fields.
Product Domain represents only sellable/manufactured finished goods (footwear the
company sells) — everything the company purchases or internally consumes to run the
business (raw material, packaging, consumables, spares, tools, fixed assets, services)
belongs to the Item & Material Master Domain (Chapter 8), never to Product.

Chapter 8
Item & Material Master Domain

Purpose

Product/Category/Variant/SKU (Chapter 7) represents only the finished footwear DS
Footwear sells. The company also purchases and consumes a much wider range of things —
raw material, packaging, consumables, spare parts, tools, fixed assets, and services —
none of which belong in the Product Master. This domain is the single master for
everything the company buys or uses that is not itself a sellable product.

Item / Material Master
│
├── Raw Material
│   ├── Leather
│   ├── PU
│   ├── EVA
│   ├── Rubber
│   ├── Adhesive
│   └── Chemicals
│
├── Packaging Material
│   ├── Shoe Box
│   ├── Polybag
│   ├── Carton
│   └── Tape
│
├── Consumables
│   ├── Stationery
│   ├── Cleaning Material
│   ├── Electrical Consumables
│   └── General Consumables
│
├── Spare Parts
│
├── Tools
│
├── Fixed Assets
│   ├── Machinery
│   ├── Computer
│   ├── Furniture
│   ├── Vehicle
│   └── Equipment
│
└── Services
    ├── Maintenance
    ├── Transport
    ├── Consultancy
    └── Other Services

Item Flow

Item
↓
Item Category
↓
Item Specification
↓
Purchase
↓
Stock / Asset / Consumption

Examples

Item: EVA Sheet
Category: Raw Material
UOM: Sheet
Purchase → Raw Material Inventory → Production

Item: A4 Paper
Category: Stationery
Purchase → Consumable Stock → Office Consumption

Asset: Laptop
Category: IT Asset
Purchase → Fixed Asset Register → Employee Assignment

Product vs Item/Material — the critical distinction

Product (what the company sells):
Product → Category → Variant → SKU → Barcode → Sales
Example: Product "DS Sports Runner", Category "Shoes", Variant "Black / Size 8",
SKU "DS-SR-BLK-08", Barcode "890XXXXXXXXX".

Item/Material (what the company buys or consumes internally):
Item → Item Category → Item Specification → Purchase → Stock / Asset / Consumption.

Business Rules
Product and Item/Material are separate masters — never merged.
Raw Material, Packaging Material, and Consumables are inventory-tracked by quantity
(same Inventory & Warehouse Management Domain as finished goods, Chapter 11).
Fixed Assets must NOT be merged into Item/Material Inventory — a purchased Fixed Asset
moves into the Fixed Asset Register (Chapter 13), not into quantity-based stock.
Example: 100 cartons or 500 kg EVA → Inventory. 1 CNC Machine, 1 Laptop, or 1 Vehicle →
Fixed Asset Register, never Inventory.
Services purchased (maintenance, transport, consultancy) have no stock/asset outcome —
they post directly to Finance as an expense against the Purchase/GRN record.

Chapter 9
Category Domain
Footwear
├── Shoes
│ ├── Sports Shoes
│ ├── Casual Shoes
│ └── Formal Shoes
├── Sandals
├── Slippers
└── Boots
Business Rule
Category uses Parent-Child hierarchy.
No separate SubCategory table.

Chapter 10
Product Variant & SKU Domain
Product
↓
Variant
↓
SKU
↓
Barcode
↓
Inventory

Each Variant has
    Size
    Color
    SKU
    Barcode
    MRP
    Selling Price
    Cost Price
    Manufacturing Rate (₹/pair, per-design piece-rate labour)
    Packaging Material Cost (₹/pair)

MRP/Selling Price are the same across every Variant of one Product (one design);
Manufacturing Rate and Packaging Cost are genuinely per-design and must not be assumed
identical across different Products. Selling Price/MRP are calculator-derived from real
production cost and real (or assumed) marketplace cost — see Chapter 10 §10.11.1.

Chapter 11
Inventory & Warehouse Management Domain
Inventory
├── Raw Material
├── Finished Goods
├── Packaging Material
├── Reserved Stock
├── Damaged Stock
└── Returned Stock

Business Rule
Inventory stores quantities.
Product never stores quantities.
Raw Material, Packaging Material, and Consumables inventory originate from the Item &
Material Master Domain (Chapter 8), not from Product.

Chapter 12
Purchase Domain
Vendor
↓
Purchase Request
↓
Purchase Order
↓
GRN
↓
Inventory

Purchase Order line items reference the Item & Material Master (Chapter 8) — raw
material, packaging, consumables, spares, tools, fixed assets, or services — never the
Product Master (Chapter 7), since Product represents only what the company sells.

Chapter 13
Fixed Asset Domain

Purpose

A Fixed Asset (machinery, computers, furniture, vehicles, equipment) is purchased
through the same Purchase Domain (Chapter 12) as any other item, but once received it
does not become quantity-based stock — it becomes a tracked, individually-identified
asset with its own lifecycle. This domain is that lifecycle, downstream of GRN whenever
the GRN's item category is "Fixed Assets".

Purchase (Item Category: Fixed Assets)
↓
GRN
↓
Fixed Asset Register
│
├── Depreciation
├── Location
├── Custodian
├── Maintenance
└── Disposal

Entities
    Fixed Asset Register (one row per physical asset, not per quantity)
    Depreciation Schedule
    Maintenance Log
    Asset Assignment (Location / Custodian, e.g. an Employee or Warehouse)
    Disposal Record

Business Rules
A Fixed Asset is never recorded in Item/Material Inventory (Chapter 8) or Inventory &
Warehouse Management (Chapter 11) — it lives only in the Fixed Asset Register.
Each Fixed Asset is tracked individually (by asset tag/serial), not by aggregate
quantity, unlike raw material or consumables.
A Fixed Asset must have a Custodian and/or Location at all times after receipt.
Depreciation is computed against the Fixed Asset Register, feeding Finance & Accounting
(Chapter 17), not against Inventory.
Disposal (sale, write-off, scrap) closes the asset's lifecycle and posts a corresponding
Finance entry.
Depreciation is booked one full financial year at a time (1 April - 31 March), never
prorated by the day — an asset used less than 180 days in its financial year of purchase
earns half that year's rate, 180+ days earns the full rate; a financial year still in
progress contributes zero depreciation until it closes (Chapter 13 §13.6.1).

Chapter 14
Production Planning & Manufacturing Domain
Production Request
↓
BOM
↓
Raw Material
↓
Production Order
↓
Finished Goods
↓
Inventory

Raw Material consumed here is sourced from the Item & Material Master Domain
(Chapter 8); the Production Order's output (Finished Goods) is a Product (Chapter 7).
Manufacturing Labour Cost and Packaging Cost are piece-rate, held on the Product Variant
itself (₹/pair, per design — Chapter 10) and auto-applied the moment a Work Order
completes — never a fixed salary, never one rate for the whole business.

Chapter 15
Sales & Order Management Domain (Order-to-Cash)
Website Order
↓
Sales Review
↓
Sales Order
↓
Inventory Check
↓
Stock Reservation
↓
Warehouse
↓
Dispatch
↓
Invoice
↓
Finance
↓
Customer

Chapter 16
Warehouse Domain
Warehouse
↓
Zones
↓
Rack
↓
Shelf
↓
Bin
↓
Inventory

Chapter 17
Finance & Accounting Domain
Invoice
↓
Payment
↓
Ledger
↓
GST
↓
Outstanding
↓
Reports

Also part of this domain: Payables (a due owed outside the PO/GRN flow — no ledger
posting until an actual payment is recorded), Marketplace Channels & Settlements
(per-channel and per-Payment-Advice actual cost data, posting only the net amount
received), and GST Input Tax Credit eligibility (claimed only when a purchase invoice
carries this business's own GSTIN as buyer — a B2C purchase's GST is cost, never a
credit). See Chapter 17 §17.21-17.23 for the full model.

Chapter 18
Return Domain
Customer
↓
Return Request
↓
Inspection
↓
Approved
↓
Inventory
↓
Finance

Return Rate, RTO %, and Damage % are tracked per Product/Category/Variant, never as one
blanket figure for the whole business — a "Sandal" design and a "Sneaker" design do not
share a return rate (Chapter 18 §18.16.1).

Chapter 19
Communication, Notification & Workflow Automation Domain
System Event
↓
Notification
↓
SMS
↓
Email
↓
Socket.IO

Chapter 20
Reporting & Business Intelligence (BI) Domain
Sales
Inventory
Purchase
Production
Finance
Customer
Vendor
Fixed Assets

Chapter 21
Enterprise Business Rules

Examples

Employee = ERP User
Product never stores stock
Inventory stores quantities
One Product → Many Variants
One Variant → Many Warehouse Stocks
SO created only after Sales approval
Stock is Reserved before Dispatch
Invoice generated after Dispatch
Finance updates Ledger after Invoice
Product and Item/Material are separate masters — never merged
Fixed Assets are never recorded in Inventory — only in the Fixed Asset Register
Depreciation is booked one financial year at a time (180-day rule), never daily
A due outside the PO/GRN flow (Payable) posts no ledger entry until actually paid
Input Tax Credit is claimed only against a genuine B2B invoice — never on B2C GST
Return Rate, RTO %, Damage %, and Marketplace Cost are tracked per Product/Variant

Chapter 22
Enterprise Domain Relationship Diagram
Company
   │
   ├── Branch
   │      │
   │      ├── Warehouse
   │      │      │
   │      │      ├── Inventory
   │      │
   │      ├── Employee
   │      │      │
   │      │      ├── Role
   │      │
   │      ├── Customer
   │      │
   │      ├── Vendor
   │      │
   │      ├── Product
   │      │      │
   │      │      ├── Variant
   │      │      │      │
   │      │      │      ├── Sales
   │      │      │      ├── Purchase
   │      │      │      ├── Production
   │      │      │      └── Inventory
   │      │
   │      ├── Item / Material
   │      │      │
   │      │      ├── Raw Material ──────→ Inventory ──→ Production ──→ Product
   │      │      ├── Packaging ─────────→ Inventory
   │      │      ├── Consumables ───────→ Inventory / Consumption
   │      │      ├── Spare Part ────────→ Spare Inventory
   │      │      ├── Tool ──────────────→ Tool Register
   │      │      ├── Fixed Asset ───────→ Fixed Asset Register
   │      │      │                              │
   │      │      │                              ├── Depreciation
   │      │      │                              ├── Location
   │      │      │                              ├── Custodian
   │      │      │                              ├── Maintenance
   │      │      │                              └── Disposal
   │      │      └── Service ───────────→ Finance (direct expense)
   │      │
   │      └── Finance
   │             │
   │             ├── Accounts Payable (PO/GRN-bound Vendor Bills)
   │             ├── Payables (generic dues, no PO/GRN)
   │             ├── Loans (debt tracking)
   │             ├── Marketplace Channels ──→ Marketplace Settlements ──→ Ledger (net received)
   │             └── GST ──→ Input Tax Credit (B2B-with-buyer-GSTIN only)
