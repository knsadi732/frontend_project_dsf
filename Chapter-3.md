Chapter 3
Employee Domain
3.1 Introduction

The Employee Domain represents every individual authorized to access, operate, manage, approve, or monitor business operations within the DS Footwear ERP SaaS platform.

In the DS Footwear ERP, an Employee is the ERP User. The system does not maintain a separate User entity. Every authenticated individual—including founders, administrators, managers, supervisors, executives, operators, and support staff—is managed through the centralized Employee Master.

The Employee Domain serves as the single identity management domain for the entire ERP ecosystem. It is responsible for maintaining employee master information, authentication, role-based access control (RBAC), organizational assignments, payroll information, attendance, leave management, document management, asset allocation, and complete auditability of employee activities.

Each employee belongs to the organizational hierarchy of the company and is associated with a Company, Branch, Department, Designation, and Reporting Manager. An employee may also be assigned multiple ERP Roles, enabling cross-functional responsibilities while maintaining a single employee profile and login account.

Every business transaction performed within the ERP is traceable to the employee who initiated, modified, approved, or completed the action, ensuring complete accountability and operational transparency.

The Employee Domain is referenced by all major ERP modules, including Authentication, RBAC, Organization Management, Sales, Purchase, Inventory, Warehouse, Production Planning & Manufacturing, Finance & Accounting, Dispatch, Customer Support, Reporting & Business Intelligence, Communication & Workflow Automation, and Audit Logs.

The domain is designed to support organizations ranging from small startup teams with multi-role employees to large enterprise organizations with thousands of employees, without requiring changes to the core business architecture.

3.2 Purpose

The Employee Domain is responsible for managing the complete employee lifecycle and serving as the centralized identity management system of the DS Footwear ERP SaaS platform.

Its primary responsibilities include:

Maintaining complete Employee Master Data.
Managing Employee Profile and organizational information.
Providing secure ERP Authentication and Login Management.
Managing Role-Based Access Control (RBAC) and ERP access.
Assigning employees to the organizational hierarchy, including Company, Branch, Department, Designation, Warehouse, and Reporting Manager.
Supporting multiple ERP Roles for cross-functional responsibilities.
Managing Attendance, Shift, and Leave Management.
Managing Salary & Payroll Information.
Maintaining Employee Documents and ensuring they are uploaded only once and reused across all ERP modules.
Tracking Company Assets assigned to employees.
Recording complete Audit Logs of employee activities and business actions.
Providing employee information to all ERP modules through a single centralized Employee Master.
Ensuring complete traceability, accountability, and security for every business transaction performed within the ERP.
Supporting future organizational growth from small startup teams to large enterprise workforces without requiring structural changes.

The Employee Domain serves as the Single Source of Truth (SSOT) for employee identity, organizational assignments, ERP access, and workforce-related information across the entire DS Footwear ERP ecosystem.

3.3 Employee Domain Structure
Employee
│
├── Employee Profile
├── Login & Authentication
├── Organization Assignment
│      ├── Company
│      ├── Branch
│      ├── Warehouse
│      ├── Department
│      ├── Designation
│      └── Reporting Manager
│
├── Roles
├── Permissions
├── Salary & Payroll
├── Attendance
├── Shift Management
├── Leave Management
├── Documents
├── Company Assets
├── Audit Logs
└── Employment Lifecycle

The Employee Domain is organized into multiple logical business components. Each component manages a specific aspect of the employee lifecycle while remaining centrally linked through the Employee Master.

All employee-related information—including authentication, organizational assignments, ERP access, payroll, attendance, documents, company assets, and audit history—is maintained within a single employee profile, ensuring consistency, eliminating duplicate data, and providing a unified identity across the entire ERP platform.

3.4 Employee Master

The Employee Master is the central and authoritative repository of all employee-related information within the DS Footwear ERP SaaS platform. It serves as the Single Source of Truth (SSOT) for every employee and acts as the foundation for authentication, organizational management, payroll, attendance, business operations, and ERP access control.

Every employee is uniquely identified by a system-generated Employee Code and is associated with the organization's business hierarchy, including Company, Branch, Warehouse, Department, Designation, Reporting Manager, and assigned ERP Roles.

The Employee Master consolidates all business, organizational, operational, statutory, and system information into a single unified profile. This centralized approach eliminates duplicate data, ensures consistency across all ERP modules, and provides complete traceability for every business transaction performed by an employee.

All ERP modules—including Authentication, RBAC, Sales, Purchase, Inventory, Warehouse, Production, Finance, Dispatch, Customer Support, Reports, Payroll, Attendance, and Audit Logs—reference the Employee Master whenever an employee performs any business activity.

The Employee Master is logically divided into the following information groups:

Identity Information
Contact Information
Personal Information
Government Identity
Employment Information
Organization Information
ERP Access Information
Banking Information
Address Information
Salary Information
Employee Documents
Operational Information
Audit Information

These logical groups ensure that employee information is well organized, reusable across multiple ERP modules, and scalable for future business requirements.

3.4.1 Identity Information

The Identity Information section uniquely identifies every employee within the ERP system.

Fields

Employee ID (UUID)
Employee Code
First Name
Middle Name
Last Name
Display Name
Profile Photo
3.4.2 Contact Information

The Contact Information section stores the employee's primary and emergency communication details.

Fields

Mobile Number (Primary Login ID)
Alternate Mobile Number (Optional)
Email Address
Emergency Contact Person
Emergency Contact Number
3.4.3 Personal Information

The Personal Information section stores basic demographic information required for HR and statutory purposes.

Fields

Date of Birth
Gender
Blood Group
Marital Status
Nationality
3.4.4 Government Identity

The Government Identity section maintains statutory identity documents required for compliance and employee verification.

Fields

Aadhaar Number
PAN Number
Passport Number (Optional)
Driving License (Optional)
UAN Number (Optional)
ESIC Number (Optional)
3.4.5 Employment Information

The Employment Information section stores details related to the employee's employment within the organization.

Fields

Company
Branch
Warehouse (Optional)
Department
Designation
Reporting Manager
Joining Date
Employment Type
Employment Status
Probation Period (Optional)
Confirmation Date (Optional)
3.4.6 Banking Information

The Banking Information section stores salary payment details.

Fields

Bank Name
Account Holder Name
Account Number
IFSC Code
Branch Name
UPI ID (Optional)
3.4.7 Address Information

The Address Information section stores permanent and current residential addresses.

Fields

Permanent Address
Address Line
City
State
Country
Postal Code
Current Address
Address Line
City
State
Country
Postal Code
3.4.8 ERP Access Information

The ERP Access Information section defines how an employee accesses the ERP system.

Fields

Login Phone Number
Password (Encrypted)
Primary Role
Additional Roles
Effective Permissions
Account Status
Last Login
Password Last Changed
Two-Factor Authentication Status (Future)

3.5 Employee Login & Authentication

The Employee Login & Authentication component is responsible for securely verifying employee identities before granting access to the DS Footwear ERP SaaS platform.

Authentication ensures that only authorized employees can access ERP resources based on their assigned Roles and Permissions. The system validates employee credentials, loads organizational assignments and ERP access rights, generates a secure authenticated session, and records all login activities for security and audit purposes.

The Login & Authentication component works closely with the Employee Master, RBAC, JWT Authentication, Session Management, and Audit Log services to provide secure, traceable, and scalable access control across the ERP.

3.5.1 Login Credentials

Employees authenticate using the following credentials:

Mobile Number (Primary Login ID)
Password (Encrypted)

Note: Email-based login is not supported in ERP Version 1.0.

3.5.2 Authentication Flow

The authentication process follows the workflow below:

Employee
      │
      ▼
Enter Mobile Number
      │
      ▼
Employee Master Verification
      │
      ▼
Password Verification
      │
      ▼
Load Employee Profile
      │
      ▼
Load Organization Assignment
      │
      ▼
Load Assigned Roles
      │
      ▼
Calculate Effective Permissions
      │
      ▼
Generate JWT Token
      │
      ▼
Create User Session
      │
      ▼
Record Audit Log
      │
      ▼
Dashboard
3.5.3 Authentication Components

The Login & Authentication process uses the following components:

Employee Master
Password Verification
Role Loading
Permission Calculation
JWT Token Generation
Session Management
Audit Logging
3.5.4 Business Rules

The Login & Authentication component follows these business rules:

Mobile Number is the primary login credential.
Email login is not supported in ERP Version 1.0.
Passwords must be stored in encrypted form and never as plain text.
JWT Token is generated only after successful authentication.
Employee Roles are loaded during login.
Effective Permissions are calculated from all assigned Roles.
Every successful and failed login attempt must be recorded in the Audit Log.
Every authenticated session is uniquely associated with an Employee.
Session management is handled through Redis.
Unauthorized users must not be allowed to access protected ERP modules.
3.5.5 Future Enhancements

The Login & Authentication component is designed to support future security enhancements, including:

Two-Factor Authentication (2FA)
OTP-based Login
Biometric Authentication
Face Recognition Login
Single Sign-On (SSO)
Multi-Device Session Management
Login Notification Alerts

3.6 Employee Roles

The Employee Roles component defines the ERP responsibilities and system access assigned to an employee within the DS Footwear ERP SaaS platform.

A Role determines what an employee can access and perform within the ERP. Roles are independent of the employee's Department and Designation, allowing employees to perform cross-functional responsibilities without creating duplicate employee accounts.

The DS Footwear ERP supports Multiple Role Assignment, enabling a single employee to manage multiple business functions, which is especially beneficial for startups and growing organizations with limited manpower.

3.6.1 Role Assignment

Each employee must be assigned at least one Primary Role and may also be assigned zero or more Additional Roles.

Employee
      │
      ├── Primary Role
      │
      └── Additional Roles

The Primary Role represents the employee's main business responsibility, while Additional Roles provide access to other ERP modules based on operational requirements.

3.6.2 Multiple Role Support

The ERP allows a single employee to perform responsibilities across multiple departments by assigning multiple ERP Roles.

This approach:

Eliminates duplicate employee accounts.
Reduces administrative overhead.
Supports startup businesses with limited employees.
Provides operational flexibility.
Simplifies future organizational expansion.
3.6.3 Role Assignment Examples
Employee	Primary Role	Additional Roles
Aditya	Sales	Dispatch, Customer Support
Rahul	Inventory	Purchase
Amit	Accountant	Finance
Admin	Super Admin	Owner

Example: In a startup environment, one employee may simultaneously perform the roles of Inventory, Warehouse, and Dispatch, while another employee may manage Production and Quality Control using a single ERP account.

3.6.4 Role Management

Employee Roles are managed through the employee_roles mapping table.

This design supports a Many-to-Many Relationship, where:

One Employee can have multiple Roles.
One Role can be assigned to multiple Employees.

This normalized structure provides flexibility and scalability without duplicating employee records.

3.6.5 Business Rules

The Employee Roles component follows the following business rules:

Every Employee must have at least one Primary Role.
An Employee may have multiple Additional Roles.
Every Role assignment must be active before it can be used for ERP access.
Effective Permissions are derived from all assigned Roles.
Role assignments are managed through the employee_roles mapping table.
Removing a Role must automatically update the employee's effective permissions.
Role assignments must be recorded in the Audit Log.
Roles define ERP access only and do not determine organizational hierarchy.

3.6.6 Future Enhancements

The Employee Roles component is designed to support future enterprise capabilities, including:

Temporary Role Assignment
Delegated Roles
Time-Based Role Activation
Project-Based Roles
Branch-Specific Roles
Warehouse-Specific Roles
Approval Role Hierarchies

3.7 Employee Permissions

The Employee Permissions component defines the actions an employee is authorized to perform within the DS Footwear ERP SaaS platform.

Permissions are never assigned directly to employees. Instead, they are automatically inherited from all ERP Roles assigned to the employee. This centralized Role-Based Access Control (RBAC) model simplifies administration, improves security, and ensures consistent permission management across the entire ERP.

When an employee is assigned multiple Roles, the system calculates the employee's Effective Permissions by combining the permissions granted through all assigned Roles.

3.7.1 Permission Inheritance

Employee permissions are derived through the following hierarchy:

Employee
      │
      ▼
Assigned Roles
      │
      ▼
Role Permissions
      │
      ▼
Effective Permissions
      │
      ▼
ERP Modules

The employee never stores permissions directly. Permissions are always calculated dynamically based on the assigned Roles.

3.7.2 Permission Categories

The ERP supports multiple permission categories for controlling access to business modules and operations.

Module Access
Menu Access
Dashboard Access
Page Access
Data Operations
View
Create
Edit
Delete
Business Operations
Approve
Reject
Cancel
Reopen
Data Management
Import
Export
Print
Administrative Operations
Assign Roles
Manage Permissions
System Configuration
Audit Log Access
3.7.3 Effective Permission Calculation

When an employee has multiple Roles, the ERP calculates the Effective Permissions as the union of all permissions assigned to those Roles.

Example:

Assigned Roles	Effective Permissions
Inventory + Warehouse	Inventory, Warehouse, Stock Transfer, Dispatch
Sales + Customer Support	Sales Orders, Customer Management, Returns
Owner + Finance	Complete access to Owner and Finance modules

This approach allows employees to perform multiple business responsibilities using a single ERP account.

3.7.4 Permission Evaluation

Every time an employee accesses an ERP module or performs an operation, the system validates the required permission before allowing the action.

Permission checks apply to:

Menu Visibility
Page Access
API Access
Button Visibility
Create Operations
Edit Operations
Delete Operations
Approval Actions
Export & Print Operations

Unauthorized actions are automatically blocked by the system.

3.7.5 Business Rules

The Employee Permissions component follows the following business rules:

Permissions are never assigned directly to Employees.
Permissions are inherited from assigned ERP Roles.
Every Employee must have at least one Role before accessing the ERP.
Effective Permissions are calculated from all assigned Roles.
Permission validation is mandatory for every protected ERP operation.
Changes to Role Permissions take effect immediately for all assigned Employees.
Permission changes must be recorded in the Audit Log.
Backend APIs must always validate permissions, regardless of frontend restrictions.
3.7.6 Future Enhancements

The Employee Permissions component is designed to support future enterprise capabilities, including:

Temporary Permissions
Time-Based Permissions
Branch-Level Permissions
Warehouse-Level Permissions
Module-Specific Restrictions
Field-Level Security
Record-Level Access Control
Approval-Based Permission Escalation

3.8 Department

The Department represents a functional business unit within the DS Footwear ERP SaaS platform. Every employee is assigned to a Primary Department, which defines the employee's operational responsibility, reporting structure, workflow ownership, and business function within the organization.

Departments are used to organize employees based on business operations, simplify reporting, assign responsibilities, and support approval workflows across different ERP modules.

A Department defines where an employee works, while Roles define what an employee can access within the ERP system.

3.8.1 Standard Departments

The DS Footwear ERP supports the following standard business departments:

Management
Management
Administration
Human Resources
Human Resources (HR)
Product Development
Product Design
Research & Development (R&D)
Purchase
Purchase
Inventory
Inventory
Warehouse
Warehouse
Production
Production Planning & Control (PPC)
Production
Quality Control (QC)
Sales & Customer Service
Sales
Customer Support
Finance
Accounts
Finance
Information Technology
Information Technology (IT)
Marketing
Marketing
3.8.2 Department Responsibilities

Each Department is responsible for managing a specific business function within the organization.

Examples:

Department	Primary Responsibility
Purchase	Procurement of raw materials and services
Inventory	Stock management and inventory control
Warehouse	Storage, picking, packing and dispatch
Production	Manufacturing of finished goods
Sales	Sales order processing and customer order management
Finance	Accounting, payments and financial reporting
HR	Employee and payroll management
Product Design	Product design and development
QC	Quality inspection and product approval
3.8.3 Business Rules

The Department component follows the following business rules:

Every Employee must belong to one Primary Department.
A Department may have multiple Employees.
A Department may contain multiple Designations.
Departments define business ownership and reporting structure.
Departments do not grant ERP permissions.
ERP access is controlled through Roles, not Departments.
Department assignments are maintained through the Employee Master.

3.9 Designation

The Designation defines an employee's official job position within the organizational hierarchy of the DS Footwear ERP SaaS platform.

A Designation represents an employee's level of responsibility, authority, reporting relationship, and job title within the organization. It helps define the organizational structure, approval hierarchy, and reporting chain but does not determine ERP access or system permissions.

While a Department defines where an employee works, a Designation defines what position the employee holds within that department. ERP access is controlled separately through Roles.

3.9.1 Standard Designations

The DS Footwear ERP supports the following standard designations.

Top Management
Founder
Co-Founder
Chairman
Managing Director (MD)
Chief Executive Officer (CEO)
Chief Operating Officer (COO)
Chief Financial Officer (CFO)
Chief Technology Officer (CTO)
Department Management
General Manager
Department Manager
Assistant Manager
Team Lead
Executives
Senior Executive
Executive
Junior Executive
Supervisory Roles
Supervisor
Shift In-Charge
Operational Roles
Purchase Executive
Inventory Executive
Warehouse Executive
Store Keeper
Production Executive
Machine Operator
Quality Inspector
Dispatch Executive
Sales Executive
Customer Support Executive
Accountant
HR Executive
IT Executive
Product Development
Product Designer
Footwear Designer
CAD Designer
Sample Developer
Support Staff
Office Assistant
Helper
Worker
3.9.2 Designation Responsibilities

Designations define:

Organizational Position
Reporting Hierarchy
Approval Authority
Job Responsibilities
Career Progression
Organizational Structure

Designation does not determine ERP permissions.

3.9.3 Business Rules

The Designation component follows the following business rules:

Every Employee must have one Designation.
A Designation may be assigned to multiple Employees.
Every Designation belongs to one Department.
Designation defines the organizational hierarchy.
Designation does not grant ERP permissions.
ERP access is controlled through assigned Roles.
Changes in Designation do not automatically change ERP Roles or Permissions.
Designation history should be maintained for employee promotion and transfer records.

3.10 Salary Management

Salary information includes:

Salary Structure
Basic Salary
HRA
Allowances
Incentives
Bonus
Deductions
PF
ESI
TDS

Payroll calculations are handled by the Payroll Service.

3.11 Attendance Management

Attendance records include:

Check-In
Check-Out
Shift
Overtime
Late Entry
Early Exit
Total Working Hours

Attendance records are used by Payroll and HR.

3.12 Leave Management

Supported Leave Types:

Casual Leave
Sick Leave
Earned Leave
Paid Leave
Unpaid Leave
Maternity / Paternity Leave
Emergency Leave

All leave requests follow an approval workflow.

3.13 Employee Documents

Employees upload their documents only once.

Supported Documents:

Aadhaar Card
PAN Card
Passport (Optional)
Driving License (Optional)
Bank Passbook / Cancelled Cheque
Educational Certificates
Experience Certificates
Appointment Letter
Offer Letter
Resume / CV
Signature
Passport Size Photograph
Business Rule

Documents uploaded by an employee are reused across HR, Accounts, Payroll, Finance, and Administration. No department should request the same document again.

3.14 Company Assets

The ERP maintains records of assets assigned to employees.

Examples:

Laptop
Desktop
Mobile Phone
SIM Card
ID Card
Biometric Device
Company Vehicle

Asset assignment history is permanently maintained.

3.15 Audit Logs

Every employee action is recorded.

Audit records include:

Login / Logout Time
IP Address
Browser
Device Information
API Requests
Record Changes
Approval Actions
Failed Login Attempts

Audit Logs are immutable and cannot be modified.

3.16 Employee Master Fields
Identity
Employee ID
Employee Code
Full Name
Profile Photo
Contact
Phone Number
Email Address
Emergency Contact
Personal
Date of Birth
Gender
Blood Group
Marital Status
Government Documents
Aadhaar Number
PAN Number
Passport Number (Optional)
Driving License (Optional)
Organization
Company
Branch
Department
Designation
Reporting Manager
Roles
Primary Role
Additional Roles
Payroll
Salary Structure
Bank Details
Documents
Identity Documents
Qualification Documents
Experience Documents
System
Account Status
Last Login
Password Updated On
3.17 Business Rules
Employee = ERP User.
No separate User table shall exist.
Login is performed using the registered Phone Number.
Every employee belongs to one Company.
Every employee belongs to one Branch.
Every employee belongs to one Department.
Every employee has one Designation.
Every employee must have one Primary Role.
An employee may have multiple Additional Roles.
Permissions are inherited from assigned Roles.
Employee documents are uploaded only once and reused across the ERP.
Every business transaction must record the acting Employee.
Employee records with historical transactions cannot be deleted; they may only be marked Inactive.
3.18 Employee Relationship Diagram
Company
    │
    ▼
Branch
    │
    ▼
Department
    │
    ▼
Designation
    │
    ▼
Employee
    ├── Primary Role
    ├── Additional Roles
    ├── Permissions
    ├── Salary
    ├── Attendance
    ├── Leave
    ├── Documents
    ├── Assets
    └── Audit Logs
3.19 Dependencies

The Employee Domain is referenced by:

Authentication
RBAC
Sales
Purchase
Inventory
Production
Warehouse
Finance
Dispatch
Customer Support
Reports
Notifications
Audit Logs

Every operational transaction stores the Employee ID of the employee who created, modified, approved, or completed the action.

Chapter Summary

The Employee Domain serves as the identity, authentication, and operational foundation of the DS Footwear ERP SaaS platform. Every employee is managed through a single master profile and can be assigned one primary role with multiple additional roles. This unified design eliminates duplicate user records, enables flexible cross-department responsibilities, simplifies administration, and provides complete traceability for every business action across the ERP ecosystem.