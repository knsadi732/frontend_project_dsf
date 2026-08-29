Chapter 12
Purchase & Procurement Domain
12.1 Introduction

The Purchase & Procurement Domain manages the complete procurement lifecycle of materials, goods, and services required by the organization.

It ensures that every purchase follows a standardized approval workflow—from internal requirement generation to vendor selection, quotation comparison, purchase order creation, goods receipt, quality inspection, inventory update, and vendor payment.

This domain integrates with Vendor Management, Inventory, Warehouse, Production, Finance, Reports, and Notifications to provide a fully auditable and controlled procurement process.

12.2 Purpose

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
12.3 Procurement Workflow

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
12.4 Purchase Request (PR)

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
12.5 Purchase Approval

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
12.6 Request For Quotation (RFQ)

After PR approval, the Purchase Department issues RFQs to one or more vendors.

RFQ includes:

Material List
Quantity
Delivery Location
Delivery Date
Payment Terms
Technical Specifications

One RFQ may be sent to multiple vendors.

12.7 Vendor Quotation

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
12.8 Quotation Comparison

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

12.9 Vendor Selection

After quotation comparison, one vendor is selected.

Selection criteria may include:

Lowest Cost
Fastest Delivery
Best Vendor Rating
Best Quality
Long-term Contract
Payment Terms

Only the selected vendor proceeds to Purchase Order generation.

12.10 Purchase Order (PO)

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
12.11 Vendor Dispatch

The vendor dispatches materials after accepting the Purchase Order.

Dispatch details include:

Transporter
LR Number
Vehicle Number
Dispatch Date
Expected Arrival Date
12.12 Gate Entry

When the shipment arrives, the Security Team records a Gate Entry.

Gate Entry contains:

Gate Entry Number
Vehicle Number
Driver Information
Vendor
Purchase Order
Arrival Time

Gate Entry authorizes unloading.

12.13 Material Receiving

Warehouse personnel verify:

Physical Quantity
Packaging Condition
Visible Damage
Purchase Order Match

Materials are temporarily placed in the receiving area until inspection.

12.14 Quality Inspection (QC)

Quality Control verifies the received materials.

Inspection Results:

Accepted
Partially Accepted
Rejected

Rejected materials are returned to the vendor.

Only accepted quantities proceed to GRN.

12.15 Goods Receipt Note (GRN)

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

12.16 Inventory Update

Once the GRN is approved:

GRN

↓

Inventory Update

↓

Stock Ledger

↓

Available Inventory

Inventory quantities increase only after GRN approval.

12.17 Vendor Invoice

After successful delivery, the vendor submits an invoice.

Finance verifies:

Purchase Order
GRN
Invoice
Tax Details
Quantity
Price

Only verified invoices proceed to Accounts Payable.

12.18 Accounts Payable & Vendor Payment

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
12.19 Procurement Analytics

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
12.20 Business Rules

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
Every line item (Purchase Request, RFQ material list, Vendor Quotation, Purchase Order, GRN) references exactly one of a Product Variant (Chapter 10) or an Item & Material Master Item (Chapter 8) — never both, never neither — so a raw material/packaging/consumable/spare/tool/service Item goes through the identical vendor-selection → RFQ → quotation → PO → GRN pipeline a sellable Product does, rather than being limited to Item Master's own standalone manual stock-receipt.
An Item line's stock is credited to Item Stock (Chapter 8) at the same "Partially Received" PO step that credits Product Variant Inventory (Chapter 11) for a Product line — the two never share a stock table.

12.20.1 Item & Material Master Lines in Procurement

Every downstream table in this chapter's pipeline — `purchase_request_items`, `vendor_quotation_items`, `purchase_order_items`, `grn_items` — carries both a `productVariantId` and an `itemId` column, constrained so exactly one is ever set per row. This lets the Purchase & Procurement Domain serve BOTH masters uniformly:

A Product Variant line (Chapter 10) receives into Product/Variant Inventory (Chapter 11) — the existing, original behavior.
An Item line (Chapter 8) receives into Item Stock instead, via the same Purchase Order "Partially Received" transition — no separate approval step, no separate GRN concept, no duplicate Finance posting (the Item's cost still flows through the same Vendor Bill the Purchase Order itself generates).

This closes a design gap: Chapter 8 always intended Items to be orderable through real purchasing, but until this was implemented, only a Product Variant duplicate of a raw material could actually be selected anywhere in this pipeline — an Item Master entry (e.g. Leather, EVA) had no path into a Purchase Request at all.

12.21 Procurement Relationship Diagram
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
12.22 Dependencies

The Purchase & Procurement Domain is referenced by:

Vendor Domain
Item & Material Master Domain
Fixed Asset Domain
Inventory & Warehouse Management
Product Variant & SKU
Production
Finance
Reports
Dashboard
Notifications
Audit Logs
Chapter Summary

The Purchase & Procurement Domain manages the complete lifecycle of organizational procurement, from internal purchase requests through quotation management, vendor selection, purchase order creation, goods receipt, quality inspection, inventory updates, stock ledger posting, vendor invoice verification, and payment processing. By separating each stage into independent yet integrated business processes, the DS Footwear ERP ensures a controlled, auditable, and scalable procurement system aligned with enterprise standards used in SAP, Oracle ERP, Microsoft Dynamics 365, and other modern manufacturing ERP solutions. That same pipeline now serves the Item & Material Master Domain (Chapter 8) as uniformly as it serves sellable Products (§12.20.1) — a raw material is never limited to a duplicate Product just to be purchasable.