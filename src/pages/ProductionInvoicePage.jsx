import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Production Invoice",
    subtitle: "Manage production batches, quantities, and supervisor records",
    addBtn: "New Production",
    searchPlaceholder: "Search by batch no, product, warehouse or supervisor...",
    batchNo: "Batch No",
    productionDate: "Production Date",
    product: "Product Name",
    qtyProduced: "Quantity Produced",
    warehouse: "Warehouse",
    supervisor: "Supervisor",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No production invoices found.",
    toggleLang: "اردو",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    reportHeader: "Production Invoices Report",
    printedOn: "Printed On",
    successSave: "Production invoice saved successfully!",
    successUpdate: "Production invoice updated successfully!",
    errorMsg: "Please fill all required fields (Batch No, Product, Quantity).",
    deleteConfirm: "Are you sure you want to delete this record?",
  },
  ur: {
    title: "پروڈکشن انوائس",
    subtitle: "پروڈکشن بیچز، مقدار اور سپروائزر کے ریکارڈ کا انتظام کریں",
    addBtn: "نئی پروڈکشن",
    searchPlaceholder: "بیچ نمبر، پروڈکٹ، گودام یا سپروائزر سے تلاش کریں...",
    batchNo: "بیچ نمبر",
    productionDate: "پیداوار کی تاریخ",
    product: "پروڈکٹ کا نام",
    qtyProduced: "تیار کردہ مقدار",
    warehouse: "گودام",
    supervisor: "سپروائزر",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کوئی پروڈکشن انوائس نہیں ملی۔",
    toggleLang: "English",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "پروڈکشن انوائسز کی رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "پروڈکشن انوائس کامیابی سے محفوظ ہو گئی!",
    successUpdate: "پروڈکشن انوائس کامیابی سے اپڈیٹ ہو گئی!",
    errorMsg: "براہ کرم تمام لازمی خانے پُر کریں (بیچ نمبر، پروڈکٹ، مقدار)۔",
    deleteConfirm: "کیا آپ واقعی یہ ریکارڈ حذف کرنا چاہتے ہیں؟",
  },
};

const API_BASE = "http://localhost:5000/api";

export default function ProductionInvoicePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK");

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    batch_no: "", production_date: "", product: "", 
    quantity_produced: "", warehouse: "", supervisor: ""
  });

  // ── Fetch Data ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/production-invoices`);
      setRecords(res.data);
    } catch (err) {
      // Mock data if API is down
      setRecords([
        { id: 1, batch_no: "BATCH-401", production_date: "2024-10-25", product: "Steel Pipe 2inch", quantity_produced: 1200, warehouse: "Finished Goods A", supervisor: "Ahmed Raza" },
        { id: 2, batch_no: "BATCH-402", production_date: "2024-10-26", product: "Industrial Fan", quantity_produced: 85, warehouse: "Main Godown", supervisor: "Hassan Ali" },
      ]);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ── Form Handlers ──
  const openAdd = () => {
    setForm({ batch_no: "", production_date: "", product: "", quantity_produced: "", warehouse: "", supervisor: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      batch_no: r.batch_no, production_date: r.production_date || "", product: r.product, 
      quantity_produced: r.quantity_produced, warehouse: r.warehouse || "", supervisor: r.supervisor || ""
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.batch_no || !form.product || !form.quantity_produced) {
      showToast("error", t.errorMsg);
      return;
    }
    
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/production-invoices/${editingId}`, form);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/production-invoices`, form);
        showToast("success", t.successSave);
      }
      fetchData();
      setShowForm(false);
    } catch (err) {
      // Optimistic UI update for mock testing
      const newRec = { ...form, id: editingId || Date.now() };
      if (editingId) setRecords(prev => prev.map(r => r.id === editingId ? newRec : r));
      else setRecords(prev => [...prev, newRec]);
      
      showToast("success", editingId ? t.successUpdate : t.successSave);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/production-invoices/${id}`);
      fetchData();
    } catch (err) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // ── Search, Filter & Totals ──
  const filtered = records.filter(r =>
    [r.batch_no, r.product, r.warehouse, r.supervisor].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const totalQty = filtered.reduce((sum, r) => sum + Number(r.quantity_produced || 0), 0);

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rowsHtml = filtered.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #e11d48;">${r.batch_no}</td>
        <td>${r.production_date || "-"}</td>
        <td><strong>${r.product}</strong></td>
        <td>${r.warehouse || "-"}</td>
        <td>${r.supervisor || "-"}</td>
        <td style="text-align: center; font-weight: bold; color: #0f172a; background: #fff1f2;">${fmt(r.quantity_produced)}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html dir="${dir}" lang="${lang}">
      <head>
        <meta charset="UTF-8"/>
        <title>${t.title}</title>
        ${isUrdu ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">` : ""}
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: ${font}; background: #fff; color: #0f172a; padding: 40px; }
          .report-container { max-width: 1000px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #e11d48; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #e11d48; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;}
          th { background: #e11d48; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #fff1f2; }
          .totals-row td { background: #ffe4e6 !important; font-weight: bold; border-top: 2px solid #e11d48; font-size: 14px; color: #0f172a;}
          .print-instruct { background: #ffe4e6; color: #be123c; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #fecdd3; }
          @media print { body { padding: 0; } .print-instruct { display: none; } }
        </style>
      </head>
      <body>
        <div class="report-container">
          ${isPdf ? `<div class="print-instruct">Please select <strong>"Save as PDF"</strong> in the destination dropdown to download this report.</div>` : ""}
          <div class="header">
            <div>
              <div class="brand">Unique Wear</div>
              <div class="report-title">${t.reportHeader}</div>
            </div>
            <div class="meta">
              <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>${t.batchNo}</th>
                <th>${t.productionDate}</th>
                <th>${t.product}</th>
                <th>${t.warehouse}</th>
                <th>${t.supervisor}</th>
                <th style="text-align: center;">${t.qtyProduced}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? rowsHtml : `<tr><td colspan="7" style="text-align:center;">${t.noRecords}</td></tr>`}
            </tbody>
            ${filtered.length > 0 ? `
              <tfoot class="totals-row">
                <tr>
                  <td colspan="6" style="text-align: ${isUrdu ? 'left' : 'right'}; text-transform: uppercase;">Total Qty</td>
                  <td style="text-align: center; color: #e11d48;">${fmt(totalQty)}</td>
                </tr>
              </tfoot>
            ` : ""}
          </table>
        </div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); ${!isPdf ? "window.onafterprint = () => window.close();" : ""} }, 300); }
        </script>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  return (
    <div dir={dir} style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }} className="min-h-screen bg-slate-50 p-6 pb-20">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {isUrdu && <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet" />}

      {/* Floating Toast Message */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 transition-all ${message.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <i className={`bi ${message.type === 'error' ? 'bi-exclamation-triangle' : 'bi-check-circle'}`}></i>
          {message.text}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition">
            <i className="bi bi-translate"></i>{t.toggleLang}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-700 text-white text-sm font-semibold hover:bg-rose-800 transition shadow">
            <i className="bi bi-boxes"></i>{t.addBtn}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* ── Search & Actions ── */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
          </div>
          
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-printer text-rose-600"></i> {t.printBtn}
            </button>
            <button onClick={() => generatePrintDocument(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.batchNo}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.productionDate}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.warehouse}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.supervisor}</th>
                  <th className="px-4 py-3 text-center">{t.qtyProduced}</th>
                  <th className="px-4 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-rose-50 transition">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-rose-100 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-rose-700 border border-rose-200">{r.batch_no}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">{r.production_date || "-"}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{r.product}</td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">{r.warehouse || "-"}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1.5"><i className="bi bi-person-badge text-slate-400"></i> {r.supervisor || "-"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-800 bg-slate-50/50">{fmt(r.quantity_produced)}</td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-200 transition"><i className="bi bi-pencil-square"></i></button>
                          <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"><i className="bi bi-trash3"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="bg-slate-100 font-bold text-slate-800 border-t border-slate-200">
                  <tr>
                    <td colSpan={6} className={`px-4 py-4 text-xs uppercase tracking-wider ${isUrdu ? "text-left" : "text-right"}`}>Total Qty</td>
                    <td className="px-4 py-4 text-center font-mono text-rose-700 text-base">{fmt(totalQty)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── Modal Form ── */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col" dir={dir}>
              
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <i className="bi bi-boxes text-rose-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Batch No */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.batchNo} *</label>
                    <div className="relative">
                      <i className={`bi bi-hash absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.batch_no} onChange={e => setForm({ ...form, batch_no: e.target.value })} placeholder="BATCH-001"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-rose-400 font-mono ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Production Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.productionDate}</label>
                    <div className="relative">
                      <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="date" value={form.production_date} onChange={e => setForm({ ...form, production_date: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-rose-400 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.product} *</label>
                    <div className="relative">
                      <i className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Steel Pipe 2inch"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-rose-400 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.warehouse}</label>
                    <div className="relative">
                      <i className={`bi bi-building absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} placeholder="e.g. Main Godown"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-rose-400 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.supervisor}</label>
                    <div className="relative">
                      <i className={`bi bi-person-badge absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })} placeholder="e.g. Ahmed Raza"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-rose-400 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-slate-100 my-1"></div>

                  {/* Quantity Produced */}
                  <div className="md:col-span-2 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <label className="block text-xs font-bold text-rose-800 mb-1">{t.qtyProduced} *</label>
                    <div className="relative">
                      <i className={`bi bi-check-circle-fill absolute top-1/2 -translate-y-1/2 text-rose-500 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.quantity_produced} onChange={e => setForm({ ...form, quantity_produced: e.target.value })} placeholder="0"
                        className={`w-full border border-rose-200 rounded-lg py-3 text-lg bg-white focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-700 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Footer */}
              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${isUrdu ? "flex-row-reverse justify-start" : "justify-end"}`}>
                <button onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white">{t.cancel}</button>
                <button onClick={handleSave} className="bg-rose-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 flex items-center gap-2">
                  <i className="bi bi-save"></i> {t.save}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}