import React, { useState } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Sales Report",
    subtitle: "View and filter your sales data",
    fromDate: "From Date",
    toDate: "To Date",
    searchBtn: "Search Records",
    totalGross: "Total Gross",
    totalDiscount: "Total Discount",
    totalNet: "Total Net",
    records: "Records",
    type: "Type",
    referenceNo: "Reference No",
    date: "Date",
    grossAmount: "Gross Amount",
    discount: "Discount",
    netTotal: "Net Total",
    noRecords: "No records found.",
    toggleLang: "اردو",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Sales Report Summary",
    printedOn: "Printed On",
    invoice: "Sales Invoice",
    order: "Sales Order",
    return: "Sales Return",
  },
  ur: {
    title: "سیلز رپورٹ",
    subtitle: "اپنا سیلز ڈیٹا دیکھیں اور فلٹر کریں",
    fromDate: "شروع کی تاریخ",
    toDate: "ختم کی تاریخ",
    searchBtn: "ریکارڈ تلاش کریں",
    totalGross: "کل گراس",
    totalDiscount: "کل رعایت",
    totalNet: "کل خالص",
    records: "ریکارڈز",
    type: "قسم",
    referenceNo: "ریفرنس نمبر",
    date: "تاریخ",
    grossAmount: "گراس رقم",
    discount: "رعایت",
    netTotal: "خالص کل",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "سیلز رپورٹ کا خلاصہ",
    printedOn: "پرنٹ کی تاریخ",
    invoice: "سیلز انوائس",
    order: "سیلز آرڈر",
    return: "سیلز ریٹرن",
  },
};

const API_BASE = "http://localhost:5000/api";

const SalesReportPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (v) => Number(v || 0).toLocaleString("en-PK");

  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ from_date: "", to_date: "" });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const typeLabel = (value) => {
    if (value === "invoice") return t.invoice;
    if (value === "order") return t.order;
    if (value === "return") return t.return;
    return value;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);

      const url = `${API_BASE}/sales-report${params.toString() ? `?${params.toString()}` : ""}`;
      const r = await axios.get(url);
      setRecords(Array.isArray(r.data) ? r.data : []);
    } catch (error) {
      console.error("GET /sales-report failed:", error);
      setRecords([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const totalNet = records.reduce((sum, r) => sum + parseFloat(r.net_total || 0), 0);
  const totalGross = records.reduce((sum, r) => sum + parseFloat(r.gross_amount || 0), 0);
  const totalDiscount = records.reduce((sum, r) => sum + parseFloat(r.discount || 0), 0);

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";

    const rowsHtml = records.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${typeLabel(r.entry_type)}</td>
        <td><strong>${r.reference_no}</strong></td>
        <td>${r.entry_date || ""}</td>
        <td style="text-align:${isUrdu ? "left" : "right"}">₨ ${fmt(r.gross_amount)}</td>
        <td style="text-align:${isUrdu ? "left" : "right"}">₨ ${fmt(r.discount)}</td>
        <td style="text-align:${isUrdu ? "left" : "right"}"><strong>₨ ${fmt(r.net_total)}</strong></td>
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
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          .summary-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .summary-item { text-align: center; flex: 1; border-right: 1px solid #e2e8f0; }
          .summary-item:last-child { border-right: none; }
          .summary-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; }
          .summary-value { font-size: 20px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1e40af; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 12px; color: #334155; }
          tr:nth-child(even) td { background: #f8fafc; }
          @media print { body { padding: 0; } .print-instruct { display: none; } }
          .print-instruct { background: #eff6ff; color: #1d4ed8; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #bfdbfe; }
        </style>
      </head>
      <body>
        <div class="report-container">
          ${isPdf ? `<div class="print-instruct">Please select <strong>"Save as PDF"</strong> in the destination dropdown to download this report.</div>` : ""}
          <div class="header">
            <div>
              <div class="brand">Cage Master</div>
              <div class="report-title">${t.reportHeader}</div>
            </div>
            <div class="meta">
              <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
              ${filters.from_date || filters.to_date ? `<div>Period: ${filters.from_date || "Start"} to ${filters.to_date || "End"}</div>` : ""}
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">${t.totalGross}</div>
              <div class="summary-value" style="color: #1e40af;">₨ ${fmt(totalGross)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">${t.totalDiscount}</div>
              <div class="summary-value" style="color: #ea580c;">₨ ${fmt(totalDiscount)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">${t.totalNet}</div>
              <div class="summary-value" style="color: #16a34a;">₨ ${fmt(totalNet)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t.type}</th>
                <th>${t.referenceNo}</th>
                <th>${t.date}</th>
                <th style="text-align:${isUrdu ? "left" : "right"}">${t.grossAmount}</th>
                <th style="text-align:${isUrdu ? "left" : "right"}">${t.discount}</th>
                <th style="text-align:${isUrdu ? "left" : "right"}">${t.netTotal}</th>
              </tr>
            </thead>
            <tbody>
              ${records.length > 0 ? rowsHtml : `<tr><td colspan="7" style="text-align:center;">${t.noRecords}</td></tr>`}
            </tbody>
          </table>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              ${!isPdf ? "window.onafterprint = () => window.close();" : ""}
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      dir={dir}
      style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }}
      className="min-h-screen bg-slate-50 p-6"
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {isUrdu && <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet" />}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition"
          >
            <i className="bi bi-translate"></i>{t.toggleLang}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fromDate}</label>
            <div className="relative">
              <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.toDate}</label>
            <div className="relative">
              <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>
          </div>
        </div>

        <div className={`flex ${isUrdu ? "justify-start" : "justify-end"}`}>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition shadow"
          >
            <i className={`bi ${loading ? "bi-hourglass-split" : "bi-search"}`}></i>
            {t.searchBtn}
          </button>
        </div>
      </div>

      {searched && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.totalGross}</p>
                <p className="text-2xl font-bold text-slate-800 font-mono">₨ {fmt(totalGross)}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl flex-shrink-0">
                <i className="bi bi-tags"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.totalDiscount}</p>
                <p className="text-2xl font-bold text-slate-800 font-mono">₨ {fmt(totalDiscount)}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl flex-shrink-0">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t.totalNet}</p>
                <p className="text-2xl font-bold text-slate-800 font-mono">₨ {fmt(totalNet)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <i className="bi bi-table text-slate-400"></i>
                <h3 className="font-bold text-slate-700 text-sm">
                  {t.records}
                  <span className="mx-2 bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-mono">{records.length}</span>
                </h3>
              </div>

              {records.length > 0 && (
                <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-xs transition shadow-sm">
                    <i className="bi bi-printer text-blue-600"></i> {t.printBtn}
                  </button>
                  <button onClick={() => generatePrintDocument(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-xs transition shadow-sm">
                    <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                    <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                    <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                    <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.referenceNo}</th>
                    <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                    <th className="px-5 py-3 text-right">{t.grossAmount}</th>
                    <th className="px-5 py-3 text-right">{t.discount}</th>
                    <th className="px-5 py-3 text-right">{t.netTotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td>
                    </tr>
                  ) : (
                    records.map((row, i) => (
                      <tr key={`${row.entry_type}-${row.id}`} className="hover:bg-blue-50 transition">
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {typeLabel(row.entry_type)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                            <i className="bi bi-file-earmark-text text-xs"></i> {row.reference_no}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">{row.entry_date}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-600">₨ {fmt(row.gross_amount)}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-orange-600">₨ {fmt(row.discount)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            ₨ {fmt(row.net_total)}
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
  );
};

export default SalesReportPage;
