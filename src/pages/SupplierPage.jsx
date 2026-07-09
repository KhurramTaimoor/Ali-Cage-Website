import React, { useState, useEffect, useMemo, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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
  apiFetch("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });

const updateSupplier = (id, data) =>
  apiFetch(`/api/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

const deleteSupplier = (id) =>
  apiFetch(`/api/suppliers/${id}`, {
    method: "DELETE",
  });

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

    if (
      !translated ||
      translated.toLowerCase() === String(text).trim().toLowerCase()
    ) {
      return text;
    }

    return translated;
  } catch {
    return text;
  }
}

const LANG = {
  en: {
    title: "Supplier Management",
    subtitle: "Manage your suppliers",
    addBtn: "Add Supplier",
    summaryBtn: "View Summary",
    hideSummary: "Hide Summary",
    searchPlaceholder: "Search supplier name, phone or balance...",
    supplierName: "Supplier Name",
    supplierNameLabel: "Supplier Name",
    phone: "Phone No",
    openingBalance: "Opening Balance",
    totalOpeningBalance: "Total Opening Balance",
    balancePlaceholder: "0",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Action",
    noRecords: "No suppliers found.",
    toggleLang: "اردو",
    translating: "Translating to Urdu...",
    loading: "Loading suppliers...",
    refresh: "Refresh",
    fetchError: "Failed to load suppliers.",
    saveError: "Failed to save supplier.",
    deleteError: "Failed to delete supplier.",
    successSave: "Supplier saved successfully!",
    successDelete: "Supplier deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this supplier?",
    errorMsg: "Supplier name is required.",
    totalSuppliers: "Total Suppliers",
    visibleRecords: "Visible Records",
    supplierPlaceholder: "e.g. Ali Traders",
    phonePlaceholder: "03XX-XXXXXXX",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Suppliers List",
    printedOn: "Printed On",
    formTitleAdd: "New Supplier",
    formTitleEdit: "Edit Supplier",
    formSubtitle: "Supplier name, phone and opening balance information",
    details: "Details",
  },

  ur: {
    title: "سپلائر مینجمنٹ",
    subtitle: "اپنے سپلائرز کا انتظام کریں",
    addBtn: "سپلائر شامل کریں",
    summaryBtn: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    searchPlaceholder: "سپلائر نام، فون یا بیلنس سے تلاش کریں...",
    supplierName: "سپلائر کا نام",
    supplierNameLabel: "سپلائر کا نام",
    phone: "فون نمبر",
    openingBalance: "اوپننگ بیلنس",
    totalOpeningBalance: "کل اوپننگ بیلنس",
    balancePlaceholder: "0",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "ایکشن",
    noRecords: "کوئی سپلائر نہیں ملا۔",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے...",
    loading: "سپلائرز لوڈ ہو رہے ہیں...",
    refresh: "ری فریش",
    fetchError: "سپلائرز لوڈ نہیں ہو سکے۔",
    saveError: "سپلائر محفوظ نہیں ہو سکا۔",
    deleteError: "سپلائر حذف نہیں ہو سکا۔",
    successSave: "سپلائر کامیابی سے محفوظ ہو گیا!",
    successDelete: "سپلائر حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی اس سپلائر کو حذف کرنا چاہتے ہیں؟",
    errorMsg: "سپلائر کا نام ضروری ہے۔",
    totalSuppliers: "کل سپلائرز",
    visibleRecords: "نظر آنے والے ریکارڈز",
    supplierPlaceholder: "مثلاً Ali Traders",
    phonePlaceholder: "03XX-XXXXXXX",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "سپلائرز کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    formTitleAdd: "نیا سپلائر",
    formTitleEdit: "سپلائر ترمیم",
    formSubtitle: "سپلائر نام، فون اور اوپننگ بیلنس معلومات",
    details: "تفصیل",
  },
};

const defaultForm = {
  supplier_name: "",
  phone: "",
  opening_balance: "",
};

const getSupplierName = (supplier, isUrdu, cache) =>
  isUrdu
    ? cache[`name:${supplier.id}`] || supplier.supplier_name || "—"
    : supplier.supplier_name || "—";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function generatePrintDocument(suppliers, lang, urduCache, isPdf = false) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const font = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Inter, Arial, sans-serif";

  const totalOpening = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.opening_balance || 0),
    0
  );

  const rowsHtml = suppliers
    .map((supplier, index) => {
      const nameDisplay = getSupplierName(supplier, isUrdu, urduCache);

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td class="strong">${nameDisplay}</td>
          <td class="mono">${supplier.phone || "—"}</td>
          <td class="mono num">PKR ${formatMoney(supplier.opening_balance)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>${t.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${font};background:#f8fafc;color:#0f172a;padding:20px}
.page{width:100%;min-height:100vh;background:#f8fafc;padding:20px}
.sheet{max-width:1100px;margin:0 auto;background:#fff;border:1px solid #dbe3ee;box-shadow:0 12px 40px rgba(15,23,42,.08);border-radius:20px;overflow:hidden}
.header{background:#0f172a;color:#fff;padding:24px 28px}
.header-row{display:flex;justify-content:space-between;align-items:center;gap:20px}
.brand{display:flex;align-items:center;gap:14px}
.logo{width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px}
h1{font-size:28px;font-weight:900;margin:0}
.subtitle{font-size:13px;color:rgba(255,255,255,.72);margin-top:5px}
.meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:rgba(255,255,255,.85);line-height:1.8}
.content{padding:18px;display:flex;flex-direction:column;gap:14px}
.hint{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:14px;padding:12px 14px;font-size:13px}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.card{border-radius:16px;padding:14px 16px;border:1px solid #dbe3ee;background:#f8fafc}
.card small{display:block;font-size:12px;color:#64748b;margin-bottom:6px}
.card .value{font-size:22px;font-weight:900;color:#0f172a}
table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:14px}
thead th{background:#0f172a;color:#fff;font-size:12px;padding:12px 10px;text-align:${isUrdu ? "right" : "left"};text-transform:uppercase;letter-spacing:.5px}
tbody td{border:1px solid #e5e7eb;padding:12px 10px;font-size:13px;color:#334155}
tbody tr:nth-child(even) td{background:#f8fafc}
.center{text-align:center!important}
.strong{font-weight:800;color:#0f172a}
.mono{font-family:Inter,Arial,sans-serif;font-weight:700}
.num{text-align:${isUrdu ? "left" : "right"}!important}
.footer{background:#0f172a;color:rgba(255,255,255,.8);padding:10px 16px;display:flex;justify-content:space-between;font-size:11px}
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
          <div>${t.printedOn}: ${new Date().toLocaleString(
    isUrdu ? "ur-PK" : "en-PK"
  )}</div>
          <div>${t.totalSuppliers}: <strong style="color:white">${
    suppliers.length
  }</strong></div>
          <div>${t.totalOpeningBalance}: <strong style="color:white">PKR ${formatMoney(
    totalOpening
  )}</strong></div>
        </div>
      </div>
    </div>

    <div class="content">
      ${
        isPdf
          ? `<div class="hint">Choose <strong>Save as PDF</strong> in print dialog.</div>`
          : ""
      }

      <div class="summary">
        <div class="card"><small>${t.totalSuppliers}</small><div class="value">${
    suppliers.length
  }</div></div>
        <div class="card"><small>${t.totalOpeningBalance}</small><div class="value">PKR ${formatMoney(
    totalOpening
  )}</div></div>
        <div class="card"><small>${
          t.reportHeader
        }</small><div class="value">${new Date().toLocaleDateString(
    isUrdu ? "ur-PK" : "en-PK"
  )}</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="center">#</th>
            <th>${t.supplierName}</th>
            <th>${t.phone}</th>
            <th class="num">${t.openingBalance}</th>
          </tr>
        </thead>
        <tbody>
          ${
            suppliers.length > 0
              ? rowsHtml
              : `<tr><td colspan="4" style="text-align:center;padding:30px;color:#94a3b8">${t.noRecords}</td></tr>`
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
window.onload=()=>{setTimeout(()=>{window.print();${
    !isPdf ? "window.onafterprint=()=>window.close();" : ""
  }},300);};
</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=1200,height=850");
  if (!w) return;

  w.document.open();
  w.document.write(html);
  w.document.close();
}

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

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [form, setForm] = useState(defaultForm);

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
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

    const untranslated = suppliers.filter(
      (supplier) => !urduCache[`name:${supplier.id}`]
    );

    if (!untranslated.length) return;

    setTranslating(true);

    try {
      const results = await Promise.all(
        untranslated.map(async (supplier) => {
          const nameUr = await translateText(supplier.supplier_name || "");
          return { id: supplier.id, nameUr };
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
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (supplier) => {
    setForm({
      supplier_name: supplier.supplier_name || "",
      phone: supplier.phone || "",
      opening_balance:
        supplier.opening_balance !== undefined &&
        supplier.opening_balance !== null
          ? String(supplier.opening_balance)
          : "",
    });

    setEditingId(supplier.id);
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
      opening_balance: Number(form.opening_balance || 0),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await updateSupplier(editingId, payload);
        const updated = res?.data || res;

        setSuppliers((prev) =>
          prev.map((supplier) =>
            supplier.id === editingId ? updated : supplier
          )
        );

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
      await deleteSupplier(id);

      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));

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
      (supplier) =>
        (supplier.supplier_name || "").toLowerCase().includes(q) ||
        (supplier.phone || "").toLowerCase().includes(q) ||
        String(supplier.opening_balance || "").toLowerCase().includes(q) ||
        (urduCache[`name:${supplier.id}`] || "").toLowerCase().includes(q)
    );
  }, [suppliers, search, urduCache]);

  const summary = useMemo(
    () => ({
      totalSuppliers: suppliers.length,
      visibleRecords: filtered.length,
      totalOpeningBalance: filtered.reduce(
        (sum, supplier) => sum + Number(supplier.opening_balance || 0),
        0
      ),
    }),
    [suppliers, filtered]
  );

  return (
    <div className="supplier-page" dir={dir}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        * {
          box-sizing: border-box;
        }

        .supplier-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #f1f5f9 100%);
          padding: 18px;
          color: #0f172a;
          font-family: ${
            isUrdu
              ? "'Noto Nastaliq Urdu', Arial, sans-serif"
              : "Inter, Helvetica, Arial, sans-serif"
          };
        }

        .page-wrap {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top-card {
          background: rgba(255,255,255,.94);
          border: 1px solid #dbe3ee;
          border-radius: 22px;
          padding: 20px 22px;
          box-shadow: 0 18px 50px rgba(15,23,42,.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .title {
          margin: 0;
          font-size: 30px;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 10px 15px;
          font-weight: 900;
          cursor: pointer;
          transition: .15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          white-space: nowrap;
          font-size: 13px;
        }

        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(.98);
        }

        .btn:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          box-shadow: 0 12px 25px rgba(79,70,229,.28);
        }

        .btn-summary {
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        .btn-summary-active {
          background: #4f46e5;
          color: white;
          border: 1px solid #4f46e5;
          box-shadow: 0 12px 25px rgba(79,70,229,.25);
        }

        .btn-soft {
          background: white;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-green {
          background: #dcfce7;
          color: #166534;
        }

        .btn-red {
          background: #fee2e2;
          color: #991b1b;
        }

        .headerPrintBtn {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid #0f172a !important;
          box-shadow: 0 10px 22px rgba(15,23,42,.18) !important;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin: 14px 0;
        }

        .summary-card {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 22px rgba(15,23,42,.05);
        }

        .summary-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          font-size: 18px;
        }

        .summary-card small {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .summary-card b {
          display: block;
          margin-top: 7px;
          font-size: 22px;
          font-weight: 950;
          color: #0f172a;
          font-family: monospace;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          margin: 14px 0 12px;
        }

        .search {
          width: min(440px, 100%);
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          padding: 0 13px;
          font-size: 13px;
          outline: none;
          background: white;
        }

        .search:focus,
        .input-field:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,.10);
        }

        .card {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(15,23,42,.05);
          overflow: hidden;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .suppliers-desktop {
          display: block;
        }

        .suppliers-mobile {
          display: none;
        }

        table.suppliers-table {
          width: 100%;
          min-width: 860px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        table.suppliers-table th {
          background: #0f172a;
          color: rgba(255,255,255,.82);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .5px;
          padding: 15px 14px;
          white-space: nowrap;
        }

        table.suppliers-table td {
          padding: 13px 14px;
          border-bottom: 1px solid #eef2f7;
          font-size: 13px;
          vertical-align: middle;
        }

        table.suppliers-table tr:hover td {
          background: #f8fafc;
        }

        .supplier-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .supplier-avatar {
          width: 38px;
          height: 38px;
          border-radius: 13px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .supplier-title {
          font-weight: 900;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .money {
          font-family: monospace;
          font-weight: 950;
          color: #1d4ed8;
        }

        .action-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .action-row .btn {
          padding: 7px 10px;
          font-size: 12px;
        }

        .supplier-mobile-list {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .supplier-mobile-card {
          background: #ffffff;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 24px rgba(15,23,42,.06);
        }

        .supplier-mobile-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .supplier-mobile-title {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .supplier-mobile-index {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
          font-family: monospace;
        }

        .supplier-mobile-name {
          margin-top: 3px;
          font-size: 15px;
          font-weight: 950;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .supplier-mobile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .supplier-info-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          border-radius: 13px;
          padding: 9px 10px;
        }

        .supplier-info-line small {
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
        }

        .supplier-info-line b {
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          text-align: right;
        }

        .supplier-mobile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .supplier-mobile-actions .btn {
          width: 100%;
          padding: 10px 8px;
          font-size: 12px;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,.45);
          z-index: 50;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 12px;
          overflow: auto;
          backdrop-filter: blur(3px);
        }

        .inputModalBox {
          width: min(760px, 100%);
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          box-shadow: 0 30px 90px rgba(15,23,42,.28);
          overflow: hidden;
        }

        .inputModalTitle {
          min-height: 58px;
          background: linear-gradient(135deg,#0f172a,#1e293b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          font-size: 17px;
          font-weight: 900;
          gap: 12px;
        }

        .modal-title-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .modal-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.20);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex: 0 0 auto;
        }

        .modal-title-main {
          font-size: 17px;
          font-weight: 950;
        }

        .modal-title-sub {
          margin-top: 2px;
          font-size: 11px;
          color: rgba(255,255,255,.70);
          font-weight: 700;
        }

        .closeBtn {
          border: 1px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.08);
          color: white;
          min-width: 36px;
          height: 34px;
          border-radius: 10px;
          cursor: pointer;
          padding: 0 12px;
          font-weight: 900;
        }

        .inputModalBody {
          padding: 14px;
        }

        .form-section {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          overflow: hidden;
        }

        .form-section-head {
          background: linear-gradient(135deg,#eef2ff,#f8fafc);
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-section-head-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: white;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(15,23,42,.06);
        }

        .form-section-head h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }

        .form-section-head p {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .form-grid {
          padding: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .field {
          min-width: 0;
        }

        .field-full {
          grid-column: 1 / -1;
        }

        .label {
          font-size: 11px;
          color: #334155;
          margin-bottom: 6px;
          display: block;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .35px;
        }

        .input-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
        }

        .input-icon-left {
          left: 12px;
        }

        .input-icon-right {
          right: 12px;
        }

        .input-field {
          width: 100%;
          height: 42px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #0f172a;
          padding: 7px 12px;
          font-size: 13px;
          border-radius: 12px;
          outline: none;
          font-weight: 750;
        }

        .input-field-with-left {
          padding-left: 38px;
        }

        .input-field-with-right {
          padding-right: 38px;
        }

        .modalFooterBasic {
          padding: 14px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .toast {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 90;
          color: white;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 900;
          box-shadow: 0 20px 50px rgba(15,23,42,.25);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .translating-toast {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 18px;
          z-index: 90;
          color: white;
          background: #0f172a;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 900;
          box-shadow: 0 20px 50px rgba(15,23,42,.25);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        @media(max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 768px) {
          .supplier-page {
            padding: 12px;
          }

          .top-card {
            align-items: stretch;
          }

          .top-card > div:last-child {
            width: 100%;
          }

          .top-card .btn {
            width: 100%;
          }

          .toolbar {
            width: 100%;
          }

          .search {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .suppliers-desktop {
            display: none;
          }

          .suppliers-mobile {
            display: block;
          }

          .modal-bg {
            padding: 0;
          }

          .inputModalBox {
            min-height: 100vh;
            border-radius: 0;
            width: 100%;
          }

          .inputModalTitle {
            min-height: 58px;
            padding: 12px 14px;
          }

          .inputModalBody {
            padding: 10px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .modalFooterBasic {
            display: grid;
            grid-template-columns: 1fr;
          }

          .modalFooterBasic .btn {
            width: 100%;
          }

          .title {
            font-size: 24px;
          }
        }
      `}</style>

      {message.text && (
        <div
          className="toast"
          style={{
            background: message.type === "error" ? "#dc2626" : "#16a34a",
            left: isUrdu ? 18 : "auto",
            right: isUrdu ? "auto" : 18,
          }}
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
        <div className="translating-toast">
          <i className="bi bi-arrow-repeat"></i>
          {t.translating}
        </div>
      )}

      <div className="page-wrap">
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              flexDirection: isUrdu ? "row-reverse" : "row",
            }}
          >
            <button
              className="btn btn-soft"
              onClick={handleLangToggle}
              disabled={translating}
            >
              <i className="bi bi-translate"></i>
              {t.toggleLang}
            </button>

            <button
              className={`btn ${
                showSummary ? "btn-summary-active" : "btn-summary"
              }`}
              onClick={() => setShowSummary((v) => !v)}
            >
              <i className="bi bi-bar-chart-fill"></i>
              {showSummary ? t.hideSummary : t.summaryBtn}
            </button>

            <button
              className="btn headerPrintBtn"
              onClick={() => generatePrintDocument(filtered, lang, urduCache, false)}
            >
              <i className="bi bi-printer"></i>
              {t.printBtn}
            </button>

            <button
              className="btn btn-soft"
              onClick={() => generatePrintDocument(filtered, lang, urduCache, true)}
            >
              <i className="bi bi-file-earmark-pdf-fill"></i>
              {t.pdfBtn}
            </button>

            <button className="btn btn-soft" onClick={loadSuppliers}>
              <i className="bi bi-arrow-clockwise"></i>
              {loading ? t.loading : t.refresh}
            </button>

            <button className="btn btn-primary" onClick={openAdd}>
              <i className="bi bi-plus-circle-fill"></i>
              {t.addBtn}
            </button>
          </div>
        </div>

        {showSummary && (
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <small>{t.totalSuppliers}</small>
              <b>{summary.totalSuppliers}</b>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="bi bi-filter-circle-fill"></i>
              </div>
              <small>{t.visibleRecords}</small>
              <b>{summary.visibleRecords}</b>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="bi bi-wallet2"></i>
              </div>
              <small>{t.totalOpeningBalance}</small>
              <b>{formatMoney(summary.totalOpeningBalance)}</b>
            </div>
          </div>
        )}

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
          />
        </div>

        <div className="card">
          <div className="suppliers-desktop table-wrap">
            <table className="suppliers-table">
              <colgroup>
                <col style={{ width: 70 }} />
                <col style={{ width: 330 }} />
                <col style={{ width: 220 }} />
                <col style={{ width: 210 }} />
                <col style={{ width: 190 }} />
              </colgroup>

              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>#</th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.supplierName}
                  </th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.phone}
                  </th>

                  <th style={{ textAlign: isUrdu ? "left" : "right" }}>
                    {t.openingBalance}
                  </th>

                  <th>{t.actions}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 44,
                        color: "#94a3b8",
                      }}
                    >
                      {t.loading}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 44,
                        color: "#94a3b8",
                      }}
                    >
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((supplier, index) => (
                    <tr key={supplier.id || index}>
                      <td
                        style={{
                          textAlign: "center",
                          color: "#94a3b8",
                          fontFamily: "monospace",
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </td>

                      <td>
                        <div
                          className="supplier-name-cell"
                          style={{
                            flexDirection: isUrdu ? "row-reverse" : "row",
                          }}
                        >
                          <div className="supplier-avatar">
                            <i className="bi bi-truck"></i>
                          </div>

                          <div
                            className="supplier-title"
                            style={{
                              opacity: translating ? 0.45 : 1,
                            }}
                          >
                            {getSupplierName(supplier, isUrdu, urduCache)}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          color: "#475569",
                        }}
                      >
                        {supplier.phone || "—"}
                      </td>

                      <td
                        className="money"
                        style={{
                          textAlign: isUrdu ? "left" : "right",
                        }}
                      >
                        {formatMoney(supplier.opening_balance)}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <div
                          className="action-row"
                          style={{
                            flexDirection: isUrdu ? "row-reverse" : "row",
                          }}
                        >
                          <button
                            className="btn btn-green"
                            onClick={() => openEdit(supplier)}
                          >
                            <i className="bi bi-pencil-square"></i>
                            {t.edit}
                          </button>

                          <button
                            className="btn btn-red"
                            onClick={() => handleDelete(supplier.id)}
                          >
                            <i className="bi bi-trash3-fill"></i>
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="suppliers-mobile">
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#94a3b8",
                }}
              >
                {t.loading}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#94a3b8",
                }}
              >
                {t.noRecords}
              </div>
            ) : (
              <div className="supplier-mobile-list">
                {filtered.map((supplier, index) => (
                  <div className="supplier-mobile-card" key={supplier.id || index}>
                    <div
                      className="supplier-mobile-top"
                      style={{
                        flexDirection: isUrdu ? "row-reverse" : "row",
                      }}
                    >
                      <div
                        className="supplier-mobile-title"
                        style={{
                          flexDirection: isUrdu ? "row-reverse" : "row",
                        }}
                      >
                        <div className="supplier-avatar">
                          <i className="bi bi-truck"></i>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div className="supplier-mobile-index">#{index + 1}</div>

                          <div
                            className="supplier-mobile-name"
                            style={{
                              opacity: translating ? 0.45 : 1,
                            }}
                          >
                            {getSupplierName(supplier, isUrdu, urduCache)}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "#eef2ff",
                          color: "#3730a3",
                          border: "1px solid #c7d2fe",
                          fontSize: 11,
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                        }}
                      >
                        SUP
                      </span>
                    </div>

                    <div className="supplier-mobile-grid">
                      <div className="supplier-info-line">
                        <small>{t.phone}</small>
                        <b style={{ fontFamily: "monospace" }}>
                          {supplier.phone || "—"}
                        </b>
                      </div>

                      <div className="supplier-info-line">
                        <small>{t.openingBalance}</small>
                        <b
                          style={{
                            color: "#1d4ed8",
                            fontFamily: "monospace",
                          }}
                        >
                          {formatMoney(supplier.opening_balance)}
                        </b>
                      </div>
                    </div>

                    <div className="supplier-mobile-actions">
                      <button
                        className="btn btn-green"
                        onClick={() => openEdit(supplier)}
                      >
                        <i className="bi bi-pencil-square"></i>
                        {t.edit}
                      </button>

                      <button
                        className="btn btn-red"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-bg">
          <div className="inputModalBox" dir={dir}>
            <div className="inputModalTitle">
              <div
                className="modal-title-left"
                style={{
                  flexDirection: isUrdu ? "row-reverse" : "row",
                  textAlign: isUrdu ? "right" : "left",
                }}
              >
                <div className="modal-icon">
                  <i className="bi bi-truck"></i>
                </div>

                <div style={{ minWidth: 0 }}>
                  <div className="modal-title-main">
                    {editingId ? t.formTitleEdit : t.formTitleAdd}
                  </div>

                  <div className="modal-title-sub">{t.formSubtitle}</div>
                </div>
              </div>

              <button
                type="button"
                className="closeBtn"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <div className="inputModalBody">
              <div className="form-section">
                <div
                  className="form-section-head"
                  style={{
                    flexDirection: isUrdu ? "row-reverse" : "row",
                    textAlign: isUrdu ? "right" : "left",
                  }}
                >
                  <div className="form-section-head-icon">
                    <i className="bi bi-info-circle-fill"></i>
                  </div>

                  <div>
                    <h3>{t.details}</h3>
                    <p>{t.formSubtitle}</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field field-full">
                    <label className="label">
                      {t.supplierNameLabel}{" "}
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>

                    <div className="input-wrap">
                      <i
                        className={`bi bi-person-fill input-icon ${
                          isUrdu ? "input-icon-right" : "input-icon-left"
                        }`}
                      ></i>

                      <input
                        type="text"
                        value={form.supplier_name}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            supplier_name: e.target.value,
                          }))
                        }
                        placeholder={t.supplierPlaceholder}
                        className={`input-field ${
                          isUrdu
                            ? "input-field-with-right"
                            : "input-field-with-left"
                        }`}
                        style={{
                          textAlign: isUrdu ? "right" : "left",
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">{t.phone}</label>

                    <div className="input-wrap">
                      <i
                        className={`bi bi-telephone-fill input-icon ${
                          isUrdu ? "input-icon-right" : "input-icon-left"
                        }`}
                      ></i>

                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder={t.phonePlaceholder}
                        className={`input-field ${
                          isUrdu
                            ? "input-field-with-right"
                            : "input-field-with-left"
                        }`}
                        style={{
                          fontFamily: "monospace",
                          textAlign: isUrdu ? "right" : "left",
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label" style={{ color: "#3730a3" }}>
                      {t.openingBalance}
                    </label>

                    <div className="input-wrap">
                      <i
                        className={`bi bi-wallet2 input-icon ${
                          isUrdu ? "input-icon-right" : "input-icon-left"
                        }`}
                      ></i>

                      <input
                        type="number"
                        value={form.opening_balance}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            opening_balance: e.target.value,
                          }))
                        }
                        placeholder={t.balancePlaceholder}
                        className={`input-field ${
                          isUrdu
                            ? "input-field-with-right"
                            : "input-field-with-left"
                        }`}
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 900,
                          color: "#1d4ed8",
                          textAlign: isUrdu ? "right" : "left",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="modalFooterBasic"
              style={{
                flexDirection: isUrdu ? "row-reverse" : "row",
              }}
            >
              <button
                className="btn btn-soft"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                {t.cancel}
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={submitting}
              >
                <i
                  className={`bi ${
                    submitting ? "bi-arrow-repeat" : "bi-save-fill"
                  }`}
                ></i>
                {submitting ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPage;
