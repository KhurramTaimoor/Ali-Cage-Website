import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Product Ledger",
    subtitle: "View detailed transactions and running balance for a product",
    selectProductLabel: "Select Product",
    selectProductOpt: "-- Select Product --",
    date: "Date",
    description: "Description",
    ref: "Ref",
    inQty: "In (Qty)",
    outQty: "Out (Qty)",
    balance: "Balance",
    closingBalance: "Closing Balance",
    transactions: "Transactions",
    noRecords: "No transactions found.",
    selectPrompt: "Select a product from above to view its ledger.",
    loading: "Loading ledger...",
    toggleLang: "اردو",
    printBtn: "Print Ledger",
    pdfBtn: "Download PDF",
    reportHeader: "Product Ledger Report",
    printedOn: "Printed On",
  },
  ur: {
    title: "پروڈکٹ لیجر",
    subtitle: "کسی پروڈکٹ کی تفصیلی ٹرانزیکشنز اور رننگ بیلنس دیکھیں",
    selectProductLabel: "پروڈکٹ منتخب کریں",
    selectProductOpt: "-- پروڈکٹ منتخب کریں --",
    date: "تاریخ",
    description: "تفصیل",
    ref: "حوالہ",
    inQty: "آمد (مقدار)",
    outQty: "اخراج (مقدار)",
    balance: "بیلنس",
    closingBalance: "اختتامی بیلنس",
    transactions: "ٹرانزیکشنز",
    noRecords: "کوئی ٹرانزیکشن نہیں ملی۔",
    selectPrompt: "لیجر دیکھنے کے لیے اوپر سے پروڈکٹ منتخب کریں۔",
    loading: "لیجر لوڈ ہو رہا ہے...",
    toggleLang: "English",
    printBtn: "لیجر پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "پروڈکٹ لیجر رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
  },
};

const API_BASE = "http://localhost:5000/api";

const ProductLedgerPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmtQty = (n) => parseFloat(n || 0).toLocaleString("en-PK");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productName, setProductName] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch Products Dropdown ──
  useEffect(() => {
    axios.get(`${API_BASE}/product-ledger/products`)
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        // Fallback Mock Data
        setProducts([
          { id: 1, product_name: "Steel Wire 18g" },
          { id: 2, product_name: "Cotton T-Shirt" }
        ]);
      });
  }, []);

  // ── Handle Product Change & Fetch Ledger ──
  const handleProductChange = (e) => {
    const pid = e.target.value;
    const pname = products.find(p => String(p.id) === String(pid))?.product_name || "";
    setSelectedProduct(pid);
    setProductName(pname);
    
    if (!pid) { 
      setLedger([]); 
      return; 
    }
    
    setLoading(true);
    axios.get(`${API_BASE}/product-ledger/${pid}`)
      .then(r => { 
        setLedger(Array.isArray(r.data) ? r.data : []); 
        setLoading(false); 
      })
      .catch(() => {
        // Fallback Mock Ledger Data
        setTimeout(() => {
          setLedger([
            { id: 1, date: "2024-10-01T00:00:00.000Z", description: "Opening Balance", ref: "OB-001", debit: 150, credit: 0 },
            { id: 2, date: "2024-10-15T00:00:00.000Z", description: "Stock Received (GRN)", ref: "GRN-1001", debit: 500, credit: 0 },
            { id: 3, date: "2024-10-20T00:00:00.000Z", description: "Stock Issued", ref: "ISS-001", debit: 0, credit: 200 },
          ]);
          setLoading(false);
        }, 500);
      });
  };

  // ── Running Balance Calculation ──
  let runningBalance = 0;
  let totalIn = 0;
  let totalOut = 0;
  
  const ledgerWithBalance = ledger.map(row => {
    const inQty = Number(row.debit || 0);
    const outQty = Number(row.credit || 0);
    totalIn += inQty;
    totalOut += outQty;
    runningBalance = runningBalance + inQty - outQty;
    return { ...row, inQty, outQty, balance: runningBalance };
  });

  // ── Print / PDF Generator ──
  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    
    const rowsHtml = ledgerWithBalance.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td style="white-space: nowrap;">${r.date?.split("T")[0] || "-"}</td>
        <td><strong>${r.description}</strong></td>
        <td style="font-family: monospace;">${r.ref || "-"}</td>
        <td style="text-align: center; color: #047857;">${r.inQty > 0 ? fmtQty(r.inQty) : "-"}</td>
        <td style="text-align: center; color: #b91c1c;">${r.outQty > 0 ? fmtQty(r.outQty) : "-"}</td>
        <td style="text-align: center; font-weight: bold; color: #1d4ed8;">${fmtQty(r.balance)}</td>
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
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 13px; color: #475569; }
          
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1e40af; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 10px; font-weight: normal; border: 1px solid #1e3a8a; }
          td { border: 1px solid #e2e8f0; padding: 8px 10px; color: #334155; }
          tr:nth-child(even) td { background: #f8fafc; }
          .totals-row td { background: #f1f5f9 !important; font-weight: bold; border-top: 2px solid #94a3b8; font-size: 14px; color: #0f172a;}
          
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
                ${t.selectProductLabel}: ${productName}
              </div>
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
                <th>${t.ref}</th>
                <th style="text-align: center;">${t.inQty}</th>
                <th style="text-align: center;">${t.outQty}</th>
                <th style="text-align: center;">${t.balance}</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerWithBalance.length > 0 ? rowsHtml : `<tr><td colspan="7" style="text-align:center; padding: 20px;">${t.noRecords}</td></tr>`}
            </tbody>
            ${ledgerWithBalance.length > 0 ? `
              <tfoot class="totals-row">
                <tr>
                  <td colspan="4" style="text-align: ${isUrdu ? 'left' : 'right'}; text-transform: uppercase;">${t.closingBalance}</td>
                  <td style="text-align: center; color: #047857;">${fmtQty(totalIn)}</td>
                  <td style="text-align: center; color: #b91c1c;">${fmtQty(totalOut)}</td>
                  <td style="text-align: center; color: #1d4ed8;">${fmtQty(runningBalance)}</td>
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
        
        {/* ── Filter / Actions Top Bar ── */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.selectProductLabel}</label>
            <div className="relative">
              <i className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
              <select value={selectedProduct} onChange={handleProductChange}
                className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                <option value="">{t.selectProductOpt}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
              </select>
              <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
            </div>
          </div>
          
          <div className={`flex gap-2 mt-4 md:mt-0 w-full md:w-auto ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} disabled={!selectedProduct || ledgerWithBalance.length === 0} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="bi bi-printer text-blue-600"></i> {t.printBtn}
            </button>
            <button onClick={() => generatePrintDocument(true)} disabled={!selectedProduct || ledgerWithBalance.length === 0} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
            </button>
          </div>
        </div>

        {/* ── Ledger Content ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          {!selectedProduct ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <i className="bi bi-search text-3xl opacity-50"></i>
              </div>
              <p className="font-medium text-slate-500">{t.selectPrompt}</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
              <i className="bi bi-arrow-repeat animate-spin text-3xl mb-3 text-blue-500"></i>
              <p>{t.loading}</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-800 text-white flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <i className="bi bi-journal-text text-blue-400"></i>
                  {productName}
                </h3>
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-mono">{ledgerWithBalance.length} {t.transactions}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                      <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                      <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.description}</th>
                      <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.ref}</th>
                      <th className="px-4 py-3 text-center text-emerald-600">{t.inQty}</th>
                      <th className="px-4 py-3 text-center text-red-500">{t.outQty}</th>
                      <th className="px-4 py-3 text-center text-blue-600">{t.balance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerWithBalance.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                    ) : (
                      ledgerWithBalance.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition">
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs">{r.date?.split("T")[0] || "-"}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-700">{r.description}</td>
                          <td className="px-4 py-3.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-600 border border-slate-200">
                              {r.ref || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-600">{r.inQty > 0 ? fmtQty(r.inQty) : "-"}</td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-red-500">{r.outQty > 0 ? fmtQty(r.outQty) : "-"}</td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-lg text-blue-700 bg-blue-50/50">{fmtQty(r.balance)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {ledgerWithBalance.length > 0 && (
                    <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={4} className={`px-4 py-4 text-xs uppercase tracking-wider ${isUrdu ? "text-left" : "text-right"}`}>{t.closingBalance}</td>
                        <td className="px-4 py-4 text-center font-mono text-emerald-600 text-base">{fmtQty(totalIn)}</td>
                        <td className="px-4 py-4 text-center font-mono text-red-500 text-base">{fmtQty(totalOut)}</td>
                        <td className="px-4 py-4 text-center font-mono text-blue-700 text-lg">{fmtQty(runningBalance)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductLedgerPage;