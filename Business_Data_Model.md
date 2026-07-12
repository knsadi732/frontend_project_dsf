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

├── Login
├── Role
├── Permission
├── Department
├── Designation
├── Salary
├── Attendance
├── Leave
├── Documents
├── Assets
└── Audit Logs

Employee Fields

    Employee Code
    Name
    Phone
    Email
    Aadhaar
    PAN
    Bank
    Salary
    Documents
    Role
    Department
    Designation

Business Rule

Employee = ERP User

No separate User table.

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

Chapter 8
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

Chapter 9
Product Variant & SKU Domainn
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

Chapter 10
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

Chapter 11
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

Chapter 12
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

Chapter 13
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

Chapter 14
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

Chapter 15
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

Chapter 16
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

Chapter 17
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

Chapter 18
Reporting & Business Intelligence (BI) Domain
Sales
Inventory
Purchase
Production
Finance
Customer
Vendor

Chapter 19
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

Chapter 20
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
   │      └── Finance