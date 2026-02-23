import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const CategoryPage = () => (
  <SalesCrudPageWithDropdown
    title="Categories"
    endpoint="categories"
    requiredField="category_name"
    searchFields={["category_name", "type_name", "short_code"]}
    fields={[
      { name: "category_name", label: "Category Name" },
      { name: "product_type_id", label: "Product Type", type: "dropdown", endpoint: "product-types", labelKey: "type_name", valueKey: "id" },
      { name: "description", label: "Description" },
    ]}
    displayFields={[
      { name: "category_name", label: "Category Name" },
      { name: "type_name", label: "Product Type" },
      { name: "short_code", label: "Short Code" },
      { name: "description", label: "Description" },
    ]}
  />
);

export default CategoryPage;
