import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const AreaPage = () => (
  <SalesCrudPage
    title="Area Configuration"
    endpoint="areas"
    requiredField="area_name"
    searchFields={["area_name", "city", "region_code"]}
    fields={[
      { name: "area_name", label: "Area Name" },
      { name: "city", label: "City" },
      { name: "region_code", label: "Region Code" },
    ]}
  />
);

export default AreaPage;
