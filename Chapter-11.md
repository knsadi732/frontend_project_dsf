Chapter 11
Purchase & Procurement Domain
11.1 Introduction

The Purchase & Procurement Domain manages the complete procurement lifecycle of materials, goods, and services required by the organization.

It ensures that every purchase follows a standardized approval workflow—from internal requirement generation to vendor selection, quotation comparison, purchase order creation, goods receipt, quality inspection, inventory update, and vendor payment.

This domain integrates with Vendor Management, Inventory, Warehouse, Production, Finance, Reports, and Notifications to provide a fully auditable and controlled procurement process.

11.2 Purpose

The Purchase & Procurement Domain is responsible for:

Managing Purchase Requests (PR)
Managing Purchase Approvals
Managing Request for Quotations (RFQ)
Managing Vendor Quotations
Comparing Vendor Quotations
Selecting Vendors
Creating Purchase Orders (PO)
Receiving Materials
Performing Quality Inspection
Generating Goods Receipt Notes (GRN)
Updating Inventory
Processing Vendor Invoices
Supporting Accounts Payable
Providing Procurement Analytics
11.3 Procurement Workflow

The DS Footwear ERP follows the complete procurement workflow below.

Department Requirement
        │
        ▼
Purchase Request (PR)
        │
        ▼
Purchase Approval
        │
        ▼
Request For Quotation (RFQ)
        │
        ▼
Vendor Quotation
        │
        ▼
Quotation Comparison
        │
        ▼
Vendor Selection
        │
        ▼
Purchase Order (PO)
        │
        ▼
Vendor Dispatch
        │
        ▼
Gate Entry
        │
        ▼
Material Receiving
        │
        ▼
Quality Inspection
        │
        ▼
Goods Receipt Note (GRN)
        │
        ▼
Inventory Update
        │
        ▼
Stock Ledger
        │
        ▼
Vendor Invoice
        │
        ▼
Accounts Payable
        │
        ▼
Vendor Payment
11.4 Purchase Request (PR)

A Purchase Request is an internal request raised by a department when materials or services are required.

Purchase Requests may originate from:

Inventory
Production
Warehouse
Maintenance
Administration
Finance
Purchase Request Information
PR Number
Request Date
Requested By
Department
Priority
Required Date
Warehouse
Items
Quantity
Remarks
Status
Purchase Request Status
Draft
Submitted
Pending Approval
Approved
Rejected
Converted to RFQ
11.5 Purchase Approval

Every Purchase Request must be approved before procurement begins.

Approval may follow multiple levels based on company policy.

Example:

Employee

↓

Department Manager

↓

Purchase Manager

↓

Owner / Finance (Optional)
11.6 Request For Quotation (RFQ)

After PR approval, the Purchase Department issues RFQs to one or more vendors.

RFQ includes:

Material List
Quantity
Delivery Location
Delivery Date
Payment Terms
Technical Specifications

One RFQ may be sent to multiple vendors.

11.7 Vendor Quotation

Each vendor submits a quotation in response to the RFQ.

Quotation contains:

Vendor
Unit Price
GST
Freight
Delivery Time
Payment Terms
Validity
Discount
Remarks
11.8 Quotation Comparison

The ERP provides a quotation comparison matrix.

Comparison Parameters:

Unit Price
Total Cost
Delivery Time
Vendor Rating
Quality Rating
Previous Purchase History
Credit Period
Payment Terms

The Purchase Department selects the best quotation before creating the Purchase Order.

11.9 Vendor Selection

After quotation comparison, one vendor is selected.

Selection criteria may include:

Lowest Cost
Fastest Delivery
Best Vendor Rating
Best Quality
Long-term Contract
Payment Terms

Only the selected vendor proceeds to Purchase Order generation.

11.10 Purchase Order (PO)

The Purchase Order is the official procurement document issued to the selected vendor.

Each Purchase Order references:

Purchase Request
Vendor
Warehouse
Delivery Address
Items
Quantity
Price
Taxes
Payment Terms
Expected Delivery Date
Purchase Order Status
Draft
Pending Approval
Approved
Sent
Acknowledged
Partially Received
Completed
Cancelled
11.11 Vendor Dispatch

The vendor dispatches materials after accepting the Purchase Order.

Dispatch details include:

Transporter
LR Number
Vehicle Number
Dispatch Date
Expected Arrival Date
11.12 Gate Entry

When the shipment arrives, the Security Team records a Gate Entry.

Gate Entry contains:

Gate Entry Number
Vehicle Number
Driver Information
Vendor
Purchase Order
Arrival Time

Gate Entry authorizes unloading.

11.13 Material Receiving

Warehouse personnel verify:

Physical Quantity
Packaging Condition
Visible Damage
Purchase Order Match

Materials are temporarily placed in the receiving area until inspection.

11.14 Quality Inspection (QC)

Quality Control verifies the received materials.

Inspection Results:

Accepted
Partially Accepted
Rejected

Rejected materials are returned to the vendor.

Only accepted quantities proceed to GRN.

11.15 Goods Receipt Note (GRN)

The Goods Receipt Note confirms successful receipt of materials.

GRN contains:

GRN Number
Purchase Order
Vendor
Warehouse
Received Quantity
Accepted Quantity
Rejected Quantity
Damaged Quantity
Batch Number (Optional)
Inspection Remarks

Only approved GRNs update inventory.

11.16 Inventory Update

Once the GRN is approved:

GRN

↓

Inventory Update

↓

Stock Ledger

↓

Available Inventory

Inventory quantities increase only after GRN approval.

11.17 Vendor Invoice

After successful delivery, the vendor submits an invoice.

Finance verifies:

Purchase Order
GRN
Invoice
Tax Details
Quantity
Price

Only verified invoices proceed to Accounts Payable.

11.18 Accounts Payable & Vendor Payment

Finance creates the Accounts Payable entry.

Payment Methods:

Bank Transfer
UPI
RTGS
NEFT
IMPS
Cheque

Payment Status:

Pending
Partial
Paid
Overdue
11.19 Procurement Analytics

The ERP provides procurement analytics such as:

Total Purchase Value
Purchase Trends
Pending Purchase Requests
Pending RFQs
Vendor Performance
Pending GRNs
Outstanding Vendor Payments
Average Procurement Lead Time
Material Cost Trends
11.20 Business Rules

The Purchase & Procurement Domain follows these business rules:

Every Purchase Request must originate from a valid department.
Purchase Requests require approval before procurement.
RFQs may be sent to one or more vendors.
Every quotation must reference a valid RFQ.
Vendor selection must be based on quotation comparison.
Purchase Orders can only be created for selected vendors.
Goods can only be received against an approved Purchase Order.
Every shipment must have a Gate Entry before unloading.
Inventory is updated only after GRN approval.
Every inventory update creates a Stock Ledger entry.
Vendor invoices must reference an approved Purchase Order and GRN.
Procurement transactions cannot be deleted after completion; they remain permanently auditable.
11.21 Procurement Relationship Diagram
Department
      │
      ▼
Purchase Request
      │
      ▼
Purchase Approval
      │
      ▼
RFQ
      │
      ▼
Vendor Quotation
      │
      ▼
Quotation Comparison
      │
      ▼
Vendor Selection
      │
      ▼
Purchase Order
      │
      ▼
Vendor Dispatch
      │
      ▼
Gate Entry
      │
      ▼
Material Receiving
      │
      ▼
Quality Inspection
      │
      ▼
GRN
      │
      ▼
Inventory
      │
      ▼
Stock Ledger
      │
      ▼
Vendor Invoice
      │
      ▼
Accounts Payable
      │
      ▼
Vendor Payment
11.22 Dependencies

The Purchase & Procurement Domain is referenced by:

Vendor Domain
Inventory & Warehouse Management
Product Variant & SKU
Production
Finance
Reports
Dashboard
Notifications
Audit Logs
Chapter Summary

The Purchase & Procurement Domain manages the complete lifecycle of organizational procurement, from internal purchase requests through quotation management, vendor selection, purchase order creation, goods receipt, quality inspection, inventory updates, stock ledger posting, vendor invoice verification, and payment processing. By separating each stage into independent yet integrated business processes, the DS Footwear ERP ensures a controlled, auditable, and scalable procurement system aligned with enterprise standards used in SAP, Oracle ERP, Microsoft Dynamics 365, and other modern manufacturing ERP solutions.