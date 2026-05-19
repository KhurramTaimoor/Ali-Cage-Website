import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import axios from "axios";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Sales Invoice",
    subtitle: "Multi-product, carton pieces, discount & printable invoice",
    newInvoice: "New Invoice",
    summaryBtn: "Summary",
    searchPlaceholder: "Search invoice no, customer or date…",
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
    items: "Line Items",
    itemsSubtitle: "Select category, product and quantity per line",
    newLine: "Add Line",
    category: "Category",
    product: "Product",
    productDescription: "Product Description",
    productDescriptionPlaceholder: "Specs, notes, batch info, special instructions…",
    productDescriptionHint: "Optional · Appears on printed invoice",
    unit: "Unit",
    saleType: "Sale Type",
    single: "Single",
    carton: "Carton",
    pieces: "Pieces",
    cartonQty: "Carton Qty",
    piecesQty: "Pieces Qty",
    piecesPerCarton: "Pcs/Ctn",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    delete: "Delete",
    invoiceTotal: "Invoice Total",
    prevBalance: "Prev Balance",
    grandTotal: "Grand Total",
    saveInvoice: "Save Invoice",
    updateInvoice: "Update Invoice",
    cancel: "Cancel",
    editTitle: "Edit Invoice",
    newTitle: "New Sales Invoice",
    formSubtitle: "Carton / pieces with discount and shipment details",
    col_no: "#",
    col_invoiceNo: "Invoice No",
    col_customer: "Customer",
    col_date: "Date",
    col_items: "Items",
    col_invoiceTotal: "Invoice Total",
    col_prevBalance: "Prev Bal",
    col_discount: "Discount",
    col_deliveryCharges: "Delivery",
    col_grandTotal: "Grand Total",
    col_actions: "Actions",
    loading: "Loading invoices…",
    noRecords: "No invoices found.",
    loadingMaster: "Loading…",
    selectCategory: "Select Category",
    selectProduct: "Select Product",
    selectUnit: "Select Unit",
    selectCustomer: "Select Customer",
    masterError: "Master data load issue:",
    deleteConfirm: "Delete this invoice?",
    deleteSuccess: "Invoice deleted.",
    deleteError: "Delete failed.",
    saveSuccess: "Invoice saved.",
    updateSuccess: "Invoice updated.",
    saveError: "Save failed. Check backend.",
    printError: "Could not load invoice for print.",
    editError: "Could not load invoice details.",
    invoicesError: "Invoices could not be loaded.",
    validItemRequired: "Add at least one valid item.",
    toggleLang: "اردو",
    customers: "Customers",
    categories: "Categories",
    products: "Products",
    units: "Units",
    totalInvoices: "Total Invoices",
    totalItems: "Total Items",
    totalValue: "Total Value",
    filterAll: "All",
    filter24h: "24 Hours",
    filter7d: "7 Days",
    filterMonth: "This Month",
    filterLabel: "Filter",
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
    partyType: "Customer Type",
    selectPartyType: "Select Customer Type",
    partyTypeRequired: "Please select a customer type.",
    partyName: "Name",
    selectPartyName: "Select Name",
    partyNameRequired: "Please select a name.",
    partyTypeCustomer: "Customer",
    partyTypeEmployee: "Employee",
    partyTypeGeneralLedger: "General Ledger",
    partyTypeSupplier: "Supplier",
    descClear: "Clear",
    descChars: "chars",
    itemRow: "Item",
  },
  ur: {
    title: "سیلز انوائس",
    subtitle: "ملٹی پروڈکٹس، کارٹن پیسز، ڈسکاؤنٹ اور پرنٹ ایبل انوائس",
    newInvoice: "نئی انوائس",
    summaryBtn: "سمری",
    searchPlaceholder: "انوائس نمبر، گاہک یا تاریخ…",
    invoiceNo: "انوائس نمبر",
    invoiceNoRequired: "انوائس نمبر ضروری ہے۔",
    referenceNo: "ریفرنس نمبر",
    customer: "گاہک",
    customerRequired: "گاہک منتخب کریں۔",
    date: "تاریخ",
    shipmentTo: "شپمنٹ ٹو",
    previousBalance: "سابقہ رقم",
    discount: "ڈسکاؤنٹ",
    deliveryCharges: "ڈیلیوری چارجز",
    pressAddDelivery: "ڈیلیوری شامل کریں",
    removeDelivery: "ہٹائیں",
    items: "آئٹمز",
    itemsSubtitle: "ہر لائن میں کیٹیگری، پروڈکٹ اور مقدار",
    newLine: "نئی لائن",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    productDescription: "تفصیل",
    productDescriptionPlaceholder: "اسپیک، نوٹ، بیچ معلومات…",
    productDescriptionHint: "اختیاری · پرنٹ پر ظاہر ہوگا",
    unit: "یونٹ",
    saleType: "قسم",
    single: "سنگل",
    carton: "کارٹن",
    pieces: "پیسز",
    cartonQty: "کارٹن",
    piecesQty: "پیسز",
    piecesPerCarton: "فی کارٹن",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",
    delete: "حذف",
    invoiceTotal: "ٹوٹل",
    prevBalance: "سابقہ",
    grandTotal: "کل رقم",
    saveInvoice: "محفوظ کریں",
    updateInvoice: "اپڈیٹ کریں",
    cancel: "منسوخ",
    editTitle: "ترمیم",
    newTitle: "نئی سیلز انوائس",
    formSubtitle: "کارٹن / پیسز انوائس",
    col_no: "#",
    col_invoiceNo: "انوائس نمبر",
    col_customer: "گاہک",
    col_date: "تاریخ",
    col_items: "آئٹمز",
    col_invoiceTotal: "رقم",
    col_prevBalance: "سابقہ",
    col_discount: "ڈسکاؤنٹ",
    col_deliveryCharges: "ڈیلیوری",
    col_grandTotal: "کل رقم",
    col_actions: "اقدامات",
    loading: "لوڈ ہو رہا ہے…",
    noRecords: "کوئی انوائس نہیں۔",
    loadingMaster: "لوڈ…",
    selectCategory: "کیٹیگری منتخب کریں",
    selectProduct: "پروڈکٹ منتخب کریں",
    selectUnit: "یونٹ منتخب کریں",
    selectCustomer: "گاہک منتخب کریں",
    masterError: "Master data load issue:",
    deleteConfirm: "یہ انوائس حذف کریں؟",
    deleteSuccess: "انوائس حذف ہو گئی۔",
    deleteError: "حذف نہیں ہوئی۔",
    saveSuccess: "انوائس محفوظ ہو گئی۔",
    updateSuccess: "انوائس اپڈیٹ ہو گئی۔",
    saveError: "محفوظ نہیں ہوئی۔",
    printError: "پرنٹ لوڈ نہیں ہوئی۔",
    editError: "تفصیل لوڈ نہیں ہوئی۔",
    invoicesError: "انوائسز لوڈ نہیں ہوئیں۔",
    validItemRequired: "کم از کم ایک آئٹم شامل کریں۔",
    toggleLang: "English",
    customers: "Customers",
    categories: "Categories",
    products: "Products",
    units: "Units",
    totalInvoices: "کل انوائسز",
    totalItems: "کل آئٹمز",
    totalValue: "کل رقم",
    filterAll: "سب",
    filter24h: "24 گھنٹے",
    filter7d: "7 دن",
    filterMonth: "یہ مہینہ",
    filterLabel: "فلٹر",
    slipTitle: "سیلز انوائس رسید",
    slipCustomer: "گاہک",
    slipDate: "تاریخ",
    slipShipmentTo: "شپمنٹ",
    slipRefNo: "ریفرنس",
    slipPrevBalance: "سابقہ رقم",
    slipDiscount: "ڈسکاؤنٹ",
    slipDeliveryCharges: "ڈیلیوری",
    slipInvoiceTotal: "ٹوٹل",
    slipGrandTotal: "کل رقم",
    slipPrintedOn: "تیار کردہ",
    slipThank: "آپ کے کاروبار کا شکریہ!",
    companyName: "علی کیجز",
    totalLabel: "کل",
    translating: "ترجمہ ہو رہا ہے…",
    downloadPdf: "پرنٹ / پی ڈی ایف",
    savePdfHint: '"Save as PDF" منتخب کریں',
    na: "-",
    partyType: "کسٹمر ٹائپ",
    selectPartyType: "ٹائپ منتخب کریں",
    partyTypeRequired: "کسٹمر ٹائپ ضروری ہے۔",
    partyName: "نام",
    selectPartyName: "نام منتخب کریں",
    partyNameRequired: "نام ضروری ہے۔",
    partyTypeCustomer: "گاہک",
    partyTypeEmployee: "ملازم",
    partyTypeGeneralLedger: "جنرل لیجر",
    partyTypeSupplier: "سپلائر",
    descClear: "صاف",
    descChars: "حروف",
    itemRow: "آئٹم",
  },
};

const PARTY_TYPES = [
  { value: "customer",       labelKey: "partyTypeCustomer",      icon: "bi-person-fill",           color: "#0ea5e9" },
  { value: "employee",       labelKey: "partyTypeEmployee",      icon: "bi-person-badge-fill",     color: "#10b981" },
  { value: "general_ledger", labelKey: "partyTypeGeneralLedger", icon: "bi-journal-bookmark-fill", color: "#8b5cf6" },
  { value: "supplier",       labelKey: "partyTypeSupplier",      icon: "bi-truck",                 color: "#f59e0b" },
];

const PARTY_BADGE_STYLE = {
  customer:       "background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;",
  employee:       "background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;",
  general_ledger: "background:#ede9fe;color:#5b21b6;border:1px solid #c4b5fd;",
  supplier:       "background:#fef3c7;color:#92400e;border:1px solid #fcd34d;",
};

const API_ROOT            = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE            = `${API_ROOT}/api/sales-invoices`;
const CUSTOMERS_API       = `${API_ROOT}/api/customers`;
const EMPLOYEES_API       = `${API_ROOT}/api/employees`;
const SUPPLIERS_API       = `${API_ROOT}/api/suppliers`;
const GENERAL_LEDGERS_API = `${API_ROOT}/api/general-ledgers`;
const CATEGORIES_API      = `${API_ROOT}/api/categories`;
const PRODUCTS_API        = `${API_ROOT}/api/products`;
const UNITS_API           = `${API_ROOT}/api/units`;

const DESC_MAX = 500;

const getList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.products)) return d.products;
  if (Array.isArray(d?.result)) return d.result;
  return [];
};

const money    = (v) => Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const toNum    = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

const getCustomerName  = (o) => o?.customer_name  || o?.customer_name_en  || o?.name || o?.name_en || o?.title || "";
const getEmployeeName  = (o) => o?.employee_name  || o?.employee_name_en  || o?.full_name || o?.name || o?.name_en || o?.title || "";
const getSupplierName  = (o) => o?.supplier_name  || o?.supplier_name_en  || o?.vendor_name || o?.name || o?.name_en || o?.title || "";
const getLedgerName    = (o) => o?.ledger_name    || o?.ledger_name_en    || o?.account_name || o?.account_title || o?.name || o?.name_en || o?.title || "";
const getRecordId      = (o) => o?.id ?? o?.value ?? o?.customer_id ?? o?.employee_id ?? o?.supplier_id ?? o?.ledger_id ?? o?.general_ledger_id ?? o?.account_id ?? "";
const getCategoryName  = (o) => o?.category_name  || o?.category_name_en  || o?.name || o?.name_en || o?.title || "";
const getProductName   = (o) => o?.product_name   || o?.product_name_en   || o?.name || o?.name_en || o?.item_name || o?.title || "";
const getProductDesc   = (o) => o?.product_description || o?.product_description_en || o?.description || o?.details || o?.product_details || o?.remarks || "";
const getUnitName      = (o) => o?.unit_name      || o?.unit_name_en      || o?.name || o?.name_en || o?.symbol || o?.title || "";
const getPartyEntityName = (type, obj) => {
  if (type === "employee")       return getEmployeeName(obj);
  if (type === "supplier")       return getSupplierName(obj);
  if (type === "general_ledger") return getLedgerName(obj);
  return getCustomerName(obj);
};
const getProductCatId      = (p) => p?.category_id ?? p?.categoryId ?? p?.cat_id ?? p?.product_category_id ?? p?.category?.id ?? p?.category?.value ?? p?.category ?? "";
const getProductUnitId     = (p) => p?.unit_id ?? p?.unitId ?? p?.unit?.id ?? p?.unit ?? "";
const getProductPieceRate  = (p) => p?.piece_rate ?? p?.pieceRate ?? p?.sale_rate ?? p?.saleRate ?? p?.rate ?? p?.price ?? p?.sale_price ?? 0;
const getProductSaleUnit   = (p) => String(p?.sale_unit || p?.saleUnit || "single").toLowerCase();
const getProductPcsCtn     = (p) => Number(p?.pieces_per_carton ?? p?.piecesPerCarton ?? 0);

const genInvoiceNo = (list) => {
  let max = 0;
  list.forEach((inv) => {
    const m = String(inv.invoice_no || "").match(/^sales-invoice(\d+)$/i);
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  });
  return `sales-invoice${String(max + 1).padStart(2, "0")}`;
};

async function translateText(text) {
  if (!text?.trim()) return text;
  try {
    const res  = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|ur`);
    if (!res.ok) return text;
    const data = await res.json();
    const tr   = data?.responseData?.translatedText;
    if (!tr || tr.toLowerCase() === text.trim().toLowerCase()) return text;
    return tr;
  } catch { return text; }
}

const emptyItem = () => ({
  category_id: "", product_id: "", product_description: "", unit_id: "",
  sale_type: "single", carton_qty: "", pieces_qty: "", qty: "",
  pieces_per_carton: "0", rate: "0", amount: "0",
});

const emptyForm = () => ({
  invoice_no: "", reference_no: "", party_type: "", party_id: "", customer_id: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  shipment_to: "", previous_balance: "0", delivery_charges: "0", discount: "0",
});

function useLookup(url) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const fetchData = async () => {
    setLoading(true); setError("");
    try   { const r = await axios.get(url); setData(getList(r.data)); }
    catch (e) { setError(e?.message || "Load error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [url]);
  return { data, loading, error, refetch: fetchData };
}

function useAutoResize(value) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);
  return ref;
}

// ─── Print ────────────────────────────────────────────────────────────────────
function generateInvoicePrint(invoice, lang, urduCache) {
  const t      = LANG[lang || "en"];
  const isUrdu = lang === "ur";
  const dir    = isUrdu ? "rtl" : "ltr";
  const items  = Array.isArray(invoice?.items) ? invoice.items : [];

  const invoiceTotal    = toNum(invoice?.invoice_total);
  const previousBalance = toNum(invoice?.previous_balance);
  const deliveryCharges = toNum(invoice?.delivery_charges ?? invoice?.deliveryCharges);
  const discount        = toNum(invoice?.discount);
  const grandTotal      = toNum(invoice?.grand_total);

  const invPartyType = invoice.customer_type || invoice.party_type || (invoice.customer_id ? "customer" : "");
  const invPartyId   = invoice.party_id || invoice.customer_id || invoice.employee_id || invoice.supplier_id || invoice.general_ledger_id || "";
  const partyName    = isUrdu
    ? urduCache[`party:${invPartyType}:${invPartyId}`] || urduCache[`customer:${invoice.customer_id}`] || invoice.party_name || invoice.customer_name || "-"
    : invoice.party_name || invoice.customer_name || "-";

  const tr  = (prefix, id, fb) => isUrdu ? urduCache[`${prefix}:${id}`] || fb || "-" : fb || "-";
  const ptObj = PARTY_TYPES.find((p) => p.value === invPartyType);
  const ptLabel = ptObj ? t[ptObj.labelKey] || ptObj.value : "-";
  const badgeStyle = PARTY_BADGE_STYLE[invPartyType] || "";

  const rowsHtml = items.map((row, idx) => {
    const saleText = row.sale_type === "carton" ? t.carton : row.sale_type === "pieces" ? t.pieces : t.single;
    const qtyText  = row.sale_type === "carton" ? money(row.carton_qty) : money(row.pieces_qty || row.qty);
    const descHtml = (row.product_description || row.description || "")
      ? `<div style="font-size:10px;color:#64748b;margin-top:4px;line-height:1.6;white-space:pre-wrap;font-style:italic;">${row.product_description || row.description}</div>`
      : "";
    return `<tr>
      <td class="center" style="font-weight:700;color:#94a3b8">${idx + 1}</td>
      <td><div style="font-weight:700;color:#0f172a">${tr("product", row.product_id, row.product_name || "")}</div>${descHtml}</td>
      <td>${tr("category", row.category_id, row.category_name || "")}</td>
      <td class="center"><span style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">${saleText}</span></td>
      <td class="center">${tr("unit", row.unit_id, row.unit_name || "")}</td>
      <td class="num">${qtyText}</td>
      <td class="num">${money(row.rate)}</td>
      <td class="num amount-cell">${money(row.amount)}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8"/>
<title>${invoice.invoice_no || "sales-invoice"}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f1f5f9;color:#0f172a;font-family:${isUrdu?"'Noto Nastaliq Urdu',serif":"'DM Sans',sans-serif"}}
.page{padding:24px}
.sheet{max-width:1400px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,0.12)}
.header{background:linear-gradient(135deg,#0c1445 0%,#1e3a8a 60%,#1d4ed8 100%);padding:28px 32px;display:flex;align-items:center;justify-content:space-between}
.brand-name{font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px}
.brand-sub{font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px;letter-spacing:0.5px;text-transform:uppercase}
.meta{text-align:${isUrdu?"left":"right"};font-size:11.5px;color:rgba(255,255,255,0.75);line-height:2}
.content{padding:24px 28px;display:flex;flex-direction:column;gap:16px}
.hint{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;font-size:12.5px;display:flex;align-items:center;gap:8px}
.info-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.info-card{border-radius:12px;padding:12px 14px;border:1.5px solid #e2e8f0;background:#fafafa;transition:border-color 0.2s}
.info-card small{display:block;font-size:10.5px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px}
.info-card .val{font-size:14px;font-weight:700;color:#0f172a;line-height:1.3}
.party-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;${badgeStyle}}
.section-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:8px}
table{width:100%;border-collapse:collapse}
thead th{background:#0f172a;color:white;font-size:11px;font-weight:600;padding:11px 10px;text-align:${isUrdu?"right":"left"};text-transform:uppercase;letter-spacing:0.5px}
thead th:first-child{border-radius:0}
tbody td{border-bottom:1px solid #f1f5f9;padding:11px 10px;font-size:12px;vertical-align:top;color:#334155}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover td{background:#fafafa}
.center{text-align:center!important}
.num{text-align:${isUrdu?"left":"right"}!important;white-space:nowrap;font-weight:600;font-variant-numeric:tabular-nums}
.amount-cell{font-weight:800;color:#1e40af;font-size:13px}
.totals-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.total-card{border-radius:12px;padding:14px 16px;border:1.5px solid #e2e8f0;background:#fafafa}
.total-card.highlight{background:#eff6ff;border-color:#bfdbfe}
.total-card .label{display:block;font-size:10.5px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.total-card .value{font-size:22px;font-weight:800;color:#0f172a;font-variant-numeric:tabular-nums}
.total-card.highlight .value{color:#1d4ed8;font-size:26px}
.footer{background:#0f172a;color:rgba(255,255,255,0.5);padding:12px 28px;display:flex;justify-content:space-between;align-items:center;font-size:11px}
.footer-brand{color:rgba(255,255,255,0.8);font-weight:600}
@media print{
  @page{size:A4 landscape;margin:8mm}
  body{background:white}
  .page{padding:0;background:white}
  .sheet{box-shadow:none;border-radius:0;max-width:none}
  .hint{display:none}
}
</style>
</head>
<body>
<div class="page"><div class="sheet">
  <div class="header">
    <div><div class="brand-name">${t.companyName}</div><div class="brand-sub">${t.slipTitle}</div></div>
    <div class="meta">
      <div>${t.slipPrintedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
      <div>${t.invoiceNo}: <strong style="color:white">${invoice.invoice_no || "-"}</strong></div>
    </div>
  </div>
  <div class="content">
    <div class="hint">ℹ️ ${t.savePdfHint}</div>
    <div>
      <div class="section-label">${t.slipCustomer} Info</div>
      <div class="info-grid">
        <div class="info-card"><small>${t.invoiceNo}</small><div class="val">${invoice.invoice_no || "-"}</div></div>
        <div class="info-card"><small>${t.referenceNo}</small><div class="val">${invoice.reference_no || "-"}</div></div>
        <div class="info-card"><small>${t.partyType}</small><div class="val"><span class="party-badge">${ptLabel}</span></div></div>
        <div class="info-card"><small>${t.partyName || t.slipCustomer}</small><div class="val">${partyName || "-"}</div></div>
        <div class="info-card"><small>${t.slipDate}</small><div class="val">${invoice.invoice_date || "-"}</div></div>
        <div class="info-card"><small>${t.slipShipmentTo}</small><div class="val">${invoice.shipment_to || "-"}</div></div>
      </div>
    </div>
    <div>
      <div class="section-label">${t.items}</div>
      <div style="border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <table>
          <thead><tr>
            <th class="center" style="width:40px">#</th>
            <th>${t.product}</th><th>${t.category}</th>
            <th class="center">${t.saleType}</th><th class="center">${t.unit}</th>
            <th class="num">${t.qty}</th><th class="num">${t.rate}</th><th class="num">${t.amount}</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>
    <div>
      <div class="section-label">Totals</div>
      <div class="totals-grid">
        <div class="total-card"><span class="label">${t.slipInvoiceTotal}</span><div class="value">${money(invoiceTotal)}</div></div>
        <div class="total-card"><span class="label">${t.slipPrevBalance}</span><div class="value">${money(previousBalance)}</div></div>
        <div class="total-card"><span class="label">${t.slipDeliveryCharges}</span><div class="value">${money(deliveryCharges)}</div></div>
        <div class="total-card"><span class="label">${t.slipDiscount}</span><div class="value">${money(discount)}</div></div>
        <div class="total-card highlight"><span class="label">${t.slipGrandTotal}</span><div class="value">${money(grandTotal)}</div></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span class="footer-brand">${t.companyName}</span>
    <span>${t.slipThank}</span>
    <span>Page 1 / 1</span>
  </div>
</div></div>
<script>window.onload=()=>setTimeout(()=>window.print(),400);<\/script>
</body></html>`;

  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}

// ─── Description Box ─────────────────────────────────────────────────────────
function ProductDescriptionBox({ value, onChange, onClear, t, isUrdu }) {
  const ref  = useAutoResize(value);
  const len  = (value || "").length;
  const pct  = Math.min((len / DESC_MAX) * 100, 100);
  const near = len > DESC_MAX * 0.8;
  const full = len >= DESC_MAX;
  const has  = len > 0;

  return (
    <div style={{
      border: `1.5px solid ${has ? "#818cf8" : "#e2e8f0"}`,
      borderRadius: 10,
      overflow: "hidden",
      background: has ? "#fafafe" : "#fafafa",
      transition: "border-color 0.2s, background 0.2s",
    }}>
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", borderBottom: `1px solid ${has ? "#e0e7ff" : "#f1f5f9"}`,
        flexDirection: isUrdu ? "row-reverse" : "row",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: isUrdu ? "row-reverse" : "row" }}>
          <span style={{
            width: 18, height: 18, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
            background: has ? "#e0e7ff" : "#f1f5f9", fontSize: 10,
          }}>
            <i className="bi bi-card-text" style={{ color: has ? "#6366f1" : "#94a3b8" }}></i>
          </span>
          <span style={{
            fontSize: 9.4, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase",
            color: has ? "#6366f1" : "#94a3b8",
          }}>
            {t.productDescription}
          </span>
          <span style={{
            fontSize: 8.8, padding: "1px 6px", borderRadius: 20, fontWeight: 600,
            background: has ? "#e0e7ff" : "#f1f5f9", color: has ? "#818cf8" : "#94a3b8",
          }}>
            {t.productDescriptionHint}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isUrdu ? "row-reverse" : "row" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, fontFamily: "monospace",
            color: full ? "#ef4444" : near ? "#f59e0b" : "#94a3b8",
          }}>
            {len}/{DESC_MAX}
          </span>
          <div style={{ width: 52, height: 4, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 4,
              background: full ? "#ef4444" : near ? "#f59e0b" : "#818cf8",
              transition: "width 0.3s",
            }} />
          </div>
          {has && (
            <button type="button" onClick={onClear} style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: "white", border: "1px solid #e2e8f0", color: "#94a3b8",
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8"; }}
            >
              <i className="bi bi-x-circle"></i> {t.descClear}
            </button>
          )}
        </div>
      </div>
      {/* textarea */}
      <div style={{ position: "relative", padding: "6px 10px" }}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, DESC_MAX))}
          placeholder={t.productDescriptionPlaceholder}
          rows={2}
          dir={isUrdu ? "rtl" : "ltr"}
          style={{
            width: "100%", resize: "none", background: "transparent",
            border: "none", outline: "none",
            fontSize: 11.2, lineHeight: 1.55, color: "#334155",
            fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "inherit",
            minHeight: 38, textAlign: isUrdu ? "right" : "left",
          }}
        />
        {!has && (
          <i className="bi bi-pencil-fill" style={{
            position: "absolute", top: 10, right: isUrdu ? "auto" : 14, left: isUrdu ? 14 : "auto",
            color: "#e2e8f0", fontSize: 14, pointerEvents: "none",
          }} />
        )}
      </div>
      {/* chips */}
      {!has && (
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", padding: "0 10px 8px",
          flexDirection: isUrdu ? "row-reverse" : "row",
        }}>
          {["Batch info", "Size / weight", "Color", "Special notes"].map((chip) => (
            <button key={chip} type="button" onClick={() => onChange(chip + ": ")} style={{
              fontSize: 10, padding: "2px 9px", borderRadius: 20,
              border: "1px solid #e2e8f0", background: "white", color: "#6366f1",
              cursor: "pointer", fontWeight: 600, transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              + {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared input/select components ──────────────────────────────────────────
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

const inputStyle = (isUrdu) => ({
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

const roStyle = () => ({
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
  const base = readOnly ? roStyle() : inputStyle(isUrdu);
  return (
    <input
      {...props}
      readOnly={readOnly}
      style={{
        ...base,
        ...style,
        borderColor: readOnly ? base.border : focus ? "#2563eb" : (style.borderColor || base.borderColor || "#cbd5e1"),
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
  const base = inputStyle(isUrdu);
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
      {/* IMPORTANT: this body must stay visible. Do not remove children. */}
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const SalesInvoicePage = () => {
  const [lang, setLang] = useState("en");
  const t      = LANG[lang];
  const isUrdu = lang === "ur";
  const dir    = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'DM Sans', sans-serif";

  const { data: customers,      loading: cuLoading,  error: cuError,  refetch: refetchCu  } = useLookup(CUSTOMERS_API);
  const { data: employees,      loading: emLoading,  error: emError,  refetch: refetchEm  } = useLookup(EMPLOYEES_API);
  const { data: suppliers,      loading: suLoading,  error: suError,  refetch: refetchSu  } = useLookup(SUPPLIERS_API);
  const { data: generalLedgers, loading: glLoading,  error: glError,  refetch: refetchGl  } = useLookup(GENERAL_LEDGERS_API);
  const { data: categories,     loading: catLoading, error: catError, refetch: refetchCat } = useLookup(CATEGORIES_API);
  const { data: products,       loading: prodLoading,error: prodError,refetch: refetchProd} = useLookup(PRODUCTS_API);
  const { data: units,          loading: unLoading,  error: unError,  refetch: refetchUn  } = useLookup(UNITS_API);

  const [invoices,        setInvoices]        = useState([]);
  const [loadingInv,      setLoadingInv]      = useState(true);
  const [search,          setSearch]          = useState("");
  const [dateFilter,      setDateFilter]      = useState("24h");
  const [showForm,        setShowForm]        = useState(false);
  const [showSummary,     setShowSummary]     = useState(false);
  const [editingId,       setEditingId]       = useState(null);
  const [form,            setForm]            = useState(emptyForm());
  const [items,           setItems]           = useState([emptyItem()]);
  const [msg,             setMsg]             = useState({ type: "", text: "" });
  const [urduCache,       setUrduCache]       = useState({});
  const [translating,     setTranslating]     = useState(false);
  const [showDC,          setShowDC]          = useState(false);

  const mastersLoading = cuLoading || emLoading || suLoading || glLoading || catLoading || prodLoading || unLoading;
  const mastersError   = cuError   || emError   || suError   || glError   || catError   || prodError   || unError;

  const toast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const cuMap  = useMemo(() => { const m = {}; customers.forEach(c => { const id = getRecordId(c); if (id !== "") m[String(id)] = getCustomerName(c) || `#${id}`; }); return m; }, [customers]);
  const emMap  = useMemo(() => { const m = {}; employees.forEach(e => { const id = getRecordId(e); if (id !== "") m[String(id)] = getEmployeeName(e) || `#${id}`; }); return m; }, [employees]);
  const suMap  = useMemo(() => { const m = {}; suppliers.forEach(s => { const id = getRecordId(s); if (id !== "") m[String(id)] = getSupplierName(s) || `#${id}`; }); return m; }, [suppliers]);
  const glMap  = useMemo(() => { const m = {}; generalLedgers.forEach(l => { const id = getRecordId(l); if (id !== "") m[String(id)] = getLedgerName(l) || `#${id}`; }); return m; }, [generalLedgers]);
  const catMap = useMemo(() => { const m = {}; categories.forEach(c => { m[String(c.id)] = getCategoryName(c) || `#${c.id}`; }); return m; }, [categories]);
  const prodMap = useMemo(() => { const m = {}; products.forEach(p => { m[String(p.id)] = getProductName(p) || `#${p.id}`; }); return m; }, [products]);
  const unitMap = useMemo(() => { const m = {}; units.forEach(u => { m[String(u.id)] = getUnitName(u) || `#${u.id}`; }); return m; }, [units]);

  const partyLabel = (type, id, fb = "") =>
    isUrdu ? urduCache[`party:${type}:${id}`] || (type === "customer" ? urduCache[`customer:${id}`] : "") || fb || "-" : fb || "-";
  const transVal = (prefix, id, fb) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fb || "-" : fb || "-";

  const selPartyType = PARTY_TYPES.find(p => p.value === form.party_type) || null;
  const selPartyData = useMemo(() => {
    if (form.party_type === "employee")       return { list: employees,      loading: emLoading,  map: emMap };
    if (form.party_type === "supplier")       return { list: suppliers,      loading: suLoading,  map: suMap };
    if (form.party_type === "general_ledger") return { list: generalLedgers, loading: glLoading,  map: glMap };
    if (form.party_type === "customer")       return { list: customers,      loading: cuLoading,  map: cuMap };
    return { list: [], loading: false, map: {} };
  }, [form.party_type, employees, emLoading, suppliers, suLoading, generalLedgers, glLoading, customers, cuLoading, emMap, suMap, glMap, cuMap]);

  const getInvPartyType = (inv) =>
    inv?.customer_type || inv?.party_type ||
    (inv?.customer_id ? "customer" : inv?.employee_id ? "employee" : inv?.supplier_id ? "supplier" : inv?.general_ledger_id ? "general_ledger" : "");
  const getInvPartyId = (inv) => {
    const type = getInvPartyType(inv);
    if (inv?.party_id) return inv.party_id;
    if (type === "employee")       return inv?.employee_id || "";
    if (type === "supplier")       return inv?.supplier_id || "";
    if (type === "general_ledger") return inv?.general_ledger_id || inv?.ledger_id || inv?.account_id || "";
    return inv?.customer_id || "";
  };
  const getInvPartyName = useCallback((inv) => {
    const type = getInvPartyType(inv);
    const id   = getInvPartyId(inv);
    const mapN = type === "employee" ? emMap[String(id)] : type === "supplier" ? suMap[String(id)] : type === "general_ledger" ? glMap[String(id)] : cuMap[String(id)];
    const fb   = inv?.party_name || inv?.customer_name || inv?.employee_name || inv?.supplier_name || inv?.general_ledger_name || inv?.ledger_name || mapN || "";
    return partyLabel(type, id, fb);
  }, [emMap, suMap, glMap, cuMap, urduCache, isUrdu]);

  const fetchInvoices = async () => {
    setLoadingInv(true);
    try { const r = await axios.get(API_BASE); setInvoices(getList(r.data)); }
    catch { toast("error", t.invoicesError); }
    finally { setLoadingInv(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleLangToggle = async () => {
    const nl = lang === "en" ? "ur" : "en";
    setLang(nl);
    if (nl !== "ur") return;
    setTranslating(true);
    try {
      const nc = { ...urduCache };
      await Promise.all([
        ...customers.map(async c => {
          const id = getRecordId(c); const b = getCustomerName(c);
          if (b && !nc[`customer:${id}`])       nc[`customer:${id}`]       = await translateText(b);
          if (b && !nc[`party:customer:${id}`]) nc[`party:customer:${id}`] = await translateText(b);
        }),
        ...employees.map(async e => { const id = getRecordId(e); const b = getEmployeeName(e); if (b && !nc[`party:employee:${id}`]) nc[`party:employee:${id}`] = await translateText(b); }),
        ...suppliers.map(async s => { const id = getRecordId(s); const b = getSupplierName(s); if (b && !nc[`party:supplier:${id}`]) nc[`party:supplier:${id}`] = await translateText(b); }),
        ...generalLedgers.map(async l => { const id = getRecordId(l); const b = getLedgerName(l); if (b && !nc[`party:general_ledger:${id}`]) nc[`party:general_ledger:${id}`] = await translateText(b); }),
        ...categories.map(async c => { const b = getCategoryName(c); if (b && !nc[`category:${c.id}`]) nc[`category:${c.id}`] = await translateText(b); }),
        ...products.map(async p => { const b = getProductName(p); if (b && !nc[`product:${p.id}`]) nc[`product:${p.id}`] = await translateText(b); }),
        ...units.map(async u => { const b = getUnitName(u); if (b && !nc[`unit:${u.id}`]) nc[`unit:${u.id}`] = await translateText(b); }),
      ]);
      setUrduCache(nc);
    } finally { setTranslating(false); }
  };

  const ensurePrintTrans = async (invoice) => {
    if (lang !== "ur") return urduCache;
    const nc = { ...urduCache };
    const iType = invoice.customer_type || invoice.party_type || (invoice.customer_id ? "customer" : "");
    const iId   = invoice.party_id || invoice.customer_id || invoice.employee_id || invoice.supplier_id || invoice.general_ledger_id || "";
    const iName = invoice.party_name || invoice.customer_name || invoice.employee_name || invoice.supplier_name || invoice.general_ledger_name || "";
    if (!nc[`customer:${invoice.customer_id}`] && invoice.customer_name)
      nc[`customer:${invoice.customer_id}`] = await translateText(invoice.customer_name);
    if (iType && iId && iName && !nc[`party:${iType}:${iId}`])
      nc[`party:${iType}:${iId}`] = await translateText(iName);
    for (const row of invoice.items || []) {
      const pb = row.product_name  || prodMap[String(row.product_id)];
      const cb = row.category_name || catMap[String(row.category_id)];
      const ub = row.unit_name     || unitMap[String(row.unit_id)];
      if (row.product_id  && pb && !nc[`product:${row.product_id}`])   nc[`product:${row.product_id}`]   = await translateText(pb);
      if (row.category_id && cb && !nc[`category:${row.category_id}`]) nc[`category:${row.category_id}`] = await translateText(cb);
      if (row.unit_id     && ub && !nc[`unit:${row.unit_id}`])          nc[`unit:${row.unit_id}`]         = await translateText(ub);
    }
    setUrduCache(nc);
    return nc;
  };

  const invTotal = useMemo(() => items.reduce((s, r) => s + toNum(r.amount), 0), [items]);
  const activeDC = showDC ? toNum(form.delivery_charges) : 0;
  const grandTotal = useMemo(() =>
    invTotal + toNum(form.previous_balance) + activeDC - toNum(form.discount),
    [invTotal, form.previous_balance, activeDC, form.discount]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    let list  = invoices.filter(inv => {
      if (!inv.invoice_date) return dateFilter === "all";
      const d = new Date(inv.invoice_date);
      if (dateFilter === "24h")   return now - d <= 86400000;
      if (dateFilter === "7d")    return now - d <= 7 * 86400000;
      if (dateFilter === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return true;
    });
    if (!search.trim()) return list;
    return list.filter(inv => {
      const type = getInvPartyType(inv); const id = getInvPartyId(inv);
      return [inv.invoice_no, inv.reference_no || "", getInvPartyName(inv),
        urduCache[`party:${type}:${id}`] || "", inv.invoice_date, inv.shipment_to || ""].join(" ").toLowerCase().includes(search.toLowerCase());
    });
  }, [invoices, search, dateFilter, cuMap, emMap, suMap, glMap, urduCache]);

  const summary = useMemo(() => ({
    totalInvoices: invoices.length,
    totalItems:    invoices.reduce((s, inv) => s + Number(inv.items_count || inv.items?.length || 0), 0),
    totalValue:    invoices.reduce((s, inv) => s + toNum(inv.grand_total), 0),
  }), [invoices]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), invoice_no: genInvoiceNo(invoices) });
    setItems([emptyItem()]); setShowDC(false); setShowForm(true);
  };

  const openEdit = async (id) => {
    try {
      const r   = await axios.get(`${API_BASE}/${id}`);
      const inv = r.data?.data || r.data;
      setEditingId(inv.id);
      const dc       = toNum(inv.delivery_charges ?? inv.deliveryCharges ?? 0);
      const pType    = getInvPartyType(inv);
      const pId      = getInvPartyId(inv);
      setForm({
        invoice_no: inv.invoice_no || "", reference_no: inv.reference_no || "",
        party_type: pType || "", party_id: String(pId || ""),
        customer_id: pType === "customer" ? String(pId || inv.customer_id || "") : "",
        invoice_date: inv.invoice_date || new Date().toISOString().slice(0, 10),
        shipment_to: inv.shipment_to || "",
        previous_balance: String(inv.previous_balance || 0),
        delivery_charges: String(dc), discount: String(inv.discount || 0),
      });
      setShowDC(dc > 0);
      setItems(
        Array.isArray(inv.items) && inv.items.length
          ? inv.items.map(row => ({
              category_id: String(row.category_id ?? row.category?.id ?? ""),
              product_id: String(row.product_id ?? row.product?.id ?? ""),
              product_description: String(row.product_description ?? row.description ?? ""),
              unit_id: String(row.unit_id ?? row.unit?.id ?? ""),
              sale_type: String(row.sale_type || "single"),
              carton_qty: String(row.carton_qty || ""),
              pieces_qty: String(row.pieces_qty || ""),
              qty: String(row.qty || row.quantity || ""),
              pieces_per_carton: String(row.pieces_per_carton || 0),
              rate: String(row.rate || 0), amount: String(row.amount || 0),
            }))
          : [emptyItem()]
      );
      setShowForm(true);
    } catch { toast("error", t.editError); }
  };

  const handlePrint = async (invoiceId) => {
    try {
      const r   = await axios.get(`${API_BASE}/${invoiceId}`);
      const inv = r.data?.data || r.data;
      const normItems = (inv.items || []).map((row, i) => ({
        sr: row.sr || i + 1,
        category_id:  String(row.category_id  ?? row.category?.id ?? ""),
        product_id:   String(row.product_id   ?? row.product?.id  ?? ""),
        unit_id:      String(row.unit_id       ?? row.unit?.id    ?? ""),
        product_description: row.product_description || row.description || "",
        category_name: row.category_name || catMap[String(row.category_id ?? "")] || "",
        product_name:  row.product_name  || prodMap[String(row.product_id ?? "")] || "",
        unit_name:     row.unit_name     || unitMap[String(row.unit_id    ?? "")] || "",
        sale_type: row.sale_type || "single",
        carton_qty: row.carton_qty || "", pieces_qty: row.pieces_qty || "",
        pieces_per_carton: row.pieces_per_carton || 0,
        qty: row.qty || row.quantity || "", rate: row.rate || 0, amount: row.amount || 0,
      }));
      const pType = getInvPartyType(inv); const pId = getInvPartyId(inv);
      const prepared = {
        ...inv,
        customer_type: pType, party_type: pType, party_id: pId,
        party_name: inv.party_name || getInvPartyName(inv),
        customer_name: inv.customer_name || cuMap[String(inv.customer_id)] || "",
        reference_no: inv.reference_no || "",
        items: normItems,
        invoice_total: inv.invoice_total ?? normItems.reduce((s, r) => s + toNum(r.amount), 0),
        previous_balance: inv.previous_balance || 0,
        delivery_charges: inv.delivery_charges ?? inv.deliveryCharges ?? 0,
        discount: inv.discount || 0,
        grand_total: inv.grand_total ?? normItems.reduce((s, r) => s + toNum(r.amount), 0) + toNum(inv.previous_balance) + toNum(inv.delivery_charges ?? inv.deliveryCharges) - toNum(inv.discount),
      };
      let cache = urduCache;
      if (lang === "ur") { setTranslating(true); try { cache = await ensurePrintTrans(prepared); } finally { setTranslating(false); } }
      generateInvoicePrint(prepared, lang, cache);
    } catch { toast("error", t.printError); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try { await axios.delete(`${API_BASE}/${id}`); toast("success", t.deleteSuccess); fetchInvoices(); }
    catch { toast("error", t.deleteError); }
  };

  const calcRow = (row) => {
    const prod = products.find(p => String(p.id) === String(row.product_id));
    const saleUnit = getProductSaleUnit(prod || {});
    const rate     = toNum(row.rate || getProductPieceRate(prod || {}));
    const pcsCtn   = toNum(row.pieces_per_carton || getProductPcsCtn(prod || {}));
    let qty = 0, amount = 0;
    if (saleUnit === "carton") {
      if (row.sale_type === "carton") { qty = toNum(row.carton_qty); amount = qty * pcsCtn * rate; }
      else                            { qty = toNum(row.pieces_qty); amount = qty * rate; }
    } else { qty = toNum(row.qty); amount = qty * rate; }
    return { qty: String(qty || ""), amount: String(amount.toFixed(2)), rate: String(rate || 0), pieces_per_carton: String(pcsCtn || 0) };
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      let u = { ...row, [field]: value };
      if (field === "category_id") {
        u.product_id = ""; u.product_description = ""; u.unit_id = ""; u.sale_type = "single";
        u.carton_qty = ""; u.pieces_qty = ""; u.qty = ""; u.pieces_per_carton = "0"; u.rate = "0"; u.amount = "0";
      }
      if (field === "product_id") {
        const sel = products.find(p => String(p.id) === String(value));
        if (sel) {
          const su = getProductSaleUnit(sel);
          u.category_id = String(getProductCatId(sel) || u.category_id || "");
          u.unit_id = String(getProductUnitId(sel) || "");
          u.product_description = getProductDesc(sel) || u.product_description || "";
          u.rate = String(getProductPieceRate(sel) || 0);
          u.pieces_per_carton = String(getProductPcsCtn(sel) || 0);
          u.sale_type = su === "carton" ? "pieces" : "single";
          u.carton_qty = ""; u.pieces_qty = ""; u.qty = "";
        }
      }
      if (field === "sale_type") { u.carton_qty = ""; u.pieces_qty = ""; u.qty = ""; }
      if (field === "product_description") return u;
      const c = calcRow(u);
      u.qty = c.qty; u.amount = c.amount; u.rate = c.rate; u.pieces_per_carton = c.pieces_per_carton;
      return u;
    }));
  };

  const addRow    = () => setItems(p => [...p, emptyItem()]);
  const removeRow = (idx) => setItems(p => p.length === 1 ? p : p.filter((_, i) => i !== idx));
  const stepDC    = (delta) => setForm(f => ({ ...f, delivery_charges: String(toNum(f.delivery_charges) + delta) }));

  const handleSave = async () => {
    if (!form.invoice_no.trim()) { toast("error", t.invoiceNoRequired); return; }
    if (!form.party_type)        { toast("error", t.partyTypeRequired); return; }
    if (!form.party_id)          { toast("error", t.partyNameRequired); return; }
    const valid = items.filter(row => {
      if (!row.category_id || !row.product_id || !row.unit_id) return false;
      const prod = products.find(p => String(p.id) === String(row.product_id));
      const su   = getProductSaleUnit(prod || {});
      if (su === "carton") return row.sale_type === "carton" ? toNum(row.carton_qty) > 0 : toNum(row.pieces_qty) > 0;
      return toNum(row.qty) > 0;
    });
    if (!valid.length) { toast("error", t.validItemRequired); return; }
    const prepItems = valid.map((row, idx) => ({
      sr: idx + 1, category_id: Number(row.category_id), product_id: Number(row.product_id),
      product_description: String(row.product_description || "").trim(),
      description: String(row.product_description || "").trim(),
      unit_id: Number(row.unit_id), sale_type: row.sale_type || "single",
      carton_qty: toNum(row.carton_qty), pieces_qty: toNum(row.pieces_qty),
      qty: toNum(row.qty), pieces_per_carton: toNum(row.pieces_per_carton),
      rate: toNum(row.rate), amount: toNum(row.amount),
    }));
    const dc    = showDC ? toNum(form.delivery_charges) : 0;
    const total = prepItems.reduce((s, r) => s + toNum(r.amount), 0);
    const pid   = Number(form.party_id);
    const payload = {
      invoice_no: form.invoice_no.trim(), reference_no: form.reference_no.trim(),
      customer_type: form.party_type, party_type: form.party_type, party_id: pid,
      customer_id: form.party_type === "customer" ? pid : null,
      employee_id: form.party_type === "employee" ? pid : null,
      supplier_id: form.party_type === "supplier" ? pid : null,
      general_ledger_id: form.party_type === "general_ledger" ? pid : null,
      invoice_date: form.invoice_date, shipment_to: form.shipment_to || "",
      previous_balance: toNum(form.previous_balance), delivery_charges: dc,
      discount: toNum(form.discount), invoice_total: total,
      grand_total: total + toNum(form.previous_balance) + dc - toNum(form.discount),
      items: prepItems,
    };
    try {
      if (editingId) { await axios.put(`${API_BASE}/${editingId}`, payload); toast("success", t.updateSuccess); }
      else           { await axios.post(API_BASE, payload);                  toast("success", t.saveSuccess);   }
      setShowForm(false); setEditingId(null); setForm(emptyForm()); setItems([emptyItem()]); setShowDC(false);
      fetchInvoices();
    } catch { toast("error", t.saveError); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div dir={dir} style={{ fontFamily: baseFont, minHeight: "100vh", background: "#f8fafc", paddingBottom: 60 }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse   { 0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.15); } 50% { box-shadow:0 0 0 6px rgba(99,102,241,0.05); } }
        .slide-up  { animation: slideUp 0.3s ease-out both; }
        .fade-in   { animation: fadeIn  0.2s ease-out both; }
        .pulse-box { animation: pulse 2.5s ease-in-out infinite; }
        .row-card:hover { border-color:#c7d2fe !important; box-shadow:0 4px 16px rgba(99,102,241,0.08); }
        .tbl-row:hover td { background:#f8fafc; }
        .inv-btn { transition:all 0.15s; }
        .inv-btn:hover { transform:translateY(-1px); }
        .filter-btn { transition:all 0.15s; cursor:pointer; border:none; }
        .filter-btn:hover { transform:translateY(-1px); }
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

      {/* ── Toast ── */}
      {msg.text && (
        <div className="fade-in" style={{
          position: "fixed", bottom: 24, [isUrdu ? "left" : "right"]: 24, zIndex: 9999,
          padding: "12px 20px", borderRadius: 14, color: "white", fontSize: 13.5, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
          background: msg.type === "error" ? "#ef4444" : "#10b981",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}>
          <i className={`bi ${msg.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {msg.text}
        </div>
      )}

      {translating && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          padding: "12px 20px", borderRadius: 14, background: "#0f172a", color: "white",
          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}>
          <i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }}></i>
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
              {/* Lang toggle */}
              <button onClick={handleLangToggle} className="inv-btn" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "white", border: "1.5px solid #e2e8f0", color: "#64748b", cursor: "pointer",
              }}>
                <i className="bi bi-translate"></i>{t.toggleLang}
              </button>
              {/* Summary */}
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
              {/* New Invoice */}
              <button onClick={openAdd} className="inv-btn" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "#6366f1", color: "white", border: "none", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              }}>
                <i className="bi bi-file-earmark-plus-fill"></i>{t.newInvoice}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1.5px solid #f1f5f9" }}>
              {[
                { icon: "bi-receipt-cutoff", label: t.totalInvoices, value: summary.totalInvoices, color: "#6366f1", bg: "#eef2ff" },
                { icon: "bi-box-seam-fill",  label: t.totalItems,    value: summary.totalItems,    color: "#0ea5e9", bg: "#e0f2fe" },
                { icon: "bi-cash-coin",      label: t.totalValue,    value: money(summary.totalValue), color: "#10b981", bg: "#d1fae5" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${s.color}22` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 16 }}></i>
                  </div>
                  <p style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600, marginBottom: 4, margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>{s.value}</p>
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

        {/* ── Form Modal ── */}
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
                    <i className="bi bi-receipt-cutoff" style={{ fontSize: 18 }}></i>
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
                      {editingId ? t.editTitle : t.newTitle}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 10.5, color: "rgba(255,255,255,0.68)", fontWeight: 500 }}>
                      {t.formSubtitle}
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
                    <div style={{ fontSize: 9.5, fontWeight: 900, color: "rgba(255,255,255,0.58)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 3 }}>{t.invoiceNo}</div>
                    <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{form.invoice_no || "-"}</div>
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
                {/* Master error */}
                {mastersError && (
                  <div style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#be123c",
                    boxShadow: "0 10px 26px rgba(225,29,72,0.08)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 850 }}>
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      <span>{t.masterError}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {[[refetchCu, t.customers], [refetchEm, t.partyTypeEmployee], [refetchSu, t.partyTypeSupplier], [refetchGl, t.partyTypeGeneralLedger], [refetchCat, t.categories], [refetchProd, t.products], [refetchUn, t.units]].map(([fn, label]) => (
                        <button key={label} type="button" onClick={fn} style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          background: "white",
                          border: "1px solid #fecdd3",
                          fontSize: 11.5,
                          cursor: "pointer",
                          color: "#be123c",
                          fontWeight: 800,
                        }}>{label}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoice Info */}
                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-person-vcard-fill"
                  iconBg="#eef2ff"
                  iconColor="#4f46e5"
                  title="Invoice Information"
                  subtitle="Select party, reference, invoice date and shipment destination"
                >
                  <div className="sales-modal-grid-12">
                    <FieldBox label={`${t.invoiceNo} *`} icon="bi-hash" span={3} helper="Auto">
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.invoice_no}
                        onChange={e => setForm(f => ({ ...f, invoice_no: e.target.value }))}
                        style={{ fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.2px" }}
                      />
                    </FieldBox>

                    <FieldBox label={t.referenceNo} icon="bi-bookmark-check" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.reference_no}
                        onChange={e => setForm(f => ({ ...f, reference_no: e.target.value }))}
                        placeholder="e.g. PO-2026-001"
                      />
                    </FieldBox>

                    <FieldBox label={`${t.partyType} *`} icon="bi-diagram-3-fill" span={3}>
                      <StyledSelect
                        isUrdu={isUrdu}
                        value={form.party_type}
                        onChange={e => setForm(f => ({ ...f, party_type: e.target.value, party_id: "", customer_id: "" }))}
                      >
                        <option value="">{t.selectPartyType}</option>
                        {PARTY_TYPES.map(pt => <option key={pt.value} value={pt.value}>{t[pt.labelKey]}</option>)}
                      </StyledSelect>
                    </FieldBox>

                    <FieldBox label={`${selPartyType ? t[selPartyType.labelKey] : t.partyName} *`} icon="bi-person-check-fill" span={3}>
                      <StyledSelect
                        isUrdu={isUrdu}
                        value={form.party_id}
                        disabled={!form.party_type || selPartyData.loading}
                        onChange={e => setForm(f => ({ ...f, party_id: e.target.value, customer_id: f.party_type === "customer" ? e.target.value : "" }))}
                      >
                        <option value="">
                          {!form.party_type ? t.selectPartyType : selPartyData.loading ? t.loadingMaster : t.selectPartyName}
                        </option>
                        {selPartyData.list.map(rec => {
                          const id    = getRecordId(rec);
                          const label = getPartyEntityName(form.party_type, rec) || `#${id}`;
                          return <option key={`${form.party_type}-${id}`} value={id}>{partyLabel(form.party_type, id, label)}</option>;
                        })}
                      </StyledSelect>
                    </FieldBox>

                    <FieldBox label={t.date} icon="bi-calendar2-week-fill" span={3}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="date"
                        value={form.invoice_date}
                        onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))}
                      />
                    </FieldBox>

                    <FieldBox label={t.shipmentTo} icon="bi-geo-alt-fill" span={9}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="text"
                        value={form.shipment_to}
                        onChange={e => setForm(f => ({ ...f, shipment_to: e.target.value }))}
                        placeholder="Shipment address / city"
                      />
                    </FieldBox>
                  </div>
                </SectionCard>

                {/* Items */}
                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-box-seam-fill"
                  iconBg="#e0f2fe"
                  iconColor="#0284c7"
                  title={t.items}
                  subtitle={t.itemsSubtitle}
                  action={
                    <button
                      type="button"
                      onClick={addRow}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 13px",
                        borderRadius: 10,
                        fontSize: 11.8,
                        fontWeight: 900,
                        background: "#0f172a",
                        color: "white",
                        border: "1px solid #0f172a",
                        cursor: "pointer",
                        boxShadow: "0 10px 20px rgba(15,23,42,0.16)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i className="bi bi-plus-lg"></i>
                      {t.newLine}
                    </button>
                  }
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.map((row, idx) => {
                      const selProd     = products.find(p => String(p.id) === String(row.product_id));
                      const saleUnit    = getProductSaleUnit(selProd || {});
                      const isCarton    = saleUnit === "carton";
                      const matchedProds = products.filter(p => !row.category_id || String(getProductCatId(p)) === String(row.category_id));
                      const filtProds   = !row.category_id ? products : matchedProds.length ? matchedProds : products;

                      return (
                        <div key={idx} style={{
                          border: "1px solid #dbe3ee",
                          borderRadius: 14,
                          overflow: "hidden",
                          background: "#ffffff",
                          boxShadow: "0 7px 20px rgba(15,23,42,0.045)",
                        }}>
                          <div style={{
                            padding: "9px 12px",
                            background: "#fbfdff",
                            borderBottom: "1px solid #e8eef6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 9,
                            flexDirection: isUrdu ? "row-reverse" : "row",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 11.5,
                                fontWeight: 950,
                                fontFamily: "monospace",
                                flex: "0 0 auto",
                              }}>{idx + 1}</div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 900, color: "#0f172a" }}>{t.itemRow} {idx + 1}</div>
                                <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {row.product_id ? transVal("product", row.product_id, prodMap[row.product_id] || "") : "Category, product, quantity and description in one clean row"}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isUrdu ? "row-reverse" : "row" }}>
                              <div style={{
                                minWidth: 72,
                                height: 34,
                                borderRadius: 10,
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#1d4ed8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11.8,
                                fontWeight: 900,
                                fontFamily: "monospace",
                                fontVariantNumeric: "tabular-nums",
                              }}>{money(row.amount)}</div>
                              <button
                                type="button"
                                onClick={() => removeRow(idx)}
                                disabled={items.length === 1}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 10,
                                  border: "1px solid #fecaca",
                                  background: "#fff1f2",
                                  color: "#dc2626",
                                  cursor: items.length === 1 ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  opacity: items.length === 1 ? 0.45 : 1,
                                }}
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </div>

                          <div className="sales-item-grid">
                            <FieldBox label={t.category} icon="bi-tags" span={2}>
                              <StyledSelect isUrdu={isUrdu} value={row.category_id} onChange={e => handleItemChange(idx, "category_id", e.target.value)}>
                                <option value="">{catLoading ? t.loadingMaster : t.selectCategory}</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{transVal("category", c.id, getCategoryName(c))}</option>)}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={t.product} icon="bi-box" span={3}>
                              <StyledSelect isUrdu={isUrdu} value={row.product_id} onChange={e => handleItemChange(idx, "product_id", e.target.value)}>
                                <option value="">{prodLoading ? t.loadingMaster : t.selectProduct}</option>
                                {filtProds.map(p => <option key={p.id} value={p.id}>{transVal("product", p.id, getProductName(p))}</option>)}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={t.unit} icon="bi-rulers" span={2}>
                              <StyledSelect isUrdu={isUrdu} value={row.unit_id} onChange={e => handleItemChange(idx, "unit_id", e.target.value)}>
                                <option value="">{unLoading ? t.loadingMaster : t.selectUnit}</option>
                                {units.map(u => <option key={u.id} value={u.id}>{transVal("unit", u.id, getUnitName(u))}</option>)}
                              </StyledSelect>
                            </FieldBox>

                            <FieldBox label={t.saleType} icon="bi-bag-check" span={2}>
                              {isCarton ? (
                                <StyledSelect isUrdu={isUrdu} value={row.sale_type} onChange={e => handleItemChange(idx, "sale_type", e.target.value)}>
                                  <option value="pieces">{t.pieces}</option>
                                  <option value="carton">{t.carton}</option>
                                </StyledSelect>
                              ) : (
                                <StyledInput readOnly isUrdu={isUrdu} value={t.single} />
                              )}
                            </FieldBox>

                            <FieldBox label={t.piecesPerCarton} icon="bi-grid-3x3-gap" span={1}>
                              <StyledInput readOnly isUrdu={isUrdu} value={row.pieces_per_carton || "0"} />
                            </FieldBox>

                            <FieldBox label={t.cartonQty} icon="bi-boxes" span={1}>
                              <StyledInput
                                isUrdu={isUrdu}
                                type="number"
                                value={row.carton_qty}
                                onChange={e => handleItemChange(idx, "carton_qty", e.target.value)}
                                disabled={!isCarton || row.sale_type !== "carton"}
                              />
                            </FieldBox>

                            <FieldBox label={t.piecesQty} icon="bi-123" span={1}>
                              <StyledInput
                                isUrdu={isUrdu}
                                type="number"
                                value={row.pieces_qty}
                                onChange={e => handleItemChange(idx, "pieces_qty", e.target.value)}
                                disabled={!isCarton || row.sale_type !== "pieces"}
                              />
                            </FieldBox>

                            <FieldBox label={t.qty} icon="bi-calculator" span={1}>
                              <StyledInput readOnly isUrdu={isUrdu} value={row.qty} />
                            </FieldBox>

                            <FieldBox label={t.rate} icon="bi-cash" span={1}>
                              <StyledInput readOnly isUrdu={isUrdu} value={money(row.rate)} />
                            </FieldBox>

                            <FieldBox label={t.amount} icon="bi-currency-exchange" span={2} highlight>
                              <div style={{
                                minHeight: 36,
                                border: "1.5px solid #bfdbfe",
                                borderRadius: 9,
                                padding: "7px 10px",
                                fontSize: 12.5,
                                fontWeight: 950,
                                color: "#1d4ed8",
                                background: "#eff6ff",
                                textAlign: "right",
                                fontFamily: "monospace",
                                fontVariantNumeric: "tabular-nums",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}>
                                {money(row.amount)}
                              </div>
                            </FieldBox>
                          </div>

                          <div style={{ padding: "0 12px 12px" }}>
                            <ProductDescriptionBox
                              value={row.product_description}
                              onChange={val => handleItemChange(idx, "product_description", val)}
                              onClear={() => handleItemChange(idx, "product_description", "")}
                              t={t}
                              isUrdu={isUrdu}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                {/* Totals */}
                <SectionCard
                  isUrdu={isUrdu}
                  icon="bi-calculator-fill"
                  iconBg="#dcfce7"
                  iconColor="#16a34a"
                  title="Invoice Totals"
                  subtitle="Grand total updates automatically when quantity, delivery or discount changes"
                >
                  <div className="sales-totals-grid">
                    <AmountBox label={t.invoiceTotal} value={money(invTotal)} />

                    <AmountBox label={t.previousBalance}>
                      <StyledInput
                        isUrdu={isUrdu}
                        type="number"
                        value={form.previous_balance}
                        onChange={e => setForm(f => ({ ...f, previous_balance: e.target.value }))}
                        style={{ fontSize: 16, fontWeight: 900, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                      />
                    </AmountBox>

                    <AmountBox label={t.deliveryCharges}>
                      {!showDC ? (
                        <button
                          type="button"
                          onClick={() => { setShowDC(true); setForm(f => ({ ...f, delivery_charges: f.delivery_charges || "0" })); }}
                          style={{
                            width: "100%",
                            minHeight: 38,
                            border: "1.5px dashed #38bdf8",
                            borderRadius: 10,
                            background: "#f0f9ff",
                            color: "#0369a1",
                            fontSize: 11.8,
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <i className="bi bi-plus-lg"></i>
                          {t.pressAddDelivery}
                        </button>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[{ d: 50, label: "+50" }, { d: 100, label: "+100" }, { d: -50, label: "−50" }].map(btn => (
                              <button
                                key={btn.label}
                                type="button"
                                onClick={() => stepDC(btn.d)}
                                style={{
                                  padding: "4px 9px",
                                  borderRadius: 999,
                                  border: "1px solid #dbe3ee",
                                  background: "#ffffff",
                                  color: btn.d < 0 ? "#dc2626" : "#16a34a",
                                  fontSize: 10,
                                  fontWeight: 900,
                                  cursor: "pointer",
                                }}
                              >{btn.label}</button>
                            ))}
                            <button type="button" onClick={() => { setShowDC(false); setForm(f => ({ ...f, delivery_charges: "0" })); }} style={{
                              padding: "4px 9px",
                              borderRadius: 999,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              color: "#64748b",
                              fontSize: 10,
                              fontWeight: 900,
                              cursor: "pointer",
                            }}>✕ {t.removeDelivery}</button>
                          </div>
                          <StyledInput
                            isUrdu={isUrdu}
                            type="number"
                            value={form.delivery_charges}
                            onChange={e => setForm(f => ({ ...f, delivery_charges: e.target.value }))}
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
                        onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
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
                      <div style={{ fontSize: 22, fontWeight: 950, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>{money(grandTotal)}</div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.66)", fontFamily: "monospace", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {money(invTotal)}
                        {toNum(form.previous_balance) !== 0 ? ` + ${money(form.previous_balance)}` : ""}
                        {showDC && toNum(form.delivery_charges) !== 0 ? ` ${toNum(form.delivery_charges) >= 0 ? "+" : "−"} ${money(Math.abs(toNum(form.delivery_charges)))}` : ""}
                        {toNum(form.discount) !== 0 ? ` − ${money(form.discount)}` : ""}
                      </p>
                    </div>
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
                    background: mastersLoading ? "#fff7ed" : "#eef2ff",
                    color: mastersLoading ? "#ea580c" : "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}>
                    <i className={`bi ${mastersLoading ? "bi-arrow-repeat" : "bi-shield-check"}`}></i>
                  </span>
                  <span>{mastersLoading ? t.loadingMaster : "Ready to save invoice"}</span>
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
                    disabled={mastersLoading}
                    style={{
                      minWidth: 180,
                      padding: "12px 18px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 900,
                      background: mastersLoading ? "#94a3b8" : "#1d4ed8",
                      color: "white",
                      border: "1.5px solid #1d4ed8",
                      cursor: mastersLoading ? "not-allowed" : "pointer",
                      boxShadow: mastersLoading ? "none" : "0 12px 26px rgba(29,78,216,0.26)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <i className="bi bi-save2-fill"></i>
                    {editingId ? t.updateInvoice : t.saveInvoice}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="slide-up" style={{ background: "white", borderRadius: 10, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 1000, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {[
                    { k: "no",     l: t.col_no,            align: "center", w: 40 },
                    { k: "inv",    l: t.col_invoiceNo,      align: isUrdu ? "right" : "left" },
                    { k: "ref",    l: t.referenceNo,        align: isUrdu ? "right" : "left" },
                    { k: "type",   l: t.partyType,          align: "center" },
                    { k: "cust",   l: t.partyName,          align: isUrdu ? "right" : "left" },
                    { k: "date",   l: t.col_date,           align: "center" },
                    { k: "items",  l: t.col_items,          align: "center" },
                    { k: "total",  l: t.col_invoiceTotal,   align: "right" },
                    { k: "prev",   l: t.col_prevBalance,    align: "right" },
                    { k: "del",    l: t.col_deliveryCharges,align: "right" },
                    { k: "disc",   l: t.col_discount,       align: "right" },
                    { k: "grand",  l: t.col_grandTotal,     align: "right" },
                    { k: "act",    l: t.col_actions,        align: "center" },
                  ].map(col => (
                    <th key={col.k} style={{
                      padding: "11px 10px", textAlign: col.align, width: col.w,
                      fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.75)",
                      textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap",
                      borderBottom: "none",
                    }}>
                      {col.l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingInv ? (
                  <tr><td colSpan={13} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
                    <i className="bi bi-arrow-repeat" style={{ fontSize: 24, display: "block", marginBottom: 8, animation: "spin 1s linear infinite" }}></i>
                    <span style={{ fontSize: 13 }}>{t.loading}</span>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={13} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>{t.noRecords}</td></tr>
                ) : (
                  filtered.map((inv, idx) => {
                    const pType  = getInvPartyType(inv);
                    const ptObj  = PARTY_TYPES.find(p => p.value === pType);
                    const bdSty  = PARTY_BADGE_STYLE[pType] || "background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;";
                    return (
                      <tr key={inv.id} className="tbl-row" style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}>
                        <td style={{ padding: "10px", textAlign: "center", color: "#94a3b8", fontFamily: "monospace", fontSize: 12 }}>{idx + 1}</td>
                        <td style={{ padding: "10px", fontFamily: "monospace", fontWeight: 700, color: "#0f172a", fontSize: 11.8, whiteSpace: "nowrap" }}>{inv.invoice_no}</td>
                        <td style={{ padding: "10px", fontFamily: "monospace", color: "#64748b", fontSize: 12 }}>{inv.reference_no || <span style={{ color: "#e2e8f0" }}>—</span>}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {ptObj ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, ...Object.fromEntries(bdSty.split(";").filter(Boolean).map(s => { const [k,v] = s.split(":"); return [k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase()), v.trim()]; })) }}>
                              <i className={`bi ${ptObj.icon}`}></i>{t[ptObj.labelKey]}
                            </span>
                          ) : <span style={{ color: "#e2e8f0" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px", fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{getInvPartyName(inv)}</td>
                        <td style={{ padding: "10px", textAlign: "center", fontFamily: "monospace", fontSize: 10.5, color: "#475569", whiteSpace: "nowrap" }}>{inv.invoice_date || "-"}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "#eef2ff", color: "#6366f1", fontSize: 11.5, fontWeight: 700, border: "1px solid #c7d2fe" }}>
                            {inv.items_count || inv.items?.length || 0}
                          </span>
                        </td>
                        {[inv.invoice_total, inv.previous_balance, inv.delivery_charges ?? inv.deliveryCharges, inv.discount].map((v, vi) => (
                          <td key={vi} style={{ padding: "10px", textAlign: isUrdu ? "left" : "right", fontFamily: "monospace", fontWeight: 600, color: "#475569", fontSize: 11.8, whiteSpace: "nowrap" }}>{money(v)}</td>
                        ))}
                        <td style={{ padding: "10px", textAlign: isUrdu ? "left" : "right", fontFamily: "monospace", fontWeight: 800, color: "#1e40af", fontSize: 13, whiteSpace: "nowrap" }}>{money(inv.grand_total)}</td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            {[
                              { icon: "bi-pencil-square", bg: "#eef2ff", color: "#6366f1", hbg: "#e0e7ff", fn: () => openEdit(inv.id) },
                              { icon: "bi-trash3",        bg: "#fef2f2", color: "#ef4444", hbg: "#fee2e2", fn: () => handleDelete(inv.id) },
                              { icon: "bi-printer-fill",  bg: "#fefce8", color: "#ca8a04", hbg: "#fef9c3", fn: () => handlePrint(inv.id) },
                            ].map(btn => (
                              <button key={btn.icon} onClick={btn.fn} style={{
                                width: 30, height: 30, borderRadius: 8, border: "none",
                                background: btn.bg, color: btn.color, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                                transition: "all 0.15s",
                              }}
                                onMouseEnter={e => e.currentTarget.style.background = btn.hbg}
                                onMouseLeave={e => e.currentTarget.style.background = btn.bg}
                              >
                                <i className={`bi ${btn.icon}`}></i>
                              </button>
                            ))}
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

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        input:focus, select:focus { outline:none; }
        input:disabled, select:disabled { cursor:not-allowed; }
      `}</style>
    </div>
  );
};

export default SalesInvoicePage;
