import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const ProductionInvoicePage = () => (
  <SalesCrudPage
    title="Production Invoice"
    endpoint="production-invoices"
    requiredField="batch_no"
    searchFields={["batch_no", "product", "warehouse", "supervisor"]}
    fields={[
      { name: "batch_no", label: "Batch No" },
      { name: "production_date", label: "Production Date", type: "date" },
      { name: "product", label: "Product" },
      { name: "quantity_produced", label: "Quantity Produced", type: "number" },
      { name: "warehouse", label: "Warehouse" },
      { name: "supervisor", label: "Supervisor" },
    ]}
  />
);

export default ProductionInvoicePage;
