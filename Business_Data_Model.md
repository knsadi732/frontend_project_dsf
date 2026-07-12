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