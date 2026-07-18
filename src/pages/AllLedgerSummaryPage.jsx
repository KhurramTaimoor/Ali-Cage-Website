import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TYPE_OPTIONS = [
  { value: "all", en: "All Ledgers", ur: "تمام لیجرز" },
  { value: "customer", en: "Customer", ur: "کسٹمر" },
  { value: "supplier", en: "Supplier", ur: "سپلائر" },
  { value: "employee", en: "Employee", ur: "ملازم" },
  { value: "general", en: "General Account", ur: "جنرل اکاؤنٹ" },
  { value: "product", en: "Product", ur: "پروڈکٹ" },
  { value: "cash", en: "Cash / Bank", ur: "کیش / بینک" },
];

const LANG = {
  en: {
    title: "All Ledger Summary",
    subtitle:
      "Combined overview of customer, supplier, employee, general account, product and cash ledgers.",

    toggleLang: "اردو",
    refresh: "Refresh",
    print: "Print Summary",

    searchLabel: "Search",
    searchPlaceholder: "Search by ledger name, code, group or details...",
    ledgerType: "Ledger Type",
    fromDate: "From Date",
    toDate: "To Date",
    applyFilters: "Apply Filters",
    reset: "Reset",

    totalLedgers: "Total Ledgers",
    totalReceivable: "Total Receivable",
    totalPayable: "Total Payable",

    filteredLedgers: "Ledger Records",
    showing: "Showing",
    of: "of",
    all: "All records",

    number: "#",
    ledgerName: "Ledger Name",
    type: "Type",
    opening: "Opening Balance",
    debit: "Debit / In",
    credit: "Credit / Out",
    closing: "Closing Balance",
    transactions: "Transactions",
    status: "Status",
    action: "Action",
    viewDetails: "View Details",

    loading: "Loading ledger summary...",
    noRecords: "No ledger records found.",
    loadError: "Unable to load ledger summary",
    invalidDates: "From Date cannot be after To Date.",
    start: "Start",
    end: "End",
  },

  ur: {
    title: "تمام لیجرز کی سمری",
    subtitle:
      "کسٹمر، سپلائر، ملازم، جنرل اکاؤنٹ، پروڈکٹ اور کیش لیجرز کا مشترکہ خلاصہ۔",

    toggleLang: "English",
    refresh: "ریفریش",
    print: "سمری پرنٹ کریں",

    searchLabel: "تلاش",
    searchPlaceholder: "لیجر نام، کوڈ، گروپ یا تفصیل سے تلاش کریں...",
    ledgerType: "لیجر کی قسم",
    fromDate: "شروع تاریخ",
    toDate: "آخری تاریخ",
    applyFilters: "فلٹر لگائیں",
    reset: "ری سیٹ",

    totalLedgers: "کل لیجرز",
    totalReceivable: "کل وصولی",
    totalPayable: "کل ادائیگی",

    filteredLedgers: "لیجر ریکارڈز",
    showing: "دکھائے جا رہے ہیں",
    of: "از",
    all: "تمام ریکارڈز",

    number: "نمبر",
    ledgerName: "لیجر نام",
    type: "قسم",
    opening: "اوپننگ بیلنس",
    debit: "ڈیبٹ / آمد",
    credit: "کریڈٹ / اخراج",
    closing: "کلوزنگ بیلنس",
    transactions: "ٹرانزیکشنز",
    status: "حالت",
    action: "ایکشن",
    viewDetails: "تفصیل دیکھیں",

    loading: "لیجر سمری لوڈ ہو رہی ہے...",
    noRecords: "کوئی لیجر ریکارڈ نہیں ملا۔",
    loadError: "لیجر سمری لوڈ نہیں ہو سکی",
    invalidDates: "شروع تاریخ آخری تاریخ کے بعد نہیں ہو سکتی۔",
    start: "شروع",
    end: "اختتام",
  },
};

async function apiFetch(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message ||
        payload.error ||
        "Request failed"
    );
  }

  return payload;
}

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
  if (row?.is_quantity) {
    return `${formatQuantity(value)} Qty`;
  }

  return formatMoney(value);
}

function formatBalance(row, value) {
  const amount = toNumber(value);

  if (row?.is_quantity) {
    if (amount > 0) {
      return `${formatQuantity(amount)} Qty`;
    }

    if (amount < 0) {
      return `-${formatQuantity(Math.abs(amount))} Qty`;
    }

    return "0 Qty";
  }

  if (amount > 0) {
    return `${formatMoney(amount)} Dr`;
  }

  if (amount < 0) {
    return `${formatMoney(Math.abs(amount))} Cr`;
  }

  return "Rs 0";
}

function buildSummary(rows) {
  const totalReceivable = rows
    .filter(
      (row) =>
        row.type === "customer" &&
        toNumber(row.closing_balance) > 0
    )
    .reduce(
      (sum, row) =>
        sum + toNumber(row.closing_balance),
      0
    );

  const customerAdvances = rows
    .filter(
      (row) =>
        row.type === "customer" &&
        toNumber(row.closing_balance) < 0
    )
    .reduce(
      (sum, row) =>
        sum + Math.abs(toNumber(row.closing_balance)),
      0
    );

  const supplierAndEmployeePayable = rows
    .filter(
      (row) =>
        ["supplier", "employee"].includes(row.type) &&
        toNumber(row.closing_balance) > 0
    )
    .reduce(
      (sum, row) =>
        sum + toNumber(row.closing_balance),
      0
    );

  return {
    ledgerCount: rows.length,
    totalReceivable,
    totalPayable:
      supplierAndEmployeePayable + customerAdvances,
  };
}

function getTypeLabel(type, isUrdu) {
  const matched = TYPE_OPTIONS.find(
    (option) => option.value === type
  );

  if (!matched) return type || "-";

  return isUrdu ? matched.ur : matched.en;
}

function getTypeClass(type) {
  const classes = {
    customer:
      "bg-indigo-50 text-indigo-700 border-indigo-100",

    supplier:
      "bg-violet-50 text-violet-700 border-violet-100",

    employee:
      "bg-amber-50 text-amber-700 border-amber-100",

    general:
      "bg-slate-100 text-slate-700 border-slate-200",

    product:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    cash:
      "bg-cyan-50 text-cyan-700 border-cyan-100",
  };

  return classes[type] || classes.general;
}

function getStatus(row, isUrdu) {
  const balance = toNumber(row.closing_balance);

  if (row.type === "customer") {
    if (balance > 0) {
      return {
        label: isUrdu ? "وصولی" : "Receivable",
        className: "bg-indigo-50 text-indigo-700",
      };
    }

    if (balance < 0) {
      return {
        label: isUrdu
          ? "کسٹمر ایڈوانس"
          : "Customer Advance",

        className: "bg-violet-50 text-violet-700",
      };
    }
  }

  if (
    ["supplier", "employee"].includes(row.type)
  ) {
    if (balance > 0) {
      return {
        label: isUrdu
          ? "قابل ادائیگی"
          : "Payable",

        className: "bg-rose-50 text-rose-700",
      };
    }

    if (balance < 0) {
      return {
        label: isUrdu ? "ایڈوانس" : "Advance",
        className: "bg-sky-50 text-sky-700",
      };
    }
  }

  if (row.type === "product") {
    if (balance > 0) {
      return {
        label: isUrdu ? "اسٹاک میں" : "In Stock",
        className: "bg-emerald-50 text-emerald-700",
      };
    }

    if (balance < 0) {
      return {
        label: isUrdu
          ? "منفی اسٹاک"
          : "Negative Stock",

        className: "bg-rose-50 text-rose-700",
      };
    }

    return {
      label: isUrdu
        ? "اسٹاک ختم"
        : "Out of Stock",

      className: "bg-amber-50 text-amber-700",
    };
  }

  if (row.type === "cash") {
    if (balance >= 0) {
      return {
        label: isUrdu ? "دستیاب" : "Available",
        className: "bg-cyan-50 text-cyan-700",
      };
    }

    return {
      label: isUrdu
        ? "منفی کیش"
        : "Negative Cash",

      className: "bg-rose-50 text-rose-700",
    };
  }

  if (balance > 0) {
    return {
      label: isUrdu
        ? "ڈیبٹ بیلنس"
        : "Debit Balance",

      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (balance < 0) {
    return {
      label: isUrdu
        ? "کریڈٹ بیلنس"
        : "Credit Balance",

      className: "bg-violet-50 text-violet-700",
    };
  }

  return {
    label: isUrdu ? "برابر" : "Settled",
    className: "bg-slate-100 text-slate-600",
  };
}

const AllLedgerSummaryPage = () => {
  const [lang, setLang] = useState("en");

  const t = LANG[lang];
  const isUrdu = lang === "ur";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [ledgerType, setLedgerType] =
    useState("all");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedDates, setAppliedDates] =
    useState({
      from: "",
      to: "",
    });

  const loadSummary = useCallback(
    async (dates = { from: "", to: "" }) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (dates.from) {
          params.set("from_date", dates.from);
        }

        if (dates.to) {
          params.set("to_date", dates.to);
        }

        const query = params.toString();

        const payload = await apiFetch(
          `/api/ledger-summary${
            query ? `?${query}` : ""
          }`
        );

        setRows(
          Array.isArray(payload?.rows)
            ? payload.rows
            : []
        );
      } catch (loadError) {
        console.error(
          "Ledger summary error:",
          loadError
        );

        setRows([]);

        setError(
          loadError.message ||
            "Unable to load ledger summary"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const filteredRows = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return rows.filter((row) => {
      if (
        ledgerType !== "all" &&
        row.type !== ledgerType
      ) {
        return false;
      }

      if (!query) return true;

      return [
        row.name,
        row.code,
        row.category,
        row.meta,
        row.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search, ledgerType]);

  const summary = useMemo(
    () => buildSummary(filteredRows),
    [filteredRows]
  );

  const applyFilters = () => {
    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      setError(t.invalidDates);
      return;
    }

    const nextDates = {
      from: fromDate,
      to: toDate,
    };

    setAppliedDates(nextDates);
    loadSummary(nextDates);
  };

  const resetFilters = () => {
    setSearch("");
    setLedgerType("all");
    setFromDate("");
    setToDate("");

    setAppliedDates({
      from: "",
      to: "",
    });

    setError("");
    loadSummary();
  };

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-3 pb-20 sm:p-4 lg:p-6"
      style={{
        fontFamily: isUrdu
          ? "'Noto Nastaliq Urdu', serif"
          : "Helvetica, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
      />

      <style>{`
        .ledger-page * {
          box-sizing: border-box;
        }

        .ledger-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        .ledger-money {
          font-variant-numeric: tabular-nums;
        }

        @media print {
          body {
            background: white !important;
          }

          .ledger-no-print {
            display: none !important;
          }

          .ledger-mobile-list {
            display: none !important;
          }

          .ledger-desktop-table {
            display: block !important;
          }

          .ledger-page {
            padding: 0 !important;
            background: white !important;
          }

          .ledger-print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="ledger-page mx-auto w-full max-w-7xl min-w-0">

        {/* HEADER */}

        <section className="ledger-print-card mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:mb-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm sm:h-12 sm:w-12">
                  <i className="bi bi-journals text-lg sm:text-xl" />
                </div>

                <div className="min-w-0">
                  <h1 className="break-words text-xl font-black text-slate-950 sm:text-2xl lg:text-3xl">
                    {t.title}
                  </h1>

                  <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
                    {t.subtitle}
                  </p>
                </div>

              </div>
            </div>

            <div className="ledger-no-print grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">

              <button
                type="button"
                onClick={() =>
                  setLang(isUrdu ? "en" : "ur")
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <i className="bi bi-translate" />
                {t.toggleLang}
              </button>

              <button
                type="button"
                onClick={() =>
                  loadSummary(appliedDates)
                }
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-indigo-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i
                  className={`bi bi-arrow-clockwise ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                {t.refresh}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <i className="bi bi-printer" />
                {t.print}
              </button>

            </div>
          </div>
        </section>

        {/* FILTERS */}

        <section className="ledger-no-print mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:mb-5 lg:p-5">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">

            <div className="min-w-0 sm:col-span-2 xl:col-span-4">
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                {t.searchLabel}
              </label>

              <div className="relative min-w-0">
                <i
                  className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                    isUrdu ? "right-3" : "left-3"
                  }`}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={t.searchPlaceholder}
                  className={`h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 ${
                    isUrdu
                      ? "pl-3 pr-10 text-right"
                      : "pl-10 pr-3"
                  }`}
                />
              </div>
            </div>

            <div className="min-w-0 xl:col-span-2">
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                {t.ledgerType}
              </label>

              <select
                value={ledgerType}
                onChange={(event) =>
                  setLedgerType(event.target.value)
                }
                className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {isUrdu
                      ? option.ur
                      : option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 xl:col-span-2">
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                {t.fromDate}
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(event.target.value)
                }
                className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="min-w-0 xl:col-span-2">
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                {t.toDate}
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(event) =>
                  setToDate(event.target.value)
                }
                className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:col-span-2 xl:col-span-2 xl:self-end">

              <button
                type="button"
                onClick={applyFilters}
                disabled={loading}
                className="h-11 min-w-0 rounded-lg bg-indigo-600 px-3 text-xs font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                {t.applyFilters}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                disabled={loading}
                className="h-11 min-w-0 rounded-lg bg-slate-100 px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                {t.reset}
              </button>

            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 lg:mb-5">
            <div className="flex items-start gap-3">

              <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />

              <div className="min-w-0">
                <div className="font-black">
                  {t.loadError}
                </div>

                <div className="mt-1 break-words text-sm">
                  {error}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ONLY THREE SUMMARY CARDS */}

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mb-5">

          <SummaryCard
            label={t.totalLedgers}
            value={summary.ledgerCount.toLocaleString(
              "en-PK"
            )}
            icon="bi-journals"
            iconClass="bg-indigo-50 text-indigo-700"
          />

          <SummaryCard
            label={t.totalReceivable}
            value={formatMoney(
              summary.totalReceivable
            )}
            icon="bi-arrow-down-left-circle"
            iconClass="bg-emerald-50 text-emerald-700"
            valueClass="text-emerald-700"
          />

          <SummaryCard
            label={t.totalPayable}
            value={formatMoney(
              summary.totalPayable
            )}
            icon="bi-arrow-up-right-circle"
            iconClass="bg-rose-50 text-rose-700"
            valueClass="text-rose-700"
          />

        </section>

        {/* LEDGER RECORDS */}

        <section className="ledger-print-card min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex min-w-0 flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

            <div className="min-w-0">
              <h2 className="break-words text-base font-black text-slate-900 sm:text-lg">
                {t.filteredLedgers}
              </h2>

              <p className="mt-1 break-words text-xs text-slate-500">
                {t.showing}{" "}
                {filteredRows.length.toLocaleString(
                  "en-PK"
                )}{" "}
                {t.of}{" "}
                {rows.length.toLocaleString(
                  "en-PK"
                )}
              </p>
            </div>

            <div className="break-words text-xs font-bold text-slate-500">
              {appliedDates.from ||
              appliedDates.to
                ? `${
                    appliedDates.from ||
                    t.start
                  } — ${
                    appliedDates.to ||
                    t.end
                  }`
                : t.all}
            </div>

          </div>

          {/* DESKTOP TABLE */}

          <div className="ledger-desktop-table hidden min-w-0 xl:block">

            <table className="w-full table-fixed text-xs 2xl:text-sm">

              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "9%" }} />
              </colgroup>

              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <TableHead align="center">
                    {t.number}
                  </TableHead>

                  <TableHead>
                    {t.ledgerName}
                  </TableHead>

                  <TableHead>
                    {t.type}
                  </TableHead>

                  <TableHead align="right">
                    {t.opening}
                  </TableHead>

                  <TableHead align="right">
                    {t.debit}
                  </TableHead>

                  <TableHead align="right">
                    {t.credit}
                  </TableHead>

                  <TableHead align="right">
                    {t.closing}
                  </TableHead>

                  <TableHead
                    align="center"
                    className="ledger-no-print"
                  >
                    {t.action}
                  </TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16 text-center"
                    >
                      <LoadingState
                        text={t.loading}
                      />
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16 text-center"
                    >
                      <EmptyState
                        text={t.noRecords}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(
                    (row, index) => {
                      const status = getStatus(
                        row,
                        isUrdu
                      );

                      return (
                        <tr
                          key={
                            row.id ||
                            `${row.type}-${row.entity_id}-${index}`
                          }
                          className="transition hover:bg-indigo-50/30"
                        >
                          <TableCell
                            align="center"
                            className="font-bold text-slate-500"
                          >
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            <div className="min-w-0">

                              <div className="break-words font-black text-slate-950">
                                {row.name || "-"}
                              </div>

                              <div className="mt-1 break-words text-[11px] leading-4 text-slate-500">
                                {[
                                  row.code,
                                  row.meta,
                                ]
                                  .filter(Boolean)
                                  .join(" · ") ||
                                  "-"}
                              </div>

                              <div className="mt-1 text-[11px] font-bold text-indigo-600">
                                {toNumber(
                                  row.transaction_count
                                ).toLocaleString(
                                  "en-PK"
                                )}{" "}
                                {t.transactions}
                              </div>

                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex min-w-0 flex-col items-start gap-1.5">

                              <span
                                className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${getTypeClass(
                                  row.type
                                )}`}
                              >
                                <span className="break-words">
                                  {getTypeLabel(
                                    row.type,
                                    isUrdu
                                  )}
                                </span>
                              </span>

                              <span
                                className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-extrabold ${status.className}`}
                              >
                                <span className="break-words">
                                  {status.label}
                                </span>
                              </span>

                            </div>
                          </TableCell>

                          <TableCell
                            align="right"
                            className="ledger-money break-words font-bold text-slate-700"
                          >
                            {formatBalance(
                              row,
                              row.opening_balance
                            )}
                          </TableCell>

                          <TableCell
                            align="right"
                            className="ledger-money break-words font-black text-emerald-700"
                          >
                            {formatValue(
                              row,
                              row.total_debit
                            )}
                          </TableCell>

                          <TableCell
                            align="right"
                            className="ledger-money break-words font-black text-rose-700"
                          >
                            {formatValue(
                              row,
                              row.total_credit
                            )}
                          </TableCell>

                          <TableCell
                            align="right"
                            className={`ledger-money break-words font-black ${
                              toNumber(
                                row.closing_balance
                              ) < 0
                                ? "text-rose-700"
                                : "text-slate-950"
                            }`}
                          >
                            {formatBalance(
                              row,
                              row.closing_balance
                            )}
                          </TableCell>

                          <TableCell
                            align="center"
                            className="ledger-no-print"
                          >
                            <Link
                              to={
                                row.detail_path ||
                                "/app/dashboard"
                              }
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-2 py-2 text-[11px] font-extrabold text-white transition hover:bg-indigo-700"
                            >
                              <i className="bi bi-eye" />

                              <span className="break-words">
                                {t.viewDetails}
                              </span>
                            </Link>
                          </TableCell>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* MOBILE AND TABLET CARDS */}

          <div className="ledger-mobile-list grid min-w-0 grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden">

            {loading ? (
              <div className="col-span-full py-12 text-center">
                <LoadingState text={t.loading} />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <EmptyState text={t.noRecords} />
              </div>
            ) : (
              filteredRows.map((row, index) => (
                <LedgerMobileCard
                  key={
                    row.id ||
                    `${row.type}-${row.entity_id}-${index}`
                  }
                  row={row}
                  index={index}
                  t={t}
                  isUrdu={isUrdu}
                />
              ))
            )}

          </div>
        </section>

      </div>
    </div>
  );
};

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  valueClass = "text-slate-950",
}) {
  return (
    <div className="ledger-print-card min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="flex min-w-0 items-center justify-between gap-3">

        <div className="min-w-0">
          <p className="break-words text-xs font-extrabold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p
            className={`ledger-money mt-2 break-words text-xl font-black sm:text-2xl ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <i className={`bi ${icon} text-lg`} />
        </div>

      </div>
    </div>
  );
}

function LedgerMobileCard({
  row,
  index,
  t,
  isUrdu,
}) {
  const status = getStatus(row, isUrdu);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex min-w-0 items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">

            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
              #{index + 1}
            </span>

            <span
              className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${getTypeClass(
                row.type
              )}`}
            >
              <span className="break-words">
                {getTypeLabel(
                  row.type,
                  isUrdu
                )}
              </span>
            </span>

          </div>

          <h3 className="break-words text-base font-black text-slate-950">
            {row.name || "-"}
          </h3>

          <p className="mt-1 break-words text-xs leading-5 text-slate-500">
            {[row.code, row.meta]
              .filter(Boolean)
              .join(" · ") || "-"}
          </p>

        </div>

        <span
          className={`inline-flex max-w-[45%] shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-extrabold ${status.className}`}
        >
          <span className="break-words">
            {status.label}
          </span>
        </span>

      </div>

      <div className="mt-4 grid min-w-0 grid-cols-2 gap-2">

        <InfoCard
          label={t.opening}
          value={formatBalance(
            row,
            row.opening_balance
          )}
        />

        <InfoCard
          label={t.closing}
          value={formatBalance(
            row,
            row.closing_balance
          )}
          valueClass={
            toNumber(row.closing_balance) < 0
              ? "text-rose-700"
              : "text-slate-950"
          }
        />

        <InfoCard
          label={t.debit}
          value={formatValue(
            row,
            row.total_debit
          )}
          valueClass="text-emerald-700"
        />

        <InfoCard
          label={t.credit}
          value={formatValue(
            row,
            row.total_credit
          )}
          valueClass="text-rose-700"
        />

      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
            {t.transactions}
          </p>

          <p className="ledger-money mt-0.5 text-sm font-black text-slate-900">
            {toNumber(
              row.transaction_count
            ).toLocaleString("en-PK")}
          </p>
        </div>

        <Link
          to={
            row.detail_path ||
            "/app/dashboard"
          }
          className="ledger-no-print inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-extrabold text-white transition hover:bg-indigo-700"
        >
          <i className="bi bi-eye" />
          {t.viewDetails}
        </Link>

      </div>
    </article>
  );
}

function InfoCard({
  label,
  value,
  valueClass = "text-slate-950",
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3">

      <p className="break-words text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`ledger-money mt-1.5 break-words text-xs font-black sm:text-sm ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

function TableHead({
  children,
  align = "left",
  className = "",
}) {
  return (
    <th
      className={`break-words px-3 py-3 text-[10px] font-black uppercase tracking-wide 2xl:text-xs ${className}`}
      style={{
        textAlign: align,
      }}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
  className = "",
}) {
  return (
    <td
      className={`min-w-0 px-3 py-3 align-middle ${className}`}
      style={{
        textAlign: align,
      }}
    >
      {children}
    </td>
  );
}

function LoadingState({ text }) {
  return (
    <div className="inline-flex items-center gap-3 text-sm font-bold text-slate-500">

      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />

      <span className="break-words">
        {text}
      </span>

    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-sm font-bold text-slate-500">

      <i className="bi bi-inbox mb-2 block text-3xl text-slate-300" />

      <span className="break-words">
        {text}
      </span>

    </div>
  );
}

export default AllLedgerSummaryPage;
