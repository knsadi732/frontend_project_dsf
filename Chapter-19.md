Chapter 19
Enterprise Business Rules
19.1 Introduction

The Enterprise Business Rules define the core operational logic governing every business process within the DS Footwear ERP SaaS platform.

These rules ensure consistency, data integrity, automation, auditability, and standardized business workflows across all ERP modules.

Every frontend screen, backend API, database transaction, and business workflow must comply with these rules.

19.2 Organization Rules
Every Company may have multiple Branches.
Every Branch may have multiple Warehouses.
Every Warehouse belongs to exactly one Branch.
Every Employee belongs to one primary Branch.
Every business transaction must belong to a Company.
19.3 Employee Rules
Employee = ERP User.
No separate User table exists.
Every Employee has a unique Employee Code.
Phone Number must be unique.
Employees may have multiple Roles.
Roles determine Permissions.
Employee login uses Phone Number and Password.
Employee documents are uploaded only once and reused by all departments.
Deleted Employees are soft deleted.
Every Employee activity is recorded in Audit Logs.
19.4 RBAC Rules
Every API requires permission validation.
Every page requires View permission.
Buttons require Create, Update or Delete permission.
Hidden menus cannot be accessed through URL manipulation.
Backend permission validation is mandatory.
Multiple Roles are merged to calculate effective permissions.
19.5 Product Rules
Product stores only Master Data.
Product never stores stock quantities.
Product Code must be unique.
Product belongs to one Category.
Category uses Parent–Child hierarchy.
One Product may have multiple Variants.
Product deletion is restricted if transactions exist.
Product status controls availability.
19.6 Product Variant Rules
Every Variant belongs to one Product.
Every Variant has a unique SKU.
Every Variant has one Barcode.
Size and Color define Variant uniqueness.
Selling Price is maintained at Variant level.
Inventory is maintained at Variant level.
19.7 Inventory Rules
Inventory stores all stock quantities.
Product never stores quantities.
Stock exists at Warehouse level.
One Variant may exist in multiple Warehouses.
Inventory Transactions are immutable.
Negative Stock is not allowed.
Every stock movement generates an Inventory Transaction.
Reserved Stock cannot be sold twice.
19.8 Purchase Rules
Purchase Requests require approval.
Approved Purchase Requests generate RFQs.
RFQs are sent automatically to Vendors.
Vendor Quotations are compared before selection.
Approved Vendor generates Purchase Order.
Purchase Orders are emailed automatically.
Inventory updates only after GRN approval.
Purchase Orders cannot be edited after approval.
19.9 Production Rules
Production starts only from an approved Production Order.
BOM is mandatory.
Raw Materials must be available before production starts.
Raw Materials are reserved before manufacturing.
Finished Goods are added only after Production Completion.
Production Cost is calculated automatically.
Production updates Inventory automatically.
19.10 Sales Rules
Orders from Website/Marketplace enter Sales Review.
Sales Team approves or rejects every order.
Sales Order (SO) is generated only after approval.
Inventory availability is checked before confirmation.
Stock is reserved immediately after SO approval.
Reserved Stock cannot be allocated elsewhere.
Warehouse receives Picking Requests automatically.
Dispatch is allowed only after Packing completion.
Invoice is generated only after Dispatch.
Customer receives Invoice automatically.
19.11 Warehouse Rules
Inventory is stored at Bin level.
Every Picking activity is logged.
Barcode scanning is mandatory during Picking.
Packing verification is mandatory.
Dispatch requires Shipment Confirmation.
Warehouse transfers update Inventory immediately.
19.12 Finance Rules
Every Invoice generates Journal Entries.
Double Entry Accounting is mandatory.
General Ledger entries cannot be modified after posting.
Customer Payments update Accounts Receivable.
Vendor Payments update Accounts Payable.
GST is calculated automatically.
Financial Reports use only posted entries.
19.13 Return Rules
Returns are allowed only against completed Sales Orders.
Warehouse inspection is mandatory.
Inventory updates only after approval.
Refunds require Finance approval.
Replacement Orders follow the Sales workflow.
Credit Notes are generated automatically.
19.14 Communication Rules
Every important business event generates a System Event.
Approved Purchase Orders are emailed automatically.
RFQs are emailed automatically to Vendors.
Customer Invoices are emailed automatically.
Payment Receipts are emailed automatically.
Real-time notifications use Socket.IO.
All communications are logged.
19.15 Reporting Rules
Reports use committed business transactions only.
Dashboard KPIs update automatically.
Users access reports according to RBAC.
Reports support filtering and export.
Historical reports remain immutable.
19.16 Audit Rules
Every Create operation is logged.
Every Update operation is logged.
Every Delete operation is logged.
Every Login is logged.
Every Approval is logged.
Every Financial Transaction is logged.
Audit Logs cannot be deleted.
19.17 Security Rules
JWT Authentication is mandatory.
Passwords are stored using secure hashing.
Sessions expire automatically.
APIs validate authentication before execution.
Authorization is checked on every request.
Sensitive data is encrypted where required.
19.18 Data Integrity Rules
Foreign Key relationships must remain valid.
Soft Delete is preferred over Hard Delete.
Cascading deletes are restricted.
Duplicate business records are not allowed.
Every business entity has Created By and Updated By fields.
Timestamps are mandatory for all transactional tables.
19.19 Enterprise Workflow Summary
Website / Marketplace Order
            │
            ▼
      Sales Review
            │
            ▼
      Sales Order (SO)
            │
            ▼
    Inventory Check
            │
      ┌─────┴─────┐
      ▼           ▼
Stock Available   Stock Not Available
      │           │
      ▼           ▼
Stock Reserved   Production Request
      │           │
      ▼           ▼
Warehouse Pick   Production Planning
      │           │
      ▼           ▼
Packing      Finished Goods
      │           │
      └─────┬─────┘
            ▼
        Dispatch
            │
            ▼
         Invoice
            │
            ▼
        Finance
            │
            ▼
         Customer
19.20 Chapter Summary

The Enterprise Business Rules establish the governing principles for all business operations within the DS Footwear ERP SaaS platform. They define how data flows across Organization, Employee, Product, Inventory, Purchase, Production, Sales, Warehouse, Finance, Returns, Communication, Reporting, and Security domains. By enforcing these rules consistently across the database, backend APIs, frontend interfaces, and automated workflows, the ERP ensures data integrity, process automation, compliance, scalability, and auditability, providing a robust foundation comparable to enterprise-grade ERP systems such as SAP S/4HANA, Oracle ERP Cloud, and Microsoft Dynamics 365.