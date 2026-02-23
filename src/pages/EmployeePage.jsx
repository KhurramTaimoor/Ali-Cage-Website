import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const EmployeePage = () => (
  <SalesCrudPageWithDropdown
    title="Employee Registration"
    endpoint="employees"
    requiredField="full_name"
    searchFields={["full_name", "designation", "department_name"]}
    fields={[
      { name: "full_name", label: "Full Name" },
      { name: "father_name", label: "Father Name" },
      { name: "cnic", label: "CNIC" },
      { name: "phone", label: "Phone" },
      { name: "designation", label: "Designation" },
      { name: "department_id", label: "Department", type: "dropdown", endpoint: "departments", labelKey: "department_name", valueKey: "id" },
      { name: "joining_date", label: "Joining Date", type: "date" },
      { name: "basic_salary", label: "Basic Salary (PKR)", type: "number" },
    ]}
    displayFields={[
      { name: "full_name", label: "Full Name" },
      { name: "father_name", label: "Father Name" },
      { name: "cnic", label: "CNIC" },
      { name: "phone", label: "Phone" },
      { name: "designation", label: "Designation" },
      { name: "department_name", label: "Department" },
      { name: "joining_date", label: "Joining Date" },
      { name: "basic_salary", label: "Basic Salary (PKR)" },
    ]}
  />
);

export default EmployeePage;
