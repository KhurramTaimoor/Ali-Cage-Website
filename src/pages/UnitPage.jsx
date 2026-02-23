import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const UnitPage = () => (
  <SalesCrudPage
    title="Unit Setup"
    endpoint="units"
    requiredField="unit_name"
    searchFields={["unit_name", "symbol"]}
    fields={[
      { name: "unit_name", label: "Unit Name" },
      { name: "symbol", label: "Symbol" },
      { name: "decimal_places", label: "Decimal Places", type: "number" },
    ]}
  />
);

export default UnitPage;
