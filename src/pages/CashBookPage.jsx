import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Daily Cash Book",
    subtitle: "Manage daily cash inflows, outflows, and running balance",
    addBtn: "New Entry",
    searchPlaceholder: "Search by description or date...",
    date: "Date",
    description: "Description",
    cashIn: "Cash In (PKR)",
    cashOut: "Cash Out (PKR)",
    balance: "Balance",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No cash transactions found.",
    toggleLang: "اردو",
    printBtn: "Print Book",
    pdfBtn: "Download PDF",
    reportHeader: "Daily Cash Book Report",
    printedOn: "Printed On",
    successSave: "Entry saved successfully!",
    successUpdate: "Entry updated successfully!",
    errorMsg: "Please provide a description and either Cash In or Cash Out.",
    deleteConfirm: "Are you sure you want to delete this entry?",
  },
  ur: {
    title: "روزنامچہ (کیش بک)",
    subtitle: "روزانہ کی نقد آمدن، اخراجات اور رننگ بیلنس کا انتظام کریں",
    addBtn: "نیا اندراج",
    searchPlaceholder: "تفصیل یا تاریخ سے تلاش کریں...",
    date: "تاریخ",
    description: "تفصیل",
    cashIn: "کیش ان (روپے)",
    cashOut: "کیش آؤٹ (روپے)",
    balance: "بیلنس",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کیش کی کوئی ٹرانزیکشن نہیں ملی۔",
    toggleLang: "English",
    printBtn: "کیش بک پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "ڈیلی کیش بک رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "اندراج کامیابی سے محفوظ ہو گیا!",
    successUpdate: "اندراج کامیابی سے اپڈیٹ ہو گیا!",
    errorMsg: "براہ کرم تفصیل لکھیں اور کیش ان یا کیش آؤٹ کی رقم درج کریں۔",
    deleteConfirm: "کیا آپ واقعی یہ اندراج حذف کرنا چاہتے ہیں؟",
  },
};

const API_BASE = "http://localhost:5000/api";

export default function CashBookPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0], 
    description: "", 
    cash_in: "", 
    cash_out: ""
  });

  // ── Fetch Data ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cash-book`);
      setRecords(res.data);
    } catch (err) {
      // Mock data if API is down
      setRecords([
        { id: 1, entry_date: "2024-10-20", description: "Opening Balance", cash_in: 50000, cash_out: 0 },
        { id: 2, entry_date: "2024-10-21", description: "Office Supplies", cash_in: 0, cash_out: 2500 },
        { id: 3, entry_date: "2024-10-22", description: "Cash Sales (Counter)", cash_in: 12000, cash_out: 0 },
        { id: 4, entry_date: "2024-10-23", description: "Tea & Refreshments", cash_in: 0, cash_out: 500 },
      ]);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ── Form Handlers ──
  const openAdd = () => {
    setForm({ entry_date: new Date().toISOString().split("T")[0], description: "", cash_in: "", cash_out: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      entry_date: r.entry_date, 
      description: r.description, 
      cash_in: r.cash_in || "", 
      cash_out: r.cash_out || ""
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.description.trim() || (!form.cash_in && !form.cash_out)) {
      showToast("error", t.errorMsg);
      return;
    }
    
    // Convert empty inputs to 0
    const submitData = {
      ...form,
      cash_in: form.cash_in || 0,
      cash_out: form.cash_out || 0
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/cash-book/${editingId}`, submitData);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/cash-book`, submitData);
        showToast("success", t.successSave);
      }
      fetchData();
      setShowForm(false);
    } catch (err) {
      // Optimistic UI update for mock testing
      const newRec = { ...submitData, id: editingId || Date.now() };
      
      if (editingId) setRecords(prev => prev.map(r => r.id === editingId ? newRec : r));
      else setRecords(prev => [...prev, newRec]);
      
      showToast("success", editingId ? t.successUpdate : t.successSave);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/cash-book/${id}`);
      fetchData();
    } catch (err) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // ── Calculate Running Balance & Filter ──
  let runningBalance = 0;
  const processedRecords = [...records]
    .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date)) // Sort chronologically
    .map(r => {
      runningBalance = runningBalance + Number(r.cash_in || 0) - Number(r.cash_out || 0);
      return { ...r, balance: runningBalance };
    });

  const filtered = processedRecords.filter(r =>
    [r.description, r.entry_date].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const totalIn = filtered.reduce((sum, r) => sum + Number(r.cash_in || 0), 0);
  const totalOut = filtered.reduce((sum, r) => sum + Number(r.cash_out || 0), 0);

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rowsHtml = filtered.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td style="white-space: nowrap;">${r.entry_date || "-"}</td>
        <td><strong>${r.description}</strong></td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; color: #047857;">${Number(r.cash_in) > 0 ? fmt(r.cash_in) : "-"}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; color: #b91c1c;">${Number(r.cash_out) > 0 ? fmt(r.cash_out) : "-"}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; font-weight: bold; color: #1e40af;">${fmt(r.balance)}</td>
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
          .report-container { max-width: 900px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;}
          th { background: #059669; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #ecfdf5; }
          .totals-row td { background: #d1fae5 !important; font-weight: bold; border-top: 2px solid #059669; font-size: 14px; color: #0f172a;}
          .print-instruct { background: #d1fae5; color: #059669; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #a7f3d0; }
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
                <th>${t.date}</th>
                <th>${t.description}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.cashIn}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.cashOut}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.balance}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? rowsHtml : `<tr><td colspan="6" style="text-align:center;">${t.noRecords}</td></tr>`}
            </tbody>
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition">
            <i className="bi bi-translate"></i>{t.toggleLang}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow">
            <i className="bi bi-plus-lg"></i>{t.addBtn}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* ── Search & Actions ── */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
          </div>
          
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-printer text-emerald-600"></i> {t.printBtn}
            </button>
            <button onClick={() => generatePrintDocument(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.description}</th>
                  <th className="px-4 py-3 text-right">{t.cashIn}</th>
                  <th className="px-4 py-3 text-right">{t.cashOut}</th>
                  <th className="px-4 py-3 text-right">{t.balance}</th>
                  <th className="px-4 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-emerald-50 transition">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{r.entry_date || "-"}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <i className="bi bi-wallet2 text-emerald-500 opacity-70"></i>
                          {r.description}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                        {Number(r.cash_in) > 0 ? `₨ ${fmt(r.cash_in)}` : "-"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-red-500">
                        {Number(r.cash_out) > 0 ? `₨ ${fmt(r.cash_out)}` : "-"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700 bg-blue-50/40">
                        ₨ {fmt(r.balance)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition"><i className="bi bi-pencil-square"></i></button>
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
                    <td colSpan={3} className={`px-4 py-4 text-xs uppercase tracking-wider ${isUrdu ? "text-left" : "text-right"}`}>Total Summary</td>
                    <td className="px-4 py-4 text-right font-mono text-emerald-700 text-sm">₨ {fmt(totalIn)}</td>
                    <td className="px-4 py-4 text-right font-mono text-red-600 text-sm">₨ {fmt(totalOut)}</td>
                    <td className="px-4 py-4 text-right font-mono text-blue-700 text-lg">₨ {fmt(runningBalance)}</td>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" dir={dir}>
              
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <i className="bi bi-cash-coin text-emerald-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.date} *</label>
                    <div className="relative">
                      <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.description} *</label>
                    <div className="relative">
                      <i className={`bi bi-justify-left absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Sales, Rent, Purchases..."
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Cash In */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-800 mb-1">{t.cashIn}</label>
                    <div className="relative">
                      <i className={`bi bi-arrow-down-left-circle absolute top-1/2 -translate-y-1/2 text-emerald-500 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.cash_in} onChange={e => setForm({ ...form, cash_in: e.target.value, cash_out: e.target.value > 0 ? "" : form.cash_out })} placeholder="0.00"
                        className={`w-full border border-emerald-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-700 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Cash Out */}
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <label className="block text-xs font-bold text-red-800 mb-1">{t.cashOut}</label>
                    <div className="relative">
                      <i className={`bi bi-arrow-up-right-circle absolute top-1/2 -translate-y-1/2 text-red-500 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.cash_out} onChange={e => setForm({ ...form, cash_out: e.target.value, cash_in: e.target.value > 0 ? "" : form.cash_in })} placeholder="0.00"
                        className={`w-full border border-red-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 font-mono font-bold text-red-600 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Footer */}
              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${isUrdu ? "flex-row-reverse justify-start" : "justify-end"}`}>
                <button onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white">{t.cancel}</button>
                <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center gap-2">
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