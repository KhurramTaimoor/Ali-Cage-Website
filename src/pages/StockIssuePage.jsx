import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const StockIssuePage = () => (
  <SalesCrudPageWithDropdown
    title="Stock Issue"
    endpoint="stock-issue"
    requiredField="issue_no"
    searchFields={["issue_no", "department_name", "product_name"]}
    autoCalc={{
      target: "total",
      formula: { type: "multiply", left: "issued_qty", right: "rate" },
      precision: 2,
    }}
    fields={[
      { name: "issue_no", label: "Issue No" },
      { name: "date", label: "Date", type: "date" },
      { name: "department_id", label: "Department", type: "dropdown", endpoint: "departments", labelKey: "department_name", valueKey: "id" },
      { name: "product_id", label: "Product", type: "dropdown", endpoint: "products", labelKey: "product_name", valueKey: "id" },
      { name: "product_type_id", label: "Product Type", type: "dropdown", endpoint: "product-types", labelKey: "type_name", valueKey: "id" },
      { name: "issued_qty", label: "Issued Qty", type: "number" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "total", label: "Total (PKR)", type: "number", readOnly: true },
      { name: "remarks", label: "Remarks" },
    ]}
    displayFields={[
      { name: "issue_no", label: "Issue No" },
      { name: "date", label: "Date" },
      { name: "department_name", label: "Department" },
      { name: "product_name", label: "Product" },
      { name: "issued_qty", label: "Issued Qty" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "total", label: "Total (PKR)" },
      { name: "remarks", label: "Remarks" },
    ]}
  />
);

export default StockIssuePage;
