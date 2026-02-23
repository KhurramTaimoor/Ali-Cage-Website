import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const CashBookPage = () => (
  <SalesCrudPage
    title="Daily Cash Book"
    endpoint="cash-book"
    requiredField="description"
    searchFields={["description", "entry_date"]}
    fields={[
      { name: "entry_date", label: "Date", type: "date" },
      { name: "description", label: "Description" },
      { name: "cash_in", label: "Cash In (PKR)", type: "number" },
      { name: "cash_out", label: "Cash Out (PKR)", type: "number" },
    ]}
    displayFields={[
      { name: "entry_date", label: "Date" },
      { name: "description", label: "Description" },
      { name: "cash_in", label: "Cash In (PKR)" },
      { name: "cash_out", label: "Cash Out (PKR)" },
      { name: "balance", label: "Balance (PKR)" },
    ]}
  />
);

export default CashBookPage;
