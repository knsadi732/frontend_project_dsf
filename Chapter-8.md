Chapter 8
Category Domain
8.1 Introduction

The Category Domain defines the hierarchical classification system for all products managed within the DS Footwear ERP SaaS platform.

Categories organize products into logical business groups, making product management, inventory control, purchasing, reporting, manufacturing, and e-commerce navigation more efficient.

The ERP follows a Parent-Child Category Model, allowing unlimited hierarchy levels without requiring a separate SubCategory entity.

8.2 Purpose

The Category Domain is responsible for:

Organizing products into logical groups.
Supporting unlimited category hierarchy.
Improving product search and filtering.
Standardizing product classification.
Supporting reporting and analytics.
Providing category navigation for websites and mobile applications.
Eliminating duplicate category structures.
8.3 Category Hierarchy

The ERP uses a hierarchical category structure.

Category
      │
      ▼
Parent Category
      │
      ▼
Child Category
      │
      ▼
Product
      │
      ▼
Variant

Each category may have zero or more child categories.

8.4 Example Category Structure
Footwear
│
├── Shoes
│      ├── Sports Shoes
│      ├── Casual Shoes
│      ├── Formal Shoes
│      ├── Running Shoes
│      └── School Shoes
│
├── Sandals
│      ├── Men Sandals
│      ├── Women Sandals
│      └── Kids Sandals
│
├── Slippers
│      ├── EVA Slippers
│      ├── Bathroom Slippers
│      └── Indoor Slippers
│
└── Boots
       ├── Safety Boots
       ├── Leather Boots
       └── Trekking Boots

The hierarchy can be extended at any level without changing the database structure.

8.5 Category Master

Each Category stores the following information:

Basic Information
Category ID
Parent Category ID
Category Code
Category Name
Display Name
Description
Display Information
Category Image
Category Icon
Display Order
SEO Information (Future)
SEO URL
Meta Title
Meta Description
Keywords
Status
Active
Inactive
8.6 Parent-Child Relationship

The Category Domain uses a self-referencing hierarchy.

Relationship

Category
      │
      ├── Parent Category
      │
      └── Child Categories

Database Structure

categories

id

parent_category_id

category_code

category_name

The parent_category_id references another record in the same table.

8.7 Product Assignment

Products are assigned only to the lowest applicable category.

Example

Footwear

↓

Shoes

↓

Sports Shoes

↓

Product

Products should not be assigned to intermediate parent categories unless explicitly required by business rules.

8.8 Category Usage

The Category Domain is used by multiple ERP modules.

Examples:

Product Management
Inventory
Purchase
Production
Sales
Reports
Dashboard
Website
Mobile Application

Category information is shared across all these modules.

8.9 Search & Filtering

Categories provide standardized filtering capabilities.

Supported filters include:

Parent Category
Child Category
Brand
Product
Product Type
Active Status

These filters are used throughout ERP lists, reports, dashboards, and e-commerce interfaces.

8.10 Business Rules

The Category Domain follows these business rules:

Every category must have a unique Category Code.
Every category must have a unique Category Name within the same parent.
Categories support unlimited Parent-Child hierarchy.
A separate SubCategory table shall not exist.
Child categories are stored in the same Category table using parent_category_id.
Products should be assigned to the lowest applicable category.
Categories with associated products cannot be deleted; they may only be marked Inactive.
Category hierarchy changes must preserve existing product relationships.
8.11 Category Relationship Diagram
Category
│
├── Child Category
│      ├── Child Category
│      │      ├── Product
│      │      │      └── Product Variant
│      │
│      └── Product
│
└── Product
8.12 Dependencies

The Category Domain is referenced by the following ERP modules:

Product
Inventory
Purchase
Production
Sales
Reports
Dashboard
Website / E-Commerce
Mobile Application

Every Product belongs to exactly one Category within the hierarchy.

Chapter Summary

The Category Domain provides the hierarchical classification framework for products within the DS Footwear ERP SaaS platform. By implementing a self-referencing Parent-Child model, the ERP supports unlimited category levels without requiring a separate SubCategory table. This design simplifies database management, improves scalability, enhances product organization, and ensures consistent categorization across Product Management, Inventory, Sales, Purchase, Reporting, and future e-commerce integrations.