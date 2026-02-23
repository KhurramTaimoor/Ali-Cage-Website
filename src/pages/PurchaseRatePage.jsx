import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const PurchaseRatePage = () => (
  <SalesCrudPageWithDropdown
    title="Purchase Rate"
    endpoint="purchase-rates"
    requiredField="supplier_id"
    searchFields={["supplier_name", "product_name", "unit_name"]}
    fields={[
      { name: "supplier_id", label: "Supplier", type: "dropdown", endpoint: "suppliers", labelKey: "name", valueKey: "id" },
      { name: "product_id", label: "Product", type: "dropdown", endpoint: "products", labelKey: "product_name", valueKey: "id" },
      { name: "unit_id", label: "Unit", type: "dropdown", endpoint: "units", labelKey: "unit_name", valueKey: "id" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "effective_date", label: "Effective Date", type: "date" },
    ]}
    displayFields={[
      { name: "supplier_name", label: "Supplier" },
      { name: "product_name", label: "Product" },
      { name: "unit_name", label: "Unit" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "effective_date", label: "Effective Date" },
    ]}
  />
);

export default PurchaseRatePage;
