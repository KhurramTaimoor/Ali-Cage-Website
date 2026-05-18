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
  },
};

const PARTY_TYPES = [
  { value: "customer", labelKey: "partyTypeCustomer", icon: "bi-person-fill", color: "sky" },
  { value: "employee", labelKey: "partyTypeEmployee", icon: "bi-person-badge-fill", color: "emerald" },
  { value: "general_ledger", labelKey: "partyTypeGeneralLedger", icon: "bi-journal-bookmark-fill", color: "violet" },
  { value: "supplier", labelKey: "partyTypeSupplier", icon: "bi-truck", color: "amber" },
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

function getStatusLabel(status, t) {
  if (status === "Pending") return t.pending;
  if (status === "Completed") return t.completed;
  if (status === "Cancelled") return t.cancelled;
  return status || "-";
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
    .totals{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.total-box{border-radius:16px;padding:16px 18px;border:1px solid #dbeafe;background:#f8fafc}.total-box.grand{background:#eff6ff;border-color:#bfdbfe}.total-box .label{display:block;font-size:12px;color:#64748b;margin-bottom:8px}.total-box .value{font-size:24px;font-weight:800;color:#0f172a;font-family:'Inter',Arial,sans-serif}.total-box.grand .value{color:#1d4ed8}
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
      <div class="card"><small>${t.slipShipmentTo}</small><div class="value">${order.shipment_to || "-"}</div></div>
      <table><thead><tr><th class="center">#</th><th>${t.slipProduct}</th><th>${t.category}</th><th>${t.productType}</th><th class="center">${t.slipUnit}</th><th class="num">${t.slipQty}</th><th class="num">${t.slipRate}</th><th class="num">${t.slipLineTotal}</th><th class="num">${t.slipDebit}</th><th class="num">${t.slipCredit}</th></tr></thead><tbody>${rowsHtml}</tbody><tfoot><tr><td colspan="7"></td><td class="num">${fmt(totalAmount)}</td><td class="num">${fmt(grandDebit)}</td><td class="num">${fmt(grandCredit)}</td></tr></tfoot></table>
      <div class="totals">
        <div class="total-box"><span class="label">${t.totalAmount}</span><div class="value">${fmt(totalAmount)}</div></div>
        <div class="total-box"><span class="label">${t.previousBalance}</span><div class="value">${fmt(previousBalance)}</div></div>
        <div class="total-box"><span class="label">${t.deliveryCharges}</span><div class="value">${fmt(deliveryCharges)}</div></div>
        <div class="total-box"><span class="label">${t.discount}</span><div class="value">${fmt(discount)}</div></div>
        <div class="total-box grand"><span class="label">${t.grandTotal}</span><div class="value">${fmt(grandTotal)}</div></div>
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
  const [dateFilter, setDateFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
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
        grand_total: invoiceTotal + previousBalance + dc - discount,
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
        [o.order_no, o.reference_no, getOrderPartyName(o), o.shipment_to, o.status].some((v) => String(v || "").toLowerCase().includes(q)) ||
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
    <div dir={dir} style={{ fontFamily: baseFont }} className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-2 sm:p-4 pb-20">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

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

      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5">
          <div className={`flex items-center justify-between flex-wrap gap-4 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button onClick={handleLangToggle} disabled={translating} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm disabled:opacity-60">
                <i className={`bi ${translating ? "bi-arrow-repeat animate-spin" : "bi-translate"}`}></i>
                {t.toggleLang}
              </button>

              <button onClick={() => setShowSummary((v) => !v)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${showSummary ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`}>
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>

              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200">
                <i className="bi bi-plus-circle-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 pt-5 border-t border-sky-100">
              {[
                { label: t.totalOrders, val: summary.total, icon: "bi-receipt", color: "text-sky-600", money: false },
                { label: t.totalPending, val: summary.pending, icon: "bi-clock-fill", color: "text-orange-500", money: false },
                { label: t.totalCompleted, val: summary.completed, icon: "bi-check-circle-fill", color: "text-emerald-600", money: false },
                { label: t.totalCancelled, val: summary.cancelled, icon: "bi-x-circle-fill", color: "text-rose-500", money: false },
                { label: t.totalValue, val: summary.value, icon: "bi-cash-stack", color: "text-blue-600", money: true },
              ].map((card, idx) => (
                <div key={idx} className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3 ${card.color}`}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                  <p className={`font-extrabold text-slate-950 ${card.money ? "text-2xl" : "text-3xl"}`}>{card.money ? fmt(card.val) : card.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-4" : "left-4"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className={`w-full border border-sky-100 rounded-2xl py-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"}`} />
          </div>

          <div className={`flex items-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <span className="text-xs font-semibold text-slate-500">{t.filterLabel}</span>
            {[
              { key: "24h", label: t.filter24h, icon: "bi-clock" },
              { key: "7d", label: t.filter7d, icon: "bi-calendar-week" },
              { key: "month", label: t.filterMonth, icon: "bi-calendar-month" },
              { key: "all", label: t.filterAll, icon: "bi-list-ul" },
            ].map((f) => (
              <button key={f.key} onClick={() => setDateFilter(f.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${dateFilter === f.key ? "bg-sky-600 text-white shadow-sky-200" : "bg-white border border-sky-100 text-sky-700 hover:bg-sky-50"}`}>
                <i className={`bi ${f.icon}`}></i>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 p-2 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mt-3" dir={dir}>
              <div className={`px-5 sm:px-6 py-4 border-b border-sky-100 flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                    <i className="bi bi-receipt text-sky-700 text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">{editingId ? t.edit : t.addBtn}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-3 sm:p-5 space-y-4">
                <div className="rounded-3xl border border-sky-100 bg-sky-50/60 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                      <label className={labelClass}>{t.orderNo} *</label>
                      <input type="text" value={form.order_no} onChange={(e) => setForm((f) => ({ ...f, order_no: e.target.value }))} placeholder={t.orderNoPlaceholder} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>{t.referenceNo}</label>
                      <input type="text" value={form.reference_no} onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>{t.partyType} *</label>
                      <select value={form.party_type} onChange={(e) => handlePartyTypeChange(e.target.value)} className={inputClass}>
                        <option value="">{t.selectPartyType}</option>
                        {PARTY_TYPES.map((p) => (
                          <option key={p.value} value={p.value}>{t[p.labelKey]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>{t.partyName} *</label>
                      <select value={form.party_id} onChange={(e) => handlePartyIdChange(e.target.value)} disabled={!form.party_type} className={inputClass}>
                        <option value="">{t.selectPartyName}</option>
                        {selectedPartyData.list.map((item) => {
                          const id = getRecordId(item);
                          const name = getPartyEntityName(form.party_type, item) || `#${id}`;
                          return <option key={id} value={id}>{name}</option>;
                        })}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>{t.orderDate}</label>
                      <input type="date" value={form.order_date} onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>{t.deliveryDate}</label>
                      <input type="date" value={form.delivery_date} onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))} className={inputClass} />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className={labelClass}>{t.shipmentTo}</label>
                      <input type="text" value={form.shipment_to} onChange={(e) => setForm((f) => ({ ...f, shipment_to: e.target.value }))} placeholder={t.shipmentPlaceholder} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>{t.previousBalance}</label>
                      <input type="number" value={form.previous_balance} onChange={(e) => setForm((f) => ({ ...f, previous_balance: e.target.value }))} className={`${inputClass} font-mono`} />
                    </div>

                    <div>
                      <label className={labelClass}>{t.discount}</label>
                      <input type="number" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} className={`${inputClass} font-mono`} />
                    </div>

                    <div>
                      {showDeliveryCharges ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <label className={labelClass}>{t.deliveryCharges}</label>
                            <button type="button" onClick={() => { setShowDeliveryCharges(false); setForm((f) => ({ ...f, delivery_charges: "0" })); }} className="text-[11px] text-rose-600 font-bold">{t.removeDeliveryCharges}</button>
                          </div>
                          <input type="number" value={form.delivery_charges} onChange={(e) => setForm((f) => ({ ...f, delivery_charges: e.target.value }))} className={`${inputClass} font-mono`} />
                        </>
                      ) : (
                        <button type="button" onClick={() => setShowDeliveryCharges(true)} className="w-full h-[62px] border-2 border-dashed border-sky-300 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-50 transition flex items-center justify-center gap-2">
                          <i className="bi bi-plus-circle"></i>
                          {t.addDeliveryCharges}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {form.order_items.map((item, index) => {
                    const lineTotal = calcLineTotal(item);

                    return (
                      <div key={index} className="border border-sky-100 rounded-2xl p-4 bg-sky-50/40 space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-800">{t.itemGroup} {index + 1}</h3>
                          {form.order_items.length > 1 && (
                            <button type="button" onClick={() => removeItemRow(index)} className="text-xs px-3 py-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 font-semibold">
                              {t.removeProductRow}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className={labelClass}>{t.productType}</label>
                            <select value={item.product_type_id} onChange={(e) => updateItemRow(index, "product_type_id", e.target.value)} className={inputClass}>
                              <option value="">{t.selectType}</option>
                              {types.map((x) => <option key={x.id} value={x.id}>{getTypeName(x)}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>{t.category}</label>
                            <select value={item.category_id} onChange={(e) => updateItemRow(index, "category_id", e.target.value)} className={inputClass}>
                              <option value="">{t.selectCategory}</option>
                              {categories.map((c) => <option key={c.id} value={c.id}>{getCategoryName(c)}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>{t.product} *</label>
                            <select value={item.product_id} onChange={(e) => updateItemRow(index, "product_id", e.target.value)} className={inputClass}>
                              <option value="">{t.selectProduct}</option>
                              {products.map((p) => <option key={p.id} value={p.id}>{getProductName(p)}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>{t.unit}</label>
                            <select value={item.unit_id} onChange={(e) => updateItemRow(index, "unit_id", e.target.value)} className={inputClass}>
                              <option value="">{t.selectUnit}</option>
                              {units.map((u) => <option key={u.id} value={u.id}>{getUnitName(u)}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>{t.orderQty}</label>
                            <input type="number" value={item.order_qty} onChange={(e) => updateItemRow(index, "order_qty", e.target.value)} className={`${inputClass} font-mono`} />
                          </div>

                          <div>
                            <label className={labelClass}>{t.rate}</label>
                            <input type="number" value={item.rate} onChange={(e) => updateItemRow(index, "rate", e.target.value)} className={`${inputClass} font-mono`} />
                          </div>

                          <div>
                            <label className={labelClass}>{t.debit}</label>
                            <input type="number" value={item.debit} onChange={(e) => updateItemRow(index, "debit", e.target.value)} className={`${inputClass} font-mono`} />
                          </div>

                          <div>
                            <label className={labelClass}>{t.credit}</label>
                            <input type="number" value={item.credit} onChange={(e) => updateItemRow(index, "credit", e.target.value)} className={`${inputClass} font-mono`} />
                          </div>

                          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-sky-100">
                            <label className="block text-xs font-bold text-sky-700 mb-1.5">{t.lineTotal}<span className={`${isUrdu ? "mr-2" : "ml-2"} text-sky-500 font-normal text-xs`}>⚡ {t.autoCalcNote}</span></label>
                            <input type="text" value={fmt(lineTotal)} readOnly className={readonlyClass} />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button type="button" onClick={addItemRow} className="w-full border border-dashed border-sky-300 text-sky-700 py-3 rounded-2xl text-sm font-semibold hover:bg-sky-50 transition">
                    <i className="bi bi-plus-circle me-2"></i>
                    {t.addProductRow}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                    <label className="block text-xs font-bold text-sky-700 mb-1.5">{t.totalAmount}<span className={`${isUrdu ? "mr-2" : "ml-2"} text-sky-500 font-normal text-xs`}>⚡ {t.autoCalcNote}</span></label>
                    <input type="text" value={fmt(formTotal)} readOnly className={readonlyClass} />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-700 mb-1.5">{t.grandTotal}<span className={`${isUrdu ? "mr-2" : "ml-2"} text-blue-500 font-normal text-xs`}>⚡ {t.autoCalcNote}</span></label>
                    <input type="text" value={fmt(formGrandTotal)} readOnly className={readonlyClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t.status}</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
                    <option value="Pending">{t.pending}</option>
                    <option value="Completed">{t.completed}</option>
                    <option value="Cancelled">{t.cancelled}</option>
                  </select>
                </div>

                <div className={`flex gap-3 pt-4 border-t border-sky-100 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <button onClick={handleSave} disabled={submitting} className="flex-1 bg-sky-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-sky-700 transition shadow-lg shadow-sky-200 flex justify-center items-center gap-2 disabled:opacity-60">
                    <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                    {submitting ? t.saving : t.save}
                  </button>

                  <button onClick={() => setShowForm(false)} disabled={submitting} className="flex-1 bg-white border border-sky-200 text-sky-700 py-3 rounded-2xl font-semibold text-sm hover:bg-sky-50 transition disabled:opacity-60">
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100 whitespace-nowrap">
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"} w-10`}>#</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.orderNo}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.partyType}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.partyName}</th>
                  <th className="px-3 py-3 text-center">{t.orderDate}</th>
                  <th className="px-3 py-3 text-center">{t.deliveryDate}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.shipmentTo}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.productType}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className="px-3 py-3 text-center">{t.unit}</th>
                  <th className="px-3 py-3 text-right">{t.orderQty}</th>
                  <th className="px-3 py-3 text-right">{t.rate}</th>
                  <th className="px-3 py-3 text-right">{t.totalAmount}</th>
                  <th className="px-3 py-3 text-right">{t.grandTotal}</th>
                  <th className="px-3 py-3 text-center">{t.status}</th>
                  <th className="px-3 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={17} className="px-6 py-12 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2 text-sm">{t.loadingOrders}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="px-6 py-12 text-center text-slate-400 text-sm">{t.noRecords}</td>
                  </tr>
                ) : (
                  filtered.map((o, i) => {
                    const items = normalizeOrderItems(o);
                    const partyType = getOrderPartyType(o);
                    const partyTypeObj = PARTY_TYPES.find((p) => p.value === partyType);
                    const total = num(o.total_amount) || calcOrderTotal(items);
                    const grand = num(o.grand_total) || total + num(o.previous_balance) + num(o.delivery_charges) - num(o.discount);

                    return (
                      <tr key={o.id || i} className="hover:bg-sky-50/70 transition align-top">
                        <td className="px-3 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-3 py-3">
                          <span className="font-bold text-slate-950 font-mono block text-sm">{o.order_no}</span>
                          <span className="text-xs text-slate-400">{items.length} {t.itemsLabel}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                            <i className={`bi ${partyTypeObj?.icon || "bi-person"}`}></i>
                            {partyTypeObj ? t[partyTypeObj.labelKey] : "-"}
                          </span>
                        </td>
                        <td className={`px-3 py-3 text-sm ${valueClass}`}>{getOrderPartyName(o)}</td>
                        <td className="px-3 py-3 text-center font-mono text-slate-950 whitespace-nowrap text-xs">{o.order_date || "—"}</td>
                        <td className="px-3 py-3 text-center font-mono text-slate-950 whitespace-nowrap text-xs">{o.delivery_date || "—"}</td>
                        <td className={`px-3 py-3 text-sm ${valueClass}`}>{o.shipment_to || "—"}</td>

                        <td className="px-3 py-3">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx}><span className="bg-sky-50 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-medium inline-block border border-sky-100">{getTranslatedMapValue("product_type", item.product_type_id, typeMap[item.product_type_id] || `#${item.product_type_id}`)}</span></div>)}</div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx} className={`text-sm ${valueClass}`}>{getTranslatedMapValue("category", item.category_id, categoryMap[item.category_id] || `#${item.category_id}`)}</div>)}</div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx} className="text-slate-950 font-medium text-sm">{getTranslatedMapValue("product", item.product_id, productMap[item.product_id] || `#${item.product_id}`)}</div>)}</div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx} className={`text-sm ${valueClass}`}>{getTranslatedMapValue("unit", item.unit_id, unitMap[item.unit_id] || `#${item.unit_id}`)}</div>)}</div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx} className={`${monoBlack} font-semibold text-sm`}>{item.order_qty || 0}</div>)}</div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx} className={`${monoBlack} text-sm`}>{fmt(item.rate)}</div>)}</div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">{items.map((item, idx) => <div key={idx} className={`${monoBlack} text-sm`}>{fmt(calcLineTotal(item))}</div>)}</div>
                        </td>

                        <td className={`px-3 py-3 text-right ${monoBlack} font-bold`}>{fmt(grand)}</td>

                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-slate-950 border border-sky-100">{getStatusLabel(o.status, t)}</span>
                        </td>

                        <td className="px-3 py-3">
                          <div className={`flex items-center justify-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                            <button onClick={() => openEdit(o)} className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center" title={t.edit}>
                              <i className="bi bi-pencil-square text-sm"></i>
                            </button>
                            <button onClick={() => handleDelete(o.id)} className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition flex items-center justify-center" title={t.delete}>
                              <i className="bi bi-trash3-fill text-sm"></i>
                            </button>
                            <button
                              onClick={async () => {
                                let cacheToUse = urduCache;
                                if (lang === "ur") {
                                  setTranslating(true);
                                  try {
                                    const updatedCache = await ensureOrderPrintTranslations(o);
                                    if (updatedCache) cacheToUse = updatedCache;
                                  } finally {
                                    setTranslating(false);
                                  }
                                }
                                generateSlipPrint(o, lang, { productMap, categoryMap, typeMap, unitMap }, cacheToUse);
                              }}
                              className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition flex items-center justify-center"
                              title={t.printSlip}
                            >
                              <i className="bi bi-printer-fill text-sm"></i>
                            </button>
                            <button onClick={() => handleConvertToInvoice(o)} className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center" title={t.changeToInvoice}>
                              <i className="bi bi-file-earmark-arrow-up-fill text-sm"></i>
                            </button>
                          </div>
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
