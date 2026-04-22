import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Production Report",
    subtitle: "View and analyze production batches and quantities",
    fromDate: "From Date",
    toDate: "To Date",
    product: "Product",
    productPlaceholder: "Search product name",
    status: "Status",
    allStatus: "-- All Statuses --",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    searchBtn: "Generate Report",
    recordsCount: "Total Records",
    totalQty: "Total Quantity Produced",
    records: "Records",
    batchNo: "Batch No",
    prodDate: "Production Date",
    qtyProduced: "Quantity",
    warehouse: "Warehouse",
    supervisor: "Supervisor",
    noRecords: "No production records found.",
    toggleLang: "اردو",
    printBtn: "Print Report",
    pdfBtn: "Download PDF",
    reportHeader: "Production Report Summary",
    printedOn: "Printed On",
  },
  ur: {
    title: "پروڈکشن رپورٹ",
    subtitle: "پروڈکشن بیچز اور مقدار کا تجزیہ کریں",
    fromDate: "شروع کی تاریخ",
    toDate: "ختم کی تاریخ",
    product: "پروڈکٹ",
    productPlaceholder: "پروڈکٹ کا نام تلاش کریں...",
    status: "حالت",
    allStatus: "-- تمام حالتیں --",
    pending: "زیر التواء",
    completed: "مکمل",
    cancelled: "منسوخ",
    searchBtn: "رپورٹ تیار کریں",
    recordsCount: "کل ریکارڈز",
    totalQty: "تیار کردہ کل مقدار",
    records: "ریکارڈز",
    batchNo: "بیچ نمبر",
    prodDate: "پیداوار کی تاریخ",
    qtyProduced: "مقدار",
    warehouse: "گودام",
    supervisor: "سپروائزر",
    noRecords: "کوئی پروڈکشن ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "رپورٹ پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "پروڈکشن رپورٹ کا خلاصہ",
    printedOn: "پرنٹ کی تاریخ",
  },
};

const API_BASE = "http://localhost:5000/api";

const ProductionReportsPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (v) => Number(v || 0).toLocaleString("en-PK");

  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({ from_date: "", to_date: "", product: "", status: "" });

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    if (filters.product) params.append("product", filters.product);
    if (filters.status) params.append("status", filters.status);

    try {
      const response = await axios.get(`${API_BASE}/production-report?${params.toString()}`);
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Mock Data Fallback
      setRecords([
        { id: 1, batch_no: "BATCH-441", production_date: "2024-10-25", product: "Steel Wire 18g", quantity_produced: 500, warehouse: "Main Godown", supervisor: "Ahmed", status: "Completed" },
        { id: 2, batch_no: "BATCH-442", production_date: "2024-10-26", product: "Iron Rods 12mm", quantity_produced: 250, warehouse: "Store A", supervisor: "Raza", status: "Pending" },
        { id: 3, batch_no: "BATCH-443", production_date: "2024-10-28", product: "Steel Wire 18g", quantity_produced: 100, warehouse: "Main Godown", supervisor: "Ahmed", status: "Cancelled" },
      ]);
    }
    setSearched(true);
  };

  const totalQty = records.reduce((sum, row) => sum + parseFloat(row.quantity_produced || 0), 0);

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    
    const rowsHtml = records.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${r.batch_no}</strong></td>
        <td>${r.production_date || "-"}</td>
        <td>${r.product || "-"}</td>
        <td style="text-align: center; font-weight: bold; color: #1d4ed8;">${fmt(r.quantity_produced)}</td>
        <td>${r.warehouse || "-"}</td>
        <td>${r.supervisor || "-"}</td>
        <td>${t[r.status.toLowerCase()] || r.status}</td>
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

          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
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
            </div>
            <div class="meta">
              <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
              ${filters.from_date || filters.to_date ? `<div style="margin-top:5px;">Period: ${filters.from_date || 'Start'} to ${filters.to_date || 'End'}</div>` : ""}
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">${t.recordsCount}</div>
              <div class="summary-value" style="color: #0f172a;">${records.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">${t.totalQty}</div>
              <div class="summary-value" style="color: #1d4ed8;">${fmt(totalQty)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t.batchNo}</th>
                <th>${t.prodDate}</th>
                <th>${t.product}</th>
                <th style="text-align: center;">${t.qtyProduced}</th>
                <th>${t.warehouse}</th>
                <th>${t.supervisor}</th>
                <th>${t.status}</th>
              </tr>
            </thead>
            <tbody>
              ${records.length > 0 ? rowsHtml : `<tr><td colspan="8" style="text-align:center;">${t.noRecords}</td></tr>`}
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
        
        {/* ── Filter Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
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

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.product}</label>
              <div className="relative">
                <i className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <input type="text" placeholder={t.productPlaceholder} value={filters.product} onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.status}</label>
              <div className="relative">
                <i className={`bi bi-info-circle absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                  <option value="">{t.allStatus}</option>
                  <option value="Pending">{t.pending}</option>
                  <option value="Completed">{t.completed}</option>
                  <option value="Cancelled">{t.cancelled}</option>
                </select>
                <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
              </div>
            </div>

          </div>

          <div className={`mt-5 flex ${isUrdu ? "justify-start" : "justify-end"}`}>
            <button onClick={handleSearch} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg shadow flex items-center gap-2 font-semibold text-sm transition">
              <i className="bi bi-search"></i> {t.searchBtn}
            </button>
          </div>
        </div>

        {searched && (
          <>
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border-l-4 border-slate-500 shadow-sm rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.recordsCount}</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">{records.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl">
                  <i className="bi bi-list-ol"></i>
                </div>
              </div>
              <div className="bg-white border-l-4 border-blue-600 shadow-sm rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.totalQty}</p>
                  <p className="text-2xl font-bold text-blue-700 font-mono">{fmt(totalQty)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                  <i className="bi bi-boxes"></i>
                </div>
              </div>
            </div>

            {/* ── Table & Print Header ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                  <i className="bi bi-table text-slate-400"></i>
                  {t.records}
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
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.batchNo}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.prodDate}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                      <th className="px-5 py-3 text-center">{t.qtyProduced}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.warehouse}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.supervisor}</th>
                      <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                    ) : (
                      records.map((r, i) => (
                        <tr key={r.id} className="hover:bg-blue-50 transition">
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-700">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                              <i className="bi bi-tag text-xs"></i> {r.batch_no || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">{r.production_date || "-"}</td>
                          <td className="px-5 py-3.5 font-bold text-blue-700">{r.product || "-"}</td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-800 bg-slate-50/50">{r.quantity_produced || 0}</td>
                          <td className="px-5 py-3.5 text-slate-600">{r.warehouse || "-"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{r.supervisor || "-"}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              (r.status || "").toLowerCase() === "completed" ? "bg-emerald-100 text-emerald-700" : 
                              (r.status || "").toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" : 
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {t[(r.status || "").toLowerCase()] || r.status}
                            </span>
                          </td>
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

export default ProductionReportsPage;