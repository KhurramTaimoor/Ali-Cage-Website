import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Sales Invoice",
    subtitle: "Multi-product, carton pieces, discount & printable invoice",
    newInvoice: "New Invoice",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by invoice no, customer or date...",
    invoiceNo: "Invoice No",
    invoiceNoRequired: "Invoice No is required.",
    referenceNo: "Reference No",
    customer: "Customer",
    customerRequired: "Please select a customer.",
    date: "Invoice Date",
    shipmentTo: "Shipment To",
    previousBalance: "Previous Balance",
    discount: "Discount",
    deliveryCharges: "Delivery Charges",
    pressAddDelivery: "Add Delivery Charges",
    removeDelivery: "Remove",
    items: "Items",
    itemsSubtitle: "Select category, product and quantity details per line",
    newLine: "Add Line",
    category: "Category",
    product: "Product",
    unit: "Unit",
    saleType: "Sale Type",
    single: "Single",
    carton: "Carton",
    pieces: "Pieces",
    cartonQty: "Carton Qty",
    piecesQty: "Pieces Qty",
    piecesPerCarton: "Pcs/Carton",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    delete: "Delete",
    invoiceTotal: "Invoice Total",
    prevBalance: "Previous Balance",
    grandTotal: "Grand Total",
    saveInvoice: "Save Invoice",
    updateInvoice: "Update Invoice",
    cancel: "Cancel",
    editTitle: "Edit Invoice",
    newTitle: "New Sales Invoice",
    formSubtitle: "Carton / pieces invoice with discount and shipment details",
    col_no: "#",
    col_invoiceNo: "Invoice No",
    col_customer: "Customer",
    col_date: "Date",
    col_items: "Items",
    col_invoiceTotal: "Invoice Total",
    col_prevBalance: "Prev Balance",
    col_discount: "Discount",
    col_deliveryCharges: "Delivery",
    col_grandTotal: "Grand Total",
    col_actions: "Actions",
    loading: "Loading invoices...",
    noRecords: "No invoices found.",
    loadingMaster: "Loading...",
    selectCategory: "-- Select Category --",
    selectProduct: "-- Select Product --",
    selectUnit: "-- Select Unit --",
    selectCustomer: "-- Select Customer --",
    selectSaleType: "-- Select Sale Type --",
    masterError: "Master data load issue:",
    deleteConfirm: "Are you sure you want to delete this invoice?",
    deleteSuccess: "Invoice deleted.",
    deleteError: "Delete failed.",
    saveSuccess: "Invoice saved.",
    updateSuccess: "Invoice updated.",
    saveError: "Save failed. Please check backend.",
    printError: "Could not load invoice for print.",
    editError: "Could not load invoice details.",
    invoicesError: "Invoices could not be loaded.",
    validItemRequired: "Please add at least one valid item.",
    toggleLang: "اردو",
    customers: "Customers",
    categories: "Categories",
    products: "Products",
    units: "Units",
    totalInvoices: "Total Invoices",
    totalItems: "Total Items",
    totalValue: "Total Value",
    filterAll: "All",
    filter24h: "Last 24 Hours",
    filter7d: "Last 7 Days",
    filterMonth: "This Month",
    filterLabel: "Filter:",
    slipTitle: "Sales Invoice Receipt",
    slipCustomer: "Customer",
    slipDate: "Invoice Date",
    slipShipmentTo: "Shipment To",
    slipRefNo: "Reference No",
    slipPrevBalance: "Previous Balance",
    slipDiscount: "Discount",
    slipDeliveryCharges: "Delivery Charges",
    slipInvoiceTotal: "Invoice Total",
    slipGrandTotal: "Grand Total",
    slipPrintedOn: "Generated",
    slipThank: "Thank you for your business!",
    companyName: "Ali Cages",
    totalLabel: "Total",
    translating: "Translating to Urdu…",
    downloadPdf: "Print / Save PDF",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
    na: "-",
    // Customer Type
    partyType: "Customer Type",
    selectPartyType: "-- Select Customer Type --",
    partyTypeRequired: "Please select a customer type.",
    partyName: "Name",
    selectPartyName: "-- Select Name --",
    partyNameRequired: "Please select a name.",
    partyTypeCustomer: "Customer",
    partyTypeEmployee: "Employee",
    partyTypeGeneralLedger: "General Ledger",
    partyTypeSupplier: "Supplier",
  },
  ur: {
    title: "سیلز انوائس",
    subtitle: "ملٹی پروڈکٹس، کارٹن پیسز، ڈسکاؤنٹ اور پرنٹ ایبل انوائس",
    newInvoice: "نئی انوائس",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "انوائس نمبر، گاہک یا تاریخ سے تلاش کریں...",
    invoiceNo: "انوائس نمبر",
    invoiceNoRequired: "انوائس نمبر ضروری ہے۔",
    referenceNo: "ریفرنس نمبر",
    customer: "گاہک",
    customerRequired: "گاہک منتخب کرنا ضروری ہے۔",
    date: "انوائس تاریخ",
    shipmentTo: "شپمنٹ ٹو",
    previousBalance: "سابقہ رقم",
    discount: "ڈسکاؤنٹ",
    deliveryCharges: "ڈیلیوری چارجز",
    pressAddDelivery: "ڈیلیوری چارجز شامل کریں",
    removeDelivery: "ہٹائیں",
    items: "آئٹمز",
    itemsSubtitle: "ہر لائن میں کیٹیگری، پروڈکٹ اور مقدار کی تفصیل",
    newLine: "نئی لائن",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    unit: "یونٹ",
    saleType: "فروخت کی قسم",
    single: "سنگل",
    carton: "کارٹن",
    pieces: "پیسز",
    cartonQty: "کارٹن مقدار",
    piecesQty: "پیسز مقدار",
    piecesPerCarton: "فی کارٹن پیسز",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",
    delete: "حذف",
    invoiceTotal: "ٹوٹل انوائس رقم",
    prevBalance: "سابقہ رقم",
    grandTotal: "ٹوٹل بل رقم",
    saveInvoice: "انوائس محفوظ کریں",
    updateInvoice: "انوائس اپڈیٹ کریں",
    cancel: "منسوخ",
    editTitle: "انوائس ترمیم",
    newTitle: "نئی سیلز انوائس",
    formSubtitle: "کارٹن / پیسز انوائس بمعہ ڈسکاؤنٹ اور شپمنٹ تفصیل",
    col_no: "#",
    col_invoiceNo: "انوائس نمبر",
    col_customer: "گاہک",
    col_date: "تاریخ",
    col_items: "آئٹمز",
    col_invoiceTotal: "انوائس رقم",
    col_prevBalance: "سابقہ رقم",
    col_discount: "ڈسکاؤنٹ",
    col_deliveryCharges: "ڈیلیوری",
    col_grandTotal: "کل رقم",
    col_actions: "اقدامات",
    loading: "Invoices لوڈ ہو رہی ہیں...",
    noRecords: "کوئی انوائس نہیں ملی۔",
    loadingMaster: "لوڈ ہو رہا ہے...",
    selectCategory: "-- کیٹیگری منتخب کریں --",
    selectProduct: "-- پروڈکٹ منتخب کریں --",
    selectUnit: "-- یونٹ منتخب کریں --",
    selectCustomer: "-- گاہک منتخب کریں --",
    selectSaleType: "-- فروخت کی قسم منتخب کریں --",
    masterError: "Master data load issue:",
    deleteConfirm: "کیا آپ واقعی اس انوائس کو حذف کرنا چاہتے ہیں؟",
    deleteSuccess: "انوائس حذف ہو گئی۔",
    deleteError: "حذف نہیں ہوئی۔",
    saveSuccess: "انوائس محفوظ ہو گئی۔",
    updateSuccess: "انوائس اپڈیٹ ہو گئی۔",
    saveError: "محفوظ نہیں ہوئی۔ Backend چیک کریں۔",
    printError: "پرنٹ کے لیے انوائس لوڈ نہیں ہوئی۔",
    editError: "انوائس تفصیل لوڈ نہیں ہوئی۔",
    invoicesError: "Invoices لوڈ نہیں ہوئیں۔",
    validItemRequired: "کم از کم ایک valid item ضرور add کریں۔",
    toggleLang: "English",
    customers: "Customers",
    categories: "Categories",
    products: "Products",
    units: "Units",
    totalInvoices: "کل انوائسز",
    totalItems: "کل آئٹمز",
    totalValue: "کل رقم",
    filterAll: "سب",
    filter24h: "آخری 24 گھنٹے",
    filter7d: "آخری 7 دن",
    filterMonth: "یہ مہینہ",
    filterLabel: "فلٹر:",
    slipTitle: "سیلز انوائس رسید",
    slipCustomer: "گاہک",
    slipDate: "انوائس تاریخ",
    slipShipmentTo: "شپمنٹ ٹو",
    slipRefNo: "ریفرنس نمبر",
    slipPrevBalance: "سابقہ رقم",
    slipDiscount: "ڈسکاؤنٹ",
    slipDeliveryCharges: "ڈیلیوری چارجز",
    slipInvoiceTotal: "ٹوٹل انوائس رقم",
    slipGrandTotal: "ٹوٹل بل رقم",
    slipPrintedOn: "تیار کردہ",
    slipThank: "آپ کے کاروبار کا شکریہ!",
    companyName: "علی کیجز",
    totalLabel: "کل",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    downloadPdf: "پرنٹ / پی ڈی ایف",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
    na: "-",
    // Customer Type
    partyType: "کسٹمر ٹائپ",
    selectPartyType: "-- کسٹمر ٹائپ منتخب کریں --",
    partyTypeRequired: "کسٹمر ٹائپ منتخب کرنا ضروری ہے۔",
    partyName: "نام",
    selectPartyName: "-- نام منتخب کریں --",
    partyNameRequired: "نام منتخب کرنا ضروری ہے۔",
    partyTypeCustomer: "گاہک (Customer)",
    partyTypeEmployee: "ملازم (Employee)",
    partyTypeGeneralLedger: "جنرل لیجر (General Ledger)",
    partyTypeSupplier: "سپلائر (Supplier)",
  },
};

// Customer type config: icon, color classes
const PARTY_TYPES = [
  { value: "customer",        labelKey: "partyTypeCustomer",       icon: "bi-person-fill",          color: "sky" },
  { value: "employee",        labelKey: "partyTypeEmployee",       icon: "bi-person-badge-fill",    color: "emerald" },
  { value: "general_ledger",  labelKey: "partyTypeGeneralLedger",  icon: "bi-journal-bookmark-fill",color: "violet" },
  { value: "supplier",        labelKey: "partyTypeSupplier",       icon: "bi-truck",                color: "amber" },
];

const PARTY_COLOR = {
  sky:     { badge: "bg-sky-100 text-sky-700 border-sky-200",     dot: "bg-sky-500" },
  emerald: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  violet:  { badge: "bg-violet-100 text-violet-700 border-violet-200",   dot: "bg-violet-500" },
  amber:   { badge: "bg-amber-100 text-amber-700 border-amber-200",      dot: "bg-amber-500" },
};

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${API_ROOT}/api/sales-invoices`;
const CUSTOMERS_API = `${API_ROOT}/api/customers`;
const EMPLOYEES_API = `${API_ROOT}/api/employees`;
const SUPPLIERS_API = `${API_ROOT}/api/suppliers`;
const GENERAL_LEDGERS_API = `${API_ROOT}/api/general-ledgers`;
const CATEGORIES_API = `${API_ROOT}/api/categories`;
const PRODUCTS_API = `${API_ROOT}/api/products`;
const UNITS_API = `${API_ROOT}/api/units`;

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const money = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const toNumber = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const generateInvoiceNo = (existingInvoices) => {
  let maxNum = 0;
  existingInvoices.forEach((inv) => {
    const match = String(inv.invoice_no || "").match(/^sales-invoice(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  return `sales-invoice${String(maxNum + 1).padStart(2, "0")}`;
};

async function translateText(text) {
  if (!text || !String(text).trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(String(text).trim())}&langpair=en|ur`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.toLowerCase() === String(text).trim().toLowerCase()) return text;
    return translated;
  } catch {
    return text;
  }
}

const getCustomerName = (obj) =>
  obj?.customer_name || obj?.customer_name_en || obj?.customer_name_ur ||
  obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getEmployeeName = (obj) =>
  obj?.employee_name || obj?.employee_name_en || obj?.employee_name_ur ||
  obj?.full_name || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getSupplierName = (obj) =>
  obj?.supplier_name || obj?.supplier_name_en || obj?.supplier_name_ur ||
  obj?.vendor_name || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getLedgerName = (obj) =>
  obj?.ledger_name || obj?.ledger_name_en || obj?.ledger_name_ur ||
  obj?.account_name || obj?.account_title || obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getRecordId = (obj) =>
  obj?.id ?? obj?.value ?? obj?.customer_id ?? obj?.employee_id ?? obj?.supplier_id ??
  obj?.ledger_id ?? obj?.general_ledger_id ?? obj?.account_id ?? "";

const getPartyEntityName = (type, obj) => {
  if (type === "employee") return getEmployeeName(obj);
  if (type === "supplier") return getSupplierName(obj);
  if (type === "general_ledger") return getLedgerName(obj);
  return getCustomerName(obj);
};

const getCategoryName = (obj) =>
  obj?.category_name || obj?.category_name_en || obj?.category_name_ur ||
  obj?.name || obj?.name_en || obj?.name_ur || obj?.title || "";

const getProductName = (obj) =>
  obj?.product_name || obj?.product_name_en || obj?.product_name_ur ||
  obj?.name || obj?.name_en || obj?.name_ur || obj?.item_name || obj?.title || "";

const getUnitName = (obj) =>
  obj?.unit_name || obj?.unit_name_en || obj?.unit_name_ur ||
  obj?.name || obj?.name_en || obj?.name_ur || obj?.symbol || obj?.title || "";

const getProductCategoryId = (p) =>
  p?.category_id ?? p?.categoryId ?? p?.cat_id ?? p?.catId ??
  p?.product_category_id ?? p?.productCategoryId ??
  p?.category?.id ?? p?.category?.category_id ?? p?.category?.value ?? p?.category ?? "";

const getProductUnitId = (p) => p?.unit_id ?? p?.unitId ?? p?.unit?.id ?? p?.unit ?? "";

const getProductPieceRate = (p) =>
  p?.piece_rate ?? p?.pieceRate ?? p?.sale_rate ?? p?.saleRate ??
  p?.rate ?? p?.price ?? p?.sale_price ?? 0;

const getProductSaleUnit = (p) => String(p?.sale_unit || p?.saleUnit || "single").toLowerCase();

const getProductPiecesPerCarton = (p) => Number(p?.pieces_per_carton ?? p?.piecesPerCarton ?? 0);

const createEmptyItem = () => ({
  category_id: "",
  product_id: "",
  unit_id: "",
  sale_type: "single",
  carton_qty: "",
  pieces_qty: "",
  qty: "",
  pieces_per_carton: "0",
  rate: "0",
  amount: "0",
});

const createEmptyForm = () => ({
  invoice_no: "",
  reference_no: "",
  party_type: "",
  party_id: "",
  customer_id: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  shipment_to: "",
  previous_balance: "0",
  delivery_charges: "0",
  discount: "0",
});

function useLookup(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(url);
      setData(getList(res.data));
    } catch (err) {
      setError(err?.message || "Load error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [url]);
  return { data, loading, error, refetch: fetchData };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT
// ─────────────────────────────────────────────────────────────────────────────
function generateInvoicePrint(invoice, lang, urduCache) {
  const t = LANG[lang || "en"];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const items = Array.isArray(invoice?.items) ? invoice.items : [];

  const invoiceTotal = toNumber(invoice?.invoice_total);
  const previousBalance = toNumber(invoice?.previous_balance);
  const deliveryCharges = toNumber(invoice?.delivery_charges ?? invoice?.deliveryCharges);
  const discount = toNumber(invoice?.discount);
  const grandTotal = toNumber(invoice?.grand_total);

  const invoicePartyType = invoice.customer_type || invoice.party_type || (invoice.customer_id ? "customer" : "");
  const invoicePartyId = invoice.party_id || invoice.customer_id || invoice.employee_id || invoice.supplier_id || invoice.general_ledger_id || "";
  const partyName = isUrdu
    ? urduCache[`party:${invoicePartyType}:${invoicePartyId}`] ||
      urduCache[`customer:${invoice.customer_id}`] ||
      invoice.party_name || invoice.customer_name || "-"
    : invoice.party_name || invoice.customer_name || "-";

  const translated = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  // Party type label for print
  const partyTypeObj = PARTY_TYPES.find((p) => p.value === invoicePartyType);
  const partyTypeLabel = partyTypeObj ? t[partyTypeObj.labelKey] || partyTypeObj.value : "-";

  const rowsHtml = items.map((row, idx) => {
    const saleTypeText =
      row.sale_type === "carton" ? t.carton :
      row.sale_type === "pieces" ? t.pieces : t.single;
    const qtyText = row.sale_type === "carton"
      ? money(row.carton_qty)
      : money(row.pieces_qty || row.qty);
    return `
      <tr>
        <td class="center">${idx + 1}</td>
        <td>${translated("product", row.product_id, row.product_name || "")}</td>
        <td>${translated("category", row.category_id, row.category_name || "")}</td>
        <td class="center">${saleTypeText}</td>
        <td class="center">${translated("unit", row.unit_id, row.unit_name || "")}</td>
        <td class="num">${qtyText}</td>
        <td class="num">${money(row.rate)}</td>
        <td class="num strong violet">${money(row.amount)}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <title>${invoice.invoice_no || "sales-invoice"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;}
    body{margin:0;background:#f8fafc;color:#0f172a;font-family:${isUrdu?"'Noto Nastaliq Urdu',serif":"'Inter',Arial,sans-serif"};}
    .page{width:100%;min-height:100vh;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 45%,#f8fafc 100%);padding:20px;}
    .sheet{max-width:1400px;margin:0 auto;background:white;border:1px solid #dbeafe;box-shadow:0 12px 40px rgba(15,23,42,0.08);border-radius:24px;overflow:hidden;}
    .header{background:linear-gradient(135deg,#0f4c97 0%,#155eaf 65%,#3b82f6 100%);color:white;padding:26px 28px 22px;}
    .header-row{display:flex;align-items:center;justify-content:space-between;gap:20px;}
    .brand h1{margin:0;font-size:30px;font-weight:800;}
    .brand p{margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.82);}
    .meta{text-align:${isUrdu?"left":"right"};font-size:12px;color:rgba(255,255,255,0.88);line-height:1.8;}
    .content{padding:18px;display:flex;flex-direction:column;gap:14px;}
    .hint{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:14px;padding:12px 14px;font-size:13px;}
    .info-cards{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;}
    .card{border-radius:16px;padding:14px 16px;border:1px solid #dbeafe;background:#f8fafc;}
    .card small{display:block;font-size:12px;color:#64748b;margin-bottom:6px;}
    .card .value{font-size:16px;font-weight:800;color:#0f172a;word-break:break-word;}
    .party-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:#ede9fe;color:#7c3aed;border:1px solid #c4b5fd;}
    table{width:100%;border-collapse:collapse;}
    thead th{background:#0f4c97;color:white;font-size:12px;padding:12px 10px;border:1px solid #1d4ed8;text-align:${isUrdu?"right":"left"};}
    tbody td{border:1px solid #dbeafe;padding:10px;font-size:12px;}
    tbody tr:nth-child(even) td{background:#f8fbff;}
    .center{text-align:center!important;}
    .num{text-align:${isUrdu?"left":"right"}!important;white-space:nowrap;font-weight:700;font-family:'Inter',Arial,sans-serif;}
    .strong{font-weight:800;}
    .violet{color:#7c3aed;}
    .totals{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
    .total-box{border-radius:16px;padding:16px 18px;border:1px solid #dbeafe;background:#f8fafc;}
    .total-box.grand{background:#eff6ff;border-color:#bfdbfe;}
    .total-box .label{display:block;font-size:12px;color:#64748b;margin-bottom:8px;}
    .total-box .value{font-size:26px;font-weight:800;color:#0f172a;font-family:'Inter',Arial,sans-serif;}
    .total-box.grand .value{color:#1d4ed8;}
    .footer{background:#0f4c97;color:rgba(255,255,255,0.9);padding:10px 16px;display:flex;justify-content:space-between;font-size:11px;}
    @media print{@page{size:A4 landscape;margin:10mm;}body{background:white;}.page{padding:0;background:white;}.sheet{box-shadow:none;border:none;border-radius:0;max-width:none;}.hint{display:none;}}
  </style>
</head>
<body>
  <div class="page"><div class="sheet">
    <div class="header"><div class="header-row">
      <div class="brand"><h1>${t.companyName}</h1><p>${t.slipTitle}</p></div>
      <div class="meta">
        <div>${t.slipPrintedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
        <div>${t.slipDate}: ${invoice.invoice_date || "-"}</div>
      </div>
    </div></div>
    <div class="content">
      <div class="hint">${t.savePdfHint}</div>
      <div class="info-cards">
        <div class="card"><small>${t.invoiceNo}</small><div class="value">${invoice.invoice_no || "-"}</div></div>
        <div class="card"><small>${t.referenceNo}</small><div class="value">${invoice.reference_no || "-"}</div></div>
        <div class="card"><small>${t.partyType}</small><div class="value"><span class="party-badge">${partyTypeLabel}</span></div></div>
        <div class="card"><small>${t.partyName || t.slipCustomer}</small><div class="value">${partyName || "-"}</div></div>
        <div class="card"><small>${t.slipDate}</small><div class="value">${invoice.invoice_date || "-"}</div></div>
        <div class="card"><small>${t.slipShipmentTo}</small><div class="value">${invoice.shipment_to || "-"}</div></div>
      </div>
      <table>
        <thead><tr>
          <th class="center">#</th><th>${t.product}</th><th>${t.category}</th>
          <th class="center">${t.saleType}</th><th class="center">${t.unit}</th>
          <th class="num">${t.qty}</th><th class="num">${t.rate}</th><th class="num">${t.amount}</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="totals">
        <div class="total-box"><span class="label">${t.slipInvoiceTotal}</span><div class="value">${money(invoiceTotal)}</div></div>
        <div class="total-box"><span class="label">${t.slipPrevBalance}</span><div class="value">${money(previousBalance)}</div></div>
        <div class="total-box"><span class="label">${t.slipDeliveryCharges}</span><div class="value">${money(deliveryCharges)}</div></div>
        <div class="total-box"><span class="label">${t.slipDiscount}</span><div class="value">${money(discount)}</div></div>
        <div class="total-box grand"><span class="label">${t.slipGrandTotal}</span><div class="value">${money(grandTotal)}</div></div>
      </div>
    </div>
    <div class="footer"><span>${t.companyName} — ${t.slipThank}</span><span>Page 1 / 1</span></div>
  </div></div>
  <script>window.onload=()=>{setTimeout(()=>{window.print();},400);};<\/script>
</body></html>`;

  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SalesInvoicePage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const labelClass = "block text-[11px] font-semibold text-slate-500 mb-0.5";
  const inputCls = `w-full min-w-0 border border-sky-100 rounded-lg py-1.5 text-xs text-black bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 truncate ${isUrdu ? "pr-2 pl-2 text-right" : "px-2"}`;
  const readonlyClass = "w-full min-w-0 rounded-lg border border-sky-100 bg-sky-50 px-2 py-1.5 text-xs font-bold font-mono text-slate-950 text-right truncate";
  const monoBlack = "font-mono text-black";

  const { data: customers, loading: customersLoading, error: customersError, refetch: refetchCustomers } = useLookup(CUSTOMERS_API);
  const { data: employees, loading: employeesLoading, error: employeesError, refetch: refetchEmployees } = useLookup(EMPLOYEES_API);
  const { data: suppliers, loading: suppliersLoading, error: suppliersError, refetch: refetchSuppliers } = useLookup(SUPPLIERS_API);
  const { data: generalLedgers, loading: generalLedgersLoading, error: generalLedgersError, refetch: refetchGeneralLedgers } = useLookup(GENERAL_LEDGERS_API);
  const { data: categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useLookup(CATEGORIES_API);
  const { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useLookup(PRODUCTS_API);
  const { data: units, loading: unitsLoading, error: unitsError, refetch: refetchUnits } = useLookup(UNITS_API);

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("24h");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());
  const [items, setItems] = useState([createEmptyItem()]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [urduCache, setUrduCache] = useState({});
  const [translating, setTranslating] = useState(false);
  const [showDeliveryCharges, setShowDeliveryCharges] = useState(false);
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);

  const mastersLoading = customersLoading || employeesLoading || suppliersLoading || generalLedgersLoading || categoriesLoading || productsLoading || unitsLoading;
  const mastersError = customersError || employeesError || suppliersError || generalLedgersError || categoriesError || productsError || unitsError;

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      const id = getRecordId(c);
      if (id !== "") map[String(id)] = getCustomerName(c) || `#${id}`;
    });
    return map;
  }, [customers]);

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      const id = getRecordId(e);
      if (id !== "") map[String(id)] = getEmployeeName(e) || `#${id}`;
    });
    return map;
  }, [employees]);

  const supplierMap = useMemo(() => {
    const map = {};
    suppliers.forEach((s) => {
      const id = getRecordId(s);
      if (id !== "") map[String(id)] = getSupplierName(s) || `#${id}`;
    });
    return map;
  }, [suppliers]);

  const ledgerMap = useMemo(() => {
    const map = {};
    generalLedgers.forEach((l) => {
      const id = getRecordId(l);
      if (id !== "") map[String(id)] = getLedgerName(l) || `#${id}`;
    });
    return map;
  }, [generalLedgers]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[String(c.id)] = getCategoryName(c) || `#${c.id}`; });
    return map;
  }, [categories]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[String(p.id)] = getProductName(p) || `#${p.id}`; });
    return map;
  }, [products]);

  const unitMap = useMemo(() => {
    const map = {};
    units.forEach((u) => { map[String(u.id)] = getUnitName(u) || `#${u.id}`; });
    return map;
  }, [units]);

  const getCustomerLabel = (id, fallback = "") =>
    isUrdu ? urduCache[`customer:${id}`] || fallback || "-" : fallback || "-";

  const getPartyLabel = (type, id, fallback = "") =>
    isUrdu ? urduCache[`party:${type}:${id}`] || (type === "customer" ? urduCache[`customer:${id}`] : "") || fallback || "-" : fallback || "-";

  const getTranslatedMapValue = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const selectedPartyType = PARTY_TYPES.find((p) => p.value === form.party_type) || null;

  const selectedPartyData = useMemo(() => {
    if (form.party_type === "employee") {
      return { list: employees, loading: employeesLoading, placeholder: t.partyTypeEmployee, map: employeeMap };
    }
    if (form.party_type === "supplier") {
      return { list: suppliers, loading: suppliersLoading, placeholder: t.partyTypeSupplier, map: supplierMap };
    }
    if (form.party_type === "general_ledger") {
      return { list: generalLedgers, loading: generalLedgersLoading, placeholder: t.partyTypeGeneralLedger, map: ledgerMap };
    }
    if (form.party_type === "customer") {
      return { list: customers, loading: customersLoading, placeholder: t.partyTypeCustomer, map: customerMap };
    }
    return { list: [], loading: false, placeholder: t.selectPartyName, map: {} };
  }, [form.party_type, employees, employeesLoading, suppliers, suppliersLoading, generalLedgers, generalLedgersLoading, customers, customersLoading, employeeMap, supplierMap, ledgerMap, customerMap, t]);

  const getInvoicePartyType = (inv) =>
    inv?.customer_type || inv?.party_type ||
    (inv?.customer_id ? "customer" : inv?.employee_id ? "employee" : inv?.supplier_id ? "supplier" : inv?.general_ledger_id ? "general_ledger" : "");

  const getInvoicePartyId = (inv) => {
    const type = getInvoicePartyType(inv);
    if (inv?.party_id) return inv.party_id;
    if (type === "employee") return inv?.employee_id || "";
    if (type === "supplier") return inv?.supplier_id || "";
    if (type === "general_ledger") return inv?.general_ledger_id || inv?.ledger_id || inv?.account_id || "";
    return inv?.customer_id || "";
  };

  const getInvoicePartyName = (inv) => {
    const type = getInvoicePartyType(inv);
    const id = getInvoicePartyId(inv);
    const mapName =
      type === "employee" ? employeeMap[String(id)] :
      type === "supplier" ? supplierMap[String(id)] :
      type === "general_ledger" ? ledgerMap[String(id)] :
      customerMap[String(id)];
    const fallback = inv?.party_name || inv?.customer_name || inv?.employee_name || inv?.supplier_name ||
      inv?.general_ledger_name || inv?.ledger_name || inv?.account_name || mapName || "";
    return getPartyLabel(type, id, fallback);
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await axios.get(API_BASE);
      setInvoices(getList(res.data));
    } catch {
      showToast("error", t.invoicesError);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  // Close party dropdown on outside click
  useEffect(() => {
    if (!partyDropdownOpen) return;
    const close = () => setPartyDropdownOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [partyDropdownOpen]);

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur") return;
    setTranslating(true);
    try {
      const nextCache = { ...urduCache };
      await Promise.all(customers.map(async (c) => {
        const id = getRecordId(c);
        const base = getCustomerName(c);
        if (base && !nextCache[`customer:${id}`])
          nextCache[`customer:${id}`] = await translateText(base);
        if (base && !nextCache[`party:customer:${id}`])
          nextCache[`party:customer:${id}`] = await translateText(base);
      }));
      await Promise.all(employees.map(async (e) => {
        const id = getRecordId(e);
        const base = getEmployeeName(e);
        if (base && !nextCache[`party:employee:${id}`])
          nextCache[`party:employee:${id}`] = await translateText(base);
      }));
      await Promise.all(suppliers.map(async (s) => {
        const id = getRecordId(s);
        const base = getSupplierName(s);
        if (base && !nextCache[`party:supplier:${id}`])
          nextCache[`party:supplier:${id}`] = await translateText(base);
      }));
      await Promise.all(generalLedgers.map(async (l) => {
        const id = getRecordId(l);
        const base = getLedgerName(l);
        if (base && !nextCache[`party:general_ledger:${id}`])
          nextCache[`party:general_ledger:${id}`] = await translateText(base);
      }));
      await Promise.all(categories.map(async (c) => {
        const base = getCategoryName(c);
        if (base && !nextCache[`category:${c.id}`])
          nextCache[`category:${c.id}`] = await translateText(base);
      }));
      await Promise.all(products.map(async (p) => {
        const base = getProductName(p);
        if (base && !nextCache[`product:${p.id}`])
          nextCache[`product:${p.id}`] = await translateText(base);
      }));
      await Promise.all(units.map(async (u) => {
        const base = getUnitName(u);
        if (base && !nextCache[`unit:${u.id}`])
          nextCache[`unit:${u.id}`] = await translateText(base);
      }));
      setUrduCache(nextCache);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const ensureInvoicePrintTranslations = async (invoice) => {
    if (lang !== "ur") return urduCache;
    const nextCache = { ...urduCache };
    const invoicePartyType = invoice.customer_type || invoice.party_type || (invoice.customer_id ? "customer" : "");
    const invoicePartyId = invoice.party_id || invoice.customer_id || invoice.employee_id || invoice.supplier_id || invoice.general_ledger_id || "";
    const invoicePartyName = invoice.party_name || invoice.customer_name || invoice.employee_name || invoice.supplier_name || invoice.general_ledger_name || "";
    if (!nextCache[`customer:${invoice.customer_id}`] && invoice.customer_name)
      nextCache[`customer:${invoice.customer_id}`] = await translateText(invoice.customer_name);
    if (invoicePartyType && invoicePartyId && invoicePartyName && !nextCache[`party:${invoicePartyType}:${invoicePartyId}`])
      nextCache[`party:${invoicePartyType}:${invoicePartyId}`] = await translateText(invoicePartyName);
    for (const row of invoice.items || []) {
      const productBase  = row.product_name  || productMap[String(row.product_id)];
      const categoryBase = row.category_name || categoryMap[String(row.category_id)];
      const unitBase     = row.unit_name     || unitMap[String(row.unit_id)];
      if (row.product_id  && productBase  && !nextCache[`product:${row.product_id}`])
        nextCache[`product:${row.product_id}`]   = await translateText(productBase);
      if (row.category_id && categoryBase && !nextCache[`category:${row.category_id}`])
        nextCache[`category:${row.category_id}`] = await translateText(categoryBase);
      if (row.unit_id     && unitBase     && !nextCache[`unit:${row.unit_id}`])
        nextCache[`unit:${row.unit_id}`]         = await translateText(unitBase);
    }
    setUrduCache(nextCache);
    return nextCache;
  };

  const invoiceTotal = useMemo(
    () => items.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [items]
  );

  const activeDeliveryCharges = showDeliveryCharges ? toNumber(form.delivery_charges) : 0;

  const grandTotal = useMemo(
    () => invoiceTotal + toNumber(form.previous_balance) + activeDeliveryCharges - toNumber(form.discount),
    [invoiceTotal, form.previous_balance, activeDeliveryCharges, form.discount]
  );

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    let list = invoices.filter((inv) => {
      if (!inv.invoice_date) return dateFilter === "all";
      const d = new Date(inv.invoice_date);
      if (dateFilter === "24h")   return now - d <= 24 * 60 * 60 * 1000;
      if (dateFilter === "7d")    return now - d <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return true;
    });
    if (!search.trim()) return list;
    return list.filter((inv) => {
      const type = getInvoicePartyType(inv);
      const id = getInvoicePartyId(inv);
      return [
        inv.invoice_no,
        inv.reference_no || "",
        getInvoicePartyName(inv),
        urduCache[`party:${type}:${id}`] || "",
        inv.invoice_date,
        inv.shipment_to || "",
        type || "",
      ].join(" ").toLowerCase().includes(search.toLowerCase());
    });
  }, [invoices, search, dateFilter, customerMap, employeeMap, supplierMap, ledgerMap, urduCache]);

  const summary = useMemo(() => ({
    totalInvoices: invoices.length,
    totalItems:    invoices.reduce((sum, inv) => sum + Number(inv.items_count || inv.items?.length || 0), 0),
    totalValue:    invoices.reduce((sum, inv) => sum + toNumber(inv.grand_total), 0),
  }), [invoices]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...createEmptyForm(), invoice_no: generateInvoiceNo(invoices) });
    setItems([createEmptyItem()]);
    setShowDeliveryCharges(false);
    setShowForm(true);
  };

  const openEdit = async (invoiceId) => {
    try {
      const res = await axios.get(`${API_BASE}/${invoiceId}`);
      const inv = res.data?.data || res.data;
      setEditingId(inv.id);
      const existingDC = toNumber(inv.delivery_charges ?? inv.deliveryCharges ?? 0);
      const savedPartyType = getInvoicePartyType(inv);
      const savedPartyId = getInvoicePartyId(inv);
      setForm({
        invoice_no:       inv.invoice_no || "",
        reference_no:     inv.reference_no || "",
        party_type:       savedPartyType || "",
        party_id:         String(savedPartyId || ""),
        customer_id:      savedPartyType === "customer" ? String(savedPartyId || inv.customer_id || "") : "",
        invoice_date:     inv.invoice_date || new Date().toISOString().slice(0, 10),
        shipment_to:      inv.shipment_to || "",
        previous_balance: String(inv.previous_balance || 0),
        delivery_charges: String(existingDC),
        discount:         String(inv.discount || 0),
      });
      setShowDeliveryCharges(existingDC > 0);
      const invoiceItems = Array.isArray(inv.items) && inv.items.length
        ? inv.items.map((row) => ({
            category_id:       String(row.category_id ?? row.categoryId ?? row.category?.id ?? row.category ?? ""),
            product_id:        String(row.product_id  ?? row.productId  ?? row.product?.id  ?? ""),
            unit_id:           String(row.unit_id     ?? row.unitId     ?? row.unit?.id     ?? row.unit ?? ""),
            sale_type:         String(row.sale_type || "single"),
            carton_qty:        String(row.carton_qty || ""),
            pieces_qty:        String(row.pieces_qty || ""),
            qty:               String(row.qty || row.quantity || ""),
            pieces_per_carton: String(row.pieces_per_carton || 0),
            rate:              String(row.rate   || 0),
            amount:            String(row.amount || 0),
          }))
        : [createEmptyItem()];
      setItems(invoiceItems);
      setShowForm(true);
    } catch {
      showToast("error", t.editError);
    }
  };

  const handlePrint = async (invoiceId) => {
    try {
      const res = await axios.get(`${API_BASE}/${invoiceId}`);
      const inv = res.data?.data || res.data;
      const normalizedItems = (inv.items || []).map((row, index) => ({
        sr:                row.sr || index + 1,
        category_id:       String(row.category_id ?? row.categoryId ?? row.category?.id ?? row.category ?? ""),
        product_id:        String(row.product_id  ?? row.productId  ?? row.product?.id  ?? ""),
        unit_id:           String(row.unit_id     ?? row.unitId     ?? row.unit?.id     ?? row.unit ?? ""),
        category_name:     row.category_name || categoryMap[String(row.category_id ?? row.categoryId ?? row.category?.id ?? row.category ?? "")] || "",
        product_name:      row.product_name  || productMap[String(row.product_id  ?? row.productId  ?? row.product?.id  ?? "")] || "",
        unit_name:         row.unit_name     || unitMap[String(row.unit_id        ?? row.unitId     ?? row.unit?.id     ?? row.unit ?? "")] || "",
        sale_type:         row.sale_type || "single",
        carton_qty:        row.carton_qty || "",
        pieces_qty:        row.pieces_qty || "",
        pieces_per_carton: row.pieces_per_carton || 0,
        qty:               row.qty || row.quantity || "",
        rate:              row.rate   || 0,
        amount:            row.amount || 0,
      }));
      const printPartyType = getInvoicePartyType(inv);
      const printPartyId = getInvoicePartyId(inv);
      const preparedInvoice = {
        ...inv,
        customer_type:    printPartyType,
        party_type:       printPartyType,
        party_id:         printPartyId,
        party_name:       inv.party_name || getInvoicePartyName(inv),
        customer_name:    inv.customer_name || customerMap[String(inv.customer_id)] || "",
        reference_no:     inv.reference_no || "",
        items:            normalizedItems,
        invoice_total:    inv.invoice_total ?? normalizedItems.reduce((s, r) => s + toNumber(r.amount), 0),
        previous_balance: inv.previous_balance || 0,
        delivery_charges: inv.delivery_charges ?? inv.deliveryCharges ?? 0,
        discount:         inv.discount || 0,
        grand_total:      inv.grand_total ?? normalizedItems.reduce((s, r) => s + toNumber(r.amount), 0) + toNumber(inv.previous_balance) + toNumber(inv.delivery_charges ?? inv.deliveryCharges) - toNumber(inv.discount),
      };
      let cacheToUse = urduCache;
      if (lang === "ur") {
        setTranslating(true);
        try {
          const updatedCache = await ensureInvoicePrintTranslations(preparedInvoice);
          if (updatedCache) cacheToUse = updatedCache;
        } finally {
          setTranslating(false);
        }
      }
      generateInvoicePrint(preparedInvoice, lang, cacheToUse);
    } catch {
      showToast("error", t.printError);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/${invoiceId}`);
      showToast("success", t.deleteSuccess);
      fetchInvoices();
    } catch {
      showToast("error", t.deleteError);
    }
  };

  const calculateRow = (row) => {
    const product = products.find((p) => String(p.id) === String(row.product_id));
    const saleUnit        = getProductSaleUnit(product || {});
    const pieceRate       = toNumber(row.rate || getProductPieceRate(product || {}));
    const piecesPerCarton = toNumber(row.pieces_per_carton || getProductPiecesPerCarton(product || {}));
    let qty = 0, amount = 0;
    if (saleUnit === "carton") {
      if (row.sale_type === "carton") { qty = toNumber(row.carton_qty); amount = qty * piecesPerCarton * pieceRate; }
      else                            { qty = toNumber(row.pieces_qty); amount = qty * pieceRate; }
    } else {
      qty = toNumber(row.qty); amount = qty * pieceRate;
    }
    return { qty: String(qty || ""), amount: String(amount.toFixed(2)), rate: String(pieceRate || 0), pieces_per_carton: String(piecesPerCarton || 0) };
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        let updated = { ...row, [field]: value };
        if (field === "category_id") {
          updated.product_id = ""; updated.unit_id = ""; updated.sale_type = "single";
          updated.carton_qty = ""; updated.pieces_qty = ""; updated.qty = "";
          updated.pieces_per_carton = "0"; updated.rate = "0"; updated.amount = "0";
        }
        if (field === "product_id") {
          const sel = products.find((p) => String(p.id) === String(value));
          if (sel) {
            const saleUnit = getProductSaleUnit(sel);
            updated.category_id       = String(getProductCategoryId(sel) || updated.category_id || "");
            updated.unit_id           = String(getProductUnitId(sel) || "");
            updated.rate              = String(getProductPieceRate(sel) || 0);
            updated.pieces_per_carton = String(getProductPiecesPerCarton(sel) || 0);
            updated.sale_type         = saleUnit === "carton" ? "pieces" : "single";
            updated.carton_qty = ""; updated.pieces_qty = ""; updated.qty = "";
          }
        }
        if (field === "sale_type") { updated.carton_qty = ""; updated.pieces_qty = ""; updated.qty = ""; }
        const calc = calculateRow(updated);
        updated.qty = calc.qty; updated.amount = calc.amount;
        updated.rate = calc.rate; updated.pieces_per_carton = calc.pieces_per_carton;
        return updated;
      })
    );
  };

  const addItemRow    = () => setItems((prev) => [...prev, createEmptyItem()]);
  const removeItemRow = (index) => setItems((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));

  const stepDelivery = (delta) => {
    setForm((f) => ({ ...f, delivery_charges: String(toNumber(f.delivery_charges) + delta) }));
  };

  const handleSave = async () => {
    if (!form.invoice_no.trim()) { showToast("error", t.invoiceNoRequired); return; }
    if (!form.party_type)        { showToast("error", t.partyTypeRequired); return; }
    if (!form.party_id)          { showToast("error", t.partyNameRequired); return; }
    const validItems = items.filter((row) => {
      if (!row.category_id || !row.product_id || !row.unit_id) return false;
      const product  = products.find((p) => String(p.id) === String(row.product_id));
      const saleUnit = getProductSaleUnit(product || {});
      if (saleUnit === "carton") {
        if (row.sale_type === "carton") return toNumber(row.carton_qty) > 0;
        return toNumber(row.pieces_qty) > 0;
      }
      return toNumber(row.qty) > 0;
    });
    if (!validItems.length) { showToast("error", t.validItemRequired); return; }
    const preparedItems = validItems.map((row, idx) => ({
      sr:                idx + 1,
      category_id:       Number(row.category_id),
      product_id:        Number(row.product_id),
      unit_id:           Number(row.unit_id),
      sale_type:         row.sale_type || "single",
      carton_qty:        toNumber(row.carton_qty),
      pieces_qty:        toNumber(row.pieces_qty),
      qty:               toNumber(row.qty),
      pieces_per_carton: toNumber(row.pieces_per_carton),
      rate:              toNumber(row.rate),
      amount:            toNumber(row.amount),
    }));
    const dcValue  = showDeliveryCharges ? toNumber(form.delivery_charges) : 0;
    const invTotal = preparedItems.reduce((s, r) => s + toNumber(r.amount), 0);
    const selectedPartyId = Number(form.party_id);
    const payload = {
      invoice_no:       form.invoice_no.trim(),
      reference_no:     form.reference_no.trim(),
      customer_type:    form.party_type,
      party_type:       form.party_type,
      party_id:         selectedPartyId,
      customer_id:      form.party_type === "customer" ? selectedPartyId : null,
      employee_id:      form.party_type === "employee" ? selectedPartyId : null,
      supplier_id:      form.party_type === "supplier" ? selectedPartyId : null,
      general_ledger_id: form.party_type === "general_ledger" ? selectedPartyId : null,
      invoice_date:     form.invoice_date,
      shipment_to:      form.shipment_to || "",
      previous_balance: toNumber(form.previous_balance),
      delivery_charges: dcValue,
      discount:         toNumber(form.discount),
      invoice_total:    invTotal,
      grand_total:      invTotal + toNumber(form.previous_balance) + dcValue - toNumber(form.discount),
      items:            preparedItems,
    };
    try {
      if (editingId) { await axios.put(`${API_BASE}/${editingId}`, payload); showToast("success", t.updateSuccess); }
      else           { await axios.post(API_BASE, payload);                  showToast("success", t.saveSuccess);   }
      setShowForm(false); setEditingId(null);
      setForm(createEmptyForm()); setItems([createEmptyItem()]); setShowDeliveryCharges(false);
      fetchInvoices();
    } catch {
      showToast("error", t.saveError);
    }
  };

  return (
    <div
      dir={dir}
      style={{ fontFamily: baseFont }}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-2 sm:p-4 pb-16"
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes softIn { from{opacity:0;transform:translateY(12px) scale(0.98);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes gentlePulse { 0%,100%{box-shadow:0 12px 32px rgba(14,165,233,0.10);} 50%{box-shadow:0 16px 42px rgba(14,165,233,0.18);} }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        .animate-soft-in { animation: softIn 0.35s ease-out both; }
        .animate-soft-in-slow { animation: softIn 0.55s ease-out both; }
        .animated-total { animation: gentlePulse 2.4s ease-in-out infinite; }
        .animate-drop-in { animation: dropIn 0.2s ease-out both; }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(15,23,42,0.10); border-color: #bae6fd; }
        .low-box-pattern {
          background-image: radial-gradient(circle at top left, rgba(14,165,233,0.12), transparent 30%),
            linear-gradient(135deg, rgba(240,249,255,0.9), rgba(255,255,255,0.96));
        }
        .dc-side-btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; border:1.5px solid; transition:all 0.15s; }
        .dc-side-btn.add-btn { background:#f0fdf4; border-color:#86efac; color:#15803d; }
        .dc-side-btn.add-btn:hover { background:#dcfce7; }
        .dc-side-btn.minus-btn { background:#fef2f2; border-color:#fca5a5; color:#b91c1c; }
        .dc-side-btn.minus-btn:hover { background:#fee2e2; }
        .dc-side-btn.remove-btn { background:#f8fafc; border-color:#cbd5e1; color:#64748b; }
        .dc-side-btn.remove-btn:hover { background:#f1f5f9; }
        .dc-dashed-btn { width:100%; min-height:80px; border:2px dashed #bae6fd; border-radius:14px; background:transparent; color:#0ea5e9; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; }
        .dc-dashed-btn:hover { background:#f0f9ff; border-color:#38bdf8; transform:translateY(-1px); }
        .dc-dashed-btn .plus-orb { width:28px; height:28px; border-radius:50%; background:#e0f2fe; display:flex; align-items:center; justify-content:center; font-size:18px; color:#0284c7; }
        .party-dropdown-item { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; border-radius:10px; transition:background 0.12s; }
        .party-dropdown-item:hover { background:#f0f9ff; }
        .party-dropdown-item.active { background:#e0f2fe; }
        .party-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
      `}</style>

      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${message.type === "error" ? "bg-rose-600" : "bg-sky-600"}`}>
          <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {message.text}
        </div>
      )}

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-1.5">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="animate-soft-in low-box-pattern bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5 mb-6">
          <div className={`flex items-center justify-between gap-4 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>
            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button onClick={handleLangToggle} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm">
                <i className="bi bi-translate"></i>{t.toggleLang}
              </button>
              <button onClick={() => setShowSummary((v) => !v)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition shadow-sm ${showSummary ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`}>
                <i className="bi bi-bar-chart-line-fill"></i>{t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-sm`}></i>
              </button>
              <button onClick={openAdd} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-xl shadow-lg shadow-sky-200 font-semibold text-sm flex items-center gap-1.5">
                <i className="bi bi-file-earmark-plus-fill"></i>{t.newInvoice}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-sky-100">
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-3"><i className="bi bi-receipt"></i></div>
                <p className="text-sm text-slate-500 mb-1">{t.totalInvoices}</p>
                <p className="text-3xl font-extrabold text-slate-950">{summary.totalInvoices}</p>
              </div>
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-3"><i className="bi bi-box-seam"></i></div>
                <p className="text-sm text-slate-500 mb-1">{t.totalItems}</p>
                <p className="text-3xl font-extrabold text-slate-950">{summary.totalItems}</p>
              </div>
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm mb-3"><i className="bi bi-cash-stack"></i></div>
                <p className="text-sm text-slate-500 mb-1">{t.totalValue}</p>
                <p className="text-2xl font-extrabold text-slate-950">{money(summary.totalValue)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Search & filters ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <i className={`bi bi-search absolute ${isUrdu ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full rounded-xl border border-sky-100 bg-white ${isUrdu ? "pr-10 pl-3 text-right" : "pl-10 pr-3"} py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-100 shadow-sm`} />
          </div>
          <div className={`flex items-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <span className="text-sm font-semibold text-slate-500">{t.filterLabel}</span>
            {[
              { key: "24h",   label: t.filter24h,   icon: "bi-clock" },
              { key: "7d",    label: t.filter7d,    icon: "bi-calendar-week" },
              { key: "month", label: t.filterMonth, icon: "bi-calendar-month" },
              { key: "all",   label: t.filterAll,   icon: "bi-list-ul" },
            ].map((f) => (
              <button key={f.key} onClick={() => setDateFilter(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${dateFilter === f.key ? "bg-sky-600 text-white shadow-sky-200" : "bg-white border border-sky-100 text-sky-700 hover:bg-sky-50"}`}>
                <i className={`bi ${f.icon}`}></i>{f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Invoice form modal ── */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 p-2 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mt-3">
              <div className={`px-5 sm:px-6 py-4 border-b border-sky-100 flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                    <i className="bi bi-receipt text-sky-700 text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-black">{editingId ? t.editTitle : t.newTitle}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t.formSubtitle}</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-3 sm:p-5">
                <div className="animate-soft-in rounded-[28px] border border-sky-100 bg-sky-50/50 p-3 sm:p-4 shadow-inner low-box-pattern">
                  {mastersError && (
                    <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                      {t.masterError}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <button onClick={refetchCustomers} className="px-3 py-1 rounded-lg bg-white border">{t.customers}</button>
                        <button onClick={refetchEmployees} className="px-3 py-1 rounded-lg bg-white border">{t.partyTypeEmployee}</button>
                        <button onClick={refetchSuppliers} className="px-3 py-1 rounded-lg bg-white border">{t.partyTypeSupplier}</button>
                        <button onClick={refetchGeneralLedgers} className="px-3 py-1 rounded-lg bg-white border">{t.partyTypeGeneralLedger}</button>
                        <button onClick={refetchCategories} className="px-3 py-1 rounded-lg bg-white border">{t.categories}</button>
                        <button onClick={refetchProducts} className="px-3 py-1 rounded-lg bg-white border">{t.products}</button>
                        <button onClick={refetchUnits} className="px-3 py-1 rounded-lg bg-white border">{t.units}</button>
                      </div>
                    </div>
                  )}

                  {/* ── Invoice Information Box ── */}
                  <div className="rounded-3xl border border-sky-100 bg-white shadow-sm overflow-visible">
                    <div className={`px-4 py-3 border-b border-sky-100 bg-white flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                        <span className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                          <i className="bi bi-person-lines-fill"></i>
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-950">Invoice Information</h3>
                          <p className="text-xs text-slate-500">All main fields are inside one aligned box.</p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700 border border-sky-100">
                        Box Layout
                      </span>
                    </div>

                    {/* First row: Invoice No, Reference No, Customer Type, Dynamic Name, Date, Shipment To */}
                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

                      {/* Invoice No */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5">
                        <label className={labelClass}>
                          {t.invoiceNo} *
                          <span className="ml-2 text-[10px] font-normal text-sky-500 bg-white px-2 py-0.5 rounded-full border border-sky-100">Auto</span>
                        </label>
                        <input type="text" value={form.invoice_no}
                          onChange={(e) => setForm((f) => ({ ...f, invoice_no: e.target.value }))}
                          className={`${inputCls} font-mono bg-white`} />
                      </div>

                      {/* Reference No */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5">
                        <label className={labelClass}>{t.referenceNo}</label>
                        <input type="text" value={form.reference_no}
                          onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))}
                          placeholder="e.g. PO-2025-001"
                          className={`${inputCls} bg-white`} />
                      </div>

                      {/* Customer Type */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5">
                        <label className={labelClass}>{t.partyType} *</label>
                        <select
                          value={form.party_type}
                          onChange={(e) => {
                            const nextType = e.target.value;
                            setForm((f) => ({
                              ...f,
                              party_type: nextType,
                              party_id: "",
                              customer_id: "",
                            }));
                          }}
                          className={`${inputCls} bg-white`}
                        >
                          <option value="">{t.selectPartyType}</option>
                          {PARTY_TYPES.map((pt) => (
                            <option key={pt.value} value={pt.value}>
                              {t[pt.labelKey]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic Name Dropdown */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5">
                        <label className={labelClass}>
                          {selectedPartyType ? t[selectedPartyType.labelKey] : t.partyName} *
                        </label>
                        <select
                          value={form.party_id}
                          disabled={!form.party_type || selectedPartyData.loading}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            setForm((f) => ({
                              ...f,
                              party_id: selectedId,
                              customer_id: f.party_type === "customer" ? selectedId : "",
                            }));
                          }}
                          className={`${inputCls} bg-white disabled:bg-slate-100 disabled:text-slate-400`}
                        >
                          <option value="">
                            {!form.party_type
                              ? t.selectPartyType
                              : selectedPartyData.loading
                                ? t.loadingMaster
                                : `${t.selectPartyName} (${selectedPartyData.placeholder})`}
                          </option>
                          {selectedPartyData.list.map((record) => {
                            const id = getRecordId(record);
                            const label = getPartyEntityName(form.party_type, record) || `#${id}`;
                            return (
                              <option key={`${form.party_type}-${id}`} value={id}>
                                {getPartyLabel(form.party_type, id, label)}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Date */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5">
                        <label className={labelClass}>{t.date}</label>
                        <input type="date" value={form.invoice_date}
                          onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))}
                          className={`${inputCls} bg-white`} />
                      </div>

                      {/* Shipment To */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-2.5">
                        <label className={labelClass}>{t.shipmentTo}</label>
                        <input type="text" value={form.shipment_to}
                          onChange={(e) => setForm((f) => ({ ...f, shipment_to: e.target.value }))}
                          className={`${inputCls} bg-white`} />
                      </div>

                    </div>
                  </div>

                  {/* ── Items Box ── */}
                  <div className="mt-3 rounded-3xl border border-sky-100 bg-white shadow-sm overflow-hidden">
                    <div className={`px-4 py-3 border-b border-sky-100 bg-white flex items-center justify-between gap-3 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                        <span className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                          <i className="bi bi-box-seam"></i>
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-950">{t.items}</h3>
                          <p className="text-xs text-slate-500">{t.itemsSubtitle}</p>
                        </div>
                      </div>
                      <button onClick={addItemRow}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                        <i className="bi bi-plus-lg"></i>{t.newLine}
                      </button>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3">
                      {items.map((row, index) => {
                        const selectedProduct = products.find((p) => String(p.id) === String(row.product_id));
                        const productSaleUnit = getProductSaleUnit(selectedProduct || {});
                        const isCartonProduct = productSaleUnit === "carton";
                        const matchedProducts = products.filter((p) => !row.category_id || String(getProductCategoryId(p)) === String(row.category_id));
                        const filteredProducts = !row.category_id ? products : matchedProducts.length ? matchedProducts : products;
                        return (
                          <div key={index} className="animate-soft-in-slow hover-lift rounded-2xl border border-sky-100 bg-sky-50/40 overflow-hidden">
                            <div className={`px-3 py-2 border-b border-sky-100 bg-white flex items-center justify-between gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                              <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                                <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xs font-extrabold font-mono">{index + 1}</span>
                                <p className="text-sm font-extrabold text-slate-950">Item Row</p>
                              </div>
                              <button onClick={() => removeItemRow(index)} disabled={items.length === 1}
                                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center">
                                <i className="bi bi-trash3 text-sm"></i>
                              </button>
                            </div>
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-end">
                              <div className="lg:col-span-2 rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.category}</label>
                                <select value={row.category_id}
                                  onChange={(e) => handleItemChange(index, "category_id", e.target.value)}
                                  className={inputCls}>
                                  <option value="">{categoriesLoading ? t.loadingMaster : t.selectCategory}</option>
                                  {categories.map((c) => <option key={c.id} value={c.id}>{getTranslatedMapValue("category", c.id, getCategoryName(c))}</option>)}
                                </select>
                              </div>
                              <div className="lg:col-span-2 rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.product}</label>
                                <select value={row.product_id}
                                  onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                                  className={inputCls}>
                                  <option value="">{productsLoading ? t.loadingMaster : t.selectProduct}</option>
                                  {filteredProducts.map((p) => <option key={p.id} value={p.id}>{getTranslatedMapValue("product", p.id, getProductName(p))}</option>)}
                                </select>
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.unit}</label>
                                <select value={row.unit_id}
                                  onChange={(e) => handleItemChange(index, "unit_id", e.target.value)}
                                  className={inputCls}>
                                  <option value="">{unitsLoading ? t.loadingMaster : t.selectUnit}</option>
                                  {units.map((u) => <option key={u.id} value={u.id}>{getTranslatedMapValue("unit", u.id, getUnitName(u))}</option>)}
                                </select>
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.saleType}</label>
                                {isCartonProduct ? (
                                  <select value={row.sale_type}
                                    onChange={(e) => handleItemChange(index, "sale_type", e.target.value)}
                                    className={inputCls}>
                                    <option value="pieces">{t.pieces}</option>
                                    <option value="carton">{t.carton}</option>
                                  </select>
                                ) : (
                                  <input readOnly type="text" value={t.single} className={readonlyClass} />
                                )}
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.piecesPerCarton}</label>
                                <input readOnly type="text" value={row.pieces_per_carton || "0"} className={readonlyClass} />
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.cartonQty}</label>
                                <input type="number" value={row.carton_qty}
                                  onChange={(e) => handleItemChange(index, "carton_qty", e.target.value)}
                                  disabled={!isCartonProduct || row.sale_type !== "carton"}
                                  className={`${inputCls} font-mono disabled:bg-slate-100 disabled:text-slate-400`} />
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.piecesQty}</label>
                                <input type="number" value={row.pieces_qty}
                                  onChange={(e) => handleItemChange(index, "pieces_qty", e.target.value)}
                                  disabled={!isCartonProduct || row.sale_type !== "pieces"}
                                  className={`${inputCls} font-mono disabled:bg-slate-100 disabled:text-slate-400`} />
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.qty}</label>
                                <input type="text" readOnly value={row.qty} className={readonlyClass} />
                              </div>
                              <div className="rounded-xl border border-sky-100 bg-white p-2">
                                <label className={labelClass}>{t.rate}</label>
                                <input type="text" readOnly value={money(row.rate)} className={readonlyClass} />
                              </div>
                              <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-2">
                                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">{t.amount}</label>
                                <div className={`w-full rounded-lg bg-white border border-sky-100 px-2 py-1.5 text-xs font-extrabold text-slate-950 font-mono truncate ${isUrdu ? "text-left" : "text-right"}`}>
                                  {money(row.amount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── TOTALS BOX ── */}
                  <div className="mt-3 rounded-3xl border border-sky-100 bg-white shadow-sm overflow-hidden">
                    <div className={`px-4 py-3 border-b border-sky-100 bg-white flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <span className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                        <i className="bi bi-calculator-fill"></i>
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950">Totals</h3>
                        <p className="text-xs text-slate-500">Invoice total + prev balance + delivery − discount = grand total</p>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                      {/* Invoice Total */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3 hover-lift flex flex-col gap-1">
                        <p className="text-xs text-slate-500">{t.invoiceTotal}</p>
                        <div className="text-lg font-extrabold text-slate-950 font-mono">{money(invoiceTotal)}</div>
                      </div>

                      {/* Previous Balance */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3 hover-lift flex flex-col gap-1">
                        <label className="text-xs text-slate-500">{t.previousBalance}</label>
                        <input type="number" value={form.previous_balance}
                          onChange={(e) => setForm((f) => ({ ...f, previous_balance: e.target.value }))}
                          className="w-full rounded-xl bg-white border border-sky-100 px-3 py-2 text-base font-extrabold text-slate-950 font-mono outline-none focus:ring-2 focus:ring-sky-100" />
                      </div>

                      {/* Delivery Charges */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3 hover-lift flex flex-col gap-1">
                        {!showDeliveryCharges ? (
                          <button type="button"
                            onClick={() => { setShowDeliveryCharges(true); setForm((f) => ({ ...f, delivery_charges: f.delivery_charges || "0" })); }}
                            className="dc-dashed-btn">
                            <span className="plus-orb">+</span>
                            <span>{t.pressAddDelivery}</span>
                          </button>
                        ) : (
                          <>
                            <div className={`flex items-center justify-between gap-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
                              <label className="text-xs text-slate-500">{t.deliveryCharges}</label>
                            </div>
                            <div className={`flex gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                              <button type="button" onClick={() => stepDelivery(50)}  className="dc-side-btn add-btn"><i className="bi bi-plus-lg" style={{fontSize:"10px"}}></i> +50</button>
                              <button type="button" onClick={() => stepDelivery(100)} className="dc-side-btn add-btn"><i className="bi bi-plus-lg" style={{fontSize:"10px"}}></i> +100</button>
                              <button type="button" onClick={() => stepDelivery(-50)} className="dc-side-btn minus-btn"><i className="bi bi-dash-lg" style={{fontSize:"10px"}}></i> −50</button>
                              <button type="button"
                                onClick={() => { setShowDeliveryCharges(false); setForm((f) => ({ ...f, delivery_charges: "0" })); }}
                                className="dc-side-btn remove-btn">
                                <i className="bi bi-x-lg" style={{fontSize:"10px"}}></i> {t.removeDelivery}
                              </button>
                            </div>
                            <input type="number" value={form.delivery_charges}
                              onChange={(e) => setForm((f) => ({ ...f, delivery_charges: e.target.value }))}
                              className="w-full rounded-xl bg-white border border-sky-100 px-3 py-2 text-base font-extrabold text-slate-950 font-mono outline-none focus:ring-2 focus:ring-sky-100"
                              autoFocus />
                            <p className="text-[10px] text-slate-400">
                              {isUrdu ? "منفی قدر = کل سے منہا ہوگی" : "Negative value deducts from total"}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Discount */}
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3 hover-lift flex flex-col gap-1">
                        <label className="text-xs text-slate-500">{t.discount}</label>
                        <input type="number" value={form.discount}
                          onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                          className="w-full rounded-xl bg-white border border-sky-100 px-3 py-2 text-base font-extrabold text-slate-950 font-mono outline-none focus:ring-2 focus:ring-sky-100" />
                      </div>

                      {/* Grand Total */}
                      <div className="animated-total rounded-2xl border border-sky-200 bg-sky-100 p-3 flex flex-col gap-1">
                        <p className="text-xs text-slate-600">{t.grandTotal}</p>
                        <div className="text-2xl font-extrabold text-slate-950 font-mono">{money(grandTotal)}</div>
                        <p className="text-[10px] text-sky-700 font-mono leading-tight mt-1">
                          {money(invoiceTotal)}
                          {toNumber(form.previous_balance) !== 0 ? ` + ${money(form.previous_balance)}` : ""}
                          {showDeliveryCharges && toNumber(form.delivery_charges) !== 0
                            ? ` ${toNumber(form.delivery_charges) >= 0 ? "+" : "−"} ${money(Math.abs(toNumber(form.delivery_charges)))}`
                            : ""}
                          {toNumber(form.discount) !== 0 ? ` − ${money(form.discount)}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save / Cancel */}
                  <div className={`mt-3 rounded-3xl border border-sky-100 bg-white shadow-sm p-3 flex gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                    <button onClick={handleSave} disabled={mastersLoading}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-2xl py-3 font-semibold text-sm shadow-lg shadow-sky-200 transition active:scale-[0.99]">
                      {editingId ? t.updateInvoice : t.saveInvoice}
                    </button>
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 border border-sky-200 bg-white hover:bg-sky-50 text-sky-700 rounded-2xl py-3 font-semibold text-sm transition active:scale-[0.99]">
                      {t.cancel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Invoices list table ── */}
        <div className="animate-soft-in bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-xs text-slate-600">
              <thead className="bg-sky-50 border-b border-sky-100">
                <tr className="text-slate-600 text-sm font-bold">
                  <th className="px-2 py-2 text-center w-10">{t.col_no}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.col_invoiceNo}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.referenceNo}</th>
                  <th className="px-2 py-2 text-center">{t.partyType}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.partyName}</th>
                  <th className="px-2 py-2 text-center">{t.col_date}</th>
                  <th className="px-2 py-2 text-center">{t.col_items}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_invoiceTotal}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_prevBalance}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_deliveryCharges}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_discount}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_grandTotal}</th>
                  <th className="px-2 py-2 text-center">{t.col_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loadingInvoices ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2 text-sm">{t.loading}</p>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-slate-400 text-sm">{t.noRecords}</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const invoicePartyType = getInvoicePartyType(inv);
                    const ptObj = PARTY_TYPES.find((p) => p.value === invoicePartyType);
                    const ptColors = ptObj ? PARTY_COLOR[ptObj.color] : null;
                    return (
                      <tr key={inv.id} className="hover:bg-sky-50/60">
                        <td className="px-2 py-2 text-center text-slate-400 font-mono text-sm">{idx + 1}</td>
                        <td className="px-2 py-2 font-bold font-mono text-slate-950 text-sm">{inv.invoice_no}</td>
                        <td className="px-2 py-2 font-mono text-slate-600 text-sm">{inv.reference_no || <span className="text-slate-300">—</span>}</td>
                        <td className="px-2 py-2 text-center">
                          {ptObj ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border ${ptColors.badge}`}>
                              <i className={`bi ${ptObj.icon}`}></i>
                              {t[ptObj.labelKey]}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 font-semibold text-black text-sm">
                          {getInvoicePartyName(inv)}
                        </td>
                        <td className="px-2 py-2 text-center text-black font-mono text-sm">{inv.invoice_date || "-"}</td>
                        <td className="px-2 py-2 text-center">
                          <span className="inline-block px-3 py-1.5 rounded-full bg-sky-100 text-black text-sm font-bold border border-sky-200">
                            {inv.items_count || inv.items?.length || 0}
                          </span>
                        </td>
                        <td className={`px-2 py-2 font-mono text-black text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.invoice_total)}</td>
                        <td className={`px-2 py-2 font-mono text-black text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.previous_balance)}</td>
                        <td className={`px-2 py-2 font-mono text-black text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.delivery_charges ?? inv.deliveryCharges)}</td>
                        <td className={`px-2 py-2 font-mono text-black text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.discount)}</td>
                        <td className={`px-2 py-2 font-mono font-bold text-slate-950 text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.grand_total)}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openEdit(inv.id)} className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center justify-center" title="Edit">
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button onClick={() => handleDelete(inv.id)} className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center" title="Delete">
                              <i className="bi bi-trash3"></i>
                            </button>
                            <button onClick={() => handlePrint(inv.id)} className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center" title={t.downloadPdf}>
                              <i className="bi bi-printer-fill"></i>
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

export default SalesInvoicePage;
