import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const SalesReturnPage = () => (
  <SalesCrudPageWithDropdown
    title="Sales Return"
    endpoint="sales-returns"
    requiredField="return_no"
    searchFields={["return_no", "invoice_ref", "customer_name", "reason"]}
    autoCalc={{
      target: "return_amount",
      formula: { type: "multiply", left: "return_qty", right: "rate" },
      precision: 2,
    }}
    fields={[
      { name: "return_no", label: "Return No" },
      { name: "invoice_ref", label: "Invoice Ref" },
      { name: "customer_id", label: "Customer", type: "dropdown", endpoint: "customers", labelKey: "customer_name", valueKey: "id" },
      { name: "return_date", label: "Date", type: "date" },
      { name: "return_qty", label: "Return Qty", type: "number" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "return_amount", label: "Return Amount (PKR)", type: "number", readOnly: true },
      { name: "reason", label: "Reason" },
    ]}
    displayFields={[
      { name: "return_no", label: "Return No" },
      { name: "invoice_ref", label: "Invoice Ref" },
      { name: "customer_name", label: "Customer" },
      { name: "return_date", label: "Date" },
      { name: "return_qty", label: "Return Qty" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "return_amount", label: "Return Amount (PKR)" },
      { name: "reason", label: "Reason" },
    ]}
  />
);

export default SalesReturnPage;
