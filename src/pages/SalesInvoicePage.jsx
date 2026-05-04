
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
  },
};

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${API_ROOT}/api/sales-invoices`;
const CUSTOMERS_API = `${API_ROOT}/api/customers`;
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

// ─── Auto-generate invoice number ───────────────────────────────────────────
const generateInvoiceNo = (existingInvoices) => {
  // Find highest existing sales-invoiceXX number
  let maxNum = 0;
  existingInvoices.forEach((inv) => {
    const match = String(inv.invoice_no || "").match(/^sales-invoice(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  const nextNum = maxNum + 1;
  return `sales-invoice${String(nextNum).padStart(2, "0")}`;
};

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

const getCustomerName = (obj) =>
  obj?.customer_name ||
  obj?.customer_name_en ||
  obj?.customer_name_ur ||
  obj?.name ||
  obj?.name_en ||
  obj?.name_ur ||
  obj?.title ||
  "";

const getCategoryName = (obj) =>
  obj?.category_name ||
  obj?.category_name_en ||
  obj?.category_name_ur ||
  obj?.name ||
  obj?.name_en ||
  obj?.name_ur ||
  obj?.title ||
  "";

const getProductName = (obj) =>
  obj?.product_name ||
  obj?.product_name_en ||
  obj?.product_name_ur ||
  obj?.name ||
  obj?.name_en ||
  obj?.name_ur ||
  obj?.item_name ||
  obj?.title ||
  "";

const getUnitName = (obj) =>
  obj?.unit_name ||
  obj?.unit_name_en ||
  obj?.unit_name_ur ||
  obj?.name ||
  obj?.name_en ||
  obj?.name_ur ||
  obj?.symbol ||
  obj?.title ||
  "";

const getProductCategoryId = (p) =>
  p?.category_id ??
  p?.categoryId ??
  p?.cat_id ??
  p?.catId ??
  p?.product_category_id ??
  p?.productCategoryId ??
  p?.category?.id ??
  p?.category?.category_id ??
  p?.category?.value ??
  p?.category ??
  "";

const getProductUnitId = (p) =>
  p?.unit_id ?? p?.unitId ?? p?.unit?.id ?? p?.unit ?? "";

const getProductPieceRate = (p) =>
  p?.piece_rate ?? p?.pieceRate ?? p?.sale_rate ?? p?.saleRate ?? p?.rate ?? p?.price ?? p?.sale_price ?? 0;

const getProductSaleUnit = (p) =>
  String(p?.sale_unit || p?.saleUnit || "single").toLowerCase();

const getProductPiecesPerCarton = (p) =>
  Number(p?.pieces_per_carton ?? p?.piecesPerCarton ?? 0);

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

// NOTE: invoice_no is now auto-generated on openAdd; previous_balance & discount moved to bottom section
const createEmptyForm = () => ({
  invoice_no: "",
  reference_no: "",
  customer_id: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  shipment_to: "",
  previous_balance: "0",
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

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
function generateInvoicePrint(invoice, lang, urduCache) {
  const t = LANG[lang || "en"];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const items = Array.isArray(invoice?.items) ? invoice.items : [];

  const invoiceTotal = toNumber(invoice?.invoice_total);
  const previousBalance = toNumber(invoice?.previous_balance);
  const discount = toNumber(invoice?.discount);
  const grandTotal = toNumber(invoice?.grand_total);

  const customerName =
    isUrdu
      ? urduCache[`customer:${invoice.customer_id}`] || invoice.customer_name || "-"
      : invoice.customer_name || "-";

  const translated = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const rowsHtml = items
    .map((row, idx) => {
      const saleTypeText =
        row.sale_type === "carton"
          ? t.carton
          : row.sale_type === "pieces"
          ? t.pieces
          : t.single;

      const qtyText =
        row.sale_type === "carton"
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
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${dir}">
      <head>
        <meta charset="UTF-8" />
        <title>${invoice.invoice_no || "sales-invoice"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f8fafc;
            color: #0f172a;
            font-family: ${isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Inter', Arial, sans-serif"};
          }
          .page {
            width: 100%;
            min-height: 100vh;
            background: linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%);
            padding: 20px;
          }
          .sheet {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border: 1px solid #dbeafe;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            border-radius: 24px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #0f4c97 0%, #155eaf 65%, #3b82f6 100%);
            color: white;
            padding: 26px 28px 22px;
          }
          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }
          .brand h1 { margin: 0; font-size: 30px; font-weight: 800; }
          .brand p  { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.82); }
          .meta {
            text-align: ${isUrdu ? "left" : "right"};
            font-size: 12px;
            color: rgba(255,255,255,0.88);
            line-height: 1.8;
          }
          .content { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
          .hint {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            border-radius: 14px;
            padding: 12px 14px;
            font-size: 13px;
          }
          .info-cards {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 14px;
          }
          .card {
            border-radius: 16px;
            padding: 14px 16px;
            border: 1px solid #dbeafe;
            background: #f8fafc;
          }
          .card small {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 6px;
          }
          .card .value {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            word-break: break-word;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead th {
            background: #0f4c97;
            color: white;
            font-size: 12px;
            padding: 12px 10px;
            border: 1px solid #1d4ed8;
            text-align: ${isUrdu ? "right" : "left"};
          }
          tbody td {
            border: 1px solid #dbeafe;
            padding: 10px 10px;
            font-size: 12px;
          }
          tbody tr:nth-child(even) td { background: #f8fbff; }
          .center { text-align: center !important; }
          .num {
            text-align: ${isUrdu ? "left" : "right"} !important;
            white-space: nowrap;
            font-weight: 700;
            font-family: 'Inter', Arial, sans-serif;
          }
          .strong { font-weight: 800; }
          .violet { color: #7c3aed; }
          .totals {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
          .total-box {
            border-radius: 16px;
            padding: 16px 18px;
            border: 1px solid #dbeafe;
            background: #f8fafc;
          }
          .total-box.grand {
            background: #eff6ff;
            border-color: #bfdbfe;
          }
          .total-box .label {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 8px;
          }
          .total-box .value {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            font-family: 'Inter', Arial, sans-serif;
          }
          .total-box.grand .value { color: #1d4ed8; }
          .footer {
            background: #0f4c97;
            color: rgba(255,255,255,0.9);
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            body { background: white; }
            .page { padding: 0; background: white; }
            .sheet { box-shadow: none; border: none; border-radius: 0; max-width: none; }
            .hint { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="sheet">
            <div class="header">
              <div class="header-row">
                <div class="brand">
                  <h1>${t.companyName}</h1>
                  <p>${t.slipTitle}</p>
                </div>
                <div class="meta">
                  <div>${t.slipPrintedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
                  <div>${t.slipDate}: ${invoice.invoice_date || "-"}</div>
                </div>
              </div>
            </div>
            <div class="content">
              <div class="hint">${t.savePdfHint}</div>
              <div class="info-cards">
                <div class="card">
                  <small>${t.invoiceNo}</small>
                  <div class="value">${invoice.invoice_no || "-"}</div>
                </div>
                <div class="card">
                  <small>${t.referenceNo}</small>
                  <div class="value">${invoice.reference_no || "-"}</div>
                </div>
                <div class="card">
                  <small>${t.slipCustomer}</small>
                  <div class="value">${customerName || "-"}</div>
                </div>
                <div class="card">
                  <small>${t.slipDate}</small>
                  <div class="value">${invoice.invoice_date || "-"}</div>
                </div>
                <div class="card">
                  <small>${t.slipShipmentTo}</small>
                  <div class="value">${invoice.shipment_to || "-"}</div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th class="center">#</th>
                    <th>${t.product}</th>
                    <th>${t.category}</th>
                    <th class="center">${t.saleType}</th>
                    <th class="center">${t.unit}</th>
                    <th class="num">${t.qty}</th>
                    <th class="num">${t.rate}</th>
                    <th class="num">${t.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
              <div class="totals">
                <div class="total-box">
                  <span class="label">${t.slipInvoiceTotal}</span>
                  <div class="value">${money(invoiceTotal)}</div>
                </div>
                <div class="total-box">
                  <span class="label">${t.slipPrevBalance}</span>
                  <div class="value">${money(previousBalance)}</div>
                </div>
                <div class="total-box">
                  <span class="label">${t.slipDiscount}</span>
                  <div class="value">${money(discount)}</div>
                </div>
                <div class="total-box grand">
                  <span class="label">${t.slipGrandTotal}</span>
                  <div class="value">${money(grandTotal)}</div>
                </div>
              </div>
            </div>
            <div class="footer">
              <span>${t.companyName} — ${t.slipThank}</span>
              <span>Page 1 / 1</span>
            </div>
          </div>
        </div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); }, 400); };
        </script>
      </body>
    </html>
  `;

  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
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
  const inputCls = `w-full min-w-0 border border-sky-100 rounded-lg py-1.5 text-xs text-black bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 truncate ${
    isUrdu ? "pr-2 pl-2 text-right" : "px-2"
  }`;
  const readonlyClass =
    "w-full min-w-0 rounded-lg border border-sky-100 bg-sky-50 px-2 py-1.5 text-xs font-bold font-mono text-slate-950 text-right truncate";
  const monoBlack = "font-mono text-black";

  const { data: customers, loading: customersLoading, error: customersError, refetch: refetchCustomers } =
    useLookup(CUSTOMERS_API);
  const { data: categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } =
    useLookup(CATEGORIES_API);
  const { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts } =
    useLookup(PRODUCTS_API);
  const { data: units, loading: unitsLoading, error: unitsError, refetch: refetchUnits } =
    useLookup(UNITS_API);

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

  const mastersLoading = customersLoading || categoriesLoading || productsLoading || unitsLoading;
  const mastersError  = customersError  || categoriesError  || productsError  || unitsError;

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => { map[String(c.id)] = getCustomerName(c) || `#${c.id}`; });
    return map;
  }, [customers]);

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

  const getTranslatedMapValue = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

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

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur") return;
    setTranslating(true);
    try {
      const nextCache = { ...urduCache };
      await Promise.all(customers.map(async (c) => {
        const base = getCustomerName(c);
        if (base && !nextCache[`customer:${c.id}`])
          nextCache[`customer:${c.id}`] = await translateText(base);
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
    if (!nextCache[`customer:${invoice.customer_id}`] && invoice.customer_name)
      nextCache[`customer:${invoice.customer_id}`] = await translateText(invoice.customer_name);
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

  const grandTotal = useMemo(
    () => invoiceTotal + toNumber(form.previous_balance) - toNumber(form.discount),
    [invoiceTotal, form.previous_balance, form.discount]
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
    return list.filter((inv) =>
      [inv.invoice_no, inv.reference_no || "", inv.customer_name || customerMap[String(inv.customer_id)] || "",
       urduCache[`customer:${inv.customer_id}`] || "", inv.invoice_date, inv.shipment_to || ""]
        .join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [invoices, search, dateFilter, customerMap, urduCache]);

  const summary = useMemo(() => ({
    totalInvoices: invoices.length,
    totalItems:    invoices.reduce((sum, inv) => sum + Number(inv.items_count || inv.items?.length || 0), 0),
    totalValue:    invoices.reduce((sum, inv) => sum + toNumber(inv.grand_total), 0),
  }), [invoices]);

  // ── Open new invoice: auto-generate invoice number ──
  const openAdd = () => {
    setEditingId(null);
    const autoNo = generateInvoiceNo(invoices);
    setForm({ ...createEmptyForm(), invoice_no: autoNo });
    setItems([createEmptyItem()]);
    setShowForm(true);
  };

  const openEdit = async (invoiceId) => {
    try {
      const res = await axios.get(`${API_BASE}/${invoiceId}`);
      const inv = res.data?.data || res.data;
      setEditingId(inv.id);
      setForm({
        invoice_no:       inv.invoice_no || "",
        reference_no:     inv.reference_no || "",
        customer_id:      String(inv.customer_id || ""),
        invoice_date:     inv.invoice_date || new Date().toISOString().slice(0, 10),
        shipment_to:      inv.shipment_to || "",
        previous_balance: String(inv.previous_balance || 0),
        discount:         String(inv.discount || 0),
      });
      const invoiceItems =
        Array.isArray(inv.items) && inv.items.length
          ? inv.items.map((row) => ({
              category_id:      String(row.category_id ?? row.categoryId ?? row.category?.id ?? row.category ?? ""),
              product_id:       String(row.product_id  ?? row.productId  ?? row.product?.id  ?? ""),
              unit_id:          String(row.unit_id     ?? row.unitId     ?? row.unit?.id     ?? row.unit ?? ""),
              sale_type:        String(row.sale_type || "single"),
              carton_qty:       String(row.carton_qty || ""),
              pieces_qty:       String(row.pieces_qty || ""),
              qty:              String(row.qty || row.quantity || ""),
              pieces_per_carton:String(row.pieces_per_carton || 0),
              rate:             String(row.rate   || 0),
              amount:           String(row.amount || 0),
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
        sr:               row.sr || index + 1,
        category_id:      String(row.category_id ?? row.categoryId ?? row.category?.id ?? row.category ?? ""),
        product_id:       String(row.product_id  ?? row.productId  ?? row.product?.id  ?? ""),
        unit_id:          String(row.unit_id     ?? row.unitId     ?? row.unit?.id     ?? row.unit ?? ""),
        category_name:    row.category_name || categoryMap[String(row.category_id ?? row.categoryId ?? row.category?.id ?? row.category ?? "")] || "",
        product_name:     row.product_name  || productMap[String(row.product_id  ?? row.productId  ?? row.product?.id  ?? "")] || "",
        unit_name:        row.unit_name     || unitMap[String(row.unit_id        ?? row.unitId     ?? row.unit?.id     ?? row.unit ?? "")] || "",
        sale_type:        row.sale_type || "single",
        carton_qty:       row.carton_qty || "",
        pieces_qty:       row.pieces_qty || "",
        pieces_per_carton:row.pieces_per_carton || 0,
        qty:              row.qty || row.quantity || "",
        rate:             row.rate   || 0,
        amount:           row.amount || 0,
      }));
      const preparedInvoice = {
        ...inv,
        customer_name: inv.customer_name || customerMap[String(inv.customer_id)] || "",
        reference_no:  inv.reference_no || "",
        items:         normalizedItems,
        invoice_total: inv.invoice_total ?? normalizedItems.reduce((s, r) => s + toNumber(r.amount), 0),
        previous_balance: inv.previous_balance || 0,
        discount:      inv.discount || 0,
        grand_total:   inv.grand_total ?? normalizedItems.reduce((s, r) => s + toNumber(r.amount), 0) + toNumber(inv.previous_balance) - toNumber(inv.discount),
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
            updated.category_id      = String(getProductCategoryId(sel) || updated.category_id || "");
            updated.unit_id          = String(getProductUnitId(sel) || "");
            updated.rate             = String(getProductPieceRate(sel) || 0);
            updated.pieces_per_carton= String(getProductPiecesPerCarton(sel) || 0);
            updated.sale_type        = saleUnit === "carton" ? "pieces" : "single";
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

  const handleSave = async () => {
    if (!form.invoice_no.trim()) { showToast("error", t.invoiceNoRequired); return; }
    if (!form.customer_id)       { showToast("error", t.customerRequired);  return; }
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
      sr:               idx + 1,
      category_id:      Number(row.category_id),
      product_id:       Number(row.product_id),
      unit_id:          Number(row.unit_id),
      sale_type:        row.sale_type || "single",
      carton_qty:       toNumber(row.carton_qty),
      pieces_qty:       toNumber(row.pieces_qty),
      qty:              toNumber(row.qty),
      pieces_per_carton:toNumber(row.pieces_per_carton),
      rate:             toNumber(row.rate),
      amount:           toNumber(row.amount),
    }));
    const payload = {
      invoice_no:       form.invoice_no.trim(),
      reference_no:     form.reference_no.trim(),
      customer_id:      Number(form.customer_id),
      invoice_date:     form.invoice_date,
      shipment_to:      form.shipment_to || "",
      previous_balance: toNumber(form.previous_balance),
      discount:         toNumber(form.discount),
      invoice_total:    preparedItems.reduce((s, r) => s + toNumber(r.amount), 0),
      grand_total:      preparedItems.reduce((s, r) => s + toNumber(r.amount), 0) + toNumber(form.previous_balance) - toNumber(form.discount),
      items:            preparedItems,
    };
    try {
      if (editingId) { await axios.put(`${API_BASE}/${editingId}`, payload); showToast("success", t.updateSuccess); }
      else           { await axios.post(API_BASE, payload);                  showToast("success", t.saveSuccess);   }
      setShowForm(false); setEditingId(null);
      setForm(createEmptyForm()); setItems([createEmptyItem()]);
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

      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${message.type === "error" ? "bg-rose-600" : "bg-sky-600"}`}>
          <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {message.text}
        </div>
      )}

      {/* Translating indicator */}
      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-1.5">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5 mb-6">
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

          {/* Summary cards */}
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

              <div className="p-3 sm:p-4 space-y-3">
                {mastersError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                    {t.masterError}
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button onClick={refetchCustomers} className="px-3 py-1 rounded-lg bg-white border">{t.customers}</button>
                      <button onClick={refetchCategories} className="px-3 py-1 rounded-lg bg-white border">{t.categories}</button>
                      <button onClick={refetchProducts} className="px-3 py-1 rounded-lg bg-white border">{t.products}</button>
                      <button onClick={refetchUnits} className="px-3 py-1 rounded-lg bg-white border">{t.units}</button>
                    </div>
                  </div>
                )}

                {/* ── TOP FORM FIELDS: Invoice No (auto), Ref No, Customer, Date, Shipment ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-1.5">
                  {/* Invoice No — auto-generated, still editable if needed */}
                  <div>
                    <label className={labelClass}>
                      {t.invoiceNo} *
                      <span className="ml-2 text-xs font-normal text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        Auto
                      </span>
                    </label>
                    <input
                      type="text"
                      value={form.invoice_no}
                      onChange={(e) => setForm((f) => ({ ...f, invoice_no: e.target.value }))}
                      className={`${inputCls} font-mono`}
                    />
                  </div>

                  {/* Reference No — new field */}
                  <div>
                    <label className={labelClass}>{t.referenceNo}</label>
                    <input
                      type="text"
                      value={form.reference_no}
                      onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))}
                      placeholder="e.g. PO-2025-001"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t.customer} *</label>
                    <select value={form.customer_id} onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))} className={inputCls}>
                      <option value="">{customersLoading ? t.loadingMaster : t.selectCustomer}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{getCustomerLabel(c.id, getCustomerName(c))}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t.date}</label>
                    <input type="date" value={form.invoice_date} onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelClass}>{t.shipmentTo}</label>
                    <input type="text" value={form.shipment_to} onChange={(e) => setForm((f) => ({ ...f, shipment_to: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                {/* Items header */}
                <div className={`flex items-center justify-between gap-3 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div>
                    <h3 className="text-lg font-extrabold text-black">{t.items}</h3>
                    <p className="text-sm text-slate-500">{t.itemsSubtitle}</p>
                  </div>
                  <button onClick={addItemRow} className="bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <i className="bi bi-plus-lg"></i>{t.newLine}
                  </button>
                </div>

                {/* Items table */}
                <div className="rounded-2xl border border-sky-100 overflow-hidden bg-white">
                  <div className="overflow-hidden">
                    <table className="w-full table-fixed text-[11px] text-slate-600">
                      <colgroup>
                        <col className="w-[4%]" />
                        <col className="w-[14%]" />
                        <col className="w-[16%]" />
                        <col className="w-[9%]" />
                        <col className="w-[9%]" />
                        <col className="w-[8%]" />
                        <col className="w-[8%]" />
                        <col className="w-[8%]" />
                        <col className="w-[6%]" />
                        <col className="w-[7%]" />
                        <col className="w-[7%]" />
                        <col className="w-[4%]" />
                      </colgroup>
                      <thead className="bg-sky-50">
                        <tr className="text-slate-600 text-sm font-bold border-b border-sky-100">
                          <th className="px-2 py-2 text-center w-10">{t.col_no}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.unit}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-16`}>{t.saleType}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-20`}>{t.piecesPerCarton}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-20`}>{t.cartonQty}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-20`}>{t.piecesQty}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-20`}>{t.qty}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-16`}>{t.rate}</th>
                          <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"} w-16`}>{t.amount}</th>
                          <th className="px-2 py-2 text-center w-16">{t.delete}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {items.map((row, index) => {
                          const selectedProduct  = products.find((p) => String(p.id) === String(row.product_id));
                          const productSaleUnit  = getProductSaleUnit(selectedProduct || {});
                          const isCartonProduct  = productSaleUnit === "carton";
                          const matchedProducts  = products.filter((p) => !row.category_id || String(getProductCategoryId(p)) === String(row.category_id));
                          const filteredProducts = !row.category_id ? products : matchedProducts.length ? matchedProducts : products;
                          return (
                            <tr key={index} className="hover:bg-sky-50/60">
                              <td className="px-2 py-2 text-center font-mono text-slate-500 text-sm">{index + 1}</td>
                              <td className="px-2 py-2">
                                <select value={row.category_id} onChange={(e) => handleItemChange(index, "category_id", e.target.value)} className={inputCls}>
                                  <option value="">{categoriesLoading ? t.loadingMaster : t.selectCategory}</option>
                                  {categories.map((c) => <option key={c.id} value={c.id}>{getTranslatedMapValue("category", c.id, getCategoryName(c))}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <select value={row.product_id} onChange={(e) => handleItemChange(index, "product_id", e.target.value)} className={inputCls}>
                                  <option value="">{productsLoading ? t.loadingMaster : t.selectProduct}</option>
                                  {filteredProducts.map((p) => <option key={p.id} value={p.id}>{getTranslatedMapValue("product", p.id, getProductName(p))}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <select value={row.unit_id} onChange={(e) => handleItemChange(index, "unit_id", e.target.value)} className={inputCls}>
                                  <option value="">{unitsLoading ? t.loadingMaster : t.selectUnit}</option>
                                  {units.map((u) => <option key={u.id} value={u.id}>{getTranslatedMapValue("unit", u.id, getUnitName(u))}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                {isCartonProduct ? (
                                  <select value={row.sale_type} onChange={(e) => handleItemChange(index, "sale_type", e.target.value)} className={inputCls}>
                                    <option value="pieces">{t.pieces}</option>
                                    <option value="carton">{t.carton}</option>
                                  </select>
                                ) : (
                                  <input readOnly type="text" value={t.single} className={readonlyClass} />
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <input readOnly type="text" value={row.pieces_per_carton || "0"} className={readonlyClass} />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" value={row.carton_qty} onChange={(e) => handleItemChange(index, "carton_qty", e.target.value)}
                                  disabled={!isCartonProduct || row.sale_type !== "carton"}
                                  className={`${inputCls} font-mono disabled:bg-slate-100 disabled:text-slate-400`} />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" value={row.pieces_qty} onChange={(e) => handleItemChange(index, "pieces_qty", e.target.value)}
                                  disabled={!isCartonProduct || row.sale_type !== "pieces"}
                                  className={`${inputCls} font-mono disabled:bg-slate-100 disabled:text-slate-400`} />
                              </td>
                              <td className="px-2 py-2">
                                <input type="text" readOnly value={row.qty} className={readonlyClass} />
                              </td>
                              <td className="px-2 py-2">
                                <input type="text" readOnly value={money(row.rate)} className={readonlyClass} />
                              </td>
                              <td className="px-2 py-2">
                                <input type="text" readOnly value={money(row.amount)} className={readonlyClass} />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button onClick={() => removeItemRow(index)} className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                                  <i className="bi bi-trash3 text-sm"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── TOTALS BAR — Previous Balance & Discount are now HERE (moved from top) ── */}
                <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">

                    {/* Invoice Total — read-only computed */}
                    <div className="rounded-lg bg-white border border-sky-100 p-2">
                      <p className="text-xs text-slate-500 mb-1">{t.invoiceTotal}</p>
                      <div className="text-lg font-extrabold text-slate-950 font-mono">{money(invoiceTotal)}</div>
                    </div>

                    {/* Previous Balance — editable input moved here */}
                    <div className="rounded-lg bg-white border border-sky-100 p-2">
                      <label className="block text-xs text-slate-500 mb-1">{t.previousBalance}</label>
                      <input
                        type="number"
                        value={form.previous_balance}
                        onChange={(e) => setForm((f) => ({ ...f, previous_balance: e.target.value }))}
                        className="w-full bg-transparent text-lg font-extrabold text-slate-950 font-mono border-none outline-none focus:outline-none p-0"
                      />
                    </div>

                    {/* Discount — editable input moved here */}
                    <div className="rounded-lg bg-white border border-sky-100 p-2">
                      <label className="block text-xs text-slate-500 mb-1">{t.discount}</label>
                      <input
                        type="number"
                        value={form.discount}
                        onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                        className="w-full bg-transparent text-lg font-extrabold text-slate-950 font-mono border-none outline-none focus:outline-none p-0"
                      />
                    </div>

                    {/* Grand Total — computed */}
                    <div className="rounded-lg bg-sky-100 border border-sky-200 p-2">
                      <p className="text-xs text-slate-500 mb-1">{t.grandTotal}</p>
                      <div className="text-xl font-extrabold text-slate-950 font-mono">{money(grandTotal)}</div>
                    </div>

                  </div>
                </div>

                {/* Save / Cancel */}
                <div className={`flex gap-3 pt-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <button onClick={handleSave} disabled={mastersLoading}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-xl py-2.5 font-semibold text-sm shadow-lg shadow-sky-200">
                    {editingId ? t.updateInvoice : t.saveInvoice}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 border border-sky-200 bg-white hover:bg-sky-50 text-sky-700 rounded-xl py-2.5 font-semibold text-sm">
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Invoices list table ── */}
        <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs text-slate-600">
              <thead className="bg-sky-50 border-b border-sky-100">
                <tr className="text-slate-600 text-sm font-bold">
                  <th className="px-2 py-2 text-center w-10">{t.col_no}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.col_invoiceNo}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.referenceNo}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-right" : "text-left"}`}>{t.col_customer}</th>
                  <th className="px-2 py-2 text-center">{t.col_date}</th>
                  <th className="px-2 py-2 text-center">{t.col_items}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_invoiceTotal}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_prevBalance}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_discount}</th>
                  <th className={`px-2 py-2 ${isUrdu ? "text-left" : "text-right"}`}>{t.col_grandTotal}</th>
                  <th className="px-2 py-2 text-center">{t.col_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loadingInvoices ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2 text-sm">{t.loading}</p>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400 text-sm">{t.noRecords}</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, idx) => (
                    <tr key={inv.id} className="hover:bg-sky-50/60">
                      <td className="px-2 py-2 text-center text-slate-400 font-mono text-sm">{idx + 1}</td>
                      <td className="px-2 py-2 font-bold font-mono text-slate-950 text-sm">{inv.invoice_no}</td>
                      <td className="px-2 py-2 font-mono text-slate-600 text-sm">{inv.reference_no || <span className="text-slate-300">—</span>}</td>
                      <td className="px-2 py-2 font-semibold text-black text-sm">
                        {isUrdu
                          ? urduCache[`customer:${inv.customer_id}`] || inv.customer_name || customerMap[String(inv.customer_id)] || "-"
                          : inv.customer_name || customerMap[String(inv.customer_id)] || "-"}
                      </td>
                      <td className="px-2 py-2 text-center text-black font-mono text-sm">{inv.invoice_date || "-"}</td>
                      <td className="px-2 py-2 text-center">
                        <span className="inline-block px-3 py-1.5 rounded-full bg-sky-100 text-black text-sm font-bold border border-sky-200">
                          {inv.items_count || inv.items?.length || 0}
                        </span>
                      </td>
                      <td className={`px-2 py-2 ${monoBlack} text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.invoice_total)}</td>
                      <td className={`px-2 py-2 ${monoBlack} text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.previous_balance)}</td>
                      <td className={`px-2 py-2 ${monoBlack} text-sm ${isUrdu ? "text-left" : "text-right"}`}>{money(inv.discount)}</td>
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
                  ))
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
