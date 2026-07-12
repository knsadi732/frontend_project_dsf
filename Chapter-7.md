Chapter 7
Product Domain
7.1 Introduction

The Product Domain defines the complete product master information used throughout the DS Footwear ERP SaaS platform.

A Product represents a sellable or manufacturable business item.

The Product Domain serves as the single source of truth for all product-related master data, including categories, brands, specifications, variants, pricing, taxation, and manufacturing references.

The Product Domain does not maintain stock quantities. All inventory quantities are managed separately by the Inventory Domain.

7.2 Purpose

The Product Domain is responsible for:

Managing Product Master Data.
Organizing Products using Categories.
Supporting Parent-Child Category Hierarchies.
Managing Brands.
Managing Product Variants.
Defining Pricing Information.
Defining Tax Information.
Defining Manufacturing References.
Serving as the master reference for Sales, Purchase, Inventory, Production, Finance, and Reporting.
7.3 Product Domain Structure
Category
      │
      ▼
Parent / Child Category
      │
      ▼
Brand
      │
      ▼
Product
      │
      ▼
Product Variant
      │
      ▼
Inventory

Inventory references Product Variants but stores stock independently.

7.4 Product Hierarchy

The ERP organizes products using the following hierarchy:

Category
     │
     ▼
Child Category
     │
     ▼
Brand
     │
     ▼
Product
     │
     ▼
Variant

Example

Footwear
      │
      ▼
Sports Shoes
      │
      ▼
Nike
      │
      ▼
Air Zoom Runner
      │
      ▼
Size 8
Black
7.5 Category

Categories classify products into logical business groups.

Examples:

Footwear
Accessories
Packaging Materials

Each category may contain unlimited child categories.

Example

Footwear
│
├── Shoes
│      ├── Sports Shoes
│      ├── Casual Shoes
│      ├── Running Shoes
│      └── Formal Shoes
│
├── Sandals
├── Slippers
└── Boots
7.6 Category Hierarchy

The ERP follows a Parent-Child hierarchy.

Database Structure

Categories

id

parent_category_id

category_name

Business Rule

A separate SubCategory table is not required.

Sub Categories are simply Categories having a Parent Category.

7.7 Brand

Each Product belongs to one Brand.

Examples

Nike
Adidas
Puma
DS Footwear

Brand Information

Brand Name
Brand Logo
Country
Description
Status
7.8 Product Master

The Product Master stores only business master information.

It never stores inventory quantities.

Every Product belongs to:

One Category
One Brand

A Product may contain multiple Variants.

Product Information
Basic Information
Product ID
Product Code
Product Name
Product Type
Brand
Category
Business Information
Product Description
HSN Code
GST Percentage
Unit of Measure
Manufacturing Type
Pricing
Cost Price (Standard)
MRP
Selling Price
Minimum Selling Price
Manufacturing
BOM Required
Production Required
Packaging Required
Product Images
Thumbnail
Gallery Images
Status
Active
Inactive
Discontinued
7.9 Product Types

The ERP supports multiple product classifications.

Examples:

Finished Goods
Raw Material
Packaging Material
Semi Finished Goods
Consumables
Services

Each product type determines its behavior within Inventory, Production, and Sales workflows.

7.10 Product Variants

A Product may have multiple variants.

Each Variant represents a sellable SKU.

Example

Product

Air Zoom Runner

│

├── Size 6 Black

├── Size 7 Black

├── Size 8 Black

├── Size 9 White

└── Size 10 Blue
Variant Information

Each Variant stores:

Variant ID
SKU
Barcode
Size
Color
MRP
Selling Price
Weight
Dimensions
Status
7.11 Product Images

Products may contain multiple images.

Supported Image Types

Thumbnail
Front View
Side View
Back View
Top View
Gallery Images

Images are shared across Website, Sales, Purchase, and Reports.

7.12 Product Pricing

The Product Master stores default pricing.

Pricing includes:

Standard Cost
Selling Price
MRP
Wholesale Price (Optional)
Dealer Price (Optional)

Actual transaction prices are stored in Sales Orders and Purchase Orders.

7.13 Product Taxation

Each Product defines its taxation details.

Examples:

HSN Code
GST %
CESS (Optional)

Finance uses these values while generating invoices.

7.14 Product Manufacturing Information

Manufactured products may reference:

Bill of Materials (BOM)
Production Process
Standard Production Time
Packaging Type

These references are consumed by the Production Domain.

7.15 Product & Inventory Relationship

The Product Domain and Inventory Domain are completely separated.

Relationship

Product
      │
      ▼
Variant
      │
      ▼
Inventory

Inventory stores:

Available Quantity
Reserved Quantity
Damaged Quantity
Returned Quantity
Warehouse Stock

The Product Master never stores stock quantities.

7.16 Business Rules

The Product Domain follows these business rules:

Every Product must have a unique Product Code.
Every Product belongs to one Category.
Every Product belongs to one Brand.
A Product may contain multiple Variants.
Every Variant must have a unique SKU.
Every Variant must have a unique Barcode (if applicable).
Product Master stores only business master data.
Inventory quantities are stored exclusively in the Inventory Domain.
Pricing defined in the Product Master serves as the default price.
Products with transaction history cannot be deleted; they may only be marked Inactive or Discontinued.
7.17 Product Relationship Diagram
Category
    │
    ▼
Child Category
    │
    ▼
Brand
    │
    ▼
Product
    │
    ├── Images
    ├── Pricing
    ├── Tax
    ├── Manufacturing Info
    │
    ▼
Product Variants
    │
    ▼
Inventory
7.18 Dependencies

The Product Domain is referenced by the following ERP modules:

Inventory
Purchase
Production
Sales
Warehouse
Finance
Reports
Dashboard
Website / E-Commerce
Notifications

Every stock movement, purchase transaction, sales order, production order, and invoice references the Product Variant.

Chapter Summary

The Product Domain serves as the master data foundation for all products within the DS Footwear ERP SaaS platform. It manages categories, hierarchical classifications, brands, product masters, variants, pricing, taxation, and manufacturing references while deliberately excluding stock information. By separating Product Master Data from Inventory Quantities, the ERP achieves a scalable, normalized, and enterprise-grade architecture that supports manufacturing, procurement, sales, warehousing, finance, reporting, and future multi-channel e-commerce integration.