import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const CustomerPage = () => (
  <SalesCrudPage
    title="Customer Management"
    endpoint="customers"
    requiredField="customer_name"
    searchFields={["customer_name", "city", "phone"]}
    fields={[
      { name: "customer_name", label: "Customer Name" },
      { name: "phone", label: "Phone Number" },
      { name: "city", label: "City" },
      { name: "address", label: "Address" },
      { name: "credit_limit", label: "Credit Limit (PKR)", type: "number" },
    ]}
  />
);

export default CustomerPage;
