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
    throw new Error(err.message || err.error || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

const fetchAllRates = () => apiFetch("/api/rates");
const fetchCategories = () => apiFetch("/api/categories");
const fetchUnits = () => apiFetch("/api/units");
const fetchProducts = () => apiFetch("/api/products");
const fetchTypes = () => apiFetch("/api/product-types");

const createRate = (data) =>
  apiFetch("/api/rates", { method: "POST", body: JSON.stringify(data) });

const updateRate = (id, data) =>
  apiFetch(`/api/rates/${id}`, { method: "PUT", body: JSON.stringify(data) });

const deleteRate = (id) =>
  apiFetch(`/api/rates/${id}`, { method: "DELETE" });

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

const LANG = {
  en: {
    title: "Rate List",
    subtitle: "Manage product pricing and rates",
    addBtn: "Add Rate",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by product, category, product type or unit…",
    productItem: "Product",
    productItemLabel: "Product",
    selectProduct: "Select product…",
    category: "Category",
    categoryLabel: "Category",
    selectCategory: "Select category…",
    type: "Product Type",
    typeLabel: "Product Type",
    selectType: "Select product type…",
    unit: "Unit",
    unitLabel: "Unit",
    selectUnit: "Select unit…",
    retailRate: "Retail Rate",
    wholesaleRate: "Wholesale Rate",
    distributorRate: "Distributor Rate",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    noRecords: "No rates found.",
    actions: "Actions",
    loading: "Loading rates...",
    productRequired: "Product is required.",
    categoryRequired: "Category is required.",
    typeRequired: "Product type is required.",
    successSave: "Rate saved successfully!",
    successDelete: "Rate deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this rate?",
    addPriceRow: "Add Price Row",
    removePriceRow: "Remove",
    priceGroup: "Price Set",
    atLeastOnePrice: "At least one price row is required.",
    saveError: "Error saving record!",
    deleteError: "Error deleting record!",
    fetchError: "Failed to load rates.",
    totalProducts: "Total Records",
    totalPriceSets: "Total Price Sets",
    all: "All",
    toggleLang: "اردو",
    translating: "Translating to Urdu…",
    downloadPdf: "Download PDF",
    companyName: "Ali Cages",
    reportTitle: "Rate List Report",
    generated: "Generated",
    totalLabel: "Total",
    recordsLabel: "records",
  },
  ur: {
    title: "ریٹ لسٹ",
    subtitle: "مصنوعات کی قیمتوں اور ریٹس کا انتظام کریں",
    addBtn: "ریٹ شامل کریں",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "پروڈکٹ، کیٹگری، ٹائپ یا یونٹ سے تلاش کریں…",
    productItem: "پروڈکٹ",
    productItemLabel: "پروڈکٹ",
    selectProduct: "پروڈکٹ منتخب کریں…",
    category: "کیٹگری",
    categoryLabel: "کیٹگری",
    selectCategory: "کیٹگری منتخب کریں…",
    type: "پروڈکٹ ٹائپ",
    typeLabel: "پروڈکٹ ٹائپ",
    selectType: "پروڈکٹ ٹائپ منتخب کریں…",
    unit: "یونٹ",
    unitLabel: "یونٹ",
    selectUnit: "یونٹ منتخب کریں…",
    retailRate: "ریٹیل ریٹ",
    wholesaleRate: "ہول سیل ریٹ",
    distributorRate: "ڈسٹری بیوٹر ریٹ",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    noRecords: "کوئی ریٹ نہیں ملا۔",
    actions: "اقدامات",
    loading: "ریٹس لوڈ ہو رہے ہیں...",
    productRequired: "پروڈکٹ ضروری ہے۔",
    categoryRequired: "کیٹگری ضروری ہے۔",
    typeRequired: "پروڈکٹ ٹائپ ضروری ہے۔",
    successSave: "ریٹ محفوظ ہو گیا!",
    successDelete: "ریٹ حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی یہ ریٹ حذف کرنا چاہتے ہیں؟",
    addPriceRow: "قیمت کی قطار شامل کریں",
    removePriceRow: "ہٹائیں",
    priceGroup: "قیمت سیٹ",
    atLeastOnePrice: "کم از کم ایک قیمت کی قطار ضروری ہے۔",
    saveError: "ریکارڈ محفوظ کرنے میں خرابی!",
    deleteError: "ریکارڈ حذف کرنے میں خرابی!",
    fetchError: "ریٹس لوڈ نہیں ہو سکے۔",
    totalProducts: "کل ریکارڈز",
    totalPriceSets: "کل قیمت سیٹس",
    all: "سب",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    downloadPdf: "پی ڈی ایف ڈاؤنلوڈ",
    companyName: "علی کیجز",
    reportTitle: "ریٹ لسٹ رپورٹ",
    generated: "تیار کردہ",
    totalLabel: "کل",
    recordsLabel: "ریکارڈز",
  },
};

const emptyPriceRow = () => ({
  category_id: "",
  product_type_id: "",
  unit_id: "",
  retail_rate: "",
  wholesale_rate: "",
  distributor_rate: "",
});

const normalizePriceOptions = (record) => {
  if (Array.isArray(record?.price_options) && record.price_options.length) {
    return record.price_options.map((p) => ({
      category_id: p?.category_id || record?.category_id || "",
      product_type_id: p?.product_type_id || record?.product_type_id || "",
      unit_id: p?.unit_id || "",
      retail_rate: p?.retail_rate ?? "",
      wholesale_rate: p?.wholesale_rate ?? "",
      distributor_rate: p?.distributor_rate ?? "",
    }));
  }
  return [emptyPriceRow()];
};

const fmt = (v) => Number(v || 0).toLocaleString("en-PK");

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL PDF — Rate List
// ─────────────────────────────────────────────────────────────────────────────
function downloadRatePdf(filteredRates, lang, maps, urduCache) {
  const t = LANG[lang];
  const { productMap, categoryMap, productTypeMap, unitMap } = maps;
  const isUrdu = lang === "ur";

  const getName = (map, key, id) =>
    isUrdu ? urduCache[`${key}:${id}`] || map[id] || `#${id}` : map[id] || `#${id}`;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Palette ──
  const C = {
    brand:      [14,  90, 168],
    brandDark:  [7,   55, 110],
    brandLight: [224, 242, 254],
    brandMid:   [56, 143, 220],
    emerald:    [5,  150, 105],
    emeraldBg:  [236, 253, 245],
    violet:     [109, 40, 217],
    violetBg:   [245, 243, 255],
    amber:      [180,  83,   9],
    amberBg:    [255, 251, 235],
    white:      [255, 255, 255],
    slate50:    [248, 250, 252],
    slate100:   [241, 245, 249],
    slate200:   [226, 232, 240],
    slate400:   [148, 163, 184],
    slate600:   [71,  85, 105],
    slate900:   [15,  23,  42],
  };

  const fill   = (rgb) => doc.setFillColor(...rgb);
  const text   = (rgb) => doc.setTextColor(...rgb);
  const font   = (style, size) => { doc.setFont("helvetica", style); doc.setFontSize(size); };
  const rect   = (x, y, w, h, r = 0, mode = "F") =>
    r > 0 ? doc.roundedRect(x, y, w, h, r, r, mode) : doc.rect(x, y, w, h, mode);

  // Totals
  const totalRecords   = filteredRates.length;
  const totalPriceSets = filteredRates.reduce((s, r) => s + normalizePriceOptions(r).length, 0);
  const dateStr = new Date().toLocaleString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // ── Header Band ──
  fill(C.brand);
  rect(0, 0, W, 38, 0, "F");

  // diagonal accent
  fill(C.brandMid);
  doc.triangle(W - 60, 0, W, 0, W, 38, "F");
  fill([255, 255, 255]);
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  doc.triangle(W - 30, 0, W, 0, W, 18, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo circle
  fill(C.white);
  doc.circle(18, 19, 10, "F");
  fill(C.brand);
  doc.circle(18, 19, 8, "F");
  font("bold", 9);
  text(C.white);
  doc.text("AC", 18, 19.5, { align: "center", baseline: "middle" });

  // Title
  font("bold", 18);
  text(C.white);
  doc.text(t.companyName, 33, 15);
  font("normal", 9);
  text([180, 215, 248]);
  doc.text(t.reportTitle, 33, 23);

  // Date
  font("normal", 8);
  text([180, 215, 248]);
  doc.text(`${t.generated}: ${dateStr}`, W - 68, 20, { align: "left" });

  // Accent line
  fill(C.brandMid);
  rect(0, 38, W, 1.5, 0, "F");

  // ── Stats Cards ──
  const cardY = 44;
  const cardH = 28;
  const cardW = (W - 20 - 8) / 3;
  const gap   = 4;

  const cards = [
    { label: t.totalProducts,  value: String(totalRecords),   icon: "RATE", fillBg: C.brandLight, iconFill: C.brand,    valColor: C.brandDark },
    { label: t.totalPriceSets, value: String(totalPriceSets), icon: "SETS", fillBg: C.emeraldBg,  iconFill: C.emerald,  valColor: C.emerald   },
    { label: t.type,           value: "Retail / WS / Dist.",  icon: "PKR",  fillBg: C.violetBg,   iconFill: C.violet,   valColor: C.violet    },
  ];

  cards.forEach((card, i) => {
    const cx = 8 + i * (cardW + gap);
    fill(card.fillBg);
    doc.setDrawColor(...card.iconFill);
    doc.setLineWidth(0.4);
    rect(cx, cardY, cardW, cardH, 3, "FD");

    // left accent bar
    fill(card.iconFill);
    rect(cx, cardY, 3, cardH, 0, "F");

    // icon pill
    fill(card.iconFill);
    rect(cx + cardW - 18, cardY + 4, 14, 7, 2, "F");
    font("bold", 5.5);
    text(C.white);
    doc.text(card.icon, cx + cardW - 11, cardY + 8.5, { align: "center" });

    font("normal", 7.5);
    text(C.slate600);
    doc.text(card.label, cx + 7, cardY + 9);

    font("bold", 11);
    text(card.valColor);
    doc.text(card.value, cx + 7, cardY + 21);
  });

  // ── Section Label ──
  const sectionY = cardY + cardH + 5;
  fill(C.slate100);
  rect(8, sectionY, W - 16, 7, 2, "F");
  font("bold", 7.5);
  text(C.slate600);
  doc.text("RATE RECORDS", 14, sectionY + 5);
  font("normal", 7);
  text(C.slate400);
  doc.text(`${totalRecords} ${t.recordsLabel}  •  ${totalPriceSets} ${t.totalPriceSets}`, W - 14, sectionY + 5, { align: "right" });

  // ── Build table rows (one row per price_option) ──
  const rows = [];
  let srNo = 1;
  filteredRates.forEach((r) => {
    const priceOptions = normalizePriceOptions(r);
    const productName  = getName(productMap, "product", r.product_id);
    priceOptions.forEach((p, pIdx) => {
      rows.push([
        pIdx === 0 ? srNo : "",                      // Sr# only on first sub-row
        pIdx === 0 ? productName : "",               // product name only once
        getName(categoryMap,    "category", p.category_id),
        getName(productTypeMap, "type",     p.product_type_id),
        getName(unitMap,        "unit",     p.unit_id),
        "PKR " + fmt(p.retail_rate),
        "PKR " + fmt(p.wholesale_rate),
        "PKR " + fmt(p.distributor_rate),
        pIdx,  // used in didDrawCell for styling
      ]);
    });
    srNo++;
  });

  autoTable(doc, {
    startY: sectionY + 9,
    margin: { left: 8, right: 8 },
    head: [[
      "#",
      t.productItem,
      t.category,
      t.type,
      t.unit,
      t.retailRate,
      t.wholesaleRate,
      t.distributorRate,
    ]],
    body: rows.map((r) => r.slice(0, 8)),   // strip internal pIdx before render
    theme: "plain",

    headStyles: {
      fillColor: C.brandDark,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },

    bodyStyles: {
      textColor: C.slate900,
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      valign: "middle",
      lineColor: C.slate200,
      lineWidth: 0.1,
    },

    alternateRowStyles: { fillColor: C.slate50 },

    columnStyles: {
      0: { halign: "center", cellWidth: 10,  fontStyle: "bold",  textColor: C.brand },
      1: { halign: "left",   cellWidth: 50,  fontStyle: "bold" },
      2: { halign: "left",   cellWidth: 38 },
      3: { halign: "left",   cellWidth: 38 },
      4: { halign: "center", cellWidth: 22 },
      5: { halign: "right",  cellWidth: 38,  fontStyle: "bold",  textColor: C.emerald },
      6: { halign: "right",  cellWidth: 38,  fontStyle: "bold",  textColor: C.violet  },
      7: { halign: "right",  cellWidth: 38,  fontStyle: "bold",  textColor: C.amber   },
    },

    didDrawCell(data) {
      // Blue left accent bar on col 0 rows
      if (data.section === "body" && data.column.index === 0) {
        fill(C.brand);
        doc.rect(data.cell.x, data.cell.y, 1.2, data.cell.height, "F");
      }
    },

    didDrawPage() {
      const pg    = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();

      // Footer strip
      fill(C.brandDark);
      rect(0, H - 10, W, 10, 0, "F");
      font("normal", 7);
      text([180, 215, 248]);
      doc.text(`${t.companyName} — ${t.reportTitle}`, 10, H - 4);
      doc.text(`Page ${pg} / ${total}`, W - 10, H - 4, { align: "right" });

      // Compact header on continuation pages
      if (pg > 1) {
        fill(C.brand);
        rect(0, 0, W, 12, 0, "F");
        font("bold", 9);
        text(C.white);
        doc.text(`${t.companyName} — ${t.reportTitle}`, W / 2, 8, { align: "center" });
      }
    },
  });

  // ── Watermark on every page ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    font("bold", 55);
    text(C.brand);
    doc.text(t.companyName.toUpperCase(), W / 2, H / 2, {
      align: "center", angle: 30, baseline: "middle",
    });
    doc.restoreGraphicsState();
  }

  doc.save(`rate-list-${new Date().toISOString().slice(0, 10)}.pdf`);
}
// ─────────────────────────────────────────────────────────────────────────────

const RateListPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [rates, setRates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [urduCache, setUrduCache] = useState({});
  const [translating, setTranslating] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    price_options: [emptyPriceRow()],
  });

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const getList = (data) => (Array.isArray(data) ? data : data?.data || []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [ratesData, catsData, unitsData, productsData, typesData] = await Promise.all([
        fetchAllRates(),
        fetchCategories(),
        fetchUnits(),
        fetchProducts(),
        fetchTypes(),
      ]);
      setRates(getList(ratesData));
      setCategories(getList(catsData));
      setUnits(getList(unitsData));
      setProducts(getList(productsData));
      setTypes(getList(typesData));
    } catch (err) {
      showToast("error", err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = p.name || p.name_en || p.product_name || p.product_item_en || `#${p.id}`;
    });
    return map;
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name || c.name_en || c.category_name || `#${c.id}`;
    });
    return map;
  }, [categories]);

  const productTypeMap = useMemo(() => {
    const map = {};
    types.forEach((x) => {
      map[x.id] = x.product_type_en || x.name || x.name_en || x.type_name || `#${x.id}`;
    });
    return map;
  }, [types]);

  const unitMap = useMemo(() => {
    const map = {};
    units.forEach((u) => {
      map[u.id] = u.name || u.name_en || u.unit_name || `#${u.id}`;
    });
    return map;
  }, [units]);

  const getProductName = (id) =>
    isUrdu ? urduCache[`product:${id}`] || productMap[id] || `#${id}` : productMap[id] || `#${id}`;
  const getCategoryName = (id) =>
    isUrdu ? urduCache[`category:${id}`] || categoryMap[id] || `#${id}` : categoryMap[id] || `#${id}`;
  const getTypeName = (id) =>
    isUrdu ? urduCache[`type:${id}`] || productTypeMap[id] || `#${id}` : productTypeMap[id] || `#${id}`;
  const getUnitName = (id) =>
    isUrdu ? urduCache[`unit:${id}`] || unitMap[id] || `#${id}` : unitMap[id] || `#${id}`;

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur") return;

    const toTranslate = [];
    products.forEach((p) => {
      const name = p.name || p.name_en || p.product_name || p.product_item_en || "";
      if (name && !urduCache[`product:${p.id}`]) toTranslate.push({ key: `product:${p.id}`, text: name });
    });
    categories.forEach((c) => {
      const name = c.name || c.name_en || c.category_name || "";
      if (name && !urduCache[`category:${c.id}`]) toTranslate.push({ key: `category:${c.id}`, text: name });
    });
    types.forEach((x) => {
      const name = x.product_type_en || x.name || x.name_en || x.type_name || "";
      if (name && !urduCache[`type:${x.id}`]) toTranslate.push({ key: `type:${x.id}`, text: name });
    });
    units.forEach((u) => {
      const name = u.name || u.name_en || u.unit_name || "";
      if (name && !urduCache[`unit:${u.id}`]) toTranslate.push({ key: `unit:${u.id}`, text: name });
    });

    if (toTranslate.length === 0) return;
    setTranslating(true);
    try {
      const results = await Promise.all(
        toTranslate.map(async ({ key, text }) => ({
          key, translated: await translateText(text),
        }))
      );
      setUrduCache((prev) => {
        const next = { ...prev };
        results.forEach(({ key, translated }) => { next[key] = translated; });
        return next;
      });
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  };

  const openAdd = () => {
    setForm({ product_id: "", price_options: [emptyPriceRow()] });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({ product_id: r.product_id || "", price_options: normalizePriceOptions(r) });
    setEditingId(r.id);
    setShowForm(true);
  };

  const updatePriceRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      price_options: prev.price_options.map((row, i) =>
        i === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addPriceRow = () =>
    setForm((prev) => ({ ...prev, price_options: [...prev.price_options, emptyPriceRow()] }));

  const removePriceRow = (index) => {
    setForm((prev) => {
      if (prev.price_options.length === 1) return prev;
      return { ...prev, price_options: prev.price_options.filter((_, i) => i !== index) };
    });
  };

  const handleSave = async () => {
    if (!form.product_id) { showToast("error", t.productRequired); return; }

    const cleanedOptions = form.price_options
      .map((row) => ({
        category_id: Number(row.category_id) || 0,
        product_type_id: Number(row.product_type_id) || 0,
        unit_id: Number(row.unit_id) || 0,
        retail_rate: Number(row.retail_rate) || 0,
        wholesale_rate: Number(row.wholesale_rate) || 0,
        distributor_rate: Number(row.distributor_rate) || 0,
      }))
      .filter(
        (row) =>
          row.category_id > 0 || row.product_type_id > 0 || row.unit_id > 0 ||
          row.retail_rate > 0 || row.wholesale_rate > 0 || row.distributor_rate > 0
      );

    if (!cleanedOptions.length) { showToast("error", t.atLeastOnePrice); return; }
    if (cleanedOptions.some((row) => !row.category_id)) { showToast("error", t.categoryRequired); return; }
    if (cleanedOptions.some((row) => !row.product_type_id)) { showToast("error", t.typeRequired); return; }

    const payload = { product_id: Number(form.product_id), price_options: cleanedOptions };

    try {
      setSubmitting(true);
      if (editingId) {
        const res = await updateRate(editingId, payload);
        const updated = res?.data || res;
        setRates((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      } else {
        const res = await createRate(payload);
        const created = res?.data || res;
        setRates((prev) => [created, ...prev]);
      }
      showToast("success", t.successSave);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      showToast("error", err.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteRate(id);
      setRates((prev) => prev.filter((r) => r.id !== id));
      showToast("success", t.successDelete);
    } catch (err) {
      showToast("error", err.message || t.deleteError);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rates.filter((r) => {
      const priceOptions = normalizePriceOptions(r);
      const rowCategoryIds = [
        ...new Set(priceOptions.map((p) => p.category_id || r.category_id).filter(Boolean).map(String)),
      ];
      const matchCat = !filterCategory || rowCategoryIds.includes(String(filterCategory));
      if (!matchCat) return false;
      if (!q) return true;
      return (
        String(productMap[r.product_id] || "").toLowerCase().includes(q) ||
        String(urduCache[`product:${r.product_id}`] || "").toLowerCase().includes(q) ||
        priceOptions.some((p) =>
          String(categoryMap[p.category_id] || "").toLowerCase().includes(q) ||
          String(urduCache[`category:${p.category_id}`] || "").toLowerCase().includes(q) ||
          String(productTypeMap[p.product_type_id] || "").toLowerCase().includes(q) ||
          String(urduCache[`type:${p.product_type_id}`] || "").toLowerCase().includes(q) ||
          String(unitMap[p.unit_id] || "").toLowerCase().includes(q) ||
          String(urduCache[`unit:${p.unit_id}`] || "").toLowerCase().includes(q)
        )
      );
    });
  }, [rates, search, filterCategory, productMap, categoryMap, productTypeMap, unitMap, urduCache]);

  const summary = useMemo(
    () => ({
      total: rates.length,
      totalPriceSets: rates.reduce((sum, r) => sum + normalizePriceOptions(r).length, 0),
    }),
    [rates]
  );

  const usedCategories = useMemo(() => {
    const ids = new Set();
    rates.forEach((r) => { normalizePriceOptions(r).forEach((p) => { if (p.category_id) ids.add(p.category_id); }); });
    return [...ids];
  }, [rates]);

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
              <button
                onClick={handleLangToggle}
                disabled={translating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i className={`bi ${translating ? "bi-arrow-repeat animate-spin" : "bi-translate"}`}></i>
                {t.toggleLang}
              </button>

              <button
                onClick={() => setShowSummary((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${showSummary ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`}
              >
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>

              <button
                onClick={() =>
                  downloadRatePdf(filtered, lang, { productMap, categoryMap, productTypeMap, unitMap }, urduCache)
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm"
              >
                <i className="bi bi-file-earmark-pdf-fill"></i>
                {t.downloadPdf}
              </button>

              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200"
              >
                <i className="bi bi-plus-circle-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-sky-100">
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <p className="text-xs text-slate-500 mb-1">{t.totalProducts}</p>
                <p className="text-3xl font-extrabold text-slate-950">{summary.total}</p>
              </div>
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <p className="text-xs text-slate-500 mb-1">{t.totalPriceSets}</p>
                <p className="text-3xl font-extrabold text-slate-950">{summary.totalPriceSets}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-4" : "left-4"}`}></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border border-sky-100 rounded-2xl py-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"}`}
            />
          </div>

          <div className={`flex flex-wrap gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => setFilterCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${!filterCategory ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-sky-100 hover:bg-sky-50"}`}
            >
              {t.all}
            </button>
            {usedCategories.map((catId) => (
              <button
                key={catId}
                onClick={() => setFilterCategory(filterCategory === catId ? "" : catId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${String(filterCategory) === String(catId) ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-sky-100 hover:bg-sky-50"}`}
              >
                <span className={translating ? "opacity-40" : ""}>{getCategoryName(catId)}</span>
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto" dir={dir}>
              <div className="flex items-center gap-3 mb-5 border-b border-sky-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <i className="bi bi-tags-fill text-sky-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold text-slate-500 mb-1.5 ${isUrdu ? "text-right" : ""}`}>
                    {t.productItemLabel} *
                  </label>
                  <select
                    value={form.product_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
                    className={`w-full border border-sky-100 rounded-2xl py-3 px-4 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "text-right" : ""}`}
                  >
                    <option value="">{t.selectProduct}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.name_en || p.product_name || p.product_item_en || `#${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {form.price_options.map((row, index) => (
                    <div key={index} className="border border-sky-100 rounded-2xl p-4 bg-sky-50/40 space-y-3">
                      <div className={`flex items-center justify-between gap-3 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                        <h3 className="text-sm font-bold text-slate-700">{t.priceGroup} {index + 1}</h3>
                        {form.price_options.length > 1 && (
                          <button type="button" onClick={() => removePriceRow(index)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition">
                            <i className="bi bi-trash3-fill"></i>
                            {t.removePriceRow}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          ["category_id", t.categoryLabel, categories, (c) => c.name || c.name_en || c.category_name || `#${c.id}`, t.selectCategory],
                          ["product_type_id", t.typeLabel, types, (x) => x.product_type_en || x.name || x.name_en || x.type_name || `#${x.id}`, t.selectType],
                          ["unit_id", t.unitLabel, units, (u) => u.name || u.name_en || u.unit_name || `#${u.id}`, t.selectUnit],
                        ].map(([key, label, list, labelFn, placeholder]) => (
                          <div key={key}>
                            <label className={`block text-xs font-semibold text-slate-500 mb-1 ${isUrdu ? "text-right" : ""}`}>{label}</label>
                            <select
                              value={row[key]}
                              onChange={(e) => updatePriceRow(index, key, e.target.value)}
                              className={`w-full border border-sky-100 rounded-2xl py-2.5 px-4 text-sm text-slate-700 bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "text-right" : ""}`}
                            >
                              <option value="">{placeholder}</option>
                              {list.map((item) => (
                                <option key={item.id} value={item.id}>{labelFn(item)}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          ["retail_rate", t.retailRate],
                          ["wholesale_rate", t.wholesaleRate],
                          ["distributor_rate", t.distributorRate],
                        ].map(([key, label]) => (
                          <div key={key}>
                            <label className={`block text-xs font-semibold text-slate-500 mb-1 ${isUrdu ? "text-right" : ""}`}>{label}</label>
                            <input
                              type="number"
                              value={row[key]}
                              onChange={(e) => updatePriceRow(index, key, e.target.value)}
                              className={`w-full border border-sky-100 rounded-2xl py-2.5 px-3 text-sm text-slate-700 bg-white font-mono focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "text-right" : ""}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="w-full border border-dashed border-sky-300 text-sky-700 py-3 rounded-2xl text-sm font-semibold hover:bg-sky-50 transition flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-plus-circle"></i>
                    {t.addPriceRow}
                  </button>
                </div>
              </div>

              <div className={`flex gap-3 mt-6 pt-4 border-t border-sky-100 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button onClick={handleSave} disabled={submitting} className="flex-1 bg-sky-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-sky-700 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
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

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100">
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.productItem}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                  <th className="px-5 py-4 text-center">{t.unit}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>{t.retailRate}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>{t.wholesaleRate}</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>{t.distributorRate}</th>
                  <th className="px-5 py-4 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2">{t.loading}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">{t.noRecords}</td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const priceOptions = normalizePriceOptions(r);
                    return (
                      <tr key={r.id} className="hover:bg-sky-50/70 transition align-top">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className={`px-5 py-4 font-bold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                          <span className={translating ? "opacity-40" : ""}>{getProductName(r.product_id)}</span>
                        </td>
                        <td className={`px-5 py-4 font-semibold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                          <div className="space-y-1.5">
                            {priceOptions.map((p, idx) => (
                              <div key={idx}>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200 ${translating ? "opacity-40" : ""}`}>
                                  {getCategoryName(p.category_id)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className={`px-5 py-4 font-semibold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                          <div className="space-y-1.5">
                            {priceOptions.map((p, idx) => (
                              <div key={idx}>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200 ${translating ? "opacity-40" : ""}`}>
                                  {getTypeName(p.product_type_id)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="space-y-1.5">
                            {priceOptions.map((p, idx) => (
                              <div key={idx}>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-950 border border-slate-200 ${translating ? "opacity-40" : ""}`}>
                                  {getUnitName(p.unit_id)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>
                          <div className="space-y-1.5">
                            {priceOptions.map((p, idx) => (
                              <div key={idx}>
                                <span className="inline-flex font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded">{fmt(p.retail_rate)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>
                          <div className="space-y-1.5">
                            {priceOptions.map((p, idx) => (
                              <div key={idx}>
                                <span className="inline-flex font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded">{fmt(p.wholesale_rate)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className={`px-5 py-4 ${isUrdu ? "text-left" : "text-right"}`}>
                          <div className="space-y-1.5">
                            {priceOptions.map((p, idx) => (
                              <div key={idx}>
                                <span className="inline-flex font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded">{fmt(p.distributor_rate)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                            <button onClick={() => openEdit(r)} className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center" title={t.edit}>
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 transition flex items-center justify-center" title={t.delete}>
                              <i className="bi bi-trash3-fill"></i>
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

export default RateListPage;