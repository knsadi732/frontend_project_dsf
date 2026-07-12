Chapter 6
Vendor Domain
6.1 Introduction

The Vendor Domain manages all supplier-related information within the DS Footwear ERP SaaS platform.

A Vendor represents any individual, company, manufacturer, distributor, service provider, or contractor who supplies raw materials, packaging materials, finished goods, machinery, services, or other business resources required by the organization.

The Vendor Domain serves as the central repository for vendor profiles, purchase transactions, goods receipts, payments, compliance documents, and procurement history.

Every procurement transaction originates from a registered Vendor.

6.2 Purpose

The Vendor Domain is responsible for:

Managing Vendor Master Data.
Maintaining Vendor Contact Information.
Managing Vendor Addresses.
Processing Purchase Requests.
Managing Purchase Orders.
Recording Goods Receipt Notes (GRN).
Tracking Vendor Payments.
Maintaining Vendor Performance.
Supporting Procurement Analytics and Reporting.
6.3 Vendor Domain Structure
Vendor
├── Vendor Profile
├── Contact Information
├── Addresses
├── Purchase Requests
├── Purchase Orders
├── Goods Receipt Notes (GRN)
├── Payments
├── Documents
├── Performance
└── Procurement Analytics

Each sub-domain is logically independent while remaining connected to the Vendor Master.

6.4 Vendor Master

The Vendor Master is the primary identity record for every supplier.

Each vendor is assigned a unique Vendor Code generated automatically by the ERP.

All purchase-related transactions reference the Vendor Master.

Vendor Information
Basic Information
Vendor ID (UUID)
Vendor Code
Vendor Name
Company Name
Vendor Type
GST Number
PAN Number
Contact Information
Primary Contact Person
Mobile Number
Alternate Mobile Number
Email Address
Website (Optional)
Business Information
Business Category
Payment Terms
Credit Limit
Credit Days
Preferred Currency
System Information
Vendor Status
Registration Date
Created By
Last Updated
Internal Notes
6.5 Vendor Types

The ERP supports multiple supplier categories.

Examples:

Raw Material Supplier
Finished Goods Supplier
Packaging Material Supplier
Machinery Supplier
Spare Parts Supplier
Service Provider
Transport Vendor
Logistics Partner
Maintenance Contractor

New vendor types may be added without affecting the domain model.

6.6 Vendor Addresses

Each vendor may maintain multiple addresses.

Supported Address Types:

Registered Office
Factory Address
Warehouse Address
Billing Address
Shipping Address

Each address contains:

Contact Person
Mobile Number
Address Line
City
State
Country
Postal Code
6.7 Purchase Requests

A Purchase Request (PR) is an internal request generated when materials or services are required.

Purchase Requests may originate from:

Inventory
Production
Maintenance
Administration
Finance

Flow:

Department
      │
      ▼
Purchase Request
      │
      ▼
Purchase Approval
6.8 Purchase Orders

Approved Purchase Requests are converted into Purchase Orders.

Relationship:

Vendor
      │
      ▼
Purchase Order
      │
      ▼
Purchase Order Items

Purchase Order Status:

Draft
Pending Approval
Approved
Sent
Partially Received
Completed
Cancelled
6.9 Goods Receipt Note (GRN)

The Goods Receipt Note records the physical receipt of purchased goods.

Flow:

Purchase Order
      │
      ▼
Goods Arrival
      │
      ▼
Quality Inspection
      │
      ▼
GRN
      │
      ▼
Inventory Update

GRN records:

Received Quantity
Accepted Quantity
Rejected Quantity
Damaged Quantity
Batch Number (Optional)
Remarks
6.10 Vendor Payments

The Finance Domain manages vendor payments.

Supported Payment Methods:

Bank Transfer
UPI
Cheque
Cash
RTGS / NEFT
IMPS

Payment Status:

Pending
Partial
Paid
Overdue

Payments are always linked to Vendor Invoices and Purchase Orders.

6.11 Vendor Documents

The ERP stores vendor-related compliance documents.

Supported Documents:

GST Certificate
PAN Card
MSME Certificate
Bank Details
Cancelled Cheque
Trade License
Agreement / Contract
Quality Certifications (ISO, BIS, etc.)

Documents are uploaded once and reused across Procurement, Finance, Audit, and Compliance.

6.12 Vendor Performance

The ERP evaluates vendor performance using key procurement metrics.

Examples:

On-Time Delivery %
Average Delivery Time
Order Fulfillment Rate
Rejection Rate
Quality Rating
Purchase Value
Outstanding Amount

These metrics assist in vendor selection and procurement decisions.

6.13 Procurement Analytics

The Vendor Domain supports procurement dashboards and reports.

Examples:

Total Vendors
Active Vendors
Monthly Purchase Value
Pending Purchase Orders
Outstanding Payments
Top Vendors
Vendor Performance Ranking
6.14 Business Rules

The Vendor Domain follows these business rules:

Every vendor must have a unique Vendor Code.
A vendor may have multiple addresses.
A vendor may receive multiple Purchase Orders.
Every Purchase Order belongs to exactly one vendor.
Goods can only be received against an approved Purchase Order.
Inventory is updated only after a successful GRN.
Vendor payments must reference valid Purchase Orders and Vendor Invoices.
Vendor master records with transactions cannot be deleted; they may only be marked Inactive.
Compliance documents are uploaded once and reused across all business modules.
Vendor performance must be continuously calculated from procurement transactions.
6.15 Vendor Relationship Diagram
Vendor
    │
    ├── Addresses
    ├── Purchase Requests
    ├── Purchase Orders
    │       ├── Purchase Items
    │       ├── GRN
    │       └── Payments
    │
    ├── Documents
    ├── Performance
    └── Procurement Analytics
6.16 Dependencies

The Vendor Domain is referenced by the following ERP modules:

Purchase
Inventory
Production
Finance
Warehouse
Reports
Dashboard
Notifications
Audit Logs

Every procurement-related transaction references the Vendor Master.

Chapter Summary

The Vendor Domain serves as the central procurement and supplier management repository within the DS Footwear ERP SaaS platform. It manages vendor identities, compliance documents, purchase requests, purchase orders, goods receipt notes (GRN), payments, and performance metrics. By maintaining a single Vendor Master, the ERP ensures consistent supplier information, efficient procurement workflows, accurate inventory updates, and seamless integration across Purchase, Inventory, Finance, Warehouse, Reporting, and Audit modules. This design provides a scalable foundation for both domestic and international supplier management.