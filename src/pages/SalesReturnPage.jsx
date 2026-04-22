import React, { useEffect, useMemo, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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

const fetchAllReturns = () => apiFetch("/api/sales-returns");
const createReturn = (data) =>
  apiFetch("/api/sales-returns", {
    method: "POST",
    body: JSON.stringify(data),
  });
const updateReturn = (id, data) =>
  apiFetch(`/api/sales-returns/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
const deleteReturn = (id) =>
  apiFetch(`/api/sales-returns/${id}`, {
    method: "DELETE",
  });

const fetchSoldInvoices = () => apiFetch("/api/sales-invoices");
const fetchInvoiceItems = (invoiceId) =>
  apiFetch(`/api/sales-invoices/${invoiceId}/items`);

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
    title: "Sales Return",
    subtitle: "Return sold products against invoice",
    addBtn: "New Return",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by return no, invoice, product or reason...",
    returnNo: "Return No",
    invoiceRef: "Invoice Ref",
    invoiceSelect: "Select Invoice",
    selectInvoice: "-- Select Invoice --",
    product: "Product",
    selectProduct: "-- Select Product --",
    loadingProducts: "Loading products...",
    loadingInvoices: "Loading invoices...",
    returnDate: "Return Date",
    saleOrderDate: "Sale Date",
    soldQty: "Sold Qty",
    alreadyReturnedQty: "Already Returned",
    availableQty: "Available Qty",
    returnQty: "Return Qty",
    rate: "Rate",
    returnAmount: "Return Amount",
    debit: "Debit",
    credit: "Credit",
    autoCalcNote: "Auto-calculated: Qty × Rate",
    reason: "Reason",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    printSlip: "Print / Save PDF",
    noRecords: "No returns found.",
    toggleLang: "اردو",
    actions: "Actions",
    loading: "Loading returns...",
    fetchError: "Failed to load returns.",
    saveError: "Failed to save return.",
    deleteError: "Failed to delete return.",
    slipTitle: "Sales Return Slip",
    slipReturnNo: "Return No",
    slipInvoiceRef: "Invoice Ref",
    slipProduct: "Product",
    slipReturnDate: "Return Date",
    slipSaleOrderDate: "Sale Date",
    slipQty: "Return Qty",
    slipRate: "Rate",
    slipAmount: "Return Amount",
    slipDebit: "Debit",
    slipCredit: "Credit",
    slipReason: "Reason",
    slipPrintedOn: "Printed On",
    slipThank: "Return processed successfully.",
    totalReturns: "Total Returns",
    totalQty: "Total Qty",
    totalAmount: "Total Amount",
    saveSuccess: "Return saved successfully!",
    deleteSuccess: "Return deleted successfully!",
    returnNoRequired: "Return No is required.",
    invoiceRequired: "Invoice is required.",
    productRequired: "Product is required.",
    qtyInvalid: "Return qty must be greater than 0.",
    qtyExceeded: "Return qty exceeds available qty.",
    filterAll: "All",
    filter24h: "Last 24 Hours",
    filter7d: "Last 7 Days",
    filterMonth: "This Month",
    filterLabel: "Filter:",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
    translating: "Translating to Urdu…",
  },
  ur: {
    title: "سیلز ریٹرن",
    subtitle: "انوائس کے خلاف فروخت شدہ مصنوعات کی واپسی",
    addBtn: "نئی واپسی",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "واپسی نمبر، انوائس، پروڈکٹ یا وجہ سے تلاش کریں...",
    returnNo: "واپسی نمبر",
    invoiceRef: "انوائس حوالہ",
    invoiceSelect: "انوائس منتخب کریں",
    selectInvoice: "-- انوائس منتخب کریں --",
    product: "پروڈکٹ",
    selectProduct: "-- پروڈکٹ منتخب کریں --",
    loadingProducts: "پروڈکٹس لوڈ ہو رہی ہیں...",
    loadingInvoices: "انوائسز لوڈ ہو رہی ہیں...",
    returnDate: "واپسی تاریخ",
    saleOrderDate: "فروخت تاریخ",
    soldQty: "فروخت مقدار",
    alreadyReturnedQty: "پہلے واپس",
    availableQty: "بقایا واپسی",
    returnQty: "واپسی مقدار",
    rate: "ریٹ",
    returnAmount: "واپسی رقم",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    autoCalcNote: "خودکار حساب: مقدار × ریٹ",
    reason: "وجہ",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    printSlip: "پرنٹ / پی ڈی ایف",
    noRecords: "کوئی واپسی نہیں ملی۔",
    toggleLang: "English",
    actions: "اقدامات",
    loading: "ریٹرن لوڈ ہو رہے ہیں...",
    fetchError: "ریٹرن لوڈ نہیں ہو سکے۔",
    saveError: "ریٹرن محفوظ نہیں ہو سکا۔",
    deleteError: "ریٹرن حذف نہیں ہو سکا۔",
    slipTitle: "سیلز ریٹرن سلپ",
    slipReturnNo: "واپسی نمبر",
    slipInvoiceRef: "انوائس حوالہ",
    slipProduct: "پروڈکٹ",
    slipReturnDate: "واپسی تاریخ",
    slipSaleOrderDate: "فروخت تاریخ",
    slipQty: "واپسی مقدار",
    slipRate: "ریٹ",
    slipAmount: "واپسی رقم",
    slipDebit: "ڈیبٹ",
    slipCredit: "کریڈٹ",
    slipReason: "وجہ",
    slipPrintedOn: "پرنٹ کی تاریخ",
    slipThank: "واپسی کامیابی سے مکمل ہوئی۔",
    totalReturns: "کل واپسیاں",
    totalQty: "کل مقدار",
    totalAmount: "کل رقم",
    saveSuccess: "واپسی کامیابی سے محفوظ ہو گئی!",
    deleteSuccess: "واپسی کامیابی سے حذف ہو گئی!",
    returnNoRequired: "واپسی نمبر ضروری ہے۔",
    invoiceRequired: "انوائس ضروری ہے۔",
    productRequired: "پروڈکٹ ضروری ہے۔",
    qtyInvalid: "واپسی مقدار 0 سے زیادہ ہونی چاہیے۔",
    qtyExceeded: "واپسی مقدار دستیاب مقدار سے زیادہ ہے۔",
    filterAll: "سب",
    filter24h: "آخری 24 گھنٹے",
    filter7d: "آخری 7 دن",
    filterMonth: "یہ مہینہ",
    filterLabel: "فلٹر:",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
    translating: "اردو میں ترجمہ ہو رہا ہے…",
  },
};

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function generateReturnPrint(ret, lang, urduCache) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const font = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "'Inter', Arial, sans-serif";

  const returnAmount = Number(ret.return_amount || 0);

  const productName =
    isUrdu
      ? urduCache[`product:${ret.product_id}`] || ret.product_name || "—"
      : ret.product_name || "—";

  const reasonText =
    isUrdu
      ? urduCache[`reason:${ret.id || ret.return_no}`] || ret.reason || ""
      : ret.reason || "";

  const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8" />
<title>${t.slipTitle} - ${ret.return_no}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{
  font-family:${font};
  background:#f8fafc;
  color:#0f172a;
  padding:20px;
}
.page{
  width:100%;
  min-height:100vh;
  background:linear-gradient(135deg,#eff6ff 0%,#ffffff 45%,#f8fafc 100%);
  padding:20px;
}
.sheet{
  max-width:1200px;
  margin:0 auto;
  background:#fff;
  border:1px solid #dbeafe;
  box-shadow:0 12px 40px rgba(15,23,42,.08);
  border-radius:24px;
  overflow:hidden;
}
.header{
  position:relative;
  background:linear-gradient(135deg,#0f4c97 0%,#155eaf 65%,#3b82f6 100%);
  color:#fff;
  padding:26px 28px 22px;
  overflow:hidden;
}
.header:before{
  content:"";
  position:absolute;
  top:0;
  ${isUrdu ? "left" : "right"}:0;
  width:240px;
  height:100%;
  background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.04));
  clip-path:polygon(35% 0,100% 0,100% 100%,0 100%);
}
.header-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  position:relative;
  z-index:2;
}
.brand-wrap{
  display:flex;
  align-items:center;
  gap:14px;
}
.logo{
  width:58px;
  height:58px;
  min-width:58px;
  border-radius:999px;
  border:4px solid rgba(255,255,255,.85);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:800;
  background:rgba(255,255,255,.08);
  color:#fff;
  font-size:16px;
}
.brand h1{
  margin:0;
  font-size:30px;
  line-height:1.15;
  font-weight:800;
}
.brand p{
  margin:6px 0 0;
  font-size:13px;
  color:rgba(255,255,255,.82);
}
.meta{
  text-align:${isUrdu ? "left" : "right"};
  font-size:12px;
  color:rgba(255,255,255,.88);
  line-height:1.8;
  white-space:nowrap;
}
.content{padding:18px;}
.hint{
  background:#eff6ff;
  color:#1d4ed8;
  border:1px solid #bfdbfe;
  border-radius:14px;
  padding:12px 14px;
  font-size:13px;
  margin-bottom:14px;
}
.cards{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:14px;
  margin-bottom:16px;
}
.card{
  border-radius:18px;
  border:2px solid;
  padding:14px 16px;
  min-height:100px;
  position:relative;
  overflow:hidden;
}
.card:before{
  content:"";
  position:absolute;
  top:0;
  ${isUrdu ? "right" : "left"}:0;
  width:6px;
  height:100%;
  background:currentColor;
  opacity:.9;
}
.card small{
  display:block;
  font-size:12px;
  opacity:.9;
  margin-bottom:12px;
}
.pill{
  position:absolute;
  top:12px;
  ${isUrdu ? "left" : "right"}:12px;
  font-size:10px;
  font-weight:800;
  color:#fff;
  padding:5px 12px;
  border-radius:999px;
}
.card .value{
  font-size:24px;
  font-weight:800;
  line-height:1.2;
  word-break:break-word;
}
.card.blue{background:#eff6ff;color:#0f4c97;border-color:#60a5fa;}
.card.blue .pill{background:#0f4c97;}
.card.green{background:#ecfdf5;color:#059669;border-color:#34d399;}
.card.green .pill{background:#059669;}
.card.orange{background:#fff7ed;color:#c2410c;border-color:#fb923c;}
.card.orange .pill{background:#c2410c;}

.info-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:14px;
  margin-bottom:14px;
}
.info-box{
  background:#f8fafc;
  border:1px solid #dbeafe;
  border-radius:16px;
  padding:14px 16px;
}
.info-box .label{
  font-size:12px;
  color:#64748b;
  margin-bottom:6px;
}
.info-box .value{
  font-size:18px;
  font-weight:800;
  color:#0f172a;
}

.section-bar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  background:#f1f5f9;
  border-radius:10px;
  padding:8px 12px;
  margin-bottom:8px;
  color:#475569;
  font-size:12px;
  font-weight:700;
}

.watermark-wrap{position:relative;}
.watermark{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events:none;
  font-size:82px;
  font-weight:800;
  color:rgba(15,76,151,.06);
  transform:rotate(-28deg);
  user-select:none;
  z-index:0;
  letter-spacing:2px;
}

table{
  width:100%;
  border-collapse:collapse;
  position:relative;
  z-index:1;
}
thead th{
  background:#0f4c97;
  color:#fff;
  font-size:12px;
  padding:12px 10px;
  border:1px solid #1d4ed8;
  text-align:${isUrdu ? "right" : "left"};
  white-space:nowrap;
}
tbody td,tfoot td{
  border:1px solid #dbeafe;
  padding:10px 10px;
  font-size:12px;
  vertical-align:top;
}
tbody tr:nth-child(even) td{background:#f8fbff;}
.center{text-align:center !important;}
.num{
  text-align:${isUrdu ? "left" : "right"} !important;
  white-space:nowrap;
  font-weight:700;
  font-family:'Inter',Arial,sans-serif;
}
.strong{font-weight:800;}
.violet{color:#7c3aed;}
.foot-row td{
  background:#eaf3ff;
  font-weight:800;
  color:#0f172a;
}
.reason-box{
  margin-top:14px;
  background:#fff7ed;
  border:1px solid #fed7aa;
  border-radius:16px;
  padding:14px 16px;
}
.reason-box .label{
  font-size:12px;
  color:#c2410c;
  margin-bottom:6px;
  font-weight:700;
}
.reason-box .value{
  color:#9a3412;
  font-size:14px;
  line-height:1.8;
}
.footer{
  background:#0f4c97;
  color:rgba(255,255,255,.9);
  padding:10px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  font-size:11px;
}
@media print{
  @page{size:A4 landscape;margin:10mm;}
  body{background:#fff;}
  .page{padding:0;background:#fff;}
  .sheet{
    box-shadow:none;
    border:none;
    border-radius:0;
    max-width:none;
  }
  .hint{display:none;}
}
@media (max-width:900px){
  .cards,.info-grid{grid-template-columns:1fr;}
  .header-row{flex-direction:column;align-items:flex-start;}
  .meta{
    text-align:${isUrdu ? "right" : "left"};
    white-space:normal;
  }
}
</style>
</head>
<body>
<div class="page">
  <div class="sheet">
    <div class="header">
      <div class="header-row">
        <div class="brand-wrap">
          <div class="logo">RET</div>
          <div class="brand">
            <h1>${t.slipTitle}</h1>
            <p># ${ret.return_no || "-"}</p>
          </div>
        </div>
        <div class="meta">
          <div>${t.slipPrintedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
          <div>${t.slipInvoiceRef}: ${ret.invoice_ref || "-"}</div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="hint">${t.savePdfHint}</div>

      <div class="cards">
        <div class="card blue">
          <small>${t.slipReturnNo}</small>
          <div class="pill">RET</div>
          <div class="value">${ret.return_no || "-"}</div>
        </div>

        <div class="card green">
          <small>${t.slipProduct}</small>
          <div class="pill">PROD</div>
          <div class="value">${productName}</div>
        </div>

        <div class="card orange">
          <small>${t.slipAmount}</small>
          <div class="pill">PKR</div>
          <div class="value">${fmt(returnAmount)}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <div class="label">${t.slipInvoiceRef}</div>
          <div class="value">${ret.invoice_ref || "-"}</div>
        </div>
        <div class="info-box">
          <div class="label">${t.slipReturnDate}</div>
          <div class="value">${ret.return_date || "-"}</div>
        </div>
        <div class="info-box">
          <div class="label">${t.slipSaleOrderDate}</div>
          <div class="value">${ret.sale_order_date || "-"}</div>
        </div>
        <div class="info-box">
          <div class="label">${t.slipQty}</div>
          <div class="value">${fmt(ret.return_qty)}</div>
        </div>
      </div>

      <div class="section-bar">
        <span>${t.slipAmount}</span>
        <span>${productName}</span>
      </div>

      <div class="watermark-wrap">
        <div class="watermark">RETURN</div>
        <table>
          <thead>
            <tr>
              <th>${t.slipQty}</th>
              <th class="num">${t.slipRate}</th>
              <th class="num">${t.slipAmount}</th>
              <th class="num">${t.slipDebit}</th>
              <th class="num">${t.slipCredit}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${fmt(ret.return_qty)}</td>
              <td class="num">${fmt(ret.rate)}</td>
              <td class="num strong violet">${fmt(returnAmount)}</td>
              <td class="num">${fmt(0)}</td>
              <td class="num">${fmt(returnAmount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="foot-row">
              <td colspan="2">${t.slipAmount}</td>
              <td class="num">${fmt(returnAmount)}</td>
              <td class="num">${fmt(0)}</td>
              <td class="num">${fmt(returnAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${
        reasonText
          ? `
            <div class="reason-box">
              <div class="label">${t.slipReason}</div>
              <div class="value">${reasonText}</div>
            </div>
          `
          : ""
      }
    </div>

    <div class="footer">
      <span>${t.slipThank}</span>
      <span>Page 1 / 1</span>
    </div>
  </div>
</div>

<script>
window.onload=()=>{setTimeout(()=>{window.print();},400);};
</script>
</body></html>`;

  const w = window.open("", "_blank", "width=1300,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

const createEmptyForm = () => ({
  return_no: "",
  invoice_id: "",
  invoice_ref: "",
  invoice_item_id: "",
  product_id: "",
  product_name: "",
  return_date: new Date().toISOString().slice(0, 10),
  sale_order_date: "",
  sold_qty: 0,
  already_returned_qty: 0,
  available_qty: 0,
  return_qty: "",
  rate: "",
  return_amount: "0",
  reason: "",
});

const SalesReturnPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [itemLoading, setItemLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState(createEmptyForm());
  const [urduCache, setUrduCache] = useState({});

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllReturns();
      setReturns(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      showToast("error", err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  const loadInvoices = useCallback(async () => {
    try {
      setInvoiceLoading(true);
      const data = await fetchSoldInvoices();
      setInvoices(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      showToast("error", err.message || "Failed to load invoices.");
    } finally {
      setInvoiceLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReturns();
    loadInvoices();
  }, [loadReturns, loadInvoices]);

  useEffect(() => {
    const qty = parseFloat(form.return_qty) || 0;
    const rate = parseFloat(form.rate) || 0;
    setForm((f) => ({
      ...f,
      return_amount: (qty * rate).toFixed(2),
    }));
  }, [form.return_qty, form.rate]);

  const ensureUrduTranslations = useCallback(
    async (listReturns = returns, listItems = invoiceItems) => {
      const nextCache = { ...urduCache };

      for (const r of listReturns) {
        if (r.product_id && r.product_name && !nextCache[`product:${r.product_id}`]) {
          nextCache[`product:${r.product_id}`] = await translateText(r.product_name);
        }
        if (r.reason && !nextCache[`reason:${r.id || r.return_no}`]) {
          nextCache[`reason:${r.id || r.return_no}`] = await translateText(r.reason);
        }
      }

      for (const item of listItems) {
        if (item.product_id && item.product_name && !nextCache[`product:${item.product_id}`]) {
          nextCache[`product:${item.product_id}`] = await translateText(item.product_name);
        }
      }

      setUrduCache(nextCache);
      return nextCache;
    },
    [returns, invoiceItems, urduCache]
  );

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);

    if (newLang !== "ur") return;

    setTranslating(true);
    try {
      await ensureUrduTranslations();
    } finally {
      setTranslating(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setInvoiceItems([]);
    setShowForm(true);
  };

  const openEdit = async (r) => {
    setEditingId(r.id);
    setShowForm(true);

    const nextForm = {
      return_no: r.return_no || "",
      invoice_id: r.invoice_id || "",
      invoice_ref: r.invoice_ref || "",
      invoice_item_id: r.invoice_item_id || "",
      product_id: r.product_id || "",
      product_name: r.product_name || "",
      return_date: r.return_date || new Date().toISOString().slice(0, 10),
      sale_order_date: r.sale_order_date || "",
      sold_qty: Number(r.sold_qty || 0),
      already_returned_qty: Number(r.already_returned_qty || 0),
      available_qty: Number(r.available_qty || 0),
      return_qty: r.return_qty || "",
      rate: r.rate || "",
      return_amount: r.return_amount || "0",
      reason: r.reason || "",
    };

    setForm(nextForm);

    if (r.invoice_id) {
      try {
        setItemLoading(true);
        const data = await fetchInvoiceItems(r.invoice_id);
        const list = Array.isArray(data) ? data : data?.data || [];
        setInvoiceItems(list);
      } catch (err) {
        showToast("error", err.message || "Failed to load invoice items.");
      } finally {
        setItemLoading(false);
      }
    }
  };

  const handleInvoiceSelect = async (invoiceId) => {
    const inv = invoices.find((x) => String(x.id) === String(invoiceId));

    setForm((f) => ({
      ...f,
      invoice_id: invoiceId,
      invoice_ref: inv?.invoice_no || "",
      invoice_item_id: "",
      product_id: "",
      product_name: "",
      sale_order_date: inv?.invoice_date || "",
      sold_qty: 0,
      already_returned_qty: 0,
      available_qty: 0,
      return_qty: "",
      rate: "",
      return_amount: "0",
    }));

    if (!invoiceId) {
      setInvoiceItems([]);
      return;
    }

    try {
      setItemLoading(true);
      const data = await fetchInvoiceItems(invoiceId);
      const list = Array.isArray(data) ? data : data?.data || [];
      setInvoiceItems(list);

      if (lang === "ur") {
        await ensureUrduTranslations([], list);
      }
    } catch (err) {
      showToast("error", err.message || "Failed to load invoice items.");
      setInvoiceItems([]);
    } finally {
      setItemLoading(false);
    }
  };

  const handleProductSelect = (invoiceItemId) => {
    const item = invoiceItems.find((p) => String(p.invoice_item_id) === String(invoiceItemId));
    if (!item) return;

    const soldQty = Number(item.qty || 0);
    const alreadyReturned = Number(item.returned_qty || 0);
    const available = soldQty - alreadyReturned;

    setForm((f) => ({
      ...f,
      invoice_item_id: item.invoice_item_id,
      product_id: item.product_id,
      product_name: item.product_name || "",
      sale_order_date: item.invoice_date || f.sale_order_date || "",
      sold_qty: soldQty,
      already_returned_qty: alreadyReturned,
      available_qty: available > 0 ? available : 0,
      return_qty: "",
      rate: item.rate || 0,
      return_amount: "0",
    }));
  };

  const handleSave = async () => {
    if (!form.return_no.trim()) {
      showToast("error", t.returnNoRequired);
      return;
    }

    if (!form.invoice_id) {
      showToast("error", t.invoiceRequired);
      return;
    }

    if (!form.product_id || !form.invoice_item_id) {
      showToast("error", t.productRequired);
      return;
    }

    const returnQty = Number(form.return_qty || 0);
    const availableQty = Number(form.available_qty || 0);

    if (returnQty <= 0) {
      showToast("error", t.qtyInvalid);
      return;
    }

    if (returnQty > availableQty) {
      showToast("error", t.qtyExceeded);
      return;
    }

    const payload = {
      return_no: form.return_no.trim(),
      invoice_id: Number(form.invoice_id),
      invoice_ref: form.invoice_ref || "",
      invoice_item_id: Number(form.invoice_item_id),
      product_id: Number(form.product_id),
      product_name: form.product_name || "",
      return_date: form.return_date || null,
      sale_order_date: form.sale_order_date || null,
      sold_qty: Number(form.sold_qty || 0),
      already_returned_qty: Number(form.already_returned_qty || 0),
      available_qty: Number(form.available_qty || 0),
      return_qty: returnQty,
      rate: Number(form.rate || 0),
      return_amount: Number(form.return_amount || 0),
      reason: form.reason.trim(),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await updateReturn(editingId, payload);
        const updated = res?.data || res;
        setReturns((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      } else {
        const res = await createReturn(payload);
        const created = res?.data || res;
        setReturns((prev) => [created, ...prev]);
      }

      showToast("success", t.saveSuccess);
      setShowForm(false);
      setEditingId(null);
      setForm(createEmptyForm());
      setInvoiceItems([]);
      loadInvoices();
      loadReturns();
    } catch (err) {
      showToast("error", err.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteReturn(id);
      setReturns((prev) => prev.filter((r) => r.id !== id));
      showToast("success", t.deleteSuccess);
      loadInvoices();
    } catch (err) {
      showToast("error", err.message || t.deleteError);
    }
  };

  const handlePrint = async (r) => {
    let cacheToUse = urduCache;

    if (lang === "ur") {
      setTranslating(true);
      try {
        cacheToUse = await ensureUrduTranslations([r], []);
      } finally {
        setTranslating(false);
      }
    }

    generateReturnPrint(r, lang, cacheToUse);
  };

  const filtered = useMemo(() => {
    const now = new Date();

    let list = returns.filter((r) => {
      if (!r.return_date) return dateFilter === "all";
      const d = new Date(r.return_date);

      if (dateFilter === "24h") return now - d <= 24 * 60 * 60 * 1000;
      if (dateFilter === "7d") return now - d <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === "month") {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      return true;
    });

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((r) =>
      [r.return_no, r.invoice_ref, r.product_name, r.reason]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [returns, search, dateFilter]);

  const summary = useMemo(
    () => ({
      totalReturns: filtered.length,
      totalQty: filtered.reduce((s, r) => s + Number(r.return_qty || 0), 0),
      totalAmount: filtered.reduce((s, r) => s + Number(r.return_amount || 0), 0),
    }),
    [filtered]
  );

  const labelClass = "block text-sm font-semibold text-slate-500 mb-1.5";
  const inputCls = (readOnly = false) =>
    `w-full border rounded-2xl py-3.5 text-base focus:outline-none focus:ring-4 ${
      readOnly
        ? "border-sky-200 bg-sky-50 text-black font-bold cursor-not-allowed focus:ring-sky-100"
        : "border-sky-100 bg-white text-black focus:ring-sky-100"
    } ${isUrdu ? "pr-4 pl-4 text-right" : "pl-4 pr-4"}`;

  const readonlyAmountClass =
    "w-full border border-sky-200 rounded-2xl py-3.5 px-4 text-base font-bold text-black bg-sky-50 cursor-not-allowed font-mono";

  const valueClass = "text-black font-medium";

  return (
    <div
      dir={dir}
      style={{
        fontFamily: isUrdu
          ? "'Noto Nastaliq Urdu', serif"
          : "Helvetica, 'Helvetica Neue', Arial, sans-serif",
      }}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 pb-20"
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {message.text && (
        <div
          className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-base font-semibold flex items-center gap-2 ${
            message.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <i
            className={`bi ${
              message.type === "error"
                ? "bi-exclamation-triangle-fill"
                : "bi-check-circle-fill"
            }`}
          ></i>
          {message.text}
        </div>
      )}

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5 mb-6">
          <div
            className={`flex items-center justify-between flex-wrap gap-4 ${
              isUrdu ? "flex-row-reverse" : ""
            }`}
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black">
                {t.title}
              </h1>
              <p className="text-base text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleLangToggle}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-base font-semibold hover:bg-sky-50 transition shadow-sm"
              >
                <i className="bi bi-translate"></i>
                {t.toggleLang}
              </button>

              <button
                onClick={() => setShowSummary((v) => !v)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition shadow-sm ${
                  showSummary
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
              >
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-sm`}></i>
              </button>

              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white text-base font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200"
              >
                <i className="bi bi-arrow-return-left"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-sky-100">
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3 text-sky-600">
                  <i className="bi bi-arrow-return-left"></i>
                </div>
                <p className="text-sm text-slate-500 mb-1">{t.totalReturns}</p>
                <p className="text-3xl font-extrabold text-slate-950">{summary.totalReturns}</p>
              </div>

              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3 text-emerald-600">
                  <i className="bi bi-boxes"></i>
                </div>
                <p className="text-sm text-slate-500 mb-1">{t.totalQty}</p>
                <p className="text-3xl font-extrabold text-slate-950">{summary.totalQty}</p>
              </div>

              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <p className="text-sm text-slate-500 mb-1">{t.totalAmount}</p>
                <p className="text-2xl font-extrabold text-slate-950">{fmt(summary.totalAmount)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <i
              className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isUrdu ? "right-4" : "left-4"
              }`}
            ></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border border-sky-100 rounded-2xl py-3.5 bg-white text-base text-black focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${
                isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"
              }`}
            />
          </div>

          <div className={`flex items-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <span className="text-sm font-semibold text-slate-500">{t.filterLabel}</span>
            {[
              { key: "24h", label: t.filter24h, icon: "bi-clock" },
              { key: "7d", label: t.filter7d, icon: "bi-calendar-week" },
              { key: "month", label: t.filterMonth, icon: "bi-calendar-month" },
              { key: "all", label: t.filterAll, icon: "bi-list-ul" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                  dateFilter === f.key
                    ? "bg-sky-600 text-white shadow-sky-200"
                    : "bg-white border border-sky-100 text-sky-700 hover:bg-sky-50"
                }`}
              >
                <i className={`bi ${f.icon}`}></i>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto" dir={dir}>
              <div className="flex items-center gap-3 mb-6 border-b border-sky-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <i className="bi bi-arrow-return-left text-sky-700 text-xl"></i>
                </div>
                <h2 className="text-2xl font-extrabold text-black">
                  {editingId ? t.edit : t.addBtn}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.returnNo}</label>
                  <input
                    type="text"
                    value={form.return_no}
                    onChange={(e) => setForm((f) => ({ ...f, return_no: e.target.value }))}
                    className={inputCls(false)}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.invoiceSelect}</label>
                  <select
                    value={form.invoice_id}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    className={inputCls(false)}
                  >
                    <option value="">
                      {invoiceLoading ? t.loadingInvoices : t.selectInvoice}
                    </option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_no} - {inv.customer_name || "Customer"} - {inv.invoice_date || ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>{t.invoiceRef}</label>
                  <input
                    type="text"
                    readOnly
                    value={form.invoice_ref}
                    className={inputCls(true)}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.product}</label>
                  <select
                    value={form.invoice_item_id}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    disabled={!form.invoice_id || itemLoading}
                    className={inputCls(false)}
                  >
                    <option value="">
                      {itemLoading ? t.loadingProducts : t.selectProduct}
                    </option>
                    {invoiceItems.map((item) => (
                      <option key={item.invoice_item_id} value={item.invoice_item_id}>
                        {isUrdu
                          ? urduCache[`product:${item.product_id}`] || item.product_name
                          : item.product_name}{" "}
                        | Sold: {item.qty} | Returned: {item.returned_qty || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>{t.saleOrderDate}</label>
                  <input
                    type="date"
                    value={form.sale_order_date}
                    readOnly
                    className={inputCls(true)}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.returnDate}</label>
                  <input
                    type="date"
                    value={form.return_date}
                    onChange={(e) => setForm((f) => ({ ...f, return_date: e.target.value }))}
                    className={inputCls(false)}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.soldQty}</label>
                  <input type="text" readOnly value={fmt(form.sold_qty)} className={inputCls(true)} />
                </div>

                <div>
                  <label className={labelClass}>{t.alreadyReturnedQty}</label>
                  <input
                    type="text"
                    readOnly
                    value={fmt(form.already_returned_qty)}
                    className={inputCls(true)}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.availableQty}</label>
                  <input type="text" readOnly value={fmt(form.available_qty)} className={inputCls(true)} />
                </div>

                <div>
                  <label className={labelClass}>{t.returnQty}</label>
                  <input
                    type="number"
                    value={form.return_qty}
                    max={form.available_qty}
                    onChange={(e) => setForm((f) => ({ ...f, return_qty: e.target.value }))}
                    className={inputCls(false)}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.rate}</label>
                  <input
                    type="number"
                    value={form.rate}
                    onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                    className={inputCls(false)}
                  />
                </div>

                <div className="md:col-span-2 bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                  <label className="block text-sm font-bold text-sky-800 mb-1.5">
                    {t.returnAmount}
                    <span className={`${isUrdu ? "mr-2" : "ml-2"} text-sky-500 font-normal text-sm`}>
                      ⚡ {t.autoCalcNote}
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={fmt(form.return_amount)}
                    className={readonlyAmountClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>{t.reason}</label>
                  <textarea
                    rows={3}
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    className={`${inputCls(false)} resize-none`}
                  />
                </div>
              </div>

              <div className={`flex gap-3 mt-6 pt-4 border-t border-sky-100 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-sky-600 text-white py-3.5 rounded-2xl font-semibold text-base hover:bg-sky-700 transition shadow-lg shadow-sky-200 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                  {submitting ? t.saving : t.save}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 border border-sky-200 bg-white text-sky-700 py-3.5 rounded-2xl font-semibold text-base hover:bg-sky-50 transition disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-sm font-bold border-b border-sky-100 whitespace-nowrap">
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"} w-10`}>#</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.returnNo}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.invoiceRef}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className="px-4 py-3.5 text-center">{t.saleOrderDate}</th>
                  <th className="px-4 py-3.5 text-center">{t.returnDate}</th>
                  <th className="px-4 py-3.5 text-right">{t.returnQty}</th>
                  <th className="px-4 py-3.5 text-right">{t.rate}</th>
                  <th className="px-4 py-3.5 text-right">{t.returnAmount}</th>
                  <th className="px-4 py-3.5 text-right">{t.debit}</th>
                  <th className="px-4 py-3.5 text-right">{t.credit}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.reason}</th>
                  <th className="px-4 py-3.5 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2 text-base">{t.loading}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center text-slate-400 text-base">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const returnAmt = Number(r.return_amount || 0);
                    return (
                      <tr key={r.id} className="hover:bg-sky-50/60 transition">
                        <td className="px-4 py-3 text-slate-400 font-mono text-base">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-950 font-mono text-base">{r.return_no}</td>
                        <td className="px-4 py-3 text-base text-black">{r.invoice_ref || "—"}</td>
                        <td className={`px-4 py-3 text-base ${valueClass}`}>
                          {isUrdu
                            ? urduCache[`product:${r.product_id}`] || r.product_name || "—"
                            : r.product_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-base text-black">
                          {r.sale_order_date || "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-base text-black">
                          {r.return_date || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-black text-base">
                          {fmt(r.return_qty)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-black text-base">{fmt(r.rate)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-950 text-base">
                          {fmt(returnAmt)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-black text-base">
                          {fmt(0)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-black text-base">
                          {fmt(returnAmt)}
                        </td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-base text-black">
                          {isUrdu
                            ? urduCache[`reason:${r.id || r.return_no}`] || r.reason || "—"
                            : r.reason || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center justify-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                            <button
                              onClick={() => openEdit(r)}
                              className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center"
                              title={t.edit}
                            >
                              <i className="bi bi-pencil-square text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition flex items-center justify-center"
                              title={t.delete}
                            >
                              <i className="bi bi-trash3 text-sm"></i>
                            </button>
                            <button
                              onClick={() => handlePrint(r)}
                              className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-200 transition flex items-center justify-center"
                              title={t.printSlip}
                            >
                              <i className="bi bi-printer-fill text-sm"></i>
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

export default SalesReturnPage;