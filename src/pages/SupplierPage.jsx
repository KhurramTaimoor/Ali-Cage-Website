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

    if (!translated || translated.toLowerCase() === text.trim().toLowerCase()) {
      return text;
    }

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
    summaryBtn: "Summary",
    searchPlaceholder: "Search supplier name or phone...",
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
    translating: "Translating to Urdu...",
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
    formTitleAdd: "New Supplier",
    formTitleEdit: "Edit Supplier",
    formSubtitle: "Supplier name and phone information",
  },
  ur: {
    title: "سپلائر مینجمنٹ",
    subtitle: "اپنے سپلائرز کا انتظام کریں",
    addBtn: "سپلائر شامل کریں",
    summaryBtn: "سمری",
    searchPlaceholder: "سپلائر نام یا فون سے تلاش کریں...",
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
    translating: "اردو میں ترجمہ ہو رہا ہے...",
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
    formTitleAdd: "نیا سپلائر",
    formTitleEdit: "سپلائر ترمیم",
    formSubtitle: "سپلائر نام اور فون معلومات",
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
    : "'Inter', Arial, sans-serif";

  const rowsHtml = suppliers
    .map((s, i) => {
      const nameDisplay = getSupplierName(s, isUrdu, urduCache);
      return `
      <tr>
        <td class="center">${i + 1}</td>
        <td class="strong">${nameDisplay}</td>
        <td class="mono">${s.phone || "—"}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>${t.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:${font};background:#f8fafc;color:#0f172a;padding:20px;}
  .page{width:100%;min-height:100vh;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 45%,#f8fafc 100%);padding:20px;}
  .sheet{max-width:1100px;margin:0 auto;background:#fff;border:1px solid #dbeafe;box-shadow:0 12px 40px rgba(15,23,42,.08);border-radius:24px;overflow:hidden;}
  .header{background:linear-gradient(135deg,#0f4c97 0%,#155eaf 65%,#3b82f6 100%);color:#fff;padding:26px 28px 22px;}
  .header-row{display:flex;justify-content:space-between;align-items:center;gap:20px;}
  .brand{display:flex;align-items:center;gap:14px;}
  .logo{width:52px;height:52px;border-radius:18px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;}
  h1{font-size:28px;font-weight:800;margin:0;}
  .subtitle{font-size:13px;color:rgba(255,255,255,.82);margin-top:5px;}
  .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:rgba(255,255,255,.88);line-height:1.8;}
  .content{padding:18px;display:flex;flex-direction:column;gap:14px;}
  .hint{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:14px;padding:12px 14px;font-size:13px;}
  .summary{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  .card{border-radius:16px;padding:14px 16px;border:1px solid #dbeafe;background:#f8fafc;}
  .card small{display:block;font-size:12px;color:#64748b;margin-bottom:6px;}
  .card .value{font-size:22px;font-weight:800;color:#0f172a;}
  table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:14px;}
  thead th{background:#0f172a;color:#fff;font-size:12px;padding:12px 10px;text-align:${isUrdu ? "right" : "left"};text-transform:uppercase;letter-spacing:.5px;}
  tbody td{border:1px solid #e5e7eb;padding:12px 10px;font-size:13px;color:#334155;}
  tbody tr:nth-child(even) td{background:#f8fafc;}
  .center{text-align:center!important;}
  .strong{font-weight:800;color:#0f172a;}
  .mono{font-family:Inter,Arial,sans-serif;font-weight:700;}
  .footer{background:#0f172a;color:rgba(255,255,255,.8);padding:10px 16px;display:flex;justify-content:space-between;font-size:11px;}
  @media print{@page{size:A4;margin:10mm}body{background:white;padding:0}.page{padding:0;background:white}.sheet{box-shadow:none;border:none;border-radius:0;max-width:none}.hint{display:none}}
</style>
</head>
<body>
<div class="page">
  <div class="sheet">
    <div class="header">
      <div class="header-row">
        <div class="brand">
          <div class="logo">SUP</div>
          <div>
            <h1>Ali Cages</h1>
            <div class="subtitle">${t.reportHeader}</div>
          </div>
        </div>
        <div class="meta">
          <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
          <div>${t.totalSuppliers}: <strong style="color:white">${suppliers.length}</strong></div>
        </div>
      </div>
    </div>
    <div class="content">
      ${isPdf ? `<div class="hint">Choose <strong>Save as PDF</strong> in print dialog.</div>` : ""}
      <div class="summary">
        <div class="card"><small>${t.totalSuppliers}</small><div class="value">${suppliers.length}</div></div>
        <div class="card"><small>${t.reportHeader}</small><div class="value">${new Date().toLocaleDateString(isUrdu ? "ur-PK" : "en-PK")}</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th class="center">#</th>
            <th>${t.supplierName}</th>
            <th>${t.phone}</th>
          </tr>
        </thead>
        <tbody>
          ${
            suppliers.length > 0
              ? rowsHtml
              : `<tr><td colspan="3" style="text-align:center;padding:30px;color:#94a3b8">${t.noRecords}</td></tr>`
          }
        </tbody>
      </table>
    </div>
    <div class="footer">
      <span>Ali Cages — ${t.reportHeader}</span>
      <span>Page 1 / 1</span>
    </div>
  </div>
</div>
<script>
window.onload=()=>{setTimeout(()=>{window.print();${!isPdf ? "window.onafterprint=()=>window.close();" : ""}},300);};
</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=1200,height=850");
  if (!w) return;
  w.document.open();
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

  const pageFont = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

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
          const nameUr = await translateText(s.supplier_name || "");
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
      setForm({ supplier_name: "", phone: "" });
    } catch (err) {
      showToast("error", err.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

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
      visibleSuppliers: filtered.length,
    }),
    [suppliers, filtered]
  );

  return (
    <div
      dir={dir}
      style={{ fontFamily: pageFont }}
      className="min-h-screen bg-slate-50 p-0 pb-16"
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

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-slate-200 shadow-sm px-5 sm:px-6 py-5 mb-5 rounded-b-3xl">
          <div
            className={`flex items-center justify-between flex-wrap gap-4 ${
              isUrdu ? "flex-row-reverse" : ""
            }`}
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleLangToggle}
                disabled={translating}
                className="h-10 flex items-center gap-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                className={`h-10 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold transition shadow-sm ${
                  showSummary
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <i className="bi bi-bar-chart-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>

              <button
                onClick={() => generatePrintDocument(filtered, lang, urduCache, false)}
                className="h-10 flex items-center gap-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                <i className="bi bi-printer"></i>
                {t.printBtn}
              </button>

              <button
                onClick={() => generatePrintDocument(filtered, lang, urduCache, true)}
                className="h-10 flex items-center gap-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                <i className="bi bi-file-earmark-pdf-fill text-rose-500"></i>
                {t.pdfBtn}
              </button>

              <button
                onClick={openAdd}
                className="h-10 flex items-center gap-2 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                <i className="bi bi-plus-square-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-200">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <p className="text-xs text-slate-500 mb-1">{t.totalSuppliers}</p>
                <p className="text-3xl font-extrabold text-slate-950">
                  {summary.totalSuppliers}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-3">
                  <i className="bi bi-filter-circle-fill"></i>
                </div>
                <p className="text-xs text-slate-500 mb-1">Visible Records</p>
                <p className="text-3xl font-extrabold text-slate-950">
                  {summary.visibleSuppliers}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-3 mb-4 px-0">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <i
              className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isUrdu ? "right-3" : "left-3"
              }`}
            ></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full h-10 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 shadow-sm ${
                isUrdu ? "pr-10 pl-3 text-right" : "pl-10 pr-3"
              }`}
            />
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-white/60 flex flex-col"
              dir={dir}
            >
              <div
                className={`sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-3 ${
                  isUrdu ? "flex-row-reverse" : ""
                }`}
              >
                <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <i className="bi bi-truck text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">
                      {editingId ? t.formTitleEdit : t.formTitleAdd}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.formSubtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition flex items-center justify-center disabled:opacity-60"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-5 overflow-y-auto bg-slate-50">
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div
                    className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${
                      isUrdu ? "flex-row-reverse text-right" : ""
                    }`}
                  >
                    <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <i className="bi bi-info-circle-fill"></i>
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950">
                        Supplier Information
                      </h3>
                      <p className="text-xs text-slate-500">
                        Name and contact details
                      </p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wide text-slate-600 mb-2 whitespace-nowrap">
                        {t.supplierNameLabel} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <i
                          className={`bi bi-person-fill absolute top-1/2 -translate-y-1/2 text-slate-400 ${
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
                          className={`w-full h-10 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm ${
                            isUrdu ? "pr-10 pl-3 text-right" : "pl-10 pr-3"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wide text-slate-600 mb-2 whitespace-nowrap">
                        {t.phone}
                      </label>
                      <div className="relative">
                        <i
                          className={`bi bi-telephone-fill absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                            isUrdu ? "right-3" : "left-3"
                          }`}
                        ></i>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder={t.phonePlaceholder}
                          className={`w-full h-10 border border-slate-300 rounded-xl bg-white text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm ${
                            isUrdu ? "pr-10 pl-3 text-right" : "pl-10 pr-3"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div
                className={`sticky bottom-0 bg-white border-t border-slate-200 px-5 py-4 flex gap-3 ${
                  isUrdu ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 h-11 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save-fill"}`}></i>
                  {submitting ? t.saving : t.save}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 h-11 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>
                    #
                  </th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>
                    {t.supplierName}
                  </th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>
                    {t.phone}
                  </th>
                  <th className="px-4 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
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
                    <tr key={s.id} className="hover:bg-slate-50 transition align-middle">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>

                      <td className="px-4 py-3">
                        <div
                          className={`flex items-center gap-2.5 ${
                            isUrdu ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <i className="bi bi-truck text-indigo-600"></i>
                          </div>
                          <span
                            className={`font-bold text-slate-950 ${
                              translating ? "opacity-40" : ""
                            }`}
                          >
                            {getSupplierName(s, isUrdu, urduCache)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">
                        {s.phone || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div
                          className={`flex items-center justify-center gap-1.5 ${
                            isUrdu ? "flex-row-reverse" : ""
                          }`}
                        >
                          <button
                            onClick={() => openEdit(s)}
                            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition flex items-center justify-center"
                            title={t.edit}
                          >
                            <i className="bi bi-pencil-square text-sm"></i>
                          </button>

                          <button
                            onClick={() => handleDelete(s.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition flex items-center justify-center"
                            title={t.delete}
                          >
                            <i className="bi bi-trash3-fill text-sm"></i>
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
