import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const SalesInvoicePage = () => (
  <SalesCrudPageWithDropdown
    title="Sales Invoice"
    endpoint="sales-invoices"
    requiredField="invoice_no"
    searchFields={["invoice_no", "customer_name", "salesman_name"]}
    autoCalc={{
      target: "net_total",
      formula: { type: "subtract", left: "gross_amount", right: "discount" },
      precision: 2,
    }}
    fields={[
      { name: "invoice_no", label: "Invoice No" },
      { name: "customer_id", label: "Customer", type: "dropdown", endpoint: "customers", labelKey: "customer_name", valueKey: "id" },
      { name: "invoice_date", label: "Date", type: "date" },
      { name: "salesman_id", label: "Salesman", type: "dropdown", endpoint: "salesmen", labelKey: "salesman_name", valueKey: "id" },
      { name: "gross_amount", label: "Gross Amount (PKR)", type: "number" },
      { name: "discount", label: "Discount", type: "number" },
      { name: "net_total", label: "Net Total (PKR)", type: "number", readOnly: true },
    ]}
    displayFields={[
      { name: "invoice_no", label: "Invoice No" },
      { name: "customer_name", label: "Customer" },
      { name: "invoice_date", label: "Date" },
      { name: "salesman_name", label: "Salesman" },
      { name: "gross_amount", label: "Gross Amount (PKR)" },
      { name: "discount", label: "Discount" },
      { name: "net_total", label: "Net Total (PKR)" },
    ]}
  />
);

export default SalesInvoicePage;
