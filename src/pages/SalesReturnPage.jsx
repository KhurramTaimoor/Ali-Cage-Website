import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

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

const getList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.returns)) return d.returns;
  if (Array.isArray(d?.invoices)) return d.invoices;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.products)) return d.products;
  if (Array.isArray(d?.categories)) return d.categories;
  if (Array.isArray(d?.units)) return d.units;
  if (Array.isArray(d?.rows)) return d.rows;
  return [];
};

const toNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const today = () => new Date().toISOString().slice(0, 10);

const money = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const pickText = (row, keys, fallback = "") => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && String(row[key]).trim()) {
      return String(row[key]).trim();
    }
  }
  return fallback;
};

const getProductName = (row) => pickText(row, ["product_name", "product_name_en", "item_name", "name", "name_en", "title"], row?.product_id ? `#${row.product_id}` : "");
const getCategoryName = (row) => pickText(row, ["category_name", "category_name_en", "name", "name_en", "title"], row?.category_id ? `#${row.category_id}` : "");
const getUnitName = (row) => pickText(row, ["unit_name", "unit_name_en", "symbol", "name", "name_en", "title"], row?.unit_id ? `#${row.unit_id}` : "");

const getInvoiceNo = (inv) => inv?.invoice_no || inv?.invoiceNo || inv?.order_no || inv?.id || "";
const getInvoiceDate = (inv) => String(inv?.invoice_date || inv?.date || inv?.created_at || "").slice(0, 10);
const getPartyName = (inv) => pickText(inv, ["party_name", "customer_name", "customer_name_en", "employee_name", "supplier_name", "general_ledger_name", "name"], "Customer");
const getPartyType = (inv) => inv?.party_type || inv?.customer_type || (inv?.employee_id ? "employee" : inv?.supplier_id ? "supplier" : inv?.general_ledger_id ? "general_ledger" : "customer");
const getPartyId = (inv) => inv?.party_id || inv?.customer_id || inv?.employee_id || inv?.supplier_id || inv?.general_ledger_id || "";

const getItemId = (item) => item?.invoice_item_id || item?.item_id || item?.id || `${item?.product_id || "p"}-${item?.sr || Math.random()}`;
const getSoldQty = (item) => toNum(item?.qty ?? item?.quantity ?? item?.order_qty ?? item?.pieces_qty ?? item?.carton_qty);
const getItemRate = (item) => toNum(item?.rate ?? item?.sale_rate ?? item?.price);
const getItemAmount = (item) => toNum(item?.amount, getSoldQty(item) * getItemRate(item));

const LANG = {
  en: {
    title: "Sales Return",
    subtitle: "Select a sales invoice, load its full record and mark products as return",
    newReturn: "New Return",
    editReturn: "Edit Return",
    back: "Back",
    cancel: "Cancel",
    save: "Save Return",
    saving: "Saving...",
    refresh: "Refresh",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    toggleLang: "اردو",
    search: "Search return no, invoice, customer, product or reason...",
    returnNo: "Return No",
    returnDate: "Return Date",
    reason: "Reason",
    selectInvoice: "Select Sales Invoice",
    invoiceSearch: "Search invoice/customer name...",
    chooseInvoice: "Choose Invoice",
    invoiceRecord: "Sales Invoice Record",
    invoiceNo: "Invoice No",
    invoiceDate: "Invoice Date",
    customer: "Customer",
    customerType: "Customer Type",
    shipTo: "Ship To",
    invoiceTotal: "Invoice Total",
    previousBalance: "Previous Balance",
    deliveryCharges: "Delivery Charges",
    discount: "Discount",
    grandTotal: "Grand Total",
    products: "Products",
    product: "Product",
    desc: "Description",
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
    totalReturnQty: "Total Return Qty",
    totalReturnAmount: "Total Return Amount",
    totalReturns: "Total Returns",
    totalQty: "Total Qty",
    totalAmount: "Total Amount",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    print: "Print",
    noRecords: "No returns found.",
    noInvoice: "No invoice selected.",
    loading: "Loading...",
    loadError: "Data load failed.",
    saveError: "Return save failed.",
    deleteError: "Delete failed.",
    saved: "Sales return saved successfully.",
    updated: "Sales return updated successfully.",
    deleted: "Sales return deleted successfully.",
    deleteConfirm: "Delete this return?",
    requiredReturnNo: "Return No is required.",
    requiredInvoice: "Please select a sales invoice.",
    requiredItem: "Please enter return quantity in at least one product row.",
    qtyExceeded: "Return quantity cannot be greater than available quantity.",
    printTitle: "Sales Return Slip",
    printedOn: "Printed On",
  },
  ur: {
    title: "سیلز ریٹرن",
    subtitle: "سیلز انوائس منتخب کریں، مکمل ریکارڈ دیکھیں اور پروڈکٹس ریٹرن مارک کریں",
    newReturn: "نیا ریٹرن",
    editReturn: "ریٹرن ترمیم",
    back: "واپس",
    cancel: "منسوخ",
    save: "ریٹرن محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    refresh: "ری فریش",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    toggleLang: "English",
    search: "ریٹرن نمبر، انوائس، کسٹمر، پروڈکٹ یا وجہ تلاش کریں...",
    returnNo: "ریٹرن نمبر",
    returnDate: "ریٹرن تاریخ",
    reason: "وجہ",
    selectInvoice: "سیلز انوائس منتخب کریں",
    invoiceSearch: "انوائس/کسٹمر نام تلاش کریں...",
    chooseInvoice: "انوائس منتخب کریں",
    invoiceRecord: "سیلز انوائس ریکارڈ",
    invoiceNo: "انوائس نمبر",
    invoiceDate: "انوائس تاریخ",
    customer: "کسٹمر",
    customerType: "کسٹمر ٹائپ",
    shipTo: "شپ ٹو",
    invoiceTotal: "انوائس ٹوٹل",
    previousBalance: "سابقہ بیلنس",
    deliveryCharges: "ڈیلیوری چارجز",
    discount: "ڈسکاؤنٹ",
    grandTotal: "کل رقم",
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
    totalReturnQty: "کل ریٹرن مقدار",
    totalReturnAmount: "کل ریٹرن رقم",
    totalReturns: "کل ریٹرنز",
    totalQty: "کل مقدار",
    totalAmount: "کل رقم",
    actions: "اقدامات",
    edit: "ترمیم",
    delete: "حذف",
    print: "پرنٹ",
    noRecords: "کوئی ریٹرن نہیں ملا۔",
    noInvoice: "کوئی انوائس منتخب نہیں۔",
    loading: "لوڈ ہو رہا ہے...",
    loadError: "ڈیٹا لوڈ نہیں ہوا۔",
    saveError: "ریٹرن محفوظ نہیں ہوا۔",
    deleteError: "حذف نہیں ہوا۔",
    saved: "سیلز ریٹرن محفوظ ہو گیا۔",
    updated: "سیلز ریٹرن اپڈیٹ ہو گیا۔",
    deleted: "سیلز ریٹرن حذف ہو گیا۔",
    deleteConfirm: "کیا یہ ریٹرن حذف کرنا ہے؟",
    requiredReturnNo: "ریٹرن نمبر ضروری ہے۔",
    requiredInvoice: "سیلز انوائس منتخب کریں۔",
    requiredItem: "کم از کم ایک پروڈکٹ میں ریٹرن مقدار درج کریں۔",
    qtyExceeded: "ریٹرن مقدار دستیاب مقدار سے زیادہ نہیں ہو سکتی۔",
    printTitle: "سیلز ریٹرن سلپ",
    printedOn: "پرنٹ تاریخ",
  },
};

function genReturnNo(list) {
  let max = 0;
  list.forEach((r) => {
    const text = String(r.return_no || "");
    const m = text.match(/(?:sales-return|return|ret)[- ]?(\d+)/i);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `sales-return${String(max + 1).padStart(2, "0")}`;
}

function formatDate(value, lang = "en") {
  if (!value) return "-";
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function createEmptyForm() {
  return {
    return_no: "",
    invoice_id: "",
    return_date: today(),
    reason: "",
  };
}

function printReturnSlip(ret, t, lang) {
  const isUrdu = lang === "ur";
  const html = `<!doctype html>
<html dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<title>${t.printTitle} - ${ret.return_no || ""}</title>
<style>
body{font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"};margin:0;background:#f8fafc;color:#111827}.page{padding:22px}.sheet{max-width:920px;margin:auto;background:white;border:1px solid #d1d5db;border-radius:18px;overflow:hidden}.head{background:#111827;color:white;padding:18px 22px;display:flex;justify-content:space-between;gap:12px}.head h1{margin:0;font-size:24px}.body{padding:16px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.box{border:1px solid #d1d5db;border-radius:12px;padding:10px}.box small{display:block;color:#64748b;font-size:11px;font-weight:800;margin-bottom:5px}.box b{font-size:15px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px}.num{text-align:right;font-family:monospace}.strong{font-weight:900}.reason{margin-top:12px;border:1px solid #fed7aa;background:#fff7ed;border-radius:12px;padding:12px}@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style>
</head>
<body>
<div class="page"><div class="sheet">
  <div class="head"><div><h1>Ali Cages</h1><div>${t.printTitle}</div></div><div>${t.returnNo}: <b>${ret.return_no || "-"}</b><br/>${t.printedOn}: ${new Date().toLocaleString("en-PK")}</div></div>
  <div class="body">
    <div class="grid">
      <div class="box"><small>${t.invoiceNo}</small><b>${ret.invoice_ref || "-"}</b></div>
      <div class="box"><small>${t.product}</small><b>${ret.product_name || "-"}</b></div>
      <div class="box"><small>${t.returnDate}</small><b>${formatDate(ret.return_date, lang)}</b></div>
    </div>
    <table><thead><tr><th>${t.soldQty}</th><th>${t.returnQty}</th><th>${t.rate}</th><th>${t.returnAmount}</th></tr></thead><tbody><tr><td class="num">${money(ret.sold_qty)}</td><td class="num strong">${money(ret.return_qty)}</td><td class="num">${money(ret.rate)}</td><td class="num strong">${money(ret.return_amount)}</td></tr></tbody></table>
    ${ret.reason ? `<div class="reason"><b>${t.reason}</b><br/>${ret.reason}</div>` : ""}
  </div>
</div></div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=1100,height=800");
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

  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [rowReturns, setRowReturns] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });

  const toast = useCallback((type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [retRes, invRes, prodRes, catRes, unitRes] = await Promise.all([
        apiFetch("/api/sales-returns").catch(() => []),
        apiFetch("/api/sales-invoices").catch(() => []),
        apiFetch("/api/products").catch(() => []),
        apiFetch("/api/categories").catch(() => []),
        apiFetch("/api/units").catch(() => []),
      ]);

      setReturns(getList(retRes));
      setInvoices(getList(invRes));
      setProducts(getList(prodRes));
      setCategories(getList(catRes));
      setUnits(getList(unitRes));
    } catch (err) {
      toast("error", err.message || t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.id) map[String(p.id)] = getProductName(p);
    });
    return map;
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      if (c.id) map[String(c.id)] = getCategoryName(c);
    });
    return map;
  }, [categories]);

  const unitMap = useMemo(() => {
    const map = {};
    units.forEach((u) => {
      if (u.id) map[String(u.id)] = getUnitName(u);
    });
    return map;
  }, [units]);

  const filteredReturns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return returns;
    return returns.filter((r) =>
      [r.return_no, r.invoice_ref, r.invoice_no, r.party_name, r.customer_name, r.product_name, r.reason]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [returns, search]);

  const summary = useMemo(
    () => ({
      totalReturns: filteredReturns.length,
      totalQty: filteredReturns.reduce((s, r) => s + toNum(r.return_qty), 0),
      totalAmount: filteredReturns.reduce((s, r) => s + toNum(r.return_amount), 0),
    }),
    [filteredReturns]
  );

  const filteredInvoices = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase();
    const list = invoices.slice();
    if (!q) return list.slice(0, 80);
    return list
      .filter((inv) => [getInvoiceNo(inv), getPartyName(inv), getInvoiceDate(inv), inv.grand_total].join(" ").toLowerCase().includes(q))
      .slice(0, 80);
  }, [invoices, invoiceSearch]);

  const getAlreadyReturnedQty = useCallback(
    (item) => {
      const itemId = String(getItemId(item));
      const invoiceId = String(selectedInvoice?.id || form.invoice_id || "");
      const productId = String(item.product_id || "");
      return returns
        .filter((r) => {
          if (editingId && String(r.id) === String(editingId)) return false;
          const sameInvoice = String(r.invoice_id || "") === invoiceId;
          const sameItem = String(r.invoice_item_id || "") === itemId;
          const sameProductFallback = !r.invoice_item_id && productId && String(r.product_id || "") === productId;
          return sameInvoice && (sameItem || sameProductFallback);
        })
        .reduce((sum, r) => sum + toNum(r.return_qty), 0);
    },
    [returns, selectedInvoice, form.invoice_id, editingId]
  );

  const normalizeInvoiceItems = useCallback(
    (items = [], inv = selectedInvoice) => {
      return items.map((item, index) => {
        const itemId = getItemId(item);
        const soldQty = getSoldQty(item);
        const alreadyReturned = toNum(item.returned_qty || item.already_returned_qty || getAlreadyReturnedQty(item));
        const available = Math.max(0, soldQty - alreadyReturned);
        const productName =
          item.product_name ||
          item.product?.product_name ||
          productMap[String(item.product_id || "")] ||
          getProductName(item) ||
          `Product ${index + 1}`;
        const categoryName = item.category_name || categoryMap[String(item.category_id || "")] || getCategoryName(item) || "-";
        const unitName = item.unit_name || unitMap[String(item.unit_id || "")] || getUnitName(item) || "-";
        return {
          ...item,
          invoice_item_id: itemId,
          invoice_id: inv?.id || item.invoice_id || form.invoice_id,
          invoice_ref: getInvoiceNo(inv) || item.invoice_ref || item.invoice_no || "",
          product_name: productName,
          category_name: categoryName,
          unit_name: unitName,
          sold_qty: soldQty,
          already_returned_qty: alreadyReturned,
          available_qty: available,
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
        setRowReturns({});
        return;
      }

      setInvoiceLoading(true);
      try {
        let invRes = await apiFetch(`/api/sales-invoices/${invoiceId}`);
        let inv = invRes?.data || invRes?.invoice || invRes;
        let items = getList(inv?.items || inv?.order_items || inv?.invoice_items || inv?.sales_invoice_items || invRes?.items || invRes?.data?.items);

        if (!items.length) {
          const itemRes = await apiFetch(`/api/sales-invoices/${invoiceId}/items`).catch(() => []);
          items = getList(itemRes);
        }

        if (!inv?.id) {
          inv = invoices.find((x) => String(x.id) === String(invoiceId)) || { id: invoiceId };
        }

        setSelectedInvoice(inv);
        const normalized = normalizeInvoiceItems(items, inv);
        setInvoiceItems(normalized);
        setRowReturns({});
        setForm((f) => ({ ...f, invoice_id: String(invoiceId) }));
      } catch (err) {
        toast("error", err.message || t.loadError);
        setSelectedInvoice(null);
        setInvoiceItems([]);
      } finally {
        setInvoiceLoading(false);
      }
    },
    [invoices, normalizeInvoiceItems, t.loadError, toast]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...createEmptyForm(), return_no: genReturnNo(returns) });
    setSelectedInvoice(null);
    setInvoiceItems([]);
    setRowReturns({});
    setInvoiceSearch("");
    setShowForm(true);
  };

  const openEdit = async (ret) => {
    setEditingId(ret.id);
    setForm({
      return_no: ret.return_no || "",
      invoice_id: String(ret.invoice_id || ""),
      return_date: String(ret.return_date || today()).slice(0, 10),
      reason: ret.reason || "",
    });
    setShowForm(true);
    await loadInvoiceDetail(ret.invoice_id);
    const itemKey = String(ret.invoice_item_id || ret.item_id || ret.product_id || "");
    setRowReturns({
      [itemKey]: {
        selected: true,
        return_qty: String(ret.return_qty || ""),
      },
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setSelectedInvoice(null);
    setInvoiceItems([]);
    setRowReturns({});
  };

  const handleInvoiceSelect = (invoiceId) => {
    setForm((f) => ({ ...f, invoice_id: invoiceId }));
    loadInvoiceDetail(invoiceId);
  };

  const updateReturnRow = (itemId, field, value) => {
    setRowReturns((prev) => ({
      ...prev,
      [itemId]: {
        selected: field === "return_qty" ? toNum(value) > 0 : true,
        return_qty: prev[itemId]?.return_qty || "",
        ...(prev[itemId] || {}),
        [field]: value,
      },
    }));
  };

  const selectedRows = useMemo(() => {
    return invoiceItems
      .map((item) => {
        const key = String(item.invoice_item_id);
        const selected = !!rowReturns[key]?.selected || toNum(rowReturns[key]?.return_qty) > 0;
        const returnQty = toNum(rowReturns[key]?.return_qty);
        return {
          item,
          key,
          selected,
          returnQty,
          returnAmount: returnQty * toNum(item.rate),
        };
      })
      .filter((row) => row.selected && row.returnQty > 0);
  }, [invoiceItems, rowReturns]);

  const formTotals = useMemo(
    () => ({
      qty: selectedRows.reduce((s, r) => s + toNum(r.returnQty), 0),
      amount: selectedRows.reduce((s, r) => s + toNum(r.returnAmount), 0),
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
    if (!form.return_no.trim()) return toast("error", t.requiredReturnNo);
    if (!form.invoice_id) return toast("error", t.requiredInvoice);
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
        await apiFetch(`/api/sales-returns/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast("success", t.updated);
      } else {
        for (let i = 0; i < selectedRows.length; i += 1) {
          const payload = buildPayloadForRow(selectedRows[i], i, selectedRows.length);
          await apiFetch("/api/sales-returns", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        toast("success", t.saved);
      }

      await loadAll();
      closeForm();
    } catch (err) {
      toast("error", err.message || t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await apiFetch(`/api/sales-returns/${id}`, { method: "DELETE" });
      toast("success", t.deleted);
      loadAll();
    } catch (err) {
      toast("error", err.message || t.deleteError);
    }
  };

  const handlePrint = (ret) => printReturnSlip(ret, t, lang);

  if (showForm) {
    return (
      <div dir={dir} className="sales-return-page">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

        <style>{pageCss(isUrdu)}</style>

        {msg.text && <div className="toast" style={{ background: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</div>}

        <div className="page-wrap">
          <div className="input-page-card">
            <div className="input-title">
              <div>
                <h2>{editingId ? t.editReturn : t.newReturn}</h2>
                <p>{t.subtitle}</p>
              </div>
              <div className="title-actions">
                <button className="btn btn-soft" onClick={() => setLang(isUrdu ? "en" : "ur")}>{t.toggleLang}</button>
                <button className="btn btn-soft" onClick={closeForm}><i className="bi bi-arrow-left"></i>{t.back}</button>
              </div>
            </div>

            <div className="form-section no-radius-top">
              <div className="form-grid top-grid">
                <div>
                  <label>{t.returnNo} *</label>
                  <input className="input" value={form.return_no} onChange={(e) => setForm((f) => ({ ...f, return_no: e.target.value }))} />
                </div>
                <div>
                  <label>{t.returnDate}</label>
                  <input className="input" type="date" value={form.return_date} onChange={(e) => setForm((f) => ({ ...f, return_date: e.target.value }))} />
                </div>
                <div>
                  <label>{t.invoiceSearch}</label>
                  <input className="input" value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder={t.invoiceSearch} />
                </div>
                <div className="span-2">
                  <label>{t.selectInvoice} *</label>
                  <select className="input" value={form.invoice_id} onChange={(e) => handleInvoiceSelect(e.target.value)} disabled={invoiceLoading}>
                    <option value="">{invoiceLoading ? t.loading : t.chooseInvoice}</option>
                    {filteredInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {getInvoiceNo(inv)} - {getPartyName(inv)} - {getInvoiceDate(inv)} - Rs {money(inv.grand_total || inv.invoice_total)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="section-head"><span>{t.invoiceRecord}</span></div>
            <div className="form-section">
              {!selectedInvoice ? (
                <div className="empty-box">{t.noInvoice}</div>
              ) : (
                <>
                  <div className="invoice-info-grid">
                    <Info label={t.invoiceNo} value={getInvoiceNo(selectedInvoice)} />
                    <Info label={t.customer} value={getPartyName(selectedInvoice)} />
                    <Info label={t.customerType} value={getPartyType(selectedInvoice)} />
                    <Info label={t.invoiceDate} value={formatDate(getInvoiceDate(selectedInvoice), lang)} />
                    <Info label={t.shipTo} value={selectedInvoice.shipment_to || "-"} />
                    <Info label={t.invoiceTotal} value={money(selectedInvoice.invoice_total || selectedInvoice.total_amount)} />
                    <Info label={t.previousBalance} value={money(selectedInvoice.previous_balance)} />
                    <Info label={t.deliveryCharges} value={money(selectedInvoice.delivery_charges)} />
                    <Info label={t.discount} value={money(selectedInvoice.discount)} />
                    <Info label={t.grandTotal} value={money(selectedInvoice.grand_total)} strong />
                  </div>
                </>
              )}
            </div>

            <div className="section-head"><span>{t.products}</span></div>
            <div className="table-panel">
              <table className="product-table">
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
                    <th>{t.rate}</th>
                    <th>{t.returnQty}</th>
                    <th>{t.returnAmount}</th>
                    <th>{t.markReturn}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceLoading ? (
                    <tr><td colSpan={12} className="center empty-cell">{t.loading}</td></tr>
                  ) : !invoiceItems.length ? (
                    <tr><td colSpan={12} className="center empty-cell">{selectedInvoice ? "No products found in this invoice." : t.noInvoice}</td></tr>
                  ) : (
                    invoiceItems.map((item, index) => {
                      const key = String(item.invoice_item_id);
                      const rowState = rowReturns[key] || {};
                      const returnQty = rowState.return_qty || "";
                      const returnAmount = toNum(returnQty) * toNum(item.rate);
                      const disabled = toNum(item.available_qty) <= 0;
                      const selected = !!rowState.selected || toNum(returnQty) > 0;
                      return (
                        <tr key={key} className={selected ? "selected-row" : ""}>
                          <td className="center strong">{index + 1}</td>
                          <td><b>{item.product_name}</b><div className="muted">#{item.product_id || "-"}</div></td>
                          <td>{item.product_description || item.description || "-"}</td>
                          <td>{item.category_name}</td>
                          <td>{item.unit_name}</td>
                          <td className="num">{money(item.sold_qty)}</td>
                          <td className="num">{money(item.already_returned_qty)}</td>
                          <td className="num strong" style={{ color: disabled ? "#dc2626" : "#16a34a" }}>{money(item.available_qty)}</td>
                          <td className="num">{money(item.rate)}</td>
                          <td>
                            <input
                              className="table-input"
                              type="number"
                              min="0"
                              max={item.available_qty}
                              disabled={disabled}
                              value={returnQty}
                              onChange={(e) => updateReturnRow(key, "return_qty", e.target.value)}
                            />
                          </td>
                          <td className="num strong">{money(returnAmount)}</td>
                          <td className="center">
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={selected}
                              onChange={(e) => updateReturnRow(key, "selected", e.target.checked)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-head"><span>{t.returnAmount}</span></div>
            <div className="form-section">
              <div className="bottom-grid">
                <div className="span-2">
                  <label>{t.reason}</label>
                  <textarea className="textarea" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
                </div>
                <TotalBox label={t.totalReturnQty} value={money(formTotals.qty)} />
                <TotalBox label={t.totalReturnAmount} value={money(formTotals.amount)} grand />
              </div>
              <div className="form-footer">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? t.saving : t.save}</button>
                <button className="btn btn-soft" onClick={closeForm} disabled={saving}>{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="sales-return-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{pageCss(isUrdu)}</style>

      {msg.text && <div className="toast" style={{ background: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</div>}

      <div className="page-wrap">
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
          <div className="top-actions">
            <button className="btn btn-soft" onClick={() => setLang(isUrdu ? "en" : "ur")}>{t.toggleLang}</button>
            <button className={`btn ${showSummary ? "btn-active" : "btn-soft"}`} onClick={() => setShowSummary((v) => !v)}>{showSummary ? t.hideSummary : t.viewSummary}</button>
            <button className="btn btn-soft" onClick={loadAll}>{t.refresh}</button>
            <button className="btn btn-primary" onClick={openAdd}>+ {t.newReturn}</button>
          </div>
        </div>

        {showSummary && (
          <div className="summary-grid">
            <TotalBox label={t.totalReturns} value={summary.totalReturns} />
            <TotalBox label={t.totalQty} value={money(summary.totalQty)} />
            <TotalBox label={t.totalAmount} value={money(summary.totalAmount)} grand />
          </div>
        )}

        <div className="toolbar">
          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} />
        </div>

        <div className="card table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.returnNo}</th>
                <th>{t.invoiceNo}</th>
                <th>{t.customer}</th>
                <th>{t.product}</th>
                <th>{t.returnDate}</th>
                <th>{t.returnQty}</th>
                <th>{t.rate}</th>
                <th>{t.returnAmount}</th>
                <th>{t.reason}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="empty-cell center">{t.loading}</td></tr>
              ) : filteredReturns.length === 0 ? (
                <tr><td colSpan={11} className="empty-cell center">{t.noRecords}</td></tr>
              ) : (
                filteredReturns.map((ret, index) => (
                  <tr key={ret.id || index}>
                    <td className="center muted strong">{index + 1}</td>
                    <td><b className="mono">{ret.return_no}</b></td>
                    <td>{ret.invoice_ref || ret.invoice_no || ret.invoice_id || "-"}</td>
                    <td>{ret.party_name || ret.customer_name || "-"}</td>
                    <td>{ret.product_name || productMap[String(ret.product_id || "")] || ret.product_id || "-"}</td>
                    <td className="center">{formatDate(ret.return_date, lang)}</td>
                    <td className="num strong">{money(ret.return_qty)}</td>
                    <td className="num">{money(ret.rate)}</td>
                    <td className="num strong blue-text">{money(ret.return_amount)}</td>
                    <td className="truncate-cell">{ret.reason || "-"}</td>
                    <td className="center">
                      <div className="row-actions">
                        <button className="small-btn green" onClick={() => openEdit(ret)}>{t.edit}</button>
                        <button className="small-btn amber" onClick={() => handlePrint(ret)}>{t.print}</button>
                        <button className="small-btn red" onClick={() => handleDelete(ret.id)}>{t.delete}</button>
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
  );
}

function Info({ label, value, strong = false }) {
  return (
    <div className={`info-box ${strong ? "strong-box" : ""}`}>
      <small>{label}</small>
      <b>{value || "-"}</b>
    </div>
  );
}

function TotalBox({ label, value, grand = false }) {
  return (
    <div className={`total-box ${grand ? "grand" : ""}`}>
      <label>{label}</label>
      <b>{value}</b>
    </div>
  );
}

function pageCss(isUrdu) {
  return `
    *{box-sizing:border-box}
    .sales-return-page{min-height:100vh;background:#f3f6fb;padding:18px;color:#0f172a;font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"}}
    .page-wrap{max-width:1260px;margin:0 auto}
    .top-card{background:#fff;border:1px solid #dbe3ee;border-radius:22px;padding:20px 22px;box-shadow:0 12px 34px rgba(15,23,42,.07);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
    .title{margin:0;font-size:30px;font-weight:950;letter-spacing:-.8px}.subtitle{margin:5px 0 0;color:#64748b;font-size:13px}.top-actions,.title-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    .btn{border:none;border-radius:12px;padding:10px 15px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.15s}.btn:hover{transform:translateY(-1px)}.btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.btn-primary{background:#4f46e5;color:white;box-shadow:0 12px 25px rgba(79,70,229,.22)}.btn-soft{background:white;color:#475569;border:1px solid #cbd5e1}.btn-active{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe}
    .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.search{width:min(480px,100%);height:40px;border:1px solid #cbd5e1;border-radius:14px;padding:0 13px;font-size:13px;outline:none;background:white}.search:focus,.input:focus,.textarea:focus,.table-input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
    .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.total-box{border:1px solid #dbe3ee;background:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 8px 18px rgba(15,23,42,.04)}.total-box label{display:block;font-size:10.5px;color:#64748b;margin-bottom:6px;font-weight:950;text-transform:uppercase}.total-box b{display:block;text-align:${isUrdu ? "left" : "right"};font-family:monospace;font-size:20px}.grand{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}
    .card{background:white;border:1px solid #dbe3ee;border-radius:18px;box-shadow:0 8px 24px rgba(15,23,42,.05);overflow:hidden}.table-wrap{overflow-x:auto}.list-table{width:100%;border-collapse:collapse;min-width:1120px}.list-table th{background:#111827;color:rgba(255,255,255,.82);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:12px 9px;text-align:${isUrdu ? "right" : "left"}}.list-table td{padding:12px 9px;border-bottom:1px solid #eef2f7;font-size:13px}.list-table tr:hover td{background:#f8fafc}.center{text-align:center!important}.num{text-align:right!important;font-family:monospace}.strong{font-weight:900}.mono{font-family:monospace}.muted{color:#64748b;font-size:11px}.blue-text{color:#1d4ed8}.truncate-cell{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.empty-cell{padding:40px!important;color:#94a3b8}.row-actions{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}.small-btn{border:none;border-radius:10px;padding:7px 9px;font-size:11px;font-weight:900;cursor:pointer}.green{background:#dcfce7;color:#166534}.amber{background:#fef3c7;color:#92400e}.red{background:#fee2e2;color:#991b1b}
    .input-page-card{background:#fff;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 18px 48px rgba(15,23,42,.10);overflow:hidden}.input-title{background:#111827;color:white;padding:17px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.input-title h2{margin:0;font-size:20px;font-weight:950}.input-title p{margin:4px 0 0;color:rgba(255,255,255,.72);font-size:12px}.form-section{background:white;border:1px solid #dbe3ee;border-top:none;padding:12px;overflow:auto}.no-radius-top{border-top:none}.section-head{height:40px;background:#e9eef8;border:1px solid #cbd5e1;display:flex;align-items:center;justify-content:space-between;padding:0 12px;font-weight:950;color:#0f172a;font-size:17px}.form-grid{display:grid;gap:10px;align-items:end}.top-grid{grid-template-columns:150px 150px 1fr 1.5fr}.bottom-grid{display:grid;grid-template-columns:1fr 1fr 190px 220px;gap:12px;align-items:end}.span-2{grid-column:span 2}label{display:block;font-size:11px;color:#334155;margin-bottom:5px;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.input,.textarea,.table-input{width:100%;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:6px 9px;font-size:13px;border-radius:10px;outline:none;font-weight:650}.input{height:34px}.textarea{min-height:70px;resize:vertical}.empty-box{border:1px dashed #cbd5e1;background:#f8fafc;border-radius:14px;padding:22px;text-align:center;color:#64748b;font-weight:900}.invoice-info-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.info-box{border:1px solid #dbe3ee;background:#f8fafc;border-radius:14px;padding:10px}.info-box small{display:block;color:#64748b;font-size:10.5px;font-weight:950;margin-bottom:5px;text-transform:uppercase}.info-box b{font-size:13px}.strong-box{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}.table-panel{background:white;border:1px solid #dbe3ee;border-top:none;padding:8px;overflow:auto}.product-table{width:100%;min-width:1180px;border-collapse:collapse;background:white}.product-table th,.product-table td{border:1px solid #dbe3ee;padding:6px;font-size:12px}.product-table th{background:#dbe3ee;text-align:center;color:#334155;font-weight:900}.table-input{height:32px;text-align:right}.selected-row td{background:#eef2ff!important}.form-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px;position:sticky;bottom:0;background:white;padding-top:10px}.toast{position:fixed;${isUrdu ? "left" : "right"}:18px;bottom:18px;z-index:120;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 20px 50px rgba(15,23,42,.25)}
    @media(max-width:1100px){.top-grid,.bottom-grid{grid-template-columns:repeat(2,1fr)}.invoice-info-grid{grid-template-columns:repeat(2,1fr)}.summary-grid{grid-template-columns:1fr 1fr}.span-2{grid-column:span 2}}
    @media(max-width:700px){.sales-return-page{padding:10px}.top-grid,.bottom-grid,.invoice-info-grid,.summary-grid{grid-template-columns:1fr}.span-2{grid-column:span 1}.form-footer{flex-direction:column}.btn{width:100%}.input-title{align-items:flex-start}.top-card{align-items:flex-start}.title{font-size:24px}}
  `;
}
