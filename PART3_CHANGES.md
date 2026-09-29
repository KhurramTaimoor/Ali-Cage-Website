# Part 3 Changes

## Sales Rate Lists
- Sales Rate page now works as named **Rate Lists** instead of editing one product at a time.
- A single form displays all products with Single, Retail, Wholesale and Distributor rates.
- Product search is available inside the rate-list form.
- Each rate list has an **Assign Customers** action with searchable multi-select customers.
- Customer-specific rate-list assignments are used automatically by Sales Invoice pricing.
- Mobile list view is compact and opens complete information in **View Details** popup.

## Sales Invoice
- Added optional **Due Date** field.
- Desktop list includes Due Date and View Details.
- Mobile invoice list is compact; full invoice details/items open in a popup instead of a very wide list.
- Existing edit, print, delete and auto-rate features remain available.

## Dashboard
- Dashboard styling follows the Camz Cleaning admin pattern: light background, white cards, compact blue actions.
- Added Business Calendar for sales invoices, invoice due dates, purchases, sale-order deliveries and cheque clearances.
- Added Upcoming Payments panel based on invoice due dates and pending cheque clearances.
- Existing dashboard shortcuts remain.

## Database
Run `backend/PART3_MIGRATION.sql` once on an existing database.
The backend also auto-creates/checks the new rate-list assignment table and Sales Invoice due-date column.
