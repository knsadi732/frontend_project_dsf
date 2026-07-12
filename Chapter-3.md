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

The Employee Domain is responsible for:

Maintaining Employee Master Data.
Providing ERP Authentication.
Managing Role-Based Access Control (RBAC).
Assigning organizational responsibilities.
Managing attendance and leave.
Managing payroll information.
Maintaining employee documents.
Tracking company assets assigned to employees.
Recording audit history of employee activities.
Serving as the single identity source for the entire ERP.

3.3 Employee Domain Structure
Employee
├── Login & Authentication
├── Roles
├── Permissions
├── Department
├── Designation
├── Salary
├── Attendance
├── Leave Management
├── Documents
├── Company Assets
└── Audit Logs

Each module is logically independent but linked to the Employee Master.

3.4 Employee Master

The Employee Master is the primary identity record for every ERP user.

Each employee is uniquely identified by a system-generated Employee Code and is associated with the organizational hierarchy.

Every transaction performed in the ERP references the Employee Master.

Core Employee Information
Identity Information
Employee ID (UUID)
Employee Code
First Name
Middle Name
Last Name
Display Name
Profile Photo
Contact Information
Mobile Number (Primary Login ID)
Email Address
Emergency Contact Number
Emergency Contact Person
Personal Information
Date of Birth
Gender
Blood Group
Marital Status
Nationality
Government Identity
Aadhaar Number
PAN Number
Passport Number (Optional)
Driving License (Optional)
Employment Information
Company
Branch
Department
Designation
Reporting Manager
Joining Date
Employment Status
Banking Information
Bank Name
Account Holder Name
Account Number
IFSC Code
UPI ID (Optional)
Address Information
Permanent Address
Current Address
City
State
Country
Postal Code
System Information
Login Phone Number
Account Status
Last Login
Password Last Changed
Two-Factor Authentication Status (Future)
3.5 Employee Login & Authentication

Employees access the ERP using their registered mobile number and password.

Authentication Flow
Phone Number
        │
        ▼
Employee Master
        │
        ▼
Password Verification
        │
        ▼
Load Employee Roles
        │
        ▼
Load Permissions
        │
        ▼
Generate JWT
        │
        ▼
Dashboard
Business Rules
Phone Number is the primary login credential.
Email login is not supported in ERP v1.0.
JWT is generated after successful authentication.
Session management is handled through Redis.
3.6 Employee Roles

The DS Footwear ERP supports multiple roles per employee.

Each employee must have:

One Primary Role
Zero or More Additional Roles

This enables employees to perform cross-functional responsibilities without creating duplicate user accounts.

Examples
Employee	Primary Role	Additional Roles
Aditya	Sales	Dispatch, Customer Support
Rahul	Inventory	Purchase
Amit	Accountant	Finance
Admin	Super Admin	Owner
Business Rules
Every employee must have one Primary Role.
An employee may have multiple Additional Roles.
Role assignments are managed through the employee_roles mapping table.
3.7 Employee Permissions

Permissions are not assigned directly to employees.

Permissions are inherited from all assigned roles.

Permission Categories
Menu Access
Page Access
Create
Edit
Delete
Approve
Export
Import
Print

Final employee permissions are calculated as the union of all assigned role permissions.

3.8 Department Assignment

Every employee belongs to one Department.

Examples:

HR
Accounts
Purchase
Inventory
Production
Sales
Dispatch
Customer Support
Finance
IT

Departments define operational ownership and reporting structures.

3.9 Designation

Designation defines the employee's position within the organization.

Examples:

CEO
Owner
General Manager
Warehouse Manager
Purchase Manager
Production Manager
Sales Executive
Accountant

Designation represents hierarchy only. It does not grant system permissions.

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