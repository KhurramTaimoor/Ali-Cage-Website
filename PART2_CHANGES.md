# Ali Cages ERP — Part 2 Update

This build applies the Part 2 notes/screenshots and the requested reporting, BOM, login, transaction-history and Urdu-print fixes.

## Implemented

- Product Profit / Loss report now supports a date range and calculates net sales after sales returns, with purchase cost adjusted for purchase returns/fallback purchase rates.
- BOM API is aligned with the current BOM screen: structured BOM headers, multiple material lines, wastage/effective quantity, material/labour/total/per-unit costing, edit/delete support, and legacy BOM compatibility.
- Admin-only Transaction History added under Administration. It records Transaction No., Account Name, Entry No., User, Role, Action, Module, Date and Time for successful create/update/delete API actions.
- User login is database-backed. Admin can create/edit/deactivate employee login accounts from User Permissions using username/email/password. Normal users can log in from `/login`; the separate admin gateway also uses the same real backend authentication.
- Accounts > Profiles added for shop/customer profiles with Shop Name, Owner Name, Phone 1, Phone 2, Area, Address, Type, Active/Inactive and Remarks. Includes Edit, Delete, Call, individual Print, search and styled profile printing.
- Sales Invoice: server-generated fixed invoice sequence (`SI-000001` style), real calendar date input, Ship To visible in the list, and highlighted New Invoice button.
- Sales Return: real calendar date input/filter behavior.
- Sales Report: Details mode loads all invoice/return item details on the same report page; print/PDF details mode also contains all detail sections.
- Urdu printing hardened with UTF-8, RTL and Urdu-capable font fallbacks across sales/report/profile and other bilingual print templates.

## Database / deployment

The backend routes safely create/upgrade the new supporting tables on first use. For an explicit database setup, run `backend/PART2_MIGRATION.sql` once on the existing database. Existing data is not intentionally deleted by the migration.

Use the project-root `backend/` folder as the active API backend. The `public/backend/` directory is an older bundled snapshot and has been left untouched to avoid deleting/changing unrelated project history.

For production, set the normal database environment variables plus a strong `AUTH_SECRET`. Optional `ADMIN_EMAIL` and `ADMIN_PASSWORD` can be used for the bootstrap admin account. See `backend/.env.example`.

## Login flow

1. Sign in as admin.
2. Open **Administration > User Permissions**.
3. Select an employee, choose role/access/module permission, enter username/email/password, and save.
4. The employee can then sign in through `/login` with that username/email and password.
5. Admin can deactivate or delete the login from User Permissions.
