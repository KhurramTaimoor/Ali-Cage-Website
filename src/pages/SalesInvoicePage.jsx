import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const RETURNS_API = `${API_ROOT}/api/sales-returns`;
const INVOICES_API = `${API_ROOT}/api/sales-invoices`;

const LANG = {
  en: {
    title: "Sales Return",
    subtitle: "Return sold products with invoice reference and complete return fields",
    newReturn: "New Return",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    refresh: "Refresh",
    toggleLang: "اردو",
    searchPlaceholder: "Search return no, invoice no, product, reason or date...",
    todayFilter: "Today",
    selectDate: "Select Date",
    showingDate: "Showing Date",
    totalReturns: "Total Returns",
    totalQty: "Total Qty",
    totalAmount: "Total Amount",
    totalCredit: "Total Credit",
    returnNo: "Return No",
    invoiceSelect: "Sales Invoice",
    selectInvoice: "Select Invoice",
    invoiceRef: "Invoice Ref",
    customerName: "Name",
    invoiceDate: "Invoice Date",
    returnDate: "Return Date",
    saleDate: "Sale Date",
    dateFull: "Date / Month / Year",
    invoiceTotal: "Invoice Total",
    grandTotal: "Grand Total",
    previousBalance: "Previous Balance",
    deliveryCharges: "Delivery Charges",
    discount: "Discount",
    product: "Product",
    selectProduct: "Select Product",
    manualProduct: "Manual Product Name",
    productDescription: "Description",
    category: "Category",
    unit: "Unit",
    soldQty: "Sold Qty",
    alreadyReturned: "Already Returned",
    availableQty: "Available Qty",
    returnQty: "Return Qty",
    rate: "Rate",
    returnAmount: "Return Amount",
    debit: "Debit",
    credit: "Credit",
    reason: "Reason",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    print: "Print",
    save: "Save",
    update: "Update",
    saving: "Saving...",
    cancel: "Cancel",
    back: "Back",
    loading: "Loading...",
    loadingInvoices: "Loading invoices...",
    loadingProducts: "Loading products...",
    noRecords: "No returns found.",
    noInvoiceItems: "No products found in selected invoice. You can still enter fields manually.",
    selectedInvoiceDetails: "Selected Invoice Details",
    returnFields: "Sales Return Fields",
    productFields: "Product Return Details",
    amountFields: "Amount Details",
    saveSuccess: "Return saved successfully!",
    updateSuccess: "Return updated successfully!",
    deleteSuccess: "Return deleted successfully!",
    loadError: "Data load failed.",
    saveError: "Save failed. Check backend.",
    deleteError: "Delete failed.",
    printError: "Print failed.",
    confirmDelete: "Delete this return?",
    requiredReturnNo: "Return No is required.",
    requiredProduct: "Product is required.",
    qtyInvalid: "Return qty must be greater than 0.",
    qtyExceeded: "Return qty cannot be greater than available qty.",
    autoCalc: "Auto: Return Qty × Rate",
  },
  ur: {
    title: "سیلز ریٹرن",
    subtitle: "انوائس ریفرنس اور مکمل ریٹرن فیلڈز کے ساتھ سیلز ریٹرن",
    newReturn: "نیا ریٹرن",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    refresh: "ری فریش",
    toggleLang: "English",
    searchPlaceholder: "ریٹرن نمبر، انوائس، پروڈکٹ، وجہ یا تاریخ تلاش کریں...",
    todayFilter: "آج",
    selectDate: "تاریخ منتخب کریں",
    showingDate: "دکھائی جانے والی تاریخ",
    totalReturns: "کل ریٹرن",
    totalQty: "کل مقدار",
    totalAmount: "کل رقم",
    totalCredit: "کل کریڈٹ",
    returnNo: "ریٹرن نمبر",
    invoiceSelect: "سیلز انوائس",
    selectInvoice: "انوائس منتخب کریں",
    invoiceRef: "انوائس ریفرنس",
    customerName: "نام",
    invoiceDate: "انوائس تاریخ",
    returnDate: "ریٹرن تاریخ",
    saleDate: "سیل تاریخ",
    dateFull: "تاریخ / مہینہ / سال",
    invoiceTotal: "انوائس ٹوٹل",
    grandTotal: "گرینڈ ٹوٹل",
    previousBalance: "سابقہ بیلنس",
    deliveryCharges: "ڈیلیوری چارجز",
    discount: "ڈسکاؤنٹ",
    product: "پروڈکٹ",
    selectProduct: "پروڈکٹ منتخب کریں",
    manualProduct: "پروڈکٹ نام",
    productDescription: "تفصیل",
    category: "کیٹیگری",
    unit: "یونٹ",
    soldQty: "فروخت مقدار",
    alreadyReturned: "پہلے واپس",
    availableQty: "دستیاب مقدار",
    returnQty: "ریٹرن مقدار",
    rate: "ریٹ",
    returnAmount: "ریٹرن رقم",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    reason: "وجہ",
    actions: "اقدامات",
    edit: "ترمیم",
    delete: "حذف",
    print: "پرنٹ",
    save: "محفوظ کریں",
    update: "اپڈیٹ",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    back: "واپس",
    loading: "لوڈ ہو رہا ہے...",
    loadingInvoices: "انوائسز لوڈ ہو رہی ہیں...",
    loadingProducts: "پروڈکٹس لوڈ ہو رہے ہیں...",
    noRecords: "کوئی ریٹرن نہیں ملا۔",
    noInvoiceItems: "اس انوائس میں پروڈکٹس نہیں ملیں۔ آپ فیلڈز manual بھی لکھ سکتے ہیں۔",
    selectedInvoiceDetails: "منتخب انوائس کی تفصیل",
    returnFields: "سیلز ریٹرن فیلڈز",
    productFields: "پروڈکٹ ریٹرن تفصیل",
    amountFields: "رقم کی تفصیل",
    saveSuccess: "ریٹرن محفوظ ہو گیا!",
    updateSuccess: "ریٹرن اپڈیٹ ہو گیا!",
    deleteSuccess: "ریٹرن حذف ہو گیا!",
    loadError: "ڈیٹا لوڈ نہیں ہوا۔",
    saveError: "محفوظ نہیں ہوا، بیک اینڈ چیک کریں۔",
    deleteError: "حذف نہیں ہوا۔",
    printError: "پرنٹ نہیں ہو سکا۔",
    confirmDelete: "کیا یہ ریٹرن حذف کرنا ہے؟",
    requiredReturnNo: "ریٹرن نمبر ضروری ہے۔",
    requiredProduct: "پروڈکٹ ضروری ہے۔",
    qtyInvalid: "ریٹرن مقدار 0 سے زیادہ ہونی چاہیے۔",
    qtyExceeded: "ریٹرن مقدار دستیاب مقدار سے زیادہ نہیں ہو سکتی۔",
    autoCalc: "خودکار: ریٹرن مقدار × ریٹ",
  },
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  return_no: "",
  invoice_id: "",
  invoice_ref: "",
  invoice_item_id: "",
  product_id: "",
  product_name: "",
  product_description: "",
  category_name: "",
  unit_name: "",
  return_date: today(),
  sale_order_date: "",
  sold_qty: "0",
  already_returned_qty: "0",
  available_qty: "0",
  return_qty: "",
  rate: "0",
  return_amount: "0",
  debit: "0",
  credit: "0",
  reason: "",
});

const getList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.returns)) return d.returns;
  if (Array.isArray(d?.sales_returns)) return d.sales_returns;
  if (Array.isArray(d?.invoices)) return d.invoices;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(d?.result)) return d.result;
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

function toISODate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s.slice(0, 10);
}

function formatDateDMY(value) {
  const iso = toISODate(value);
  if (!iso || iso === "-") return "-";
  const parts = iso.split("-");
  if (parts.length !== 3) return value || "-";
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

function getId(row) {
  return row?.id ?? row?.value ?? row?.invoice_item_id ?? row?.item_id ?? row?.sales_invoice_item_id ?? "";
}

function pickText(row, keys, fallback = "") {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && String(row[key]).trim()) {
      return String(row[key]).trim();
    }
  }
  return fallback;
}

const getPartyName = (inv) =>
  pickText(inv, [
    "party_name",
    "customer_name",
    "customer_name_en",
    "employee_name",
    "supplier_name",
    "general_ledger_name",
    "name",
    "name_en",
  ], "");

const getProductName = (row) =>
  pickText(row, ["product_name", "product_name_en", "item_name", "name", "name_en", "title"], "");

const getProductDesc = (row) =>
  pickText(row, ["product_description", "description", "details", "remarks"], "");

const getCategoryName = (row) =>
  pickText(row, ["category_name", "category_name_en", "category", "cat_name"], "");

const getUnitName = (row) => pickText(row, ["unit_name", "unit_name_en", "unit", "symbol"], "");

const getProductId = (row) => row?.product_id ?? row?.productId ?? row?.ProductID ?? row?.product?.id ?? "";
const getCategoryId = (row) => row?.category_id ?? row?.categoryId ?? row?.CategoryID ?? row?.category?.id ?? "";
const getUnitId = (row) => row?.unit_id ?? row?.unitId ?? row?.UnitID ?? row?.unit?.id ?? "";

function normalizeInvoiceItem(row, index = 0, inv = {}) {
  const qty = toNum(row?.qty ?? row?.quantity ?? row?.order_qty ?? row?.pieces_qty ?? row?.carton_qty);
  const returned = toNum(row?.returned_qty ?? row?.already_returned_qty ?? row?.return_qty_done ?? 0);
  const rate = toNum(row?.rate ?? row?.sale_rate ?? row?.price ?? row?.unit_price ?? 0);
  const available = Math.max(0, qty - returned);
  return {
    invoice_item_id: String(row?.invoice_item_id ?? row?.id ?? row?.item_id ?? row?.sales_invoice_item_id ?? index + 1),
    invoice_id: String(row?.invoice_id ?? inv?.id ?? ""),
    invoice_ref: row?.invoice_ref || inv?.invoice_no || "",
    product_id: String(getProductId(row) || ""),
    product_name: getProductName(row) || `Product ${index + 1}`,
    product_description: getProductDesc(row),
    category_id: String(getCategoryId(row) || ""),
    category_name: getCategoryName(row),
    unit_id: String(getUnitId(row) || ""),
    unit_name: getUnitName(row),
    sale_order_date: toISODate(row?.invoice_date || inv?.invoice_date || inv?.order_date || ""),
    sold_qty: qty,
    already_returned_qty: returned,
    available_qty: available,
    rate,
    amount: toNum(row?.amount),
  };
}

function normalizeInvoice(inv) {
  return {
    ...inv,
    id: inv?.id ?? inv?.invoice_id,
    invoice_no: inv?.invoice_no || inv?.invoiceNo || inv?.ref_no || "",
    invoice_date: toISODate(inv?.invoice_date || inv?.date || inv?.order_date || ""),
    party_name: getPartyName(inv),
    invoice_total: toNum(inv?.invoice_total ?? inv?.total_amount),
    grand_total: toNum(inv?.grand_total ?? inv?.invoice_total ?? inv?.total_amount),
    previous_balance: toNum(inv?.previous_balance),
    delivery_charges: toNum(inv?.delivery_charges),
    discount: toNum(inv?.discount),
    items: Array.isArray(inv?.items) ? inv.items : Array.isArray(inv?.order_items) ? inv.order_items : [],
  };
}

function normalizeReturn(row) {
  return {
    ...row,
    id: row?.id,
    return_no: row?.return_no || row?.returnNo || "",
    invoice_id: row?.invoice_id || "",
    invoice_ref: row?.invoice_ref || row?.invoice_no || "",
    invoice_item_id: row?.invoice_item_id || "",
    product_id: row?.product_id || "",
    product_name: row?.product_name || "",
    product_description: row?.product_description || row?.description || "",
    category_name: row?.category_name || "",
    unit_name: row?.unit_name || "",
    return_date: toISODate(row?.return_date),
    sale_order_date: toISODate(row?.sale_order_date || row?.invoice_date || row?.sale_date),
    sold_qty: toNum(row?.sold_qty),
    already_returned_qty: toNum(row?.already_returned_qty),
    available_qty: toNum(row?.available_qty),
    return_qty: toNum(row?.return_qty),
    rate: toNum(row?.rate),
    return_amount: toNum(row?.return_amount),
    debit: toNum(row?.debit),
    credit: toNum(row?.credit || row?.return_amount),
    reason: row?.reason || "",
  };
}

function genReturnNo(list) {
  let max = 0;
  list.forEach((r) => {
    const s = String(r.return_no || "");
    const m1 = s.match(/^sales-return(\d+)$/i);
    const m2 = s.match(/^SR[- ]?(\d+)$/i);
    const m = m1 || m2;
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `sales-return${String(max + 1).padStart(2, "0")}`;
}

function printReturnSlip(ret, t, isUrdu) {
  const amount = toNum(ret.return_amount);
  const html = `<!doctype html>
<html dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<title>${ret.return_no || "Sales Return"}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;background:#f8fafc;color:#111827}.page{padding:22px}.sheet{background:white;border:1px solid #d1d5db;border-radius:18px;overflow:hidden}.head{background:#111827;color:#fff;padding:18px 22px;display:flex;justify-content:space-between}.head h1{margin:0;font-size:24px}.body{padding:16px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.box{border:1px solid #d1d5db;border-radius:10px;padding:9px}.box small{display:block;color:#64748b;margin-bottom:5px;font-size:11px}.box b{font-size:14px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;color:#111827}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px}.num{text-align:right;font-family:monospace}.strong{font-weight:900}.reason{margin-top:12px;border:1px solid #d1d5db;border-radius:10px;padding:10px}@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style>
</head>
<body><div class="page"><div class="sheet">
  <div class="head"><div><h1>Ali Cages</h1><div>${t.title}</div></div><div>${t.returnNo}: <b>${ret.return_no || "-"}</b><br/>${t.returnDate}: ${formatDateDMY(ret.return_date)}</div></div>
  <div class="body">
    <div class="grid">
      <div class="box"><small>${t.returnNo}</small><b>${ret.return_no || "-"}</b></div>
      <div class="box"><small>${t.invoiceRef}</small><b>${ret.invoice_ref || "-"}</b></div>
      <div class="box"><small>${t.product}</small><b>${ret.product_name || "-"}</b></div>
      <div class="box"><small>${t.saleDate}</small><b>${formatDateDMY(ret.sale_order_date)}</b></div>
      <div class="box"><small>${t.returnDate}</small><b>${formatDateDMY(ret.return_date)}</b></div>
    </div>
    <table><thead><tr><th>${t.soldQty}</th><th>${t.alreadyReturned}</th><th>${t.availableQty}</th><th>${t.returnQty}</th><th class="num">${t.rate}</th><th class="num">${t.returnAmount}</th><th class="num">${t.debit}</th><th class="num">${t.credit}</th></tr></thead>
    <tbody><tr><td>${money(ret.sold_qty)}</td><td>${money(ret.already_returned_qty)}</td><td>${money(ret.available_qty)}</td><td>${money(ret.return_qty)}</td><td class="num">${money(ret.rate)}</td><td class="num strong">${money(amount)}</td><td class="num">${money(ret.debit)}</td><td class="num">${money(ret.credit || amount)}</td></tr></tbody></table>
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

  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [itemLoading, setItemLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState(emptyForm());

  const toast = useCallback((type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2800);
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(RETURNS_API);
      setReturns(getList(res.data).map(normalizeReturn));
    } catch {
      toast("error", t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError, toast]);

  const fetchInvoices = useCallback(async () => {
    setInvoiceLoading(true);
    try {
      const res = await axios.get(INVOICES_API);
      setInvoices(getList(res.data).map(normalizeInvoice));
    } catch {
      toast("error", t.loadError);
    } finally {
      setInvoiceLoading(false);
    }
  }, [t.loadError, toast]);

  useEffect(() => {
    fetchReturns();
    fetchInvoices();
  }, [fetchReturns, fetchInvoices]);

  useEffect(() => {
    const amount = toNum(form.return_qty) * toNum(form.rate);
    setForm((prev) => ({
      ...prev,
      return_amount: String(amount.toFixed(2)),
      debit: "0",
      credit: String(amount.toFixed(2)),
    }));
  }, [form.return_qty, form.rate]);

  const summary = useMemo(
    () =>
      returns.reduce(
        (acc, r) => {
          acc.totalReturns += 1;
          acc.totalQty += toNum(r.return_qty);
          acc.totalAmount += toNum(r.return_amount);
          acc.totalCredit += toNum(r.credit || r.return_amount);
          return acc;
        },
        { totalReturns: 0, totalQty: 0, totalAmount: 0, totalCredit: 0 }
      ),
    [returns]
  );

  const filtered = useMemo(() => {
    let list = returns.filter((r) => String(r.return_date || "").slice(0, 10) === (selectedDate || today()));
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter((r) =>
      [r.return_no, r.invoice_ref, r.product_name, r.reason, r.return_date, r.sale_order_date]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [returns, search, selectedDate]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), return_no: genReturnNo(returns) });
    setInvoiceItems([]);
    setSelectedInvoice(null);
    setShowForm(true);
  };

  const openEdit = async (row) => {
    const r = normalizeReturn(row);
    setEditingId(r.id);
    setForm({
      return_no: r.return_no,
      invoice_id: String(r.invoice_id || ""),
      invoice_ref: r.invoice_ref || "",
      invoice_item_id: String(r.invoice_item_id || ""),
      product_id: String(r.product_id || ""),
      product_name: r.product_name || "",
      product_description: r.product_description || "",
      category_name: r.category_name || "",
      unit_name: r.unit_name || "",
      return_date: toISODate(r.return_date) || today(),
      sale_order_date: toISODate(r.sale_order_date),
      sold_qty: String(r.sold_qty || 0),
      already_returned_qty: String(r.already_returned_qty || 0),
      available_qty: String(r.available_qty || 0),
      return_qty: String(r.return_qty || ""),
      rate: String(r.rate || 0),
      return_amount: String(r.return_amount || 0),
      debit: String(r.debit || 0),
      credit: String(r.credit || r.return_amount || 0),
      reason: r.reason || "",
    });
    setShowForm(true);

    if (r.invoice_id) {
      await loadInvoiceDetails(r.invoice_id, false);
    } else {
      setInvoiceItems([]);
      setSelectedInvoice(null);
    }
  };

  const loadInvoiceDetails = async (invoiceId, fillForm = true) => {
    if (!invoiceId) {
      setSelectedInvoice(null);
      setInvoiceItems([]);
      return;
    }

    try {
      setItemLoading(true);
      const res = await axios.get(`${INVOICES_API}/${invoiceId}`);
      const inv = normalizeInvoice(res.data?.data || res.data?.invoice || res.data);
      const rawItems = Array.isArray(inv.items) ? inv.items : [];
      const items = rawItems.map((item, idx) => normalizeInvoiceItem(item, idx, inv));

      setSelectedInvoice(inv);
      setInvoiceItems(items);

      if (fillForm) {
        setForm((prev) => ({
          ...prev,
          invoice_id: String(inv.id || invoiceId),
          invoice_ref: inv.invoice_no || "",
          sale_order_date: toISODate(inv.invoice_date),
          invoice_item_id: "",
          product_id: "",
          product_name: "",
          product_description: "",
          category_name: "",
          unit_name: "",
          sold_qty: "0",
          already_returned_qty: "0",
          available_qty: "0",
          return_qty: "",
          rate: "0",
          return_amount: "0",
          debit: "0",
          credit: "0",
        }));
      }
    } catch {
      const inv = invoices.find((x) => String(x.id) === String(invoiceId));
      if (inv) {
        const norm = normalizeInvoice(inv);
        const items = (norm.items || []).map((item, idx) => normalizeInvoiceItem(item, idx, norm));
        setSelectedInvoice(norm);
        setInvoiceItems(items);
        if (fillForm) {
          setForm((prev) => ({
            ...prev,
            invoice_id: String(norm.id || invoiceId),
            invoice_ref: norm.invoice_no || "",
            sale_order_date: toISODate(norm.invoice_date),
          }));
        }
      } else {
        toast("error", t.loadError);
        setSelectedInvoice(null);
        setInvoiceItems([]);
      }
    } finally {
      setItemLoading(false);
    }
  };

  const handleInvoiceChange = async (invoiceId) => {
    setForm((prev) => ({ ...prev, invoice_id: invoiceId }));
    await loadInvoiceDetails(invoiceId, true);
  };

  const handleProductChange = (invoiceItemId) => {
    const item = invoiceItems.find((x) => String(x.invoice_item_id) === String(invoiceItemId));
    if (!item) {
      setForm((prev) => ({ ...prev, invoice_item_id: invoiceItemId }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      invoice_item_id: item.invoice_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_description: item.product_description,
      category_name: item.category_name,
      unit_name: item.unit_name,
      sale_order_date: item.sale_order_date || prev.sale_order_date,
      sold_qty: String(item.sold_qty || 0),
      already_returned_qty: String(item.already_returned_qty || 0),
      available_qty: String(item.available_qty || 0),
      return_qty: "",
      rate: String(item.rate || 0),
      return_amount: "0",
      debit: "0",
      credit: "0",
    }));
  };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = () => {
    if (!String(form.return_no || "").trim()) throw new Error(t.requiredReturnNo);
    if (!String(form.product_name || "").trim() && !String(form.product_id || "").trim()) throw new Error(t.requiredProduct);

    const returnQty = toNum(form.return_qty);
    const availableQty = toNum(form.available_qty);
    if (returnQty <= 0) throw new Error(t.qtyInvalid);
    if (availableQty > 0 && returnQty > availableQty) throw new Error(t.qtyExceeded);

    const amount = returnQty * toNum(form.rate);

    return {
      return_no: String(form.return_no).trim(),
      invoice_id: form.invoice_id ? Number(form.invoice_id) : null,
      invoice_ref: String(form.invoice_ref || "").trim(),
      invoice_item_id: form.invoice_item_id ? Number(form.invoice_item_id) : null,
      product_id: form.product_id ? Number(form.product_id) : null,
      product_name: String(form.product_name || "").trim(),
      product_description: String(form.product_description || "").trim(),
      category_name: String(form.category_name || "").trim(),
      unit_name: String(form.unit_name || "").trim(),
      return_date: toISODate(form.return_date) || null,
      sale_order_date: toISODate(form.sale_order_date) || null,
      sold_qty: toNum(form.sold_qty),
      already_returned_qty: toNum(form.already_returned_qty),
      available_qty: toNum(form.available_qty),
      return_qty: returnQty,
      rate: toNum(form.rate),
      return_amount: amount,
      debit: toNum(form.debit),
      credit: toNum(form.credit) || amount,
      reason: String(form.reason || "").trim(),
    };
  };

  const handleSave = async () => {
    let payload;
    try {
      payload = buildPayload();
    } catch (err) {
      toast("error", err.message);
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`${RETURNS_API}/${editingId}`, payload);
        toast("success", t.updateSuccess);
      } else {
        await axios.post(RETURNS_API, payload);
        toast("success", t.saveSuccess);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      setInvoiceItems([]);
      setSelectedInvoice(null);
      fetchReturns();
      fetchInvoices();
    } catch (err) {
      toast("error", err?.response?.data?.message || err.message || t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await axios.delete(`${RETURNS_API}/${id}`);
      toast("success", t.deleteSuccess);
      fetchReturns();
      fetchInvoices();
    } catch {
      toast("error", t.deleteError);
    }
  };

  const handlePrint = (row) => {
    try {
      printReturnSlip(normalizeReturn(row), t, isUrdu);
    } catch {
      toast("error", t.printError);
    }
  };

  return (
    <div dir={dir} className="return-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        *{box-sizing:border-box}
        .return-page{min-height:100vh;background:linear-gradient(135deg,#f8fafc,#eef2ff);padding:18px;color:#0f172a;font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"};overflow-x:hidden}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .page-wrap,.form-page-wrap{max-width:1220px;width:100%;margin:0 auto}.form-page-wrap{animation:fadeSlide .22s ease-out both}
        .top-card{background:rgba(255,255,255,.94);border:1px solid #dbe3ee;border-radius:22px;padding:20px 22px;box-shadow:0 18px 48px rgba(15,23,42,.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
        .title{margin:0;font-size:30px;font-weight:950;letter-spacing:-.8px}.subtitle{margin:5px 0 0;color:#64748b;font-size:13px}
        .btn{border:1px solid #cbd5e1;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.12s;background:white;color:#334155;box-shadow:none}.btn:hover{background:#f8fafc;transform:none;filter:none}.btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.btn-primary{background:#111827;color:white;border-color:#111827;box-shadow:none}.btn-soft{background:white;color:#334155;border:1px solid #cbd5e1}.btn-active{background:white;color:#111827;border:1px solid #94a3b8}.btn-green,.btn-red,.btn-yellow,.btn-blue{background:white!important;color:#334155!important;border:1px solid #cbd5e1!important;box-shadow:none!important}.table-click-row{cursor:pointer}.table-click-row:hover td{background:#f8fafc!important}
        .summary-grid{animation:fadeSlide .24s ease-out both;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.summary-card{background:white;border:1px solid #dbe3ee;border-radius:18px;padding:14px;box-shadow:0 8px 22px rgba(15,23,42,.05);animation:pop .22s ease-out both}.summary-card small{display:block;color:#64748b;font-size:10.5px;font-weight:950;text-transform:uppercase;letter-spacing:.5px}.summary-card b{display:block;margin-top:7px;font-size:18px;font-weight:950;font-family:monospace}
        .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:14px 0 12px}.search{width:min(430px,100%);height:40px;border:1px solid #cbd5e1;border-radius:14px;padding:0 13px;font-size:13px;outline:none;background:white}.search:focus,.input:focus,.select:focus,.productInput:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.10)}.filter{height:36px;border:1px solid #cbd5e1;border-radius:12px;background:white;padding:0 10px;font-weight:800;color:#475569;cursor:pointer}.filter.active{background:#4f46e5;color:white;border-color:#4f46e5}
        .card{background:white;border:1px solid #dbe3ee;border-radius:18px;box-shadow:0 8px 24px rgba(15,23,42,.05);overflow:hidden}.table-wrap{overflow-x:auto}table.list{width:100%;border-collapse:collapse;table-layout:fixed}table.list th{background:#111827;color:rgba(255,255,255,.78);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:12px 9px}table.list td{padding:12px 9px;border-bottom:1px solid #eef2f7;font-size:13px}table.list tr:hover td{background:#f8fafc}
        .toast{position:fixed;${isUrdu ? "left" : "right"}:18px;bottom:18px;z-index:120;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 20px 50px rgba(15,23,42,.25)}
        .inputBox{width:100%;background:#f8fafc;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 18px 48px rgba(15,23,42,.08);overflow:hidden;min-height:calc(100vh - 36px)}.inputTitle{height:54px;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:17px;font-weight:900}.inputBody{padding:14px;overflow-x:hidden}.formTopLine{display:grid;grid-template-columns:150px 220px 220px 150px 1fr;gap:10px;align-items:end;margin-bottom:10px}.basicLabel{font-size:11px;color:#334155;margin-bottom:5px;display:block;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.input,.select,.productInput{width:100%;height:34px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 9px;font-size:13px;border-radius:10px;outline:none;font-weight:650}.input[readonly]{background:#f1f5f9}.dateBox{display:grid;grid-template-columns:1fr 115px;gap:6px}.datePreview{height:34px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;padding:8px 9px;font-size:11px;font-weight:900;color:#334155;text-align:center;font-family:monospace}.sectionHead{height:38px;background:linear-gradient(135deg,#eef2ff,#f8fafc);border:1px solid #cbd5e1;border-radius:14px 14px 0 0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;margin-top:12px;font-weight:950;color:#0f172a}.panel{border:1px solid #cbd5e1;border-top:none;padding:12px;background:white;border-radius:0 0 14px 14px;overflow:auto}.invoiceGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.infoBox{border:1px solid #dbe3ee;background:#f8fafc;border-radius:14px;padding:10px}.infoBox small{display:block;font-size:10.5px;color:#64748b;margin-bottom:6px;font-weight:900}.infoBox b{font-size:14px;font-family:monospace}.fieldGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.wide{grid-column:span 2}.full{grid-column:1/-1}.amountBox{background:#eef2ff;border-color:#c7d2fe}.footerBtns{padding:12px 0 0;display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:0;background:linear-gradient(180deg,rgba(248,250,252,0),#eef2f7 35%)}
        @media(max-width:1160px){.summary-grid{grid-template-columns:repeat(2,1fr)}.formTopLine{grid-template-columns:repeat(2,1fr)}.fieldGrid,.invoiceGrid{grid-template-columns:repeat(2,1fr)}.wide{grid-column:span 1}table.list{min-width:1050px}}
        @media(max-width:720px){.summary-grid,.formTopLine,.fieldGrid,.invoiceGrid{grid-template-columns:1fr}.dateBox{grid-template-columns:1fr}.title{font-size:24px}.footerBtns{flex-direction:column}.btn{width:100%}}
      `}</style>

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
              <button className={`btn ${showSummary ? "btn-active" : "btn-soft"}`} onClick={() => setShowSummary((v) => !v)}>{showSummary ? t.hideSummary : t.viewSummary}</button>
              <button className="btn btn-soft" onClick={fetchReturns}>{loading ? t.loading : t.refresh}</button>
              <button className="btn btn-primary" onClick={openAdd}>+ {t.newReturn}</button>
            </div>
          </div>

          {showSummary && (
            <div className="summary-grid">
              {[
                [t.totalReturns, summary.totalReturns],
                [t.totalQty, money(summary.totalQty)],
                [t.totalAmount, money(summary.totalAmount)],
                [t.totalCredit, money(summary.totalCredit)],
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
            <button className={`filter ${selectedDate === today() ? "active" : ""}`} onClick={() => setSelectedDate(today())}>{t.todayFilter}</button>
            <label style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #cbd5e1", borderRadius: 12, padding: "0 10px", height: 36, fontWeight: 850, color: "#475569", fontSize: 12 }}>
              <span>{t.selectDate}</span>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value || today())} style={{ border: "none", outline: "none", fontWeight: 850, color: "#0f172a", background: "transparent" }} />
            </label>
            <span style={{ height: 36, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: 12, background: "#eef2ff", color: "#3730a3", fontWeight: 900, border: "1px solid #c7d2fe", fontSize: 12 }}>
              {t.showingDate}: {formatDateDMY(selectedDate)}
            </span>
          </div>

          <div className="card table-wrap">
            <table className="list">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th style={{ width: 150, textAlign: isUrdu ? "right" : "left" }}>{t.returnNo}</th>
                  <th style={{ width: 150, textAlign: isUrdu ? "right" : "left" }}>{t.invoiceRef}</th>
                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>{t.product}</th>
                  <th style={{ width: 120 }}>{t.saleDate}</th>
                  <th style={{ width: 120 }}>{t.returnDate}</th>
                  <th style={{ width: 95, textAlign: "right" }}>{t.returnQty}</th>
                  <th style={{ width: 110, textAlign: "right" }}>{t.returnAmount}</th>
                  <th style={{ width: 110, textAlign: "right" }}>{t.credit}</th>
                  <th style={{ width: 185 }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.loading}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.noRecords}</td></tr>
                ) : filtered.map((r, idx) => (
                  <tr key={r.id || idx} className="table-click-row" onClick={() => openEdit(r)} title="Click to open return">
                    <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace" }}>{idx + 1}</td>
                    <td><b style={{ fontFamily: "monospace" }}>{r.return_no}</b><div style={{ fontSize: 11, color: "#94a3b8" }}>{r.reason || "-"}</div></td>
                    <td><b>{r.invoice_ref || "-"}</b></td>
                    <td><b>{r.product_name || "-"}</b><div style={{ fontSize: 11, color: "#64748b" }}>{r.product_description || r.category_name || "-"}</div></td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", fontWeight: 800 }}>{formatDateDMY(r.sale_order_date)}</td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", fontWeight: 800 }}>{formatDateDMY(r.return_date)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>{money(r.return_qty)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900, color: "#1d4ed8" }}>{money(r.return_amount)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>{money(r.credit || r.return_amount)}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn btn-soft" style={{ padding: "7px 10px" }} onClick={(e) => { e.stopPropagation(); openEdit(r); }}>{t.edit}</button>
                        <button className="btn btn-soft" style={{ padding: "7px 10px" }} onClick={(e) => { e.stopPropagation(); handlePrint(r); }}>{t.print}</button>
                        <button className="btn btn-soft" style={{ padding: "7px 10px" }} onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>{t.delete}</button>
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
          <div className="inputBox">
            <div className="inputTitle">
              <span>{editingId ? t.update : t.newReturn}</span>
              <button className="btn btn-soft" onClick={() => setShowForm(false)} style={{ height: 34, padding: "6px 12px" }}>{t.back}</button>
            </div>
            <div className="inputBody">
              <div className="formTopLine">
                <div>
                  <label className="basicLabel">{t.returnNo}</label>
                  <input className="input" value={form.return_no} onChange={(e) => updateForm("return_no", e.target.value)} />
                </div>
                <div>
                  <label className="basicLabel">{t.invoiceSelect}</label>
                  <select className="select" value={form.invoice_id} onChange={(e) => handleInvoiceChange(e.target.value)}>
                    <option value="">{invoiceLoading ? t.loadingInvoices : t.selectInvoice}</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.invoice_no} - {inv.party_name || inv.customer_name || t.customerName} - {formatDateDMY(inv.invoice_date)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="basicLabel">{t.invoiceRef}</label>
                  <input className="input" value={form.invoice_ref} onChange={(e) => updateForm("invoice_ref", e.target.value)} />
                </div>
                <div>
                  <label className="basicLabel">{t.returnDate}</label>
                  <div className="dateBox">
                    <input className="input" type="date" value={form.return_date} onChange={(e) => updateForm("return_date", e.target.value)} />
                    <div className="datePreview">{formatDateDMY(form.return_date)}</div>
                  </div>
                </div>
                <div>
                  <label className="basicLabel">{t.saleDate}</label>
                  <div className="dateBox">
                    <input className="input" type="date" value={form.sale_order_date} onChange={(e) => updateForm("sale_order_date", e.target.value)} />
                    <div className="datePreview">{formatDateDMY(form.sale_order_date)}</div>
                  </div>
                </div>
              </div>

              {selectedInvoice && (
                <>
                  <div className="sectionHead"><span>{t.selectedInvoiceDetails}</span></div>
                  <div className="panel">
                    <div className="invoiceGrid">
                      <div className="infoBox"><small>{t.invoiceRef}</small><b>{selectedInvoice.invoice_no || "-"}</b></div>
                      <div className="infoBox"><small>{t.customerName}</small><b>{selectedInvoice.party_name || t.customerName}</b></div>
                      <div className="infoBox"><small>{t.invoiceDate}</small><b>{formatDateDMY(selectedInvoice.invoice_date)}</b></div>
                      <div className="infoBox"><small>{t.invoiceTotal}</small><b>{money(selectedInvoice.invoice_total)}</b></div>
                      <div className="infoBox"><small>{t.previousBalance}</small><b>{money(selectedInvoice.previous_balance)}</b></div>
                      <div className="infoBox"><small>{t.grandTotal}</small><b>{money(selectedInvoice.grand_total)}</b></div>
                    </div>
                  </div>
                </>
              )}

              <div className="sectionHead"><span>{t.productFields}</span></div>
              <div className="panel">
                <div className="fieldGrid">
                  <div className="wide">
                    <label className="basicLabel">{t.product}</label>
                    <select className="productInput" value={form.invoice_item_id} disabled={itemLoading || !invoiceItems.length} onChange={(e) => handleProductChange(e.target.value)}>
                      <option value="">{itemLoading ? t.loadingProducts : t.selectProduct}</option>
                      {invoiceItems.map((item) => (
                        <option key={item.invoice_item_id} value={item.invoice_item_id}>
                          {item.product_name} | Sold: {money(item.sold_qty)} | Returned: {money(item.already_returned_qty)}
                        </option>
                      ))}
                    </select>
                    {form.invoice_id && !itemLoading && invoiceItems.length === 0 && <div style={{ color: "#b45309", fontSize: 12, marginTop: 6, fontWeight: 800 }}>{t.noInvoiceItems}</div>}
                  </div>
                  <div className="wide">
                    <label className="basicLabel">{t.manualProduct}</label>
                    <input className="productInput" value={form.product_name} onChange={(e) => updateForm("product_name", e.target.value)} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.category}</label>
                    <input className="productInput" value={form.category_name} onChange={(e) => updateForm("category_name", e.target.value)} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.unit}</label>
                    <input className="productInput" value={form.unit_name} onChange={(e) => updateForm("unit_name", e.target.value)} />
                  </div>
                  <div className="full">
                    <label className="basicLabel">{t.productDescription}</label>
                    <input className="productInput" value={form.product_description} onChange={(e) => updateForm("product_description", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="sectionHead"><span>{t.returnFields}</span></div>
              <div className="panel">
                <div className="fieldGrid">
                  <div><label className="basicLabel">{t.soldQty}</label><input className="productInput" type="number" value={form.sold_qty} onChange={(e) => updateForm("sold_qty", e.target.value)} /></div>
                  <div><label className="basicLabel">{t.alreadyReturned}</label><input className="productInput" type="number" value={form.already_returned_qty} onChange={(e) => updateForm("already_returned_qty", e.target.value)} /></div>
                  <div><label className="basicLabel">{t.availableQty}</label><input className="productInput" type="number" value={form.available_qty} onChange={(e) => updateForm("available_qty", e.target.value)} /></div>
                  <div><label className="basicLabel">{t.returnQty}</label><input className="productInput" type="number" value={form.return_qty} onChange={(e) => updateForm("return_qty", e.target.value)} /></div>
                  <div><label className="basicLabel">{t.rate}</label><input className="productInput" type="number" value={form.rate} onChange={(e) => updateForm("rate", e.target.value)} /></div>
                  <div className="amountBox" style={{ border: "1px solid #c7d2fe", borderRadius: 12, padding: 8 }}>
                    <label className="basicLabel">{t.returnAmount}</label>
                    <input className="productInput" readOnly style={{ background: "#eef2ff", color: "#3730a3", fontWeight: 900, textAlign: "right" }} value={money(form.return_amount)} />
                    <div style={{ fontSize: 10, color: "#4f46e5", fontWeight: 900, marginTop: 4 }}>{t.autoCalc}</div>
                  </div>
                  <div><label className="basicLabel">{t.debit}</label><input className="productInput" type="number" value={form.debit} onChange={(e) => updateForm("debit", e.target.value)} /></div>
                  <div><label className="basicLabel">{t.credit}</label><input className="productInput" type="number" value={form.credit} onChange={(e) => updateForm("credit", e.target.value)} /></div>
                  <div className="full"><label className="basicLabel">{t.reason}</label><textarea className="productInput" style={{ height: 68, resize: "vertical", paddingTop: 8 }} value={form.reason} onChange={(e) => updateForm("reason", e.target.value)} /></div>
                </div>
              </div>

              <div className="footerBtns">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? t.saving : editingId ? t.update : t.save}</button>
                <button className="btn btn-soft" onClick={() => setShowForm(false)} disabled={saving}>{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
