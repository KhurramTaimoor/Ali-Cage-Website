import React, { useEffect, useMemo, useState } from "react";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE = `${API_ROOT}/api`;

const LANG = {
  en: {
    title: "Customer Ledger",
    subtitle: "Customer wise sales invoices, sales returns and running balance",
    selectCustomer: "Select Customer",
    selectCustomerPlaceholder: "-- Select Customer --",
    refresh: "Refresh",
    loading: "Loading...",
    ledgerLoading: "Loading customer ledger...",
    noCustomer: "Please select a customer to view ledger.",
    noRecords: "No transactions found for this customer.",
    customer: "Customer",
    phone: "Phone",
    city: "City",
    openingBalance: "Opening Balance",
    totalInvoice: "Total Invoice",
    totalReturn: "Total Return",
    closingBalance: "Closing Balance",
    date: "Date",
    type: "Type",
    referenceNo: "Reference No",
    details: "Details",
    debit: "Debit",
    credit: "Credit",
    balance: "Balance",
    invoice: "Sales Invoice",
    return: "Sales Return",
    opening: "Opening Balance",
    toggleLang: "اردو",
    searchCustomer: "Search customer...",
    allTransactions: "All Transactions",
  },

  ur: {
    title: "کسٹمر لیجر",
    subtitle: "کسٹمر کے حساب سے سیلز انوائس، سیلز ریٹرن اور رننگ بیلنس",
    selectCustomer: "کسٹمر منتخب کریں",
    selectCustomerPlaceholder: "-- کسٹمر منتخب کریں --",
    refresh: "ری فریش",
    loading: "لوڈ ہو رہا ہے...",
    ledgerLoading: "کسٹمر لیجر لوڈ ہو رہا ہے...",
    noCustomer: "لیجر دیکھنے کے لیے کسٹمر منتخب کریں۔",
    noRecords: "اس کسٹمر کی کوئی ٹرانزیکشن نہیں ملی۔",
    customer: "کسٹمر",
    phone: "فون",
    city: "شہر",
    openingBalance: "اوپننگ بیلنس",
    totalInvoice: "کل انوائس",
    totalReturn: "کل ریٹرن",
    closingBalance: "کلوزنگ بیلنس",
    date: "تاریخ",
    type: "قسم",
    referenceNo: "ریفرنس نمبر",
    details: "تفصیل",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    balance: "بیلنس",
    invoice: "سیلز انوائس",
    return: "سیلز ریٹرن",
    opening: "اوپننگ بیلنس",
    toggleLang: "English",
    searchCustomer: "کسٹمر تلاش کریں...",
    allTransactions: "تمام ٹرانزیکشنز",
  },
};

function toNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value) {
  return Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const raw = String(dateValue).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = date.getFullYear();

  return `${dd}/${mm}/${yy}`;
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

function getCustomerId(customer) {
  return String(
    customer?.id ||
      customer?.customer_id ||
      customer?.value ||
      customer?.party_id ||
      ""
  );
}

function getCustomerName(customer) {
  return String(
    customer?.customer_name_en ||
      customer?.customer_name ||
      customer?.name ||
      customer?.name_en ||
      customer?.party_name ||
      "-"
  );
}

function normalizeCustomer(customer) {
  return {
    ...customer,
    id: getCustomerId(customer),
    customer_name: getCustomerName(customer),
    phone: customer.phone || customer.mobile || customer.contact_no || "",
    city: customer.city_en || customer.city || "",
    opening_balance: toNum(
      customer.opening_balance ??
        customer.openingBalance ??
        customer.balance ??
        customer.current_balance ??
        0
    ),
  };
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

function getCustomerIdFromRow(row) {
  return String(
    row.customer_id ||
      row.party_id ||
      row.buyer_id ||
      row.client_id ||
      row.account_id ||
      ""
  );
}

function getRefNo(row) {
  return String(
    row.reference_no ||
      row.invoice_no ||
      row.invoice_ref ||
      row.return_no ||
      row.return_ref ||
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

function normalizeSalesRecord(row) {
  const rawType = String(row.entry_type || row.type || "").toLowerCase();

  const isReturn =
    rawType === "return" ||
    rawType === "sales_return" ||
    rawType === "sale_return" ||
    row.return_no ||
    row.return_amount !== undefined;

  const type = isReturn ? "return" : "invoice";

  const amount =
    type === "return"
      ? Math.abs(
          toNum(
            row.return_amount ||
              row.net_total ||
              row.gross_amount ||
              row.total_amount ||
              row.grand_total ||
              row.amount
          )
        )
      : Math.abs(
          toNum(
            row.net_total ||
              row.grand_total ||
              row.invoice_total ||
              row.gross_amount ||
              row.total_amount ||
              row.amount
          )
        );

  return {
    id: row.id,
    entry_type: type,
    reference_no: getRefNo(row),
    person_name: getPersonName(row),
    customer_id: getCustomerIdFromRow(row),
    entry_date: String(getEntryDate(row)).slice(0, 10),
    invoice_amount: type === "invoice" ? amount : 0,
    return_amount: type === "return" ? amount : 0,
    net_total: type === "return" ? -amount : amount,
    raw: row,
  };
}

function sameCustomer(record, customer) {
  if (!customer) return false;

  const selectedId = String(customer.id || "");
  const recordCustomerId = String(record.customer_id || "");

  if (selectedId && recordCustomerId && selectedId === recordCustomerId) {
    return true;
  }

  const selectedName = String(customer.customer_name || "")
    .trim()
    .toLowerCase();

  const recordName = String(record.person_name || "")
    .trim()
    .toLowerCase();

  if (!selectedName || !recordName) return false;

  return (
    recordName === selectedName ||
    recordName.includes(selectedName) ||
    selectedName.includes(recordName)
  );
}

function formatBalanceWithSide(value) {
  const amount = toNum(value);

  if (amount > 0) return `${fmt(amount)} Dr`;
  if (amount < 0) return `${fmt(Math.abs(amount))} Cr`;

  return "0";
}

function formatDebit(value) {
  const amount = toNum(value);
  return amount > 0 ? `${fmt(amount)} Dr` : "-";
}

function formatCredit(value) {
  const amount = toNum(value);
  return amount > 0 ? `${fmt(amount)} Cr` : "-";
}

function balanceClass(value) {
  return toNum(value) < 0 ? "red" : "dark";
}

export default function CustomerSalesLedgerPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) => String(customer.id) === String(selectedCustomerId)
      ) || null,
    [customers, selectedCustomerId]
  );

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      [customer.customer_name, customer.phone, customer.city]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [customers, customerSearch]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);

      const data = await apiFetch("/customers");
      const list = normalizeList(data).map(normalizeCustomer);

      setCustomers(list);
    } catch (error) {
      console.error("Load customers failed:", error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadLedger = async (customer = selectedCustomer) => {
    if (!customer) return;

    try {
      setLedgerLoading(true);
      setSearched(true);

      const params = new URLSearchParams();

      if (customer.id) params.append("customer_id", customer.id);
      if (customer.customer_name) params.append("search", customer.customer_name);

      let list = [];

      try {
        const data = await apiFetch(
          `/sales-report${params.toString() ? `?${params.toString()}` : ""}`
        );

        list = normalizeList(data).map(normalizeSalesRecord);
      } catch {
        list = [];
      }

      if (!list.length && customer.customer_name) {
        const fallbackParams = new URLSearchParams();
        fallbackParams.append("search", customer.customer_name);

        const data = await apiFetch(`/sales-report?${fallbackParams.toString()}`);
        list = normalizeList(data).map(normalizeSalesRecord);
      }

      const customerRecords = list
        .filter((record) => sameCustomer(record, customer))
        .filter(
          (record) =>
            record.entry_type === "invoice" || record.entry_type === "return"
        )
        .sort((a, b) => {
          return (
            String(a.entry_date || "").localeCompare(String(b.entry_date || "")) ||
            Number(a.id || 0) - Number(b.id || 0)
          );
        });

      setRecords(customerRecords);
    } catch (error) {
      console.error("Load customer ledger failed:", error);
      setRecords([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomerId(customerId);
    setRecords([]);
    setSearched(false);

    const customer = customers.find(
      (item) => String(item.id) === String(customerId)
    );

    if (customer) {
      loadLedger(customer);
    }
  };

  const ledgerRows = useMemo(() => {
    if (!selectedCustomer) return [];

    const rows = [];
    let balance = toNum(selectedCustomer.opening_balance);

    const openingDebit = balance > 0 ? balance : 0;
    const openingCredit = balance < 0 ? Math.abs(balance) : 0;

    rows.push({
      id: "opening",
      entry_type: "opening",
      date: "",
      reference_no: "-",
      details: t.opening,
      debit: openingDebit,
      credit: openingCredit,
      balance,
    });

    records.forEach((record) => {
      const debit = toNum(record.invoice_amount);
      const credit = toNum(record.return_amount);

      balance += debit - credit;

      rows.push({
        id: `${record.entry_type}-${record.id}-${record.reference_no}`,
        entry_type: record.entry_type,
        date: record.entry_date,
        reference_no: record.reference_no,
        details: record.entry_type === "invoice" ? t.invoice : t.return,
        debit,
        credit,
        balance,
      });
    });

    return rows;
  }, [records, selectedCustomer, t.opening, t.invoice, t.return]);

  const summary = useMemo(() => {
    const totalInvoice = records.reduce(
      (sum, record) => sum + toNum(record.invoice_amount),
      0
    );

    const totalReturn = records.reduce(
      (sum, record) => sum + toNum(record.return_amount),
      0
    );

    const closingBalance =
      ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balance : 0;

    return {
      totalInvoice,
      totalReturn,
      closingBalance,
    };
  }, [records, ledgerRows]);

  return (
    <div className="customer-ledger-page" dir={dir}>
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
        * {
          box-sizing: border-box;
        }

        .customer-ledger-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #f1f5f9 100%);
          padding: 18px;
          color: #0f172a;
          font-family: ${
            isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"
          };
        }

        .page-wrap {
          max-width: 1240px;
          margin: 0 auto;
        }

        .top-card {
          background: rgba(255,255,255,.94);
          border: 1px solid #dbe3ee;
          border-radius: 22px;
          padding: 20px 22px;
          box-shadow: 0 18px 50px rgba(15,23,42,.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .title {
          margin: 0;
          font-size: 30px;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .btn {
          border: 1px solid #cbd5e1;
          background: white;
          color: #0f172a;
          border-radius: 12px;
          padding: 10px 15px;
          font-weight: 900;
          cursor: pointer;
          transition: .15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
        }

        .btn:hover {
          transform: translateY(-1px);
          background: #f8fafc;
        }

        .btn:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          box-shadow: 0 12px 25px rgba(79,70,229,.25);
        }

        .btn-dark {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .filter-card,
        .table-card,
        .summary-card {
          background: white;
          border: 1px solid #dbe3ee;
          box-shadow: 0 8px 24px rgba(15,23,42,.05);
        }

        .filter-card {
          border-radius: 18px;
          padding: 15px;
          margin-bottom: 14px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 1.3fr 1.7fr auto;
          gap: 10px;
          align-items: end;
        }

        label {
          display: block;
          font-size: 11px;
          color: #475569;
          font-weight: 900;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .input {
          width: 100%;
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 0 12px;
          outline: none;
          background: white;
          color: #0f172a;
          font-size: 13px;
          font-weight: 750;
        }

        .input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,.10);
        }

        .customer-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .info-box {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 8px 22px rgba(15,23,42,.04);
        }

        .info-box small {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .info-box b {
          display: block;
          color: #0f172a;
          font-size: 15px;
          font-weight: 950;
          word-break: break-word;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .summary-card {
          border-radius: 16px;
          padding: 15px;
        }

        .summary-card small {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .summary-card b {
          display: block;
          font-family: monospace;
          font-size: 24px;
          font-weight: 950;
        }

        .table-card {
          border-radius: 18px;
          overflow: hidden;
        }

        .table-head {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .record-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 950;
        }

        .count-pill {
          background: #e2e8f0;
          color: #334155;
          border-radius: 999px;
          padding: 3px 9px;
          font-size: 12px;
          font-family: monospace;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .desktop-table {
          display: block;
        }

        .mobile-list {
          display: none;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 980px;
        }

        th {
          background: #0f172a;
          color: white;
          padding: 12px 10px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .45px;
          text-align: ${isUrdu ? "right" : "left"};
          white-space: nowrap;
        }

        td {
          padding: 12px 10px;
          border-bottom: 1px solid #eef2f7;
          color: #334155;
          font-size: 13px;
          vertical-align: middle;
        }

        tr:hover td {
          background: #f8fafc;
        }

        .center {
          text-align: center;
        }

        .num {
          text-align: right;
          font-family: monospace;
          font-weight: 900;
          white-space: nowrap;
        }

        .green {
          color: #16a34a;
        }

        .red {
          color: #dc2626;
        }

        .dark {
          color: #0f172a;
        }

        .muted {
          color: #94a3b8;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 900;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #334155;
          white-space: nowrap;
        }

        .tag-invoice {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .tag-return {
          background: #fff1f2;
          color: #be123c;
          border-color: #fecdd3;
        }

        .tag-opening {
          background: #eef2ff;
          color: #3730a3;
          border-color: #c7d2fe;
        }

        .empty-state {
          padding: 44px 15px;
          text-align: center;
          color: #94a3b8;
          font-weight: 800;
        }

        .ledger-card-list {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .ledger-card {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 24px rgba(15,23,42,.06);
        }

        .ledger-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .ledger-card-date {
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
          font-weight: 900;
        }

        .ledger-card-ref {
          margin-top: 3px;
          font-size: 15px;
          color: #0f172a;
          font-family: monospace;
          font-weight: 950;
        }

        .ledger-mobile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .ledger-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          border-radius: 13px;
          padding: 9px 10px;
        }

        .ledger-line small {
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
        }

        .ledger-line b {
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          text-align: right;
          font-family: monospace;
        }

        @media(max-width: 960px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr;
          }

          .customer-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width: 640px) {
          .customer-ledger-page {
            padding: 12px;
          }

          .top-card {
            align-items: stretch;
          }

          .top-card .btn {
            width: 100%;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .customer-info-grid {
            grid-template-columns: 1fr;
          }

          .title {
            font-size: 24px;
          }

          .desktop-table {
            display: none;
          }

          .mobile-list {
            display: block;
          }
        }
      `}</style>

      <div className="page-wrap">
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          <button
            className="btn"
            onClick={() => setLang(isUrdu ? "en" : "ur")}
          >
            <i className="bi bi-translate"></i>
            {t.toggleLang}
          </button>
        </div>

        <div className="filter-card">
          <div className="filter-grid">
            <div>
              <label>{t.searchCustomer}</label>
              <input
                className="input"
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder={t.searchCustomer}
              />
            </div>

            <div>
              <label>{t.selectCustomer}</label>
              <select
                className="input"
                value={selectedCustomerId}
                onChange={(event) => handleCustomerChange(event.target.value)}
                disabled={loadingCustomers}
              >
                <option value="">
                  {loadingCustomers ? t.loading : t.selectCustomerPlaceholder}
                </option>

                {filteredCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              disabled={!selectedCustomer || ledgerLoading}
              onClick={() => loadLedger()}
            >
              <i
                className={`bi ${
                  ledgerLoading ? "bi-hourglass-split" : "bi-arrow-clockwise"
                }`}
              ></i>
              {ledgerLoading ? t.ledgerLoading : t.refresh}
            </button>
          </div>
        </div>

        {!selectedCustomer ? (
          <div className="table-card">
            <div className="empty-state">{t.noCustomer}</div>
          </div>
        ) : (
          <>
            <div className="customer-info-grid">
              <InfoBox label={t.customer} value={selectedCustomer.customer_name} />
              <InfoBox label={t.phone} value={selectedCustomer.phone || "-"} />
              <InfoBox label={t.city} value={selectedCustomer.city || "-"} />
              <InfoBox
                label={t.openingBalance}
                value={formatBalanceWithSide(selectedCustomer.opening_balance)}
                color={balanceClass(selectedCustomer.opening_balance)}
              />
            </div>

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
                <small>{t.closingBalance}</small>
                <b className={balanceClass(summary.closingBalance)}>
                  {formatBalanceWithSide(summary.closingBalance)}
                </b>
              </div>
            </div>

            <div className="table-card">
              <div className="table-head">
                <div className="record-title">
                  <i className="bi bi-journal-text"></i>
                  {t.allTransactions}
                  <span className="count-pill">{records.length}</span>
                </div>

                {ledgerLoading && (
                  <span className="muted" style={{ fontWeight: 800 }}>
                    {t.ledgerLoading}
                  </span>
                )}
              </div>

              <div className="desktop-table table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="center" style={{ width: 55 }}>
                        #
                      </th>
                      <th>{t.date}</th>
                      <th>{t.type}</th>
                      <th>{t.referenceNo}</th>
                      <th>{t.details}</th>
                      <th className="num">{t.debit}</th>
                      <th className="num">{t.credit}</th>
                      <th className="num">{t.balance}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {searched && !ledgerLoading && records.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="center muted"
                          style={{ padding: 42 }}
                        >
                          {t.noRecords}
                        </td>
                      </tr>
                    ) : (
                      ledgerRows.map((row, index) => (
                        <tr key={row.id}>
                          <td
                            className="center muted"
                            style={{ fontFamily: "monospace" }}
                          >
                            {index + 1}
                          </td>

                          <td className="center">{formatDate(row.date)}</td>

                          <td>
                            <span
                              className={`tag ${
                                row.entry_type === "invoice"
                                  ? "tag-invoice"
                                  : row.entry_type === "return"
                                  ? "tag-return"
                                  : "tag-opening"
                              }`}
                            >
                              {row.entry_type === "invoice"
                                ? t.invoice
                                : row.entry_type === "return"
                                ? t.return
                                : t.opening}
                            </span>
                          </td>

                          <td>
                            <b style={{ fontFamily: "monospace" }}>
                              {row.reference_no || "-"}
                            </b>
                          </td>

                          <td>
                            <b>{row.details}</b>
                          </td>

                          <td className="num dark">{formatDebit(row.debit)}</td>

                          <td className="num red">{formatCredit(row.credit)}</td>

                          <td className={`num ${balanceClass(row.balance)}`}>
                            {formatBalanceWithSide(row.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mobile-list">
                {searched && !ledgerLoading && records.length === 0 ? (
                  <div className="empty-state">{t.noRecords}</div>
                ) : (
                  <div className="ledger-card-list">
                    {ledgerRows.map((row, index) => (
                      <div className="ledger-card" key={row.id}>
                        <div className="ledger-card-top">
                          <div>
                            <div className="ledger-card-date">
                              {formatDate(row.date)}
                            </div>

                            <div className="ledger-card-ref">
                              {row.reference_no || "-"}
                            </div>

                            <div className="muted" style={{ fontSize: 11 }}>
                              #{index + 1}
                            </div>
                          </div>

                          <span
                            className={`tag ${
                              row.entry_type === "invoice"
                                ? "tag-invoice"
                                : row.entry_type === "return"
                                ? "tag-return"
                                : "tag-opening"
                            }`}
                          >
                            {row.entry_type === "invoice"
                              ? t.invoice
                              : row.entry_type === "return"
                              ? t.return
                              : t.opening}
                          </span>
                        </div>

                        <div className="ledger-mobile-grid">
                          <div className="ledger-line">
                            <small>{t.details}</small>
                            <b>{row.details}</b>
                          </div>

                          <div className="ledger-line">
                            <small>{t.debit}</small>
                            <b>{formatDebit(row.debit)}</b>
                          </div>

                          <div className="ledger-line">
                            <small>{t.credit}</small>
                            <b className="red">{formatCredit(row.credit)}</b>
                          </div>

                          <div className="ledger-line">
                            <small>{t.balance}</small>
                            <b className={balanceClass(row.balance)}>
                              {formatBalanceWithSide(row.balance)}
                            </b>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, color = "dark" }) {
  return (
    <div className="info-box">
      <small>{label}</small>
      <b className={color}>{value}</b>
    </div>
  );
}
