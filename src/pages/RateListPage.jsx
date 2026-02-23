import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const RateListPage = () => (
  <SalesCrudPage
    title="Rate List"
    endpoint="sales-rates"
    requiredField="product_item"
    searchFields={["product_item", "unit"]}
    fields={[
      { name: "product_item", label: "Product Item" },
      { name: "unit", label: "Unit" },
      { name: "retail_rate", label: "Retail Rate (PKR)", type: "number" },
      { name: "wholesale_rate", label: "Wholesale Rate (PKR)", type: "number" },
      { name: "distributor_rate", label: "Distributor Rate (PKR)", type: "number" },
    ]}
  />
);

export default RateListPage;
