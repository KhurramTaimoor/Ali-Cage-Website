import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE TRANSLATION — MyMemory Free API
// ═══════════════════════════════════════════════════════════════════════════════
async function translateText(text) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|ur`;
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
    title: "Product Type Management",
    subtitle: "Manage your product types",
    addBtn: "Add Product Type",
    searchPlaceholder: "Search by product type…",
    productType: "Product Type",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No records found.",
    toggleLang: "اردو",
    translating: "Translating to Urdu…",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Product Types List",
    printedOn: "Printed On",
    errorMsg: "Product type name is required.",
    deleteConfirm: "Are you sure you want to delete this product type?",
    successSave: "Saved successfully!",
    successDelete: "Deleted successfully!",
    fetchError: "Failed to load records.",
    saveError: "Failed to save.",
    deleteError: "Failed to delete.",
  },
  ur: {
    title: "پروڈکٹ ٹائپ مینجمنٹ",
    subtitle: "اپنی مصنوعات کی اقسام کا انتظام کریں",
    addBtn: "نئی قسم شامل کریں",
    searchPlaceholder: "پروڈکٹ ٹائپ سے تلاش کریں…",
    productType: "پروڈکٹ کی قسم",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے…",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "پروڈکٹ اقسام کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    errorMsg: "پروڈکٹ ٹائپ کا نام ضروری ہے۔",
    deleteConfirm: "کیا آپ واقعی اس پروڈکٹ ٹائپ کو حذف کرنا چاہتے ہیں؟",
    successSave: "کامیابی سے محفوظ ہو گیا!",
    successDelete: "حذف ہو گیا!",
    fetchError: "ریکارڈ لوڈ نہیں ہو سکے۔",
    saveError: "محفوظ نہیں ہو سکا۔",
    deleteError: "حذف نہیں ہو سکا۔",
  },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ═══════════════════════════════════════════════════════════════════════════════
const ProductTypePage = () => {
  const [lang, setLang]               = useState("en");
  const t      = LANG[lang];
  const isUrdu = lang === "ur";
  const dir    = isUrdu ? "rtl" : "ltr";

  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [translating, setTranslating] = useState(false);
  const [urduCache, setUrduCache]     = useState({}); // { "type:1": "علی ٹریڈرز" }
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState({ product_type_en: "" });
  const [message, setMessage]         = useState({ type: "", text: "" });

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/product-types`);
      setRecords(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      showToast("error", t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Language toggle — MyMemory translate ──────────────────────────────────
  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur" || records.length === 0) return;

    const untranslated = records.filter((r) => !urduCache[`type:${r.id}`]);
    if (!untranslated.length) return;

    setTranslating(true);
    try {
      const results = await Promise.all(
        untranslated.map(async (r) => ({
          id:   r.id,
          urdu: await translateText(r.product_type_en),
        }))
      );
      setUrduCache((prev) => {
        const next = { ...prev };
        results.forEach(({ id, urdu }) => { next[`type:${id}`] = urdu; });
        return next;
      });
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  };

  // ── Display helper ────────────────────────────────────────────────────────
  const getTypeName = (r) =>
    isUrdu
      ? (urduCache[`type:${r.id}`] || r.product_type_en || "-")
      : (r.product_type_en || "-");

  // ── Form ──────────────────────────────────────────────────────────────────
  const openAdd = () => { setForm({ product_type_en: "" }); setEditingId(null); setShowForm(true); };

  const openEdit = (r) => { setForm({ product_type_en: r.product_type_en || "" }); setEditingId(r.id); setShowForm(true); };

  const handleSave = async () => {
    if (!form.product_type_en.trim()) { showToast("error", t.errorMsg); return; }

    const payload = { product_type_en: form.product_type_en.trim() };

    try {
      setSubmitting(true);
      if (editingId) {
        await axios.put(`${API_BASE}/api/product-types/${editingId}`, payload);
        // Cache invalidate
        setUrduCache((prev) => { const n = { ...prev }; delete n[`type:${editingId}`]; return n; });
      } else {
        await axios.post(`${API_BASE}/api/product-types`, payload);
      }
      showToast("success", t.successSave);
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch {
      showToast("error", t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/api/product-types/${id}`);
      setUrduCache((prev) => { const n = { ...prev }; delete n[`type:${id}`]; return n; });
      showToast("success", t.successDelete);
      fetchData();
    } catch {
      showToast("error", t.deleteError);
    }
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const filtered = records.filter((r) =>
    [r.product_type_en, urduCache[`type:${r.id}`] || ""]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  // ── Print / PDF ───────────────────────────────────────────────────────────
  const generatePrint = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rows = filtered.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${getTypeName(r)}</strong></td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>${t.title}</title>
${isUrdu ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">` : ""}
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:${font};background:#fff;color:#0f172a;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1e40af;padding-bottom:20px;margin-bottom:30px;}
  .brand{font-size:28px;font-weight:bold;color:#1e40af;text-transform:uppercase;letter-spacing:1px;}
  .report-title{font-size:18px;color:#64748b;margin-top:5px;}
  .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:#64748b;}
  table{width:100%;border-collapse:collapse;font-size:14px;}
  th{background:#1e40af;color:#fff;text-align:${isUrdu ? "right" : "left"};padding:12px;}
  td{border-bottom:1px solid #e2e8f0;padding:12px;color:#334155;}
  tr:nth-child(even) td{background:#f8fafc;}
  .print-inst{background:#eff6ff;color:#1d4ed8;padding:15px;text-align:center;border-radius:8px;margin-bottom:20px;font-size:14px;border:1px solid #bfdbfe;}
  @media print{body{padding:0;}.print-inst{display:none;}}
</style>
</head>
<body>
${isPdf ? `<div class="print-inst">Please select <strong>"Save as PDF"</strong> in the destination dropdown to download.</div>` : ""}
<div class="header">
  <div><div class="brand">Ali Cages</div><div class="report-title">${t.reportHeader}</div></div>
  <div class="meta">${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
</div>
<table>
  <thead><tr><th style="width:50px">#</th><th>${t.productType}</th></tr></thead>
  <tbody>${filtered.length ? rows : `<tr><td colspan="2" style="text-align:center">${t.noRecords}</td></tr>`}</tbody>
</table>
<script>window.onload=()=>{setTimeout(()=>{window.print();${!isPdf ? "window.onafterprint=()=>window.close();" : ""}},300);};</script>
</body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div dir={dir}
      style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 pb-20"
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${message.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>
          <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {message.text}
        </div>
      )}

      {/* Translating indicator */}
      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>{t.translating}
        </div>
      )}

      {/* ── Header ── */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>
            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button onClick={handleLangToggle} disabled={translating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                <i className={`bi ${translating ? "bi-arrow-repeat animate-spin" : "bi-translate"}`}></i>
                {t.toggleLang}
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200">
                <i className="bi bi-plus-lg"></i>{t.addBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">

        {/* Search + Print */}
        <div className={`flex items-center justify-between flex-wrap gap-3 mb-6 ${isUrdu ? "flex-row-reverse" : ""}`}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-4" : "left-4"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full border border-sky-100 rounded-2xl py-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"}`} />
          </div>
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrint(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm">
              <i className="bi bi-printer text-sky-600"></i>{t.printBtn}
            </button>
            <button onClick={() => generatePrint(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm">
              <i className="bi bi-file-earmark-pdf text-rose-600"></i>{t.pdfBtn}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100">
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"} w-14`}>#</th>
                  <th className={`px-5 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.productType}</th>
                  <th className="px-5 py-4 text-center w-40">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                    <p className="mt-2">{t.searchPlaceholder}</p>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-sky-50/70 transition">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className={`px-5 py-4 font-bold text-slate-800 ${isUrdu ? "text-right" : ""}`}>
                        <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                            <i className="bi bi-tag-fill text-xs"></i>
                          </div>
                          <span className={translating ? "opacity-40" : ""}>{getTypeName(r)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`flex items-center justify-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(r)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 text-sky-700 text-xs font-semibold hover:bg-sky-200 transition">
                            <i className="bi bi-pencil-square"></i>{t.edit}
                          </button>
                          <button onClick={() => handleDelete(r.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-600 text-xs font-semibold hover:bg-rose-200 transition">
                            <i className="bi bi-trash3-fill"></i>{t.delete}
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

        {/* ── Modal Form ── */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" dir={dir}>
              <div className="flex items-center gap-3 mb-6 border-b border-sky-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <i className="bi bi-tag-fill text-sky-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>

              {/* Sirf ek field — product_type_en */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.productType} *</label>
                <div className="relative">
                  <i className={`bi bi-tag absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                  <input
                    type="text"
                    value={form.product_type_en}
                    onChange={(e) => setForm({ product_type_en: e.target.value })}
                    placeholder={isUrdu ? "مثلاً Raw Material" : "e.g. Raw Material"}
                    autoFocus
                    className={`w-full border border-sky-100 rounded-2xl py-3 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100 ${isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"}`}
                  />
                </div>
              </div>

              <div className={`flex gap-3 pt-4 border-t border-sky-100 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button onClick={handleSave} disabled={submitting}
                  className="flex-1 bg-sky-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-sky-700 transition shadow-lg shadow-sky-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                  {submitting ? t.saving : t.save}
                </button>
                <button onClick={() => setShowForm(false)} disabled={submitting}
                  className="flex-1 bg-white border border-sky-200 text-sky-700 py-3 rounded-2xl font-semibold text-sm hover:bg-sky-50 transition disabled:opacity-60">
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTypePage;