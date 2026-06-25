# MFLEX - LOAN MANAGEMENT SYSTEM

## Complete Project Documentation & Development Specification

---

# PROJECT OVERVIEW

## Project Name

**MFLEX - Loan Management System**

## Project Description

MFLEX is a web-based Loan Management System designed for small to medium lending businesses. The system enables administrators to manage creditors, loans, loan payments, collections, reports, and system settings through a centralized admin dashboard.

The system focuses on simplicity, performance, maintainability, and deployment on free-tier cloud services.

---

# TECHNOLOGY STACK

## Frontend

* React 19
* Vite
* React Router DOM
* TanStack Query
* Axios
* React Hook Form
* Zod Validation
* Tailwind CSS
* shadcn/ui
* Recharts

## Backend

* Node.js (Latest LTS)
* Express.js
* JWT Authentication
* bcrypt Password Hashing
* Prisma ORM

## Database

* Neon PostgreSQL (Free Tier)

## Deployment

### Frontend

Render Static Site

### Backend

Render Web Service

### Database

Neon PostgreSQL

---

# DESIGN REQUIREMENTS

## Design Style

The application should have:

* Professional appearance
* Modern UI
* Minimalist design
* Responsive layout
* Clean spacing
* Fast loading

## Theme

Light Theme Only

### Primary Color

```css
#2563EB
```

### Secondary Color

```css
#FACC15
```

### Background

```css
#F8FAFC
```

### Card Background

```css
#FFFFFF
```

### Text Color

```css
#0F172A
```

### Border Color

```css
#E2E8F0
```

---

# APPLICATION STRUCTURE

## Public Pages

### Landing Page

Route:

```text
/
```

Only one landing page.

There must be NO admin login button visible on the landing page.

Admin login is accessed manually via URL.

---

# LANDING PAGE SECTIONS

## 1. Navigation Bar

Contains:

* Logo
* Home
* About
* Services
* Contact

Sticky header.

---

## 2. Hero Section

Headline:

```text
Flexible Loans When You Need Them Most
```

Subheadline:

```text
Fast, Secure, and Reliable Lending Solutions
```

Buttons:

* Learn More
* Contact Us

---

## 3. About Section

Company overview.

Explain:

* Mission
* Vision
* Lending services

---

## 4. Features Section

Feature Cards:

* Fast Approval
* Flexible Loan Terms
* Secure Transactions
* Transparent Interest Rates

---

## 5. Process Section

Display process:

```text
Application
↓
Approval
↓
Loan Release
↓
Repayment
```

---

## 6. Testimonials Section

3-6 testimonial cards.

---

## 7. Contact Section

Contains:

* Company Address
* Phone Number
* Email Address
* Google Maps Embed

---

## 8. Footer

Contains:

* Copyright
* Contact Information
* Social Links

---

# AUTHENTICATION

## Admin Login

Route:

```text
/admin/login
```

Fields:

* Username
* Password

Features:

* Remember Me
* Form Validation
* Error Handling

Security:

* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes

---

# ADMIN PANEL

## Layout Structure

```text
┌────────────────────────────────────┐
│ Header                             │
├─────────────┬──────────────────────┤
│ Sidebar     │ Main Content         │
│             │                      │
└─────────────┴──────────────────────┘
```

---

# HEADER

Contains:

* Logo
* User Profile
* Notifications
* Logout

---

# SIDEBAR MENU

Dashboard

Creditors

Loans

Loan Payments

Collections

Reports

Archives

Settings

Profile

---

# MODAL DIALOGS & USER INTERACTIONS

## Overview

All CRUD operations (Create, Read, Update, Delete) in the admin panel use modal dialogs for a clean, non-disruptive user experience. Modals prevent users from navigating away while performing important actions.

## Modal Types

### 1. Add Modal (Create)

**Purpose**: Create new creditors, loans, or payments

**Trigger**: "Add" button on each page header

**Features**:
- Form validation with Zod schemas
- Real-time field validation
- Submit button disabled during processing
- Error messages displayed below form
- Cancel button to close without saving
- Success automatically closes modal and refreshes data

**Pages with Add Modals**:
- Creditors Page → Add Creditor Modal
- Loans Page → Add Loan Modal
- Payments Page → Add Payment Modal

**Special Features**:
- **Loans Modal**: Auto-calculates Daily Interest, Total Interest, Total Payable, and Due Date
- **Payments Modal**: Fetches active loans and shows remaining balance for selected loan

---

### 2. View Modal (Read)

**Purpose**: Display full details of a creditor, loan, or payment

**Trigger**: "View" button in table Actions column

**Features**:
- Read-only display of all information
- Organized sections for better readability
- Links to related entities (e.g., creditor info when viewing a loan)
- Status badges with color coding
- Close button only (no edit capability)
- Loads data dynamically on modal open

**Pages with View Modals**:
- Creditors Page → View Creditor Modal
- Loans Page → View Loan Modal
- Payments Page → View Payment Modal

**Information Displayed**:

**View Creditor**:
- Personal Information section (Name, Contact, Email, Address)
- Notes section
- Status badge
- Created/Updated timestamps

**View Loan**:
- Borrower Information (Name, Contact, Address)
- Loan Information (Loan Number, Principal, Interest Rate, Term, Dates)
- Financial Summary (Daily Interest, Total Interest, Total Payable, Status)
- Payment tracking (Paid Amount, Remaining Balance)

**View Payment**:
- Payment Information (Number, Amount, Date, Method, Reference)
- Loan Information (Loan Number, Borrower, Contact)
- Notes section
- Creation timestamp

---

### 3. Edit Modal (Update)

**Purpose**: Modify existing creditor, loan, or payment details

**Trigger**: "Edit" button in table Actions column

**Features**:
- Pre-populated form fields with current data
- Same validation as Add modal
- Submit button disabled during processing
- Error messages displayed
- Changes only save on form submission
- Successful edit closes modal and refreshes data
- Load indicator while fetching existing data

**Pages with Edit Modals**:
- Creditors Page → Edit Creditor Modal
- Loans Page → Edit Loan Modal
- Payments Page → Edit Payment Modal

**Edit Capabilities**:
- **Creditor**: All fields editable (name, contact, email, address, notes)
- **Loan**: All fields editable with auto-recalculation of financial values
- **Payment**: Loan selection, amount, date, method, reference, notes editable

---

### 4. Delete Modal (Confirmation)

**Purpose**: Confirm deletion before permanently removing records

**Trigger**: Delete button (trash icon) in table Actions column

**Features**:
- Red/danger styling to indicate destructive action
- Clear warning message with record identifier
- Confirm button disabled during processing
- "Cancel" option to abort deletion
- Uses soft delete (data marked as deleted, not permanently removed)
- Cannot be undone (user is warned of this)
- Automatic data refresh after successful deletion

**Pages with Delete Modals**:
- Creditors Page → Delete Creditor Modal
- Loans Page → Delete Loan Modal
- Payments Page → Delete Payment Modal

**Delete Confirmations**:

**Delete Creditor**:
- Message: "Are you sure you want to delete [Creditor Name]? This action cannot be undone."
- Deletes all associated records via cascade

**Delete Loan**:
- Message: "Are you sure you want to delete loan [Loan Number]? This action cannot be undone."
- Soft delete preserves payment history

**Delete Payment**:
- Message: "Are you sure you want to delete payment [Payment Number]? This action cannot be undone."
- Updates loan remaining balance automatically

---

## Modal UI/UX Patterns

### Modal Structure

Each modal follows a consistent design pattern:

```
┌──────────────────────────────────────┐
│ Title              [X] Close Button   │
│ Subtitle/Description                 │
├──────────────────────────────────────┤
│                                      │
│ Form Content or Display Content      │
│                                      │
├──────────────────────────────────────┤
│                    [Cancel] [Action]  │
└──────────────────────────────────────┘
```

### Modal Sizes

- **Small (sm)**: Confirmation modals (max-width: 384px)
- **Medium (md)**: View and most edit modals (max-width: 448px)
- **Large (lg)**: Complex forms with multiple fields (max-width: 512px)
- **Extra Large (xl)**: Loan forms with calculations (max-width: 672px)

### Modal Backdrop

- Semi-transparent dark overlay (rgba(0, 0, 0, 0.5))
- Clicking backdrop closes modal (except during form submission)
- Prevents interaction with page content behind modal

---

## Form Validation in Modals

All forms use **Zod validation schemas** with real-time feedback:

### Creditor Form Validation
- First Name: Required, min 1 character
- Last Name: Required, min 1 character
- Middle Name: Optional
- Email: Optional but must be valid format if provided
- Contact Number: Optional
- Address: Optional
- Notes: Optional

### Loan Form Validation
- Creditor: Required selection
- Principal: Required, must be > 0
- Interest Per Day: Required, must be > 0.1
- Term Days: Required, must be integer ≥ 1
- Release Date: Required, valid date

### Payment Form Validation
- Loan: Required selection
- Amount: Required, must be > 0
- Payment Date: Required, valid date
- Payment Method: Required, must be one of: Cash, GCash, Bank Transfer, Check
- Reference Number: Optional
- Notes: Optional

---

## Auto-Calculated Fields

### Loan Add/Edit Modal

When creating or editing a loan, the following fields auto-calculate:

- **Daily Interest** = Principal × (Interest Per Day % / 100)
- **Total Interest** = Daily Interest × Term Days
- **Total Payable** = Principal + Total Interest
- **Due Date** = Release Date + Term Days

Calculations display in a highlighted summary section as user fills the form.

### Payment Modal

When adding a payment, the modal displays:
- Remaining Balance for selected loan
- Updates dynamically as loan is selected

---

## State Management for Modals

Each page uses React `useState` hooks to manage modal states:

```typescript
const [addModalOpen, setAddModalOpen] = useState(false);
const [viewId, setViewId] = useState<string | null>(null);
const [editId, setEditId] = useState<string | null>(null);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [selectedName, setSelectedName] = useState('');
```

### Modal Opening/Closing

- **Add Modal**: Opens with empty form, closes on cancel or success
- **View Modal**: Opens with record ID, fetches data via TanStack Query
- **Edit Modal**: Opens with record ID, pre-populates form, closes on cancel or success
- **Delete Modal**: Opens with record ID, closes on cancel or success

---

## API Integration

All modals integrate with backend APIs via TanStack Query mutations:

### Mutation Patterns

```
On Success:
1. Invalidate affected query keys
2. Reset form state
3. Close modal
4. User sees updated data automatically

On Error:
1. Display error message in modal
2. Keep form open for correction
3. User can retry or cancel
```

### Query Invalidation Strategy

- **Add Action**: Invalidates list query (all records refreshed)
- **Edit Action**: Invalidates detail and list queries
- **Delete Action**: Invalidates list query, clears from UI
- **View Action**: Fetches on-demand (no cache pollution)

---

## Accessibility Features

### Keyboard Navigation

- `Escape` key closes modal (except during submission)
- `Tab` navigates through form fields
- `Enter` submits form when appropriate
- `Shift+Tab` navigates backwards

### Focus Management

- Focus trap within modal (doesn't escape to background)
- Focus returns to trigger button after modal closes
- Loading states prevent multiple submissions

### Screen Readers

- Descriptive button labels and aria attributes
- Modal announced as dialog to screen readers
- Form fields properly labeled with `<label>` elements
- Error messages associated with fields

---

## Error Handling

### Form Validation Errors

- Display below each field in red text
- User cannot submit until errors resolved
- Real-time validation as user types (optional)

### API Errors

- Generic message: "Failed to [action] [entity]. Please try again."
- No sensitive server errors exposed
- Suggestions to retry or contact support

### Network Errors

- Modal stays open on network failure
- User can retry without re-entering data
- Loading state cleared to show retry buttons

---

## Mobile Responsiveness

All modals are fully responsive:

- **Mobile (< 640px)**: Modal takes 90% of viewport width, centered
- **Tablet (640px - 1024px)**: Modal at appropriate size, centered
- **Desktop (> 1024px)**: Modal fixed size, centered on screen
- **Touch**: Larger touch targets, easier to tap buttons
- **Landscape**: Scrollable content if form extends beyond viewport

---



Route:

```text
/admin/dashboard
```

## Statistics Cards

Display:

* Total Creditors
* Active Loans
* Total Released Amount
* Total Collections
* Overdue Loans
* Due Today

---

## Charts

Monthly Released Loans

Monthly Collections

Use Recharts.

---

## Recent Activities

Display latest:

* Loan Releases
* Payments Received
* Creditor Creation
* Loan Updates

---

# CREDITOR MANAGEMENT

Route:

```text
/admin/creditors
```

---

## Creditor List Table

Columns:

* ID
* Full Name
* Contact Number
* Address
* Status
* Created Date

Actions:

* View
* Edit
* Archive
* Delete

---

## Search

Search by:

* Name
* Contact Number
* Address

---

## Filters

* Active
* Archived

---

## Add Creditor Form

Fields:

* First Name
* Middle Name
* Last Name
* Contact Number
* Email
* Address
* Notes

Validation required.

---

## Creditor Details Page

Displays:

Personal Information

Loan History

Payment History

Current Active Loans

Outstanding Balance

---

# LOAN MANAGEMENT

Route:

```text
/admin/loans
```

---

# LOAN LIST PAGE

Columns:

* Loan Number
* Borrower
* Principal
* Interest Per Day
* Term
* Release Date
* Due Date
* Status

Actions:

* View
* Edit
* Archive
* Delete

---

# SEARCH

Search by:

* Loan Number
* Borrower
* Status

---

# FILTERS

* Active
* Paid
* Overdue
* Archived

---

# ADD LOAN FORM

## Borrower Information

Field:

* Select Creditor

---

## Loan Details

Fields:

* Principal Amount
* Interest Per Day (%)
* Term (Days)
* Release Date

---

## Auto Computed Fields

System automatically computes:

### Daily Interest

```text
Principal × Interest Rate
```

### Total Interest

```text
Daily Interest × Term Days
```

### Total Payable

```text
Principal + Total Interest
```

### Due Date

```text
Release Date + Term Days
```

---

## Example

Principal:

```text
10,000
```

Interest Per Day:

```text
1%
```

Term:

```text
30 Days
```

Computed:

```text
Daily Interest = 100

Total Interest = 3,000

Total Payable = 13,000
```

---

# LOAN DETAILS PAGE

Displays:

## Borrower Information

* Name
* Contact Number
* Address

---

## Loan Information

* Loan Number
* Principal
* Interest Rate
* Term
* Release Date
* Due Date

---

## Financial Summary

* Principal Amount
* Total Interest
* Total Payable
* Paid Amount
* Remaining Balance

---

## Payment History Table

Columns:

* Date
* Amount
* Payment Method
* Reference Number
* Notes

---

# PAYMENT MANAGEMENT

Route:

```text
/admin/payments
```

---

# PAYMENT LIST TABLE

Columns:

* Payment Number
* Borrower
* Loan Number
* Amount
* Date
* Payment Method

Actions:

* View
* Edit
* Delete

---

# SEARCH

Search by:

* Loan Number
* Borrower
* Reference Number

---

# FILTERS

* Today
* This Week
* This Month

---

# ADD PAYMENT FORM

Fields:

* Loan
* Amount
* Payment Date
* Payment Method
* Reference Number
* Notes

---

# PAYMENT METHODS

* Cash
* GCash
* Bank Transfer
* Check

---

# AUTOMATIC SYSTEM BEHAVIOR

After payment creation:

Update:

* Paid Amount
* Remaining Balance
* Loan Status

---

## Loan Status Rules

If Remaining Balance > 0

```text
Active
```

If Remaining Balance = 0

```text
Paid
```

If Due Date Passed And Balance Exists

```text
Overdue
```

---

# COLLECTIONS PAGE

Route:

```text
/admin/collections
```

Displays:

* Due Today
* Due This Week
* Overdue Loans

Columns:

* Borrower
* Loan Number
* Due Date
* Balance
* Days Overdue

---

# REPORTS PAGE

Route:

```text
/admin/reports
```

Reports:

## Loan Report

Released Loans

## Collection Report

Payments Received

## Overdue Report

Past Due Accounts

---

Export Formats

* PDF
* Excel
* CSV

---

# ARCHIVES PAGE

Route:

```text
/admin/archives
```

Displays archived:

* Creditors
* Loans
* Payments

Actions:

* Restore
* Permanent Delete

---

# SETTINGS PAGE

Route:

```text
/admin/settings
```

Company Information:

* Company Name
* Address
* Contact Number
* Email

---

Loan Defaults

* Default Interest Rate
* Default Term

---

# PROFILE PAGE

Route:

```text
/admin/profile
```

Admin can:

* Update Username
* Change Password
* Update Profile

---

# DATABASE DESIGN

## USERS TABLE

```sql
id UUID PRIMARY KEY

username VARCHAR(100) UNIQUE

password_hash TEXT

role VARCHAR(20)

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## CREDITORS TABLE

```sql
id UUID PRIMARY KEY

first_name VARCHAR(100)

middle_name VARCHAR(100)

last_name VARCHAR(100)

contact_number VARCHAR(50)

email VARCHAR(255)

address TEXT

notes TEXT

status VARCHAR(20)

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## LOANS TABLE

```sql
id UUID PRIMARY KEY

loan_number VARCHAR(50)

creditor_id UUID

principal NUMERIC(12,2)

interest_per_day NUMERIC(5,2)

term_days INTEGER

release_date DATE

due_date DATE

daily_interest NUMERIC(12,2)

total_interest NUMERIC(12,2)

total_payable NUMERIC(12,2)

paid_amount NUMERIC(12,2)

remaining_balance NUMERIC(12,2)

status VARCHAR(20)

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## PAYMENTS TABLE

```sql
id UUID PRIMARY KEY

loan_id UUID

amount NUMERIC(12,2)

payment_date DATE

payment_method VARCHAR(50)

reference_number VARCHAR(255)

notes TEXT

created_at TIMESTAMP
```

---

## ACTIVITY_LOGS TABLE

```sql
id UUID PRIMARY KEY

user_id UUID

module VARCHAR(100)

action VARCHAR(255)

created_at TIMESTAMP
```

---

# STATUS FLOW

Loan Status:

```text
Pending
↓
Released
↓
Active
↓
Paid
```

Alternative:

```text
Active
↓
Overdue
```

---

# API MODULES

Authentication Module

Creditor Module

Loan Module

Payment Module

Collection Module

Report Module

Settings Module

Activity Logs Module

---

# REQUIRED FEATURES

Responsive Design

JWT Authentication

Protected Routes

CRUD Operations

Search Functionality

Filter Functionality

Pagination

Form Validation

Toast Notifications

Activity Logging

Dashboard Analytics

Report Exporting

Loan Computations

Payment Tracking

Remaining Balance Tracking

Archive System

Soft Delete Support

---

# DEPLOYMENT REQUIREMENTS

Frontend:

Render Static Site

Backend:

Render Web Service

Database:

Neon PostgreSQL

Environment Variables:

DATABASE_URL

JWT_SECRET

PORT

NODE_ENV

CORS_ORIGIN

---

# FINAL OBJECTIVE

Build a complete production-ready MFLEX Loan Management System using React, Vite, Node.js, Express, Prisma, Neon PostgreSQL, and Render deployment.

The system must be professional, minimalist, mobile responsive, secure, and optimized for free-tier deployment while providing complete creditor management, loan management, payment tracking, collections monitoring, reporting, and administrative controls.
