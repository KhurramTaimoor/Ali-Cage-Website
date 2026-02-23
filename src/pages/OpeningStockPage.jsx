import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const OpeningStockPage = () => (
  <SalesCrudPageWithDropdown
    title="Opening Stock"
    endpoint="opening-stock"
    requiredField="product_id"
    searchFields={["product_name", "warehouse", "category_name"]}
    autoCalc={{
      target: "total_value",
      formula: { type: "multiply", left: "quantity", right: "rate" },
      precision: 2,
    }}
    fields={[
      { name: "product_id", label: "Product", type: "dropdown", endpoint: "products", labelKey: "product_name", valueKey: "id" },
      { name: "product_type_id", label: "Product Type", type: "dropdown", endpoint: "product-types", labelKey: "type_name", valueKey: "id" },
      { name: "category_id", label: "Category", type: "dropdown", endpoint: "categories", labelKey: "category_name", valueKey: "id" },
      { name: "warehouse", label: "Warehouse" },
      { name: "quantity", label: "Quantity", type: "number" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "total_value", label: "Total Value (PKR)", type: "number", readOnly: true },
      { name: "stock_date", label: "Stock Date", type: "date" },
    ]}
    displayFields={[
      { name: "product_name", label: "Product" },
      { name: "type_name", label: "Product Type" },
      { name: "category_name", label: "Category" },
      { name: "warehouse", label: "Warehouse" },
      { name: "quantity", label: "Quantity" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "total_value", label: "Total Value (PKR)" },
      { name: "stock_date", label: "Stock Date" },
    ]}
  />
);

export default OpeningStockPage;
