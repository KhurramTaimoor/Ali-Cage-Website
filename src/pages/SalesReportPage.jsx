import React, { useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

const LANG = {
  en: {
    title: "Sales Report",
    subtitle: "Sales Orders, Sales Invoices and Sales Returns in one report",
    fromDate: "From Date",
    toDate: "To Date",
    personName: "Search Name",
    personPlaceholder: "Type customer/person name...",
    searchBtn: "Search Records",
    refresh: "Refresh",
    all: "All",
    orders: "Sales Orders",
    invoices: "Sales Invoices",
    returns: "Sales Returns",
    totalOrders: "Orders Total",
    totalInvoices: "Invoices Total",
    totalReturns: "Returns Total",
    netAfterReturn: "Net After Return",
    records: "Records",
    type: "Type",
    name: "Name",
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
    loading: "Loading...",
  },
  ur: {
    title: "سیلز رپورٹ",
    subtitle: "سیلز آرڈر، سیلز انوائس اور سیلز ریٹرن ایک جگہ",
    fromDate: "شروع تاریخ",
    toDate: "ختم تاریخ",
    personName: "نام تلاش کریں",
    personPlaceholder: "کسٹمر / شخص کا نام لکھیں...",
    searchBtn: "ریکارڈ تلاش کریں",
    refresh: "ری فریش",
    all: "سب",
    orders: "سیلز آرڈرز",
    invoices: "سیلز انوائسز",
    returns: "سیلز ریٹرنز",
    totalOrders: "آرڈر ٹوٹل",
    totalInvoices: "انوائس ٹوٹل",
    totalReturns: "ریٹرن ٹوٹل",
    netAfterReturn: "ریٹرن کے بعد نیٹ",
    records: "ریکارڈز",
    type: "قسم",
    name: "نام",
    referenceNo: "ریفرنس نمبر",
    date: "تاریخ",
    grossAmount: "گراس رقم",
    discount: "ڈسکاؤنٹ",
    netTotal: "نیٹ ٹوٹل",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "پرنٹ",
    pdfBtn: "پی ڈی ایف",
    reportHeader: "سیلز رپورٹ سمری",
    printedOn: "پرنٹ تاریخ",
    invoice: "سیلز انوائس",
    order: "سیلز آرڈر",
    return: "سیلز ریٹرن",
    loading: "لوڈ ہو رہا ہے...",
  },
};

const TYPE_OPTIONS = [
  { key: "all", icon: "bi-grid", labelKey: "all" },
  { key: "order", icon: "bi-cart-check", labelKey: "orders" },
  { key: "invoice", icon: "bi-receipt", labelKey: "invoices" },
  { key: "return", icon: "bi-arrow-return-left", labelKey: "returns" },
];

const today = () => new Date().toISOString().slice(0, 10);

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const raw = String(dateValue).slice(0, 10);
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function typeLabel(value, t) {
  if (value === "invoice") return t.invoice;
  if (value === "order") return t.order;
  if (value === "return") return t.return;
  return value || "-";
}

function typeBadge(value) {
  if (value === "invoice") return { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  if (value === "order") return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  if (value === "return") return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
  return { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
}

function makePrintHtml({ records, summary, filters, activeType, lang }) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif";

  const rowsHtml = records
    .map(
      (r, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td>${typeLabel(r.entry_type, t)}</td>
        <td>${r.person_name || "-"}</td>
        <td><b>${r.reference_no || "-"}</b></td>
        <td class="center">${formatDate(r.entry_date)}</td>
        <td class="num">${fmt(r.gross_amount)}</td>
        <td class="num">${fmt(r.discount)}</td>
        <td class="num strong ${r.entry_type === "return" ? "red" : "green"}">${r.entry_type === "return" ? "-" : ""}${fmt(Math.abs(Number(r.net_total || 0)))}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8" />
<title>${t.title}</title>
${isUrdu ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet">` : ""}
<style>
*{box-sizing:border-box}body{font-family:${font};margin:0;background:#fff;color:#0f172a;padding:24px}.head{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #111827;padding-bottom:14px;margin-bottom:16px}.brand{font-size:28px;font-weight:900}.sub{color:#64748b;margin-top:4px}.meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:#64748b;line-height:1.7}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.box{border:1px solid #d1d5db;border-radius:12px;padding:12px;background:#f8fafc}.box small{display:block;color:#64748b;font-size:11px;margin-bottom:6px}.box b{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#111827;color:#fff;font-size:11px;text-transform:uppercase}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px}.center{text-align:center}.num{text-align:right;font-family:monospace}.strong{font-weight:900}.green{color:#166534}.red{color:#991b1b}@media print{body{padding:0}.no-print{display:none}}
</style>
</head>
<body>
  <div class="head">
    <div><div class="brand">Ali Cages</div><div class="sub">${t.reportHeader}</div></div>
    <div class="meta">
      <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
      <div>${t.type}: ${TYPE_OPTIONS.find((x) => x.key === activeType)?.labelKey ? t[TYPE_OPTIONS.find((x) => x.key === activeType).labelKey] : t.all}</div>
      <div>${t.personName}: ${filters.name || t.all}</div>
      <div>${t.fromDate}: ${formatDate(filters.from_date) || "-"} — ${t.toDate}: ${formatDate(filters.to_date) || "-"}</div>
    </div>
  </div>
  <div class="summary">
    <div class="box"><small>${t.totalOrders}</small><b>${fmt(summary.orders_total)}</b></div>
    <div class="box"><small>${t.totalInvoices}</small><b>${fmt(summary.invoices_total)}</b></div>
    <div class="box"><small>${t.totalReturns}</small><b>${fmt(summary.returns_total)}</b></div>
    <div class="box"><small>${t.netAfterReturn}</small><b>${fmt(summary.net_after_return)}</b></div>
  </div>
  <table>
    <thead><tr><th>#</th><th>${t.type}</th><th>${t.name}</th><th>${t.referenceNo}</th><th>${t.date}</th><th>${t.grossAmount}</th><th>${t.discount}</th><th>${t.netTotal}</th></tr></thead>
    <tbody>${records.length ? rowsHtml : `<tr><td colspan="8" class="center">${t.noRecords}</td></tr>`}</tbody>
  </table>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body>
</html>`;
}

export default function SalesReportPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [activeType, setActiveType] = useState("all");
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ from_date: "", to_date: "", name: "" });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const s = records.reduce(
      (acc, r) => {
        const absNet = Math.abs(Number(r.net_total || 0));
        if (r.entry_type === "order") acc.orders_total += absNet;
        if (r.entry_type === "invoice") acc.invoices_total += absNet;
        if (r.entry_type === "return") acc.returns_total += absNet;
        acc.net_after_return += Number(r.signed_total ?? r.net_total ?? 0);
        return acc;
      },
      { orders_total: 0, invoices_total: 0, returns_total: 0, net_after_return: 0 }
    );
    return { ...s, records: records.length };
  }, [records]);

  const handleSearch = async (nextType = activeType) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);
      if (filters.name.trim()) params.append("name", filters.name.trim());
      if (nextType && nextType !== "all") params.append("type", nextType);

      const url = `${API_BASE}/sales-report${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await axios.get(url);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.records || [];
      setRecords(list);
      setSearched(true);
    } catch (err) {
      console.error("GET /sales-report failed:", err);
      setRecords([]);
      setError(err?.response?.data?.message || err.message || "Report load failed.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = (key) => {
    setActiveType(key);
    if (searched) handleSearch(key);
  };

  const generatePrintDocument = () => {
    const html = makePrintHtml({ records, summary, filters, activeType, lang });
    const w = window.open("", "_blank", "width=1200,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      dir={dir}
      style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif" }}
      className="min-h-screen bg-slate-50 p-5"
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {isUrdu && <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet" />}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50"
          >
            <i className="bi bi-translate me-2"></i>{t.toggleLang}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-fit">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">{t.type}</div>
            <div className="space-y-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleTypeClick(opt.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition ${
                    activeType === opt.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <i className={`bi ${opt.icon}`}></i>
                  <span>{t[opt.labelKey]}</span>
                </button>
              ))}
            </div>
          </aside>

          <main>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.personName}</label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t.personPlaceholder}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.fromDate}</label>
                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.toDate}</label>
                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="flex-1 h-10 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60"
                  >
                    <i className={`bi ${loading ? "bi-hourglass-split" : "bi-search"} me-2`}></i>
                    {loading ? t.loading : t.searchBtn}
                  </button>
                </div>
              </div>
              {error && <div className="mt-3 text-sm font-semibold text-rose-600">{error}</div>}
            </div>

            {searched && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t.totalOrders}</p>
                    <p className="text-xl font-extrabold text-emerald-700 mt-1">₨ {fmt(summary.orders_total)}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t.totalInvoices}</p>
                    <p className="text-xl font-extrabold text-blue-700 mt-1">₨ {fmt(summary.invoices_total)}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t.totalReturns}</p>
                    <p className="text-xl font-extrabold text-rose-700 mt-1">₨ {fmt(summary.returns_total)}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t.netAfterReturn}</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">₨ {fmt(summary.net_after_return)}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
                    <div className="font-extrabold text-slate-700">
                      {t.records}
                      <span className="ms-2 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-mono">{records.length}</span>
                    </div>
                    {records.length > 0 && (
                      <button
                        onClick={generatePrintDocument}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                      >
                        <i className="bi bi-printer me-2 text-blue-600"></i>{t.printBtn}
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100 whitespace-nowrap">
                          <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                          <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                          <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.name}</th>
                          <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.referenceNo}</th>
                          <th className="px-4 py-3 text-center">{t.date}</th>
                          <th className="px-4 py-3 text-right">{t.grossAmount}</th>
                          <th className="px-4 py-3 text-right">{t.discount}</th>
                          <th className="px-4 py-3 text-right">{t.netTotal}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td>
                          </tr>
                        ) : (
                          records.map((row, i) => (
                            <tr key={`${row.entry_type}-${row.id || i}`} className="hover:bg-blue-50 transition">
                              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={typeBadge(row.entry_type)}>
                                  {typeLabel(row.entry_type, t)}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800">{row.person_name || "-"}</td>
                              <td className="px-4 py-3 font-mono font-bold text-slate-700">{row.reference_no || "-"}</td>
                              <td className="px-4 py-3 text-center font-mono text-slate-600">{formatDate(row.entry_date)}</td>
                              <td className="px-4 py-3 text-right font-mono">₨ {fmt(row.gross_amount)}</td>
                              <td className="px-4 py-3 text-right font-mono text-orange-600">₨ {fmt(row.discount)}</td>
                              <td className={`px-4 py-3 text-right font-mono font-extrabold ${row.entry_type === "return" ? "text-rose-600" : "text-green-700"}`}>
                                {row.entry_type === "return" ? "-" : ""}₨ {fmt(Math.abs(Number(row.net_total || 0)))}
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
          </main>
        </div>
      </div>
    </div>
  );
}
