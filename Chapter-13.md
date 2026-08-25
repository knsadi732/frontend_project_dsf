Chapter 13
Fixed Asset Domain
13.1 Introduction

The Fixed Asset Domain manages the complete lifecycle of assets the organization owns and uses internally — machinery, computers, furniture, vehicles, and equipment — as distinct from Inventory, which tracks quantities of things the organization sells or consumes.

A Fixed Asset is purchased through the same Purchase Domain (Chapter 12) as any other Item, using an Item flagged under Item Category "Fixed Assets" (Chapter 8). Once received via GRN, it does not become quantity-based stock — it becomes a single, individually-identified asset with its own register entry, depreciation schedule, location, custodian, maintenance history, and eventual disposal record.

13.2 Purpose

The Fixed Asset Domain is responsible for:

Maintaining the Fixed Asset Register — one record per physical asset.
Tracking asset Location and Custodian at all times.
Computing Depreciation on a defined schedule.
Recording Maintenance history against each asset.
Managing asset Disposal (sale, write-off, scrap).
Ensuring Fixed Assets are never recorded as Inventory quantities.
Feeding Finance & Accounting with asset value, depreciation, and disposal entries.

13.3 Fixed Asset Domain Structure

Purchase (Item Category: Fixed Assets)
      │
      ▼
GRN
      │
      ▼
Fixed Asset Register
      │
      ├── Depreciation
      ├── Location
      ├── Custodian
      ├── Maintenance
      └── Disposal

13.4 Fixed Asset Acquisition

A Fixed Asset enters the ERP the same way any purchased Item does:

Purchase Request
      │
      ▼
Purchase Order (Item Category: Fixed Assets)
      │
      ▼
GRN
      │
      ▼
Fixed Asset Register Entry Created

Unlike Raw Material, Packaging, or Consumables, a GRN line item flagged as a Fixed Asset does not increment Inventory quantity — it creates one Fixed Asset Register record per unit received (a GRN for "3 Laptops" creates 3 individual asset records, not one stock row with quantity 3).

13.5 Fixed Asset Register

The Fixed Asset Register stores one row per physical asset.

Asset Information
Basic Information
Asset ID
Asset Tag / Serial Number
Asset Name
Item Reference (Chapter 8 Item Master)
Item Category (Machinery / Computer / Furniture / Vehicle / Equipment)
Acquisition Information
Purchase Order Reference
GRN Reference
Vendor
Purchase Date
Purchase Cost
Warranty Expiry
Assignment
Current Location (Branch / Warehouse / Department)
Current Custodian (Employee)
Assignment Date
Financial
Depreciation Method (Straight Line / Written Down Value)
Useful Life (Years)
Salvage Value
Accumulated Depreciation
Net Book Value
Status
In Use
Under Maintenance
Idle
Disposed

13.6 Depreciation

Each Fixed Asset depreciates over its useful life according to its assigned Depreciation Method.

Depreciation Methods

Straight Line — equal depreciation expense every period.
Written Down Value (Reducing Balance) — depreciation computed on the asset's current Net Book Value each period.

Depreciation Flow

Fixed Asset Register
      │
      ▼
Depreciation Schedule (per period)
      │
      ▼
Accumulated Depreciation
      │
      ▼
Net Book Value
      │
      ▼
Finance & Accounting (Chapter 17) Ledger Entry

Depreciation is computed against the Fixed Asset Register only — it never touches Inventory, since a Fixed Asset was never Inventory to begin with.

13.7 Location & Custodian

Every Fixed Asset must have a known Location and, where applicable, a Custodian at all times after receipt.

Examples

Asset: CNC Machine
Location: Production Floor, Warehouse 1
Custodian: Production Department (departmental asset)

Asset: Laptop
Location: Head Office
Custodian: Employee (individually assigned)

Asset: Delivery Vehicle
Location: Dispatch Bay
Custodian: Logistics Department

Reassigning a Fixed Asset (transfer to a new employee, branch, or warehouse) updates the Location/Custodian and is recorded as an Asset Assignment history entry — the Register always reflects current assignment while preserving prior assignment history.

13.8 Maintenance

Fixed Assets may undergo scheduled or unscheduled maintenance.

Maintenance Log Information

Asset Reference
Maintenance Type (Scheduled / Breakdown)
Maintenance Date
Vendor / Service Provider
Cost
Downtime (if applicable)
Next Scheduled Maintenance Date
Remarks

Maintenance cost posts to Finance as an expense referencing the asset; it does not affect the asset's depreciation schedule unless it constitutes a capital improvement (Future scope).

13.9 Disposal

When a Fixed Asset reaches end of life, is sold, or is written off, its lifecycle is closed via Disposal.

Disposal Information

Asset Reference
Disposal Type (Sale / Write-off / Scrap)
Disposal Date
Disposal Value (if sold)
Net Book Value at Disposal
Gain / Loss on Disposal
Approved By

Disposal Flow

Fixed Asset Register (Status: In Use / Idle)
      │
      ▼
Disposal Request
      │
      ▼
Approval
      │
      ▼
Disposal Recorded (Status: Disposed)
      │
      ▼
Finance & Accounting — Gain/Loss Entry

Once disposed, an asset's Status is permanently set to Disposed; it is never deleted, preserving full audit history.

13.10 Fixed Asset vs Inventory — the critical distinction

Inventory (Chapter 11) tracks fungible quantity:

100 cartons → Inventory
500 kg EVA → Raw Material Inventory

Fixed Asset Register (this chapter) tracks individually-identified, non-fungible assets:

1 CNC Machine → Fixed Asset Register
1 Laptop → Fixed Asset Register
1 Vehicle → Fixed Asset Register

A Fixed Asset is never aggregated into a quantity figure the way stock is — even if the company owns five identical laptops, each has its own Asset Register row, its own depreciation schedule, and its own custodian.

13.11 Business Rules

The Fixed Asset Domain follows these business rules:

A Fixed Asset is never recorded in Item/Material Inventory (Chapter 8) or Inventory & Warehouse Management (Chapter 11) — it lives only in the Fixed Asset Register.
Each Fixed Asset is tracked individually by asset tag/serial number, not by aggregate quantity.
A GRN line item flagged Item Category "Fixed Assets" creates one Fixed Asset Register row per unit received, never an Inventory stock entry.
Every Fixed Asset must have a Custodian and/or Location at all times after receipt.
Depreciation is computed against the Fixed Asset Register and posts to Finance & Accounting — never against Inventory.
Maintenance history is preserved permanently against each asset.
Disposal closes an asset's lifecycle and posts a corresponding Finance entry (Gain/Loss); the asset record itself is never deleted.
Asset reassignment (Location/Custodian change) is preserved as history, not overwritten.
Depreciation is booked one full financial year at a time (1 April - 31 March), never prorated by the day — see 13.6.1.

13.6.1 Depreciation Timing — Financial-Year Block Convention

Net Book Value is always derived on demand, never stored — but it is derived using the same convention a CA uses when filing (Income Tax Act s.32, WDV block-of-assets), not a continuous day-by-day accrual:

A financial year runs 1 April to 31 March. An asset belongs to whichever FY its Purchase Date falls in, even if that is the FY's very last day.
A financial year's depreciation is booked only once that FY has closed (i.e. only once the current date has reached the following 1 April) — a financial year still in progress contributes zero depreciation, however many days have already elapsed within it.
For the financial year of purchase: if the asset was in use for 180 days or more within that FY, it earns that FY's full depreciation rate; if used for fewer than 180 days, it earns half the rate.
Every subsequent financial year (once closed) earns the full rate, applied to the Straight Line annual amount or the Written Down Value opening balance for that year, until Net Book Value reaches Salvage Value.

Example: an asset purchased on 31 March (the last day of a financial year) shows zero depreciation on 31 March itself, then shows that financial year's half-rate charge the moment the next financial year begins (1 April) — not because a day passed, but because that financial year's books just closed. This is a deliberate correction from an earlier, incorrect continuous-daily-accrual implementation; the FY-block convention above is the one currently implemented and must be preserved in any future change to this calculation.

13.12 Fixed Asset Relationship Diagram

Purchase (Item Category: Fixed Assets)
      │
      ▼
GRN
      │
      ▼
Fixed Asset Register
      │
 ┌────┼────────────┬────────────┬────────────┐
 ▼    ▼            ▼            ▼            ▼
Depreciation  Location    Custodian    Maintenance   Disposal
      │                                                  │
      ▼                                                  ▼
Finance & Accounting Ledger ◄────────────────────────────┘

13.13 Dependencies

The Fixed Asset Domain is referenced by the following ERP modules:

Item & Material Master Domain (Chapter 8) — the source Item Category "Fixed Assets."
Purchase Domain (Chapter 12) — acquisition via Purchase Order and GRN.
Employee Domain (Chapter 3) — asset assignment/custodian tracking (Employee "Assets" field, Chapter 3).
Finance & Accounting Domain (Chapter 17) — depreciation, maintenance expense, and disposal gain/loss entries.
Reporting & Business Intelligence Domain (Chapter 20) — Fixed Asset reports.
Audit Logs

Chapter Summary

The Fixed Asset Domain gives the organization a dedicated, individually-tracked lifecycle for machinery, computers, furniture, vehicles, and equipment — deliberately separated from both the Item & Material Master's inventory-tracked categories and the Product Domain. By routing every Fixed Asset purchase to a Register entry instead of aggregate stock, and by tracking depreciation, location, custodian, maintenance, and disposal against that Register, the ERP ensures Fixed Assets are never miscounted as inventory and remain fully auditable across their entire ownership lifecycle. Depreciation itself follows the Financial-Year block convention (§13.6.1) rather than continuous daily accrual, matching how a CA actually books and files it.
