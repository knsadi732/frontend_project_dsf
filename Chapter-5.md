Chapter 5
Customer Domain
5.1 Introduction

The Customer Domain manages all customer-related information throughout the DS Footwear ERP SaaS platform.

A Customer represents any individual or business entity that purchases products or services from the organization.

The Customer Domain serves as the central repository for customer profiles, addresses, orders, payments, returns, communication history, and business relationships.

Every sales transaction, invoice, payment, shipment, and return is linked to a customer.

5.2 Purpose

The Customer Domain is responsible for:

Managing Customer Master Data.
Maintaining Customer Contact Information.
Managing Customer Addresses.
Processing Sales Orders.
Tracking Customer Payments.
Handling Product Returns.
Maintaining Customer Purchase History.
Supporting Customer Analytics and Reporting.
5.3 Customer Domain Structure
Customer
├── Customer Profile
├── Contact Information
├── Addresses
├── Orders
├── Payments
├── Returns
├── Communication History
└── Customer Analytics

Each sub-domain is logically independent while remaining connected to the Customer Master.

5.4 Customer Master

The Customer Master is the primary identity record for every customer.

Each customer receives a unique Customer Code generated automatically by the ERP.

The Customer Master is referenced by all sales, finance, dispatch, and reporting modules.

Customer Information
Basic Information
Customer ID (UUID)
Customer Code
Customer Type
Customer Name
Company Name (B2B)
GST Number (Optional)
PAN Number (Optional)
Contact Information
Primary Mobile Number
Secondary Mobile Number
Email Address
WhatsApp Number (Optional)
Business Information
Customer Category
Business Type
Preferred Payment Method
Credit Limit
Credit Days
System Information
Customer Status
Registration Date
Created By
Last Updated
Notes
5.5 Customer Types

The ERP supports multiple customer categories.

Examples include:

Retail Customer (B2C)
Wholesale Customer
Distributor
Dealer
Corporate Customer
Franchise
Online Marketplace Customer

Future customer types may be added without changing the overall business model.

5.6 Customer Addresses

Each customer may maintain multiple addresses.

Supported Address Types:

Billing Address
Shipping Address
Office Address
Warehouse Address (B2B)

Each address contains:

Contact Person
Mobile Number
Address Line
City
State
Country
Postal Code
Landmark (Optional)
5.7 Customer Orders

All customer purchases are maintained through Sales Orders.

Relationship:

Customer
      │
      ▼
Sales Orders
      │
      ▼
Order Items

Order History includes:

Pending Orders
Confirmed Orders
Packed Orders
Dispatched Orders
Delivered Orders
Cancelled Orders
5.8 Customer Payments

The Finance Domain maintains payment records against customer invoices.

Supported Payment Modes:

Cash
UPI
Bank Transfer
Credit Card
Debit Card
Net Banking
Wallet
Credit Account

Payment Status:

Pending
Partial
Paid
Overdue
Refunded
5.9 Customer Returns

Customers may initiate return requests after delivery.

Return Flow:

Customer
      │
      ▼
Return Request
      │
      ▼
Inspection
      │
      ▼
Approval
      │
      ▼
Inventory Update
      │
      ▼
Refund / Replacement

Return reasons may include:

Damaged Product
Wrong Product
Size Issue
Manufacturing Defect
Customer Cancellation
5.10 Communication History

The ERP maintains communication records with customers.

Examples:

SMS
Email
WhatsApp (Future)
Phone Call Notes
Support Tickets
Notifications

Communication history helps Customer Support and Sales teams provide better service.

5.11 Customer Analytics

The ERP generates customer-related business insights, including:

Total Orders
Total Revenue
Average Order Value
Outstanding Amount
Return Rate
Purchase Frequency
Last Purchase Date
Top Customers

These metrics are used in dashboards and reports.

5.12 Business Rules

The Customer Domain follows these business rules:

Every customer must have a unique Customer Code.
A customer may have multiple addresses.
A customer may place multiple Sales Orders.
Every Sales Order belongs to exactly one customer.
Payments must always reference a valid Invoice.
Returns can only be initiated for delivered orders.
Customer master data must not be deleted if transactions exist; instead, the customer should be marked Inactive.
Customer contact information must be reusable across all business modules.
Customer credit limits and payment terms must be validated before approving credit-based orders.
All customer activities must be auditable.
5.13 Customer Relationship Diagram
Customer
    │
    ├── Addresses
    ├── Orders
    │      ├── Order Items
    │      ├── Invoice
    │      └── Dispatch
    │
    ├── Payments
    ├── Returns
    ├── Communication History
    └── Analytics
5.14 Dependencies

The Customer Domain is referenced by the following ERP modules:

Sales
Finance
Dispatch
Returns
Notifications
Reports
Dashboard
Customer Support

Every customer-related transaction references the Customer Master.

Chapter Summary

The Customer Domain serves as the central repository for customer information within the DS Footwear ERP SaaS platform. It manages customer identities, addresses, orders, payments, returns, communication history, and analytical insights. By maintaining a single Customer Master, the ERP ensures data consistency, eliminates duplication, and supports seamless integration across Sales, Finance, Dispatch, Customer Support, and Reporting modules. This domain provides a scalable foundation for both B2C and B2B business operations while supporting future expansion into CRM, loyalty programs, and marketplace integrations.