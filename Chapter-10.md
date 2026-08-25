Chapter 10
Product Variant & SKU Domain
10.1 Introduction

The Product Variant & SKU Domain defines every sellable, purchasable, manufacturable, and inventory-managed item within the DS Footwear ERP SaaS platform.

While the Product Domain stores generic product information, the Product Variant & SKU Domain represents the actual business item that is purchased, manufactured, stocked, sold, and dispatched.

Every inventory movement, purchase transaction, production order, sales order, warehouse operation, and financial transaction references a Product Variant (SKU), not the Product Master.

10.2 Purpose

The Product Variant & SKU Domain is responsible for:

Managing Product Variants.
Managing Stock Keeping Units (SKU).
Managing Barcode Information.
Defining Variant Attributes.
Supporting Inventory Management.
Supporting Purchase Operations.
Supporting Production Operations.
Supporting Sales Operations.
Supporting Warehouse Operations.
Providing unique business identity for every sellable item.
10.3 Product Variant Hierarchy

The ERP follows the hierarchy below:

Category
      │
      ▼
Brand
      │
      ▼
Product
      │
      ▼
Variant
      │
      ▼
SKU
      │
      ▼
Barcode
      │
      ▼
Inventory

The Inventory Domain always references the Variant (SKU).

10.4 Product Variant

A Product Variant represents a specific version of a Product.

Each Variant is independently managed within the ERP.

Examples include differences in:

Size
Color
Material
Width
Gender
Packaging

Example

Product

DS Running Shoes

│

├── Size 7 • Black

├── Size 8 • Black

├── Size 9 • Black

├── Size 8 • White

└── Size 10 • Blue

Each Variant is treated as a unique business item.

10.5 Variant Attributes

Each Product Variant contains:

Basic Information
Variant ID
Product ID
Variant Name
Attributes
Size
Color
Material (Optional)
Gender (Optional)
Width (Optional)
Pattern (Optional)
Packaging Type (Optional)
Pricing
MRP
Selling Price
Wholesale Price (Optional)
Dealer Price (Optional)
Cost Price
Manufacturing Rate (₹/pair — per-design piece-rate labour cost, see Chapter 14 §14.22.1)
Packaging Material Cost (₹/pair — box + poly/wrap, see Chapter 14 §14.22.1)
Identification
SKU
Barcode
Status
Active
Inactive
Discontinued
10.6 SKU (Stock Keeping Unit)

A SKU uniquely identifies every sellable or inventory-managed variant.

Every inventory movement references the SKU.

Example SKUs:

DS-RUN-BLK-07

DS-RUN-BLK-08

DS-RUN-WHT-08

DS-RUN-BLU-09
Business Rules
Every SKU must be unique.
SKU is generated automatically by the ERP.
SKU cannot be reused after creation.
Inventory always references the SKU.
10.7 Barcode

Each SKU may have one barcode.

The barcode is used for:

Warehouse Receiving
Stock Transfer
Picking
Packing
Dispatch
POS Billing
Inventory Counting

Supported barcode formats include:

Code 128
EAN-13
UPC
QR Code (Future)

Business Rule:

Every barcode must be unique.

10.8 Variant Pricing

Pricing may differ between variants.

Examples:

Variant	Selling Price
Size 7 Black	₹1,499
Size 8 Black	₹1,499
Size 9 Black	₹1,549
Size 10 Blue	₹1,599

Transaction-level discounts are applied during Sales Orders and are not stored in the Variant Master.

10.9 Variant & Inventory Relationship

The Inventory Domain stores stock against Product Variants.

Relationship:

Product
      │
      ▼
Variant
      │
      ▼
SKU
      │
      ▼
Inventory

Inventory stores:

Available Quantity
Reserved Quantity
Damaged Quantity
Returned Quantity
Warehouse Quantity

The Variant Domain never stores stock quantities.

10.10 Variant Lifecycle
Create Product
      │
      ▼
Create Variant
      │
      ▼
Generate SKU
      │
      ▼
Generate Barcode
      │
      ▼
Enable Inventory
      │
      ▼
Available for Purchase / Production / Sales
10.11 Business Rules

The Product Variant & SKU Domain follows these business rules:

Every Product may contain multiple Variants.
Every Variant belongs to exactly one Product.
Every Variant must have a unique SKU.
Every Barcode must be unique.
Every inventory record references a Variant (SKU).
Variant pricing may differ between variants of the same product.
Stock quantities are stored only in the Inventory Domain.
Variants with historical transactions cannot be deleted; they may only be marked Inactive or Discontinued.
SKU values are immutable after creation.
MRP and Selling Price are set the same across every size/color Variant of one Product (one design) — they are not calculated independently per Variant, since the same design does not carry a different MRP by size.
Manufacturing Rate and Packaging Material Cost, by contrast, are genuinely per-design — they must NOT be assumed identical across different Products the way MRP/Selling Price are identical across one Product's own Variants.

10.11.1 Pricing Calculator

Selling Price and MRP are computed, not guessed, from:

Cost of Product — pulled from actual completed Work Orders for that Variant when available (Chapter 14), falling back to the Variant's own Cost Price only when no production history exists yet.
Marketplace Cost — prefers this exact Variant's own actual Marketplace Settlement data (Chapter 17) for the current month, falls back to that channel's company-wide actual average, and only falls back further to the channel's configured default assumption if neither real figure exists yet.
Margin — a manually chosen value within the selected Marketplace Channel's configured margin range.

Selling Price = Cost of Product + Marketplace Cost + Margin
MRP = round-to-nearest-₹9-ending( Selling Price ÷ (1 − assumed discount %) )

The assumed discount % defaults to 30% (Selling Price ≈ 70% of MRP), matching how a marketplace typically displays a "discounted" price against a higher listed MRP. Applying a calculated Selling Price/MRP updates every Variant of that Product at once (see the rule above), not just the one the calculator was opened from.

10.12 Variant Relationship Diagram
Product
    │
    ▼
Product Variant
    │
    ├── Size
    ├── Color
    ├── Material
    ├── Pricing
    │
    ▼
SKU
    │
    ▼
Barcode
    │
    ▼
Inventory
10.13 Dependencies

The Product Variant & SKU Domain is referenced by the following ERP modules:

Inventory
Purchase
Production
Sales
Warehouse
Dispatch
Finance
Reports
Dashboard
Website / E-Commerce
POS (Future)

Every stock movement, purchase order, production order, sales order, dispatch, invoice, and inventory transaction references the Product Variant (SKU).

Chapter Summary

The Product Variant & SKU Domain represents the operational identity of every sellable, purchasable, manufacturable, and inventory-managed item within the DS Footwear ERP SaaS platform. By separating Product Master data from Product Variants and assigning a unique SKU and Barcode to each variant, the ERP achieves a scalable and normalized architecture. This design ensures that all inventory, warehouse, purchase, production, sales, dispatch, and financial transactions operate on Variant-level entities, providing precise stock control, accurate pricing, and complete traceability across the entire business lifecycle. Accurate pricing itself is calculator-driven (§10.11.1) — Selling Price and MRP are derived from real production cost and real (or assumed) marketplace cost rather than set arbitrarily.