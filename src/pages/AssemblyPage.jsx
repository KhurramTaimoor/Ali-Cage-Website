import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const AssemblyPage = () => (
  <SalesCrudPage
    title="Assembly"
    endpoint="assembly"
    requiredField="assembly_no"
    searchFields={["assembly_no", "product_name", "warehouse"]}
    fields={[
      { name: "assembly_no", label: "Assembly No" },
      { name: "product_name", label: "Product Name" },
      { name: "bom_ref", label: "BOM Ref" },
      { name: "assembly_date", label: "Assembly Date", type: "date" },
      { name: "qty_assembled", label: "Qty Assembled", type: "number" },
      { name: "warehouse", label: "Warehouse" },
      { name: "remarks", label: "Remarks" },
    ]}
  />
);

export default AssemblyPage;
