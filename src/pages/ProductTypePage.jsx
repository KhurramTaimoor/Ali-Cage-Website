import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const ProductTypePage = () => (
  <SalesCrudPage
    title="Product Type"
    endpoint="product-types"
    requiredField="type_name"
    searchFields={["type_code", "type_name", "short_code"]}
    fields={[
      { name: "type_code", label: "Type Code" },
      { name: "type_name", label: "Type Name" },
      { name: "short_code", label: "Short Code" },
    ]}
  />
);

export default ProductTypePage;
