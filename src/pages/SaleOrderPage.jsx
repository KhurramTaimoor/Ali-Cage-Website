import React from "react";
import SalesCrudPageWithDropdown from "../components/SalesCrudPageWithDropdown";

const SaleOrderPage = () => (
  <SalesCrudPageWithDropdown
    title="Sale Order"
    endpoint="sale-orders"
    requiredField="order_no"
    searchFields={["order_no", "customer_name", "status"]}
    autoCalc={{
      target: "total_amount",
      formula: { type: "multiply", left: "order_qty", right: "rate" },
      precision: 2,
    }}
    fields={[
      { name: "order_no", label: "Order No" },
      { name: "customer_id", label: "Customer", type: "dropdown", endpoint: "customers", labelKey: "customer_name", valueKey: "id" },
      { name: "order_date", label: "Order Date", type: "date" },
      { name: "delivery_date", label: "Delivery Date", type: "date" },
      { name: "order_qty", label: "Order Qty", type: "number" },
      { name: "rate", label: "Rate (PKR)", type: "number" },
      { name: "total_amount", label: "Total Amount (PKR)", type: "number", readOnly: true },
      { name: "status", label: "Status" },
    ]}
    displayFields={[
      { name: "order_no", label: "Order No" },
      { name: "customer_name", label: "Customer" },
      { name: "order_date", label: "Order Date" },
      { name: "delivery_date", label: "Delivery Date" },
      { name: "order_qty", label: "Order Qty" },
      { name: "rate", label: "Rate (PKR)" },
      { name: "total_amount", label: "Total Amount (PKR)" },
      { name: "status", label: "Status" },
    ]}
  />
);

export default SaleOrderPage;
