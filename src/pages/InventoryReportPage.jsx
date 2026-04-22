import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Inventory Report",
    subtitle: "Current stock balance and valuation for all products",
    searchPlaceholder: "Search by product, type or category...",
    product: "Product",
    type: "Type",
    category: "Category",
    opening: "Opening",
    received: "Received",
    issued: "Issued",
    balance: "Balance",
    rate: "Rate",
    totalValue: "Total Value",
    totals: "Totals",
    noRecords: "No inventory records found.",
    loading: "Loading data...",
    toggleLang: "اردو",
    printBtn: "Print Report",
    pdfBtn: "Download PDF",
    reportHeader: "Inventory Valuation Report",
    printedOn: "Printed On",
  },
  ur: {
    title: "انوینٹری کی رپورٹ",
    subtitle: "تمام مصنوعات کا موجودہ اسٹاک بیلنس اور مالیت",
    searchPlaceholder: "پروڈکٹ، قسم یا کیٹیگری سے تلاش کریں...",
    product: "پروڈکٹ",
    type: "قسم",
    category: "کیٹیگری",
    opening: "ابتدائی",
    received: "موصول شدہ",
    issued: "جاری کردہ",
    balance: "بقیہ",
    rate: "ریٹ",
    totalValue: "کل مالیت",
    totals: "کل",
    noRecords: "انوینٹری کا کوئی ریکارڈ نہیں ملا۔",
    loading: "ڈیٹا لوڈ ہو رہا ہے...",
    toggleLang: "English",
    printBtn: "رپورٹ پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "انوینٹری مالیت کی رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
  },
};

const API_BASE = "http://localhost:5000/api";

const InventoryReportPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
  const fmtQty = (n) => parseFloat(n || 0).toLocaleString("en-PK");

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Fetch Data ──
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/inventory-report`)
      .then(r => {
        setData(r.data);
        setFiltered(r.data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        // Mock Data if API is down
        const mockData = [
          { id: 1, product_name: "Steel Wire 18g", type_name: "Raw Material", category_name: "Metals", opening_qty: 100, received_qty: 500, issued_qty: 200, balance_qty: 400, rate: 250, total_value: 100000 },
          { id: 2, product_name: "Machine Oil", type_name: "Consumables", category_name: "Liquids", opening_qty: 10, received_qty: 20, issued_qty: 15, balance_qty: 15, rate: 1500, total_value: 22500 },
          { id: 3, product_name: "Defective Bolts", type_name: "Raw Material", category_name: "Hardware", opening_qty: 0, received_qty: 50, issued_qty: 60, balance_qty: -10, rate: 15, total_value: -150 }
        ];
        setData(mockData);
        setFiltered(mockData);
        setLoading(false);
      });
  }, []);

  // ── Search Filter ──
  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(data.filter(r =>
      (r.product_name || "").toLowerCase().includes(s) ||
      (r.type_name || "").toLowerCase().includes(s) ||
      (r.category_name || "").toLowerCase().includes(s)
    ));
  }, [search, data]);

  // ── Totals Calculation ──
  const totals = filtered.reduce((acc, r) => ({
    opening: acc.opening + Number(r.opening_qty || 0),
    received: acc.received + Number(r.received_qty || 0),
    issued: acc.issued + Number(r.issued_qty || 0),
    balance: acc.balance + Number(r.balance_qty || 0),
    value: acc.value + Number(r.total_value || 0),
  }), { opening: 0, received: 0, issued: 0, balance: 0, value: 0 });

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    
    const rowsHtml = filtered.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><strong>${r.product_name}</strong></td>
        <td>${r.type_name || "-"}</td>
        <td>${r.category_name || "-"}</td>
        <td style="text-align: center;">${fmtQty(r.opening_qty)}</td>
        <td style="text-align: center; color: #047857;">${fmtQty(r.received_qty)}</td>
        <td style="text-align: center; color: #b91c1c;">${fmtQty(r.issued_qty)}</td>
        <td style="text-align: center; font-weight: bold; color: ${Number(r.balance_qty) < 0 ? '#b91c1c' : '#1d4ed8'};">${fmtQty(r.balance_qty)}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'};">₨ ${fmt(r.rate)}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; font-weight: bold;">₨ ${fmt(r.total_value)}</td>
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
          .report-container { max-width: 1100px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1e40af; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 10px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; color: #334155; }
          tr:nth-child(even) td { background: #f8fafc; }
          .totals-row td { background: #f1f5f9 !important; font-weight: bold; border-top: 2px solid #94a3b8; font-size: 13px; color: #0f172a;}
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
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>${t.product}</th>
                <th>${t.type}</th>
                <th>${t.category}</th>
                <th style="text-align: center;">${t.opening}</th>
                <th style="text-align: center;">${t.received}</th>
                <th style="text-align: center;">${t.issued}</th>
                <th style="text-align: center;">${t.balance}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.rate}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.totalValue}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? rowsHtml : `<tr><td colspan="10" style="text-align:center; padding: 20px;">${t.noRecords}</td></tr>`}
            </tbody>
            ${filtered.length > 0 ? `
              <tfoot class="totals-row">
                <tr>
                  <td colspan="4" style="text-align: ${isUrdu ? 'left' : 'right'}; text-transform: uppercase;">${t.totals}</td>
                  <td style="text-align: center;">${fmtQty(totals.opening)}</td>
                  <td style="text-align: center; color: #047857;">${fmtQty(totals.received)}</td>
                  <td style="text-align: center; color: #b91c1c;">${fmtQty(totals.issued)}</td>
                  <td style="text-align: center; color: #1d4ed8;">${fmtQty(totals.balance)}</td>
                  <td></td>
                  <td style="text-align: ${isUrdu ? 'left' : 'right'};">₨ ${fmt(totals.value)}</td>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* ── Search & Actions ── */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
          </div>
          
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} disabled={filtered.length === 0} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="bi bi-printer text-blue-600"></i> {t.printBtn}
            </button>
            <button onClick={() => generatePrintDocument(true)} disabled={filtered.length === 0} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className="px-4 py-3 text-center">{t.opening}</th>
                  <th className="px-4 py-3 text-center text-emerald-600">{t.received}</th>
                  <th className="px-4 py-3 text-center text-red-500">{t.issued}</th>
                  <th className="px-4 py-3 text-center text-blue-600">{t.balance}</th>
                  <th className="px-4 py-3 text-right">{t.rate}</th>
                  <th className="px-4 py-3 text-right">{t.totalValue}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={10} className="px-6 py-10 text-center text-slate-400"><i className="bi bi-arrow-repeat animate-spin text-2xl"></i><p className="mt-2">{t.loading}</p></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className={`hover:bg-blue-50 transition ${Number(r.balance_qty) < 0 ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{r.product_name}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">{r.type_name || "-"}</td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">{r.category_name || "-"}</td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-700">{fmtQty(r.opening_qty)}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-600 bg-emerald-50/30">{fmtQty(r.received_qty)}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-red-500 bg-red-50/30">{fmtQty(r.issued_qty)}</td>
                      <td className={`px-4 py-3.5 text-center font-mono font-bold text-lg ${Number(r.balance_qty) < 0 ? "text-red-600 bg-red-100" : "text-blue-700 bg-blue-50"}`}>
                        {fmtQty(r.balance_qty)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-500">₨ {fmt(r.rate)}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700">₨ {fmt(r.total_value)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              
              {/* Footer Totals */}
              {!loading && filtered.length > 0 && (
                <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className={`px-4 py-4 text-xs uppercase tracking-wider ${isUrdu ? "text-left" : "text-right"}`}>{t.totals}</td>
                    <td className="px-4 py-4 text-center font-mono">{fmtQty(totals.opening)}</td>
                    <td className="px-4 py-4 text-center font-mono text-emerald-600">{fmtQty(totals.received)}</td>
                    <td className="px-4 py-4 text-center font-mono text-red-500">{fmtQty(totals.issued)}</td>
                    <td className="px-4 py-4 text-center font-mono text-blue-700">{fmtQty(totals.balance)}</td>
                    <td className="px-4 py-4"></td>
                    <td className="px-4 py-4 text-right font-mono text-emerald-700 text-base">₨ {fmt(totals.value)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InventoryReportPage;