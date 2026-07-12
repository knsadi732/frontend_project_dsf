Chapter 9
Product Variant & SKU Domain
9.1 Introduction

The Product Variant & SKU Domain defines every sellable, purchasable, manufacturable, and inventory-managed item within the DS Footwear ERP SaaS platform.

While the Product Domain stores generic product information, the Product Variant & SKU Domain represents the actual business item that is purchased, manufactured, stocked, sold, and dispatched.

Every inventory movement, purchase transaction, production order, sales order, warehouse operation, and financial transaction references a Product Variant (SKU), not the Product Master.

9.2 Purpose

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
9.3 Product Variant Hierarchy

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

9.4 Product Variant

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

9.5 Variant Attributes

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
Identification
SKU
Barcode
Status
Active
Inactive
Discontinued
9.6 SKU (Stock Keeping Unit)

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
9.7 Barcode

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

9.8 Variant Pricing

Pricing may differ between variants.

Examples:

Variant	Selling Price
Size 7 Black	₹1,499
Size 8 Black	₹1,499
Size 9 Black	₹1,549
Size 10 Blue	₹1,599

Transaction-level discounts are applied during Sales Orders and are not stored in the Variant Master.

9.9 Variant & Inventory Relationship

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

9.10 Variant Lifecycle
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
9.11 Business Rules

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
9.12 Variant Relationship Diagram
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
9.13 Dependencies

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

The Product Variant & SKU Domain represents the operational identity of every sellable, purchasable, manufacturable, and inventory-managed item within the DS Footwear ERP SaaS platform. By separating Product Master data from Product Variants and assigning a unique SKU and Barcode to each variant, the ERP achieves a scalable and normalized architecture. This design ensures that all inventory, warehouse, purchase, production, sales, dispatch, and financial transactions operate on Variant-level entities, providing precise stock control, accurate pricing, and complete traceability across the entire business lifecycle.