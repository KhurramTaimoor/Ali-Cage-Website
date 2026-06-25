import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const RETURNS_API = `${API_ROOT}/api/sales-returns`;
const INVOICES_API = `${API_ROOT}/api/sales-invoices`;
const PRODUCTS_API = `${API_ROOT}/api/products`;
const CATEGORIES_API = `${API_ROOT}/api/categories`;
const UNITS_API = `${API_ROOT}/api/units`;

const LANG = {
  en: {
    title: "Sales Return",
    subtitle: "Create sales returns from sales invoices with products, quantities and totals",
    newReturn: "New Return",
    editReturn: "Edit Return",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    refresh: "Refresh",
    todayFilter: "Today",
    selectDate: "Select Date",
    showingDate: "Showing Date",
    toggleLang: "اردو",
    searchPlaceholder: "Search return no, invoice no, name, product or reason...",
    all: "All",
    totalReturns: "Total Returns",
    totalItems: "Total Items",
    totalQty: "Total Qty",
    totalValue: "Total Return Value",
    returnNo: "Return No",
    invoiceNo: "Invoice No",
    invoiceRef: "Invoice Ref",
    dateFull: "Date",
    returnDate: "Return Date",
    invoiceDate: "Invoice Date",
    name: "Name",
    customer: "Customer",
    customerType: "Customer Type",
    reference: "Reference",
    shipTo: "Ship To",
    salesInvoices: "Sales Invoices",
    searchInvoice: "Search invoice no, name or date...",
    allInvoices: "All Invoices",
    showDetails: "Show Details",
    hideDetails: "Hide Details",
    invoiceRecord: "Invoice Record",
    clickShowDetails: "Click Show Details to load invoice record and products.",
    products: "Products",
    product: "Product",
    desc: "Desc",
    category: "Category",
    unit: "Unit",
    soldQty: "Sold Qty",
    alreadyReturned: "Already Returned",
    availableQty: "Available Qty",
    returnQty: "Return Qty",
    rate: "Rate",
    amount: "Amount",
    returnAmount: "Return Amount",
    markReturn: "Mark Return",
    reason: "Reason",
    invoiceTotal: "Invoice Total",
    previousBalance: "Previous Balance",
    deliveryCharges: "Delivery Charges",
    discount: "Discount",
    grandTotal: "Grand Total",
    totalReturnQty: "Total Return Qty",
    totalReturnAmount: "Total Return Amount",
    save: "Save Return",
    update: "Update Return",
    saving: "Saving...",
    cancel: "Cancel",
    back: "Back",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    print: "Print",
    actions: "Actions",
    loading: "Loading...",
    noRecords: "No returns found.",
    noInvoices: "No invoices found.",
    requiredReturnNo: "Return No is required.",
    requiredInvoice: "Please select an invoice and click Show Details.",
    requiredItem: "Enter return quantity in at least one product row.",
    qtyExceeded: "Return qty cannot be greater than available qty.",
    saved: "Sales return saved.",
    updated: "Sales return updated.",
    deleted: "Sales return deleted.",
    saveError: "Save failed. Check backend.",
    loadError: "Data load failed.",
    printError: "Print failed.",
    deleteConfirm: "Delete this return?",
    slipTitle: "Sales Return Slip",
    printedOn: "Printed On",
  },
  ur: {
    title: "سیلز ریٹرن",
    subtitle: "سیلز انوائس سے پروڈکٹس، مقدار اور ٹوٹل کے ساتھ ریٹرن بنائیں",
    newReturn: "نیا ریٹرن",
    editReturn: "ریٹرن ترمیم",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    refresh: "ری فریش",
    todayFilter: "آج",
    selectDate: "تاریخ منتخب کریں",
    showingDate: "دکھائی جانے والی تاریخ",
    toggleLang: "English",
    searchPlaceholder: "ریٹرن نمبر، انوائس نمبر، نام، پروڈکٹ یا وجہ تلاش کریں...",
    all: "سب",
    totalReturns: "کل ریٹرنز",
    totalItems: "کل آئٹمز",
    totalQty: "کل مقدار",
    totalValue: "کل ریٹرن رقم",
    returnNo: "ریٹرن نمبر",
    invoiceNo: "انوائس نمبر",
    invoiceRef: "انوائس حوالہ",
    dateFull: "تاریخ",
    returnDate: "ریٹرن تاریخ",
    invoiceDate: "انوائس تاریخ",
    name: "نام",
    customer: "کسٹمر",
    customerType: "کسٹمر ٹائپ",
    reference: "ریفرنس",
    shipTo: "شپ ٹو",
    salesInvoices: "سیلز انوائسز",
    searchInvoice: "انوائس نمبر، نام یا تاریخ تلاش کریں...",
    allInvoices: "تمام انوائسز",
    showDetails: "تفصیل دیکھیں",
    hideDetails: "تفصیل بند کریں",
    invoiceRecord: "انوائس ریکارڈ",
    clickShowDetails: "انوائس ریکارڈ اور پروڈکٹس لوڈ کرنے کے لیے Show Details کلک کریں۔",
    products: "پروڈکٹس",
    product: "پروڈکٹ",
    desc: "تفصیل",
    category: "کیٹیگری",
    unit: "یونٹ",
    soldQty: "فروخت مقدار",
    alreadyReturned: "پہلے واپس",
    availableQty: "دستیاب",
    returnQty: "واپسی مقدار",
    rate: "ریٹ",
    amount: "رقم",
    returnAmount: "واپسی رقم",
    markReturn: "ریٹرن مارک",
    reason: "وجہ",
    invoiceTotal: "انوائس ٹوٹل",
    previousBalance: "سابقہ بیلنس",
    deliveryCharges: "ڈیلیوری چارجز",
    discount: "ڈسکاؤنٹ",
    grandTotal: "کل رقم",
    totalReturnQty: "کل ریٹرن مقدار",
    totalReturnAmount: "کل ریٹرن رقم",
    save: "ریٹرن محفوظ کریں",
    update: "ریٹرن اپڈیٹ",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    back: "واپس",
    close: "بند کریں",
    edit: "ترمیم",
    delete: "حذف",
    print: "پرنٹ",
    actions: "اقدامات",
    loading: "لوڈ ہو رہا ہے...",
    noRecords: "کوئی ریٹرن نہیں ملا۔",
    noInvoices: "کوئی انوائس نہیں ملی۔",
    requiredReturnNo: "ریٹرن نمبر ضروری ہے۔",
    requiredInvoice: "انوائس منتخب کریں اور Show Details کلک کریں۔",
    requiredItem: "کم از کم ایک پروڈکٹ میں ریٹرن مقدار درج کریں۔",
    qtyExceeded: "ریٹرن مقدار دستیاب مقدار سے زیادہ نہیں ہو سکتی۔",
    saved: "سیلز ریٹرن محفوظ ہو گیا۔",
    updated: "سیلز ریٹرن اپڈیٹ ہو گیا۔",
    deleted: "سیلز ریٹرن حذف ہو گیا۔",
    saveError: "محفوظ نہیں ہوا، بیک اینڈ چیک کریں۔",
    loadError: "ڈیٹا لوڈ نہیں ہوا۔",
    printError: "پرنٹ نہیں ہو سکا۔",
    deleteConfirm: "کیا یہ ریٹرن حذف کرنا ہے؟",
    slipTitle: "سیلز ریٹرن سلپ",
    printedOn: "پرنٹ تاریخ",
  },
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  return_no: "",
  return_date: today(),
  reason: "",
  invoice_id: "",
});

const getList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.returns)) return d.returns;
  if (Array.isArray(d?.invoices)) return d.invoices;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(d?.products)) return d.products;
  return [];
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const pickText = (o, keys, fallback = "") => {
  for (const key of keys) {
    if (o?.[key] !== undefined && o?.[key] !== null && String(o[key]).trim()) {
      return String(o[key]).trim();
    }
  }
  return fallback;
};

const getRecordId = (o) =>
  o?.id ?? o?.value ?? o?.customer_id ?? o?.employee_id ?? o?.supplier_id ?? o?.general_ledger_id ?? o?.ledger_id ?? o?.account_id ?? "";

const getProductName = (o) => pickText(o, ["product_name", "product_name_en", "item_name", "name", "name_en", "title"], o?.product_id ? `#${o.product_id}` : "");
const getCategoryName = (o) => pickText(o, ["category_name", "category_name_en", "name", "name_en", "title"], o?.category_id ? `#${o.category_id}` : "");
const getUnitName = (o) => pickText(o, ["unit_name", "unit_name_en", "symbol", "name", "name_en", "title"], o?.unit_id ? `#${o.unit_id}` : "");

const getInvoiceNo = (inv) => inv?.invoice_no || inv?.invoiceNo || inv?.order_no || inv?.id || "";
const getInvoiceDate = (inv) => String(inv?.invoice_date || inv?.date || inv?.created_at || "").slice(0, 10);
const getPartyName = (inv) =>
  pickText(inv, ["party_name", "customer_name", "customer_name_en", "employee_name", "supplier_name", "general_ledger_name", "name"], "Customer");
const getPartyType = (inv) =>
  inv?.party_type || inv?.customer_type || (inv?.employee_id ? "employee" : inv?.supplier_id ? "supplier" : inv?.general_ledger_id ? "general_ledger" : "customer");
const getPartyId = (inv) => inv?.party_id || inv?.customer_id || inv?.employee_id || inv?.supplier_id || inv?.general_ledger_id || "";
const getItemId = (item, index = 0) => item?.invoice_item_id || item?.item_id || item?.id || `${item?.product_id || "p"}-${item?.sr || index + 1}`;
const getSoldQty = (item) => toNum(item?.qty ?? item?.quantity ?? item?.order_qty ?? item?.pieces_qty ?? item?.carton_qty);
const getItemRate = (item) => toNum(item?.rate ?? item?.sale_rate ?? item?.price);
const getItemAmount = (item) => toNum(item?.amount, getSoldQty(item) * getItemRate(item));

// ✅ Date format: 25/06/2026 (day name removed)
function formatFullDate(dateValue) {
  if (!dateValue) return "-";
  const raw = String(dateValue).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function makeMap(list, getter) {
  const map = {};
  list.forEach((row) => {
    const id = String(getRecordId(row));
    if (id) map[id] = getter(row);
  });
  return map;
}

function genReturnNo(list) {
  let max = 0;
  list.forEach((r) => {
    const text = String(r.return_no || "");
    const m = text.match(/(?:sales-return|return|ret)[- ]?(\d+)/i);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `sales-return${String(max + 1).padStart(2, "0")}`;
}


function parseDisplayDate(value) {
  const v = String(value || "").trim();
  const slash = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (slash) {
    const dd = slash[1].padStart(2, "0");
    const mm = slash[2].padStart(2, "0");
    const yyyy = slash[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return "";
}

function DateTextInput({ value, onChange, className = "", style = {}, ...props }) {
  const [draft, setDraft] = useState(formatFullDate(value));

  useEffect(() => {
    setDraft(formatFullDate(value));
  }, [value]);

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/yyyy"
      className={className}
      style={style}
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        const parsed = parseDisplayDate(next);
        if (parsed) onChange(parsed);
      }}
      onBlur={() => setDraft(formatFullDate(value))}
    />
  );
}

function useLookup(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      setData(getList(res.data));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

function printReturnSlip(ret, t, lang) {
  const isUrdu = lang === "ur";
  const html = `<!doctype html>
<html dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<title>${t.slipTitle} - ${ret.return_no || ""}</title>
<style>
body{font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"};margin:0;background:#f8fafc;color:#111827}.page{padding:22px}.sheet{background:#fff;border:1px solid #d1d5db;border-radius:18px;overflow:hidden}.head{background:#111827;color:#fff;padding:18px 22px;display:flex;justify-content:space-between}.head h1{margin:0;font-size:24px}.body{padding:16px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.box{border:1px solid #d1d5db;border-radius:10px;padding:9px}.box small{display:block;color:#64748b;margin-bottom:5px;font-size:11px}.box b{font-size:14px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;color:#111827}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px}.num{text-align:right;font-family:monospace}.strong{font-weight:900}.reason{margin-top:12px;border:1px solid #fed7aa;background:#fff7ed;border-radius:12px;padding:12px}@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style>
</head>
<body><div class="page"><div class="sheet">
  <div class="head"><div><h1>Ali Cages</h1><div>${t.slipTitle}</div></div><div>${t.returnNo}: <b>${ret.return_no || "-"}</b><br/>${t.printedOn}: ${new Date().toLocaleString("en-PK")}</div></div>
  <div class="body">
    <div class="grid">
      <div class="box"><small>${t.invoiceNo}</small><b>${ret.invoice_ref || ret.invoice_no || "-"}</b></div>
      <div class="box"><small>${t.name}</small><b>${ret.party_name || ret.customer_name || "-"}</b></div>
      <div class="box"><small>${t.product}</small><b>${ret.product_name || "-"}</b></div>
      <div class="box"><small>${t.returnDate}</small><b>${formatFullDate(ret.return_date, lang)}</b></div>
      <div class="box"><small>${t.returnAmount}</small><b>${money(ret.return_amount)}</b></div>
    </div>
    <table><thead><tr><th>${t.soldQty}</th><th>${t.returnQty}</th><th>${t.rate}</th><th>${t.returnAmount}</th></tr></thead><tbody><tr><td class="num">${money(ret.sold_qty)}</td><td class="num strong">${money(ret.return_qty)}</td><td class="num">${money(ret.rate)}</td><td class="num strong">${money(ret.return_amount)}</td></tr></tbody></table>
    ${ret.reason ? `<div class="reason"><b>${t.reason}</b><br/>${ret.reason}</div>` : ""}
  </div>
</div></div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;

  const w = window.open("", "_blank", "width=1200,height=800");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function SalesReturnPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const { data: products } = useLookup(PRODUCTS_API);
  const { data: categories } = useLookup(CATEGORIES_API);
  const { data: units } = useLookup(UNITS_API);

  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoiceDetail, setLoadingInvoiceDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [showAllReturns, setShowAllReturns] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [showAllInvoices, setShowAllInvoices] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [returnRows, setReturnRows] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const productMap = useMemo(() => makeMap(products, getProductName), [products]);
  const categoryMap = useMemo(() => makeMap(categories, getCategoryName), [categories]);
  const unitMap = useMemo(() => makeMap(units, getUnitName), [units]);

  const toast = useCallback((type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2800);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [retRes, invRes] = await Promise.all([
        axios.get(RETURNS_API).catch(() => ({ data: [] })),
        axios.get(INVOICES_API).catch(() => ({ data: [] })),
      ]);
      setReturns(getList(retRes.data));
      setInvoices(getList(invRes.data));
    } catch {
      toast("error", t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getAlreadyReturnedQty = useCallback(
    (item, invoiceId) => {
      const itemId = String(getItemId(item));
      const productId = String(item.product_id || "");
      return returns
        .filter((ret) => {
          if (editingId && String(ret.id) === String(editingId)) return false;
          const sameInvoice = String(ret.invoice_id || "") === String(invoiceId || "");
          const sameItem = String(ret.invoice_item_id || "") === itemId;
          const sameProductFallback = !ret.invoice_item_id && productId && String(ret.product_id || "") === productId;
          return sameInvoice && (sameItem || sameProductFallback);
        })
        .reduce((sum, ret) => sum + toNum(ret.return_qty), 0);
    },
    [returns, editingId]
  );

  const normalizeInvoiceItems = useCallback(
    (items = [], inv = selectedInvoice) => {
      return items.map((item, index) => {
        const itemId = getItemId(item, index);
        const soldQty = getSoldQty(item);
        const alreadyReturned = toNum(item.returned_qty || item.already_returned_qty || getAlreadyReturnedQty(item, inv?.id || form.invoice_id));
        const availableQty = Math.max(0, soldQty - alreadyReturned);
        const productName = item.product_name || item.product?.product_name || productMap[String(item.product_id || "")] || getProductName(item) || `Product ${index + 1}`;
        const categoryName = item.category_name || categoryMap[String(item.category_id || "")] || getCategoryName(item) || "-";
        const unitName = item.unit_name || unitMap[String(item.unit_id || "")] || getUnitName(item) || "-";
        return {
          ...item,
          invoice_item_id: itemId,
          product_name: productName,
          category_name: categoryName,
          unit_name: unitName,
          sold_qty: soldQty,
          already_returned_qty: alreadyReturned,
          available_qty: availableQty,
          rate: getItemRate(item),
          amount: getItemAmount(item),
        };
      });
    },
    [categoryMap, form.invoice_id, getAlreadyReturnedQty, productMap, selectedInvoice, unitMap]
  );

  const loadInvoiceDetail = useCallback(
    async (invoiceId) => {
      if (!invoiceId) {
        setSelectedInvoice(null);
        setInvoiceItems([]);
        setReturnRows({});
        return;
      }

      setLoadingInvoiceDetail(true);
      try {
        const res = await axios.get(`${INVOICES_API}/${invoiceId}`);
        let inv = res.data?.data || res.data?.invoice || res.data;
        let items = getList(inv?.items || inv?.order_items || inv?.invoice_items || inv?.sales_invoice_items || res.data?.items || res.data?.data?.items);

        if (!items.length) {
          const itemRes = await axios.get(`${INVOICES_API}/${invoiceId}/items`).catch(() => ({ data: [] }));
          items = getList(itemRes.data);
        }

        if (!inv?.id) inv = invoices.find((x) => String(x.id) === String(invoiceId)) || { id: invoiceId };

        setSelectedInvoice(inv);
        setInvoiceItems(normalizeInvoiceItems(items, inv));
        setReturnRows({});
        setForm((prev) => ({ ...prev, invoice_id: String(invoiceId) }));
      } catch {
        toast("error", t.loadError);
        setSelectedInvoice(null);
        setInvoiceItems([]);
      } finally {
        setLoadingInvoiceDetail(false);
      }
    },
    [invoices, normalizeInvoiceItems, t.loadError, toast]
  );

  const filteredReturns = useMemo(() => {
    let list = returns;
    if (!showAllReturns && selectedDate) {
      list = list.filter((ret) => String(ret.return_date || "").slice(0, 10) === selectedDate);
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((ret) =>
      [ret.return_no, ret.invoice_ref, ret.invoice_no, ret.party_name, ret.customer_name, ret.product_name, ret.reason]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [returns, search, selectedDate, showAllReturns]);

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (!showAllInvoices && invoiceDate) {
      list = list.filter((inv) => getInvoiceDate(inv) === invoiceDate);
    }

    const q = invoiceSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((inv) =>
        [getInvoiceNo(inv), getPartyName(inv), getInvoiceDate(inv), inv.invoice_total, inv.grand_total]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return list.slice(0, 150);
  }, [invoices, invoiceSearch, invoiceDate, showAllInvoices]);

  const summary = useMemo(() => {
    return filteredReturns.reduce(
      (acc, ret) => {
        acc.totalReturns += 1;
        acc.totalItems += 1;
        acc.totalQty += toNum(ret.return_qty);
        acc.totalValue += toNum(ret.return_amount);
        return acc;
      },
      { totalReturns: 0, totalItems: 0, totalQty: 0, totalValue: 0 }
    );
  }, [filteredReturns]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), return_no: genReturnNo(returns) });
    setInvoiceSearch("");
    setShowAllInvoices(true);
    setSelectedInvoice(null);
    setInvoiceItems([]);
    setReturnRows({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setSelectedInvoice(null);
    setInvoiceItems([]);
    setReturnRows({});
  };

  const handleShowDetails = (invoiceId) => {
    const isActive = String(form.invoice_id || "") === String(invoiceId || "") && selectedInvoice;
    if (isActive) {
      setSelectedInvoice(null);
      setInvoiceItems([]);
      setReturnRows({});
      setForm((prev) => ({ ...prev, invoice_id: "" }));
      return;
    }
    loadInvoiceDetail(invoiceId);
  };

  const openEdit = async (ret) => {
    setEditingId(ret.id);
    setForm({
      return_no: ret.return_no || "",
      return_date: String(ret.return_date || today()).slice(0, 10),
      reason: ret.reason || "",
      invoice_id: String(ret.invoice_id || ""),
    });
    setShowForm(true);
    await loadInvoiceDetail(ret.invoice_id);
    const key = String(ret.invoice_item_id || ret.item_id || ret.product_id || "");
    if (key) {
      setReturnRows({
        [key]: { checked: true, return_qty: String(ret.return_qty || "") },
      });
    }
  };

  const updateReturnRow = (itemKey, field, value) => {
    setReturnRows((prev) => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || {}),
        checked: field === "return_qty" ? toNum(value) > 0 : value,
        return_qty: prev[itemKey]?.return_qty || "",
        [field]: value,
      },
    }));
  };

  const selectedRows = useMemo(() => {
    return invoiceItems
      .map((item) => {
        const key = String(item.invoice_item_id);
        const row = returnRows[key] || {};
        const returnQty = toNum(row.return_qty);
        const checked = !!row.checked || returnQty > 0;
        return {
          key,
          item,
          checked,
          returnQty,
          returnAmount: returnQty * toNum(item.rate),
        };
      })
      .filter((row) => row.checked && row.returnQty > 0);
  }, [invoiceItems, returnRows]);

  const formTotals = useMemo(
    () => ({
      qty: selectedRows.reduce((sum, row) => sum + toNum(row.returnQty), 0),
      amount: selectedRows.reduce((sum, row) => sum + toNum(row.returnAmount), 0),
    }),
    [selectedRows]
  );

  const buildPayloadForRow = (row, index, totalRows) => {
    const item = row.item;
    const inv = selectedInvoice || {};
    const returnNo = totalRows > 1 ? `${form.return_no}-${index + 1}` : form.return_no;

    return {
      return_no: returnNo,
      invoice_id: Number(form.invoice_id),
      invoice_ref: getInvoiceNo(inv),
      invoice_no: getInvoiceNo(inv),
      invoice_item_id: Number(item.invoice_item_id) || null,
      product_id: Number(item.product_id) || null,
      product_name: item.product_name || "",
      category_id: Number(item.category_id) || null,
      category_name: item.category_name || "",
      unit_id: Number(item.unit_id) || null,
      unit_name: item.unit_name || "",
      return_date: form.return_date || today(),
      sale_order_date: getInvoiceDate(inv),
      invoice_date: getInvoiceDate(inv),
      sold_qty: toNum(item.sold_qty),
      already_returned_qty: toNum(item.already_returned_qty),
      available_qty: toNum(item.available_qty),
      return_qty: toNum(row.returnQty),
      rate: toNum(item.rate),
      return_amount: toNum(row.returnAmount),
      debit: 0,
      credit: toNum(row.returnAmount),
      reason: form.reason.trim(),
      party_type: getPartyType(inv),
      party_id: Number(getPartyId(inv)) || null,
      party_name: getPartyName(inv),
      customer_name: getPartyName(inv),
    };
  };

  const handleSave = async () => {
    if (!String(form.return_no || "").trim()) return toast("error", t.requiredReturnNo);
    if (!form.invoice_id || !selectedInvoice) return toast("error", t.requiredInvoice);
    if (!selectedRows.length) return toast("error", t.requiredItem);

    for (const row of selectedRows) {
      if (toNum(row.returnQty) > toNum(row.item.available_qty)) {
        return toast("error", `${t.qtyExceeded} (${row.item.product_name})`);
      }
    }

    setSaving(true);
    try {
      if (editingId) {
        const payload = buildPayloadForRow(selectedRows[0], 0, 1);
        await axios.put(`${RETURNS_API}/${editingId}`, payload);
        toast("success", t.updated);
      } else {
        for (let i = 0; i < selectedRows.length; i += 1) {
          const payload = buildPayloadForRow(selectedRows[i], i, selectedRows.length);
          await axios.post(RETURNS_API, payload);
        }
        toast("success", t.saved);
      }

      await fetchAll();
      closeForm();
    } catch (err) {
      toast("error", err?.response?.data?.message || err.message || t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${RETURNS_API}/${id}`);
      toast("success", t.deleted);
      fetchAll();
    } catch {
      toast("error", t.loadError);
    }
  };

  const handlePrint = (ret) => {
    try {
      printReturnSlip(ret, t, lang);
    } catch {
      toast("error", t.printError);
    }
  };

  return (
    <div dir={dir} className="sales-return-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{pageCss(isUrdu)}</style>

      {msg.text && <div className="toast" style={{ background: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</div>}

      {!showForm && (
        <div className="page-wrap">
          <div className="top-card">
            <div>
              <h1 className="title">{t.title}</h1>
              <p className="subtitle">{t.subtitle}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
              <button className="btn btn-soft" onClick={() => setLang(isUrdu ? "en" : "ur")}>{t.toggleLang}</button>
              <button className={`btn ${showSummary ? "btn-active" : "btn-soft"}`} onClick={() => setShowSummary((v) => !v)}>
                {showSummary ? t.hideSummary : t.viewSummary}
              </button>
              <button className="btn btn-soft" onClick={fetchAll}>{loading ? t.loading : t.refresh}</button>
              <button className="btn btn-primary" onClick={openAdd}>+ {t.newReturn}</button>
            </div>
          </div>

          {showSummary && (
            <div className="summary-grid">
              {[
                [t.totalReturns, summary.totalReturns],
                [t.totalItems, summary.totalItems],
                [t.totalQty, money(summary.totalQty)],
                [t.totalValue, money(summary.totalValue)],
              ].map(([label, value], idx) => (
                <div className="summary-card" key={label} style={{ animationDelay: `${idx * 30}ms` }}>
                  <small>{label}</small>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          )}

          <div className="toolbar">
            <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
            <button className={`filter ${showAllReturns ? "active" : ""}`} onClick={() => setShowAllReturns(true)}>{t.all}</button>
            <button className={`filter ${!showAllReturns && selectedDate === today() ? "active" : ""}`} onClick={() => { setShowAllReturns(false); setSelectedDate(today()); }}>{t.todayFilter}</button>
            <label className="date-filter-label">
              <span>{t.selectDate}</span>
              <DateTextInput value={selectedDate} onChange={(v) => { setSelectedDate(v || today()); setShowAllReturns(false); }} />
            </label>
            {!showAllReturns && <span className="showing-date-pill">{t.showingDate}: {formatFullDate(selectedDate, lang)}</span>}
          </div>

          <div className="card table-wrap">
            <table className="list">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th style={{ width: 145, textAlign: isUrdu ? "right" : "left" }}>{t.returnNo}</th>
                  <th style={{ width: 145, textAlign: isUrdu ? "right" : "left" }}>{t.invoiceNo}</th>
                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>{t.name}</th>
                  <th style={{ width: 165 }}>{t.dateFull}</th>
                  <th style={{ width: 115, textAlign: "right" }}>{t.returnQty}</th>
                  <th style={{ width: 125, textAlign: "right" }}>{t.returnAmount}</th>
                  <th style={{ width: 205 }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.loading}</td></tr>
                ) : filteredReturns.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.noRecords}</td></tr>
                ) : filteredReturns.map((ret, idx) => (
                  <tr key={ret.id || idx}>
                    <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace" }}>{idx + 1}</td>
                    <td><b style={{ fontFamily: "monospace" }}>{ret.return_no}</b><div style={{ fontSize: 11, color: "#94a3b8" }}>{ret.product_name || "-"}</div></td>
                    <td><b style={{ fontFamily: "monospace" }}>{ret.invoice_ref || ret.invoice_no || ret.invoice_id || "-"}</b></td>
                    <td><b>{ret.party_name || ret.customer_name || "-"}</b><div style={{ fontSize: 11, color: "#64748b" }}>{ret.party_type || "customer"}</div></td>
                    <td style={{ textAlign: "center", fontSize: 12, fontWeight: 800 }}>{formatFullDate(ret.return_date, lang)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>{money(ret.return_qty)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900, color: "#1d4ed8" }}>{money(ret.return_amount)}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn btn-green" style={{ padding: "7px 10px" }} onClick={() => openEdit(ret)}>{t.edit}</button>
                        <button className="btn btn-yellow" style={{ padding: "7px 10px" }} onClick={() => handlePrint(ret)}>{t.print}</button>
                        <button className="btn btn-red" style={{ padding: "7px 10px" }} onClick={() => handleDelete(ret.id)}>{t.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-page-wrap">
          <div className="inputModalBox fullPageInputBox">
            <div className="inputModalTitle">
              <span>{editingId ? t.editReturn : t.newReturn}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="closeBtn" onClick={() => setLang(isUrdu ? "en" : "ur")}>{t.toggleLang}</button>
                <button className="closeBtn backBtn" onClick={closeForm}>{t.back}</button>
              </div>
            </div>

            <div className="inputModalBody">
              <div className="form-box">
                <div className="formTopLine returnTopLine">
                  <div>
                    <label className="basicLabel">{t.returnNo} *</label>
                    <input className="basicInput" style={{ fontFamily: "monospace", fontWeight: 900 }} value={form.return_no} onChange={(e) => setForm((f) => ({ ...f, return_no: e.target.value }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.returnDate}</label>
                    <DateTextInput className="basicInput" value={form.return_date} onChange={(v) => setForm((f) => ({ ...f, return_date: v }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.invoiceRef}</label>
                    <input className="basicInput" readOnly value={selectedInvoice ? getInvoiceNo(selectedInvoice) : ""} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.name}</label>
                    <input className="basicInput" readOnly value={selectedInvoice ? getPartyName(selectedInvoice) : ""} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.reason}</label>
                    <input className="basicInput" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="sectionHead"><span>{t.salesInvoices}</span></div>
              <div className="paymentPanel">
                <div className="toolbar" style={{ marginBottom: 12 }}>
                  <input className="search" value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder={t.searchInvoice} />
                  <button className={`filter ${showAllInvoices ? "active" : ""}`} onClick={() => setShowAllInvoices(true)}>{t.allInvoices}</button>
                  <button className={`filter ${!showAllInvoices && invoiceDate === today() ? "active" : ""}`} onClick={() => { setShowAllInvoices(false); setInvoiceDate(today()); }}>{t.todayFilter}</button>
                  <label className="date-filter-label">
                    <span>{t.selectDate}</span>
                    <DateTextInput value={invoiceDate} onChange={(v) => { setInvoiceDate(v || today()); setShowAllInvoices(false); }} />
                  </label>
                  {!showAllInvoices && <span className="showing-date-pill">{t.showingDate}: {formatFullDate(invoiceDate, lang)}</span>}
                </div>

                <div className="invoice-table-wrap">
                  <table className="invoiceTable">
                    <thead>
                      <tr>
                        <th style={{ width: 45 }}>#</th>
                        <th style={{ width: 145, textAlign: isUrdu ? "right" : "left" }}>{t.invoiceNo}</th>
                        <th style={{ textAlign: isUrdu ? "right" : "left" }}>{t.name}</th>
                        <th style={{ width: 170 }}>{t.dateFull}</th>
                        <th style={{ width: 115, textAlign: "right" }}>{t.invoiceTotal}</th>
                        <th style={{ width: 120, textAlign: "right" }}>{t.grandTotal}</th>
                        <th style={{ width: 145 }}>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.noInvoices}</td></tr>
                      ) : filteredInvoices.map((inv, idx) => {
                        const active = selectedInvoice && String(selectedInvoice.id) === String(inv.id);
                        return (
                          <tr key={inv.id || idx} className={active ? "activeInvoiceRow" : ""}>
                            <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace" }}>{idx + 1}</td>
                            <td><b style={{ fontFamily: "monospace" }}>{getInvoiceNo(inv)}</b><div style={{ fontSize: 11, color: "#94a3b8" }}>{inv.reference_no || "-"}</div></td>
                            <td><b>{getPartyName(inv)}</b><div style={{ fontSize: 11, color: "#64748b" }}>{getPartyType(inv)}</div></td>
                            <td style={{ textAlign: "center", fontSize: 12, fontWeight: 800 }}>{formatFullDate(getInvoiceDate(inv), lang)}</td>
                            <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>{money(inv.invoice_total || inv.total_amount)}</td>
                            <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900, color: "#1d4ed8" }}>{money(inv.grand_total || inv.invoice_total || inv.total_amount)}</td>
                            <td style={{ textAlign: "center" }}>
                              <button className={`btn ${active ? "btn-yellow" : "btn-green"}`} style={{ padding: "7px 10px" }} disabled={loadingInvoiceDetail} onClick={() => handleShowDetails(inv.id)}>
                                {active ? t.hideDetails : t.showDetails}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sectionHead"><span>{t.invoiceRecord}</span></div>
              <div className="paymentPanel">
                {!selectedInvoice ? (
                  <div className="emptyBox">{loadingInvoiceDetail ? t.loading : t.clickShowDetails}</div>
                ) : (
                  <div className="infoGrid">
                    <InfoBox label={t.invoiceNo} value={getInvoiceNo(selectedInvoice)} />
                    <InfoBox label={t.name} value={getPartyName(selectedInvoice)} />
                    <InfoBox label={t.customerType} value={getPartyType(selectedInvoice)} />
                    <InfoBox label={t.invoiceDate} value={formatFullDate(getInvoiceDate(selectedInvoice), lang)} />
                    <InfoBox label={t.shipTo} value={selectedInvoice.shipment_to || "-"} />
                    <InfoBox label={t.invoiceTotal} value={money(selectedInvoice.invoice_total || selectedInvoice.total_amount)} />
                    <InfoBox label={t.previousBalance} value={money(selectedInvoice.previous_balance)} />
                    <InfoBox label={t.deliveryCharges} value={money(selectedInvoice.delivery_charges)} />
                    <InfoBox label={t.discount} value={money(selectedInvoice.discount)} />
                    <InfoBox label={t.grandTotal} value={money(selectedInvoice.grand_total)} grand />
                  </div>
                )}
              </div>

              {selectedInvoice && (
                <>
                  <div className="sectionHead"><span>{t.products}</span></div>
                  <div className="paymentPanel">
                    <table className="basicProductTable returnProductTable">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{t.product}</th>
                          <th>{t.desc}</th>
                          <th>{t.category}</th>
                          <th>{t.unit}</th>
                          <th>{t.soldQty}</th>
                          <th>{t.alreadyReturned}</th>
                          <th>{t.availableQty}</th>
                          <th>{t.returnQty}</th>
                          <th>{t.rate}</th>
                          <th>{t.returnAmount}</th>
                          <th>{t.markReturn}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.length === 0 ? (
                          <tr><td colSpan={12} style={{ textAlign: "center", padding: 28, color: "#94a3b8" }}>{t.noRecords}</td></tr>
                        ) : invoiceItems.map((item, idx) => {
                          const key = String(item.invoice_item_id);
                          const row = returnRows[key] || {};
                          const returnQty = toNum(row.return_qty);
                          const returnAmount = returnQty * toNum(item.rate);
                          const checked = !!row.checked || returnQty > 0;
                          return (
                            <tr key={key} className={checked ? "selectedLine" : ""}>
                              <td style={{ textAlign: "center", fontWeight: 900 }}>{idx + 1}</td>
                              <td><b>{item.product_name}</b></td>
                              <td>{item.product_description || item.description || "-"}</td>
                              <td>{item.category_name || "-"}</td>
                              <td>{item.unit_name || "-"}</td>
                              <td><input readOnly className="productInput" style={{ textAlign: "right", background: "#f8fafc" }} value={money(item.sold_qty)} /></td>
                              <td><input readOnly className="productInput" style={{ textAlign: "right", background: "#f8fafc" }} value={money(item.already_returned_qty)} /></td>
                              <td><input readOnly className="productInput" style={{ textAlign: "right", background: "#f8fafc", fontWeight: 900 }} value={money(item.available_qty)} /></td>
                              <td><input type="number" min="0" max={item.available_qty} className="productInput" style={{ textAlign: "right" }} value={row.return_qty || ""} onChange={(e) => updateReturnRow(key, "return_qty", e.target.value)} /></td>
                              <td><input readOnly className="productInput" style={{ textAlign: "right", background: "#f8fafc" }} value={money(item.rate)} /></td>
                              <td><input readOnly className="productInput" style={{ textAlign: "right", background: "#f8fafc", fontWeight: 900, color: "#1d4ed8" }} value={money(returnAmount)} /></td>
                              <td style={{ textAlign: "center" }}><input type="checkbox" checked={checked} onChange={(e) => updateReturnRow(key, "checked", e.target.checked)} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="sectionHead"><span>{t.returnAmount}</span></div>
                  <div className="paymentPanel">
                    <div className="finalTotalBar">
                      <div className="totalBox"><label>{t.totalReturnQty}</label><b>{money(formTotals.qty)}</b></div>
                      <div className="totalBox grandBox"><label>{t.totalReturnAmount}</label><b>{money(formTotals.amount)}</b></div>
                      <div className="totalBox"><label>{t.returnNo}</label><b>{form.return_no || "-"}</b></div>
                    </div>

                    <div className="modalFooterBasic">
                      <button className="basicBtn" onClick={closeForm}>{t.cancel}</button>
                      <button className="basicBtn basicBtnGreen" onClick={handleSave} disabled={saving}>{saving ? t.saving : editingId ? t.update : t.save}</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, grand = false }) {
  return (
    <div className={`infoBox ${grand ? "grandInfoBox" : ""}`}>
      <small>{label}</small>
      <b>{value || "-"}</b>
    </div>
  );
}

function pageCss(isUrdu) {
  return `
    *{box-sizing:border-box}
    .sales-return-page{min-height:100vh;background:linear-gradient(135deg,#f8fafc,#eef2ff);padding:18px;color:#0f172a;font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"};overflow-x:hidden}
    @keyframes fadeSlide{from{opacity:0;transform:translateY(-12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes pop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .page-wrap{max-width:1220px;width:100%;margin:0 auto}.form-page-wrap{max-width:1220px;width:100%;margin:0 auto;animation:fadeSlide .22s ease-out both}
    .top-card{background:rgba(255,255,255,.94);border:1px solid #dbe3ee;border-radius:22px;padding:20px 22px;box-shadow:0 18px 48px rgba(15,23,42,.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.title{margin:0;font-size:30px;font-weight:950;letter-spacing:-.8px}.subtitle{margin:5px 0 0;color:#64748b;font-size:13px}
    .btn{border:none;border-radius:12px;padding:10px 15px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.15s}.btn:hover{transform:translateY(-1px);filter:brightness(.98)}.btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.btn-primary{background:#4f46e5;color:white;box-shadow:0 12px 25px rgba(79,70,229,.25)}.btn-soft{background:white;color:#475569;border:1px solid #cbd5e1}.btn-active{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe}.btn-green{background:#dcfce7;color:#166534}.btn-red{background:#fee2e2;color:#991b1b}.btn-yellow{background:#fef9c3;color:#854d0e}
    .summary-grid{animation:fadeSlide .24s ease-out both;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.summary-card{background:white;border:1px solid #dbe3ee;border-radius:18px;padding:14px;box-shadow:0 8px 22px rgba(15,23,42,.05);animation:pop .22s ease-out both}.summary-card small{display:block;color:#64748b;font-size:10.5px;font-weight:950;text-transform:uppercase;letter-spacing:.5px}.summary-card b{display:block;margin-top:7px;font-size:18px;font-weight:950;font-family:monospace}
    .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.search{width:min(430px,100%);height:40px;border:1px solid #cbd5e1;border-radius:14px;padding:0 13px;font-size:13px;outline:none;background:white}.filter{height:36px;border:1px solid #cbd5e1;border-radius:12px;background:white;padding:0 10px;font-weight:800;color:#475569;cursor:pointer}.filter.active{background:#4f46e5;color:white;border-color:#4f46e5}.date-filter-label{display:flex;align-items:center;gap:8px;background:white;border:1px solid #cbd5e1;border-radius:12px;padding:0 10px;height:36px;font-weight:850;color:#475569;font-size:12px}.date-filter-label input{border:none;outline:none;font-weight:850;color:#0f172a;background:transparent}.showing-date-pill{height:36px;display:inline-flex;align-items:center;padding:0 12px;border-radius:12px;background:#eef2ff;color:#3730a3;font-weight:900;border:1px solid #c7d2fe;font-size:12px}
    .card{background:white;border:1px solid #dbe3ee;border-radius:18px;box-shadow:0 8px 24px rgba(15,23,42,.05);overflow:hidden}.table-wrap{overflow-x:auto}table.list{width:100%;border-collapse:collapse;table-layout:fixed}table.list th{background:#111827;color:rgba(255,255,255,.78);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:12px 9px}table.list td{padding:12px 9px;border-bottom:1px solid #eef2f7;font-size:13px}table.list tr:hover td{background:#f8fafc}
    .toast{position:fixed;${isUrdu ? "left" : "right"}:18px;bottom:18px;z-index:120;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 20px 50px rgba(15,23,42,.25)}
    .inputModalBox{width:100%;max-width:100%;min-height:calc(100vh - 36px);background:#f8fafc;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 18px 48px rgba(15,23,42,.10);overflow:hidden}.inputModalTitle{height:54px;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:19px;font-weight:950}.closeBtn{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:white;min-width:38px;height:32px;border-radius:10px;cursor:pointer;padding:0 10px;font-weight:900}.backBtn{min-width:78px}.inputModalBody{padding:14px;overflow-x:hidden}.form-box{background:transparent;border:none;border-radius:0;padding:0;box-shadow:none;margin-bottom:0}.formTopLine{display:grid;grid-template-columns:150px 150px 150px 220px 1fr;gap:10px;align-items:end;margin-bottom:10px}.basicLabel{font-size:11px;color:#334155;margin-bottom:5px;display:block;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.basicInput,.basicSelect,.productInput{width:100%;height:34px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 9px;font-size:13px;border-radius:10px;outline:none;font-weight:650}.basicInput[readonly]{background:#f1f5f9}.basicInput:focus,.basicSelect:focus,.productInput:focus,.search:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
    .sectionHead{height:38px;background:linear-gradient(135deg,#eef2ff,#f8fafc);border:1px solid #cbd5e1;border-radius:14px 14px 0 0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;margin-top:12px;font-weight:950;color:#0f172a}.paymentPanel{border:1px solid #cbd5e1;border-top:none;padding:12px;background:white;border-radius:0 0 14px 14px;overflow:auto}.invoice-table-wrap{overflow:auto}.invoiceTable{width:100%;min-width:960px;border-collapse:collapse;table-layout:fixed}.invoiceTable th{background:#111827;color:rgba(255,255,255,.78);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:12px 9px}.invoiceTable td{padding:12px 9px;border-bottom:1px solid #eef2f7;font-size:13px}.invoiceTable tr:hover td{background:#f8fafc}.activeInvoiceRow td{background:#eef2ff!important}
    .infoGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.infoBox{border:1px solid #dbe3ee;background:#f8fafc;border-radius:14px;padding:10px}.infoBox small{display:block;color:#64748b;font-size:10.5px;font-weight:950;margin-bottom:5px;text-transform:uppercase}.infoBox b{font-size:13px}.grandInfoBox{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}.emptyBox{border:1px dashed #cbd5e1;background:#f8fafc;border-radius:14px;padding:24px;text-align:center;color:#64748b;font-weight:900}
    .basicProductTable{width:100%;border-collapse:collapse;background:white;min-width:1180px;table-layout:fixed}.basicProductTable th,.basicProductTable td{border:1px solid #dbe3ee;padding:5px;font-size:12px}.basicProductTable th{background:#e2e8f0;text-align:center;color:#334155;font-weight:900}.returnProductTable th:nth-child(1),.returnProductTable td:nth-child(1){width:35px}.returnProductTable th:nth-child(2),.returnProductTable td:nth-child(2){width:170px}.returnProductTable th:nth-child(3),.returnProductTable td:nth-child(3){width:150px}.returnProductTable th:nth-child(4),.returnProductTable td:nth-child(4){width:125px}.returnProductTable th:nth-child(5),.returnProductTable td:nth-child(5){width:90px}.returnProductTable th:nth-child(6),.returnProductTable td:nth-child(6){width:90px}.returnProductTable th:nth-child(7),.returnProductTable td:nth-child(7){width:105px}.returnProductTable th:nth-child(8),.returnProductTable td:nth-child(8){width:95px}.returnProductTable th:nth-child(9),.returnProductTable td:nth-child(9){width:95px}.returnProductTable th:nth-child(10),.returnProductTable td:nth-child(10){width:90px}.returnProductTable th:nth-child(11),.returnProductTable td:nth-child(11){width:110px}.returnProductTable th:nth-child(12),.returnProductTable td:nth-child(12){width:90px}.selectedLine td{background:#eef2ff!important}
    .basicBtn{height:34px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 14px;font-size:13px;cursor:pointer;border-radius:10px;font-weight:900}.basicBtn:hover{background:#f8fafc}.basicBtn:disabled{opacity:.6;cursor:not-allowed}.basicBtnGreen{background:#dcfce7;border-color:#86efac;color:#166534}.basicBtnRed{background:#fee2e2;border-color:#fecaca;color:#991b1b}.modalFooterBasic{padding:12px 0 0;display:flex;justify-content:flex-end;gap:8px}.finalTotalBar{margin-top:0;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.totalBox{border:1px solid #dbe3ee;background:#f8fafc;border-radius:14px;padding:10px 12px}.totalBox label{display:block;font-size:11px;color:#64748b;margin-bottom:6px;font-weight:900}.totalBox b{display:block;text-align:${isUrdu ? "left" : "right"};font-family:monospace;font-size:18px}.grandBox{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}
    @media(max-width:1120px){.summary-grid{grid-template-columns:repeat(2,1fr)}.formTopLine{grid-template-columns:repeat(2,minmax(0,1fr))}.infoGrid{grid-template-columns:repeat(2,1fr)}table.list{min-width:960px}.finalTotalBar{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:700px){.sales-return-page{padding:10px}.summary-grid,.formTopLine,.infoGrid,.finalTotalBar{grid-template-columns:1fr}.title{font-size:24px}.inputModalBody{padding:10px}.modalFooterBasic{flex-direction:column}.basicBtn,.btn{width:100%}}
  `;
}
