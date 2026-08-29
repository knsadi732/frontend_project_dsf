Chapter 8
Item & Material Master Domain
8.1 Introduction

The Item & Material Master Domain defines the complete master data for everything the organization purchases or internally consumes that is not itself a sellable finished product.

While the Product Domain (Chapter 7) represents only sellable/manufactured footwear, the company also buys and uses a much wider range of things — raw material, packaging material, consumables, spare parts, tools, fixed assets, and services.

Placing all of these inside the Product Master would corrupt product catalog data, break sales-side reporting, and mix "what we sell" with "what we buy and use." The Item & Material Master Domain exists to keep these permanently separate while still integrating cleanly with Purchase, Inventory, Production, Fixed Assets, and Finance.

8.2 Purpose

The Item & Material Master Domain is responsible for:

Maintaining a single master for Raw Material, Packaging Material, Consumables, Spare Parts, Tools, Fixed Assets, and Services.
Classifying every Item under an Item Category.
Recording Item Specifications (UOM, technical attributes).
Serving as the reference for Purchase Order line items that are not finished-goods Products.
Routing each purchased Item to its correct downstream outcome — Inventory, Consumption, Spare Register, Tool Register, Fixed Asset Register, or a direct Finance expense (Services).
Preventing Fixed Assets and Services from being treated as quantity-based stock.

8.3 Item & Material Master Structure

Item / Material Master
      │
      ▼
Item Category
      │
      ▼
Item Specification
      │
      ▼
Purchase
      │
      ▼
Stock / Asset / Consumption

8.4 Item Category Hierarchy

Item / Material Master
│
├── Raw Material
│      ├── Leather
│      ├── PU
│      ├── EVA
│      ├── Rubber
│      ├── Adhesive
│      └── Chemicals
│
├── Packaging Material
│      ├── Shoe Box
│      ├── Polybag
│      ├── Carton
│      └── Tape
│
├── Consumables
│      ├── Stationery
│      ├── Cleaning Material
│      ├── Electrical Consumables
│      └── General Consumables
│
├── Spare Parts
│
├── Tools
│
├── Fixed Assets
│      ├── Machinery
│      ├── Computer
│      ├── Furniture
│      ├── Vehicle
│      └── Equipment
│
└── Services
       ├── Maintenance
       ├── Transport
       ├── Consultancy
       └── Other Services

Item Categories follow the same Parent-Child hierarchy model as the Category Domain (Chapter 9) — unlimited nesting, no separate SubCategory table.

8.5 Item Master

The Item Master stores only business master information for a purchased/consumed item. It never stores inventory quantities directly — quantities live in Inventory & Warehouse Management (Chapter 11), the Fixed Asset Register (Chapter 13), or a Consumption Log, depending on the item's category.

Item Information
Basic Information
Item ID
Item Code
Item Name
Item Category (Raw Material / Packaging / Consumable / Spare Part / Tool / Fixed Asset / Service)
Item Type
Business Information
Description
HSN Code / SAC Code (for Services)
GST Percentage
Unit of Measure (UOM)
Reorder Level (for stock-tracked categories)
Specification
Technical Attributes (e.g. thickness, GSM, grade, voltage)
Preferred Vendor(s)
Standard Cost
Status
Active
Inactive
Discontinued

8.6 Item Specification

Each Item Category defines which specification attributes are relevant.

Examples

Item: EVA Sheet
Category: Raw Material
UOM: Sheet
Specification: Thickness, Density, Color

Item: A4 Paper
Category: Consumables → Stationery
UOM: Ream
Specification: GSM, Size

Item: CNC Machine
Category: Fixed Assets → Machinery
UOM: Each (individually tracked, not quantity-aggregated)
Specification: Model, Capacity, Power Rating

Item: Vehicle Maintenance
Category: Services → Maintenance
UOM: Not Applicable
Specification: Service Type, Frequency

8.7 Item Outcome Routing

Every Item Category routes to exactly one downstream outcome after Purchase/GRN:

Item Category           →   Downstream Outcome
Raw Material             →   Raw Material Inventory → Production
Packaging Material       →   Inventory
Consumables              →   Inventory / Consumption Log
Spare Parts               →   Spare Inventory
Tools                     →   Tool Register
Fixed Assets              →   Fixed Asset Register (Chapter 13) — never Inventory
Services                  →   Finance (direct expense) — no stock/asset outcome

8.8 Product vs Item/Material — the critical distinction

Product (Chapter 7) is what DS Footwear sells:

Product → Category → Variant → SKU → Barcode → Sales

Example: Product "DS Sports Runner", Category "Shoes", Variant "Black / Size 8", SKU "DS-SR-BLK-08", Barcode "890XXXXXXXXX".

Item/Material (this chapter) is what the company buys or internally consumes:

Item → Item Category → Item Specification → Purchase → Stock / Asset / Consumption

Example: Item "EVA Sheet", Category "Raw Material", UOM "Sheet" → Purchase → Raw Material Inventory → Production → becomes part of a finished Product.

Example: Item "A4 Paper", Category "Stationery" → Purchase → Consumable Stock → Office Consumption. Never becomes a Product, never appears in Sales.

Example: Asset "Laptop", Category "IT Asset" → Purchase → Fixed Asset Register → Employee Assignment. Never appears in Inventory quantities.

8.9 Item & Material Master Relationship Diagram

Item / Material Master
      │
      ▼
Item Category
      │
      ▼
Item Specification
      │
 ┌────┼────────────┬────────────┬───────────┬────────────┬────────────┐
 ▼    ▼            ▼            ▼           ▼            ▼            ▼
Raw   Packaging   Consumables  Spare Part  Tool        Fixed Asset  Service
Mat'l     │            │            │         │              │          │
 ▼        ▼            ▼            ▼         ▼              ▼          ▼
Inventory Inventory  Inventory/  Spare      Tool        Fixed Asset  Finance
   │                 Consumption Inventory  Register    Register    (expense)
   ▼
Production
   │
   ▼
Product (Chapter 7)

8.10 Business Rules

The Item & Material Master Domain follows these business rules:

Product and Item/Material are separate masters — they are never merged into a single table or catalog.
Every Item belongs to exactly one Item Category.
Item Categories follow the same Parent-Child hierarchy pattern as the Category Domain — no separate SubCategory table.
Raw Material, Packaging Material, Consumables, and Spare Parts are inventory-tracked by quantity (Chapter 11).
Fixed Assets are never recorded in Item/Material Inventory — a purchased Fixed Asset moves into the Fixed Asset Register (Chapter 13) as an individually-tracked asset, not as aggregate stock.
Example: 100 cartons or 500 kg EVA → Inventory. 1 CNC Machine, 1 Laptop, or 1 Vehicle → Fixed Asset Register, never Inventory.
Services have no stock/asset outcome — they post directly to Finance as an expense referencing the Purchase Order/GRN.
Every Item must have a unique Item Code.
Items with transaction history cannot be deleted; they may only be marked Inactive or Discontinued.
Raw Material consumed in Production reduces Raw Material Inventory and is referenced by the Bill of Materials (BOM).

8.11 Dependencies

The Item & Material Master Domain is referenced by the following ERP modules:

Purchase Domain (Chapter 12) — Purchase Request, RFQ, Vendor Quotation, Purchase Order, and GRN line items each reference EXACTLY ONE of an Item (this domain) or a Product Variant (Chapter 7/10), enforced by a database constraint — never both. An Item ordered this way is received into this domain's own Item Stock (8.7), not into Product/Variant Inventory (Chapter 11), even though it travelled through the same vendor-selection/PO/GRN pipeline a Product does.
Inventory & Warehouse Management Domain (Chapter 11) — Raw Material, Packaging, Consumables, and Spare Parts inventory.
Production Planning & Manufacturing Domain (Chapter 14) — Raw Material consumption via BOM.
Fixed Asset Domain (Chapter 13) — Fixed Asset acquisition originates from an Item flagged as Item Category "Fixed Assets."
Finance & Accounting Domain (Chapter 17) — Service purchases post directly as expenses; Raw Material/Consumable/Packaging purchases post as Accounts Payable.
Reports

Chapter Summary

The Item & Material Master Domain closes a critical gap in the ERP's data model: it gives the organization a single, correctly-scoped master for everything it purchases or consumes that is not a sellable product — raw material, packaging, consumables, spare parts, tools, fixed assets, and services. By keeping this domain strictly separate from the Product Domain, and by routing Fixed Assets to a dedicated register instead of quantity-based inventory, the ERP avoids corrupting product/sales data while still giving Purchase, Inventory, Production, Fixed Assets, and Finance a clean, unambiguous source of truth for non-sellable items.
