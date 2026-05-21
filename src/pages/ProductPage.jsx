import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE TRANSLATION — MyMemory Free API
// ═══════════════════════════════════════════════════════════════════════════════
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
    title: "Product Management",
    subtitle: "Manage your products",
    addBtn: "Add Product",
    summaryBtn: "View Summary",
    summaryTitle: "Products Summary",
    summarySubtitle: "Overview of visible product records",
    totalProducts: "Total Products",
    singleProducts: "Single Products",
    cartonProducts: "Carton Products",
    totalRateValue: "Total Rate Value",
    searchPlaceholder: "Search by product name…",
    productName: "Product Name",
    saleUnit: "Sale Unit",
    single: "Single",
    carton: "Carton",
    piecesPerCarton: "Pieces Per Carton",
    pieceRate: "Piece Rate",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No products found.",
    loading: "Loading products...",
    toggleLang: "اردو",
    translating: "Translating to Urdu…",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Products List",
    printedOn: "Printed On",
    errorMsg: "Product name is required.",
    cartonValidation: "For carton products, pieces per carton and piece rate are required.",
    successSave: "Saved successfully!",
    successDelete: "Deleted successfully!",
    fetchError: "Failed to load records.",
    saveError: "Failed to save.",
    deleteError: "Failed to delete.",
    deleteConfirm: "Are you sure you want to delete this product?",
    namePlaceholder: "e.g. Steel Wire 18g",
    unitPlaceholder: "Select unit",
    piecesPlaceholder: "e.g. 20",
    ratePlaceholder: "e.g. 15",
    records: "Records",
    required: "Required",
    formSubtitle: "Product name, sale unit, carton quantity and piece rate",
    generated: "Generated",
    companyName: "Ali Cages",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
  },
  ur: {
    title: "پروڈکٹ مینجمنٹ",
    subtitle: "اپنی مصنوعات کا انتظام کریں",
    addBtn: "نیا پروڈکٹ شامل کریں",
    summaryBtn: "سمری دیکھیں",
    summaryTitle: "پروڈکٹس سمری",
    summarySubtitle: "نظر آنے والے پروڈکٹس کا خلاصہ",
    totalProducts: "کل پروڈکٹس",
    singleProducts: "سنگل پروڈکٹس",
    cartonProducts: "کارٹن پروڈکٹس",
    totalRateValue: "کل ریٹ ویلیو",
    searchPlaceholder: "پروڈکٹ نام سے تلاش کریں…",
    productName: "پروڈکٹ کا نام",
    saleUnit: "فروخت کی قسم",
    single: "سنگل",
    carton: "کارٹن",
    piecesPerCarton: "فی کارٹن پیسز",
    pieceRate: "فی پیس ریٹ",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے…",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کوئی پروڈکٹ نہیں ملا۔",
    loading: "پروڈکٹس لوڈ ہو رہے ہیں...",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "مصنوعات کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    errorMsg: "پروڈکٹ کا نام ضروری ہے۔",
    cartonValidation: "کارٹن پروڈکٹ کے لیے پیسز فی کارٹن اور فی پیس ریٹ ضروری ہیں۔",
    successSave: "کامیابی سے محفوظ ہو گیا!",
    successDelete: "حذف ہو گیا!",
    fetchError: "ریکارڈ لوڈ نہیں ہو سکے۔",
    saveError: "محفوظ نہیں ہو سکا۔",
    deleteError: "حذف نہیں ہو سکا۔",
    deleteConfirm: "کیا آپ واقعی اس پروڈکٹ کو حذف کرنا چاہتے ہیں؟",
    namePlaceholder: "مثلاً Steel Wire 18g",
    unitPlaceholder: "قسم منتخب کریں",
    piecesPlaceholder: "مثلاً 20",
    ratePlaceholder: "مثلاً 15",
    records: "ریکارڈز",
    required: "ضروری",
    formSubtitle: "پروڈکٹ نام، سیل یونٹ، کارٹن مقدار اور فی پیس ریٹ",
    generated: "تیار کردہ",
    companyName: "علی کیجز",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
  },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const defaultForm = {
  product_name: "",
  sale_unit: "single",
  pieces_per_carton: "",
  piece_rate: "",
};

function formatMoney(v) {
  return Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const ProductPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [urduCache, setUrduCache] = useState({});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/products`);
      setRecords(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      showToast("error", t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Language toggle ───────────────────────────────────────────────────────
  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);
    if (newLang !== "ur" || records.length === 0) return;

    const untranslated = records.filter((r) => !urduCache[`prod:${r.id}`]);
    if (!untranslated.length) return;

    setTranslating(true);
    try {
      const results = await Promise.all(
        untranslated.map(async (r) => ({
          id: r.id,
          urdu: await translateText(r.product_name),
        }))
      );

      setUrduCache((prev) => {
        const next = { ...prev };
        results.forEach(({ id, urdu }) => {
          next[`prod:${id}`] = urdu;
        });
        return next;
      });
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  };

  const getProductName = (r) =>
    isUrdu ? urduCache[`prod:${r.id}`] || r.product_name || "-" : r.product_name || "-";

  const getSaleUnitText = (r) => {
    const unit = (r.sale_unit || "single").toLowerCase();
    if (unit === "carton") return t.carton;
    return t.single;
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      product_name: r.product_name || "",
      sale_unit: r.sale_unit || "single",
      pieces_per_carton:
        r.pieces_per_carton !== null && r.pieces_per_carton !== undefined
          ? String(r.pieces_per_carton)
          : "",
      piece_rate:
        r.piece_rate !== null && r.piece_rate !== undefined
          ? String(r.piece_rate)
          : "",
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.product_name.trim()) {
      showToast("error", t.errorMsg);
      return;
    }

    if (
      form.sale_unit === "carton" &&
      (!Number(form.pieces_per_carton) || !Number(form.piece_rate))
    ) {
      showToast("error", t.cartonValidation);
      return;
    }

    const payload = {
      product_name: form.product_name.trim(),
      sale_unit: form.sale_unit,
      pieces_per_carton:
        form.sale_unit === "carton"
          ? Number(form.pieces_per_carton || 0)
          : 0,
      piece_rate: Number(form.piece_rate || 0),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(`${API_BASE}/api/products/${editingId}`, payload);
        setUrduCache((prev) => {
          const n = { ...prev };
          delete n[`prod:${editingId}`];
          return n;
        });
      } else {
        await axios.post(`${API_BASE}/api/products`, payload);
      }

      showToast("success", t.successSave);
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
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
      await axios.delete(`${API_BASE}/api/products/${id}`);
      setUrduCache((prev) => {
        const n = { ...prev };
        delete n[`prod:${id}`];
        return n;
      });
      showToast("success", t.successDelete);
      fetchData();
    } catch {
      showToast("error", t.deleteError);
    }
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return records;

    return records.filter((r) =>
      [
        r.product_name,
        urduCache[`prod:${r.id}`] || "",
        r.sale_unit || "",
        String(r.pieces_per_carton || ""),
        String(r.piece_rate || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [records, search, urduCache]);

  const summary = useMemo(
    () => ({
      totalProducts: filtered.length,
      singleProducts: filtered.filter((r) => (r.sale_unit || "single") !== "carton").length,
      cartonProducts: filtered.filter((r) => (r.sale_unit || "single") === "carton").length,
      totalRateValue: filtered.reduce((s, r) => s + Number(r.piece_rate || 0), 0),
    }),
    [filtered]
  );

  // ── Print / PDF ───────────────────────────────────────────────────────────
  const generatePrint = (isPdf = false) => {
    const font = isUrdu
      ? "'Noto Nastaliq Urdu', serif"
      : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

    const rows = filtered
      .map(
        (r, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td><strong>${getProductName(r)}</strong></td>
        <td><span class="badge ${r.sale_unit === "carton" ? "amber" : "green"}">${getSaleUnitText(r)}</span></td>
        <td class="center">${r.sale_unit === "carton" ? r.pieces_per_carton || 0 : "-"}</td>
        <td class="num">${formatMoney(r.piece_rate)}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${t.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:${font};background:#f8fafc;color:#0f172a;padding:24px;}
  .sheet{max-width:1150px;margin:0 auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 14px 40px rgba(15,23,42,.10);}
  .header{background:#111827;color:#fff;padding:22px 26px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;}
  .brand{font-size:26px;font-weight:800;letter-spacing:-.3px;}
  .report-title{font-size:13px;color:#cbd5e1;margin-top:4px;}
  .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:#cbd5e1;}
  .content{padding:18px;}
  .print-inst{background:#eef2ff;color:#3730a3;padding:12px 14px;text-align:center;border-radius:12px;margin-bottom:16px;border:1px solid #c7d2fe;font-size:13px;font-weight:700;}
  table{width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;}
  th{background:#111827;color:#fff;text-align:${isUrdu ? "right" : "left"};padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;}
  td{border-bottom:1px solid #f1f5f9;padding:11px 12px;color:#334155;}
  tr:nth-child(even) td{background:#f8fafc;}
  .center{text-align:center!important;}
  .num{text-align:${isUrdu ? "left" : "right"}!important;font-family:monospace;font-weight:800;color:#0f172a;}
  .badge{display:inline-flex;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;}
  .green{background:#dcfce7;color:#166534;}
  .amber{background:#fef3c7;color:#92400e;}
  @media print{body{padding:0;background:white}.sheet{box-shadow:none;border-radius:0;border:0}.print-inst{display:none}}
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">${t.companyName}</div>
        <div class="report-title">${t.reportHeader}</div>
      </div>
      <div class="meta">${t.printedOn}: ${new Date().toLocaleString(
        isUrdu ? "ur-PK" : "en-PK"
      )}</div>
    </div>
    <div class="content">
      ${isPdf ? `<div class="print-inst">${t.savePdfHint}</div>` : ""}
      <table>
        <thead>
          <tr>
            <th style="width:60px" class="center">#</th>
            <th>${t.productName}</th>
            <th>${t.saleUnit}</th>
            <th class="center">${t.piecesPerCarton}</th>
            <th class="num">${t.pieceRate}</th>
          </tr>
        </thead>
        <tbody>
          ${
            filtered.length
              ? rows
              : `<tr><td colspan="5" style="text-align:center;padding:34px">${t.noRecords}</td></tr>`
          }
        </tbody>
      </table>
    </div>
  </div>

  <script>
    window.onload=()=>{
      setTimeout(()=>{
        window.print();
        ${!isPdf ? "window.onafterprint=()=>window.close();" : ""}
      },300);
    };
  </script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      dir={dir}
      style={{
        fontFamily: isUrdu
          ? "'Noto Nastaliq Urdu', serif"
          : "Helvetica, 'Helvetica Neue', Arial, sans-serif",
      }}
      className="min-h-screen bg-[#f8fafc] p-3 sm:p-4 pb-16"
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        * { box-sizing: border-box; }

        .same-page-card {
          background:#fff;
          border:1px solid #e2e8f0;
          box-shadow:0 1px 4px rgba(15,23,42,.06);
        }

        .same-btn {
          transition: all .15s ease;
        }

        .same-btn:hover {
          transform: translateY(-1px);
        }

        .same-field {
          width:100%;
          height:38px;
          border:1.5px solid #dbe3ef;
          border-radius:10px;
          background:#fff;
          padding:0 12px;
          font-size:13px;
          color:#0f172a;
          outline:none;
          transition:border-color .15s ease, box-shadow .15s ease;
        }

        .same-field:focus {
          border-color:#6366f1;
          box-shadow:0 0 0 3px rgba(99,102,241,.12);
        }

        .same-field-icon-left {
          padding-left:34px;
        }

        .same-field-icon-right {
          padding-right:34px;
        }

        .same-label {
          display:block;
          font-size:10.5px;
          line-height:1;
          font-weight:800;
          text-transform:uppercase;
          letter-spacing:.06em;
          color:#64748b;
          margin-bottom:7px;
        }

        .same-section {
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 1px 3px rgba(15,23,42,.05);
        }

        .same-section-head {
          padding:13px 16px;
          border-bottom:1px solid #eef2f7;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          background:#fff;
        }

        .same-section-icon {
          width:36px;
          height:36px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#eef2ff;
          color:#4f46e5;
        }

        .same-dark-table th {
          background:#111827!important;
          color:#fff!important;
          font-size:11px!important;
          text-transform:uppercase;
          letter-spacing:.04em;
          padding:11px 14px!important;
          white-space:nowrap;
        }

        .same-dark-table td {
          padding:12px 14px!important;
          border-bottom:1px solid #f1f5f9!important;
        }

        .same-scroll::-webkit-scrollbar {
          width:7px;
          height:7px;
        }

        .same-scroll::-webkit-scrollbar-track {
          background:#f1f5f9;
        }

        .same-scroll::-webkit-scrollbar-thumb {
          background:#cbd5e1;
          border-radius:999px;
        }
      `}</style>

      {/* Toast */}
      {message.text && (
        <div
          className={`fixed bottom-6 ${
            isUrdu ? "left-6" : "right-6"
          } z-50 px-5 py-2.5 rounded-lg shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-tight text-slate-950">
                {t.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleLangToggle}
                disabled={translating}
                className="same-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-indigo-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                className={`same-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm ${
                  showSummary
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-50 text-indigo-700 hover:bg-sky-200"
                }`}
              >
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>

              <button
                onClick={() => generatePrint(false)}
                className="same-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-indigo-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                <i className="bi bi-printer-fill"></i>
                {t.printBtn}
              </button>

              <button
                onClick={() => generatePrint(true)}
                className="same-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-indigo-700 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                <i className="bi bi-file-earmark-pdf-fill"></i>
                {t.pdfBtn}
              </button>

              <button
                onClick={openAdd}
                className="same-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                <i className="bi bi-plus-circle-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="mt-5 pt-5 border-t border-slate-200">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-950">{t.summaryTitle}</h3>
                <p className="text-sm text-slate-500">{t.summarySubtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="w-10 h-10 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-sm mb-3">
                    <i className="bi bi-box-seam-fill"></i>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t.totalProducts}</p>
                  <p className="text-3xl font-extrabold text-slate-950">
                    {summary.totalProducts}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="w-10 h-10 rounded-lg bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-3">
                    <i className="bi bi-box"></i>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t.singleProducts}</p>
                  <p className="text-3xl font-extrabold text-slate-950">
                    {summary.singleProducts}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="w-10 h-10 rounded-lg bg-white text-amber-600 flex items-center justify-center shadow-sm mb-3">
                    <i className="bi bi-boxes"></i>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t.cartonProducts}</p>
                  <p className="text-3xl font-extrabold text-slate-950">
                    {summary.cartonProducts}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="w-10 h-10 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-sm mb-3">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t.totalRateValue}</p>
                  <p className="text-2xl font-extrabold text-slate-950">
                    {formatMoney(summary.totalRateValue)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <i
            className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
              isUrdu ? "right-4" : "left-4"
            }`}
          ></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm ${
              isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"
            }`}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[22px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="same-dark-table w-full text-sm text-slate-600">
              <thead>
                <tr>
                  <th className={`${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`${isUrdu ? "text-right" : "text-left"}`}>
                    {t.productName}
                  </th>
                  <th className={`${isUrdu ? "text-right" : "text-left"}`}>
                    {t.saleUnit}
                  </th>
                  <th className={`${isUrdu ? "text-right" : "text-left"}`}>
                    {t.piecesPerCarton}
                  </th>
                  <th className={`${isUrdu ? "text-left" : "text-right"}`}>
                    {t.pieceRate}
                  </th>
                  <th className="text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2">{t.loading}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const isCarton = (r.sale_unit || "single") === "carton";

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="text-slate-400 font-mono text-xs">{i + 1}</td>

                        <td className={`font-bold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                          <div
                            className={`flex items-center gap-3 ${
                              isUrdu ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                              <i className="bi bi-box-seam-fill"></i>
                            </div>
                            <span className={translating ? "opacity-40" : ""}>
                              {getProductName(r)}
                            </span>
                          </div>
                        </td>

                        <td className={`font-semibold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              isCarton
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {getSaleUnitText(r)}
                          </span>
                        </td>

                        <td className={`font-mono font-bold text-slate-950 ${isUrdu ? "text-right" : ""}`}>
                          {isCarton ? r.pieces_per_carton || 0 : "-"}
                        </td>

                        <td className={`font-mono font-bold text-slate-950 ${isUrdu ? "text-left" : "text-right"}`}>
                          {formatMoney(r.piece_rate)}
                        </td>

                        <td>
                          <div
                            className={`flex items-center justify-center gap-2 flex-wrap ${
                              isUrdu ? "flex-row-reverse" : ""
                            }`}
                          >
                            <button
                              onClick={() => openEdit(r)}
                              className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-sky-200 transition flex items-center justify-center"
                              title={t.edit}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>

                            <button
                              onClick={() => handleDelete(r.id)}
                              className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition flex items-center justify-center"
                              title={t.delete}
                            >
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

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-[22px] shadow-2xl w-full max-w-2xl p-4 flex flex-col"
              dir={dir}
            >
              <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-4">
                <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <i className="bi bi-box-seam-fill text-indigo-700 text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">
                      {editingId ? t.edit : t.addBtn}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">{t.formSubtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition flex items-center justify-center"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="same-section mb-4">
                <div className="same-section-head">
                  <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                    <div className="same-section-icon">
                      <i className="bi bi-card-checklist"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 m-0">
                        Product Information
                      </h3>
                      <p className="text-xs text-slate-500 m-0">{t.formSubtitle}</p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    <i className="bi bi-asterisk text-rose-500"></i>
                    {t.required}
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="same-label">
                      {t.productName} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <i
                        className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                          isUrdu ? "right-3" : "left-3"
                        }`}
                      ></i>
                      <input
                        type="text"
                        value={form.product_name}
                        onChange={(e) =>
                          setForm({ ...form, product_name: e.target.value })
                        }
                        placeholder={t.namePlaceholder}
                        autoFocus
                        className={`same-field ${
                          isUrdu ? "same-field-icon-right text-right" : "same-field-icon-left"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="same-label">
                      {t.saleUnit} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.sale_unit}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sale_unit: e.target.value,
                          pieces_per_carton:
                            e.target.value === "single" ? "" : form.pieces_per_carton,
                        })
                      }
                      className={`same-field ${isUrdu ? "text-right" : ""}`}
                    >
                      <option value="single">{t.single}</option>
                      <option value="carton">{t.carton}</option>
                    </select>
                  </div>

                  <div>
                    <label className="same-label">
                      {t.pieceRate} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <i
                        className={`bi bi-cash-stack absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                          isUrdu ? "right-3" : "left-3"
                        }`}
                      ></i>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.piece_rate}
                        onChange={(e) =>
                          setForm({ ...form, piece_rate: e.target.value })
                        }
                        placeholder={t.ratePlaceholder}
                        className={`same-field font-mono font-bold ${
                          isUrdu ? "same-field-icon-right text-right" : "same-field-icon-left text-right"
                        }`}
                      />
                    </div>
                  </div>

                  {form.sale_unit === "carton" && (
                    <div className="md:col-span-2">
                      <label className="same-label">
                        {t.piecesPerCarton} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <i
                          className={`bi bi-123 absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                            isUrdu ? "right-3" : "left-3"
                          }`}
                        ></i>
                        <input
                          type="number"
                          min="1"
                          value={form.pieces_per_carton}
                          onChange={(e) =>
                            setForm({ ...form, pieces_per_carton: e.target.value })
                          }
                          placeholder={t.piecesPlaceholder}
                          className={`same-field font-mono font-bold ${
                            isUrdu ? "same-field-icon-right text-right" : "same-field-icon-left text-right"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex gap-3 pt-4 border-t border-slate-200 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <i
                    className={`bi ${
                      submitting ? "bi-arrow-repeat animate-spin" : "bi-save"
                    }`}
                  ></i>
                  {submitting ? t.saving : t.save}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 bg-white border border-slate-300 text-indigo-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-60"
                >
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

export default ProductPage;
