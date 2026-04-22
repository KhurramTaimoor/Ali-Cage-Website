import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Salesman Management",
    subtitle: "Manage your sales team",
    addBtn: "Add Salesman",
    searchPlaceholder: "Search by name, phone or CNIC…",
    salesmanName: "Salesman Name",
    phone: "Phone",
    cnic: "CNIC",
    commission: "Salary (PKR)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    printSlip: "Print Slip",
    downloadPdf: "Download PDF",
    noRecords: "No salesmen found.",
    toggleLang: "اردو",
    status: "Status",
    active: "Active",
    actions: "Actions",
    loading: "Loading salesmen...",
    errorMsg: "Salesman name is required.",
    successSave: "Record saved successfully!",
    deleteConfirm: "Are you sure you want to delete this salesman?",
    slipTitle: "Salesman Profile Slip",
    slipName: "Salesman Name",
    slipPhone: "Phone",
    slipCnic: "CNIC",
    slipCommission: "Salary",
    slipDate: "Date",
    slipThank: "Authorized Salesman — Keep this slip safe.",
  },
  ur: {
    title: "سیلز مین کا انتظام",
    subtitle: "اپنی سیلز ٹیم کا ریکارڈ رکھیں",
    addBtn: "سیلز مین شامل کریں",
    searchPlaceholder: "نام، فون یا شناختی کارڈ سے تلاش کریں…",
    salesmanName: "سیلز مین کا نام",
    phone: "فون",
    cnic: "شناختی کارڈ",
    commission: "تنخواہ (روپے)",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    printSlip: "سلپ پرنٹ کریں",
    downloadPdf: "PDF ڈاؤنلوڈ",
    noRecords: "کوئی سیلز مین نہیں ملا۔",
    toggleLang: "English",
    status: "حالت",
    active: "فعال",
    actions: "اقدامات",
    loading: "سیلز مین کا ڈیٹا لوڈ ہو رہا ہے...",
    errorMsg: "سیلز مین کا نام درکار ہے۔",
    successSave: "ریکارڈ کامیابی سے محفوظ ہو گیا!",
    deleteConfirm: "کیا آپ واقعی اس سیلز مین کو حذف کرنا چاہتے ہیں؟",
    slipTitle: "سیلز مین پروفائل سلپ",
    slipName: "نام",
    slipPhone: "فون",
    slipCnic: "شناختی کارڈ",
    slipCommission: "تنخواہ",
    slipDate: "تاریخ",
    slipThank: "مجاز سیلز مین — یہ سلپ محفوظ رکھیں۔",
  },
};

const API_BASE = "http://localhost:5000/api/salesmen";

// ─────────────────────────────────────────────────────────────────
// SINGLE SALESMAN PDF
// ─────────────────────────────────────────────────────────────────
function downloadSalesmanPdf(salesman, lang) {
  const t = LANG[lang];
  const doc = new jsPDF({ unit: "mm", format: "a5" });

  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 148, 30, "F");
  doc.setTextColor(240, 192, 64);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Ali Cage", 74, 13, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text(t.slipTitle, 74, 21, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(new Date().toLocaleDateString("en-PK"), 74, 27, { align: "center" });

  doc.setTextColor(30, 30, 30);
  autoTable(doc, {
    startY: 36,
    head: [],
    body: [
      [t.slipName, salesman.salesman_name || "-"],
      [t.slipPhone, salesman.phone || "-"],
      [t.slipCnic, salesman.cnic || "-"],
      [
        t.slipCommission,
        `PKR ${Number(salesman.commission || 0).toLocaleString("en-PK")}`,
      ],
      [t.slipDate, new Date().toLocaleDateString("en-PK")],
    ],
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [245, 245, 250], cellWidth: 48 },
      1: { cellWidth: 82 },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(t.slipThank, 74, finalY, { align: "center" });

  doc.save(`salesman-${(salesman.salesman_name || "record").replace(/\s+/g, "-")}.pdf`);
}

// ─────────────────────────────────────────────────────────────────
// ALL SALESMEN PDF
// ─────────────────────────────────────────────────────────────────
function downloadAllPdf(salesmen, lang) {
  const t = LANG[lang];
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(240, 192, 64);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Ali Cage — Salesmen Report", 148, 10, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-PK")}  |  Total: ${salesmen.length} salesmen`,
    148,
    18,
    { align: "center" }
  );

  const rows = salesmen.map((s, i) => [
    i + 1,
    s.salesman_name || "-",
    s.phone || "-",
    s.cnic || "-",
    `PKR ${Number(s.commission || 0).toLocaleString("en-PK")}`,
    t.active,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [[
      "#",
      t.salesmanName,
      t.phone,
      t.cnic,
      t.commission,
      t.status,
    ]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [240, 192, 64],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    columnStyles: {
      4: { halign: "right", fontStyle: "bold" },
      5: { halign: "center" },
    },
  });

  doc.save(`salesmen-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─────────────────────────────────────────────────────────────────
// PRINT SLIP
// ─────────────────────────────────────────────────────────────────
function printSlip(salesman, lang) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";

  const html = `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${lang}">
    <head>
      <meta charset="UTF-8"/>
      <title>${t.slipTitle}</title>
      ${isUrdu ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">` : ""}
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${font}; background: #fff; color: #0f172a; padding: 40px; }
        .slip { max-width: 440px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 14px; overflow: hidden; }
        .header { background: #0f172a; color: #38bdf8; padding: 24px; text-align: center; }
        .header img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; border: 2px solid #38bdf8; }
        .header h1 { font-size: 24px; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin: 0; }
        .header h2 { font-size: 15px; color: #fff; font-weight: normal; margin: 5px 0 0 0; }
        .header p { font-size: 11px; margin-top: 5px; opacity: 0.6; color: #fff; }
        .badge-wrap { display: flex; justify-content: center; padding: 20px 28px 4px; }
        .avatar { width: 64px; height: 64px; border-radius: 50%; background: #e0f2fe; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #0284c7; border: 3px solid #bae6fd; }
        .body { padding: 16px 28px 28px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; }
        .value { font-weight: bold; color: #0f172a; }
        .salary-badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 3px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; font-family: monospace; }
        .footer { text-align: center; padding: 14px; background: #f8fafc; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="slip">
        <div class="header">
          <img src="https://ui-avatars.com/api/?name=Ali+Cage&background=38bdf8&color=0f172a&rounded=true&bold=true" alt="Ali Cage Logo" />
          <h1>Ali Cage</h1>
          <h2>${t.slipTitle}</h2>
          <p>${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</p>
        </div>
        <div class="badge-wrap">
          <div class="avatar">👤</div>
        </div>
        <div class="body">
          <div class="row">
            <span class="label">${t.slipName}</span>
            <span class="value">${salesman.salesman_name || "—"}</span>
          </div>
          <div class="row">
            <span class="label">${t.slipPhone}</span>
            <span class="value" style="font-family: monospace;">${salesman.phone || "—"}</span>
          </div>
          <div class="row">
            <span class="label">${t.slipCnic}</span>
            <span class="value" style="font-family: monospace;">${salesman.cnic || "—"}</span>
          </div>
          <div class="row">
            <span class="label">${t.slipCommission}</span>
            <span class="value"><span class="salary-badge">₨ ${Number(salesman.commission || 0).toLocaleString("en-PK")}</span></span>
          </div>
          <div class="row">
            <span class="label">${t.slipDate}</span>
            <span class="value">${new Date().toLocaleDateString(isUrdu ? "ur-PK" : "en-PK")}</span>
          </div>
        </div>
        <div class="footer">${t.slipThank}</div>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  const w = window.open("", "_blank", "width=520,height=780");
  w.document.write(html);
  w.document.close();
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
const SalesmanPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    salesman_name: "",
    phone: "",
    cnic: "",
    commission: "",
  });

  useEffect(() => {
    fetchSalesmen();
  }, []);

  const fetchSalesmen = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setSalesmen(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("error", "Server connection error!");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const openAdd = () => {
    setForm({
      salesman_name: "",
      phone: "",
      cnic: "",
      commission: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      salesman_name: s.salesman_name || "",
      phone: s.phone || "",
      cnic: s.cnic || "",
      commission: s.commission || "",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.salesman_name.trim()) {
      showToast("error", t.errorMsg);
      return;
    }

    const payload = {
      salesman_name: form.salesman_name,
      phone: form.phone,
      cnic: form.cnic,
      commission: form.commission ? Number(form.commission) : 0,
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, payload);
      } else {
        await axios.post(API_BASE, payload);
      }
      showToast("success", t.successSave);
      fetchSalesmen();
      setShowForm(false);
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", "Error saving record! Check Node.js console.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchSalesmen();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "Error deleting record!");
    }
  };

  const filtered = salesmen.filter((s) =>
    [s.salesman_name, s.phone, s.cnic].some((v) =>
      (v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const formFields = [
    { key: "salesman_name", label: t.salesmanName, icon: "bi-person-badge", type: "text" },
    { key: "phone", label: t.phone, icon: "bi-telephone", type: "text" },
    { key: "cnic", label: t.cnic, icon: "bi-credit-card-2-front", type: "text" },
    { key: "commission", label: t.commission, icon: "bi-cash", type: "number" },
  ];

  return (
    <div
      dir={dir}
      style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }}
      className="min-h-screen bg-slate-50 p-6 pb-20"
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      {isUrdu && (
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap"
          rel="stylesheet"
        />
      )}

      {/* Toast */}
      {message.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 transition-all ${
            message.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          <i
            className={`bi ${
              message.type === "error"
                ? "bi-exclamation-triangle"
                : "bi-check-circle"
            }`}
          ></i>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow"
          >
            <i className="bi bi-translate"></i>
            {t.toggleLang}
          </button>

          <button
            onClick={() => downloadAllPdf(filtered, lang)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            <i className="bi bi-file-earmark-pdf"></i>
            {t.downloadPdf}
          </button>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            <i className="bi bi-person-plus-fill"></i>
            {t.addBtn}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <i
            className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
              isUrdu ? "right-3" : "left-3"
            }`}
          ></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
            }`}
          />
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir={dir}>
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <i className="bi bi-person-badge text-blue-600 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? t.edit : t.addBtn}
                </h2>
              </div>

              <div className="space-y-4">
                {formFields.map(({ key, label, icon, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {label} {key === "salesman_name" && "*"}
                    </label>
                    <div className="relative">
                      <i
                        className={`bi ${icon} absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                          isUrdu ? "right-3" : "left-3"
                        }`}
                      ></i>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                        } ${type === "number" ? "font-mono" : ""}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`flex gap-3 mt-6 pt-4 border-t border-slate-100 ${
                  isUrdu ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
                >
                  <i className="bi bi-save"></i> {t.save}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition shadow"
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
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.salesmanName}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.phone}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.cnic}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-left" : "text-right"}`}>{t.commission}</th>
                  <th className="px-5 py-3 text-center">{t.status}</th>
                  <th className="px-5 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2">{t.loading}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id} className="hover:bg-blue-50 transition">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>

                      <td className="px-5 py-3.5">
                        <div className={`flex items-center gap-2.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <i className="bi bi-person-fill text-blue-500 text-sm"></i>
                          </div>
                          <span className="font-semibold text-slate-800">{s.salesman_name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-slate-600 font-mono text-xs ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <i className="bi bi-telephone text-slate-400"></i>
                          {s.phone || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 font-mono text-xs text-slate-500 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <i className="bi bi-credit-card-2-front text-slate-400"></i>
                          {s.cnic || "—"}
                        </span>
                      </td>

                      <td className={`px-5 py-3.5 font-mono font-bold text-emerald-600 ${isUrdu ? "text-left" : "text-right"}`}>
                        ₨ {Number(s.commission || 0).toLocaleString("en-PK")}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                          {t.active}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button
                            onClick={() => openEdit(s)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            onClick={() => handleDelete(s.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>

                          <button
                            onClick={() => printSlip(s, lang)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                          >
                            <i className="bi bi-printer"></i>
                          </button>

                          <button
                            onClick={() => downloadSalesmanPdf(s, lang)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                          >
                            <i className="bi bi-file-earmark-arrow-down"></i>
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

export default SalesmanPage;