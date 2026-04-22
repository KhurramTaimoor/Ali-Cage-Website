import React, { useState, useEffect, useMemo, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

const fetchAllCustomers = () => apiFetch("/api/customers");
const fetchLedger = (id) => apiFetch(`/api/customers/${id}/ledger`);
const createCustomer = (data) =>
  apiFetch("/api/customers", { method: "POST", body: JSON.stringify(data) });
const updateCustomer = (id, data) =>
  apiFetch(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(data) });
const deleteCustomer = (id) => apiFetch(`/api/customers/${id}`, { method: "DELETE" });

const createLedgerEntry = (customerId, data) =>
  apiFetch(`/api/customers/${customerId}/ledger`, {
    method: "POST",
    body: JSON.stringify(data),
  });

const updateLedgerEntry = (customerId, entryId, data) =>
  apiFetch(`/api/customers/${customerId}/ledger/${entryId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

const deleteLedgerEntry = (customerId, entryId) =>
  apiFetch(`/api/customers/${customerId}/ledger/${entryId}`, { method: "DELETE" });

async function translateText(text) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text.trim()
    )}&langpair=en|ur`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.toLowerCase() === text.trim().toLowerCase()) return text;
    return translated;
  } catch {
    return text;
  }
}

function formatMoney(v) {
  return Number(v || 0).toLocaleString("en-PK");
}

function todayInputValue() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now - tzOffset).toISOString().slice(0, 10);
}

const LANG = {
  en: {
    title: "Customer Management",
    subtitle: "Manage your customers and their balances",
    addBtn: "Add Customer",
    summaryBtn: "View Summary",
    summaryTitle: "Customers Summary",
    summarySubtitle: "Overview of visible customer records",
    totalCustomers: "Total Customers",
    totalBalance: "Total Current Balance",
    totalOpeningBalance: "Total Opening Balance",
    searchPlaceholder: "Search by name, phone, city, balance…",
    name: "Customer Name",
    nameEn: "Customer Name",
    phone: "Phone No",
    city: "City",
    cityEn: "City",
    amount: "Current Balance",
    openingBalance: "Opening Balance",
    ledger: "Ledger",
    ledgerTitle: "Customer Ledger",
    ledgerLoading: "Loading ledger...",
    ledgerEmpty: "No ledger entries found.",
    date: "Date",
    source: "Source",
    details: "Details",
    debit: "Debit",
    credit: "Credit",
    balance: "Balance",
    openingEntry: "Opening Balance",
    close: "Close",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    downloadPdf: "Download PDF",
    noRecords: "No customers found.",
    toggleLang: "اردو",
    actions: "Actions",
    loading: "Loading customers...",
    translating: "Translating to Urdu…",
    errorMsg: "Customer name is required.",
    successSave: "Customer saved successfully!",
    successDelete: "Customer deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this customer?",
    namePlaceholder: "e.g. Ali Traders",
    phonePlaceholder: "03XX-XXXXXXX",
    cityPlaceholder: "e.g. Lahore",
    generated: "Generated",
    totalLabel: "Total",
    customersLabel: "customers",
    companyName: "Ali Cages",
    reportTitle: "Customer Report",
    amountPlaceholder: "0",
    fetchError: "Failed to load customers.",
    saveError: "Failed to save customer.",
    deleteError: "Failed to delete customer.",
    ledgerError: "Failed to load ledger.",
    addLedgerEntry: "Add Ledger Entry",
    editLedgerEntry: "Edit Ledger Entry",
    entryDate: "Entry Date",
    description: "Description",
    descriptionPlaceholder: "e.g. Sale invoice #123 or payment received",
    debitPlaceholder: "Amount received / added",
    creditPlaceholder: "Amount given / subtracted",
    saveEntry: "Save Entry",
    entrySaved: "Ledger entry saved successfully!",
    entryDeleted: "Ledger entry deleted successfully!",
    entrySaveError: "Failed to save ledger entry.",
    entryDeleteError: "Failed to delete ledger entry.",
    entryDeleteConfirm: "Are you sure you want to delete this ledger entry?",
    invalidLedgerEntry: "Enter description and at least one of debit or credit.",
    ledgerEntryTypeHint: "Debit adds to balance, credit subtracts from balance.",
    manual: "Manual",
    invoice: "Sales Invoice",
    salesReturn: "Sales Return",
    autoEntryHint: "Auto-generated entry",
    deleteNotAllowed: "This entry cannot be deleted from ledger directly.",
    editNotAllowed: "This entry cannot be edited from ledger directly.",
  },
  ur: {
    title: "گاہکوں کا انتظام",
    subtitle: "اپنے گاہکوں اور ان کے بیلنس کا ریکارڈ رکھیں",
    addBtn: "گاہک شامل کریں",
    summaryBtn: "سمری دیکھیں",
    summaryTitle: "گاہکوں کی سمری",
    summarySubtitle: "نظر آنے والے گاہکوں کے ریکارڈ کا خلاصہ",
    totalCustomers: "کل گاہک",
    totalBalance: "کل موجودہ بیلنس",
    totalOpeningBalance: "کل اوپننگ بیلنس",
    searchPlaceholder: "نام، فون، شہر، بیلنس سے تلاش کریں…",
    name: "گاہک کا نام",
    nameEn: "گاہک کا نام",
    phone: "فون نمبر",
    city: "شہر",
    cityEn: "شہر",
    amount: "موجودہ بیلنس",
    openingBalance: "اوپننگ بیلنس",
    ledger: "لیجر",
    ledgerTitle: "گاہک کا لیجر",
    ledgerLoading: "لیجر لوڈ ہو رہا ہے...",
    ledgerEmpty: "کوئی لیجر انٹری نہیں ملی۔",
    date: "تاریخ",
    source: "سورس",
    details: "تفصیل",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    balance: "بیلنس",
    openingEntry: "اوپننگ بیلنس",
    close: "بند کریں",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    downloadPdf: "پی ڈی ایف ڈاؤنلوڈ",
    noRecords: "کوئی گاہک نہیں ملا۔",
    toggleLang: "English",
    actions: "اقدامات",
    loading: "گاہکوں کا ڈیٹا لوڈ ہو رہا ہے...",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    errorMsg: "گاہک کا نام ضروری ہے۔",
    successSave: "گاہک کا ریکارڈ محفوظ ہو گیا!",
    successDelete: "گاہک حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی اس گاہک کو حذف کرنا چاہتے ہیں؟",
    namePlaceholder: "مثلاً Ali Traders",
    phonePlaceholder: "03XX-XXXXXXX",
    cityPlaceholder: "مثلاً Lahore",
    generated: "تیار کردہ",
    totalLabel: "کل",
    customersLabel: "گاہک",
    companyName: "علی کیجز",
    reportTitle: "گاہک رپورٹ",
    amountPlaceholder: "0",
    fetchError: "گاہک لوڈ نہیں ہو سکے۔",
    saveError: "گاہک محفوظ نہیں ہو سکا۔",
    deleteError: "گاہک حذف نہیں ہو سکا۔",
    ledgerError: "لیجر لوڈ نہیں ہو سکا۔",
    addLedgerEntry: "لیجر انٹری شامل کریں",
    editLedgerEntry: "لیجر انٹری میں ترمیم",
    entryDate: "اندراج کی تاریخ",
    description: "تفصیل",
    descriptionPlaceholder: "مثلاً سیل انوائس #123 یا وصولی",
    debitPlaceholder: "وصول شدہ / جمع رقم",
    creditPlaceholder: "ادا شدہ / منفی رقم",
    saveEntry: "انٹری محفوظ کریں",
    entrySaved: "لیجر انٹری محفوظ ہو گئی!",
    entryDeleted: "لیجر انٹری حذف ہو گئی!",
    entrySaveError: "لیجر انٹری محفوظ نہیں ہو سکی۔",
    entryDeleteError: "لیجر انٹری حذف نہیں ہو سکی۔",
    entryDeleteConfirm: "کیا آپ واقعی یہ لیجر انٹری حذف کرنا چاہتے ہیں؟",
    invalidLedgerEntry: "تفصیل اور ڈیبٹ یا کریڈٹ میں سے کم از کم ایک رقم درج کریں۔",
    ledgerEntryTypeHint: "ڈیبٹ بیلنس میں جمع ہوتا ہے، کریڈٹ بیلنس سے منفی ہوتا ہے۔",
    manual: "مینول",
    invoice: "سیل انوائس",
    salesReturn: "سیل ریٹرن",
    autoEntryHint: "خودکار اندراج",
    deleteNotAllowed: "یہ انٹری لیجر سے براہِ راست حذف نہیں کی جا سکتی۔",
    editNotAllowed: "یہ انٹری لیجر سے براہِ راست ایڈٹ نہیں کی جا سکتی۔",
  },
};

const defaultForm = {
  customer_name_en: "",
  phone: "",
  city_en: "",
  opening_balance: "",
};

const defaultLedgerForm = {
  entry_date: todayInputValue(),
  description_en: "",
  debit: "",
  credit: "",
};

function normalizeCustomer(raw) {
  return {
    ...raw,
    opening_balance: Number(raw?.opening_balance || 0),
    current_balance:
      raw?.current_balance !== undefined && raw?.current_balance !== null
        ? Number(raw.current_balance)
        : raw?.amount !== undefined && raw?.amount !== null
        ? Number(raw.amount)
        : Number(raw?.opening_balance || 0),
  };
}

function calculateClosingBalance(openingBalance, entries) {
  let bal = Number(openingBalance || 0);
  for (const entry of entries) {
    bal += Number(entry.debit || 0) - Number(entry.credit || 0);
  }
  return bal;
}

function getSourceInfo(source, t) {
  switch (source) {
    case "invoice":
      return { label: t.invoice, bg: "bg-amber-100", text: "text-amber-700", isManual: false };
    case "return":
      return { label: t.salesReturn, bg: "bg-violet-100", text: "text-violet-700", isManual: false };
    case "ledger":
    default:
      return { label: t.manual, bg: "bg-sky-100", text: "text-sky-700", isManual: true };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REDESIGNED PDF FUNCTION — Professional & Colorful
// ─────────────────────────────────────────────────────────────────────────────
function downloadAllPdf(customers, lang, cache) {
  const t = LANG[lang];
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210

  // ── Palette ──────────────────────────────────────────────────────────────
  const C = {
    // brand
    brand:        [14,  90, 168],   // deep sky blue
    brandDark:    [7,   55, 110],   // header text
    brandLight:   [224, 242, 254],  // very light sky
    brandMid:     [56, 143, 220],   // accent stripe
    // accents
    emerald:      [5,  150,  105],
    emeraldBg:    [236, 253, 245],
    amber:        [180,  83,   9],
    amberBg:      [255, 251, 235],
    violet:       [109,  40, 217],
    violetBg:     [245, 243, 255],
    // neutral
    white:        [255, 255, 255],
    slate50:      [248, 250, 252],
    slate100:     [241, 245, 249],
    slate200:     [226, 232, 240],
    slate400:     [148, 163, 184],
    slate600:     [71,  85, 105],
    slate900:     [15,  23,  42],
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fill   = (rgb) => doc.setFillColor(...rgb);
  const stroke = (rgb, w = 0.3) => { doc.setDrawColor(...rgb); doc.setLineWidth(w); };
  const text   = (rgb) => doc.setTextColor(...rgb);
  const font   = (style, size) => { doc.setFont("helvetica", style); doc.setFontSize(size); };
  const rect   = (x, y, w, h, r = 0, mode = "F") =>
    r > 0 ? doc.roundedRect(x, y, w, h, r, r, mode) : doc.rect(x, y, w, h, mode);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalCustomers = customers.length;
  const totalBalance   = customers.reduce((s, c) => s + Number(c.current_balance  || 0), 0);
  const totalOpening   = customers.reduce((s, c) => s + Number(c.opening_balance  || 0), 0);
  const dateStr        = new Date().toLocaleString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER BAND
  // ═══════════════════════════════════════════════════════════════════════════

  // Deep blue background
  fill(C.brand);
  rect(0, 0, W, 38, 0, "F");

  // Diagonal accent stripe (right side decoration)
  fill(C.brandMid);
  doc.triangle(W - 60, 0, W, 0, W, 38, "F");
  fill([255, 255, 255, 20]);   // subtle white highlight at top
  doc.triangle(W - 30, 0, W, 0, W, 18, "F");

  // Company logo circle
  fill(C.white);
  doc.circle(18, 19, 10, "F");
  fill(C.brand);
  doc.circle(18, 19, 8, "F");
  font("bold", 9);
  text(C.white);
  doc.text("AC", 18, 19.5, { align: "center", baseline: "middle" });

  // Company name
  font("bold", 18);
  text(C.white);
  doc.text(t.companyName, 33, 15);

  // Report title
  font("normal", 9);
  text([180, 215, 248]);
  doc.text(t.reportTitle, 33, 23);

  // Date on right
  font("normal", 8);
  text([180, 215, 248]);
  doc.text(`${t.generated}: ${dateStr}`, W - 68, 20, { align: "left" });

  // Thin bottom accent line under header
  fill(C.brandMid);
  rect(0, 38, W, 1.5, 0, "F");

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS CARDS  (3 cards side by side)
  // ═══════════════════════════════════════════════════════════════════════════
  const cardY  = 44;
  const cardH  = 28;
  const cardW  = (W - 20 - 8) / 3;   // 3 cards, 4px gap each side
  const gap    = 4;

  const cards = [
    {
      label: t.totalCustomers,
      value: String(totalCustomers),
      icon: "CUST",
      fill: C.brand,
      fillBg: C.brandLight,
      iconFill: C.brand,
      valColor: C.brandDark,
      accent: C.brand,
    },
    {
      label: t.totalBalance,
      value: "PKR " + formatMoney(totalBalance),
      icon: "BAL",
      fill: C.emerald,
      fillBg: C.emeraldBg,
      iconFill: C.emerald,
      valColor: C.emerald,
      accent: C.emerald,
    },
    {
      label: t.totalOpeningBalance,
      value: "PKR " + formatMoney(totalOpening),
      icon: "OPN",
      fill: C.amber,
      fillBg: C.amberBg,
      iconFill: C.amber,
      valColor: C.amber,
      accent: C.amber,
    },
  ];

  cards.forEach((card, i) => {
    const cx = 8 + i * (cardW + gap);

    // Card background
    fill(card.fillBg);
    stroke(card.accent, 0.4);
    rect(cx, cardY, cardW, cardH, 3, "FD");

    // Left accent bar
    fill(card.accent);
    rect(cx, cardY, 3, cardH, 0, "F");

    // Icon pill (small colored box top-right)
    fill(card.iconFill);
    rect(cx + cardW - 18, cardY + 4, 14, 7, 2, "F");
    font("bold", 5.5);
    text(C.white);
    doc.text(card.icon, cx + cardW - 11, cardY + 8.5, { align: "center" });

    // Label
    font("normal", 7.5);
    text(C.slate600);
    doc.text(card.label, cx + 7, cardY + 9);

    // Value
    font("bold", 11);
    text(card.valColor);
    doc.text(card.value, cx + 7, cardY + 21);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION LABEL before table
  // ═══════════════════════════════════════════════════════════════════════════
  const sectionY = cardY + cardH + 5;

  fill(C.slate100);
  rect(8, sectionY, W - 16, 7, 2, "F");
  font("bold", 7.5);
  text(C.slate600);
  doc.text("CUSTOMER RECORDS", 14, sectionY + 5);
  font("normal", 7);
  text(C.slate400);
  doc.text(
    `${totalCustomers} ${t.customersLabel}`,
    W - 14, sectionY + 5, { align: "right" }
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  const rows = customers.map((c, i) => [
    i + 1,
    lang === "ur" ? cache[`name:${c.id}`] || c.customer_name_en : c.customer_name_en,
    c.phone || "-",
    lang === "ur" ? cache[`city:${c.id}`] || c.city_en : c.city_en,
    "PKR " + formatMoney(c.current_balance),
    "PKR " + formatMoney(c.opening_balance),
  ]);

  autoTable(doc, {
    startY: sectionY + 9,
    margin: { left: 8, right: 8 },
    head: [["#", t.name, t.phone, t.city, t.amount, t.openingBalance]],
    body: rows,
    foot: [["", "", "", `── ${t.totalLabel} ──`, "PKR " + formatMoney(totalBalance), "PKR " + formatMoney(totalOpening)]],
    theme: "plain",

    headStyles: {
      fillColor: C.brandDark,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      valign: "middle",
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },

    bodyStyles: {
      textColor: C.slate900,
      fontSize: 8,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      valign: "middle",
      lineColor: C.slate200,
      lineWidth: 0.1,
    },

    footStyles: {
      fillColor: C.brandDark,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },

    // Zebra rows
    alternateRowStyles: {
      fillColor: C.slate50,
    },

    // Per-column styles
    columnStyles: {
      0: { halign: "center", cellWidth: 10,  fontStyle: "bold",   textColor: C.brand },
      1: { halign: "left",   cellWidth: 72,  fontStyle: "bold" },
      2: { halign: "center", cellWidth: 40 },
      3: { halign: "left",   cellWidth: 50 },
      4: { halign: "right",  cellWidth: 50,  fontStyle: "bold",   textColor: C.emerald },
      5: { halign: "right",  cellWidth: 50,  fontStyle: "bold",   textColor: C.amber },
    },

    // Custom row drawing: colored left border on each data row
    didDrawCell(data) {
      if (data.section === "body" && data.column.index === 0) {
        fill(C.brand);
        doc.rect(data.cell.x, data.cell.y, 1.2, data.cell.height, "F");
      }
    },

    // Footer / page number on every page
    didDrawPage(data) {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();

      // Footer strip
      fill(C.brandDark);
      rect(0, H - 10, W, 10, 0, "F");

      font("normal", 7);
      text([180, 215, 248]);
      doc.text(t.companyName + " — " + t.reportTitle, 10, H - 4);
      doc.text(`Page ${pg} / ${total}`, W - 10, H - 4, { align: "right" });

      // If not first page, re-draw the header band (compact)
      if (pg > 1) {
        fill(C.brand);
        rect(0, 0, W, 12, 0, "F");
        font("bold", 9);
        text(C.white);
        doc.text(t.companyName + " — " + t.reportTitle, W / 2, 8, { align: "center" });
      }
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WATERMARK on every page (light diagonal text)
  // ═══════════════════════════════════════════════════════════════════════════
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    font("bold", 55);
    fill(C.brand);
    text(C.brand);
    doc.text(t.companyName.toUpperCase(), W / 2, H / 2, {
      align: "center",
      angle: 30,
      baseline: "middle",
    });
    doc.restoreGraphicsState();
  }

  doc.save(`customers-${new Date().toISOString().slice(0, 10)}.pdf`);
}
// ─────────────────────────────────────────────────────────────────────────────

const CustomerPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urduCache, setUrduCache] = useState({});
  const [translating, setTranslating] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState(defaultForm);

  const [showLedger, setShowLedger] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [ledgerEditingId, setLedgerEditingId] = useState(null);
  const [ledgerSubmitting, setLedgerSubmitting] = useState(false);
  const [ledgerForm, setLedgerForm] = useState(defaultLedgerForm);

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const patchCustomerBalance = useCallback((customerId, balance) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, current_balance: Number(balance || 0) } : c
      )
    );
    setSelectedCustomer((prev) =>
      prev?.id === customerId ? { ...prev, current_balance: Number(balance || 0) } : prev
    );
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllCustomers();
      const list = Array.isArray(data) ? data : data?.data || [];
      setCustomers(list.map(normalizeCustomer));
    } catch (err) {
      showToast("error", err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur" || customers.length === 0) return;
    const untranslated = customers.filter(
      (c) => !urduCache[`name:${c.id}`] || !urduCache[`city:${c.id}`]
    );
    if (untranslated.length === 0) return;
    setTranslating(true);
    try {
      const results = await Promise.all(
        untranslated.map(async (c) => {
          const [nameUr, cityUr] = await Promise.all([
            translateText(c.customer_name_en),
            translateText(c.city_en),
          ]);
          return { id: c.id, nameUr, cityUr };
        })
      );
      setUrduCache((prev) => {
        const next = { ...prev };
        results.forEach(({ id, nameUr, cityUr }) => {
          next[`name:${id}`] = nameUr;
          next[`city:${id}`] = cityUr;
        });
        return next;
      });
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  };

  const getName = (c) =>
    isUrdu ? urduCache[`name:${c.id}`] || c.customer_name_en || "-" : c.customer_name_en || "-";

  const getCity = (c) =>
    isUrdu ? urduCache[`city:${c.id}`] || c.city_en || "-" : c.city_en || "-";

  const getEntryDescription = (entry) => entry.description || entry.description_en || "-";
  const getEntryDate = (entry) => entry.date || entry.entry_date || "-";

  const openAdd = () => { setForm(defaultForm); setEditingId(null); setShowForm(true); };

  const openEdit = (c) => {
    setForm({
      customer_name_en: c.customer_name_en || "",
      phone: c.phone || "",
      city_en: c.city_en || "",
      opening_balance: c.opening_balance ?? "",
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.customer_name_en.trim()) { showToast("error", t.errorMsg); return; }
    const payload = {
      customer_name_en: form.customer_name_en.trim(),
      phone: form.phone.trim(),
      city_en: form.city_en.trim(),
      opening_balance: form.opening_balance !== "" ? Number(form.opening_balance) : 0,
    };
    try {
      setSubmitting(true);
      if (editingId) {
        const res = await updateCustomer(editingId, payload);
        const updated = normalizeCustomer(res?.data || res);
        setCustomers((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        setUrduCache((prev) => {
          const next = { ...prev };
          delete next[`name:${editingId}`];
          delete next[`city:${editingId}`];
          return next;
        });
      } else {
        const res = await createCustomer(payload);
        const created = normalizeCustomer(res?.data || res);
        setCustomers((prev) => [created, ...prev]);
      }
      showToast("success", t.successSave);
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (err) {
      showToast("error", err.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast("success", t.successDelete);
      if (selectedCustomer?.id === id) closeLedger();
    } catch (err) {
      showToast("error", err.message || t.deleteError);
    }
  };

  const syncLedgerResult = useCallback(
    (customer, entriesRaw) => {
      const raw = Array.isArray(entriesRaw) ? entriesRaw : entriesRaw?.data || [];
      const entries = raw.map((e) => ({
        ...e,
        debit: Number(e.debit || 0),
        credit: Number(e.credit || 0),
        source: e.source || "ledger",
        can_edit: e.source === "ledger" || !e.source,
        can_delete: e.source === "ledger" || !e.source,
      }));
      setLedgerEntries(entries);
      const closing = calculateClosingBalance(customer.opening_balance, entries);
      patchCustomerBalance(customer.id, closing);
      return entries;
    },
    [patchCustomerBalance]
  );

  const openLedger = async (customer) => {
    setSelectedCustomer(customer);
    setShowLedger(true);
    setLedgerLoading(true);
    setLedgerEntries([]);
    setShowLedgerForm(false);
    setLedgerEditingId(null);
    setLedgerForm(defaultLedgerForm);
    try {
      const data = await fetchLedger(customer.id);
      syncLedgerResult(customer, data);
    } catch (err) {
      showToast("error", err.message || t.ledgerError);
    } finally {
      setLedgerLoading(false);
    }
  };

  const closeLedger = () => {
    setShowLedger(false);
    setSelectedCustomer(null);
    setLedgerEntries([]);
    setShowLedgerForm(false);
    setLedgerEditingId(null);
    setLedgerForm(defaultLedgerForm);
  };

  const openAddLedgerForm = () => {
    setLedgerEditingId(null);
    setLedgerForm({ ...defaultLedgerForm, entry_date: todayInputValue() });
    setShowLedgerForm(true);
  };

  const openEditLedgerForm = (entry) => {
    if (!entry?.can_edit) { showToast("error", t.editNotAllowed); return; }
    setLedgerEditingId(entry.id);
    setLedgerForm({
      entry_date: getEntryDate(entry) || todayInputValue(),
      description_en: entry.description || entry.description_en || "",
      debit: entry.debit ? String(entry.debit) : "",
      credit: entry.credit ? String(entry.credit) : "",
    });
    setShowLedgerForm(true);
  };

  const handleLedgerSave = async () => {
    if (!selectedCustomer) return;
    const description_en = ledgerForm.description_en.trim();
    const debit  = ledgerForm.debit  !== "" ? Number(ledgerForm.debit)  : 0;
    const credit = ledgerForm.credit !== "" ? Number(ledgerForm.credit) : 0;
    if (!description_en || (!debit && !credit)) { showToast("error", t.invalidLedgerEntry); return; }
    const payload = {
      entry_date: ledgerForm.entry_date || todayInputValue(),
      description_en, debit, credit,
    };
    try {
      setLedgerSubmitting(true);
      if (ledgerEditingId) {
        await updateLedgerEntry(selectedCustomer.id, ledgerEditingId, payload);
      } else {
        await createLedgerEntry(selectedCustomer.id, payload);
      }
      const refreshed = await fetchLedger(selectedCustomer.id);
      syncLedgerResult(selectedCustomer, refreshed);
      showToast("success", t.entrySaved);
      setShowLedgerForm(false);
      setLedgerEditingId(null);
      setLedgerForm(defaultLedgerForm);
    } catch (err) {
      showToast("error", err.message || t.entrySaveError);
    } finally {
      setLedgerSubmitting(false);
    }
  };

  const handleLedgerDelete = async (entry) => {
    if (!selectedCustomer || !entry) return;
    if (!entry.can_delete) { showToast("error", t.deleteNotAllowed); return; }
    if (!window.confirm(t.entryDeleteConfirm)) return;
    try {
      await deleteLedgerEntry(selectedCustomer.id, entry.id);
      const refreshed = await fetchLedger(selectedCustomer.id);
      syncLedgerResult(selectedCustomer, refreshed);
      showToast("success", t.entryDeleted);
    } catch (err) {
      showToast("error", err.message || t.entryDeleteError);
    }
  };

  const ledgerRows = useMemo(() => {
    if (!selectedCustomer) return [];
    let bal = Number(selectedCustomer.opening_balance || 0);
    const rows = [
      {
        id: "opening",
        date: "",
        description: t.openingEntry,
        debit: "",
        credit: "",
        balance: bal,
        isOpening: true,
        source: "opening",
        can_delete: false,
        can_edit: false,
      },
    ];
    for (const e of ledgerEntries) {
      bal += Number(e.debit || 0) - Number(e.credit || 0);
      rows.push({ ...e, balance: bal, isOpening: false });
    }
    return rows;
  }, [ledgerEntries, selectedCustomer, t.openingEntry]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) =>
      [
        c.customer_name_en,
        urduCache[`name:${c.id}`] || "",
        c.phone,
        c.city_en,
        urduCache[`city:${c.id}`] || "",
        String(c.current_balance || ""),
        String(c.opening_balance || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [customers, search, urduCache]);

  const summary = useMemo(
    () => ({
      totalCustomers: filtered.length,
      totalBalance: filtered.reduce((s, c) => s + Number(c.current_balance || 0), 0),
      totalOpeningBalance: filtered.reduce((s, c) => s + Number(c.opening_balance || 0), 0),
    }),
    [filtered]
  );

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>
            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button onClick={handleLangToggle} disabled={translating} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                <i className={`bi ${translating ? "bi-arrow-repeat animate-spin" : "bi-translate"}`}></i>
                {t.toggleLang}
              </button>
              <button onClick={() => setShowSummary((v) => !v)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${showSummary ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`}>
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>
              <button onClick={() => downloadAllPdf(filtered, lang, urduCache)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm">
                <i className="bi bi-file-earmark-pdf-fill"></i>
                {t.downloadPdf}
              </button>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200">
                <i className="bi bi-person-plus-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="mt-5 pt-5 border-t border-sky-100">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">{t.summaryTitle}</h3>
                <p className="text-sm text-slate-500">{t.summarySubtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-3">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t.totalCustomers}</p>
                  <p className="text-3xl font-extrabold text-slate-950">{summary.totalCustomers}</p>
                </div>
                <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                  <p className="text-xs text-slate-500 mb-1">{t.totalBalance}</p>
                  <p className="text-2xl font-extrabold text-slate-950">{formatMoney(summary.totalBalance)}</p>
                </div>
                <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                  <p className="text-xs text-slate-500 mb-1">{t.totalOpeningBalance}</p>
                  <p className="text-2xl font-extrabold text-slate-950">{formatMoney(summary.totalOpeningBalance)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="relative mb-6 max-w-md">
          <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-4" : "left-4"}`}></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full border border-sky-100 rounded-2xl py-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"}`}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100">
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.name}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.phone}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.city}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>{t.amount}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>{t.openingBalance}</th>
                  <th className="px-5 py-4 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2">{t.loading}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">{t.noRecords}</td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id} className="hover:bg-sky-50/70 transition">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className={`px-5 py-4 font-bold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                        <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                            <i className="bi bi-person-fill"></i>
                          </div>
                          <span className={translating ? "opacity-40" : ""}>{getName(c)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-950 font-mono text-xs font-semibold">{c.phone || "-"}</td>
                      <td className={`px-5 py-4 text-slate-950 font-semibold ${translating ? "opacity-40" : ""}`}>{getCity(c)}</td>
                      <td className={`px-5 py-4 font-mono font-bold text-slate-950 ${isUrdu ? "text-left" : "text-right"}`}>{formatMoney(c.current_balance)}</td>
                      <td className={`px-5 py-4 font-mono font-bold text-slate-950 ${isUrdu ? "text-left" : "text-right"}`}>{formatMoney(c.opening_balance)}</td>
                      <td className="px-5 py-4">
                        <div className={`flex items-center justify-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(c)} className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center" title={t.edit}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 transition flex items-center justify-center" title={t.delete}>
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                          <button onClick={() => openLedger(c)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition">
                            <i className="bi bi-journal-text"></i>
                            {t.ledger}
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

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 flex flex-col" dir={dir}>
              <div className="flex items-center gap-3 mb-6 border-b border-sky-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <i className="bi bi-person-lines-fill text-sky-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.nameEn} *</label>
                  <div className="relative">
                    <i className={`bi bi-person absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                    <input type="text" value={form.customer_name_en} onChange={(e) => setForm({ ...form, customer_name_en: e.target.value })} placeholder={t.namePlaceholder} className={`w-full border border-sky-100 rounded-2xl py-3 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.phone}</label>
                  <div className="relative">
                    <i className={`bi bi-telephone absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.phonePlaceholder} className={`w-full border border-sky-100 rounded-2xl py-3 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 font-mono ${isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.cityEn}</label>
                  <div className="relative">
                    <i className={`bi bi-geo-alt absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                    <input type="text" value={form.city_en} onChange={(e) => setForm({ ...form, city_en: e.target.value })} placeholder={t.cityPlaceholder} className={`w-full border border-sky-100 rounded-2xl py-3 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"}`} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-sky-700 mb-1.5">{t.openingBalance}</label>
                  <input type="number" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} placeholder={t.amountPlaceholder} className={`w-full border border-sky-100 rounded-2xl px-4 py-3 text-sm bg-sky-50/30 focus:outline-none focus:ring-4 focus:ring-sky-100 font-mono font-bold text-sky-700 ${isUrdu ? "text-right" : ""}`} />
                </div>
              </div>
              <div className={`flex gap-3 pt-4 border-t border-sky-100 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button onClick={handleSave} disabled={submitting} className="flex-1 bg-sky-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-sky-700 transition shadow-lg shadow-sky-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                  {submitting ? t.saving : t.save}
                </button>
                <button onClick={() => setShowForm(false)} disabled={submitting} className="flex-1 bg-white border border-sky-200 text-sky-700 py-3 rounded-2xl font-semibold text-sm hover:bg-sky-50 transition disabled:opacity-60">
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {showLedger && selectedCustomer && (
          <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" dir={dir}>
              <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-sky-100 bg-sky-50/80">
                <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <i className="bi bi-journal-text text-sky-700 text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800">{t.ledgerTitle}</h2>
                    <p className="text-sm text-slate-500">
                      {getName(selectedCustomer)}
                      {selectedCustomer.phone ? ` • ${selectedCustomer.phone}` : ""}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <button onClick={openAddLedgerForm} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2">
                    <i className="bi bi-plus-circle-fill"></i>
                    {t.addLedgerEntry}
                  </button>
                  <button onClick={closeLedger} className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition">
                    {t.close}
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: t.name, val: getName(selectedCustomer) },
                    { label: t.phone, val: selectedCustomer.phone || "-", mono: true },
                    { label: t.city, val: getCity(selectedCustomer) },
                    {
                      label: t.amount,
                      val: formatMoney(ledgerRows.length ? ledgerRows[ledgerRows.length - 1]?.balance : selectedCustomer.current_balance),
                      mono: true,
                      highlight: true,
                    },
                  ].map((card, idx) => (
                    <div key={idx} className={`${card.highlight ? "bg-sky-50 border-sky-100" : "bg-white border-sky-100"} border rounded-2xl p-4 shadow-sm`}>
                      <p className={`text-xs mb-1 ${card.highlight ? "text-sky-600" : "text-slate-500"}`}>{card.label}</p>
                      <p className={`font-bold ${card.highlight ? "text-sky-700" : "text-slate-950"} ${card.mono ? "font-mono" : ""}`}>{card.val}</p>
                    </div>
                  ))}
                </div>

                {showLedgerForm && (
                  <div className="mb-6 bg-sky-50/70 border border-sky-100 rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                        <i className="bi bi-journal-plus text-sky-700"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{ledgerEditingId ? t.editLedgerEntry : t.addLedgerEntry}</h3>
                        <p className="text-xs text-slate-500">{t.ledgerEntryTypeHint}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.entryDate}</label>
                        <input type="date" value={ledgerForm.entry_date} onChange={(e) => setLedgerForm({ ...ledgerForm, entry_date: e.target.value })} className="w-full border border-sky-100 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-sky-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.description}</label>
                        <input type="text" value={ledgerForm.description_en} onChange={(e) => setLedgerForm({ ...ledgerForm, description_en: e.target.value })} placeholder={t.descriptionPlaceholder} className={`w-full border border-sky-100 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "text-right" : ""}`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-emerald-700 mb-1.5">{t.debit}</label>
                        <input type="number" value={ledgerForm.debit} onChange={(e) => setLedgerForm({ ...ledgerForm, debit: e.target.value })} placeholder={t.debitPlaceholder} className={`w-full border border-emerald-100 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 font-mono font-bold text-emerald-700 ${isUrdu ? "text-right" : ""}`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-rose-700 mb-1.5">{t.credit}</label>
                        <input type="number" value={ledgerForm.credit} onChange={(e) => setLedgerForm({ ...ledgerForm, credit: e.target.value })} placeholder={t.creditPlaceholder} className={`w-full border border-rose-100 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-rose-100 font-mono font-bold text-rose-700 ${isUrdu ? "text-right" : ""}`} />
                      </div>
                    </div>
                    <div className={`flex gap-3 pt-5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <button onClick={handleLedgerSave} disabled={ledgerSubmitting} className="px-5 py-2.5 rounded-2xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition disabled:opacity-60 flex items-center gap-2">
                        <i className={`bi ${ledgerSubmitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                        {ledgerSubmitting ? t.saving : t.saveEntry}
                      </button>
                      <button onClick={() => { setShowLedgerForm(false); setLedgerEditingId(null); setLedgerForm(defaultLedgerForm); }} disabled={ledgerSubmitting} className="px-5 py-2.5 rounded-2xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition disabled:opacity-60">
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600">
                      <thead>
                        <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100">
                          <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                          <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                          <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.source}</th>
                          <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.details}</th>
                          <th className="px-5 py-4 text-right">{t.debit}</th>
                          <th className="px-5 py-4 text-right">{t.credit}</th>
                          <th className="px-5 py-4 text-right">{t.balance}</th>
                          <th className="px-5 py-4 text-center">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {ledgerLoading ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                              <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                              <p className="mt-2">{t.ledgerLoading}</p>
                            </td>
                          </tr>
                        ) : ledgerRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400">{t.ledgerEmpty}</td>
                          </tr>
                        ) : (
                          ledgerRows.map((row, i) => {
                            const srcInfo = getSourceInfo(row.source, t);
                            const editDisabled   = row.isOpening || !row.can_edit;
                            const deleteDisabled = row.isOpening || !row.can_delete;
                            const rowBg = row.isOpening
                              ? "bg-sky-50/60"
                              : row.source === "invoice"
                              ? "bg-amber-50/40 hover:bg-amber-50/70"
                              : row.source === "return"
                              ? "bg-violet-50/40 hover:bg-violet-50/70"
                              : "hover:bg-sky-50/40";

                            return (
                              <tr key={`${row.source}-${row.id}-${i}`} className={`transition ${rowBg}`}>
                                <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                                <td className="px-5 py-4 text-slate-950 font-mono text-xs font-semibold">{row.isOpening ? "-" : getEntryDate(row) || "-"}</td>
                                <td className="px-5 py-4">
                                  {row.isOpening ? (
                                    <span className="text-slate-400">—</span>
                                  ) : (
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${srcInfo.bg} ${srcInfo.text}`}>{srcInfo.label}</span>
                                  )}
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-950">
                                  <div className="flex flex-col">
                                    <span>
                                      {row.isOpening
                                        ? t.openingEntry
                                        : row.source === "invoice"
                                        ? `Sale Invoice No: ${row.invoice_no || "-"}`
                                        : row.source === "return"
                                        ? `Sales Return No: ${row.return_no || "-"}`
                                        : "-"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-right font-mono text-emerald-700 font-bold">{row.isOpening ? "-" : row.debit > 0 ? formatMoney(row.debit) : "-"}</td>
                                <td className="px-5 py-4 text-right font-mono text-rose-700 font-bold">{row.isOpening ? "-" : row.credit > 0 ? formatMoney(row.credit) : "-"}</td>
                                <td className="px-5 py-4 text-right font-mono text-slate-950 font-bold">{formatMoney(row.balance)}</td>
                                <td className="px-5 py-4">
                                  {row.isOpening ? (
                                    <div className="text-center text-slate-300">—</div>
                                  ) : (
                                    <div className={`flex items-center justify-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                                      <button onClick={() => openEditLedgerForm(row)} disabled={editDisabled} className={`w-9 h-9 rounded-xl transition flex items-center justify-center ${editDisabled ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`} title={editDisabled ? t.editNotAllowed : t.edit}>
                                        <i className="bi bi-pencil-square"></i>
                                      </button>
                                      <button onClick={() => handleLedgerDelete(row)} disabled={deleteDisabled} className={`w-9 h-9 rounded-xl transition flex items-center justify-center ${deleteDisabled ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`} title={deleteDisabled ? t.deleteNotAllowed : t.delete}>
                                        <i className="bi bi-trash3-fill"></i>
                                      </button>
                                    </div>
                                  )}
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

              <div className={`px-6 py-4 border-t border-sky-100 bg-sky-50/80 flex ${isUrdu ? "justify-start" : "justify-end"}`}>
                <button onClick={closeLedger} className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPage;