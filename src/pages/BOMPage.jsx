import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const BOMPage = () => (
  <SalesCrudPageWithDropdown
    title="Bill of Materials (BOM)"
    endpoint="bom"
    requiredField="product_name"
    searchFields={["product_name", "raw_material", "bom_type"]}
    autoCalc={{
      target: "total",
      formula: { type: "multiply", left: "qty", right: "rate" },
      precision: 2,
    }}
    fields={[
      { name: "product_name", label: "Product Name" },
      { name: "product_category_id", label: "Product Category", type: "dropdown", endpoint: "categories", labelKey: "category_name", valueKey: "id" },
      { name: "bom_type", label: "BOM Type/Category" },
      { name: "batch_size", label: "Batch Size", type: "number" },
      { name: "raw_material", label: "Raw Material" },
      { name: "qty", label: "Qty", type: "number" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "total", label: "Total (PKR)", type: "number", readOnly: true },
      { name: "labor_cost", label: "Labor Cost (PKR)", type: "number" },
    ]}
    displayFields={[
      { name: "product_name", label: "Product Name" },
      { name: "category_name", label: "Category" },
      { name: "bom_type", label: "BOM Type" },
      { name: "batch_size", label: "Batch Size" },
      { name: "raw_material", label: "Raw Material" },
      { name: "qty", label: "Qty" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "total", label: "Total (PKR)" },
      { name: "labor_cost", label: "Labor Cost (PKR)" },
    ]}
  />
);

export default BOMPage;
