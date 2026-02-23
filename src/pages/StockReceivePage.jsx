import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const StockReceivePage = () => (
  <SalesCrudPageWithDropdown
    title="Stock Receive"
    endpoint="stock-receive"
    requiredField="grn_no"
    searchFields={["grn_no", "supplier", "warehouse", "product_name"]}
    autoCalc={{
      target: "total",
      formula: { type: "multiply", left: "received_qty", right: "rate" },
      precision: 2,
    }}
    fields={[
      { name: "grn_no", label: "GRN No" },
      { name: "receive_date", label: "Receive Date", type: "date" },
      { name: "supplier", label: "Supplier" },
      { name: "warehouse", label: "Warehouse" },
      { name: "product_id", label: "Product", type: "dropdown", endpoint: "products", labelKey: "product_name", valueKey: "id" },
      { name: "product_type_id", label: "Product Type", type: "dropdown", endpoint: "product-types", labelKey: "type_name", valueKey: "id" },
      { name: "received_qty", label: "Received Qty", type: "number" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "total", label: "Total (PKR)", type: "number", readOnly: true },
    ]}
    displayFields={[
      { name: "grn_no", label: "GRN No" },
      { name: "receive_date", label: "Receive Date" },
      { name: "supplier", label: "Supplier" },
      { name: "warehouse", label: "Warehouse" },
      { name: "product_name", label: "Product" },
      { name: "type_name", label: "Product Type" },
      { name: "received_qty", label: "Received Qty" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "total", label: "Total (PKR)" },
    ]}
  />
);

export default StockReceivePage;
