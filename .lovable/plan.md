

# Complete Data Import, Editable Entries, and Login System

## Overview

This plan covers four major changes:
1. Clear all test data and import real Excel data (129 drugs, 9 months)
2. Allow blank/optional batch numbers on entries
3. Make transactions and batches editable throughout the app
4. Add a login page with default credentials

---

## Part 1: Database Changes

### Migration 1 -- Clear existing data
Delete all rows from `transactions`, `drug_batches`, and `activity_log` tables to remove test data.

### Migration 2 -- Make batch fields nullable
Allow `batch_number`, `mfg_date`, and `exp_date` in `drug_batches` to be NULL so entries can be saved without batch details and edited later.

Also update the `validate_batch_dates` trigger to skip validation when dates are NULL.

### Migration 3 -- Import drugs and monthly transactions
This is the largest migration. It will:
- Insert all 129 drugs from the Excel with correct names and categories (tablet, capsule, liquid, injectable, topical, respiratory, other)
- For each drug, insert monthly summary transactions (one per month where there was activity) across July 2025 to March 2026
- Each monthly transaction will have: opening stock, total received, total used, and final closing stock for that month
- The `batch_id` will be left NULL (blank) so batch numbers can be added later via editing

The final closing stock for each drug will match the Excel's March 2026 "Final Close" column exactly.

**Sample of final stock levels from Excel:**
| Drug | Final Stock |
|------|------------|
| Albendazole Tablets IP 400 mg | 497 |
| Amoxycillin Cap IP 500mg | 813 |
| Chlorpheniramine Maleate Tab IP 4mg | 349 |
| Paracetamol Tab IP 500 mg | 1,216 |
| Ibuprofen Tab IP 200 mg (Coated) | 1,273 |
| Levoceitrizine Tablet 5mg | 840 |
| Omeprazole Cap IP 20 mg | 940 |

---

## Part 2: Allow Blank Batch Numbers

**Modified file: `src/pages/DailyEntry.tsx`**
- Remove the requirement for batch number, mfg_date, and exp_date when creating a new batch
- Allow submitting with "Add New Batch" selected but with empty batch details -- a placeholder batch is created
- Show a note saying "Batch details can be added later"

**Modified file: `src/hooks/useBatches.ts`**
- Update the `useAddBatch` mutation types to accept optional `batch_number`, `mfg_date`, and `exp_date`

---

## Part 3: Make Entries Editable

### New hook: `useUpdateTransaction`
**Modified file: `src/hooks/useTransactions.ts`**
- Add a new mutation `useUpdateTransaction` to update transaction fields (received, used, closing_stock, batch_id, remarks)
- Auto-recalculates closing_stock as opening_stock + received - used

### Editable Daily Report
**Modified file: `src/pages/Reports.tsx`**
- Add an "Edit" button (pencil icon) on each transaction row in the Daily Report tab
- Clicking Edit opens a dialog with editable fields:
  - Batch Number (text input -- updates the linked batch or creates a new one)
  - Received quantity
  - Used quantity
  - Remarks
  - Closing stock auto-recalculates
- Save button updates both the transaction and batch records

### Editable Inventory Batches
**Modified file: `src/pages/Inventory.tsx`**
- Where batch numbers are displayed, show an editable input for batches with blank/empty batch_number
- Allow inline editing of batch_number, mfg_date, and exp_date

---

## Part 4: Login Page

### Approach
Simple client-side authentication using localStorage with hardcoded credentials:
- **User ID:** AAMSHIVNAGARI
- **Password:** Cho@123

### New files

**`src/pages/Login.tsx`**
- Clean login form with username and password fields
- Title: "AAM Shivnagri HSC - Drug Inventory System"
- Validates against hardcoded credentials
- On success, stores auth flag in localStorage and redirects to dashboard

**`src/hooks/useAuth.ts`**
- `useAuth()` hook returning `{ isAuthenticated, login, logout }`
- `login(username, password)` returns true/false
- `logout()` clears localStorage and redirects to /login

**`src/components/layout/AuthGuard.tsx`**
- Wrapper component that checks auth state
- Redirects to `/login` if not authenticated
- Wraps children if authenticated

### Modified files

**`src/App.tsx`**
- Add `/login` route
- Wrap all other routes with `AuthGuard`

**`src/components/layout/Sidebar.tsx`**
- Add a "Logout" button at the bottom of the sidebar
- Calls `logout()` from `useAuth`

---

## Technical Details

### Data Import Strategy
The Excel contains 129 drugs with daily data across 9 months. Rather than importing ~270 days x 129 drugs of mostly empty rows, we will insert one transaction per month per drug where there was actual activity. Each monthly transaction stores the monthly summary (Total Received, Total Used, Final Close) from the Excel.

For drugs with zero activity across all months (no stock received or used), we skip transaction insertion entirely -- those drugs will show 0 stock, matching the Excel.

The SQL migration will use a large INSERT statement with all the drug names matched to their categories, followed by transaction inserts referencing those drugs by name lookup.

### File Change Summary
| File | Change |
|------|--------|
| `src/pages/Login.tsx` | New -- Login form |
| `src/hooks/useAuth.ts` | New -- Auth hook |
| `src/components/layout/AuthGuard.tsx` | New -- Auth guard |
| `src/App.tsx` | Add login route, wrap routes with AuthGuard |
| `src/components/layout/Sidebar.tsx` | Add logout button |
| `src/pages/DailyEntry.tsx` | Allow blank batch details |
| `src/pages/Reports.tsx` | Add edit functionality to daily report |
| `src/hooks/useTransactions.ts` | Add useUpdateTransaction mutation |
| `src/hooks/useBatches.ts` | Update types for nullable fields |
| Database migrations (x3) | Clear data, alter schema, import data |

