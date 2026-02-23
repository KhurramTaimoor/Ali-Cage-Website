import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const OpeningBalancePage = () => (
  <SalesCrudPageWithDropdown
    title="Opening Balances"
    endpoint="opening-balances"
    requiredField="account_id"
    searchFields={["fiscal_year", "account_title"]}
    fields={[
      { name: "fiscal_year", label: "Fiscal Year" },
      { name: "account_id", label: "Account", type: "dropdown", endpoint: "chart-of-accounts", labelKey: "account_title", valueKey: "id" },
      { name: "entry_date", label: "Date", type: "date" },
      { name: "debit", label: "Debit (PKR)", type: "number" },
      { name: "credit", label: "Credit (PKR)", type: "number" },
    ]}
    displayFields={[
      { name: "fiscal_year", label: "Fiscal Year" },
      { name: "account_title", label: "Account" },
      { name: "entry_date", label: "Date" },
      { name: "debit", label: "Debit (PKR)" },
      { name: "credit", label: "Credit (PKR)" },
    ]}
  />
);

export default OpeningBalancePage;
