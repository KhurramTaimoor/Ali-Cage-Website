import React from "react";
import SalesCrudPage from "../components/SalesCrudPage";

const RetailerPage = () => (
  <SalesCrudPage
    title="Retailer"
    endpoint="retailers"
    requiredField="shop_name"
    searchFields={["shop_name", "owner_name", "city", "zone"]}
    fields={[
      { name: "shop_name", label: "Shop Name" },
      { name: "owner_name", label: "Owner Name" },
      { name: "contact", label: "Contact" },
      { name: "city", label: "City" },
      { name: "zone", label: "Zone" },
    ]}
  />
);

export default RetailerPage;
