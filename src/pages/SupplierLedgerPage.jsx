import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Supplier Ledger",
    subtitle: "View supplier account statements and transactions",
    supplier: "Supplier",
    selectSupplier: "-- Select Supplier --",
    fromDate: "From Date",
    toDate: "To Date",
    showLedger: "Show Ledger",
    totalDebit: "Total Debit",
    totalCredit: "Total Credit",
    closingBalance: "Closing Balance",
    transactions: "Transactions",
    searchPlaceholder: "Search by type, ref no or status...",
    date: "Date",
    type: "Type",
    refNo: "Ref No",
    status: "Status",
    debit: "Debit",
    credit: "Credit",
    balance: "Balance",
    noRecords: "No records found.",
    toggleLang: "اردو",
    printBtn: "Print Ledger",
    pdfBtn: "Download PDF",
    reportHeader: "Supplier Ledger Report",
    printedOn: "Printed On",
    errorMsg: "Please select a supplier first!",
  },
  ur: {
    title: "سپلائر لیجر",
    subtitle: "سپلائر کے اکاؤنٹ کی تفصیلات اور لین دین دیکھیں",
    supplier: "سپلائر",
    selectSupplier: "-- سپلائر منتخب کریں --",
    fromDate: "شروع کی تاریخ",
    toDate: "ختم کی تاریخ",
    showLedger: "لیجر دیکھیں",
    totalDebit: "کل ڈیبٹ",
    totalCredit: "کل کریڈٹ",
    closingBalance: "اختتامی بیلنس",
    transactions: "ٹرانزیکشنز",
    searchPlaceholder: "قسم، حوالہ نمبر یا حالت سے تلاش کریں...",
    date: "تاریخ",
    type: "قسم",
    refNo: "حوالہ نمبر",
    status: "حالت",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    balance: "بیلنس",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "لیجر پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "سپلائر لیجر رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
    errorMsg: "براہ کرم پہلے ایک سپلائر منتخب کریں!",
  },
};

const API_BASE = "http://localhost:5000/api";

const SupplierLedgerPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (v) => Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });

  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ supplier_id: "", from_date: "", to_date: "" });
  const [ledger, setLedger] = useState({ supplier: null, summary: null, transactions: [] });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/supplier-ledger/suppliers`)
      .then((r) => setSuppliers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        // Fallback Mock Data for Suppliers
        setSuppliers([
          { id: 1, name: "Ali Traders" },
          { id: 2, name: "Global Tech" },
        ]);
      });
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const fetchLedger = async () => {
    if (!filters.supplier_id) {
      showMessage("error", t.errorMsg);
      return;
    }
    
    setMessage({ type: "", text: "" });
    const params = new URLSearchParams();
    params.append("supplier_id", filters.supplier_id);
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);

    try {
      const response = await axios.get(`${API_BASE}/supplier-ledger?${params.toString()}`);
      setLedger({
        supplier: response.data?.supplier || null,
        summary: response.data?.summary || null,
        transactions: Array.isArray(response.data?.transactions) ? response.data.transactions : [],
      });
    } catch (error) {
      // ── MOCK LEDGER DATA (If API fails) ──
      const selectedSup = suppliers.find(s => String(s.id) === String(filters.supplier_id));
      setLedger({
        supplier: selectedSup,
        summary: { total_debit: 50000, total_credit: 150000, closing_balance: 100000 },
        transactions: [
          { id: 1, tx_date: "2024-10-01", type: "Opening Balance", ref_no: "OB-001", status: "Completed", debit: 0, credit: 50000, balance: 50000 },
          { id: 2, tx_date: "2024-10-15", type: "Purchase Invoice", ref_no: "PI-1042", status: "Paid", debit: 0, credit: 100000, balance: 150000 },
          { id: 3, tx_date: "2024-10-20", type: "Payment Sent", ref_no: "PAY-992", status: "Completed", debit: 50000, credit: 0, balance: 100000 },
        ],
      });
    }
  };

  const filteredRows = useMemo(() => {
    const s = search.toLowerCase();
    return (ledger.transactions || []).filter((row) =>
      [row.type, row.ref_no, row.status].some((v) => String(v || "").toLowerCase().includes(s))
    );
  }, [ledger.transactions, search]);

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    if (!ledger.supplier) return;
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    
    const rowsHtml = filteredRows.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.tx_date || "-"}</td>
        <td><strong>${r.type}</strong></td>
        <td style="font-family: monospace;">${r.ref_no || "-"}</td>
        <td>${r.status || "-"}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; color: #1d4ed8;">${Number(r.debit) > 0 ? fmt(r.debit) : "-"}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; color: #047857;">${Number(r.credit) > 0 ? fmt(r.credit) : "-"}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; font-weight: bold;">${fmt(r.balance)}</td>
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
          
          .summary-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .summary-item { text-align: center; flex: 1; border-right: 1px solid #e2e8f0; }
          .summary-item:last-child { border-right: none; }
          .summary-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; }
          .summary-value { font-size: 20px; font-weight: bold; }
          
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1e40af; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; border: 1px solid #1e3a8a; }
          td { border: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #f8fafc; }
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
              <div style="margin-top: 10px; font-weight: bold; font-size: 16px; color: #0f172a;">
                ${t.supplier}: ${ledger.supplier.name}
              </div>
            </div>
            <div class="meta">
              <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
              ${filters.from_date || filters.to_date ? `<div style="margin-top:5px;">Period: ${filters.from_date || 'Start'} to ${filters.to_date || 'End'}</div>` : ""}
            </div>
          </div>

          ${ledger.summary ? `
          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">${t.totalDebit}</div>
              <div class="summary-value" style="color: #1d4ed8;">₨ ${fmt(ledger.summary.total_debit)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">${t.totalCredit}</div>
              <div class="summary-value" style="color: #047857;">₨ ${fmt(ledger.summary.total_credit)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">${t.closingBalance}</div>
              <div class="summary-value" style="color: #b45309;">₨ ${fmt(ledger.summary.closing_balance)}</div>
            </div>
          </div>
          ` : ""}

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t.date}</th>
                <th>${t.type}</th>
                <th>${t.refNo}</th>
                <th>${t.status}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'}">${t.debit}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'}">${t.credit}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'}">${t.balance}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRows.length > 0 ? rowsHtml : `<tr><td colspan="8" style="text-align:center;">${t.noRecords}</td></tr>`}
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
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.supplier}</label>
              <div className="relative">
                <i className={`bi bi-building absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <select value={filters.supplier_id} onChange={(e) => setFilters({ ...filters, supplier_id: e.target.value })}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                  <option value="">{t.selectSupplier}</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fromDate}</label>
              <div className="relative">
                <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.toDate}</label>
              <div className="relative">
                <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
              </div>
            </div>

          </div>

          <div className={`mt-5 flex ${isUrdu ? "justify-start" : "justify-end"}`}>
            <button onClick={fetchLedger} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg shadow flex items-center gap-2 font-semibold text-sm transition">
              <i className="bi bi-journal-text"></i> {t.showLedger}
            </button>
          </div>
        </div>

        {ledger.summary && (
          <>
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border-l-4 border-blue-600 shadow-sm rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.totalDebit}</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">₨ {fmt(ledger.summary.total_debit)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                  <i className="bi bi-arrow-down-right-circle"></i>
                </div>
              </div>
              <div className="bg-white border-l-4 border-emerald-500 shadow-sm rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.totalCredit}</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">₨ {fmt(ledger.summary.total_credit)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">
                  <i className="bi bi-arrow-up-right-circle"></i>
                </div>
              </div>
              <div className="bg-white border-l-4 border-amber-500 shadow-sm rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.closingBalance}</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">₨ {fmt(ledger.summary.closing_balance)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xl">
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
            </div>

            {/* ── Filter / Print Top Bar ── */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="relative w-full max-w-sm">
                <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
              </div>
              
              <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
                  <i className="bi bi-printer text-blue-600"></i> {t.printBtn}
                </button>
                <button onClick={() => generatePrintDocument(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
                  <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
                </button>
              </div>
            </div>

            {/* ── Transactions Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <i className="bi bi-list-columns text-slate-400"></i>
                <h3 className="font-bold text-slate-700 text-sm">
                  {t.transactions} <span className="mx-2 bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-mono">{filteredRows.length}</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600">
                  <thead className="bg-white text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.refNo}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.status}</th>
                      <th className="px-5 py-3 text-right">{t.debit}</th>
                      <th className="px-5 py-3 text-right">{t.credit}</th>
                      <th className="px-5 py-3 text-right">{t.balance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                    ) : (
                      filteredRows.map((r, i) => (
                        <tr key={r.id} className="hover:bg-blue-50 transition">
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">{r.tx_date || "-"}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-700">{r.type}</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                              <i className="bi bi-tag text-xs"></i> {r.ref_no || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              r.status === "Paid" || r.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {r.status || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-blue-600">{Number(r.debit) > 0 ? `₨ ${fmt(r.debit)}` : "-"}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-emerald-600">{Number(r.credit) > 0 ? `₨ ${fmt(r.credit)}` : "-"}</td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-700 bg-amber-50/30">₨ {fmt(r.balance)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierLedgerPage;