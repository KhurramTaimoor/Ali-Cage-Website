import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const SalesmanPage = () => (
  <SalesCrudPage
    title="Salesman"
    endpoint="salesmen"
    requiredField="salesman_name"
    searchFields={["salesman_name", "assigned_area", "phone"]}
    fields={[
      { name: "salesman_name", label: "Salesman Name" },
      { name: "phone", label: "Phone" },
      { name: "cnic", label: "CNIC" },
      { name: "assigned_area", label: "Assigned Area" },
      { name: "commission", label: "Commission %", type: "number" },
    ]}
  />
);

export default SalesmanPage;
