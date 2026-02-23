import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const SupplierPage = () => (
  <SalesCrudPage
    title="Supplier Management"
    endpoint="suppliers"
    requiredField="name"
    searchFields={["name", "company_name", "city", "contact"]}
    fields={[
      { name: "name", label: "Supplier Name" },
      { name: "company_name", label: "Company Name" },
      { name: "contact", label: "Phone" },
      { name: "email", label: "Email" },
      { name: "city", label: "City" },
      { name: "opening_balance", label: "Opening Balance (PKR)", type: "number" },
    ]}
  />
);

export default SupplierPage;
