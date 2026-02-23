import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const EmployeeRatePage = () => (
  <SalesCrudPageWithDropdown
    title="Employee Rate"
    endpoint="employee-rates"
    requiredField="employee_id"
    searchFields={["employee_name", "rate_type"]}
    fields={[
      { name: "employee_id", label: "Employee", type: "dropdown", endpoint: "employees", labelKey: "full_name", valueKey: "id" },
      { name: "rate_type", label: "Rate Type" },
      { name: "amount", label: "Amount (PKR)", type: "number" },
      { name: "effective_date", label: "Effective Date", type: "date" },
    ]}
    displayFields={[
      { name: "employee_name", label: "Employee" },
      { name: "rate_type", label: "Rate Type" },
      { name: "amount", label: "Amount (PKR)" },
      { name: "effective_date", label: "Effective Date" },
    ]}
  />
);

export default EmployeeRatePage;
