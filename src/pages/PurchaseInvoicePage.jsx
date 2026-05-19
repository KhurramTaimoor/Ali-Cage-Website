import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Purchase Invoice",
    subtitle: "Multi-product purchase invoices with debit, credit & printable receipt",
    newInvoice: "New Invoice",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by invoice no, supplier, product or date...",
    invoiceNo: "Invoice No",
    invoiceNoRequired: "Invoice No is required.",
    supplier: "Supplier",
    supplierRequired: "Please select a supplier.",
    supplierPlaceholder: "Select supplier",
    date: "Invoice Date",
    debit: "Debit (PKR)",
    credit: "Credit (PKR)",
    debitPlaceholder: "Amount owed to supplier",
    creditPlaceholder: "Amount paid to supplier",
    totalAmount: "Invoice Total",
    grandTotal: "Grand Total",
    balance: "Balance",
    items: "Items",
    itemsSubtitle: "Select category, product, unit and quantity per line",
    newLine: "Add Line",
    category: "Category",
    product: "Product",
    productDescription: "Product Description",
    productDescriptionPlaceholder: "Write a detailed product description — specs, notes, batch info, special instructions...",
    productDescriptionHint: "Optional · Appears on printed invoice",
    unit: "Unit",
    type: "Type",
    typePlaceholder: "Select type",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    delete: "Delete",
    saveInvoice: "Save Invoice",
    updateInvoice: "Update Invoice",
    cancel: "Cancel",
    editTitle: "Edit Invoice",
    newTitle: "New Purchase Invoice",
    formSubtitle: "Purchase invoice with debit, credit and product details",
    col_no: "#",
    col_invoiceNo: "Invoice No",
    col_supplier: "Supplier",
    col_date: "Date",
    col_items: "Items",
    col_invoiceTotal: "Invoice Total",
    col_debit: "Debit",
    col_credit: "Credit",
    col_balance: "Balance",
    col_actions: "Actions",
    loading: "Loading invoices...",
    noRecords: "No invoices found.",
    loadingMaster: "Loading...",
    selectCategory: "-- Select Category --",
    selectProduct: "-- Select Product --",
    selectUnit: "-- Select Unit --",
    selectSupplier: "-- Select Supplier --",
    selectType: "-- Select Type --",
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
    totalInvoices: "Total Invoices",
    totalItems: "Total Items",
    totalValue: "Total Value",
    filterAll: "All",
    filter24h: "Last 24 Hours",
    filter7d: "Last 7 Days",
    filterMonth: "This Month",
    filterLabel: "Filter:",
    slipTitle: "Purchase Invoice Receipt",
    slipSupplier: "Supplier",
    slipDate: "Invoice Date",
    slipDebit: "Debit",
    slipCredit: "Credit",
    slipBalance: "Balance",
    slipInvoiceTotal: "Invoice Total",
    slipPrintedOn: "Generated",
    slipThank: "Thank you for your business!",
    companyName: "Ali Cages",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
    translating: "Translating to Urdu…",
    descClear: "Clear",
    descChars: "chars",
    suppliers: "Suppliers",
    categories: "Categories",
    products: "Products",
    units: "Units",
    types: "Types",
    na: "-",
  },
  ur: {
    title: "پرچیز انوائس",
    subtitle: "ملٹی پروڈکٹ، ڈیبٹ، کریڈٹ اور پرنٹ ایبل پرچیز انوائس",
    newInvoice: "نئی انوائس",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "انوائس نمبر، سپلائر یا تاریخ سے تلاش کریں...",
    invoiceNo: "انوائس نمبر",
    invoiceNoRequired: "انوائس نمبر ضروری ہے۔",
    supplier: "سپلائر",
    supplierRequired: "سپلائر منتخب کرنا ضروری ہے۔",
    supplierPlaceholder: "سپلائر منتخب کریں",
    date: "انوائس تاریخ",
    debit: "ڈیبٹ (روپے)",
    credit: "کریڈٹ (روپے)",
    debitPlaceholder: "سپلائر کو واجب الادا رقم",
    creditPlaceholder: "سپلائر کو ادا کی گئی رقم",
    totalAmount: "کل رقم",
    grandTotal: "ٹوٹل بل رقم",
    balance: "بیلنس",
    items: "آئٹمز",
    itemsSubtitle: "ہر لائن میں کیٹیگری، پروڈکٹ، یونٹ اور مقدار",
    newLine: "نئی لائن",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    productDescription: "پروڈکٹ تفصیل",
    productDescriptionPlaceholder: "تفصیل لکھیں — اسپیک، نوٹ، بیچ معلومات، خاص ہدایات...",
    productDescriptionHint: "اختیاری · پرنٹ شدہ انوائس پر ظاہر ہوگا",
    unit: "یونٹ",
    type: "ٹائپ",
    typePlaceholder: "ٹائپ منتخب کریں",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",
    delete: "حذف",
    saveInvoice: "انوائس محفوظ کریں",
    updateInvoice: "انوائس اپڈیٹ کریں",
    cancel: "منسوخ",
    editTitle: "انوائس ترمیم",
    newTitle: "نئی پرچیز انوائس",
    formSubtitle: "پرچیز انوائس بمعہ ڈیبٹ، کریڈٹ اور پروڈکٹ تفصیل",
    col_no: "#",
    col_invoiceNo: "انوائس نمبر",
    col_supplier: "سپلائر",
    col_date: "تاریخ",
    col_items: "آئٹمز",
    col_invoiceTotal: "انوائس رقم",
    col_debit: "ڈیبٹ",
    col_credit: "کریڈٹ",
    col_balance: "بیلنس",
    col_actions: "اقدامات",
    loading: "Invoices لوڈ ہو رہی ہیں...",
    noRecords: "کوئی انوائس نہیں ملی۔",
    loadingMaster: "لوڈ ہو رہا ہے...",
    selectCategory: "-- کیٹیگری منتخب کریں --",
    selectProduct: "-- پروڈکٹ منتخب کریں --",
    selectUnit: "-- یونٹ منتخب کریں --",
    selectSupplier: "-- سپلائر منتخب کریں --",
    selectType: "-- ٹائپ منتخب کریں --",
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
    totalInvoices: "کل انوائسز",
    totalItems: "کل آئٹمز",
    totalValue: "کل رقم",
    filterAll: "سب",
    filter24h: "آخری 24 گھنٹے",
    filter7d: "آخری 7 دن",
    filterMonth: "یہ مہینہ",
    filterLabel: "فلٹر:",
    slipTitle: "پرچیز انوائس رسید",
    slipSupplier: "سپلائر",
    slipDate: "انوائس تاریخ",
    slipDebit: "ڈیبٹ",
    slipCredit: "کریڈٹ",
    slipBalance: "بیلنس",
    slipInvoiceTotal: "ٹوٹل انوائس رقم",
    slipPrintedOn: "تیار کردہ",
    slipThank: "آپ کے کاروبار کا شکریہ!",
    companyName: "علی کیجز",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    descClear: "صاف کریں",
    descChars: "حروف",
    suppliers: "Suppliers",
    categories: "Categories",
    products: "Products",
    units: "Units",
    types: "Types",
    na: "-",
  },
};

const API_ROOT         = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE         = `${API_ROOT}/api/purchase-invoices`;
const SUPPLIERS_API    = `${API_ROOT}/api/suppliers`;
const CATEGORIES_API   = `${API_ROOT}/api/categories`;
const PRODUCTS_API     = `${API_ROOT}/api/products`;
const UNITS_API        = `${API_ROOT}/api/units`;
const PROD_TYPES_API   = `${API_ROOT}/api/product-types`;

const DESC_MAX = 500;

const getList = (data) => {
  if (Array.isArray(data))           return data;
  if (Array.isArray(data?.data))     return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.result))   return data.result;
  return [];
};

const money    = (v) => Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const toNumber = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

const getSupplierName  = (o) => o?.supplier_name  || o?.supplier_name_en  || o?.name || o?.name_en || o?.title || "";
const getCategoryName  = (o) => o?.category_name  || o?.category_name_en  || o?.name || o?.name_en || o?.title || "";
const getProductName   = (o) => o?.product_name   || o?.product_name_en   || o?.name || o?.name_en || o?.item_name || o?.title || "";
const getProductDesc   = (o) => o?.product_description || o?.product_description_en || o?.description || o?.details || o?.remarks || "";
const getUnitName      = (o) => o?.unit_name      || o?.unit_name_en      || o?.name || o?.name_en || o?.symbol || o?.title || "";
const getTypeName      = (o) => o?.product_type_en || o?.type_name || o?.type_name_en || o?.name || o?.name_en || o?.title || "";
const getRecordId      = (o) => o?.id ?? o?.value ?? o?.supplier_id ?? "";
const getProductRate   = (o) => o?.purchase_rate ?? o?.piece_rate ?? o?.rate ?? o?.price ?? 0;
const getProductCatId  = (o) => o?.category_id ?? o?.categoryId ?? o?.category?.id ?? o?.category ?? "";
const getProductUnitId = (o) => o?.unit_id ?? o?.unitId ?? o?.unit?.id ?? o?.unit ?? "";

const generateInvoiceNo = (existing) => {
  let max = 0;
  existing.forEach((inv) => {
    const m = String(inv.invoice_no || "").match(/^PI-(\d+)$/i);
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  });
  return `PI-${String(max + 1).padStart(3, "0")}`;
};

async function translateText(text) {
  if (!text || !String(text).trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(String(text).trim())}&langpair=en|ur`;
    const res  = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const tr   = data?.responseData?.translatedText;
    if (!tr || tr.toLowerCase() === String(text).trim().toLowerCase()) return text;
    return tr;
  } catch { return text; }
}

const createEmptyItem = () => ({
  category_id: "", product_id: "", product_description: "",
  unit_id: "", type_name: "", qty: "", rate: "0", amount: "0",
});

const createEmptyForm = () => ({
  invoice_no: "",
  supplier_id: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  debit: "0",
  credit: "0",
});

function useLookup(url) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const fetchData = async () => {
    setLoading(true); setError("");
    try { const res = await axios.get(url); setData(getList(res.data)); }
    catch (err) { setError(err?.message || "Load error"); }
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

function ProductDescriptionBox({ value, onChange, onClear, t, isUrdu }) {
  const textareaRef = useAutoResize(value);
  const len       = (value || "").length;
  const nearLimit = len > DESC_MAX * 0.8;
  const atLimit   = len >= DESC_MAX;
  const hasContent = len > 0;

  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
      ${hasContent
        ? "border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white shadow-sm shadow-indigo-100"
        : "border-sky-100 bg-sky-50/30"
      }`}
    >
      <div className={`flex items-center justify-between gap-2 px-3 pt-2.5 pb-1.5 border-b
        ${hasContent ? "border-indigo-100" : "border-sky-100"}`}
      >
        <div className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
          <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[11px]
            ${hasContent ? "bg-indigo-100 text-indigo-600" : "bg-sky-100 text-sky-500"}`}>
            <i className="bi bi-card-text"></i>
          </span>
          <span className={`text-[11px] font-bold tracking-wide uppercase
            ${hasContent ? "text-indigo-600" : "text-slate-500"}`}>
            {t.productDescription}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
            ${hasContent ? "bg-indigo-100 text-indigo-500" : "bg-sky-100 text-sky-400"}`}>
            {t.productDescriptionHint}
          </span>
        </div>
        <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
          <span className={`text-[10px] font-mono font-semibold transition-colors
            ${atLimit ? "text-rose-500" : nearLimit ? "text-amber-500" : "text-slate-400"}`}>
            {len}/{DESC_MAX} {t.descChars}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300
              ${atLimit ? "bg-rose-400" : nearLimit ? "bg-amber-400" : "bg-indigo-400"}`}
              style={{ width: `${Math.min((len / DESC_MAX) * 100, 100)}%` }} />
          </div>
          {hasContent && (
            <button type="button" onClick={onClear} title={t.descClear}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold
                bg-white border border-slate-200 text-slate-500 hover:bg-rose-50
                hover:border-rose-200 hover:text-rose-500 transition-all">
              <i className="bi bi-x-circle text-[11px]"></i>{t.descClear}
            </button>
          )}
        </div>
      </div>
      <div className="relative px-3 py-2">
        <textarea ref={textareaRef} value={value}
          onChange={(e) => onChange(e.target.value.slice(0, DESC_MAX))}
          placeholder={t.productDescriptionPlaceholder}
          rows={3} dir={isUrdu ? "rtl" : "ltr"}
          className={`w-full resize-none bg-transparent border-0 outline-none focus:ring-0
            text-[12.5px] leading-relaxed text-slate-800 placeholder:text-slate-300
            min-h-[72px] transition-all duration-200
            ${isUrdu ? "text-right" : "text-left"}`}
          style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "inherit" }} />
        {!hasContent && (
          <i className={`bi bi-pencil-fill absolute top-3 text-slate-200 text-base pointer-events-none
            ${isUrdu ? "left-4" : "right-4"}`} />
        )}
      </div>
      {!hasContent && (
        <div className={`flex gap-1.5 flex-wrap px-3 pb-2.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
          {["Batch info", "Size / weight", "Color", "Special notes"].map((chip) => (
            <button key={chip} type="button" onClick={() => onChange(chip + ": ")}
              className="text-[10px] px-2 py-0.5 rounded-full border border-sky-200
                bg-white text-sky-600 hover:bg-sky-50 hover:border-sky-300 transition-all">
              + {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function generateInvoicePrint(invoice, lang, urduCache, { categoryMap, productMap, unitMap, supplierMap }) {
  const t      = LANG[lang || "en"];
  const isUrdu = lang === "ur";
  const dir    = isUrdu ? "rtl" : "ltr";
  const items  = Array.isArray(invoice?.items) ? invoice.items : [];

  const invoiceTotal = toNumber(invoice?.invoice_total);
  const debit        = toNumber(invoice?.debit);
  const credit       = toNumber(invoice?.credit);
  const balance      = debit - credit;

  const supplierName = isUrdu
    ? urduCache[`supplier:${invoice.supplier_id}`] || invoice.supplier_name || "-"
    : invoice.supplier_name || "-";

  const translated = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const rowsHtml = items.map((row, idx) => {
    const descHtml = (row.product_description || "")
      ? `<div style="font-size:10px;color:#64748b;margin-top:3px;line-height:1.5;white-space:pre-wrap">${row.product_description}</div>`
      : "";
    return `
      <tr>
        <td class="center">${idx + 1}</td>
        <td><div>${translated("product", row.product_id, row.product_name || "")}</div>${descHtml}</td>
        <td>${translated("category", row.category_id, row.category_name || "")}</td>
        <td class="center">${translated("unit", row.unit_id, row.unit_name || "")}</td>
        <td>${row.type_name || "-"}</td>
        <td class="num">${money(row.qty)}</td>
        <td class="num">${money(row.rate)}</td>
        <td class="num strong violet">${money(row.amount)}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <title>${invoice.invoice_no || "purchase-invoice"}</title>
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
    table{width:100%;border-collapse:collapse;}
    thead th{background:#0f4c97;color:white;font-size:12px;padding:12px 10px;border:1px solid #1d4ed8;text-align:${isUrdu?"right":"left"};}
    tbody td{border:1px solid #dbeafe;padding:10px;font-size:12px;vertical-align:top;}
    tbody tr:nth-child(even) td{background:#f8fbff;}
    .center{text-align:center!important;}
    .num{text-align:${isUrdu?"left":"right"}!important;white-space:nowrap;font-weight:700;font-family:'Inter',Arial,sans-serif;}
    .strong{font-weight:800;}
    .violet{color:#7c3aed;}
    .totals{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
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
        <div class="card"><small>${t.supplier}</small><div class="value">${supplierName}</div></div>
        <div class="card"><small>${t.slipDate}</small><div class="value">${invoice.invoice_date || "-"}</div></div>
        <div class="card"><small>${t.slipInvoiceTotal}</small><div class="value">${money(invoiceTotal)}</div></div>
        <div class="card"><small>${t.slipDebit}</small><div class="value">${money(debit)}</div></div>
        <div class="card"><small>${t.slipCredit}</small><div class="value">${money(credit)}</div></div>
      </div>
      <table>
        <thead><tr>
          <th class="center">#</th><th>${t.product}</th><th>${t.category}</th>
          <th class="center">${t.unit}</th><th>${t.type}</th>
          <th class="num">${t.qty}</th><th class="num">${t.rate}</th><th class="num">${t.amount}</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="totals">
        <div class="total-box"><span class="label">${t.slipInvoiceTotal}</span><div class="value">${money(invoiceTotal)}</div></div>
        <div class="total-box"><span class="label">${t.slipDebit}</span><div class="value">${money(debit)}</div></div>
        <div class="total-box"><span class="label">${t.slipCredit}</span><div class="value">${money(credit)}</div></div>
        <div class="total-box grand"><span class="label">${t.slipBalance}</span><div class="value">${money(balance)}</div></div>
      </div>
    </div>
    <div class="footer"><span>${t.companyName} — ${t.slipThank}</span><span>Page 1 / 1</span></div>
  </div></div>
  <script>window.onload=()=>{setTimeout(()=>{window.print();},400);};<\/script>
</body></html>`;

  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PurchaseInvoicePage = () => {
  const [lang, setLang] = useState("en");
  const t      = LANG[lang];
  const isUrdu = lang === "ur";
  const dir    = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const labelClass  = "block text-[11px] font-semibold text-slate-500 mb-0.5";
  const inputCls    = `w-full min-w-0 border border-sky-100 rounded-lg py-1.5 text-xs text-black bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 truncate ${isUrdu ? "pr-2 pl-2 text-right" : "px-2"}`;
  const readonlyClass = "w-full min-w-0 rounded-lg border border-sky-100 bg-sky-50 px-2 py-1.5 text-xs font-bold font-mono text-slate-950 text-right truncate";

  const { data: suppliers,   loading: suppliersLoading,   error: suppliersError,   refetch: refetchSuppliers   } = useLookup(SUPPLIERS_API);
  const { data: categories,  loading: categoriesLoading,  error: categoriesError,  refetch: refetchCategories  } = useLookup(CATEGORIES_API);
  const { data: products,    loading: productsLoading,    error: productsError,    refetch: refetchProducts    } = useLookup(PRODUCTS_API);
  const { data: units,       loading: unitsLoading,       error: unitsError,       refetch: refetchUnits       } = useLookup(UNITS_API);
  const { data: productTypes,loading: typesLoading,       error: typesError,       refetch: refetchTypes       } = useLookup(PROD_TYPES_API);

  const [invoices,        setInvoices]        = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [search,          setSearch]          = useState("");
  const [dateFilter,      setDateFilter]      = useState("24h");
  const [showForm,        setShowForm]        = useState(false);
  const [showSummary,     setShowSummary]     = useState(false);
  const [editingId,       setEditingId]       = useState(null);
  const [form,            setForm]            = useState(createEmptyForm());
  const [items,           setItems]           = useState([createEmptyItem()]);
  const [message,         setMessage]         = useState({ type: "", text: "" });
  const [urduCache,       setUrduCache]       = useState({});
  const [translating,     setTranslating]     = useState(false);

  const mastersLoading = suppliersLoading || categoriesLoading || productsLoading || unitsLoading || typesLoading;
  const mastersError   = suppliersError   || categoriesError   || productsError   || unitsError   || typesError;

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const supplierMap = useMemo(() => {
    const map = {};
    suppliers.forEach((s) => { const id = getRecordId(s); if (id !== "") map[String(id)] = getSupplierName(s) || `#${id}`; });
    return map;
  }, [suppliers]);

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

  const typeOptions = useMemo(() =>
    productTypes.map((pt) => getTypeName(pt)).filter(Boolean),
  [productTypes]);

  const getTranslated = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try { const res = await axios.get(API_BASE); setInvoices(getList(res.data)); }
    catch { showToast("error", t.invoicesError); }
    finally { setLoadingInvoices(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur") return;
    setTranslating(true);
    try {
      const nextCache = { ...urduCache };
      const tasks = [
        ...suppliers.map(async (s) => {
          const id = getRecordId(s); const base = getSupplierName(s);
          if (base && !nextCache[`supplier:${id}`]) nextCache[`supplier:${id}`] = await translateText(base);
        }),
        ...categories.map(async (c) => {
          const base = getCategoryName(c);
          if (base && !nextCache[`category:${c.id}`]) nextCache[`category:${c.id}`] = await translateText(base);
        }),
        ...products.map(async (p) => {
          const base = getProductName(p);
          if (base && !nextCache[`product:${p.id}`]) nextCache[`product:${p.id}`] = await translateText(base);
        }),
        ...units.map(async (u) => {
          const base = getUnitName(u);
          if (base && !nextCache[`unit:${u.id}`]) nextCache[`unit:${u.id}`] = await translateText(base);
        }),
      ];
      await Promise.all(tasks);
      setUrduCache(nextCache);
    } catch (err) { console.error(err); }
    finally { setTranslating(false); }
  };

  const ensurePrintTranslations = async (invoice) => {
    if (lang !== "ur") return urduCache;
    const nextCache = { ...urduCache };
    const supName = invoice.supplier_name || supplierMap[String(invoice.supplier_id)] || "";
    if (supName && !nextCache[`supplier:${invoice.supplier_id}`])
      nextCache[`supplier:${invoice.supplier_id}`] = await translateText(supName);
    for (const row of invoice.items || []) {
      const prodBase = row.product_name  || productMap[String(row.product_id)];
      const catBase  = row.category_name || categoryMap[String(row.category_id)];
      const unitBase = row.unit_name     || unitMap[String(row.unit_id)];
      if (row.product_id  && prodBase  && !nextCache[`product:${row.product_id}`])   nextCache[`product:${row.product_id}`]   = await translateText(prodBase);
      if (row.category_id && catBase   && !nextCache[`category:${row.category_id}`]) nextCache[`category:${row.category_id}`] = await translateText(catBase);
      if (row.unit_id     && unitBase  && !nextCache[`unit:${row.unit_id}`])          nextCache[`unit:${row.unit_id}`]         = await translateText(unitBase);
    }
    setUrduCache(nextCache);
    return nextCache;
  };

  // Totals
  const invoiceTotal = useMemo(() => items.reduce((sum, row) => sum + toNumber(row.amount), 0), [items]);
  const balance      = useMemo(() => toNumber(form.debit) - toNumber(form.credit), [form.debit, form.credit]);

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
    const q = search.toLowerCase();
    return list.filter((inv) => [
      inv.invoice_no,
      supplierMap[String(inv.supplier_id)] || inv.supplier_name || "",
      inv.invoice_date,
    ].join(" ").toLowerCase().includes(q));
  }, [invoices, search, dateFilter, supplierMap]);

  const summary = useMemo(() => ({
    totalInvoices: invoices.length,
    totalItems:    invoices.reduce((sum, inv) => sum + Number(inv.items_count || inv.items?.length || 0), 0),
    totalValue:    invoices.reduce((sum, inv) => sum + toNumber(inv.invoice_total), 0),
  }), [invoices]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...createEmptyForm(), invoice_no: generateInvoiceNo(invoices) });
    setItems([createEmptyItem()]);
    setShowForm(true);
  };

  const openEdit = async (invoiceId) => {
    try {
      const res = await axios.get(`${API_BASE}/${invoiceId}`);
      const inv = res.data?.data || res.data;
      setEditingId(inv.id);
      setForm({
        invoice_no:   inv.invoice_no   || "",
        supplier_id:  String(inv.supplier_id || ""),
        invoice_date: inv.invoice_date || new Date().toISOString().slice(0, 10),
        debit:        String(inv.debit  || 0),
        credit:       String(inv.credit || 0),
      });
      const invoiceItems = Array.isArray(inv.items) && inv.items.length
        ? inv.items.map((row) => ({
            category_id:         String(row.category_id ?? ""),
            product_id:          String(row.product_id  ?? ""),
            product_description: String(row.product_description ?? row.description ?? ""),
            unit_id:             String(row.unit_id ?? ""),
            type_name:           String(row.type_name || ""),
            qty:                 String(row.qty || row.quantity || ""),
            rate:                String(row.rate   || 0),
            amount:              String(row.amount || 0),
          }))
        : [createEmptyItem()];
      setItems(invoiceItems);
      setShowForm(true);
    } catch { showToast("error", t.editError); }
  };

  const handlePrint = async (invoiceId) => {
    try {
      const res = await axios.get(`${API_BASE}/${invoiceId}`);
      const inv = res.data?.data || res.data;
      const normalizedItems = (inv.items || []).map((row, idx) => ({
        sr:                  idx + 1,
        category_id:         String(row.category_id ?? ""),
        product_id:          String(row.product_id  ?? ""),
        product_description: row.product_description || row.description || "",
        unit_id:             String(row.unit_id ?? ""),
        type_name:           row.type_name || "",
        category_name:       row.category_name || categoryMap[String(row.category_id)] || "",
        product_name:        row.product_name  || productMap[String(row.product_id)]   || "",
        unit_name:           row.unit_name     || unitMap[String(row.unit_id)]          || "",
        qty:                 row.qty || row.quantity || 0,
        rate:                row.rate   || 0,
        amount:              row.amount || 0,
      }));
      const prepared = {
        ...inv,
        supplier_name: inv.supplier_name || supplierMap[String(inv.supplier_id)] || "",
        items:         normalizedItems,
        invoice_total: inv.invoice_total ?? normalizedItems.reduce((s, r) => s + toNumber(r.amount), 0),
        debit:         inv.debit  || 0,
        credit:        inv.credit || 0,
      };
      let cacheToUse = urduCache;
      if (lang === "ur") {
        setTranslating(true);
        try { cacheToUse = await ensurePrintTranslations(prepared); }
        finally { setTranslating(false); }
      }
      generateInvoicePrint(prepared, lang, cacheToUse, { categoryMap, productMap, unitMap, supplierMap });
    } catch { showToast("error", t.printError); }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try { await axios.delete(`${API_BASE}/${invoiceId}`); showToast("success", t.deleteSuccess); fetchInvoices(); }
    catch { showToast("error", t.deleteError); }
  };

  const calculateRow = (row) => {
    const qty    = toNumber(row.qty);
    const rate   = toNumber(row.rate);
    const amount = qty * rate;
    return { amount: String(amount.toFixed(2)) };
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        let updated = { ...row, [field]: value };
        if (field === "category_id") {
          updated.product_id = ""; updated.product_description = "";
          updated.unit_id = ""; updated.type_name = "";
          updated.qty = ""; updated.rate = "0"; updated.amount = "0";
        }
        if (field === "product_id") {
          const sel = products.find((p) => String(p.id) === String(value));
          if (sel) {
            updated.category_id         = String(getProductCatId(sel)  || updated.category_id || "");
            updated.unit_id             = String(getProductUnitId(sel)  || "");
            updated.product_description = getProductDesc(sel)           || updated.product_description || "";
            updated.rate                = String(getProductRate(sel)    || 0);
          }
        }
        if (field === "product_description") return updated;
        const calc    = calculateRow(updated);
        updated.amount = calc.amount;
        return updated;
      })
    );
  };

  const addItemRow    = () => setItems((prev) => [...prev, createEmptyItem()]);
  const removeItemRow = (index) => setItems((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!form.invoice_no.trim()) { showToast("error", t.invoiceNoRequired); return; }
    if (!form.supplier_id)        { showToast("error", t.supplierRequired);  return; }
    const validItems = items.filter((row) =>
      row.product_id && row.unit_id && toNumber(row.qty) > 0
    );
    if (!validItems.length) { showToast("error", t.validItemRequired); return; }
    const preparedItems = validItems.map((row, idx) => ({
      sr:                  idx + 1,
      category_id:         Number(row.category_id) || null,
      product_id:          Number(row.product_id),
      product_description: String(row.product_description || "").trim(),
      description:         String(row.product_description || "").trim(),
      unit_id:             Number(row.unit_id),
      type_name:           row.type_name || "",
      qty:                 toNumber(row.qty),
      quantity:            toNumber(row.qty),
      rate:                toNumber(row.rate),
      amount:              toNumber(row.amount),
    }));
    const invTotal = preparedItems.reduce((s, r) => s + toNumber(r.amount), 0);
    const payload  = {
      invoice_no:    form.invoice_no.trim(),
      supplier_id:   Number(form.supplier_id),
      invoice_date:  form.invoice_date,
      invoice_total: invTotal,
      debit:         toNumber(form.debit),
      credit:        toNumber(form.credit),
      items:         preparedItems,
    };
    try {
      if (editingId) { await axios.put(`${API_BASE}/${editingId}`, payload); showToast("success", t.updateSuccess); }
      else           { await axios.post(API_BASE, payload);                  showToast("success", t.saveSuccess);   }
      setShowForm(false); setEditingId(null);
      setForm(createEmptyForm()); setItems([createEmptyItem()]);
      fetchInvoices();
    } catch { showToast("error", t.saveError); }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const fieldLabel = "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500 mb-1.5";
  const fieldInput = `w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-[12px] font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-400 ${isUrdu ? "text-right" : ""}`;
  const moneyInput = "w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-[12px] font-mono font-bold text-slate-900 text-right outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100";
  const readAmount = "w-full h-9 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[12px] font-mono font-black text-indigo-700 text-right flex items-center justify-end";

  return (
    <div dir={dir} style={{ fontFamily: baseFont }} className="min-h-screen bg-slate-100 pb-16">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .pi-modal-in { animation: modalIn .22s ease-out both; }
        .pi-toast-in { animation: toastIn .18s ease-out both; }
        .pi-scroll::-webkit-scrollbar { width: 7px; height: 7px; }
        .pi-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .pi-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .pi-table-row:hover td { background: #f8fafc; }
      `}</style>

      {message.text && (
        <div className={`pi-toast-in fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-[70] px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-bold flex items-center gap-2 ${message.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>
          <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {message.text}
        </div>
      )}

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-3 rounded-xl shadow-2xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Page header - same Sales Invoice style */}
        <div className={`bg-white border border-slate-200 shadow-sm rounded-b-2xl px-5 sm:px-6 py-5 mb-5 flex items-center justify-between gap-4 flex-wrap ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
          <div>
            <h1 className="text-[26px] sm:text-[28px] font-black tracking-tight text-slate-900 leading-tight m-0">{t.title}</h1>
            <p className="text-[13px] text-slate-500 mt-1 m-0">{t.subtitle}</p>
          </div>

          <div className={`flex items-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              onClick={handleLangToggle}
              disabled={translating}
              className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              <i className={`bi ${translating ? "bi-arrow-repeat animate-spin" : "bi-translate"}`}></i>
              {t.toggleLang}
            </button>

            <button
              type="button"
              onClick={() => setShowSummary((v) => !v)}
              className={`h-10 px-4 rounded-xl border text-sm font-bold transition shadow-sm flex items-center gap-2 ${showSummary ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <i className="bi bi-bar-chart-fill"></i>
              {t.summaryBtn.replace("View ", "")}
              <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-[10px]`}></i>
            </button>

            <button
              type="button"
              onClick={openAdd}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              <i className="bi bi-file-earmark-plus-fill"></i>
              {t.newInvoice}
            </button>
          </div>
        </div>

        {showSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-0 sm:px-0 mb-5">
            {[
              { label: t.totalInvoices, value: summary.totalInvoices, icon: "bi-receipt", tone: "bg-indigo-50 text-indigo-700 border-indigo-100" },
              { label: t.totalItems, value: summary.totalItems, icon: "bi-box-seam", tone: "bg-sky-50 text-sky-700 border-sky-100" },
              { label: t.totalValue, value: money(summary.totalValue), icon: "bi-cash-stack", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${card.tone}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <p className="text-xs font-bold text-slate-500 m-0">{card.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1 m-0">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search & filters - same Sales Invoice style */}
        <div className={`flex flex-wrap items-center gap-2 mb-5 ${isUrdu ? "flex-row-reverse" : ""}`}>
          <div className="relative w-full sm:w-[376px]">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full h-9 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`}
            />
          </div>

          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 px-1">{t.filterLabel.replace(":", "")}</span>
          {[
            { key: "24h", label: t.filter24h.replace("Last ", ""), icon: "bi-clock" },
            { key: "7d", label: t.filter7d.replace("Last ", ""), icon: "bi-calendar-week" },
            { key: "month", label: t.filterMonth, icon: "bi-calendar-month" },
            { key: "all", label: t.filterAll, icon: "bi-list-ul" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setDateFilter(f.key)}
              className={`h-9 px-3 rounded-lg border text-[13px] font-bold transition shadow-sm flex items-center gap-1.5 ${dateFilter === f.key ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              <i className={`bi ${f.icon}`}></i>
              {f.label}
            </button>
          ))}
        </div>

        {/* Purchase invoice modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto pi-scroll">
            <div className="pi-modal-in mx-auto max-w-[1120px] max-h-[calc(100vh-32px)] bg-slate-50 rounded-2xl shadow-2xl border border-white/70 overflow-hidden flex flex-col" dir={dir}>
              <div className={`sticky top-0 z-20 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                <div className={`flex items-center gap-3 min-w-0 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                    <i className="bi bi-bag-check-fill text-lg"></i>
                  </div>
                  <div className="min-w-0">
                    <div className={`flex items-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight m-0">
                        {editingId ? t.editTitle : t.newTitle}
                      </h2>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase tracking-wide">
                        {form.invoice_no || t.invoiceNo}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 m-0">{t.formSubtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition flex items-center justify-center shrink-0"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 pi-scroll">
                {mastersError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-bold">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      {t.masterError}
                    </div>
                    <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                      {[
                        [refetchSuppliers, t.suppliers],
                        [refetchCategories, t.categories],
                        [refetchProducts, t.products],
                        [refetchUnits, t.units],
                        [refetchTypes, t.types],
                      ].map(([fn, label]) => (
                        <button type="button" key={label} onClick={fn} className="h-8 px-3 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-black">
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoice Information */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                    <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <i className="bi bi-file-earmark-text-fill"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-950 m-0">Invoice Information</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 m-0">Supplier, invoice number and date</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                      <i className="bi bi-asterisk text-rose-500"></i>
                      Required
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <label className={fieldLabel}>{t.invoiceNo}<span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <i className={`bi bi-hash absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-2.5" : "left-2.5"}`}></i>
                        <input
                          type="text"
                          value={form.invoice_no}
                          onChange={(e) => setForm((f) => ({ ...f, invoice_no: e.target.value }))}
                          className={`${fieldInput} font-mono ${isUrdu ? "pr-8" : "pl-8"}`}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <label className={fieldLabel}>{t.supplier}<span className="text-rose-500">*</span></label>
                      <select
                        value={form.supplier_id}
                        onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
                        className={fieldInput}
                      >
                        <option value="">{suppliersLoading ? t.loadingMaster : t.selectSupplier}</option>
                        {suppliers.map((s) => {
                          const id = getRecordId(s);
                          const label = getSupplierName(s);
                          return <option key={id} value={id}>{isUrdu ? urduCache[`supplier:${id}`] || label : label}</option>;
                        })}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={fieldLabel}>{t.date}</label>
                      <input
                        type="date"
                        value={form.invoice_date}
                        onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))}
                        className={fieldInput}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={fieldLabel}>{t.totalAmount}</label>
                      <div className={readAmount}>{money(invoiceTotal)}</div>
                    </div>
                  </div>
                </section>

                {/* Line Items */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                    <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                        <i className="bi bi-box-seam-fill"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-950 m-0">{t.items}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 m-0">{t.itemsSubtitle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="h-9 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[12px] font-black transition shadow-sm flex items-center gap-2"
                    >
                      <i className="bi bi-plus-lg"></i>
                      {t.newLine}
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {items.map((row, index) => {
                      const matchedProducts = products.filter((p) =>
                        !row.category_id || String(getProductCatId(p)) === String(row.category_id)
                      );
                      const filteredProducts = !row.category_id ? products : matchedProducts.length ? matchedProducts : products;

                      return (
                        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                          <div className={`px-3 py-2 border-b border-slate-200 bg-white flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                            <div className={`flex items-center gap-2 min-w-0 ${isUrdu ? "flex-row-reverse" : ""}`}>
                              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-[12px] font-black font-mono shrink-0">{index + 1}</span>
                              <div>
                                <p className="text-[13px] font-black text-slate-950 m-0">Item Row</p>
                                <p className="text-[10px] text-slate-500 m-0">Category, product, quantity and description</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              disabled={items.length === 1}
                              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
                              title={t.delete}
                            >
                              <i className="bi bi-trash3 text-[13px]"></i>
                            </button>
                          </div>

                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
                            <div className="lg:col-span-2">
                              <label className={fieldLabel}>{t.category}</label>
                              <select
                                value={row.category_id}
                                onChange={(e) => handleItemChange(index, "category_id", e.target.value)}
                                className={fieldInput}
                              >
                                <option value="">{categoriesLoading ? t.loadingMaster : t.selectCategory}</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>{getTranslated("category", c.id, getCategoryName(c))}</option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-3">
                              <label className={fieldLabel}>{t.product}<span className="text-rose-500">*</span></label>
                              <select
                                value={row.product_id}
                                onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                                className={fieldInput}
                              >
                                <option value="">{productsLoading ? t.loadingMaster : t.selectProduct}</option>
                                {filteredProducts.map((p) => (
                                  <option key={p.id} value={p.id}>{getTranslated("product", p.id, getProductName(p))}</option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-2">
                              <label className={fieldLabel}>{t.unit}<span className="text-rose-500">*</span></label>
                              <select
                                value={row.unit_id}
                                onChange={(e) => handleItemChange(index, "unit_id", e.target.value)}
                                className={fieldInput}
                              >
                                <option value="">{unitsLoading ? t.loadingMaster : t.selectUnit}</option>
                                {units.map((u) => (
                                  <option key={u.id} value={u.id}>{getTranslated("unit", u.id, getUnitName(u))}</option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-1">
                              <label className={fieldLabel}>{t.type}</label>
                              <select
                                value={row.type_name}
                                onChange={(e) => handleItemChange(index, "type_name", e.target.value)}
                                className={fieldInput}
                              >
                                <option value="">{typesLoading ? t.loadingMaster : t.selectType}</option>
                                {typeOptions.map((tp) => (
                                  <option key={tp} value={tp}>{tp}</option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-1">
                              <label className={fieldLabel}>{t.qty}</label>
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                className={moneyInput}
                                placeholder="0"
                              />
                            </div>

                            <div className="lg:col-span-1">
                              <label className={fieldLabel}>{t.rate}</label>
                              <input
                                type="number"
                                value={row.rate}
                                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                className={moneyInput}
                                placeholder="0"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className={fieldLabel}>{t.amount}</label>
                              <div className={readAmount}>{money(row.amount)}</div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-12">
                              <ProductDescriptionBox
                                value={row.product_description}
                                onChange={(val) => handleItemChange(index, "product_description", val)}
                                onClear={() => handleItemChange(index, "product_description", "")}
                                t={t}
                                isUrdu={isUrdu}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Totals */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-3 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <i className="bi bi-calculator-fill"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 m-0">Invoice Totals</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 m-0">Invoice total, debit, credit and balance</p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500 m-0">{t.totalAmount}</p>
                      <div className="text-xl font-black text-slate-950 font-mono mt-1">{money(invoiceTotal)}</div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <label className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-1 block">{t.debit}</label>
                      <input
                        type="number"
                        value={form.debit}
                        onChange={(e) => setForm((f) => ({ ...f, debit: e.target.value }))}
                        className={moneyInput}
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <label className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-1 block">{t.credit}</label>
                      <input
                        type="number"
                        value={form.credit}
                        onChange={(e) => setForm((f) => ({ ...f, credit: e.target.value }))}
                        className={moneyInput}
                      />
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wide text-indigo-700 m-0">{t.balance}</p>
                      <div className="text-2xl font-black text-indigo-700 font-mono mt-1">{money(balance)}</div>
                      <p className="text-[10px] font-mono text-indigo-500 mt-1 m-0">{money(form.debit)} − {money(form.credit)}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className={`sticky bottom-0 z-20 bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <div className={`hidden sm:flex items-center gap-2 text-[12px] font-bold text-slate-500 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  Ready to save invoice
                </div>
                <div className={`flex items-center gap-2 flex-1 sm:flex-none ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-10 w-full sm:w-40 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black transition"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={mastersLoading}
                    className="h-10 w-full sm:w-44 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-black transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-file-earmark-check-fill"></i>
                    {editingId ? t.updateInvoice : t.saveInvoice}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice list table - same Sales Invoice style */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto pi-scroll">
            <table className="w-full min-w-[980px] text-[12px]">
              <thead className="bg-slate-950 text-slate-200 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3 text-center font-black w-12">{t.col_no}</th>
                  <th className={`px-3 py-3 font-black ${isUrdu ? "text-right" : "text-left"}`}>{t.col_invoiceNo}</th>
                  <th className={`px-3 py-3 font-black ${isUrdu ? "text-right" : "text-left"}`}>{t.col_supplier}</th>
                  <th className="px-3 py-3 text-center font-black">{t.col_date}</th>
                  <th className="px-3 py-3 text-center font-black">{t.col_items}</th>
                  <th className={`px-3 py-3 font-black ${isUrdu ? "text-left" : "text-right"}`}>{t.col_invoiceTotal}</th>
                  <th className={`px-3 py-3 font-black ${isUrdu ? "text-left" : "text-right"}`}>{t.col_debit}</th>
                  <th className={`px-3 py-3 font-black ${isUrdu ? "text-left" : "text-right"}`}>{t.col_credit}</th>
                  <th className={`px-3 py-3 font-black ${isUrdu ? "text-left" : "text-right"}`}>{t.col_balance}</th>
                  <th className="px-3 py-3 text-center font-black">{t.col_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingInvoices ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-14 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2 text-sm font-semibold">{t.loading}</p>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-14 text-center text-slate-400 text-sm font-semibold">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const bal = toNumber(inv.debit) - toNumber(inv.credit);
                    const supName = supplierMap[String(inv.supplier_id)] || inv.supplier_name || "-";
                    const supDisplay = isUrdu ? urduCache[`supplier:${inv.supplier_id}`] || supName : supName;
                    return (
                      <tr key={inv.id} className="pi-table-row transition">
                        <td className="px-3 py-3 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                        <td className="px-3 py-3 font-black font-mono text-slate-950">{inv.invoice_no}</td>
                        <td className="px-3 py-3 font-bold text-slate-800">{supDisplay}</td>
                        <td className="px-3 py-3 text-center text-slate-700 font-mono font-semibold">{inv.invoice_date || "-"}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-9 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-[12px] font-black border border-indigo-100">
                            {inv.items_count || inv.items?.length || 0}
                          </span>
                        </td>
                        <td className={`px-3 py-3 font-mono font-bold text-slate-900 ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.invoice_total)}</td>
                        <td className={`px-3 py-3 font-mono font-bold text-slate-700 ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.debit)}</td>
                        <td className={`px-3 py-3 font-mono font-bold text-slate-700 ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.credit)}</td>
                        <td className={`px-3 py-3 font-mono font-black text-indigo-700 ${isUrdu ? "text-left" : "text-right"}`}>{money(bal)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(inv.id)}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 flex items-center justify-center transition"
                              title="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrint(inv.id)}
                              className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 flex items-center justify-center transition"
                              title="Print"
                            >
                              <i className="bi bi-printer-fill"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(inv.id)}
                              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 flex items-center justify-center transition"
                              title="Delete"
                            >
                              <i className="bi bi-trash3"></i>
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

export default PurchaseInvoicePage;
