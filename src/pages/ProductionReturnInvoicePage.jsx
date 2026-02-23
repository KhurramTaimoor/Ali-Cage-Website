import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const ProductionReturnInvoicePage = () => (
  <SalesCrudPage
    title="Production Return Invoice"
    endpoint="production-returns"
    requiredField="return_no"
    searchFields={["return_no", "batch_no", "product", "warehouse", "reason"]}
    fields={[
      { name: "return_no", label: "Return No" },
      { name: "return_date", label: "Return Date", type: "date" },
      { name: "batch_no", label: "Batch No" },
      { name: "product", label: "Product" },
      { name: "quantity_returned", label: "Quantity Returned", type: "number" },
      { name: "warehouse", label: "Warehouse" },
      { name: "reason", label: "Reason" },
    ]}
  />
);

export default ProductionReturnInvoicePage;
