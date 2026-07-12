Chapter 12
Production Planning & Manufacturing Domain
12.1 Introduction

The Production Planning & Manufacturing Domain manages the complete manufacturing lifecycle within the DS Footwear ERP SaaS platform.

It is responsible for planning, scheduling, controlling, executing, and monitoring the production process while ensuring efficient utilization of materials, machines, manpower, and production capacity.

The domain converts raw materials into finished goods through standardized manufacturing processes while maintaining complete traceability, quality control, production costing, and inventory synchronization.

This domain integrates with Sales, Inventory, Purchase, Warehouse, Finance, Reports, Notifications, and Analytics to provide an enterprise-grade manufacturing solution.

12.2 Purpose

The Production Planning & Manufacturing Domain is responsible for:

Managing Production Planning & Control (PPC)
Managing Demand Planning
Managing Material Requirement Planning (MRP)
Managing Capacity Planning
Managing Production Scheduling
Managing Production Requests
Managing Bill of Materials (BOM)
Checking Raw Material Availability
Managing Production Orders
Managing Material Issue
Tracking Work-In-Progress (WIP)
Managing Finished Goods
Managing Quality Control
Updating Inventory
Recording Production Costs
Providing Production Analytics
12.3 Production Workflow
Sales Forecast
        │
        ▼
Sales Orders
        │
        ▼
Production Planning & Control (PPC)
        │
        ▼
Demand Planning
        │
        ▼
Material Requirement Planning (MRP)
        │
        ▼
Capacity Planning
        │
        ▼
Production Planning
        │
        ▼
Production Scheduling
        │
        ▼
Production Request
        │
        ▼
Bill Of Materials (BOM)
        │
        ▼
Raw Material Availability Check
        │
        ├── Available
        │
        └── Not Available
                │
                ▼
        Purchase Request
                │
                ▼
        Purchase Process
                │
                ▼
Raw Material Available
                │
                ▼
Production Order
                │
                ▼
Material Issue
                │
                ▼
Shop Floor Manufacturing
                │
                ▼
Work In Progress (WIP)
                │
                ▼
Quality Inspection
                │
                ▼
Finished Goods
                │
                ▼
Inventory Update
                │
                ▼
Stock Ledger
12.4 Production Planning & Control (PPC)

Production Planning & Control (PPC) is responsible for planning, scheduling, monitoring, and controlling the entire manufacturing process.

The PPC team ensures that the right product is manufactured in the right quantity, at the right time, using the available resources.

PPC Responsibilities
Demand Planning
Sales Forecast Analysis
Material Requirement Planning (MRP)
Capacity Planning
Machine Planning
Workforce Planning
Production Planning
Production Scheduling
Resource Allocation
Production Monitoring
12.5 Demand Planning

Demand Planning estimates future production requirements based on:

Sales Forecast
Sales Orders
Historical Sales
Seasonal Demand
Marketing Campaigns
Customer Contracts

Demand Planning helps optimize inventory and production capacity.

12.6 Material Requirement Planning (MRP)

MRP determines the materials required for production.

The ERP automatically calculates:

Required Raw Materials
Current Inventory
Purchase Requirement
Production Requirement
Material Shortages

If raw materials are unavailable:

MRP

↓

Purchase Request

↓

Purchase Department
12.7 Capacity Planning

Capacity Planning verifies manufacturing capability before production.

The ERP evaluates:

Machine Capacity
Production Line Capacity
Labour Availability
Shift Capacity
Daily Production Capacity

Production Orders cannot exceed available capacity.

12.8 Production Planning

Production Planning defines:

Product Variant
Quantity
Target Warehouse
Production Date
Expected Completion Date
Priority
Production Line

The planning process balances demand with available resources.

12.9 Production Scheduling

Production Scheduling allocates manufacturing tasks across production lines and shifts.

Example:

Monday

↓

Sports Shoes

↓

Production Line-1

↓

Morning Shift

↓

1000 Pairs

Scheduling minimizes idle time and maximizes production efficiency.

12.10 Production Request

The Production Request is an internal document authorizing production planning.

It contains:

Production Request Number
Product Variant
Quantity
Required Date
Warehouse
Priority
Requested By
Status
Status
Draft
Pending Approval
Approved
Rejected
Converted to Production Order
12.11 Bill of Materials (BOM)

The Bill of Materials defines every component required to manufacture one Product Variant.

Each BOM contains:

Raw Materials
Packaging Materials
Consumables
Standard Quantity
Unit of Measure
Wastage Percentage

Each manufactured product must have an approved BOM.

12.12 Raw Material Availability

Before production begins, the ERP checks raw material availability.

BOM

↓

Inventory Check

↓

Material Available?

↓

Yes → Production

No → Purchase Request

Production cannot begin until all mandatory materials are available.

12.13 Production Order

The Production Order authorizes manufacturing execution.

Each Production Order contains:

Production Order Number
Product Variant
BOM
Quantity
Warehouse
Production Line
Planned Start Date
Planned Completion Date
Assigned Supervisor
Status
Status
Planned
Released
In Progress
On Hold
Completed
Cancelled
12.14 Material Issue

Before manufacturing begins, materials are issued from Inventory.

Material Issue:

Reduces Raw Material Inventory
Updates Stock Ledger
Records Material Consumption

Every issue transaction is auditable.

12.15 Shop Floor Manufacturing

The Shop Floor executes production according to the Production Order.

Typical footwear manufacturing stages include:

Cutting
Stitching
Upper Assembly
Lasting
Sole Bonding
Finishing
Cleaning
Packing

The ERP records progress at every stage.

12.16 Work-In-Progress (WIP)

During production, products remain in Work-In-Progress status.

The ERP tracks:

Started Quantity
Completed Quantity
Rejected Quantity
Pending Quantity
Production Time
Machine Utilization
12.17 Quality Inspection

Finished products undergo Quality Control before entering inventory.

Inspection Results:

Accepted
Rework Required
Rejected

Only accepted products proceed to Finished Goods Inventory.

12.18 Finished Goods

Accepted products become Finished Goods.

The ERP records:

Finished Quantity
Production Date
Warehouse
Batch Number
Production Cost

Finished Goods are transferred to Inventory.

12.19 Inventory Update

After production completion:

Finished Goods

↓

Inventory Update

↓

Stock Ledger

↓

Available Inventory

Finished Goods become available for Sales and Dispatch.

12.20 Production Costing

The ERP records manufacturing costs including:

Raw Material Cost
Labour Cost
Machine Cost
Electricity Cost
Packaging Cost
Overhead Cost

These values are forwarded to the Finance Domain.

12.21 Production Analytics

The ERP provides production metrics including:

Production Quantity
Production Efficiency
Material Consumption
Wastage Percentage
Machine Utilization
Labour Productivity
Production Cost
Production Lead Time
Rework Percentage
Overall Equipment Effectiveness (OEE)
12.22 Business Rules

The Production Planning & Manufacturing Domain follows these business rules:

Production begins only after PPC approval.
Every manufactured product must have an approved BOM.
MRP must validate raw material availability before production.
Material shortages automatically generate Purchase Requests.
Capacity Planning must validate machine and labour availability.
Every Production Order originates from an approved Production Request.
Material Issue reduces Raw Material Inventory.
Work-In-Progress must be tracked until production completion.
Finished Goods update Inventory only after successful Quality Inspection.
Every inventory movement generates a Stock Ledger entry.
Production costs must be recorded for every Production Order.
Completed Production Orders remain permanently auditable.
12.23 Production Relationship Diagram
Sales Forecast
      │
      ▼
Sales Order
      │
      ▼
Production Planning & Control
      │
      ▼
Demand Planning
      │
      ▼
MRP
      │
      ▼
Capacity Planning
      │
      ▼
Production Planning
      │
      ▼
Production Scheduling
      │
      ▼
Production Request
      │
      ▼
BOM
      │
      ▼
Raw Material
      │
      ▼
Production Order
      │
      ▼
Material Issue
      │
      ▼
Shop Floor
      │
      ▼
WIP
      │
      ▼
Quality Inspection
      │
      ▼
Finished Goods
      │
      ▼
Inventory
      │
      ▼
Stock Ledger
12.24 Dependencies

The Production Planning & Manufacturing Domain integrates with:

Product Variant & SKU Domain
Inventory & Warehouse Management Domain
Purchase & Procurement Domain
Sales Domain
Finance Domain
Quality Control (Future)
Maintenance (Future)
Reports
Dashboard
Notifications
Audit Logs
Chapter Summary

The Production Planning & Manufacturing Domain provides a complete enterprise manufacturing solution for the DS Footwear ERP SaaS platform. It combines Production Planning & Control (PPC), Material Requirement Planning (MRP), Capacity Planning, Production Scheduling, Bill of Materials (BOM), Shop Floor Execution, Work-In-Progress (WIP), Quality Inspection, Finished Goods Management, Inventory synchronization, and Production Costing into a unified workflow. By integrating tightly with Sales, Inventory, Purchase, Warehouse, and Finance, the domain delivers a scalable, auditable, and enterprise-grade manufacturing process aligned with industry best practices followed by SAP PP, Oracle Manufacturing, and Microsoft Dynamics 365 Manufacturing.