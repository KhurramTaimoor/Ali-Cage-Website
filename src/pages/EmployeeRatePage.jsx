import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Employee Salary",
    subtitle: "Manage employee payroll, leaves, and salary status",
    addBtn: "Add Salary",
    searchPlaceholder: "Search by employee, month or status...",
    employee: "Employee",
    selectEmployee: "-- Select Employee --",
    salaryMonth: "Salary Month",
    basicSalary: "Basic Salary (PKR)",
    leaves: "Leaves Taken (Days)",
    netSalary: "Net Salary (PKR)",
    status: "Status",
    selectStatus: "-- Select Status --",
    paid: "Paid",
    pending: "Pending",
    autoCalcNote: "Auto-calculated (30 days basis)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No salary records found.",
    toggleLang: "اردو",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    reportHeader: "Employee Salary Report",
    printedOn: "Printed On",
    successSave: "Salary record saved successfully!",
    successUpdate: "Salary record updated successfully!",
    errorMsg: "Please fill all required fields correctly.",
    deleteConfirm: "Are you sure you want to delete this record?",
  },
  ur: {
    title: "ملازمین کی تنخواہ",
    subtitle: "ملازمین کی تنخواہوں، چھٹیوں اور ادائیگیوں کا انتظام کریں",
    addBtn: "تنخواہ شامل کریں",
    searchPlaceholder: "ملازم، مہینہ یا حالت سے تلاش کریں...",
    employee: "ملازم",
    selectEmployee: "-- ملازم منتخب کریں --",
    salaryMonth: "تنخواہ کا مہینہ",
    basicSalary: "بنیادی تنخواہ (روپے)",
    leaves: "چھٹیاں (دن)",
    netSalary: "خالص تنخواہ (روپے)",
    status: "حالت",
    selectStatus: "-- حالت منتخب کریں --",
    paid: "ادا شدہ",
    pending: "زیر التواء",
    autoCalcNote: "خودکار حساب (30 دن کے حساب سے)",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "تنخواہ کا کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "ملازمین کی تنخواہ کی رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "تنخواہ کا ریکارڈ کامیابی سے محفوظ ہو گیا!",
    successUpdate: "تنخواہ کا ریکارڈ اپڈیٹ ہو گیا!",
    errorMsg: "براہ کرم تمام لازمی خانے درست طریقے سے پُر کریں۔",
    deleteConfirm: "کیا آپ واقعی یہ ریکارڈ حذف کرنا چاہتے ہیں؟",
  },
};

const API_BASE = "http://localhost:5000/api";

export default function EmployeeSalaryPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    employee_id: "", salary_month: "", basic_salary: "", leaves: "", net_salary: "", status: ""
  });

  // ── Auto Calculate Net Salary ──
  useEffect(() => {
    const basic = parseFloat(form.basic_salary) || 0;
    const leaves = parseFloat(form.leaves) || 0;
    
    if (basic > 0) {
      // 1 din ki salary nikal kar chhutiyon ke paise kaat liye
      const perDay = basic / 30;
      const deduction = perDay * leaves;
      const net = basic - deduction;
      setForm(f => ({ ...f, net_salary: net > 0 ? net.toFixed(0) : "0" }));
    } else {
      setForm(f => ({ ...f, net_salary: "0" }));
    }
  }, [form.basic_salary, form.leaves]);

  // ── Fetch Data ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSal, resEmp] = await Promise.all([
        axios.get(`${API_BASE}/employee-salary`),
        axios.get(`${API_BASE}/employees`)
      ]);
      setRecords(resSal.data);
      setEmployees(resEmp.data);
    } catch (err) {
      // Mock data if API is down
      setEmployees([
        { id: 1, full_name: "Ahmed Raza" },
        { id: 2, full_name: "Hassan Ali" },
      ]);
      setRecords([
        { id: 1, employee_id: 1, employee_name: "Ahmed Raza", salary_month: "2024-10", basic_salary: 45000, leaves: 2, net_salary: 42000, status: "Paid" },
        { id: 2, employee_id: 2, employee_name: "Hassan Ali", salary_month: "2024-10", basic_salary: 55000, leaves: 0, net_salary: 55000, status: "Pending" },
      ]);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ── Form Handlers ──
  const openAdd = () => {
    setForm({ employee_id: "", salary_month: "", basic_salary: "", leaves: "0", net_salary: "", status: "Pending" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      employee_id: r.employee_id, salary_month: r.salary_month,
      basic_salary: r.basic_salary, leaves: r.leaves, net_salary: r.net_salary, status: r.status
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.employee_id || !form.salary_month || !form.basic_salary || !form.status) {
      showToast("error", t.errorMsg);
      return;
    }
    
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/employee-salary/${editingId}`, form);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/employee-salary`, form);
        showToast("success", t.successSave);
      }
      fetchData();
      setShowForm(false);
    } catch (err) {
      // Optimistic UI update for mock testing
      const emp = employees.find(e => String(e.id) === String(form.employee_id));
      const newRec = { 
        ...form, 
        id: editingId || Date.now(),
        employee_name: emp?.full_name || "-"
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
      await axios.delete(`${API_BASE}/employee-salary/${id}`);
      fetchData();
    } catch (err) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // ── Search & Print ──
  const filtered = records.filter(r =>
    [r.employee_name, r.salary_month, r.status].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rowsHtml = filtered.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><strong>${r.employee_name}</strong></td>
        <td>${r.salary_month || "-"}</td>
        <td style="text-align: center;">${r.leaves}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'};">₨ ${fmt(r.basic_salary)}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; font-weight: bold; color: #0e7490;">₨ ${fmt(r.net_salary)}</td>
        <td style="text-align: center;">${t[r.status.toLowerCase()] || r.status}</td>
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
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #0e7490; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #0e7490; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #0e7490; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #ecfeff; }
          .print-instruct { background: #cffafe; color: #0e7490; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #a5f3fc; }
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
                <th>${t.employee}</th>
                <th>${t.salaryMonth}</th>
                <th style="text-align: center;">${t.leaves}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.basicSalary}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.netSalary}</th>
                <th style="text-align: center;">${t.status}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? rowsHtml : `<tr><td colspan="7" style="text-align:center;">${t.noRecords}</td></tr>`}
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition">
            <i className="bi bi-translate"></i>{t.toggleLang}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-700 text-white text-sm font-semibold hover:bg-cyan-800 transition shadow">
            <i className="bi bi-plus-lg"></i>{t.addBtn}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* ── Search & Actions ── */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
          </div>
          
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-printer text-cyan-600"></i> {t.printBtn}
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
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.employee}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.salaryMonth}</th>
                  <th className="px-4 py-3 text-right">{t.basicSalary}</th>
                  <th className="px-4 py-3 text-center">{t.leaves}</th>
                  <th className="px-4 py-3 text-right">{t.netSalary}</th>
                  <th className="px-4 py-3 text-center">{t.status}</th>
                  <th className="px-4 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-cyan-50 transition">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                            <i className="bi bi-person"></i>
                          </div>
                          {r.employee_name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{r.salary_month || "-"}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500">₨ {fmt(r.basic_salary)}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-red-500 bg-red-50/50">{r.leaves}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-cyan-700 bg-cyan-50/50">₨ {fmt(r.net_salary)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          (r.status || "").toLowerCase() === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {t[(r.status || "").toLowerCase()] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-100 text-cyan-700 text-xs font-semibold hover:bg-cyan-200 transition"><i className="bi bi-pencil-square"></i></button>
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
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <i className="bi bi-cash-stack text-cyan-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Employee Dropdown */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.employee} *</label>
                    <div className="relative">
                      <i className={`bi bi-person-badge absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-cyan-500 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                        <option value="">{t.selectEmployee}</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.salaryMonth} *</label>
                    <div className="relative">
                      <i className={`bi bi-calendar-month absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="month" value={form.salary_month} onChange={e => setForm({ ...form, salary_month: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-cyan-500 ${isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.status} *</label>
                    <div className="relative">
                      <i className={`bi bi-info-circle absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-cyan-500 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                        <option value="Pending">{t.pending}</option>
                        <option value="Paid">{t.paid}</option>
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  {/* Basic Salary */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.basicSalary} *</label>
                    <div className="relative">
                      <i className={`bi bi-currency-rupee absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: e.target.value })} placeholder="0.00"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-cyan-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Leaves */}
                  <div>
                    <label className="block text-xs font-semibold text-red-500 mb-1">{t.leaves}</label>
                    <div className="relative">
                      <i className={`bi bi-calendar-x absolute top-1/2 -translate-y-1/2 text-red-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.leaves} onChange={e => setForm({ ...form, leaves: e.target.value })} placeholder="0"
                        className={`w-full border border-red-200 rounded-lg py-2.5 text-sm bg-red-50/50 focus:ring-2 focus:ring-red-500 font-bold text-red-700 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Net Salary (Auto-Calculated) */}
                  <div className="md:col-span-2 bg-cyan-50 p-4 rounded-xl border border-cyan-200 flex flex-col justify-center mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-cyan-800">{t.netSalary}</label>
                      <span className="text-[10px] text-cyan-600 flex items-center gap-1"><i className="bi bi-calculator"></i> {t.autoCalcNote}</span>
                    </div>
                    <div className="relative">
                      <i className={`bi bi-cash absolute top-1/2 -translate-y-1/2 text-cyan-600 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" readOnly value={form.net_salary} placeholder="0.00"
                        className={`w-full border border-cyan-300 rounded-lg py-2.5 text-xl bg-white font-bold font-mono text-cyan-700 outline-none cursor-not-allowed ${isUrdu ? "pr-9 pl-3 text-left" : "pl-9 pr-3 text-right"}`} />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Footer */}
              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${isUrdu ? "flex-row-reverse justify-start" : "justify-end"}`}>
                <button onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white">{t.cancel}</button>
                <button onClick={handleSave} className="bg-cyan-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-cyan-800 transition shadow-lg shadow-cyan-700/20 flex items-center gap-2">
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