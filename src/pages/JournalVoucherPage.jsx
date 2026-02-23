import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const JournalVoucherPage = () => (
  <SalesCrudPageWithDropdown
    title="Journal Voucher"
    endpoint="journal-vouchers"
    requiredField="voucher_no"
    searchFields={["voucher_no", "account_dr_name", "account_cr_name"]}
    fields={[
      { name: "voucher_no", label: "Voucher No" },
      { name: "voucher_date", label: "Date", type: "date" },
      { name: "account_dr_id", label: "Account (Dr)", type: "dropdown", endpoint: "chart-of-accounts", labelKey: "account_title", valueKey: "id" },
      { name: "account_cr_id", label: "Account (Cr)", type: "dropdown", endpoint: "chart-of-accounts", labelKey: "account_title", valueKey: "id" },
      { name: "amount", label: "Amount (PKR)", type: "number" },
      { name: "narration", label: "Narration" },
    ]}
    displayFields={[
      { name: "voucher_no", label: "Voucher No" },
      { name: "voucher_date", label: "Date" },
      { name: "account_dr_name", label: "Account (Dr)" },
      { name: "account_cr_name", label: "Account (Cr)" },
      { name: "amount", label: "Amount (PKR)" },
      { name: "narration", label: "Narration" },
    ]}
  />
);

export default JournalVoucherPage;
