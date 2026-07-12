Chapter 4
RBAC (Role-Based Access Control) Domain
4.1 Introduction

The Role-Based Access Control (RBAC) Domain is responsible for managing authentication authorization throughout the DS Footwear ERP SaaS platform.

Its primary objective is to ensure that every employee can access only the business modules, pages, actions, and data required for their assigned responsibilities.

Rather than assigning permissions directly to employees, the ERP follows a role-based authorization model where permissions are granted to Roles, and Employees inherit permissions through their assigned roles.

The system supports multiple roles per employee, enabling flexible cross-functional responsibilities while maintaining centralized permission management.

4.2 Purpose

The RBAC Domain is designed to:

Control system access.
Secure business data.
Restrict unauthorized operations.
Simplify permission management.
Support multiple employee roles.
Centralize authorization policies.
Maintain auditability of permission changes.
Support future organizational growth.
4.3 RBAC Architecture
Employee
      │
      ▼
Employee Roles
      │
      ▼
Roles
      │
      ▼
Role Permissions
      │
      ▼
Permissions

The authorization engine calculates the employee's effective permissions by combining permissions from all assigned roles.

4.4 Core Entities

The RBAC Domain consists of the following entities:

Entity	Purpose
Employee	ERP User
Role	Business responsibility group
Permission	Individual system capability
Employee Roles	Maps employees to one or more roles
Role Permissions	Maps roles to permissions
4.5 Roles
Purpose

A Role represents a collection of business responsibilities within the ERP.

Roles simplify permission management by grouping related permissions together.

An employee may have multiple assigned roles.

Standard ERP Roles
Super Admin
Owner
General Manager
HR
Accountant
Finance
Purchase
Inventory
Production
Sales
Dispatch
Customer Support
Quality Control
Warehouse Manager
Employee

Additional roles may be created based on organizational requirements.

Business Rules
Every employee must have one Primary Role.
Employees may have multiple Additional Roles.
Roles do not store employee information.
Roles only define business responsibilities.
4.6 Permissions
Purpose

A Permission defines a single action that can be performed inside the ERP.

Permissions are the smallest unit of authorization.

Permission Categories
Navigation Permissions
Menu Access
Module Access
Dashboard Access
Page Permissions
View Page
Open Detail Page
View Reports
Data Permissions
Create
Edit
Delete
View
Approval Permissions
Approve
Reject
Verify
Cancel
Import / Export
Export Excel
Export PDF
Print
Import Data
Administration
System Settings
Company Settings
User Management
Role Management
Permission Management
4.7 Employee Roles

Employees are assigned one or more roles through the Employee Roles mapping.

Relationship:

Employee
      │
      ▼
Employee Roles
      │
      ▼
Role

Example:

Employee	Assigned Roles
Aditya	Sales, Dispatch
Rahul	Inventory, Purchase
Amit	Accountant, Finance
4.8 Role Permissions

Role Permissions define which permissions belong to each role.

Relationship:

Role
      │
      ▼
Role Permissions
      │
      ▼
Permission

Example:

Sales Role

View Orders
Create Sales Order
Edit Sales Order
View Customer
View Inventory

Dispatch Role

View Dispatch Queue
Create Dispatch
Print Shipping Label

Finance Role

Create Invoice
Record Payment
View Ledger
Generate GST Reports
4.9 Permission Resolution

When an employee logs in, the authorization engine performs the following sequence:

Phone Login
      │
      ▼
Employee
      │
      ▼
Employee Roles
      │
      ▼
Role Permissions
      │
      ▼
Effective Permissions
      │
      ▼
JWT Token
      │
      ▼
Dashboard

The JWT contains the employee identity and assigned roles, while the application resolves the effective permissions from those roles.

4.10 Permission Levels

The ERP supports different permission scopes.

Module Level

Example:

Sales Module

Inventory Module

Finance Module

Page Level

Example:

Sales Order Page

Invoice Page

Inventory Dashboard

Action Level

Example:

Create

Edit

Delete

Approve

Reject

Export

Import

Print

Record Level (Future)

Future versions may restrict access to specific records based on branch, warehouse, department, or reporting hierarchy.

4.11 Security Rules

The RBAC Domain follows the following security principles:

Authentication verifies identity.
Authorization verifies permissions.
Every API validates permissions.
Every frontend route validates permissions.
Every business action validates permissions.
Unauthorized operations must be rejected.
Permission changes must be audited.
4.12 Business Rules
Every employee must have one Primary Role.
Employees may have multiple Additional Roles.
Permissions are never assigned directly to employees.
Employees inherit permissions from assigned roles.
The effective permission set is the union of all assigned role permissions.
Role assignments must be auditable.
Permission changes take effect immediately after re-authentication or token refresh.
Every protected API must validate permissions before execution.
Frontend route guards must never replace backend authorization.
Super Admin has unrestricted access to all ERP modules unless explicitly restricted by system policy.
4.13 RBAC Relationship Diagram
Employee
    │
    ▼
Employee Roles
    │
    ├── Primary Role
    └── Additional Roles
          │
          ▼
        Roles
          │
          ▼
   Role Permissions
          │
          ▼
     Permissions
          │
          ▼
 Modules • Pages • Actions
4.14 Dependencies

The RBAC Domain is referenced by every secured module within the ERP.

Dependent domains include:

Authentication
Dashboard
Company
Employee
Customer
Vendor
Product
Inventory
Purchase
Production
Sales
Dispatch
Finance
Reports
Notifications
Settings

Every protected operation must validate authorization through the RBAC Domain.

Chapter Summary

The RBAC Domain provides the authorization framework for the DS Footwear ERP SaaS platform. It implements a scalable Role-Based Access Control model where employees inherit permissions through one or more assigned roles. By separating employees, roles, and permissions into dedicated entities, the system ensures centralized security management, flexible organizational structures, and consistent authorization across all frontend interfaces, backend services, and business workflows.