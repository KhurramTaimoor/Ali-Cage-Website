import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TYPE_OPTIONS = [
  { value: "all", label: "All Ledgers", urdu: "تمام لیجرز" },
  { value: "customer", label: "Customer", urdu: "کسٹمر" },
  { value: "supplier", label: "Supplier", urdu: "سپلائر" },
  { value: "employee", label: "Employee", urdu: "ملازم" },
  { value: "general", label: "General Account", urdu: "جنرل اکاؤنٹ" },
  { value: "product", label: "Product", urdu: "پروڈکٹ" },
  { value: "cash", label: "Cash / Bank", urdu: "کیش / بینک" },
];

const TEXT = {
  en: {
    title: "All Ledger Summary",
    subtitle:
      "Combined overview of customer, supplier, employee, general account, product and cash ledgers.",
    language: "اردو",
    refresh: "Refresh",
    print: "Print Summary",
    search: "Search ledger name, code, group or details...",
    type: "Ledger Type",
    fromDate: "From Date",
    toDate: "To Date",
    apply: "Apply Filters",
    reset: "Reset",
    ledgerCount: "Total Ledgers",
    receivable: "Total Receivable",
    payable: "Total Payable",
    debit: "Total Debit / In",
    credit: "Total Credit / Out",
    cash: "Cash Balance",
    stock: "Product Stock Qty",
    ledgerName: "Ledger Name",
    ledgerCategory: "Type",
    opening: "Opening Balance",
    debitIn: "Debit / In",
    creditOut: "Credit / Out",
    closing: "Closing Balance",
    transactions: "Transactions",
    status: "Status",
    action: "Action",
    details: "View Details",
    loading: "Loading all ledgers...",
    noRows: "No ledgers found for the selected filters.",
    errorTitle: "Unable to load ledger summary",
    filtered: "Filtered ledgers",
    showing: "Showing",
    of: "of",
    all: "All",
    netMovement: "Net Movement",
  },
  ur: {
    title: "تمام لیجرز کی سمری",
    subtitle:
      "کسٹمر، سپلائر، ملازم، جنرل اکاؤنٹ، پروڈکٹ اور کیش لیجرز کا مشترکہ خلاصہ۔",
    language: "English",
    refresh: "ریفریش",
    print: "سمری پرنٹ کریں",
    search: "لیجر نام، کوڈ، گروپ یا تفصیل تلاش کریں...",
    type: "لیجر کی قسم",
    fromDate: "شروع تاریخ",
    toDate: "آخری تاریخ",
    apply: "فلٹر لگائیں",
    reset: "ری سیٹ",
    ledgerCount: "کل لیجرز",
    receivable: "کل وصولی",
    payable: "کل ادائیگی",
    debit: "کل ڈیبٹ / آمد",
    credit: "کل کریڈٹ / اخراج",
    cash: "کیش بیلنس",
    stock: "کل پروڈکٹ مقدار",
    ledgerName: "لیجر نام",
    ledgerCategory: "قسم",
    opening: "اوپننگ بیلنس",
    debitIn: "ڈیبٹ / آمد",
    creditOut: "کریڈٹ / اخراج",
    closing: "کلوزنگ بیلنس",
    transactions: "ٹرانزیکشنز",
    status: "حالت",
    action: "ایکشن",
    details: "تفصیل دیکھیں",
    loading: "تمام لیجرز لوڈ ہو رہے ہیں...",
    noRows: "منتخب فلٹرز میں کوئی لیجر نہیں ملا۔",
    errorTitle: "لیجر سمری لوڈ نہیں ہو سکی",
    filtered: "فلٹر شدہ لیجرز",
    showing: "دکھائے جا رہے ہیں",
    of: "از",
    all: "تمام",
    netMovement: "نیٹ موومنٹ",
  },
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  return `Rs ${toNumber(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatQuantity(value) {
  return toNumber(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatValue(row, value) {
  return row?.is_quantity ? `${formatQuantity(value)} Qty` : formatMoney(value);
}

function formatSignedValue(row, value) {
  const amount = toNumber(value);
  if (amount === 0) return row?.is_quantity ? "0 Qty" : "Rs 0";
  const formatted = formatValue(row, Math.abs(amount));
  return amount > 0 ? formatted : `-${formatted}`;
}

function buildSummary(rows) {
  const moneyRows = rows.filter((row) => !row.is_quantity);
  const productRows = rows.filter((row) => row.is_quantity);

  const totalDebit = moneyRows.reduce(
    (sum, row) => sum + toNumber(row.total_debit),
    0
  );
  const totalCredit = moneyRows.reduce(
    (sum, row) => sum + toNumber(row.total_credit),
    0
  );

  const totalReceivable = rows
    .filter(
      (row) => row.type === "customer" && toNumber(row.closing_balance) > 0
    )
    .reduce((sum, row) => sum + toNumber(row.closing_balance), 0);

  const customerAdvances = rows
    .filter(
      (row) => row.type === "customer" && toNumber(row.closing_balance) < 0
    )
    .reduce((sum, row) => sum + Math.abs(toNumber(row.closing_balance)), 0);

  const totalPayable = rows
    .filter(
      (row) =>
        ["supplier", "employee"].includes(row.type) &&
        toNumber(row.closing_balance) > 0
    )
    .reduce((sum, row) => sum + toNumber(row.closing_balance), customerAdvances);

  const cashBalance = rows
    .filter((row) => row.type === "cash")
    .reduce((sum, row) => sum + toNumber(row.closing_balance), 0);

  const stockQuantity = productRows.reduce(
    (sum, row) => sum + toNumber(row.closing_balance),
    0
  );

  return {
    ledger_count: rows.length,
    total_receivable: totalReceivable,
    total_payable: totalPayable,
    total_debit: totalDebit,
    total_credit: totalCredit,
    net_balance: totalDebit - totalCredit,
    cash_balance: cashBalance,
    stock_quantity: stockQuantity,
  };
}

function typeLabel(type, isUrdu) {
  const option = TYPE_OPTIONS.find((item) => item.value === type);
  if (!option) return type || "-";
  return isUrdu ? option.urdu : option.label;
}

function getTypeStyle(type) {
  const styles = {
    customer: "bg-sky-100 text-sky-700 border-sky-200",
    supplier: "bg-violet-100 text-violet-700 border-violet-200",
    employee: "bg-amber-100 text-amber-700 border-amber-200",
    general: "bg-slate-100 text-slate-700 border-slate-200",
    product: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cash: "bg-teal-100 text-teal-700 border-teal-200",
  };
  return styles[type] || styles.general;
}

function getStatus(row, isUrdu) {
  const balance = toNumber(row.closing_balance);

  if (row.type === "customer") {
    if (balance > 0)
      return {
        label: isUrdu ? "وصولی" : "Receivable",
        className: "bg-sky-100 text-sky-700",
      };
    if (balance < 0)
      return {
        label: isUrdu ? "کسٹمر ایڈوانس" : "Customer Advance",
        className: "bg-violet-100 text-violet-700",
      };
  }

  if (["supplier", "employee"].includes(row.type)) {
    if (balance > 0)
      return {
        label: isUrdu ? "قابل ادائیگی" : "Payable",
        className: "bg-rose-100 text-rose-700",
      };
    if (balance < 0)
      return {
        label: isUrdu ? "ایڈوانس" : "Advance",
        className: "bg-indigo-100 text-indigo-700",
      };
  }

  if (row.type === "general") {
    if (balance > 0)
      return {
        label: isUrdu ? "ڈیبٹ بیلنس" : "Debit Balance",
        className: "bg-emerald-100 text-emerald-700",
      };
    if (balance < 0)
      return {
        label: isUrdu ? "کریڈٹ بیلنس" : "Credit Balance",
        className: "bg-violet-100 text-violet-700",
      };
  }

  if (row.type === "cash") {
    return balance >= 0
      ? {
          label: isUrdu ? "دستیاب" : "Available",
          className: "bg-teal-100 text-teal-700",
        }
      : {
          label: isUrdu ? "منفی کیش" : "Negative Cash",
          className: "bg-rose-100 text-rose-700",
        };
  }

  if (row.type === "product") {
    return balance > 0
      ? {
          label: isUrdu ? "اسٹاک میں" : "In Stock",
          className: "bg-emerald-100 text-emerald-700",
        }
      : balance < 0
      ? {
          label: isUrdu ? "منفی اسٹاک" : "Negative Stock",
          className: "bg-rose-100 text-rose-700",
        }
      : {
          label: isUrdu ? "اسٹاک ختم" : "Out of Stock",
          className: "bg-amber-100 text-amber-700",
        };
  }

  return {
    label: isUrdu ? "برابر" : "Settled",
    className: "bg-slate-100 text-slate-700",
  };
}

async function apiFetch(path) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Request failed.");
  }
  return payload;
}

export default function AllLedgerSummaryPage() {
  const [language, setLanguage] = useState("en");
  const t = TEXT[language];
  const isUrdu = language === "ur";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedDates, setAppliedDates] = useState({ from: "", to: "" });

  async function loadSummary(dateFilters = appliedDates) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (dateFilters.from) params.set("from_date", dateFilters.from);
      if (dateFilters.to) params.set("to_date", dateFilters.to);

      const payload = await apiFetch(
        `/api/ledger-summary${params.toString() ? `?${params.toString()}` : ""}`
      );
      setRows(Array.isArray(payload.rows) ? payload.rows : []);
    } catch (loadError) {
      console.error("All ledger summary error:", loadError);
      setError(loadError.message || "Ledger summary could not be loaded.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary({ from: "", to: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (!query) return true;

      return [row.name, row.code, row.category, row.meta]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search, typeFilter]);

  const summary = useMemo(() => buildSummary(filteredRows), [filteredRows]);

  function applyFilters() {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From date cannot be after To date.");
      return;
    }
    const next = { from: fromDate, to: toDate };
    setAppliedDates(next);
    loadSummary(next);
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setFromDate("");
    setToDate("");
    setAppliedDates({ from: "", to: "" });
    loadSummary({ from: "", to: "" });
  }

  return (
    <div
      className="min-h-full bg-slate-50 p-4 md:p-6"
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <style>{`
        @media print {
          .ledger-print-hide { display: none !important; }
          .ledger-print-page { padding: 0 !important; background: white !important; }
          .ledger-print-card { box-shadow: none !important; break-inside: avoid; }
          .ledger-table-wrap { overflow: visible !important; }
          .ledger-table { min-width: 100% !important; font-size: 10px !important; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      <div className="ledger-print-page max-w-[1600px] mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
                <i className="bi bi-journals text-xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                  {t.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="ledger-print-hide flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(isUrdu ? "en" : "ur")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
            >
              <i className="bi bi-translate me-2" />
              {t.language}
            </button>
            <button
              type="button"
              onClick={() => loadSummary()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100 disabled:opacity-50 transition"
            >
              <i className="bi bi-arrow-clockwise me-2" />
              {t.refresh}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition"
            >
              <i className="bi bi-printer me-2" />
              {t.print}
            </button>
          </div>
        </div>

        <div className="ledger-print-hide bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 items-end">
            <div className="xl:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {t.search}
              </label>
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                />
              </div>
            </div>

            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {t.type}
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isUrdu ? option.urdu : option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {t.fromDate}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
              />
            </div>

            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {t.toDate}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
              />
            </div>

            <div className="xl:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={applyFilters}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 disabled:opacity-50 transition"
              >
                {t.apply}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                disabled={loading}
                className="h-11 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 disabled:opacity-50 transition"
              >
                {t.reset}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <div className="font-extrabold">{t.errorTitle}</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
          <SummaryCard
            label={t.ledgerCount}
            value={summary.ledger_count.toLocaleString("en-PK")}
            icon="bi-journals"
          />
          <SummaryCard
            label={t.receivable}
            value={formatMoney(summary.total_receivable)}
            icon="bi-arrow-down-left-circle"
            valueClass="text-sky-700"
          />
          <SummaryCard
            label={t.payable}
            value={formatMoney(summary.total_payable)}
            icon="bi-arrow-up-right-circle"
            valueClass="text-rose-700"
          />
          <SummaryCard
            label={t.debit}
            value={formatMoney(summary.total_debit)}
            icon="bi-plus-circle"
            valueClass="text-emerald-700"
          />
          <SummaryCard
            label={t.credit}
            value={formatMoney(summary.total_credit)}
            icon="bi-dash-circle"
            valueClass="text-violet-700"
          />
          <SummaryCard
            label={t.cash}
            value={formatMoney(summary.cash_balance)}
            icon="bi-cash-stack"
            valueClass={summary.cash_balance < 0 ? "text-rose-700" : "text-teal-700"}
          />
          <SummaryCard
            label={t.stock}
            value={`${formatQuantity(summary.stock_quantity)} Qty`}
            icon="bi-box-seam"
            valueClass="text-emerald-700"
          />
        </div>

        <div className="ledger-print-card bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-slate-800">{t.filtered}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {t.showing} {filteredRows.length.toLocaleString("en-PK")} {t.of}{" "}
                {rows.length.toLocaleString("en-PK")}
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500">
              {appliedDates.from || appliedDates.to
                ? `${appliedDates.from || "Start"} — ${appliedDates.to || "End"}`
                : t.all}
            </div>
          </div>

          <div className="ledger-table-wrap overflow-x-auto">
            <table className="ledger-table w-full min-w-[1250px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <TableHead>#</TableHead>
                  <TableHead>{t.ledgerName}</TableHead>
                  <TableHead>{t.ledgerCategory}</TableHead>
                  <TableHead align="right">{t.opening}</TableHead>
                  <TableHead align="right">{t.debitIn}</TableHead>
                  <TableHead align="right">{t.creditOut}</TableHead>
                  <TableHead align="right">{t.closing}</TableHead>
                  <TableHead align="center">{t.transactions}</TableHead>
                  <TableHead align="center">{t.status}</TableHead>
                  <TableHead align="center" className="ledger-print-hide">
                    {t.action}
                  </TableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-500">
                      <div className="inline-flex items-center gap-3 font-bold">
                        <span className="w-5 h-5 rounded-full border-2 border-sky-200 border-t-sky-600 animate-spin" />
                        {t.loading}
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-500">
                      <i className="bi bi-inbox text-3xl block mb-2 text-slate-300" />
                      {t.noRows}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => {
                    const status = getStatus(row, isUrdu);
                    return (
                      <tr key={row.id} className="hover:bg-sky-50/40 transition">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-extrabold text-slate-800">
                            {row.name || "-"}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {[row.code, row.meta].filter(Boolean).join(" · ") || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold ${getTypeStyle(
                              row.type
                            )}`}
                          >
                            {typeLabel(row.type, isUrdu)}
                          </span>
                        </TableCell>
                        <TableCell align="right" className="font-semibold text-slate-700">
                          {formatSignedValue(row, row.opening_balance)}
                        </TableCell>
                        <TableCell align="right" className="font-bold text-emerald-700">
                          {formatValue(row, row.total_debit)}
                        </TableCell>
                        <TableCell align="right" className="font-bold text-violet-700">
                          {formatValue(row, row.total_credit)}
                        </TableCell>
                        <TableCell
                          align="right"
                          className={`font-black ${
                            toNumber(row.closing_balance) < 0
                              ? "text-rose-700"
                              : "text-slate-900"
                          }`}
                        >
                          {formatSignedValue(row, row.closing_balance)}
                        </TableCell>
                        <TableCell align="center">
                          <span className="inline-flex min-w-9 justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            {toNumber(row.transaction_count).toLocaleString("en-PK")}
                          </span>
                        </TableCell>
                        <TableCell align="center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell align="center" className="ledger-print-hide">
                          <Link
                            to={row.detail_path || "/app/dashboard"}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-sky-700 transition"
                          >
                            <i className="bi bi-eye" />
                            {t.details}
                          </Link>
                        </TableCell>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {!loading && filteredRows.length > 0 && (
                <tfoot className="bg-slate-900 text-white">
                  <tr>
                    <td colSpan={3} className="px-4 py-4 font-black">
                      {t.netMovement}
                    </td>
                    <td className="px-4 py-4 text-right font-bold">-</td>
                    <td className="px-4 py-4 text-right font-black">
                      {formatMoney(summary.total_debit)}
                    </td>
                    <td className="px-4 py-4 text-right font-black">
                      {formatMoney(summary.total_credit)}
                    </td>
                    <td className="px-4 py-4 text-right font-black">
                      {formatSignedValue(
                        { is_quantity: false },
                        summary.net_balance
                      )}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, valueClass = "text-slate-900" }) {
  return (
    <div className="ledger-print-card bg-white rounded-2xl border border-slate-200 p-4 shadow-sm min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide font-extrabold text-slate-500 truncate">
            {label}
          </div>
          <div className={`text-lg font-black mt-2 truncate ${valueClass}`}>
            {value}
          </div>
        </div>
        <div className="w-9 h-9 shrink-0 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
          <i className={`bi ${icon}`} />
        </div>
      </div>
    </div>
  );
}

function TableHead({ children, align = "left", className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-xs uppercase tracking-wide font-black whitespace-nowrap ${className}`}
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function TableCell({ children, align = "left", className = "" }) {
  return (
    <td
      className={`px-4 py-3 align-middle whitespace-nowrap ${className}`}
      style={{ textAlign: align }}
    >
      {children}
    </td>
  );
}
