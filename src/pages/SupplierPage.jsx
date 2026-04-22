import React, { useState, useEffect, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// API CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
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

const fetchAllSuppliers = () => apiFetch("/api/suppliers");
const createSupplier = (data) =>
  apiFetch("/api/suppliers", { method: "POST", body: JSON.stringify(data) });
const updateSupplier = (id, data) =>
  apiFetch(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) });
const deleteSupplier = (id) =>
  apiFetch(`/api/suppliers/${id}`, { method: "DELETE" });

// ── MyMemory translation ──────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// i18n
// ═══════════════════════════════════════════════════════════════════════════════
const LANG = {
  en: {
    title: "Supplier Management",
    subtitle: "Manage your suppliers",
    addBtn: "Add Supplier",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by supplier name or phone…",
    supplierName: "Supplier Name",
    supplierNameLabel: "Supplier Name",
    phone: "Phone No",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No suppliers found.",
    toggleLang: "اردو",
    translating: "Translating to Urdu…",
    loading: "Loading suppliers...",
    fetchError: "Failed to load suppliers.",
    saveError: "Failed to save supplier.",
    deleteError: "Failed to delete supplier.",
    successSave: "Supplier saved successfully!",
    successDelete: "Supplier deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this supplier?",
    errorMsg: "Supplier name is required.",
    totalSuppliers: "Total Suppliers",
    supplierPlaceholder: "e.g. Ali Traders",
    phonePlaceholder: "03XX-XXXXXXX",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Suppliers List",
    printedOn: "Printed On",
  },
  ur: {
    title: "سپلائر مینجمنٹ",
    subtitle: "اپنے سپلائرز کا انتظام کریں",
    addBtn: "سپلائر شامل کریں",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "سپلائر نام یا فون سے تلاش کریں…",
    supplierName: "سپلائر کا نام",
    supplierNameLabel: "سپلائر کا نام",
    phone: "فون نمبر",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کوئی سپلائر نہیں ملا۔",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    loading: "سپلائرز لوڈ ہو رہے ہیں...",
    fetchError: "سپلائرز لوڈ نہیں ہو سکے۔",
    saveError: "سپلائر محفوظ نہیں ہو سکا۔",
    deleteError: "سپلائر حذف نہیں ہو سکا۔",
    successSave: "سپلائر کامیابی سے محفوظ ہو گیا!",
    successDelete: "سپلائر حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی اس سپلائر کو حذف کرنا چاہتے ہیں؟",
    errorMsg: "سپلائر کا نام ضروری ہے۔",
    totalSuppliers: "کل سپلائرز",
    supplierPlaceholder: "مثلاً Ali Traders",
    phonePlaceholder: "03XX-XXXXXXX",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "سپلائرز کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════
const getSupplierName = (s, isUrdu, cache) =>
  isUrdu ? cache[`name:${s.id}`] || s.supplier_name || "—" : s.supplier_name || "—";

// ── Print / PDF ───────────────────────────────────────────────────────────────
function generatePrintDocument(suppliers, lang, urduCache, isPdf = false) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const font = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const rowsHtml = suppliers
    .map((s, i) => {
      const nameDisplay = getSupplierName(s, isUrdu, urduCache);
      return `
      <tr>
        <td style="font-weight:bold;">${i + 1}</td>
        <td style="font-weight:bold;">${nameDisplay}</td>
        <td style="font-family:monospace;">${s.phone || "—"}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>${t.title}</title>
${
  isUrdu
    ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600&display=swap" rel="stylesheet">`
    : ""
}
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:${font};background:#fff;color:#0f172a;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1e40af;padding-bottom:20px;margin-bottom:30px;}
  .brand{font-size:26px;font-weight:bold;color:#1e40af;text-transform:uppercase;letter-spacing:1px;}
  .report-title{font-size:16px;color:#64748b;margin-top:5px;}
  .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:#64748b;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{background:#1e40af;color:#fff;text-align:${isUrdu ? "right" : "left"};padding:10px 12px;font-weight:600;}
  td{border-bottom:1px solid #e2e8f0;padding:10px 12px;color:#334155;vertical-align:middle;}
  tr:nth-child(even) td{background:#f8fafc;}
  .print-instruct{background:#eff6ff;color:#1d4ed8;padding:14px;text-align:center;border-radius:8px;margin-bottom:20px;font-size:13px;border:1px solid #bfdbfe;}
  @media print{body{padding:0;}.print-instruct{display:none;}}
</style>
</head>
<body>
${isPdf ? `<div class="print-instruct">Select <strong>"Save as PDF"</strong> in destination to download.</div>` : ""}
<div class="header">
  <div>
    <div class="brand">Ali Cage</div>
    <div class="report-title">${t.reportHeader}</div>
  </div>
  <div class="meta">${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
</div>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>${t.supplierName}</th>
      <th>${t.phone}</th>
    </tr>
  </thead>
  <tbody>
    ${
      suppliers.length > 0
        ? rowsHtml
        : `<tr><td colspan="3" style="text-align:center;">${t.noRecords}</td></tr>`
    }
  </tbody>
</table>
<script>
window.onload=()=>{setTimeout(()=>{window.print();${
    !isPdf ? "window.onafterprint=()=>window.close();" : ""
  }},300);};
</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const SupplierPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [urduCache, setUrduCache] = useState({});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    supplier_name: "",
    phone: "",
  });

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllSuppliers();
      setSuppliers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      showToast("error", err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // ── Language toggle ───────────────────────────────────────────────────────
  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur" || suppliers.length === 0) return;

    const untranslated = suppliers.filter((s) => !urduCache[`name:${s.id}`]);
    if (!untranslated.length) return;

    setTranslating(true);
    try {
      const results = await Promise.all(
        untranslated.map(async (s) => {
          const nameUr = await translateText(s.supplier_name);
          return { id: s.id, nameUr };
        })
      );

      setUrduCache((prev) => {
        const next = { ...prev };
        results.forEach(({ id, nameUr }) => {
          next[`name:${id}`] = nameUr;
        });
        return next;
      });
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ supplier_name: "", phone: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      supplier_name: s.supplier_name || "",
      phone: s.phone || "",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.supplier_name.trim()) {
      showToast("error", t.errorMsg);
      return;
    }

    const payload = {
      supplier_name: form.supplier_name.trim(),
      phone: form.phone.trim(),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await updateSupplier(editingId, payload);
        const updated = res?.data || res;

        setSuppliers((prev) => prev.map((s) => (s.id === editingId ? updated : s)));

        setUrduCache((prev) => {
          const next = { ...prev };
          delete next[`name:${editingId}`];
          return next;
        });
      } else {
        const res = await createSupplier(payload);
        const created = res?.data || res;
        setSuppliers((prev) => [created, ...prev]);
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

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setUrduCache((prev) => {
        const next = { ...prev };
        delete next[`name:${id}`];
        return next;
      });
      showToast("success", t.successDelete);
    } catch (err) {
      showToast("error", err.message || t.deleteError);
    }
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;

    return suppliers.filter(
      (s) =>
        (s.supplier_name || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (urduCache[`name:${s.id}`] || "").toLowerCase().includes(q)
    );
  }, [suppliers, search, urduCache]);

  const summary = useMemo(
    () => ({
      totalSuppliers: suppliers.length,
    }),
    [suppliers]
  );

  // ── Render ────────────────────────────────────────────────────────────────
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

      {/* Toast */}
      {message.text && (
        <div
          className={`fixed bottom-6 ${
            isUrdu ? "left-6" : "right-6"
          } z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${
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

      {/* Translating indicator */}
      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                {t.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleLangToggle}
                disabled={translating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i
                  className={`bi ${
                    translating ? "bi-arrow-repeat animate-spin" : "bi-translate"
                  }`}
                ></i>
                {t.toggleLang}
              </button>

              <button
                onClick={() => setShowSummary((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                  showSummary
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
              >
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>

              <button
                onClick={() => generatePrintDocument(filtered, lang, urduCache, false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm"
              >
                <i className="bi bi-printer text-sky-600"></i>
                {t.printBtn}
              </button>

              <button
                onClick={() => generatePrintDocument(filtered, lang, urduCache, true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm"
              >
                <i className="bi bi-file-earmark-pdf text-red-500"></i>
                {t.pdfBtn}
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
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-5 pt-5 border-t border-sky-100">
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <p className="text-xs text-slate-500 mb-1">{t.totalSuppliers}</p>
                <p className="text-3xl font-extrabold text-slate-800">
                  {summary.totalSuppliers}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <i
            className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
              isUrdu ? "right-4" : "left-4"
            }`}
          ></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full border border-sky-100 rounded-2xl py-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${
              isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"
            }`}
          />
        </div>

        {/* ── Add / Edit Modal ── */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
              dir={dir}
            >
              <div className="flex items-center gap-3 mb-5 border-b border-sky-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <i className="bi bi-person-lines-fill text-sky-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {editingId ? t.edit : t.addBtn}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    {t.supplierNameLabel} *
                  </label>
                  <div className="relative">
                    <i
                      className={`bi bi-person absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                        isUrdu ? "right-3" : "left-3"
                      }`}
                    ></i>
                    <input
                      type="text"
                      value={form.supplier_name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, supplier_name: e.target.value }))
                      }
                      placeholder={t.supplierPlaceholder}
                      className={`w-full border border-sky-100 rounded-2xl py-3 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                        isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    {t.phone}
                  </label>
                  <div className="relative">
                    <i
                      className={`bi bi-telephone absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                        isUrdu ? "right-3" : "left-3"
                      }`}
                    ></i>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder={t.phonePlaceholder}
                      className={`w-full border border-sky-100 rounded-2xl py-3 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 font-mono ${
                        isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`flex gap-3 mt-6 pt-4 border-t border-sky-100 ${
                  isUrdu ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-sky-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-sky-700 transition shadow-lg shadow-sky-200 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                  {submitting ? t.saving : t.save}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 bg-white border border-sky-200 text-sky-700 py-3 rounded-2xl font-semibold text-sm hover:bg-sky-50 transition disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100">
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"} w-12`}>
                    #
                  </th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>
                    {t.supplierName}
                  </th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>
                    {t.phone}
                  </th>
                  <th className="px-5 py-4 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2">{t.loading}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id} className="hover:bg-sky-50/70 transition align-top">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>

                      <td className="px-5 py-4">
                        <div
                          className={`flex items-center gap-2.5 ${
                            isUrdu ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <i className="bi bi-person-fill text-sky-600"></i>
                          </div>
                          <span
                            className={`font-semibold text-slate-800 ${
                              translating ? "opacity-40" : ""
                            }`}
                          >
                            {getSupplierName(s, isUrdu, urduCache)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {s.phone || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className={`flex items-center justify-center gap-1.5 ${
                            isUrdu ? "flex-row-reverse" : ""
                          }`}
                        >
                          <button
                            onClick={() => openEdit(s)}
                            className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center"
                            title={t.edit}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            onClick={() => handleDelete(s.id)}
                            className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition flex items-center justify-center"
                            title={t.delete}
                          >
                            <i className="bi bi-trash3-fill"></i>
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

export default SupplierPage;