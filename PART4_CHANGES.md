# Ali Cages ERP — Part 4

## Camz Cleaning unified design language
- Protected ERP pages now use the Camz palette: navy `#0C2134`, accent blue `#4A86F7`, white cards and `#F7F9FC` canvas.
- Sidebar, page headers, cards, buttons, inputs, tables, forms and popups share one visual system.
- Legacy indigo/blue screens are normalized to the same Camz blue.
- Mobile spacing, form controls and modal containment are standardized.
- Dashboard calendar boxes are more compact.

## Sales rate-list workflow
- Customer-to-rate-list assignment remains the default workflow.
- Sales Invoice now has a Rate List selector.
- `Auto / Customer Assigned` uses the customer assignment as before.
- Any named list can be selected on an invoice to override the default rate source.
- Invoice override also works for General Ledger, Supplier or Employee party types, solving the old issue where those accounts could not pick customer-assigned rates.
- The chosen invoice rate list is stored in `sales_invoices.rate_list_name`.

## Database
Run `backend/PART4_MIGRATION.sql` on an existing Part 3 database. The backend also self-checks and adds the column when possible.
