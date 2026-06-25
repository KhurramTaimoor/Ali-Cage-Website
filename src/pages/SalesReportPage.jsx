import React, { useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

const LANG = {
  en: {
    title: "Sales Report",
    subtitle: "Sales invoices and sales returns report",
    fromDate: "From Date",
    toDate: "To Date",
    nameSearch: "Search by Name",
    namePlaceholder: "Type customer/person name...",
    searchBtn: "Search Records",
    resetBtn: "Reset",
    totalInvoice: "Total Invoice",
    totalReturn: "Total Return",
    netSales: "Net Sales",
    records: "Records",
    type: "Type",
    referenceNo: "Reference No",
    name: "Name",
    date: "Date",
    invoiceAmount: "Invoice Amount",
    returnAmount: "Return Amount",
    netTotal: "Net Total",
    noRecords: "No records found.",
    toggleLang: "اردو",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Sales Invoice & Return Report",
    printedOn: "Printed On",
    invoice: "Sales Invoice",
    return: "Sales Return",
    loading: "Loading...",
  },
  ur: {
    title: "سیلز رپورٹ",
    subtitle: "سیلز انوائس اور سیلز ریٹرن رپورٹ",
    fromDate: "شروع تاریخ",
    toDate: "ختم تاریخ",
    nameSearch: "نام سے تلاش کریں",
    namePlaceholder: "کسٹمر/شخص کا نام لکھیں...",
    searchBtn: "ریکارڈ تلاش کریں",
    resetBtn: "ری سیٹ",
    totalInvoice: "کل انوائس",
    totalReturn: "کل ریٹرن",
    netSales: "نیٹ سیلز",
    records: "ریکارڈز",
    type: "قسم",
    referenceNo: "ریفرنس نمبر",
    name: "نام",
    date: "تاریخ",
    invoiceAmount: "انوائس رقم",
    returnAmount: "ریٹرن رقم",
    netTotal: "نیٹ کل",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "پرنٹ",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "سیلز انوائس اور ریٹرن رپورٹ",
    printedOn: "پرنٹ تاریخ",
    invoice: "سیلز انوائس",
    return: "سیلز ریٹرن",
    loading: "لوڈ ہو رہا ہے...",
  },
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const today = () => new Date().toISOString().slice(0, 10);

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const raw = String(dateValue).slice(0, 10);
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

function getPersonName(row) {
  return String(
    row.person_name ||
      row.party_name ||
      row.customer_name ||
      row.customer_name_en ||
      row.name ||
      row.buyer_name ||
      row.client_name ||
      "-"
  );
}

function getRefNo(row) {
  return String(
    row.reference_no ||
      row.invoice_no ||
      row.invoice_ref ||
      row.return_no ||
      row.id ||
      "-"
  );
}

function getEntryDate(row) {
  return (
    row.entry_date ||
    row.invoice_date ||
    row.return_date ||
    row.date ||
    row.created_at ||
    ""
  );
}

function normalizeRecord(row) {
  const rawType = String(row.entry_type || row.type || "").toLowerCase();

  const isReturn =
    rawType === "return" ||
    rawType === "sales_return" ||
    row.return_no ||
    row.return_amount !== undefined;

  const type = isReturn ? "return" : "invoice";

  const rawAmount =
    type === "return"
      ? toNum(row.return_amount || row.net_total || row.gross_amount || row.amount)
      : toNum(row.net_total || row.grand_total || row.invoice_total || row.gross_amount || row.total_amount || row.amount);

  const amountAbs = Math.abs(rawAmount);

  return {
    id: row.id,
    entry_type: type,
    reference_no: getRefNo(row),
    person_name: getPersonName(row),
    entry_date: String(getEntryDate(row)).slice(0, 10),
    invoice_amount: type === "invoice" ? amountAbs : 0,
    return_amount: type === "return" ? amountAbs : 0,
    net_total: type === "return" ? -amountAbs : amountAbs,
    source_table: row.source_table || "",
  };
}

export default function SalesReportPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    name: "",
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const typeLabel = (value) => {
    if (value === "invoice") return t.invoice;
    if (value === "return") return t.return;
    return value || "-";
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);
      if (filters.name.trim()) params.append("search", filters.name.trim());

      const url = `${API_BASE}/sales-report${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await axios.get(url);

      const list = normalizeList(res.data)
        .map(normalizeRecord)
        .filter((r) => r.entry_type === "invoice" || r.entry_type === "return")
        .filter((r) => {
          const q = filters.name.trim().toLowerCase();
          if (!q) return true;
          return String(r.person_name || "").toLowerCase().includes(q);
        })
        .filter((r) => {
          if (filters.from_date && String(r.entry_date || "") < filters.from_date) return false;
          if (filters.to_date && String(r.entry_date || "") > filters.to_date) return false;
          return true;
        })
        .sort((a, b) => {
          return (
            String(b.entry_date || "").localeCompare(String(a.entry_date || "")) ||
            Number(b.id || 0) - Number(a.id || 0)
          );
        });

      setRecords(list);
    } catch (error) {
      console.error("GET /sales-report failed:", error);
      setRecords([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleReset = () => {
    setFilters({ from_date: "", to_date: "", name: "" });
    setRecords([]);
    setSearched(false);
  };

  const summary = useMemo(() => {
    const totalInvoice = records.reduce((s, r) => s + toNum(r.invoice_amount), 0);
    const totalReturn = records.reduce((s, r) => s + toNum(r.return_amount), 0);
    const netSales = totalInvoice - totalReturn;

    return { totalInvoice, totalReturn, netSales };
  }, [records]);

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif";

    const rowsHtml = records
      .map(
        (r, i) => `
          <tr>
            <td class="center">${i + 1}</td>
            <td>${typeLabel(r.entry_type)}</td>
            <td><strong>${r.reference_no || "-"}</strong></td>
            <td>${r.person_name || "-"}</td>
            <td class="center">${formatDate(r.entry_date)}</td>
            <td class="num">Rs ${fmt(r.invoice_amount)}</td>
            <td class="num">Rs ${fmt(r.return_amount)}</td>
            <td class="num strong ${r.net_total < 0 ? "red" : "green"}">Rs ${fmt(r.net_total)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!doctype html>
      <html dir="${dir}" lang="${lang}">
      <head>
        <meta charset="UTF-8"/>
        <title>${t.title}</title>
        ${
          isUrdu
            ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">`
            : ""
        }
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:${font};background:#fff;color:#0f172a;padding:28px}
          .wrap{max-width:1120px;margin:0 auto}
          .hint{background:#eff6ff;color:#1d4ed8;padding:12px;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:14px;text-align:center;font-size:13px}
          .header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #111827;padding-bottom:16px;margin-bottom:18px}
          .brand{font-size:28px;font-weight:900;color:#111827}
          .subtitle{font-size:14px;color:#64748b;margin-top:5px}
          .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:#64748b;line-height:1.8}
          .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
          .box{border:1px solid #d1d5db;border-radius:12px;padding:12px;background:#f8fafc}
          .box small{display:block;color:#64748b;font-weight:800;text-transform:uppercase;font-size:10px;margin-bottom:6px}
          .box b{font-size:20px;font-family:monospace}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th{background:#111827;color:#fff;padding:10px;border:1px solid #111827;text-align:${isUrdu ? "right" : "left"}}
          td{padding:9px;border:1px solid #e5e7eb;color:#334155}
          tr:nth-child(even) td{background:#f8fafc}
          .center{text-align:center}
          .num{text-align:right;font-family:monospace}
          .strong{font-weight:900}
          .green{color:#16a34a}
          .red{color:#dc2626}
          @media print{body{padding:0}.hint{display:none}}
        </style>
      </head>
      <body>
        <div class="wrap">
          ${isPdf ? `<div class="hint">Print dialog mein “Save as PDF” select karein.</div>` : ""}
          <div class="header">
            <div>
              <div class="brand">Ali Cages</div>
              <div class="subtitle">${t.reportHeader}</div>
            </div>
            <div class="meta">
              <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
              ${
                filters.from_date || filters.to_date
                  ? `<div>Period: ${formatDate(filters.from_date) || "Start"} to ${formatDate(filters.to_date) || "End"}</div>`
                  : ""
              }
              ${filters.name ? `<div>${t.name}: ${filters.name}</div>` : ""}
            </div>
          </div>

          <div class="summary">
            <div class="box"><small>${t.totalInvoice}</small><b>Rs ${fmt(summary.totalInvoice)}</b></div>
            <div class="box"><small>${t.totalReturn}</small><b>Rs ${fmt(summary.totalReturn)}</b></div>
            <div class="box"><small>${t.netSales}</small><b>Rs ${fmt(summary.netSales)}</b></div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="center">#</th>
                <th>${t.type}</th>
                <th>${t.referenceNo}</th>
                <th>${t.name}</th>
                <th class="center">${t.date}</th>
                <th class="num">${t.invoiceAmount}</th>
                <th class="num">${t.returnAmount}</th>
                <th class="num">${t.netTotal}</th>
              </tr>
            </thead>
            <tbody>
              ${
                records.length
                  ? rowsHtml
                  : `<tr><td colspan="8" class="center">${t.noRecords}</td></tr>`
              }
            </tbody>
          </table>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              ${!isPdf ? "window.onafterprint = () => window.close();" : ""}
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1200,height=850");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div dir={dir} className="sales-report-page">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      {isUrdu && (
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap"
          rel="stylesheet"
        />
      )}

      <style>{`
        *{box-sizing:border-box}
        .sales-report-page{
          min-height:100vh;
          background:#f8fafc;
          padding:18px;
          color:#0f172a;
          font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"};
        }
        .page-wrap{max-width:1240px;margin:0 auto}
        .top-card{
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:18px;
          padding:18px 20px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          flex-wrap:wrap;
          box-shadow:0 8px 22px rgba(15,23,42,.04);
          margin-bottom:14px;
        }
        .title{margin:0;font-size:28px;font-weight:900}
        .subtitle{margin:5px 0 0;color:#64748b;font-size:13px}
        .btn{
          border:1px solid #cbd5e1;
          background:#fff;
          color:#0f172a;
          border-radius:10px;
          padding:9px 14px;
          font-weight:800;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          gap:7px;
          font-size:13px;
        }
        .btn:hover{background:#f8fafc}
        .btn-dark{background:#111827;color:#fff;border-color:#111827}
        .btn-dark:hover{background:#1f2937}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .filter-card{
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:18px;
          padding:15px;
          box-shadow:0 8px 22px rgba(15,23,42,.04);
          margin-bottom:14px;
        }
        .filter-grid{
          display:grid;
          grid-template-columns:1fr 1fr 1.5fr auto auto;
          gap:10px;
          align-items:end;
        }
        label{display:block;font-size:11px;color:#475569;font-weight:900;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px}
        .input{
          width:100%;
          height:39px;
          border:1px solid #cbd5e1;
          border-radius:10px;
          padding:0 10px;
          outline:none;
          background:#fff;
          color:#0f172a;
          font-size:13px;
          font-weight:650;
        }
        .input:focus{border-color:#111827;box-shadow:0 0 0 3px rgba(15,23,42,.08)}
        .summary-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:12px;
          margin-bottom:14px;
        }
        .summary-card{
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:16px;
          padding:15px;
          box-shadow:0 8px 22px rgba(15,23,42,.04);
        }
        .summary-card small{
          display:block;
          color:#64748b;
          font-size:11px;
          font-weight:900;
          text-transform:uppercase;
          margin-bottom:7px;
        }
        .summary-card b{
          display:block;
          font-family:monospace;
          font-size:24px;
          font-weight:900;
        }
        .table-card{
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 8px 22px rgba(15,23,42,.04);
        }
        .table-head{
          padding:13px 15px;
          border-bottom:1px solid #e2e8f0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
          background:#f8fafc;
        }
        .record-title{
          font-weight:900;
          color:#0f172a;
          display:flex;
          align-items:center;
          gap:8px;
        }
        .count-pill{
          background:#e2e8f0;
          color:#334155;
          border-radius:999px;
          padding:3px 9px;
          font-size:12px;
          font-family:monospace;
        }
        .table-wrap{overflow-x:auto}
        table{width:100%;border-collapse:collapse;min-width:920px}
        th{
          background:#111827;
          color:#fff;
          padding:11px 10px;
          font-size:11px;
          text-transform:uppercase;
          letter-spacing:.45px;
          text-align:${isUrdu ? "right" : "left"};
          white-space:nowrap;
        }
        td{
          padding:11px 10px;
          border-bottom:1px solid #eef2f7;
          color:#334155;
          font-size:13px;
          vertical-align:middle;
        }
        tr:hover td{background:#f8fafc}
        .center{text-align:center}
        .num{text-align:right;font-family:monospace;font-weight:800}
        .muted{color:#94a3b8}
        .tag{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border-radius:999px;
          padding:4px 10px;
          font-size:11px;
          font-weight:900;
          border:1px solid #e2e8f0;
          background:#f8fafc;
          color:#334155;
        }
        .tag-invoice{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}
        .tag-return{background:#fff1f2;color:#be123c;border-color:#fecdd3}
        .green{color:#16a34a}
        .red{color:#dc2626}
        @media(max-width:900px){
          .filter-grid{grid-template-columns:1fr 1fr}
          .summary-grid{grid-template-columns:1fr}
        }
        @media(max-width:560px){
          .filter-grid{grid-template-columns:1fr}
          .title{font-size:23px}
        }
      `}</style>

      <div className="page-wrap">
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          <button className="btn" onClick={() => setLang(isUrdu ? "en" : "ur")}>
            <i className="bi bi-translate"></i>
            {t.toggleLang}
          </button>
        </div>

        <div className="filter-card">
          <div className="filter-grid">
            <div>
              <label>{t.fromDate}</label>
              <input
                type="date"
                className="input"
                value={filters.from_date}
                onChange={(e) => setFilters((p) => ({ ...p, from_date: e.target.value }))}
              />
            </div>

            <div>
              <label>{t.toDate}</label>
              <input
                type="date"
                className="input"
                value={filters.to_date}
                onChange={(e) => setFilters((p) => ({ ...p, to_date: e.target.value }))}
              />
            </div>

            <div>
              <label>{t.nameSearch}</label>
              <input
                type="text"
                className="input"
                value={filters.name}
                onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
                placeholder={t.namePlaceholder}
              />
            </div>

            <button className="btn btn-dark" onClick={handleSearch} disabled={loading}>
              <i className={`bi ${loading ? "bi-hourglass-split" : "bi-search"}`}></i>
              {loading ? t.loading : t.searchBtn}
            </button>

            <button className="btn" onClick={handleReset} disabled={loading}>
              <i className="bi bi-arrow-counterclockwise"></i>
              {t.resetBtn}
            </button>
          </div>
        </div>

        {searched && (
          <>
            <div className="summary-grid">
              <div className="summary-card">
                <small>{t.totalInvoice}</small>
                <b className="green">Rs {fmt(summary.totalInvoice)}</b>
              </div>

              <div className="summary-card">
                <small>{t.totalReturn}</small>
                <b className="red">Rs {fmt(summary.totalReturn)}</b>
              </div>

              <div className="summary-card">
                <small>{t.netSales}</small>
                <b>Rs {fmt(summary.netSales)}</b>
              </div>
            </div>

            <div className="table-card">
              <div className="table-head">
                <div className="record-title">
                  <i className="bi bi-table"></i>
                  {t.records}
                  <span className="count-pill">{records.length}</span>
                </div>

                {records.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => generatePrintDocument(false)}>
                      <i className="bi bi-printer"></i>
                      {t.printBtn}
                    </button>
                    <button className="btn" onClick={() => generatePrintDocument(true)}>
                      <i className="bi bi-file-earmark-pdf"></i>
                      {t.pdfBtn}
                    </button>
                  </div>
                )}
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="center" style={{ width: 50 }}>#</th>
                      <th>{t.type}</th>
                      <th>{t.referenceNo}</th>
                      <th>{t.name}</th>
                      <th className="center">{t.date}</th>
                      <th className="num">{t.invoiceAmount}</th>
                      <th className="num">{t.returnAmount}</th>
                      <th className="num">{t.netTotal}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="center muted" style={{ padding: 42 }}>
                          {t.noRecords}
                        </td>
                      </tr>
                    ) : (
                      records.map((row, i) => (
                        <tr key={`${row.entry_type}-${row.id}-${i}`}>
                          <td className="center muted" style={{ fontFamily: "monospace" }}>
                            {i + 1}
                          </td>

                          <td>
                            <span className={`tag ${row.entry_type === "return" ? "tag-return" : "tag-invoice"}`}>
                              {typeLabel(row.entry_type)}
                            </span>
                          </td>

                          <td>
                            <b style={{ fontFamily: "monospace" }}>{row.reference_no}</b>
                          </td>

                          <td>
                            <b>{row.person_name || "-"}</b>
                          </td>

                          <td className="center">{formatDate(row.entry_date)}</td>

                          <td className="num green">Rs {fmt(row.invoice_amount)}</td>
                          <td className="num red">Rs {fmt(row.return_amount)}</td>

                          <td className={`num ${row.net_total < 0 ? "red" : "green"}`}>
                            Rs {fmt(row.net_total)}
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
}
