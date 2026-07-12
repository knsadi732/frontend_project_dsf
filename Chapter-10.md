Chapter 10
Inventory & Warehouse Management Domain
10.1 Introduction

The Inventory & Warehouse Management Domain is responsible for managing the physical movement, storage, availability, reservation, and traceability of all business inventory within the DS Footwear ERP SaaS platform.

Unlike the Product Domain, which maintains only master data, the Inventory Domain stores the actual stock quantities available across warehouses.

Every purchase, production, sales, dispatch, return, and stock transfer operation updates the Inventory Domain.

Inventory is always maintained against a Product Variant (SKU) and is physically stored inside a Warehouse Location.

10.2 Purpose

The Inventory & Warehouse Management Domain is responsible for:

Managing Raw Material Inventory.
Managing Finished Goods Inventory.
Managing Packaging Material Inventory.
Managing Warehouse Locations.
Managing Stock Reservations.
Managing Stock Transfers.
Managing Inventory Adjustments.
Managing Damaged and Returned Stock.
Providing real-time inventory visibility.
Supporting production, purchase, sales, and dispatch operations.
10.3 Inventory Structure
Inventory
│
├── Raw Material
├── Finished Goods
├── Semi Finished Goods
├── Packaging Material
├── Reserved Stock
├── Damaged Stock
├── Returned Stock
└── In Transit Stock

Inventory stores quantities only.

It never stores Product Master information.

10.4 Warehouse Structure

Inventory is physically stored inside warehouses.

The ERP follows a hierarchical warehouse structure.

Warehouse
      │
      ▼
Zone
      │
      ▼
Rack
      │
      ▼
Shelf
      │
      ▼
Bin
      │
      ▼
Inventory

This hierarchy enables precise stock tracking and optimized picking operations.

10.5 Warehouse Types

The ERP supports multiple warehouse types.

Examples:

Raw Material Warehouse
Finished Goods Warehouse
Packaging Warehouse
Return Warehouse
Quality Inspection Warehouse
Transit Warehouse

Each warehouse serves a specific business purpose.

10.6 Inventory Types

The ERP maintains different inventory categories.

Raw Material

Materials consumed during production.

Examples:

EVA Sheet
Rubber Sole
Fabric
Adhesive
Thread
Finished Goods

Products ready for sale.

Examples:

Shoes
Sandals
Slippers
Boots
Semi Finished Goods

Items waiting for further production processes.

Examples:

Upper Assembly
Sole Assembly
Packaging Material

Materials used for packing.

Examples:

Shoe Boxes
Cartons
Labels
Packing Tape
Poly Bags
Reserved Stock

Inventory allocated to approved Sales Orders but not yet dispatched.

Reserved stock cannot be used by other orders.

Damaged Stock

Inventory damaged during production, storage, transportation, or returns.

Damaged stock is excluded from available inventory.

Returned Stock

Products received back from customers.

Returned items require inspection before becoming available inventory.

In Transit Stock

Inventory currently moving between warehouses or branches.

10.7 Inventory Quantities

Each Product Variant (SKU) maintains the following quantities:

Available Quantity
Reserved Quantity
Ordered Quantity
In Production Quantity
In Transit Quantity
Damaged Quantity
Returned Quantity
Total Quantity

The Available Quantity is the only quantity eligible for new sales orders.

10.8 Inventory Movement

Every inventory change creates an inventory movement record.

Movement Types:

Purchase Receipt
Production Receipt
Sales Reservation
Dispatch
Stock Transfer
Return Receipt
Damage Entry
Stock Adjustment
Physical Stock Count

Inventory movements are fully auditable.

10.9 Stock Reservation

Once a Sales Order is approved:

Sales Order
      │
      ▼
Inventory Check
      │
      ▼
Stock Reservation
      │
      ▼
Warehouse Pick List

Reserved stock is removed from Available Quantity but remains physically stored until dispatch.

10.10 Warehouse Operations

Warehouse staff perform the following operations:

Goods Receiving
Put Away
Picking
Packing
Dispatch
Stock Transfer
Stock Adjustment
Physical Stock Verification

Each operation updates inventory in real time.

10.11 Stock Transfer

The ERP supports inventory transfers between:

Warehouse to Warehouse
Branch to Branch
Zone to Zone
Rack to Rack
Shelf to Shelf
Bin to Bin

All transfers generate audit records.

10.12 Inventory Adjustment

Inventory adjustments are allowed only through authorized workflows.

Examples:

Physical Count Difference
Damaged Goods
Lost Goods
Expired Goods
Administrative Correction

Every adjustment requires an audit trail.

10.13 Inventory Availability Formula
Available Quantity

=

Total Quantity

− Reserved Quantity

− Damaged Quantity

− In Transit Quantity

This value determines whether a Sales Order can be fulfilled immediately.

10.14 Business Rules

The Inventory & Warehouse Management Domain follows these business rules:

Inventory quantities are always maintained against Product Variants (SKU).
Product Master never stores stock quantities.
Every inventory record belongs to exactly one Warehouse Location.
Available Quantity must never become negative.
Reserved Stock cannot be allocated to another Sales Order.
Inventory is updated only through approved business transactions.
Every inventory movement must generate an audit record.
Returned stock requires inspection before becoming available.
Damaged stock is excluded from available inventory.
Warehouse transfers must preserve complete inventory traceability.
10.15 Inventory Relationship Diagram
Warehouse
      │
      ▼
Zone
      │
      ▼
Rack
      │
      ▼
Shelf
      │
      ▼
Bin
      │
      ▼
Product Variant (SKU)
      │
      ▼
Inventory
      │
      ├── Available
      ├── Reserved
      ├── Damaged
      ├── Returned
      ├── In Transit
      └── Total
10.16 Dependencies

The Inventory & Warehouse Management Domain is referenced by:

Product
Purchase
Production
Sales
Dispatch
Finance
Returns
Reports
Dashboard
Notifications

Every inventory movement is triggered by one of these business domains.

Chapter Summary

The Inventory & Warehouse Management Domain serves as the operational backbone of the DS Footwear ERP SaaS platform. It manages all stock quantities at the Product Variant (SKU) level while maintaining complete warehouse location hierarchy, inventory movements, reservations, transfers, and adjustments. By separating inventory from the Product Master and enforcing warehouse-level traceability, the ERP provides accurate stock visibility, supports efficient procurement and fulfillment processes, and ensures complete auditability across the entire supply chain.