Chapter 17
Finance & Accounting Domain
17.1 Introduction

The Finance & Accounting Domain manages all financial transactions generated throughout the DS Footwear ERP SaaS platform.

It records, verifies, posts, and reports every financial event originating from Sales, Purchase, Production, Inventory, Warehouse, Payroll, and Customer or Vendor transactions.

The Finance Domain provides complete financial visibility, statutory compliance, GST management, receivable and payable tracking, ledger management, banking, reconciliation, and financial reporting.

17.2 Purpose

The Finance & Accounting Domain is responsible for:

Managing Customer Invoices
Managing Vendor Bills
Managing Accounts Receivable (AR)
Managing Accounts Payable (AP)
Managing Customer Payments
Managing Vendor Payments
Managing General Ledger (GL)
Managing Journal Entries
Managing Chart of Accounts (COA)
Managing GST
Managing Banking
Managing Cash & Bank Transactions
Managing Outstanding Balances
Managing Financial Reports
Supporting Financial Analytics
17.3 Finance Workflow
Sales / Purchase / Production
                │
                ▼
Financial Transaction
                │
                ▼
Journal Entry
                │
                ▼
General Ledger
                │
      ┌─────────┴─────────┐
      ▼                   ▼
Accounts Receivable   Accounts Payable
      │                   │
      ▼                   ▼
Customer Payment    Vendor Payment
      │                   │
      └─────────┬─────────┘
                ▼
          Bank / Cash
                │
                ▼
GST Calculation
                │
                ▼
Financial Reports
17.4 Chart of Accounts (COA)

The Chart of Accounts defines every accounting head used by the ERP.

Account Categories
Assets
Liabilities
Equity
Revenue
Expenses

Every financial transaction must reference valid accounts.

17.5 Journal Entry

Every financial transaction generates one or more Journal Entries.

Examples:

Sales Invoice
Purchase Invoice
Customer Payment
Vendor Payment
Expense Entry
Salary Posting
Inventory Adjustment
Depreciation

Each Journal Entry follows the Double Entry Accounting principle.

17.6 General Ledger (GL)

The General Ledger stores every posted accounting transaction.

Each Ledger Entry contains:

Ledger Number
Voucher Number
Date
Account
Debit
Credit
Reference Document
Narration

The General Ledger serves as the primary accounting record.

17.7 Customer Invoice

Sales Dispatch automatically generates a Customer Invoice.

Invoice includes:

Invoice Number
Customer
Sales Order
Product Details
GST
Discounts
Shipping Charges
Total Amount

Invoice Status:

Draft
Posted
Paid
Partially Paid
Cancelled
17.8 Vendor Bill

Vendor Bills are received after Goods Receipt.

Vendor Bill contains:

Vendor
Purchase Order
GRN
GST
Total Amount
Due Date

Finance verifies the bill before posting.

17.9 Accounts Receivable (AR)

Accounts Receivable tracks customer dues.

The ERP records:

Invoice Amount
Paid Amount
Outstanding Amount
Due Date
Payment Status
17.10 Accounts Payable (AP)

Accounts Payable tracks vendor liabilities.

The ERP records:

Vendor Bill
Payment Due
Paid Amount
Outstanding Amount
Credit Period
17.11 Customer Payment

The ERP supports:

UPI
Bank Transfer
Credit Card
Debit Card
Cash
Cheque
NEFT
RTGS
IMPS

Payment updates:

Accounts Receivable
Ledger
Bank Account
17.12 Vendor Payment

Vendor Payments update:

Accounts Payable
General Ledger
Bank Ledger

Payment Methods:

Bank Transfer
NEFT
RTGS
IMPS
Cheque
17.13 Banking

The ERP manages:

Bank Accounts
Cash Accounts
Bank Transfers
Bank Reconciliation
Payment Advice
Cheque Management
17.14 GST Management

GST Module manages:

CGST
SGST
IGST
GST Input Credit
GST Output Tax
GST Reports

GST is automatically calculated during Sales and Purchase.

17.15 Outstanding Management

Outstanding tracking includes:

Customer Outstanding

Current
Overdue
Bad Debt (Future)

Vendor Outstanding

Pending Bills
Overdue Payments
Advance Payments
17.16 Financial Reports

The ERP provides:

Profit & Loss Statement
Balance Sheet
Trial Balance
Cash Flow Statement
General Ledger Report
GST Reports
Sales Register
Purchase Register
Outstanding Reports
Payment Reports
17.17 Financial Analytics

Dashboard Metrics:

Revenue
Expenses
Gross Profit
Net Profit
Accounts Receivable
Accounts Payable
Cash Position
Outstanding Amount
GST Liability
Monthly Financial Trends
17.18 Business Rules

The Finance & Accounting Domain follows these business rules:

Every financial transaction must generate Journal Entries.
Every Journal Entry follows Double Entry Accounting.
General Ledger entries cannot be deleted after posting.
Customer Invoices are generated only after Dispatch.
Vendor Bills must reference an approved Purchase Order and GRN.
Customer Payments update Accounts Receivable.
Vendor Payments update Accounts Payable.
GST calculations are mandatory for taxable transactions.
Financial reports use only posted accounting entries.
Every financial transaction must remain permanently auditable.
A due owed to any party outside the PO/GRN flow (Payables, 17.21) posts no transaction until money actually moves — registering the due is not itself a cash event.
A marketplace Payment Advice (Marketplace Settlement, 17.22) posts only its net amount received as a transaction — the individual deductions netted off by the marketplace are cost/tax detail, not separate cash movements.
Input Tax Credit is claimed only for GST-applicable purchases carrying this business's own GSTIN as the buyer (17.23) — a B2C purchase's GST is cost, never a claimable credit.
17.19 Finance Relationship Diagram
Sales
      │
      ▼
Customer Invoice
      │
      ▼
Accounts Receivable
      │
      ▼
Customer Payment
      │
      ▼
Bank
      │
      ▼
Journal Entry
      │
      ▼
General Ledger
      ▲
      │
Vendor Bill
      │
Accounts Payable
      │
Vendor Payment
      │
GST
      │
Financial Reports
17.20 Dependencies

The Finance & Accounting Domain integrates with:

Sales & Order Management Domain
Purchase & Procurement Domain
Inventory & Warehouse Management Domain
Production Planning & Manufacturing Domain
Customer Domain
Vendor Domain
Employee Domain (Payroll – Future)
Reports
Dashboard
Notifications
Audit Logs

17.21 Payables (Generic Dues)

Accounts Payable (17.10) tracks Vendor Bills — always bound to a Purchase Order and GRN. Not every amount the business owes fits that shape: a landlord's rent deposit that stays unpaid for now, or an owner's personal advance that needs repaying, has no PO/GRN behind it at all. Payables is the general-purpose equivalent for exactly that case — a due amount owed to any party outside the PO/GRN flow.

A Payable records Party, Purpose, Total Amount, Amount Paid, and a derived Amount Due (Total − Paid, never stored directly). Registering a Payable posts no Ledger entry by itself — no cash has moved yet. Only recording a payment against it posts a debit transaction, at which point Amount Paid rises and Amount Due falls; the Payable auto-closes to Paid once Amount Due reaches zero, or can be manually Written Off if it will never be paid.

17.22 Marketplace Channels & Settlements

Where the company sells through third-party marketplaces (Meesho, Flipkart, Amazon, Myntra), the actual cost of that channel — courier/shipping, return and RTO handling, ads, commission — is not known in advance for a brand-new listing. Two entities support this:

Marketplace Channel — one row per marketplace, holding a bootstrap-mode blended cost-per-unit assumption (courier + return/RTO-weighted + ads + GST, all-in per pair sold), an assumed Customer-Return % and RTO %, a commission %, and a configured margin range. Used by the Pricing Calculator (Chapter 10 §10.11.1) until real data exists.
Marketplace Settlement — one row per marketplace Payment Advice line item: the real, itemized deductions (commission, shipping, return charge, ads) plus TCS and TDS kept as separate fields, since those are advance tax collected/deducted by the marketplace and credited back against GST/income-tax liability, not a real cost. Matched against the printed Tax Invoice, from which its linked Sales Order is derived — never picked independently. Recording a Settlement posts only its Net Amount Received as a credit transaction; the deduction fields are cost/tax detail already netted off before that number was arrived at.

Return rate, damage rate, and marketplace cost are never one blanket figure for the whole business — a "Sandal" design and a "Sneaker" design do not share a return rate or a marketplace cost. Both Returns (Chapter 18) and Marketplace Settlements support a per-product/category/variant breakdown for exactly this reason; the Pricing Calculator prefers a Variant's own actual settlement data over the channel-wide average, and only falls back to the channel's default assumption when neither real figure exists.

17.23 GST Input Tax Credit (ITC) Eligibility

A purchase's GST is only recoverable as Input Tax Credit when the supplier's invoice actually carries this business's own GSTIN as the buyer — a genuine B2B invoice. A B2C purchase (billed to an individual, no buyer GSTIN captured — e.g. an Amazon order placed on a personal account rather than Amazon Business) pays the identical GST, but that tax is not recoverable; it is simply part of the purchase's cost.

The GSTR-3B summary therefore reports two figures, never one: ITC Claimed (the CGST/SGST/IGST on purchases where the buyer's GSTIN is genuinely present) and ITC Not Eligible (the same tax total on every B2C purchase, which stays cost). A row carrying some GSTIN value is not, by itself, proof of eligibility — that GSTIN may belong to the seller, present on the row for reference, not to this business as buyer; both the B2B classification and a genuine buyer GSTIN must hold together before ITC is counted as claimed.

Chapter Summary

The Finance & Accounting Domain serves as the financial backbone of the DS Footwear ERP SaaS platform. It manages customer invoicing, vendor billing, accounts receivable, accounts payable, banking, GST compliance, journal entries, general ledger, and financial reporting. By implementing double-entry accounting principles and integrating seamlessly with Sales, Purchase, Inventory, Production, and Warehouse operations, the Finance Domain ensures complete financial accuracy, statutory compliance, auditability, and real-time business insights comparable to SAP FICO, Oracle Financials, and Microsoft Dynamics 365 Finance. Payables (17.21) and Marketplace Settlements (17.22) extend that backbone to dues and channel sales that fall outside the PO/GRN and standard invoice flows, while GST ITC Eligibility (17.23) ensures the platform never overstates a claimable credit that a real invoice cannot actually support.