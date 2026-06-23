import React, { useState, useEffect, useMemo, useCallback } from "react";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

const fetchAllOrders = () => apiFetch("/api/sale-orders");
const fetchCategories = () => apiFetch("/api/categories");
const fetchUnits = () => apiFetch("/api/units");
const fetchProducts = () => apiFetch("/api/products");
const fetchTypes = () => apiFetch("/api/product-types");
const fetchCustomers = () => apiFetch("/api/customers");
const fetchEmployees = () => apiFetch("/api/employees");
const fetchSuppliers = () => apiFetch("/api/suppliers");
const fetchGeneralLedgers = () => apiFetch("/api/general-ledgers");

const createOrder = (data) =>
  apiFetch("/api/sale-orders", { method: "POST", body: JSON.stringify(data) });

const updateOrder = (id, data) =>
  apiFetch(`/api/sale-orders/${id}`, { method: "PUT", body: JSON.stringify(data) });

const deleteOrder = (id) => apiFetch(`/api/sale-orders/${id}`, { method: "DELETE" });

const createSalesInvoice = (data) =>
  apiFetch("/api/sales-invoices", { method: "POST", body: JSON.stringify(data) });

async function translateText(text) {
  if (!text || !String(text).trim()) return text;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      String(text).trim()
    )}&langpair=en|ur`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.toLowerCase() === String(text).trim().toLowerCase()) {
      return text;
    }
    return translated;
  } catch {
    return text;
  }
}

const LANG = {
  en: {
    title: "Sale Order",
    subtitle: "Manage sale orders and convert them to sales invoices",
    addBtn: "New Order",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by order no, party, product, category, unit or status…",
    orderNo: "Order No",
    referenceNo: "Reference No",
    partyType: "Customer Type",
    selectPartyType: "-- Select Customer Type --",
    partyName: "Name",
    selectPartyName: "-- Select Name --",
    partyTypeCustomer: "Customer",
    partyTypeEmployee: "Employee",
    partyTypeGeneralLedger: "General Ledger",
    partyTypeSupplier: "Supplier",
    shipmentTo: "Shipment To",
    previousBalance: "Previous Balance",
    discount: "Discount",
    deliveryCharges: "Delivery Charges",
    addDeliveryCharges: "Add Delivery Charges",
    removeDeliveryCharges: "Remove",
    productType: "Product Type",
    category: "Category",
    product: "Product Name",
    unit: "Unit",
    selectType: "-- Select Product Type --",
    selectCategory: "-- Select Category --",
    selectProduct: "-- Select Product --",
    selectUnit: "-- Select Unit --",
    orderDate: "Order Date",
    deliveryDate: "Delivery Date",
    orderQty: "Order Qty",
    rate: "Rate",
    totalAmount: "Total Amount",
    grandTotal: "Grand Total",
    lineTotal: "Line Total",
    debit: "Debit",
    credit: "Credit",
    status: "Status",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    printSlip: "Print / Save PDF",
    changeToInvoice: "Change to Invoice",
    changeToInvoiceConfirm: "Do you want to create a sales invoice from this sale order?",
    invoiceCreated: "Sales invoice created successfully!",
    invoiceCreateError: "Could not convert order to sales invoice.",
    noRecords: "No orders found.",
    toggleLang: "اردو",
    translating: "Translating to Urdu…",
    actions: "Actions",
    autoCalcNote: "Auto-calculated",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    loadingOrders: "Loading orders...",
    fetchError: "Failed to load orders.",
    saveError: "Error saving record!",
    deleteError: "Error deleting record!",
    errorMsg: "Order No, Customer Type, Name, and at least one Product are required.",
    successSave: "Order saved successfully!",
    successDelete: "Order deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this order?",
    totalOrders: "Total Orders",
    totalPending: "Pending",
    totalCompleted: "Completed",
    totalCancelled: "Cancelled",
    totalValue: "Total Value",
    slipTitle: "Sale Order Receipt",
    slipOrderNo: "Order No",
    slipPartyType: "Customer Type",
    slipPartyName: "Name",
    slipRefNo: "Reference No",
    slipShipmentTo: "Shipment To",
    slipProduct: "Product",
    slipUnit: "Unit",
    slipOrderDate: "Order Date",
    slipDeliveryDate: "Delivery Date",
    slipQty: "Order Qty",
    slipRate: "Rate",
    slipTotal: "Total Amount",
    slipLineTotal: "Line Total",
    slipDebit: "Debit",
    slipCredit: "Credit",
    slipStatus: "Status",
    slipDate: "Generated",
    slipThank: "Thank you for your order!",
    addProductRow: "Add Product Row",
    removeProductRow: "Remove",
    itemGroup: "Product Row",
    orderNoPlaceholder: "e.g. SO-001",
    shipmentPlaceholder: "e.g. Lahore Warehouse",
    itemsLabel: "items",
    filterAll: "All",
    filter24h: "Last 24 Hours",
    filter7d: "Last 7 Days",
    filterMonth: "This Month",
    filterLabel: "Filter:",
    companyName: "Ali Cages",
    totalLabel: "Total",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
    lineItemsTitle: "Products / Line Items",
    lineItemsSubtitle: "Add one or more products with category, unit, quantity and rate",
    totalsTitle: "Order Totals",
    totalsSubtitle: "Grand total updates automatically when quantity, delivery or discount changes",
    paymentTitle: "Payment Details",
    paymentSubtitle: "Enter payment method and paid amount; remaining balance is auto-calculated",
    paymentMethod: "Payment Method",
    selectPaymentMethod: "-- Select Payment Method --",
    cash: "Cash",
    bank: "Bank",
    jazzCash: "JazzCash",
    easypaisa: "EasyPaisa",
    cheque: "Cheque",
    otherPayment: "Other",
    paidAmount: "Paid Amount",
    remainingBalance: "Remaining Balance",
    paymentStatus: "Payment Status",
    paid: "Paid",
    partial: "Partial",
    unpaid: "Unpaid",
    paymentNote: "Payment Note",
    paymentNotePlaceholder: "Optional note / transaction no",
    payment: "Payment",
    slipPaymentMethod: "Payment Method",
    slipPaidAmount: "Paid Amount",
    slipRemainingBalance: "Remaining Balance",
    slipPaymentStatus: "Payment Status",
    seeDetails: "See Details",
    orderDetails: "Order Details",
    close: "Close",
    products: "Products",
    basicInfo: "Basic Info",
    compactListNote: "Click See Details to view full products and payment information",
  },
  ur: {
    title: "سیل آرڈر",
    subtitle: "سیل آرڈرز بنائیں اور انہیں سیلز انوائس میں تبدیل کریں",
    addBtn: "نیا آرڈر",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "آرڈر نمبر، نام، پروڈکٹ، کیٹیگری، یونٹ یا حالت سے تلاش کریں…",
    orderNo: "آرڈر نمبر",
    referenceNo: "ریفرنس نمبر",
    partyType: "کسٹمر ٹائپ",
    selectPartyType: "-- کسٹمر ٹائپ منتخب کریں --",
    partyName: "نام",
    selectPartyName: "-- نام منتخب کریں --",
    partyTypeCustomer: "گاہک (Customer)",
    partyTypeEmployee: "ملازم (Employee)",
    partyTypeGeneralLedger: "جنرل لیجر (General Ledger)",
    partyTypeSupplier: "سپلائر (Supplier)",
    shipmentTo: "شپمنٹ ٹو",
    previousBalance: "سابقہ رقم",
    discount: "ڈسکاؤنٹ",
    deliveryCharges: "ڈیلیوری چارجز",
    addDeliveryCharges: "ڈیلیوری چارجز شامل کریں",
    removeDeliveryCharges: "ہٹائیں",
    productType: "پروڈکٹ ٹائپ",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    unit: "یونٹ",
    selectType: "-- پروڈکٹ ٹائپ منتخب کریں --",
    selectCategory: "-- کیٹیگری منتخب کریں --",
    selectProduct: "-- پروڈکٹ منتخب کریں --",
    selectUnit: "-- یونٹ منتخب کریں --",
    orderDate: "آرڈر کی تاریخ",
    deliveryDate: "ڈیلیوری کی تاریخ",
    orderQty: "آرڈر مقدار",
    rate: "ریٹ",
    totalAmount: "کل رقم",
    grandTotal: "ٹوٹل بل رقم",
    lineTotal: "آئٹم کل رقم",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    status: "حالت",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    printSlip: "پرنٹ / پی ڈی ایف",
    changeToInvoice: "انوائس بنائیں",
    changeToInvoiceConfirm: "کیا آپ اس سیل آرڈر سے سیلز انوائس بنانا چاہتے ہیں؟",
    invoiceCreated: "سیلز انوائس کامیابی سے بن گئی!",
    invoiceCreateError: "آرڈر کو سیلز انوائس میں تبدیل نہیں کیا جا سکا۔",
    noRecords: "کوئی آرڈر نہیں ملا۔",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    actions: "اقدامات",
    autoCalcNote: "خودکار حساب",
    pending: "زیر التواء",
    completed: "مکمل",
    cancelled: "منسوخ شدہ",
    loadingOrders: "آرڈرز لوڈ ہو رہے ہیں...",
    fetchError: "آرڈرز لوڈ نہیں ہو سکے۔",
    saveError: "ریکارڈ محفوظ کرنے میں خرابی!",
    deleteError: "ریکارڈ حذف کرنے میں خرابی!",
    errorMsg: "آرڈر نمبر، کسٹمر ٹائپ، نام، اور کم از کم ایک پروڈکٹ درکار ہے۔",
    successSave: "آرڈر کامیابی سے محفوظ ہو گیا!",
    successDelete: "آرڈر حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی اس آرڈر کو حذف کرنا چاہتے ہیں؟",
    totalOrders: "کل آرڈرز",
    totalPending: "زیر التواء",
    totalCompleted: "مکمل",
    totalCancelled: "منسوخ",
    totalValue: "کل رقم",
    slipTitle: "سیل آرڈر رسید",
    slipOrderNo: "آرڈر نمبر",
    slipPartyType: "کسٹمر ٹائپ",
    slipPartyName: "نام",
    slipRefNo: "ریفرنس نمبر",
    slipShipmentTo: "شپمنٹ ٹو",
    slipProduct: "پروڈکٹ",
    slipUnit: "یونٹ",
    slipOrderDate: "آرڈر کی تاریخ",
    slipDeliveryDate: "ڈیلیوری کی تاریخ",
    slipQty: "مقدار",
    slipRate: "ریٹ",
    slipTotal: "کل رقم",
    slipLineTotal: "آئٹم کل رقم",
    slipDebit: "ڈیبٹ",
    slipCredit: "کریڈٹ",
    slipStatus: "حالت",
    slipDate: "تیار کردہ",
    slipThank: "آپ کے آرڈر کا شکریہ!",
    addProductRow: "نئی پروڈکٹ لائن",
    removeProductRow: "ہٹائیں",
    itemGroup: "پروڈکٹ لائن",
    orderNoPlaceholder: "مثلاً SO-001",
    shipmentPlaceholder: "مثلاً Lahore Warehouse",
    itemsLabel: "آئٹمز",
    filterAll: "سب",
    filter24h: "آخری 24 گھنٹے",
    filter7d: "آخری 7 دن",
    filterMonth: "یہ مہینہ",
    filterLabel: "فلٹر:",
    companyName: "علی کیجز",
    totalLabel: "کل",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
    lineItemsTitle: "پروڈکٹس / لائن آئٹمز",
    lineItemsSubtitle: "ایک یا زیادہ پروڈکٹس کیٹیگری، یونٹ، مقدار اور ریٹ کے ساتھ شامل کریں",
    totalsTitle: "آرڈر ٹوٹلز",
    totalsSubtitle: "مقدار، ڈیلیوری یا ڈسکاؤنٹ بدلنے پر ٹوٹل خودکار اپڈیٹ ہو گا",
    paymentTitle: "ادائیگی کی تفصیل",
    paymentSubtitle: "پیمنٹ طریقہ اور ادا شدہ رقم درج کریں؛ بقایا رقم خودکار نکلے گی",
    paymentMethod: "پیمنٹ طریقہ",
    selectPaymentMethod: "-- پیمنٹ طریقہ منتخب کریں --",
    cash: "کیش",
    bank: "بینک",
    jazzCash: "جاز کیش",
    easypaisa: "ایزی پیسہ",
    cheque: "چیک",
    otherPayment: "دیگر",
    paidAmount: "ادا شدہ رقم",
    remainingBalance: "بقایا رقم",
    paymentStatus: "پیمنٹ حالت",
    paid: "مکمل ادا",
    partial: "جزوی",
    unpaid: "ادا نہیں",
    paymentNote: "پیمنٹ نوٹ",
    paymentNotePlaceholder: "اختیاری نوٹ / ٹرانزیکشن نمبر",
    payment: "پیمنٹ",
    slipPaymentMethod: "پیمنٹ طریقہ",
    slipPaidAmount: "ادا شدہ رقم",
    slipRemainingBalance: "بقایا رقم",
    slipPaymentStatus: "پیمنٹ حالت",
    seeDetails: "تفصیل دیکھیں",
    orderDetails: "آرڈر کی تفصیل",
    close: "بند کریں",
    products: "پروڈکٹس",
    basicInfo: "بنیادی معلومات",
    compactListNote: "مکمل پروڈکٹس اور پیمنٹ دیکھنے کے لیے تفصیل دیکھیں پر کلک کریں",
  },
};

const PARTY_TYPES = [
  { value: "customer", labelKey: "partyTypeCustomer", icon: "bi-person-fill", color: "sky" },
  { value: "employee", labelKey: "partyTypeEmployee", icon: "bi-person-badge-fill", color: "emerald" },
  { value: "general_ledger", labelKey: "partyTypeGeneralLedger", icon: "bi-journal-bookmark-fill", color: "violet" },
  { value: "supplier", labelKey: "partyTypeSupplier", icon: "bi-truck", color: "amber" },
];

const PAYMENT_METHODS = [
  { value: "Cash", labelKey: "cash", icon: "bi-cash-stack" },
  { value: "Bank", labelKey: "bank", icon: "bi-bank" },
  { value: "JazzCash", labelKey: "jazzCash", icon: "bi-phone" },
  { value: "EasyPaisa", labelKey: "easypaisa", icon: "bi-wallet2" },
  { value: "Cheque", labelKey: "cheque", icon: "bi-credit-card-2-front" },
  { value: "Other", labelKey: "otherPayment", icon: "bi-three-dots" },
];

const emptyOrderItem = () => ({
  product_type_id: "",
  category_id: "",
  product_id: "",
  unit_id: "",
  order_qty: "",
  rate: "",
  debit: "",
  credit: "",
});

const emptyForm = () => ({
  order_no: "",
  reference_no: "",
  party_type: "",
  party_id: "",
  customer_id: "",
  employee_id: "",
  supplier_id: "",
  general_ledger_id: "",
  order_date: new Date().toISOString().slice(0, 10),
  delivery_date: "",
  shipment_to: "",
  previous_balance: "0",
  delivery_charges: "0",
  discount: "0",
  payment_method: "Cash",
  paid_amount: "0",
  remaining_balance: "0",
  payment_status: "Unpaid",
  payment_note: "",
  status: "Pending",
  order_items: [emptyOrderItem()],
});

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getRecordId = (obj) =>
  obj?.id ??
  obj?.value ??
  obj?.customer_id ??
  obj?.employee_id ??
  obj?.supplier_id ??
  obj?.ledger_id ??
  obj?.general_ledger_id ??
  obj?.account_id ??
  "";

const getCustomerName = (obj) =>
  obj?.customer_name || obj?.customer_name_en || obj?.customer_name_ur || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getEmployeeName = (obj) =>
  obj?.employee_name || obj?.employee_name_en || obj?.employee_name_ur || obj?.full_name || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getSupplierName = (obj) =>
  obj?.supplier_name || obj?.supplier_name_en || obj?.supplier_name_ur || obj?.vendor_name || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getLedgerName = (obj) =>
  obj?.ledger_name || obj?.ledger_name_en || obj?.ledger_name_ur || obj?.account_name || obj?.account_title || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getPartyEntityName = (type, obj) => {
  if (type === "employee") return getEmployeeName(obj);
  if (type === "supplier") return getSupplierName(obj);
  if (type === "general_ledger") return getLedgerName(obj);
  return getCustomerName(obj);
};

const getProductName = (p) => p?.name || p?.name_en || p?.product_name || p?.product_name_en || p?.product_item_en || p?.item_name || p?.title || `#${p?.id}`;
const getCategoryName = (c) => c?.name || c?.name_en || c?.category_name || c?.category_name_en || c?.title || `#${c?.id}`;
const getTypeName = (x) => x?.product_type_en || x?.name || x?.name_en || x?.type_name || x?.title || `#${x?.id}`;
const getUnitName = (u) => u?.name || u?.name_en || u?.unit_name || u?.unit_name_en || u?.symbol || u?.title || `#${u?.id}`;

const generateOrderNo = (orders) => {
  let maxNum = 0;
  orders.forEach((o) => {
    const match = String(o.order_no || "").match(/^SO-(\d+)$/i);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return `SO-${String(maxNum + 1).padStart(3, "0")}`;
};

const generateInvoiceNoFromOrder = (order) => `SI-${String(order.order_no || order.id || Date.now()).replace(/\s+/g, "-")}`;

const normalizeOrderItems = (record) => {
  let items = record?.order_items;
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = null;
    }
  }

  if (Array.isArray(items) && items.length) {
    return items.map((item) => ({
      product_type_id: String(item?.product_type_id ?? item?.productTypeId ?? ""),
      category_id: String(item?.category_id ?? item?.categoryId ?? item?.category?.id ?? ""),
      product_id: String(item?.product_id ?? item?.productId ?? item?.product?.id ?? ""),
      unit_id: String(item?.unit_id ?? item?.unitId ?? item?.unit?.id ?? ""),
      order_qty: String(item?.order_qty ?? item?.qty ?? item?.quantity ?? ""),
      rate: String(item?.rate ?? ""),
      debit: String(item?.debit ?? ""),
      credit: String(item?.credit ?? ""),
    }));
  }

  return [emptyOrderItem()];
};

const calcLineTotal = (item) => num(item?.order_qty) * num(item?.rate);
const calcOrderTotal = (items = []) => items.reduce((s, i) => s + calcLineTotal(i), 0);

const calcRemainingBalance = (grandTotal, paidAmount) => Math.max(0, num(grandTotal) - num(paidAmount));

function getPaymentStatusLabel(status, t) {
  if (status === "Paid") return t.paid;
  if (status === "Partial") return t.partial;
  if (status === "Unpaid") return t.unpaid;
  return status || t.unpaid;
}

function getAutoPaymentStatus(paidAmount, grandTotal) {
  const paid = num(paidAmount);
  const grand = num(grandTotal);
  if (paid <= 0) return "Unpaid";
  if (grand > 0 && paid >= grand) return "Paid";
  return "Partial";
}

function getStatusLabel(status, t) {
  if (status === "Pending") return t.pending;
  if (status === "Completed") return t.completed;
  if (status === "Cancelled") return t.cancelled;
  return status || "-";
}


// ─── Shared professional form components ─────────────────────────────────────
function FieldBox({
  label,
  children,
  highlight = false,
  span = 1,
  icon = "",
  helper = "",
  required,
}) {
  const isRequired = required ?? String(label || "").includes("*");
  const cleanLabel = String(label || "").replace("*", "").trim();

  return (
    <div style={{
      gridColumn: `span ${span}`,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 5,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minHeight: 18,
      }}>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          minWidth: 0,
          fontSize: 10.2,
          fontWeight: 850,
          color: "#334155",
          textTransform: "uppercase",
          letterSpacing: "0.55px",
          lineHeight: 1.15,
        }}>
          {icon && (
            <span style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: highlight ? "#dbeafe" : "#f1f5f9",
              color: highlight ? "#1d4ed8" : "#64748b",
              flex: "0 0 auto",
              fontSize: 9.5,
            }}>
              <i className={`bi ${icon}`}></i>
            </span>
          )}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cleanLabel}</span>
          {isRequired && (
            <em style={{
              fontStyle: "normal",
              fontSize: 8.2,
              fontWeight: 900,
              color: "#be123c",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              padding: "1px 5px",
              borderRadius: 999,
              letterSpacing: "0.3px",
              flex: "0 0 auto",
            }}>
              Required
            </em>
          )}
        </label>
        {helper && (
          <span style={{
            fontSize: 9.5,
            fontWeight: 750,
            color: "#64748b",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 999,
            padding: "2px 7px",
            whiteSpace: "nowrap",
          }}>{helper}</span>
        )}
      </div>
      <div style={{
        borderRadius: 10,
        background: highlight ? "#eff6ff" : "transparent",
        boxShadow: highlight ? "0 0 0 4px rgba(59,130,246,0.06)" : "none",
      }}>
        {children}
      </div>
    </div>
  );
}

const compactInputStyle = (isUrdu) => ({
  width: "100%",
  height: 36,
  minHeight: 36,
  border: "1.5px solid #cbd5e1",
  borderRadius: 9,
  padding: "7px 10px",
  fontSize: 12.2,
  fontWeight: 650,
  color: "#0f172a",
  background: "#ffffff",
  outline: "none",
  transition: "border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease",
  textAlign: isUrdu ? "right" : "left",
  fontFamily: "inherit",
  boxShadow: "0 1px 1px rgba(15,23,42,0.035)",
});

const compactReadonlyStyle = () => ({
  width: "100%",
  height: 36,
  minHeight: 36,
  border: "1.5px solid #dbeafe",
  borderRadius: 9,
  padding: "7px 10px",
  fontSize: 12.2,
  color: "#1d4ed8",
  background: "#eff6ff",
  outline: "none",
  textAlign: "right",
  fontWeight: 850,
  fontFamily: "monospace",
  fontVariantNumeric: "tabular-nums",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
});

function StyledInput({ isUrdu, readOnly, style = {}, onFocus, onBlur, ...props }) {
  const [focus, setFocus] = useState(false);
  const base = readOnly ? compactReadonlyStyle() : compactInputStyle(isUrdu);
  return (
    <input
      {...props}
      readOnly={readOnly}
      style={{
        ...base,
        ...style,
        borderColor: readOnly ? "#dbeafe" : focus ? "#2563eb" : (style.borderColor || "#cbd5e1"),
        backgroundColor: props.disabled ? "#f1f5f9" : focus ? "#ffffff" : (style.backgroundColor || style.background || base.background),
        boxShadow: readOnly
          ? base.boxShadow
          : focus
            ? "0 0 0 3px rgba(37,99,235,0.10), 0 1px 2px rgba(15,23,42,0.05)"
            : (style.boxShadow || base.boxShadow),
        opacity: props.disabled ? (style.opacity ?? 0.58) : (style.opacity ?? 1),
        cursor: props.disabled ? "not-allowed" : readOnly ? "default" : "text",
      }}
      onFocus={(e) => { setFocus(true); onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); onBlur?.(e); }}
    />
  );
}

function StyledSelect({ isUrdu, children, style = {}, onFocus, onBlur, ...props }) {
  const [focus, setFocus] = useState(false);
  const base = compactInputStyle(isUrdu);
  return (
    <select
      {...props}
      style={{
        ...base,
        ...style,
        borderColor: focus ? "#2563eb" : (style.borderColor || "#cbd5e1"),
        backgroundColor: props.disabled ? "#f1f5f9" : "#ffffff",
        boxShadow: focus
          ? "0 0 0 3px rgba(37,99,235,0.10), 0 1px 2px rgba(15,23,42,0.05)"
          : (style.boxShadow || base.boxShadow),
        cursor: props.disabled ? "not-allowed" : "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: isUrdu ? "left 10px center" : "right 10px center",
        paddingRight: isUrdu ? "10px" : "30px",
        paddingLeft: isUrdu ? "30px" : "10px",
        opacity: props.disabled ? 0.65 : (style.opacity ?? 1),
      }}
      onFocus={(e) => { setFocus(true); onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); onBlur?.(e); }}
    >
      {children}
    </select>
  );
}

function SectionCard({ title, subtitle, icon, iconBg = "#eef2ff", iconColor = "#2563eb", action, children, isUrdu }) {
  return (
    <section style={{
      background: "#ffffff",
      border: "1px solid #d7deea",
      borderRadius: 14,
      overflow: "visible",
      boxShadow: "0 8px 22px rgba(15,23,42,0.045)",
      display: "block",
      position: "relative",
    }}>
      <div style={{
        padding: "11px 14px",
        borderBottom: "1px solid #e8eef6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        background: "linear-gradient(180deg,#ffffff,#fbfdff)",
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        flexDirection: isUrdu ? "row-reverse" : "row",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flexDirection: isUrdu ? "row-reverse" : "row" }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}>
            <i className={`bi ${icon}`} style={{ color: iconColor, fontSize: 15 }}></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.25px" }}>{title}</h3>
            {subtitle && <p style={{ margin: "4px 0 0", fontSize: 11.2, fontWeight: 550, color: "#64748b", lineHeight: 1.45 }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div
        className="sales-section-body"
        style={{
          padding: 12,
          background: "#ffffff",
          display: "block",
          visibility: "visible",
          opacity: 1,
          height: "auto",
          minHeight: 0,
          maxHeight: "none",
          overflow: "visible",
          position: "relative",
          zIndex: 1,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function AmountBox({ label, value, children, accent = "#0f172a", highlight = false }) {
  return (
    <div style={{
      border: `1px solid ${highlight ? "#93c5fd" : "#dbe3ee"}`,
      borderRadius: 10,
      padding: 10,
      background: highlight ? "linear-gradient(135deg,#eff6ff,#ffffff)" : "#ffffff",
      boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
      minHeight: 82,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: 10,
    }}>
      <label style={{
        fontSize: 9.8,
        fontWeight: 900,
        color: highlight ? "#1d4ed8" : "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
      }}>{label}</label>
      {children || (
        <div style={{ fontSize: 17, fontWeight: 950, color: accent, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.7px" }}>{value}</div>
      )}
    </div>
  );
}

function generateSlipPrint(order, lang, maps, urduCache) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const items = normalizeOrderItems(order);

  const totalAmount = num(order.total_amount) || calcOrderTotal(items);
  const previousBalance = num(order.previous_balance);
  const deliveryCharges = num(order.delivery_charges);
  const discount = num(order.discount);
  const grandTotal = totalAmount + previousBalance + deliveryCharges - discount;
  const paidAmount = num(order.paid_amount);
  const remainingBalance = order.remaining_balance !== undefined && order.remaining_balance !== null
    ? num(order.remaining_balance)
    : calcRemainingBalance(grandTotal, paidAmount);
  const paymentStatus = order.payment_status || getAutoPaymentStatus(paidAmount, grandTotal);
  const paymentMethod = order.payment_method || "Cash";

  const grandDebit = items.reduce((s, i) => s + num(i.debit), 0);
  const grandCredit = items.reduce((s, i) => s + num(i.credit), 0);

  const getVal = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const partyType = order.party_type || order.customer_type || (order.customer_id ? "customer" : "");
  const partyId = order.party_id || order.customer_id || order.employee_id || order.supplier_id || order.general_ledger_id || "";
  const partyTypeObj = PARTY_TYPES.find((p) => p.value === partyType);
  const partyTypeLabel = partyTypeObj ? t[partyTypeObj.labelKey] : "-";
  const partyName = isUrdu
    ? urduCache[`party:${partyType}:${partyId}`] || order.party_name || order.customer_name_en || "-"
    : order.party_name || order.customer_name_en || "-";

  const statusLabel = getStatusLabel(order.status, t);

  const rowsHtml = items
    .map((item, idx) => {
      const lineTotal = calcLineTotal(item);
      return `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>${getVal("product", item.product_id, maps.productMap[item.product_id])}</td>
          <td>${getVal("category", item.category_id, maps.categoryMap[item.category_id])}</td>
          <td>${getVal("product_type", item.product_type_id, maps.typeMap[item.product_type_id])}</td>
          <td class="center">${getVal("unit", item.unit_id, maps.unitMap[item.unit_id])}</td>
          <td class="num">${fmt(item.order_qty || 0)}</td>
          <td class="num">${fmt(item.rate)}</td>
          <td class="num strong violet">${fmt(lineTotal)}</td>
          <td class="num">${fmt(item.debit)}</td>
          <td class="num">${fmt(item.credit)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${order.order_no || "sale-order"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;} body{margin:0;background:#f8fafc;color:#0f172a;font-family:${isUrdu ? "'Noto Nastaliq Urdu',serif" : "'Inter',Arial,sans-serif"};}
    .page{width:100%;min-height:100vh;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 45%,#f8fafc 100%);padding:20px;}
    .sheet{max-width:1400px;margin:0 auto;background:white;border:1px solid #dbeafe;box-shadow:0 12px 40px rgba(15,23,42,.08);border-radius:24px;overflow:hidden;}
    .header{background:linear-gradient(135deg,#0f4c97 0%,#155eaf 65%,#3b82f6 100%);color:white;padding:26px 28px 22px;}
    .header-row{display:flex;align-items:center;justify-content:space-between;gap:20px;}
    .brand h1{margin:0;font-size:30px;font-weight:800}.brand p{margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.82)}
    .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:rgba(255,255,255,.88);line-height:1.8;}
    .content{padding:18px;display:flex;flex-direction:column;gap:14px}.hint{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:14px;padding:12px 14px;font-size:13px;}
    .cards{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.card{border-radius:16px;padding:14px 16px;border:1px solid #dbeafe;background:#f8fafc}.card small{display:block;font-size:12px;color:#64748b;margin-bottom:6px}.card .value{font-size:16px;font-weight:800;color:#0f172a;word-break:break-word;}
    table{width:100%;border-collapse:collapse} thead th{background:#0f4c97;color:white;font-size:12px;padding:12px 10px;border:1px solid #1d4ed8;text-align:${isUrdu ? "right" : "left"};white-space:nowrap} tbody td,tfoot td{border:1px solid #dbeafe;padding:10px;font-size:12px} tbody tr:nth-child(even) td{background:#f8fbff}.center{text-align:center!important}.num{text-align:${isUrdu ? "left" : "right"}!important;white-space:nowrap;font-weight:700;font-family:'Inter',Arial,sans-serif}.strong{font-weight:800}.violet{color:#7c3aed} tfoot td{background:#eaf3ff;font-weight:800;}
    .totals{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.total-box{border-radius:16px;padding:16px 18px;border:1px solid #dbeafe;background:#f8fafc}.total-box.grand{background:#eff6ff;border-color:#bfdbfe}.total-box .label{display:block;font-size:12px;color:#64748b;margin-bottom:8px}.total-box .value{font-size:24px;font-weight:800;color:#0f172a;font-family:'Inter',Arial,sans-serif}.total-box.grand .value{color:#1d4ed8}
    .footer{background:#0f4c97;color:rgba(255,255,255,.9);padding:10px 16px;display:flex;justify-content:space-between;font-size:11px}
    @media print{@page{size:A4 landscape;margin:10mm}body{background:white}.page{padding:0;background:white}.sheet{box-shadow:none;border:none;border-radius:0;max-width:none}.hint{display:none}}
  </style>
</head>
<body>
  <div class="page"><div class="sheet">
    <div class="header"><div class="header-row"><div class="brand"><h1>${t.companyName}</h1><p>${t.slipTitle}</p></div><div class="meta"><div>${t.slipDate}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div><div>${t.slipStatus}: ${statusLabel}</div></div></div></div>
    <div class="content">
      <div class="hint">${t.savePdfHint}</div>
      <div class="cards">
        <div class="card"><small>${t.slipOrderNo}</small><div class="value">${order.order_no || "-"}</div></div>
        <div class="card"><small>${t.slipRefNo}</small><div class="value">${order.reference_no || "-"}</div></div>
        <div class="card"><small>${t.slipPartyType}</small><div class="value">${partyTypeLabel}</div></div>
        <div class="card"><small>${t.slipPartyName}</small><div class="value">${partyName}</div></div>
        <div class="card"><small>${t.slipOrderDate}</small><div class="value">${order.order_date || "-"}</div></div>
        <div class="card"><small>${t.slipDeliveryDate}</small><div class="value">${order.delivery_date || "-"}</div></div>
      </div>
      <div class="cards">
        <div class="card"><small>${t.slipPaymentMethod}</small><div class="value">${paymentMethod}</div></div>
        <div class="card"><small>${t.slipPaymentStatus}</small><div class="value">${getPaymentStatusLabel(paymentStatus, t)}</div></div>
        <div class="card"><small>${t.slipPaidAmount}</small><div class="value">${fmt(paidAmount)}</div></div>
        <div class="card"><small>${t.slipRemainingBalance}</small><div class="value">${fmt(remainingBalance)}</div></div>
        <div class="card" style="grid-column:span 2"><small>${t.slipShipmentTo}</small><div class="value">${order.shipment_to || "-"}</div></div>
      </div>
      <table><thead><tr><th class="center">#</th><th>${t.slipProduct}</th><th>${t.category}</th><th>${t.productType}</th><th class="center">${t.slipUnit}</th><th class="num">${t.slipQty}</th><th class="num">${t.slipRate}</th><th class="num">${t.slipLineTotal}</th><th class="num">${t.slipDebit}</th><th class="num">${t.slipCredit}</th></tr></thead><tbody>${rowsHtml}</tbody><tfoot><tr><td colspan="7"></td><td class="num">${fmt(totalAmount)}</td><td class="num">${fmt(grandDebit)}</td><td class="num">${fmt(grandCredit)}</td></tr></tfoot></table>
      <div class="totals">
        <div class="total-box"><span class="label">${t.totalAmount}</span><div class="value">${fmt(totalAmount)}</div></div>
        <div class="total-box"><span class="label">${t.previousBalance}</span><div class="value">${fmt(previousBalance)}</div></div>
        <div class="total-box"><span class="label">${t.deliveryCharges}</span><div class="value">${fmt(deliveryCharges)}</div></div>
        <div class="total-box"><span class="label">${t.discount}</span><div class="value">${fmt(discount)}</div></div>
        <div class="total-box grand"><span class="label">${t.grandTotal}</span><div class="value">${fmt(grandTotal)}</div></div>
        <div class="total-box"><span class="label">${t.paidAmount}</span><div class="value">${fmt(paidAmount)}</div></div>
        <div class="total-box"><span class="label">${t.remainingBalance}</span><div class="value">${fmt(remainingBalance)}</div></div>
      </div>
    </div>
    <div class="footer"><span>${t.companyName} — ${t.slipThank}</span><span>Page 1 / 1</span></div>
  </div></div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400);<\/script>
</body></html>`;

  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

const SaleOrderPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu ? "'Noto Nastaliq Urdu', serif" : "Helvetica, 'Helvetica Neue', Arial, sans-serif";
  const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1";
  const inputClass = `w-full min-w-0 border border-sky-100 rounded-xl py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "pr-3 pl-3 text-right" : "px-3"}`;
  const readonlyClass = "w-full border border-sky-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-950 bg-sky-50 cursor-not-allowed font-mono text-right";
  const valueClass = "text-slate-950 font-semibold";
  const monoBlack = "font-mono text-slate-950";

  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [generalLedgers, setGeneralLedgers] = useState([]);

  const [urduCache, setUrduCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("24h");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeliveryCharges, setShowDeliveryCharges] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, catsData, unitsData, productsData, typesData, customersData, employeesData, suppliersData, ledgersData] = await Promise.all([
        fetchAllOrders(),
        fetchCategories(),
        fetchUnits(),
        fetchProducts(),
        fetchTypes(),
        fetchCustomers(),
        fetchEmployees(),
        fetchSuppliers(),
        fetchGeneralLedgers(),
      ]);

      setOrders(getList(ordersData));
      setCategories(getList(catsData));
      setUnits(getList(unitsData));
      setProducts(getList(productsData));
      setTypes(getList(typesData));
      setCustomers(getList(customersData));
      setEmployees(getList(employeesData));
      setSuppliers(getList(suppliersData));
      setGeneralLedgers(getList(ledgersData));
    } catch (err) {
      showToast("error", err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[String(p.id)] = getProductName(p);
    });
    return map;
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[String(c.id)] = getCategoryName(c);
    });
    return map;
  }, [categories]);

  const typeMap = useMemo(() => {
    const map = {};
    types.forEach((x) => {
      map[String(x.id)] = getTypeName(x);
    });
    return map;
  }, [types]);

  const unitMap = useMemo(() => {
    const map = {};
    units.forEach((u) => {
      map[String(u.id)] = getUnitName(u);
    });
    return map;
  }, [units]);

  const partyMaps = useMemo(() => {
    const customerMap = {};
    const employeeMap = {};
    const supplierMap = {};
    const ledgerMap = {};

    customers.forEach((c) => {
      const id = getRecordId(c);
      if (id !== "") customerMap[String(id)] = getCustomerName(c) || `#${id}`;
    });

    employees.forEach((e) => {
      const id = getRecordId(e);
      if (id !== "") employeeMap[String(id)] = getEmployeeName(e) || `#${id}`;
    });

    suppliers.forEach((s) => {
      const id = getRecordId(s);
      if (id !== "") supplierMap[String(id)] = getSupplierName(s) || `#${id}`;
    });

    generalLedgers.forEach((l) => {
      const id = getRecordId(l);
      if (id !== "") ledgerMap[String(id)] = getLedgerName(l) || `#${id}`;
    });

    return { customerMap, employeeMap, supplierMap, ledgerMap };
  }, [customers, employees, suppliers, generalLedgers]);

  const selectedPartyData = useMemo(() => {
    if (form.party_type === "employee") return { list: employees, map: partyMaps.employeeMap };
    if (form.party_type === "supplier") return { list: suppliers, map: partyMaps.supplierMap };
    if (form.party_type === "general_ledger") return { list: generalLedgers, map: partyMaps.ledgerMap };
    if (form.party_type === "customer") return { list: customers, map: partyMaps.customerMap };
    return { list: [], map: {} };
  }, [form.party_type, employees, suppliers, generalLedgers, customers, partyMaps]);

  const getPartyLabel = (type, id, fallback = "") =>
    isUrdu ? urduCache[`party:${type}:${id}`] || fallback || "-" : fallback || "-";

  const getOrderPartyType = (o) =>
    o?.party_type || o?.customer_type || (o?.customer_id ? "customer" : o?.employee_id ? "employee" : o?.supplier_id ? "supplier" : o?.general_ledger_id ? "general_ledger" : "");

  const getOrderPartyId = (o) => {
    const type = getOrderPartyType(o);
    if (o?.party_id) return o.party_id;
    if (type === "employee") return o?.employee_id || "";
    if (type === "supplier") return o?.supplier_id || "";
    if (type === "general_ledger") return o?.general_ledger_id || o?.ledger_id || o?.account_id || "";
    return o?.customer_id || "";
  };

  const getOrderPartyName = (o) => {
    const type = getOrderPartyType(o);
    const id = getOrderPartyId(o);
    const mapName =
      type === "employee"
        ? partyMaps.employeeMap[String(id)]
        : type === "supplier"
        ? partyMaps.supplierMap[String(id)]
        : type === "general_ledger"
        ? partyMaps.ledgerMap[String(id)]
        : partyMaps.customerMap[String(id)];

    const fallback = o?.party_name || o?.customer_name || o?.customer_name_en || o?.employee_name || o?.supplier_name || o?.general_ledger_name || o?.ledger_name || o?.account_name || mapName || "";
    return getPartyLabel(type, id, fallback);
  };

  const getTranslatedMapValue = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);

    if (newLang !== "ur") return;
    setTranslating(true);

    try {
      const nextCache = { ...urduCache };

      await Promise.all(
        [
          ...customers.map((x) => ({ type: "customer", id: getRecordId(x), name: getCustomerName(x) })),
          ...employees.map((x) => ({ type: "employee", id: getRecordId(x), name: getEmployeeName(x) })),
          ...suppliers.map((x) => ({ type: "supplier", id: getRecordId(x), name: getSupplierName(x) })),
          ...generalLedgers.map((x) => ({ type: "general_ledger", id: getRecordId(x), name: getLedgerName(x) })),
        ].map(async (p) => {
          if (p.id && p.name && !nextCache[`party:${p.type}:${p.id}`]) {
            nextCache[`party:${p.type}:${p.id}`] = await translateText(p.name);
          }
        })
      );

      await Promise.all(
        products.map(async (p) => {
          const base = getProductName(p);
          if (base && !nextCache[`product:${p.id}`]) nextCache[`product:${p.id}`] = await translateText(base);
        })
      );

      await Promise.all(
        categories.map(async (c) => {
          const base = getCategoryName(c);
          if (base && !nextCache[`category:${c.id}`]) nextCache[`category:${c.id}`] = await translateText(base);
        })
      );

      await Promise.all(
        types.map(async (x) => {
          const base = getTypeName(x);
          if (base && !nextCache[`product_type:${x.id}`]) nextCache[`product_type:${x.id}`] = await translateText(base);
        })
      );

      await Promise.all(
        units.map(async (u) => {
          const base = getUnitName(u);
          if (base && !nextCache[`unit:${u.id}`]) nextCache[`unit:${u.id}`] = await translateText(base);
        })
      );

      setUrduCache(nextCache);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const ensureOrderPrintTranslations = async (order) => {
    if (lang !== "ur") return urduCache;

    const nextCache = { ...urduCache };
    const items = normalizeOrderItems(order);
    const partyType = getOrderPartyType(order);
    const partyId = getOrderPartyId(order);
    const partyName = getOrderPartyName(order);

    if (partyType && partyId && partyName && !nextCache[`party:${partyType}:${partyId}`]) {
      nextCache[`party:${partyType}:${partyId}`] = await translateText(partyName);
    }

    for (const item of items) {
      const productBase = productMap[item.product_id];
      const categoryBase = categoryMap[item.category_id];
      const typeBase = typeMap[item.product_type_id];
      const unitBase = unitMap[item.unit_id];

      if (item.product_id && productBase && !nextCache[`product:${item.product_id}`]) nextCache[`product:${item.product_id}`] = await translateText(productBase);
      if (item.category_id && categoryBase && !nextCache[`category:${item.category_id}`]) nextCache[`category:${item.category_id}`] = await translateText(categoryBase);
      if (item.product_type_id && typeBase && !nextCache[`product_type:${item.product_type_id}`]) nextCache[`product_type:${item.product_type_id}`] = await translateText(typeBase);
      if (item.unit_id && unitBase && !nextCache[`unit:${item.unit_id}`]) nextCache[`unit:${item.unit_id}`] = await translateText(unitBase);
    }

    setUrduCache(nextCache);
    return nextCache;
  };

  const openAdd = () => {
    setForm({ ...emptyForm(), order_no: generateOrderNo(orders) });
    setEditingId(null);
    setShowDeliveryCharges(false);
    setShowForm(true);
  };

  const openEdit = (o) => {
    const partyType = getOrderPartyType(o);
    const partyId = getOrderPartyId(o);
    const dc = num(o.delivery_charges || 0);

    setForm({
      order_no: o.order_no || "",
      reference_no: o.reference_no || "",
      party_type: partyType || "",
      party_id: String(partyId || ""),
      customer_id: partyType === "customer" ? String(partyId || o.customer_id || "") : "",
      employee_id: partyType === "employee" ? String(partyId || o.employee_id || "") : "",
      supplier_id: partyType === "supplier" ? String(partyId || o.supplier_id || "") : "",
      general_ledger_id: partyType === "general_ledger" ? String(partyId || o.general_ledger_id || "") : "",
      order_date: o.order_date || new Date().toISOString().slice(0, 10),
      delivery_date: o.delivery_date || "",
      shipment_to: o.shipment_to || "",
      previous_balance: String(o.previous_balance || 0),
      delivery_charges: String(dc),
      discount: String(o.discount || 0),
      payment_method: o.payment_method || "Cash",
      paid_amount: String(o.paid_amount || 0),
      remaining_balance: String(o.remaining_balance || 0),
      payment_status: o.payment_status || getAutoPaymentStatus(o.paid_amount || 0, o.grand_total || 0),
      payment_note: o.payment_note || "",
      status: o.status || "Pending",
      order_items: normalizeOrderItems(o),
    });

    setShowDeliveryCharges(dc > 0);
    setEditingId(o.id);
    setShowForm(true);
  };

  const updateItemRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addItemRow = () =>
    setForm((prev) => ({ ...prev, order_items: [...prev.order_items, emptyOrderItem()] }));

  const removeItemRow = (index) => {
    setForm((prev) => {
      if (prev.order_items.length === 1) return prev;
      return { ...prev, order_items: prev.order_items.filter((_, i) => i !== index) };
    });
  };

  const formTotal = useMemo(() => calcOrderTotal(form.order_items), [form.order_items]);
  const activeDeliveryCharges = showDeliveryCharges ? num(form.delivery_charges) : 0;
  const formGrandTotal = useMemo(
    () => formTotal + num(form.previous_balance) + activeDeliveryCharges - num(form.discount),
    [formTotal, form.previous_balance, activeDeliveryCharges, form.discount]
  );

  const formPaidAmount = num(form.paid_amount);
  const formRemainingBalance = calcRemainingBalance(formGrandTotal, formPaidAmount);
  const formPaymentStatus = getAutoPaymentStatus(formPaidAmount, formGrandTotal);

  const handlePartyTypeChange = (type) => {
    setForm((f) => ({
      ...f,
      party_type: type,
      party_id: "",
      customer_id: "",
      employee_id: "",
      supplier_id: "",
      general_ledger_id: "",
    }));
  };

  const handlePartyIdChange = (id) => {
    setForm((f) => ({
      ...f,
      party_id: id,
      customer_id: f.party_type === "customer" ? id : "",
      employee_id: f.party_type === "employee" ? id : "",
      supplier_id: f.party_type === "supplier" ? id : "",
      general_ledger_id: f.party_type === "general_ledger" ? id : "",
    }));
  };

  const preparePayload = () => {
    const cleanedItems = form.order_items
      .map((item) => ({
        product_type_id: Number(item.product_type_id) || 0,
        category_id: Number(item.category_id) || 0,
        product_id: Number(item.product_id) || 0,
        unit_id: Number(item.unit_id) || 0,
        order_qty: num(item.order_qty),
        rate: num(item.rate),
        debit: num(item.debit),
        credit: num(item.credit),
      }))
      .filter((item) => item.product_id > 0 && item.order_qty > 0);

    if (!form.order_no.trim() || !form.party_type || !form.party_id || !cleanedItems.length) {
      throw new Error(t.errorMsg);
    }

    const selectedPartyId = Number(form.party_id);
    const selectedPartyName = selectedPartyData.map[String(form.party_id)] || "";
    const totalAmount = calcOrderTotal(cleanedItems);
    const dc = showDeliveryCharges ? num(form.delivery_charges) : 0;

    return {
      order_no: form.order_no.trim(),
      reference_no: form.reference_no.trim(),
      customer_type: form.party_type,
      party_type: form.party_type,
      party_id: selectedPartyId,
      party_name: selectedPartyName,
      customer_name_en: selectedPartyName,
      customer_id: form.party_type === "customer" ? selectedPartyId : null,
      employee_id: form.party_type === "employee" ? selectedPartyId : null,
      supplier_id: form.party_type === "supplier" ? selectedPartyId : null,
      general_ledger_id: form.party_type === "general_ledger" ? selectedPartyId : null,
      order_date: form.order_date || null,
      delivery_date: form.delivery_date || null,
      shipment_to: form.shipment_to || "",
      previous_balance: num(form.previous_balance),
      delivery_charges: dc,
      discount: num(form.discount),
      payment_method: form.payment_method || "Cash",
      paid_amount: formPaidAmount,
      remaining_balance: formRemainingBalance,
      payment_status: formPaymentStatus,
      payment_note: form.payment_note || "",
      status: form.status || "Pending",
      total_amount: totalAmount,
      grand_total: totalAmount + num(form.previous_balance) + dc - num(form.discount),
      order_items: cleanedItems,
    };
  };

  const handleSave = async () => {
    let payload;

    try {
      payload = preparePayload();
    } catch (err) {
      showToast("error", err.message || t.errorMsg);
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await updateOrder(editingId, payload);
        const updated = res?.data || { ...payload, id: editingId };
        setOrders((prev) => prev.map((o) => (o.id === editingId ? updated : o)));
      } else {
        const res = await createOrder(payload);
        const created = res?.data || res || payload;
        setOrders((prev) => [created, ...prev]);
      }

      showToast("success", t.successSave);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      setShowDeliveryCharges(false);
      loadAll();
    } catch (err) {
      showToast("error", err.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setDetailsOrder((current) => (current?.id === id ? null : current));
      showToast("success", t.successDelete);
    } catch (err) {
      showToast("error", err.message || t.deleteError);
    }
  };

  const handleConvertToInvoice = async (order) => {
    if (!window.confirm(t.changeToInvoiceConfirm)) return;

    try {
      const items = normalizeOrderItems(order).filter((item) => Number(item.product_id) > 0 && num(item.order_qty) > 0);

      if (!items.length) {
        showToast("error", t.errorMsg);
        return;
      }

      const partyType = getOrderPartyType(order) || order.party_type || "customer";
      const partyId = Number(getOrderPartyId(order) || order.party_id || 0);
      const invoiceItems = items.map((item, idx) => {
        const qty = num(item.order_qty);
        const rate = num(item.rate);
        const amount = qty * rate;

        return {
          sr: idx + 1,
          category_id: Number(item.category_id) || 0,
          product_id: Number(item.product_id) || 0,
          unit_id: Number(item.unit_id) || 0,
          sale_type: "single",
          carton_qty: 0,
          pieces_qty: 0,
          qty,
          pieces_per_carton: 0,
          rate,
          amount,
        };
      });

      const invoiceTotal = invoiceItems.reduce((sum, item) => sum + num(item.amount), 0);
      const dc = num(order.delivery_charges);
      const previousBalance = num(order.previous_balance);
      const discount = num(order.discount);
      const invoiceGrandTotal = invoiceTotal + previousBalance + dc - discount;
      const paidAmount = num(order.paid_amount);
      const remainingBalance = order.remaining_balance !== undefined && order.remaining_balance !== null
        ? num(order.remaining_balance)
        : calcRemainingBalance(invoiceGrandTotal, paidAmount);
      const paymentStatus = order.payment_status || getAutoPaymentStatus(paidAmount, invoiceGrandTotal);

      const payload = {
        invoice_no: generateInvoiceNoFromOrder(order),
        reference_no: order.reference_no || order.order_no || "",
        customer_type: partyType,
        party_type: partyType,
        party_id: partyId || null,
        party_name: getOrderPartyName(order),
        customer_id: partyType === "customer" ? partyId || null : null,
        employee_id: partyType === "employee" ? partyId || null : null,
        supplier_id: partyType === "supplier" ? partyId || null : null,
        general_ledger_id: partyType === "general_ledger" ? partyId || null : null,
        invoice_date: new Date().toISOString().slice(0, 10),
        shipment_to: order.shipment_to || "",
        previous_balance: previousBalance,
        delivery_charges: dc,
        discount,
        invoice_total: invoiceTotal,
        grand_total: invoiceGrandTotal,
        payment_method: order.payment_method || "Cash",
        paid_amount: paidAmount,
        remaining_balance: remainingBalance,
        payment_status: paymentStatus,
        payment_note: order.payment_note || "",
        sale_order_id: order.id,
        items: invoiceItems,
      };

      await createSalesInvoice(payload);
      showToast("success", t.invoiceCreated);
    } catch (err) {
      showToast("error", err.message || t.invoiceCreateError);
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    let list = orders.filter((o) => {
      if (!o.order_date) return dateFilter === "all";
      const d = new Date(o.order_date);
      if (dateFilter === "24h") return now - d <= 24 * 60 * 60 * 1000;
      if (dateFilter === "7d") return now - d <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return true;
    });

    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((o) => {
      const items = normalizeOrderItems(o);
      return (
        [o.order_no, o.reference_no, getOrderPartyName(o), o.shipment_to, o.status, o.payment_method, o.payment_status, o.payment_note].some((v) => String(v || "").toLowerCase().includes(q)) ||
        items.some((item) =>
          [
            productMap[item.product_id],
            categoryMap[item.category_id],
            typeMap[item.product_type_id],
            unitMap[item.unit_id],
            urduCache[`product:${item.product_id}`],
            urduCache[`category:${item.category_id}`],
            urduCache[`product_type:${item.product_type_id}`],
            urduCache[`unit:${item.unit_id}`],
          ].some((v) => String(v || "").toLowerCase().includes(q))
        )
      );
    });
  }, [orders, search, dateFilter, productMap, categoryMap, typeMap, unitMap, urduCache, partyMaps]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
      value: orders.reduce((s, o) => s + (num(o.total_amount) || calcOrderTotal(normalizeOrderItems(o))), 0),
    }),
    [orders]
  );

  return (
    <div dir={dir} style={{ fontFamily: baseFont, minHeight: "100vh", background: "#f8fafc", paddingBottom: 60 }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .slide-up  { animation: slideUp 0.28s ease-out both; }
        .fade-in   { animation: fadeIn  0.2s ease-out both; }
        .inv-btn { transition:all 0.15s; }
        .inv-btn:hover { transform:translateY(-1px); }
        .filter-btn { transition:all 0.15s; cursor:pointer; border:none; }
        .filter-btn:hover { transform:translateY(-1px); }
        .tbl-row:hover td { background:#f8fafc; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
        .sales-modal-grid-12 {
          display:grid;
          grid-template-columns:repeat(12,minmax(0,1fr));
          gap:10px;
          align-items:start;
        }
        .sales-item-grid {
          padding:12px;
          display:grid;
          grid-template-columns:repeat(12,minmax(0,1fr));
          gap:10px;
          align-items:start;
        }
        .sales-totals-grid {
          display:grid;
          grid-template-columns:repeat(5,minmax(0,1fr));
          gap:10px;
          align-items:stretch;
        }
        .sales-section-body {
          display:block !important;
          visibility:visible !important;
          opacity:1 !important;
          height:auto !important;
          max-height:none !important;
          overflow:visible !important;
        }
        .sales-section-body input,
        .sales-section-body select,
        .sales-section-body textarea {
          display:block !important;
          visibility:visible !important;
          opacity:1 !important;
        }
        @media (max-width:1180px) {
          .sales-modal-grid-12,
          .sales-item-grid { grid-template-columns:repeat(6,minmax(0,1fr)); }
          .sales-totals-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media (max-width:760px) {
          .sales-modal-grid-12,
          .sales-item-grid,
          .sales-totals-grid { grid-template-columns:1fr; }
          .sales-modal-grid-12 > div,
          .sales-item-grid > div { grid-column:span 1 !important; }
        }
      `}</style>


      {message.text && (
        <div className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${message.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>
          <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {message.text}
        </div>
      )}

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Header ── */}
        <div className="slide-up" style={{
          background: "white", borderRadius: 20, border: "1.5px solid #e2e8f0",
          padding: "20px 24px", marginBottom: 20,
          boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, flexDirection: isUrdu ? "row-reverse" : "row" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", margin: 0 }}>{t.title}</h1>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, margin: 0 }}>{t.subtitle}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
              <button onClick={handleLangToggle} disabled={translating} className="inv-btn" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "white", border: "1.5px solid #e2e8f0", color: "#64748b", cursor: translating ? "not-allowed" : "pointer",
                opacity: translating ? 0.65 : 1,
              }}>
                <i className={`bi ${translating ? "bi-arrow-repeat" : "bi-translate"}`}></i>{t.toggleLang}
              </button>
              <button onClick={() => setShowSummary(v => !v)} className="inv-btn" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: showSummary ? "#eef2ff" : "white",
                border: `1.5px solid ${showSummary ? "#c7d2fe" : "#e2e8f0"}`,
                color: showSummary ? "#6366f1" : "#64748b", cursor: "pointer",
              }}>
                <i className="bi bi-bar-chart-line-fill"></i>{t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"}`} style={{ fontSize: 10 }}></i>
              </button>
              <button onClick={openAdd} className="inv-btn" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "#6366f1", color: "white", border: "none", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              }}>
                <i className="bi bi-file-earmark-plus-fill"></i>{t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1.5px solid #f1f5f9" }}>
              {[
                { icon: "bi-receipt-cutoff", label: t.totalOrders,     value: summary.total,     color: "#6366f1", bg: "#eef2ff" },
                { icon: "bi-clock-fill",     label: t.totalPending,    value: summary.pending,   color: "#f59e0b", bg: "#fef3c7" },
                { icon: "bi-check-circle",   label: t.totalCompleted,  value: summary.completed, color: "#10b981", bg: "#d1fae5" },
                { icon: "bi-x-circle",       label: t.totalCancelled,  value: summary.cancelled, color: "#ef4444", bg: "#fee2e2" },
                { icon: "bi-cash-coin",      label: t.totalValue,      value: fmt(summary.value), color: "#0ea5e9", bg: "#e0f2fe" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${s.color}22` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 16 }}></i>
                  </div>
                  <p style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600, marginBottom: 4, margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Search & Filters ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 16, flexDirection: isUrdu ? "row-reverse" : "row" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 380 }}>
            <i className="bi bi-search" style={{ position: "absolute", [isUrdu ? "right" : "left"]: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }}></i>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              style={{
                width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10,
                padding: isUrdu ? "9px 36px 9px 12px" : "9px 12px 9px 34px",
                fontSize: 13, color: "#0f172a", background: "white", outline: "none",
                textAlign: isUrdu ? "right" : "left",
              }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.filterLabel}</span>
            {[
              { key: "24h",   label: t.filter24h,   icon: "bi-clock-history"  },
              { key: "7d",    label: t.filter7d,    icon: "bi-calendar-week"  },
              { key: "month", label: t.filterMonth, icon: "bi-calendar-month" },
              { key: "all",   label: t.filterAll,   icon: "bi-list-ul"        },
            ].map(f => (
              <button key={f.key} onClick={() => setDateFilter(f.key)} className="filter-btn" style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 13px", borderRadius: 9, fontSize: 11.8, fontWeight: 600,
                background: dateFilter === f.key ? "#6366f1" : "white",
                border: `1.5px solid ${dateFilter === f.key ? "#6366f1" : "#e2e8f0"}`,
                color: dateFilter === f.key ? "white" : "#64748b",
                boxShadow: dateFilter === f.key ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
              }}>
                <i className={`bi ${f.icon}`} style={{ fontSize: 12 }}></i>{f.label}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            overflowY: "auto",
            padding: 10,
            background: "rgba(2,6,23,0.62)",
            backdropFilter: "blur(8px)",
          }}>
            <div className="slide-up" dir={dir} style={{
              maxWidth: 1080,
              margin: "0 auto",
              background: "#ffffff",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(226,232,240,0.95)",
              boxShadow: "0 32px 90px rgba(2,6,23,0.38)",
            }}>
              {/* Modal header */}
              <div style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                padding: "12px 16px",
                background: "linear-gradient(135deg,#0f172a 0%,#1e293b 55%,#1d4ed8 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexDirection: isUrdu ? "row-reverse" : "row",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 13,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
                    flex: "0 0 auto",
                  }}>
                    <i className="bi bi-clipboard2-check-fill" style={{ fontSize: 18 }}></i>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.13)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 9.5,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.65px",
                      marginBottom: 4,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: editingId ? "#fbbf24" : "#22c55e" }}></span>
                      {editingId ? "Edit Mode" : "Create Mode"}
                    </div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 950, letterSpacing: "-0.8px", lineHeight: 1.1 }}>
                      {editingId ? t.edit : t.addBtn}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 10.5, color: "rgba(255,255,255,0.68)", fontWeight: 500 }}>
                      {t.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                  <div style={{
                    minWidth: 108,
                    padding: "6px 10px",
                    borderRadius: 11,
                    background: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}>
                    <div style={{ fontSize: 9.5, fontWeight: 900, color: "rgba(255,255,255,0.58)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 3 }}>{t.orderNo}</div>
                    <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{form.order_no || "-"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.10)",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{
                padding: 12,
                paddingBottom: 18,
                background: "#f3f6fb",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto",
              }}>
                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-person-vcard-fill"
                  iconBg="#eef2ff"
                  iconColor="#4f46e5"
                  title="Order Information"
                  subtitle="Select party, reference, order dates and shipment destination"
                >
                  <div className="sales-modal-grid-12">
                    <FieldBox label={`${t.orderNo} *`} icon="bi-hash" span={3} helper="Auto">
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.order_no}
                        onChange={(e) => setForm((f) => ({ ...f, order_no: e.target.value }))}
                        placeholder={t.orderNoPlaceholder}
                        style={{ fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.2px" }}
                      />
                    </FieldBox>

                    <FieldBox label={t.referenceNo} icon="bi-bookmark-check" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.reference_no}
                        onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))}
                        placeholder="e.g. PO-2026-001"
                      />
                    </FieldBox>

                    <FieldBox label={`${t.partyType} *`} icon="bi-diagram-3-fill" span={3}>
                      <StyledSelect
                        isUrdu={isUrdu}
                        value={form.party_type}
                        onChange={(e) => handlePartyTypeChange(e.target.value)}
                      >
                        <option value="">{t.selectPartyType}</option>
                        {PARTY_TYPES.map((p) => (
                          <option key={p.value} value={p.value}>{t[p.labelKey]}</option>
                        ))}
                      </StyledSelect>
                    </FieldBox>

                    <FieldBox label={`${t.partyName} *`} icon="bi-person-check-fill" span={3}>
                      <StyledSelect
                        isUrdu={isUrdu}
                        value={form.party_id}
                        onChange={(e) => handlePartyIdChange(e.target.value)}
                        disabled={!form.party_type}
                      >
                        <option value="">{!form.party_type ? t.selectPartyType : t.selectPartyName}</option>
                        {selectedPartyData.list.map((item) => {
                          const id = getRecordId(item);
                          const name = getPartyEntityName(form.party_type, item) || `#${id}`;
                          return <option key={`${form.party_type}-${id}`} value={id}>{name}</option>;
                        })}
                      </StyledSelect>
                    </FieldBox>

                    <FieldBox label={t.orderDate} icon="bi-calendar2-week" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="date"
                        value={form.order_date}
                        onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))}
                      />
                    </FieldBox>

                    <FieldBox label={t.deliveryDate} icon="bi-calendar-check" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="date"
                        value={form.delivery_date}
                        onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))}
                      />
                    </FieldBox>

                    <FieldBox label={t.status} icon="bi-flag-fill" span={3}>
                      <StyledSelect
                        isUrdu={isUrdu}
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="Pending">{t.pending}</option>
                        <option value="Completed">{t.completed}</option>
                        <option value="Cancelled">{t.cancelled}</option>
                      </StyledSelect>
                    </FieldBox>

                    <FieldBox label={t.shipmentTo} icon="bi-geo-alt-fill" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.shipment_to}
                        onChange={(e) => setForm((f) => ({ ...f, shipment_to: e.target.value }))}
                        placeholder={t.shipmentPlaceholder}
                      />
                    </FieldBox>
                  </div>
                </SectionCard>

                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-box-seam-fill"
                  iconBg="#e0f2fe"
                  iconColor="#0284c7"
                  title={t.lineItemsTitle}
                  subtitle={t.lineItemsSubtitle}
                  action={(
                    <button
                      type="button"
                      onClick={addItemRow}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "none",
                        background: "#0f172a",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: "0 10px 22px rgba(15,23,42,0.18)",
                      }}
                    >
                      <i className="bi bi-plus-lg"></i>{t.addProductRow}
                    </button>
                  )}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {form.order_items.map((item, index) => {
                      const lineTotal = calcLineTotal(item);
                      return (
                        <div key={index} className="row-card" style={{
                          border: "1px solid #dbe3ee",
                          borderRadius: 13,
                          background: "#ffffff",
                          overflow: "visible",
                          transition: "all 0.16s ease",
                          boxShadow: "0 5px 14px rgba(15,23,42,0.035)",
                        }}>
                          <div style={{
                            padding: "9px 12px",
                            borderBottom: "1px solid #edf2f7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            background: "linear-gradient(180deg,#ffffff,#fbfdff)",
                            borderTopLeftRadius: 13,
                            borderTopRightRadius: 13,
                            flexDirection: isUrdu ? "row-reverse" : "row",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                              <span style={{
                                width: 28,
                                height: 28,
                                borderRadius: 10,
                                background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 900,
                                flex: "0 0 auto",
                              }}>{index + 1}</span>
                              <div style={{ minWidth: 0 }}>
                                <h4 style={{ margin: 0, fontSize: 12.2, fontWeight: 950, color: "#0f172a" }}>{t.itemGroup} {index + 1}</h4>
                                <p style={{ margin: "2px 0 0", fontSize: 10.5, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {t.productType}, {t.category}, {t.product}, {t.orderQty}
                                </p>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                              <div style={{
                                minWidth: 74,
                                height: 30,
                                borderRadius: 10,
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#1d4ed8",
                                fontFamily: "monospace",
                                fontSize: 12,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0 10px",
                              }}>
                                {fmt(lineTotal)}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                disabled={form.order_items.length === 1}
                                title={t.removeProductRow}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 10,
                                  border: "1px solid #fee2e2",
                                  background: form.order_items.length === 1 ? "#f8fafc" : "#fff1f2",
                                  color: form.order_items.length === 1 ? "#cbd5e1" : "#ef4444",
                                  cursor: form.order_items.length === 1 ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </div>

                          <div className="sales-item-grid">
                            <FieldBox label={`${t.productType} *`} icon="bi-tags-fill" span={2}>
                              <StyledSelect
                                isUrdu={isUrdu}
                                value={item.product_type_id}
                                onChange={(e) => updateItemRow(index, "product_type_id", e.target.value)}
                              >
                                <option value="">{t.selectType}</option>
                                {types.map((x) => (
                                  <option key={x.id} value={x.id}>{getTypeName(x)}</option>
                                ))}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={`${t.category} *`} icon="bi-grid-fill" span={2}>
                              <StyledSelect
                                isUrdu={isUrdu}
                                value={item.category_id}
                                onChange={(e) => updateItemRow(index, "category_id", e.target.value)}
                              >
                                <option value="">{t.selectCategory}</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
                                ))}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={`${t.product} *`} icon="bi-box-fill" span={2}>
                              <StyledSelect
                                isUrdu={isUrdu}
                                value={item.product_id}
                                onChange={(e) => updateItemRow(index, "product_id", e.target.value)}
                              >
                                <option value="">{t.selectProduct}</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>{getProductName(p)}</option>
                                ))}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={`${t.unit} *`} icon="bi-rulers" span={1}>
                              <StyledSelect
                                isUrdu={isUrdu}
                                value={item.unit_id}
                                onChange={(e) => updateItemRow(index, "unit_id", e.target.value)}
                              >
                                <option value="">{t.selectUnit}</option>
                                {units.map((u) => (
                                  <option key={u.id} value={u.id}>{getUnitName(u)}</option>
                                ))}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={`${t.orderQty} *`} icon="bi-123" span={1}>
                              <StyledInput
                                isUrdu={isUrdu}
                                type="number"
                                value={item.order_qty}
                                onChange={(e) => updateItemRow(index, "order_qty", e.target.value)}
                                style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}
                              />
                            </FieldBox>

                            <FieldBox label={t.rate} icon="bi-currency-dollar" span={1}>
                              <StyledInput
                                isUrdu={isUrdu}
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateItemRow(index, "rate", e.target.value)}
                                style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}
                              />
                            </FieldBox>

                            <FieldBox label={t.lineTotal} icon="bi-calculator-fill" span={1} helper={t.autoCalcNote}>
                              <StyledInput
                                isUrdu={isUrdu}
                                readOnly
                                value={fmt(lineTotal)}
                              />
                            </FieldBox>

                            <FieldBox label={t.debit} icon="bi-arrow-down-left-circle" span={1}>
                              <StyledInput
                                isUrdu={isUrdu}
                                type="number"
                                value={item.debit}
                                onChange={(e) => updateItemRow(index, "debit", e.target.value)}
                                style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}
                              />
                            </FieldBox>

                            <FieldBox label={t.credit} icon="bi-arrow-up-right-circle" span={1}>
                              <StyledInput
                                isUrdu={isUrdu}
                                type="number"
                                value={item.credit}
                                onChange={(e) => updateItemRow(index, "credit", e.target.value)}
                                style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}
                              />
                            </FieldBox>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-calculator-fill"
                  iconBg="#dcfce7"
                  iconColor="#16a34a"
                  title={t.totalsTitle}
                  subtitle={t.totalsSubtitle}
                >
                  <div className="sales-totals-grid">
                    <AmountBox label={t.totalAmount} value={fmt(formTotal)} highlight />

                    <AmountBox label={t.previousBalance}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="number"
                        value={form.previous_balance}
                        onChange={(e) => setForm((f) => ({ ...f, previous_balance: e.target.value }))}
                        style={{ fontSize: 16, fontWeight: 900, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                      />
                    </AmountBox>

                    <AmountBox label={t.deliveryCharges}>
                      {!showDeliveryCharges ? (
                        <button
                          type="button"
                          onClick={() => setShowDeliveryCharges(true)}
                          style={{
                            width: "100%",
                            height: 36,
                            borderRadius: 9,
                            border: "1.5px dashed #cbd5e1",
                            background: "#f8fafc",
                            color: "#1d4ed8",
                            fontSize: 11.5,
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 7,
                          }}
                        >
                          <i className="bi bi-plus-circle-fill"></i>{t.addDeliveryCharges}
                        </button>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => { setShowDeliveryCharges(false); setForm((f) => ({ ...f, delivery_charges: "0" })); }}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 999,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#64748b",
                                fontSize: 10,
                                fontWeight: 900,
                                cursor: "pointer",
                              }}
                            >✕ {t.removeDeliveryCharges}</button>
                          </div>
                          <StyledInput
                            isUrdu={isUrdu}
                            type="number"
                            value={form.delivery_charges}
                            onChange={(e) => setForm((f) => ({ ...f, delivery_charges: e.target.value }))}
                            autoFocus
                            style={{ fontSize: 15, fontWeight: 900, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                          />
                        </div>
                      )}
                    </AmountBox>

                    <AmountBox label={t.discount}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="number"
                        value={form.discount}
                        onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                        style={{ fontSize: 16, fontWeight: 900, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                      />
                    </AmountBox>

                    <div style={{
                      borderRadius: 14,
                      padding: 10,
                      minHeight: 82,
                      background: "linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%)",
                      boxShadow: "0 18px 42px rgba(29,78,216,0.28)",
                      color: "white",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                        <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.76)", textTransform: "uppercase", letterSpacing: "0.7px", margin: 0 }}>{t.grandTotal}</p>
                        <i className="bi bi-stars" style={{ color: "rgba(255,255,255,0.85)", fontSize: 15 }}></i>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 950, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>{fmt(formGrandTotal)}</div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.66)", fontFamily: "monospace", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {fmt(formTotal)}
                        {num(form.previous_balance) !== 0 ? ` + ${fmt(form.previous_balance)}` : ""}
                        {showDeliveryCharges && num(form.delivery_charges) !== 0 ? ` ${num(form.delivery_charges) >= 0 ? "+" : "−"} ${fmt(Math.abs(num(form.delivery_charges)))}` : ""}
                        {num(form.discount) !== 0 ? ` − ${fmt(form.discount)}` : ""}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-wallet2"
                  iconBg="#fef3c7"
                  iconColor="#d97706"
                  title={t.paymentTitle}
                  subtitle={t.paymentSubtitle}
                >
                  <div className="sales-modal-grid-12">
                    <FieldBox label={t.paymentMethod} icon="bi-credit-card-fill" span={3}>
                      <StyledSelect
                        isUrdu={isUrdu}
                        value={form.payment_method}
                        onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                      >
                        <option value="">{t.selectPaymentMethod}</option>
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m.value} value={m.value}>{t[m.labelKey]}</option>
                        ))}
                      </StyledSelect>
                    </FieldBox>

                    <FieldBox label={t.paidAmount} icon="bi-cash-coin" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="number"
                        value={form.paid_amount}
                        onChange={(e) => setForm((f) => ({ ...f, paid_amount: e.target.value }))}
                        style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}
                      />
                    </FieldBox>

                    <FieldBox label={t.remainingBalance} icon="bi-hourglass-split" span={3} helper={t.autoCalcNote}>
                      <StyledInput
                        isUrdu={isUrdu}
                        readOnly
                        value={fmt(formRemainingBalance)}
                      />
                    </FieldBox>

                    <FieldBox label={t.paymentStatus} icon="bi-patch-check-fill" span={3} helper={t.autoCalcNote}>
                      <StyledInput
                        isUrdu={isUrdu}
                        readOnly
                        value={getPaymentStatusLabel(formPaymentStatus, t)}
                        style={{ textAlign: isUrdu ? "right" : "left", fontFamily: "inherit", fontWeight: 900 }}
                      />
                    </FieldBox>

                    <FieldBox label={t.paymentNote} icon="bi-card-text" span={12}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.payment_note}
                        onChange={(e) => setForm((f) => ({ ...f, payment_note: e.target.value }))}
                        placeholder={t.paymentNotePlaceholder}
                      />
                    </FieldBox>
                  </div>
                </SectionCard>
              </div>

              {/* Footer */}
              <div style={{
                position: "sticky",
                bottom: 0,
                zIndex: 5,
                padding: "10px 14px",
                background: "#ffffff",
                borderTop: "1px solid #dbe3ee",
                boxShadow: "0 -14px 38px rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                flexDirection: isUrdu ? "row-reverse" : "row",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#64748b", fontSize: 11.8, fontWeight: 750, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    background: loading ? "#fff7ed" : "#eef2ff",
                    color: loading ? "#ea580c" : "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}>
                    <i className={`bi ${loading ? "bi-arrow-repeat" : "bi-shield-check"}`}></i>
                  </span>
                  <span>{loading ? t.loadingOrders : "Ready to save order"}</span>
                </div>

                <div style={{ display: "flex", gap: 10, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      minWidth: 160,
                      padding: "12px 18px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 900,
                      background: "#ffffff",
                      color: "#334155",
                      border: "1.5px solid #cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={submitting || loading}
                    style={{
                      minWidth: 180,
                      padding: "12px 18px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 900,
                      background: submitting || loading ? "#94a3b8" : "#1d4ed8",
                      color: "white",
                      border: "1.5px solid #1d4ed8",
                      cursor: submitting || loading ? "not-allowed" : "pointer",
                      boxShadow: submitting || loading ? "none" : "0 12px 26px rgba(29,78,216,0.26)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <i className="bi bi-save2-fill"></i>
                    {submitting ? t.saving : editingId ? (isUrdu ? "اپڈیٹ کریں" : "Update Order") : t.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailsOrder && (() => {
          const o = detailsOrder;
          const items = normalizeOrderItems(o);
          const partyType = getOrderPartyType(o);
          const partyTypeObj = PARTY_TYPES.find((p) => p.value === partyType);
          const total = num(o.total_amount) || calcOrderTotal(items);
          const grand = num(o.grand_total) || total + num(o.previous_balance) + num(o.delivery_charges) - num(o.discount);
          const paid = num(o.paid_amount);
          const remaining = o.remaining_balance !== undefined && o.remaining_balance !== null ? num(o.remaining_balance) : calcRemainingBalance(grand, paid);
          const payStatus = o.payment_status || getAutoPaymentStatus(paid, grand);

          return (
            <div className="fade-in" style={{
              position: "fixed",
              inset: 0,
              zIndex: 80,
              background: "rgba(15,23,42,0.42)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 14,
            }}>
              <div style={{
                width: "min(980px, 100%)",
                maxHeight: "92vh",
                overflow: "hidden",
                background: "#ffffff",
                borderRadius: 18,
                border: "1px solid #dbe3ee",
                boxShadow: "0 30px 80px rgba(15,23,42,0.25)",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid #e2e8f0",
                  background: "linear-gradient(180deg,#ffffff,#f8fafc)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexDirection: isUrdu ? "row-reverse" : "row",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 13,
                      background: "#eef2ff",
                      color: "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <i className="bi bi-receipt-cutoff"></i>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 950, color: "#0f172a" }}>{t.orderDetails}</h2>
                      <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: 12, fontWeight: 700 }}>{o.order_no || "-"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailsOrder(null)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div style={{ padding: 16, overflowY: "auto", background: "#f8fafc" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 10,
                    marginBottom: 12,
                  }}>
                    {[
                      { label: t.orderNo, value: o.order_no || "-", icon: "bi-hash" },
                      { label: t.referenceNo, value: o.reference_no || "-", icon: "bi-bookmark-check" },
                      { label: t.partyType, value: partyTypeObj ? t[partyTypeObj.labelKey] : "-", icon: partyTypeObj?.icon || "bi-person-fill" },
                      { label: t.partyName, value: getOrderPartyName(o), icon: "bi-person-check-fill" },
                      { label: t.orderDate, value: o.order_date || "-", icon: "bi-calendar2-week" },
                      { label: t.deliveryDate, value: o.delivery_date || "-", icon: "bi-calendar-check" },
                    ].map((card) => (
                      <div key={card.label} style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: 11,
                        minHeight: 78,
                      }}>
                        <div style={{ display: "flex", gap: 7, alignItems: "center", color: "#64748b", fontSize: 10, fontWeight: 900, textTransform: "uppercase", flexDirection: isUrdu ? "row-reverse" : "row" }}>
                          <i className={`bi ${card.icon}`}></i>
                          {card.label}
                        </div>
                        <div style={{ marginTop: 8, color: "#0f172a", fontSize: 13, fontWeight: 850, wordBreak: "break-word" }}>{card.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}>
                    <div style={{ padding: "11px 13px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isUrdu ? "row-reverse" : "row" }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 950, color: "#0f172a" }}>{t.products}</h3>
                      <span style={{ fontSize: 11, fontWeight: 850, color: "#4f46e5", background: "#eef2ff", borderRadius: 999, padding: "3px 9px" }}>{items.length} {t.itemsLabel}</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                        <thead>
                          <tr style={{ background: "#0f172a" }}>
                            {["#", t.product, t.category, t.productType, t.unit, t.orderQty, t.rate, t.lineTotal].map((h, idx) => (
                              <th key={idx} style={{
                                padding: "10px 9px",
                                color: "rgba(255,255,255,0.82)",
                                fontSize: 10,
                                fontWeight: 800,
                                textAlign: idx === 0 ? "center" : (idx >= 5 ? "right" : (isUrdu ? "right" : "left")),
                                whiteSpace: "nowrap",
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: 9, textAlign: "center", fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>{idx + 1}</td>
                              <td style={{ padding: 9, fontSize: 12, fontWeight: 850, color: "#0f172a" }}>{getTranslatedMapValue("product", item.product_id, productMap[item.product_id] || `#${item.product_id}`)}</td>
                              <td style={{ padding: 9, fontSize: 11.5, color: "#475569" }}>{getTranslatedMapValue("category", item.category_id, categoryMap[item.category_id] || `#${item.category_id}`)}</td>
                              <td style={{ padding: 9, fontSize: 11.5, color: "#475569" }}>{getTranslatedMapValue("product_type", item.product_type_id, typeMap[item.product_type_id] || `#${item.product_type_id}`)}</td>
                              <td style={{ padding: 9, fontSize: 11.5, color: "#475569" }}>{getTranslatedMapValue("unit", item.unit_id, unitMap[item.unit_id] || `#${item.unit_id}`)}</td>
                              <td style={{ padding: 9, textAlign: "right", fontFamily: "monospace", fontSize: 12, fontWeight: 800 }}>{fmt(item.order_qty || 0)}</td>
                              <td style={{ padding: 9, textAlign: "right", fontFamily: "monospace", fontSize: 12, fontWeight: 800 }}>{fmt(item.rate || 0)}</td>
                              <td style={{ padding: 9, textAlign: "right", fontFamily: "monospace", fontSize: 12, fontWeight: 900, color: "#1d4ed8" }}>{fmt(calcLineTotal(item))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 10,
                  }}>
                    {[
                      { label: t.totalAmount, value: fmt(total), color: "#0f172a" },
                      { label: t.previousBalance, value: fmt(o.previous_balance), color: "#0f172a" },
                      { label: t.deliveryCharges, value: fmt(o.delivery_charges), color: "#0f172a" },
                      { label: t.discount, value: fmt(o.discount), color: "#0f172a" },
                      { label: t.grandTotal, value: fmt(grand), color: "#1d4ed8" },
                      { label: t.paymentMethod, value: o.payment_method || "Cash", color: "#0f172a" },
                      { label: t.paidAmount, value: fmt(paid), color: "#059669" },
                      { label: t.remainingBalance, value: fmt(remaining), color: "#dc2626" },
                      { label: t.paymentStatus, value: getPaymentStatusLabel(payStatus, t), color: "#7c3aed" },
                    ].map((box) => (
                      <div key={box.label} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{box.label}</div>
                        <div style={{ marginTop: 7, fontSize: 15, fontWeight: 950, color: box.color, fontFamily: box.label.includes("Amount") || box.label.includes("رقم") || box.label.includes("Total") ? "monospace" : "inherit" }}>{box.value}</div>
                      </div>
                    ))}
                  </div>

                  {o.payment_note && (
                    <div style={{ marginTop: 12, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.paymentNote}</div>
                      <div style={{ marginTop: 7, fontSize: 13, fontWeight: 750, color: "#0f172a" }}>{o.payment_note}</div>
                    </div>
                  )}
                </div>

                <div style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  background: "#ffffff",
                  flexDirection: isUrdu ? "row-reverse" : "row",
                }}>
                  <button type="button" onClick={() => setDetailsOrder(null)} style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#334155", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>{t.close}</button>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
                    <button type="button" onClick={() => { setDetailsOrder(null); openEdit(o); }} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#eef2ff", color: "#4f46e5", fontSize: 12, fontWeight: 900, cursor: "pointer" }}><i className="bi bi-pencil-square"></i> {t.edit}</button>
                    <button type="button" onClick={async () => {
                      let cacheToUse = urduCache;
                      if (lang === "ur") {
                        setTranslating(true);
                        try {
                          const updatedCache = await ensureOrderPrintTranslations(o);
                          if (updatedCache) cacheToUse = updatedCache;
                        } finally { setTranslating(false); }
                      }
                      generateSlipPrint(o, lang, { productMap, categoryMap, typeMap, unitMap }, cacheToUse);
                    }} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#fefce8", color: "#ca8a04", fontSize: 12, fontWeight: 900, cursor: "pointer" }}><i className="bi bi-printer-fill"></i> {t.printSlip}</button>
                    <button type="button" onClick={() => handleConvertToInvoice(o)} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#ecfdf5", color: "#059669", fontSize: 12, fontWeight: 900, cursor: "pointer" }}><i className="bi bi-file-earmark-arrow-up-fill"></i> {t.changeToInvoice}</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Compact Orders Table ── */}
        <div className="slide-up" style={{ background: "white", borderRadius: 12, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 750 }}>{t.compactListNote}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 850 }}>{filtered.length} {t.itemsLabel}</div>
          </div>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {[
                    { k: "no", l: "#", w: "44px", align: "center" },
                    { k: "ord", l: t.orderNo, w: "110px", align: isUrdu ? "right" : "left" },
                    { k: "name", l: t.partyName, w: "22%", align: isUrdu ? "right" : "left" },
                    { k: "date", l: t.orderDate, w: "105px", align: "center" },
                    { k: "grand", l: t.grandTotal, w: "115px", align: "right" },
                    { k: "pay", l: t.payment, w: "135px", align: "center" },
                    { k: "status", l: t.status, w: "105px", align: "center" },
                    { k: "act", l: t.actions, w: "150px", align: "center" },
                  ].map((col) => (
                    <th key={col.k} style={{
                      width: col.w,
                      padding: "11px 8px",
                      textAlign: col.align,
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.76)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}>{col.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
                    <i className="bi bi-arrow-repeat" style={{ fontSize: 24, display: "block", marginBottom: 8, animation: "spin 1s linear infinite" }}></i>
                    <span style={{ fontSize: 13 }}>{t.loadingOrders}</span>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>{t.noRecords}</td></tr>
                ) : (
                  filtered.map((o, i) => {
                    const items = normalizeOrderItems(o);
                    const partyType = getOrderPartyType(o);
                    const partyTypeObj = PARTY_TYPES.find((p) => p.value === partyType);
                    const total = num(o.total_amount) || calcOrderTotal(items);
                    const grand = num(o.grand_total) || total + num(o.previous_balance) + num(o.delivery_charges) - num(o.discount);
                    const paid = num(o.paid_amount);
                    const remaining = o.remaining_balance !== undefined && o.remaining_balance !== null ? num(o.remaining_balance) : calcRemainingBalance(grand, paid);
                    const payStatus = o.payment_status || getAutoPaymentStatus(paid, grand);
                    const payTone = payStatus === "Paid"
                      ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
                      : payStatus === "Partial"
                        ? { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }
                        : { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
                    const statusTone = o.status === "Completed"
                      ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
                      : o.status === "Cancelled"
                        ? { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }
                        : { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };

                    return (
                      <tr key={o.id || i} className="tbl-row" style={{ borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" }}>
                        <td style={{ padding: "11px 8px", textAlign: "center", color: "#94a3b8", fontFamily: "monospace", fontSize: 12 }}>{i + 1}</td>
                        <td style={{ padding: "11px 8px", overflow: "hidden" }}>
                          <div style={{ fontFamily: "monospace", fontWeight: 900, color: "#0f172a", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.order_no || "-"}</div>
                          <div style={{ marginTop: 3, color: "#94a3b8", fontSize: 10.5, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{items.length} {t.products}</div>
                        </td>
                        <td style={{ padding: "11px 8px", overflow: "hidden" }}>
                          <div style={{ color: "#0f172a", fontSize: 13, fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getOrderPartyName(o)}</div>
                          <div style={{ marginTop: 3, color: "#64748b", fontSize: 10.5, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <i className={`bi ${partyTypeObj?.icon || "bi-person-fill"}`}></i> {partyTypeObj ? t[partyTypeObj.labelKey] : "-"}
                          </div>
                        </td>
                        <td style={{ padding: "11px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: "#475569", whiteSpace: "nowrap" }}>{o.order_date || "—"}</td>
                        <td style={{ padding: "11px 8px", textAlign: isUrdu ? "left" : "right", fontFamily: "monospace", fontWeight: 900, color: "#1e40af", fontSize: 12.5, whiteSpace: "nowrap" }}>{fmt(grand)}</td>
                        <td style={{ padding: "11px 8px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <span style={{ display: "inline-flex", justifyContent: "center", padding: "3px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 850, whiteSpace: "nowrap", ...payTone }}>{getPaymentStatusLabel(payStatus, t)}</span>
                            <span style={{ fontFamily: "monospace", color: "#64748b", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>{fmt(paid)} / {fmt(remaining)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 8px", textAlign: "center" }}>
                          <span style={{ display: "inline-flex", justifyContent: "center", padding: "3px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 850, whiteSpace: "nowrap", ...statusTone }}>{getStatusLabel(o.status, t)}</span>
                        </td>
                        <td style={{ padding: "11px 8px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => setDetailsOrder(o)}
                            style={{
                              padding: "8px 11px",
                              borderRadius: 10,
                              border: "none",
                              background: "#eef2ff",
                              color: "#4f46e5",
                              fontSize: 11.5,
                              fontWeight: 900,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <i className="bi bi-eye-fill"></i>{t.seeDetails}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleOrderPage;
