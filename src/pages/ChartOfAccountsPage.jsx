import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const ChartOfAccountsPage = () => (
  <SalesCrudPageWithDropdown
    title="Chart of Accounts"
    endpoint="chart-of-accounts"
    requiredField="account_title"
    searchFields={["account_code", "account_title", "group_name"]}
    fields={[
      { name: "account_code", label: "Account Code" },
      { name: "account_title", label: "Account Title" },
      { name: "group_id", label: "Group", type: "dropdown", endpoint: "account-groups", labelKey: "group_name", valueKey: "id" },
      { name: "opening_balance", label: "Opening Balance (PKR)", type: "number" },
    ]}
    displayFields={[
      { name: "account_code", label: "Code" },
      { name: "account_title", label: "Account Title" },
      { name: "group_name", label: "Group" },
      { name: "opening_balance", label: "Opening Balance (PKR)" },
    ]}
  />
);

export default ChartOfAccountsPage;
