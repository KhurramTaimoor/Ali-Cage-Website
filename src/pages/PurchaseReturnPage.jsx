import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const PurchaseReturnPage = () => (
  <SalesCrudPageWithDropdown
    title="Purchase Return"
    endpoint="purchase-returns"
    requiredField="invoice_id"
    searchFields={["invoice_no", "supplier_name", "reason"]}
    fields={[
      { name: "invoice_id", label: "Purchase Invoice", type: "dropdown", endpoint: "purchase-invoices", labelKey: "invoice_no", valueKey: "id" },
      { name: "return_date", label: "Return Date", type: "date" },
      { name: "total_amount", label: "Total Amount (PKR)", type: "number" },
      { name: "reason", label: "Reason" },
    ]}
    displayFields={[
      { name: "invoice_no", label: "Invoice No" },
      { name: "supplier_name", label: "Supplier" },
      { name: "return_date", label: "Return Date" },
      { name: "total_amount", label: "Amount (PKR)" },
      { name: "reason", label: "Reason" },
    ]}
  />
);

export default PurchaseReturnPage;
