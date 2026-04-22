import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Purchase Report",
    subtitle: "View and filter your purchase records",
    fromDate: "From Date",
    toDate: "To Date",
    supplier: "Supplier",
    allSuppliers: "-- All Suppliers --",
    showReport: "Show Report",
    results: "Results",
    totalAmount: "Total Amount",
    grandTotal: "Grand Total",
    invoiceNo: "Invoice No",
    date: "Date",
    amount: "Amount",
    status: "Status",
    paid: "Paid",
    pending: "Pending",
    cancelled: "Cancelled",
    noRecords: "No records found.",
    toggleLang: "اردو",
    printBtn: "Print Report",
    pdfBtn: "Download PDF",
    reportHeader: "Purchase Report",
    printedOn: "Printed On",
  },
  ur: {
    title: "خریداری کی رپورٹ",
    subtitle: "خریداری کے ریکارڈ دیکھیں اور فلٹر کریں",
    fromDate: "شروع کی تاریخ",
    toDate: "ختم کی تاریخ",
    supplier: "سپلائر",
    allSuppliers: "-- تمام سپلائرز --",
    showReport: "رپورٹ دیکھیں",
    results: "نتائج",
    totalAmount: "کل رقم",
    grandTotal: "مجموعی کل",
    invoiceNo: "انوائس نمبر",
    date: "تاریخ",
    amount: "رقم",
    status: "حالت",
    paid: "ادا شدہ",
    pending: "زیر التواء",
    cancelled: "منسوخ",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "رپورٹ پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "خریداری کی رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
  },
};

const API_BASE = "http://localhost:5000/api";

const PurchaseReportPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (v) => Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });

  const [records, setRecords] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ from_date: "", to_date: "", supplier_id: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    axios.get(`${API_BASE}/suppliers`)
      .then(r => setSuppliers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        // Fallback Mock Data
        setSuppliers([{ id: 1, name: "Ali Traders" }, { id: 2, name: "Global Tech" }]);
      });
      
    // Fetch initial report without filters
    fetchReport(true);
  }, []);

  const fetchReport = async (isInitial = false) => {
    setMessage({ type: "", text: "" });
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    if (filters.supplier_id) params.append("supplier_id", filters.supplier_id);
    
    try {
      const r = await axios.get(`${API_BASE}/purchase-report?${params.toString()}`);
      setRecords(Array.isArray(r.data) ? r.data : []);
    } catch (error) {
      // Mock Data if API is down
      setRecords([
        { id: 1, invoice_no: "PI-1001", supplier_name: "Ali Traders", invoice_date: "2024-10-20", total_amount: 150000, status: "paid" },
        { id: 2, invoice_no: "PI-1005", supplier_name: "Global Tech", invoice_date: "2024-10-25", total_amount: 85000, status: "pending" },
        { id: 3, invoice_no: "PI-1012", supplier_name: "Ali Traders", invoice_date: "2024-10-28", total_amount: 25000, status: "cancelled" },
      ]);
    }
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const totalAmount = records.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    
    const rowsHtml = records.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${r.invoice_no}</strong></td>
        <td>${r.supplier_name || "-"}</td>
        <td>${r.invoice_date || "-"}</td>
        <td>${t[r.status.toLowerCase()] || r.status}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; color: #047857; font-weight: bold;">₨ ${fmt(r.total_amount)}</td>
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
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 20px; }
          .brand { font-size: 28px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 13px; color: #475569; }
          
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
          th { background: #1e40af; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; border: 1px solid #1e3a8a; }
          td { border: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #f8fafc; }
          
          .grand-total { text-align: ${isUrdu ? "left" : "right"}; font-size: 20px; font-weight: bold; color: #0f172a; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .grand-total span { color: #047857; font-family: monospace; }
          
          .print-instruct { background: #eff6ff; color: #1d4ed8; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #bfdbfe; }
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
              ${filters.from_date || filters.to_date ? `<div style="margin-top:5px;">Period: ${filters.from_date || 'Start'} to ${filters.to_date || 'End'}</div>` : ""}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t.invoiceNo}</th>
                <th>${t.supplier}</th>
                <th>${t.date}</th>
                <th>${t.status}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'}">${t.amount}</th>
              </tr>
            </thead>
            <tbody>
              ${records.length > 0 ? rowsHtml : `<tr><td colspan="6" style="text-align:center;">${t.noRecords}</td></tr>`}
            </tbody>
          </table>

          ${records.length > 0 ? `
            <div class="grand-total">
              ${t.grandTotal}: <span>₨ ${fmt(totalAmount)}</span>
            </div>
          ` : ""}
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
    <div dir={dir} style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }} className="min-h-screen bg-slate-50 p-6">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {isUrdu && <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet" />}

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
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* Error Alert */}
        {message.text && (
          <div className={`mb-5 text-sm font-bold px-4 py-3 rounded-lg flex items-center gap-2 border ${message.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
            <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle" : "bi-check-circle"}`}></i>
            {message.text}
          </div>
        )}

        {/* ── Filter Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fromDate}</label>
              <div className="relative">
                <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <input type="date" name="from_date" value={filters.from_date} onChange={handleChange}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.toDate}</label>
              <div className="relative">
                <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <input type="date" name="to_date" value={filters.to_date} onChange={handleChange}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.supplier}</label>
              <div className="relative">
                <i className={`bi bi-building absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <select name="supplier_id" value={filters.supplier_id} onChange={handleChange}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                  <option value="">{t.allSuppliers}</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
              </div>
            </div>

            <div className={`flex items-end ${isUrdu ? "justify-start" : "justify-end"}`}>
              <button onClick={() => fetchReport(false)} className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg shadow flex items-center justify-center gap-2 font-semibold text-sm transition">
                <i className="bi bi-search"></i> {t.showReport}
              </button>
            </div>

          </div>
        </div>

        {/* ── Table & Actions ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <i className="bi bi-table text-slate-400"></i>
              {t.results} <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-mono">{records.length}</span>
            </h3>
            
            <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button onClick={() => generatePrintDocument(false)} disabled={records.length === 0} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="bi bi-printer text-blue-600"></i> {t.printBtn}
              </button>
              <button onClick={() => generatePrintDocument(true)} disabled={records.length === 0} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-white text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.invoiceNo}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.supplier}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.status}</th>
                  <th className="px-5 py-3 text-right">{t.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id} className="hover:bg-blue-50 transition">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                          <i className="bi bi-receipt text-xs"></i> {r.invoice_no}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{r.supplier_name}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{r.invoice_date || "-"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          (r.status || "").toLowerCase() === "paid" ? "bg-emerald-100 text-emerald-700" : 
                          (r.status || "").toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" : 
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {t[(r.status || "").toLowerCase()] || r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600">₨ {fmt(r.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Grand Total */}
          {records.length > 0 && (
            <div className={`p-5 border-t border-slate-200 bg-emerald-50/50 flex ${isUrdu ? "justify-start" : "justify-end"}`}>
              <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">{t.grandTotal}:</span>
                <span className="text-2xl font-bold font-mono text-emerald-700">₨ {fmt(totalAmount)}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PurchaseReportPage;