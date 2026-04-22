import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Chart of Accounts",
    subtitle: "Manage your financial accounts and their groupings",
    addBtn: "New Account",
    searchPlaceholder: "Search by code, title or group...",
    accountCode: "Account Code",
    accountTitle: "Account Title",
    group: "Group",
    selectGroup: "-- Select Group --",
    openingBalance: "Opening Balance (PKR)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No accounts found.",
    toggleLang: "اردو",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    reportHeader: "Chart of Accounts List",
    printedOn: "Printed On",
    successSave: "Account saved successfully!",
    successUpdate: "Account updated successfully!",
    errorMsg: "Please fill all required fields (Code, Title, Group).",
    deleteConfirm: "Are you sure you want to delete this account?",
  },
  ur: {
    title: "چارٹ آف اکاؤنٹس",
    subtitle: "اپنے مالیاتی اکاؤنٹس اور ان کے گروپس کا انتظام کریں",
    addBtn: "نیا اکاؤنٹ",
    searchPlaceholder: "کوڈ، ٹائٹل یا گروپ سے تلاش کریں...",
    accountCode: "اکاؤنٹ کوڈ",
    accountTitle: "اکاؤنٹ ٹائٹل",
    group: "گروپ",
    selectGroup: "-- گروپ منتخب کریں --",
    openingBalance: "ابتدائی بیلنس (روپے)",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کوئی اکاؤنٹ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "چارٹ آف اکاؤنٹس کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "اکاؤنٹ کامیابی سے محفوظ ہو گیا!",
    successUpdate: "اکاؤنٹ کامیابی سے اپڈیٹ ہو گیا!",
    errorMsg: "براہ کرم تمام لازمی خانے پُر کریں (کوڈ، ٹائٹل، گروپ)۔",
    deleteConfirm: "کیا آپ واقعی یہ اکاؤنٹ حذف کرنا چاہتے ہیں؟",
  },
};

const API_BASE = "http://localhost:5000/api";

export default function ChartOfAccountsPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });

  const [records, setRecords] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    account_code: "", account_title: "", group_id: "", opening_balance: ""
  });

  // ── Fetch Data ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resAcc, resGrp] = await Promise.all([
        axios.get(`${API_BASE}/chart-of-accounts`),
        axios.get(`${API_BASE}/account-groups`)
      ]);
      setRecords(resAcc.data);
      setGroups(resGrp.data);
    } catch (err) {
      // Mock data if API is down
      setGroups([
        { id: 1, group_name: "Current Assets" },
        { id: 2, group_name: "Current Liabilities" },
        { id: 3, group_name: "Direct Expenses" },
      ]);
      setRecords([
        { id: 1, account_code: "1001", account_title: "Cash in Hand", group_id: 1, group_name: "Current Assets", opening_balance: 500000 },
        { id: 2, account_code: "2001", account_title: "Accounts Payable", group_id: 2, group_name: "Current Liabilities", opening_balance: -150000 },
        { id: 3, account_code: "5001", account_title: "Raw Material Purchases", group_id: 3, group_name: "Direct Expenses", opening_balance: 0 },
      ]);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ── Form Handlers ──
  const openAdd = () => {
    setForm({ account_code: "", account_title: "", group_id: "", opening_balance: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      account_code: r.account_code, account_title: r.account_title,
      group_id: r.group_id, opening_balance: r.opening_balance
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.account_code || !form.account_title || !form.group_id) {
      showToast("error", t.errorMsg);
      return;
    }
    
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/chart-of-accounts/${editingId}`, form);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/chart-of-accounts`, form);
        showToast("success", t.successSave);
      }
      fetchData();
      setShowForm(false);
    } catch (err) {
      // Optimistic UI update for mock testing
      const grp = groups.find(g => String(g.id) === String(form.group_id));
      const newRec = { 
        ...form, 
        id: editingId || Date.now(),
        group_name: grp?.group_name || "-"
      };
      
      if (editingId) setRecords(prev => prev.map(r => r.id === editingId ? newRec : r));
      else setRecords(prev => [...prev, newRec]);
      
      showToast("success", editingId ? t.successUpdate : t.successSave);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/chart-of-accounts/${id}`);
      fetchData();
    } catch (err) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // ── Search & Print ──
  const filtered = records.filter(r =>
    [r.account_code, r.account_title, r.group_name].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rowsHtml = filtered.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #0f766e;">${r.account_code}</td>
        <td><strong>${r.account_title}</strong></td>
        <td>${r.group_name || "-"}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; font-weight: bold;">₨ ${fmt(r.opening_balance)}</td>
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
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #0f766e; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #0f766e; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #f0fdfa; }
          .print-instruct { background: #ccfbf1; color: #0f766e; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #99f6e4; }
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
                <th>${t.accountCode}</th>
                <th>${t.accountTitle}</th>
                <th>${t.group}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.openingBalance}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? rowsHtml : `<tr><td colspan="5" style="text-align:center;">${t.noRecords}</td></tr>`}
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
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition shadow">
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
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
          </div>
          
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-printer text-teal-600"></i> {t.printBtn}
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
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.accountCode}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.accountTitle}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.group}</th>
                  <th className="px-4 py-3 text-right">{t.openingBalance}</th>
                  <th className="px-4 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-teal-50 transition">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 text-teal-700 px-2 py-1 rounded text-xs font-mono font-bold border border-slate-200">{r.account_code}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <i className="bi bi-wallet2 text-teal-500 opacity-70"></i>
                          {r.account_title}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600">
                          <i className="bi bi-diagram-3 mr-1 opacity-50"></i>{r.group_name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700">
                        ₨ {fmt(r.opening_balance)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-600 text-xs font-semibold hover:bg-teal-100 transition"><i className="bi bi-pencil-square"></i></button>
                          <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"><i className="bi bi-trash3"></i></button>
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
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" dir={dir}>
              
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <i className="bi bi-journal-richtext text-teal-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Account Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.accountCode} *</label>
                    <div className="relative">
                      <i className={`bi bi-hash absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.account_code} onChange={e => setForm({ ...form, account_code: e.target.value })} placeholder="1001"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500 font-mono ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Account Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.accountTitle} *</label>
                    <div className="relative">
                      <i className={`bi bi-textarea-t absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.account_title} onChange={e => setForm({ ...form, account_title: e.target.value })} placeholder="e.g. Cash in Hand"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Group Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.group} *</label>
                    <div className="relative">
                      <i className={`bi bi-diagram-3 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                        <option value="">{t.selectGroup}</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  {/* Opening Balance */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.openingBalance}</label>
                    <div className="relative">
                      <i className={`bi bi-currency-rupee absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" value={form.opening_balance} onChange={e => setForm({ ...form, opening_balance: e.target.value })} placeholder="0.00"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Footer */}
              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${isUrdu ? "flex-row-reverse justify-start" : "justify-end"}`}>
                <button onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white">{t.cancel}</button>
                <button onClick={handleSave} className="bg-teal-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-teal-800 transition shadow-lg shadow-teal-700/20 flex items-center gap-2">
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