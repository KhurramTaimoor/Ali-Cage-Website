import React, { useEffect, useMemo, useState } from "react";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

const TEXT = {
  en: {
    title: "Customer Detail Ledger",
    subtitle:
      "Complete customer statement with invoice products, sales returns, shipping details and running balance.",
    language: "اردو",
    customerSearch: "Search customer by name, phone or city...",
    selectCustomer: "Select Customer",
    chooseCustomer: "-- Choose Customer --",
    fromDate: "From Date",
    toDate: "To Date",
    apply: "Apply Filters",
    reset: "Reset",
    refresh: "Refresh",
    print: "Print Ledger",
    all: "All Transactions",
    invoices: "Invoices",
    returns: "Returns",
    manual: "Payments / Adjustments",
    loadingCustomers: "Loading customers...",
    loadingLedger: "Loading detailed customer ledger...",
    selectMessage: "Select a customer to view the complete ledger.",
    noTransactions: "No transactions were found for the selected filters.",
    customer: "Customer",
    phone: "Phone",
    city: "City",
    openingBalance: "Opening Balance",
    totalInvoices: "Total Invoices",
    totalReturns: "Total Returns",
    closingBalance: "Closing Balance",
    soldQty: "Products Sold",
    returnedQty: "Products Returned",
    transactionCount: "Transactions",
    date: "Date",
    type: "Type",
    reference: "Reference",
    description: "Description",
    quantity: "Qty",
    debit: "Debit",
    credit: "Credit",
    balance: "Balance",
    action: "Action",
    details: "View Details",
    opening: "Opening Balance",
    invoice: "Sales Invoice",
    return: "Sales Return",
    ledgerEntry: "Payment / Adjustment",
    transactionDetails: "Transaction Details",
    close: "Close",
    invoiceInformation: "Invoice Information",
    returnInformation: "Return Information",
    shippingInformation: "Shipping Information",
    shipTo: "Ship To",
    address: "Address",
    status: "Status",
    linkedInvoice: "Linked Invoice",
    returnMode: "Return Mode",
    reason: "Reason",
    previousBalance: "Previous Balance",
    invoiceTotal: "Invoice Total",
    deliveryCharges: "Delivery Charges",
    discount: "Discount",
    grandTotal: "Grand Total",
    productDetails: "Product Details",
    sr: "#",
    product: "Product",
    category: "Category",
    unit: "Unit",
    saleType: "Sale Type",
    cartons: "Cartons",
    pieces: "Pieces",
    rate: "Rate",
    amount: "Amount",
    sold: "Sold Qty",
    alreadyReturned: "Already Returned",
    returned: "Return Qty",
    empty: "-",
    errorTitle: "Unable to load ledger",
    filtered: "Filtered",
  },
  ur: {
    title: "کسٹمر تفصیلی لیجر",
    subtitle:
      "انوائس پروڈکٹس، سیلز ریٹرن، شپنگ تفصیل اور رننگ بیلنس کے ساتھ مکمل کسٹمر اسٹیٹمنٹ۔",
    language: "English",
    customerSearch: "نام، فون یا شہر سے کسٹمر تلاش کریں...",
    selectCustomer: "کسٹمر منتخب کریں",
    chooseCustomer: "-- کسٹمر منتخب کریں --",
    fromDate: "شروع تاریخ",
    toDate: "آخری تاریخ",
    apply: "فلٹر لگائیں",
    reset: "ری سیٹ",
    refresh: "ری فریش",
    print: "لیجر پرنٹ کریں",
    all: "تمام ٹرانزیکشنز",
    invoices: "انوائسز",
    returns: "ریٹرنز",
    manual: "ادائیگی / ایڈجسٹمنٹ",
    loadingCustomers: "کسٹمر لوڈ ہو رہے ہیں...",
    loadingLedger: "تفصیلی کسٹمر لیجر لوڈ ہو رہا ہے...",
    selectMessage: "مکمل لیجر دیکھنے کے لیے کسٹمر منتخب کریں۔",
    noTransactions: "منتخب فلٹرز میں کوئی ٹرانزیکشن نہیں ملی۔",
    customer: "کسٹمر",
    phone: "فون",
    city: "شہر",
    openingBalance: "اوپننگ بیلنس",
    totalInvoices: "کل انوائسز",
    totalReturns: "کل ریٹرنز",
    closingBalance: "کلوزنگ بیلنس",
    soldQty: "فروخت شدہ پروڈکٹس",
    returnedQty: "واپس شدہ پروڈکٹس",
    transactionCount: "ٹرانزیکشنز",
    date: "تاریخ",
    type: "قسم",
    reference: "ریفرنس",
    description: "تفصیل",
    quantity: "مقدار",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    balance: "بیلنس",
    action: "ایکشن",
    details: "تفصیل دیکھیں",
    opening: "اوپننگ بیلنس",
    invoice: "سیلز انوائس",
    return: "سیلز ریٹرن",
    ledgerEntry: "ادائیگی / ایڈجسٹمنٹ",
    transactionDetails: "ٹرانزیکشن کی تفصیل",
    close: "بند کریں",
    invoiceInformation: "انوائس کی معلومات",
    returnInformation: "ریٹرن کی معلومات",
    shippingInformation: "شپنگ کی معلومات",
    shipTo: "شپ کس کو کیا",
    address: "پتہ",
    status: "اسٹیٹس",
    linkedInvoice: "متعلقہ انوائس",
    returnMode: "ریٹرن موڈ",
    reason: "وجہ",
    previousBalance: "پچھلا بیلنس",
    invoiceTotal: "انوائس ٹوٹل",
    deliveryCharges: "ڈیلیوری چارجز",
    discount: "ڈسکاؤنٹ",
    grandTotal: "گرینڈ ٹوٹل",
    productDetails: "پروڈکٹس کی تفصیل",
    sr: "#",
    product: "پروڈکٹ",
    category: "کیٹیگری",
    unit: "یونٹ",
    saleType: "سیل ٹائپ",
    cartons: "کارٹن",
    pieces: "پیسز",
    rate: "ریٹ",
    amount: "رقم",
    sold: "فروخت مقدار",
    alreadyReturned: "پہلے واپس",
    returned: "واپس مقدار",
    empty: "-",
    errorTitle: "لیجر لوڈ نہیں ہو سکا",
    filtered: "فلٹر شدہ",
  },
};

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value) {
  return `Rs ${toNumber(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatBalance(value) {
  const amount = toNumber(value);
  if (amount > 0) return `${formatMoney(amount)} Dr`;
  if (amount < 0) return `${formatMoney(Math.abs(amount))} Cr`;
  return "Rs 0";
}

function formatDate(value) {
  if (!value) return "-";
  const raw = String(value).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return raw;
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.customers)) return payload.customers;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Request failed.");
  }
  return payload;
}

function normalizeCustomer(customer) {
  return {
    ...customer,
    id: String(customer.id || customer.customer_id || ""),
    customer_name: String(
      customer.customer_name_en || customer.customer_name || customer.name || "-"
    ),
    phone: String(customer.phone || customer.mobile || ""),
    city: String(customer.city_en || customer.city || ""),
    opening_balance: toNumber(customer.opening_balance),
  };
}

function transactionTypeLabel(type, t) {
  if (type === "invoice") return t.invoice;
  if (type === "return") return t.return;
  if (type === "manual") return t.ledgerEntry;
  return t.opening;
}

function transactionTypeClass(type) {
  if (type === "invoice") return "ledger-type ledger-type-invoice";
  if (type === "return") return "ledger-type ledger-type-return";
  if (type === "manual") return "ledger-type ledger-type-manual";
  return "ledger-type ledger-type-opening";
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export default function CustomerSalesLedgerPage() {
  const [language, setLanguage] = useState("en");
  const t = TEXT[language];
  const isUrdu = language === "ur";

  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) => String(customer.id) === String(selectedCustomerId)
      ) || null,
    [customers, selectedCustomerId]
  );

  const transactions = useMemo(
    () => (Array.isArray(ledgerData?.transactions) ? ledgerData.transactions : []),
    [ledgerData]
  );

  const visibleTransactions = useMemo(() => {
    if (typeFilter === "all") return transactions;
    return transactions.filter((transaction) => transaction.type === typeFilter);
  }, [transactions, typeFilter]);

  const summary = ledgerData?.summary || {};
  const customer = ledgerData?.customer || selectedCustomer;

  async function loadCustomers() {
    try {
      setLoadingCustomers(true);
      const response = await apiFetch("/customers");
      const list = normalizeList(response).map(normalizeCustomer);
      list.sort((a, b) => a.customer_name.localeCompare(b.customer_name));
      setCustomers(list);
    } catch (loadError) {
      console.error("Load customers failed:", loadError);
      setError(loadError.message || "Customers could not be loaded.");
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadLedger(
    customerId = selectedCustomerId,
    dateFilters = { from: fromDate, to: toDate }
  ) {
    if (!customerId) {
      setLedgerData(null);
      return;
    }

    try {
      setLoadingLedger(true);
      setError("");
      setSelectedTransaction(null);

      const params = new URLSearchParams();
      if (dateFilters.from) params.set("from_date", dateFilters.from);
      if (dateFilters.to) params.set("to_date", dateFilters.to);

      const response = await apiFetch(
        `/ledger/customer/${customerId}/details${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );
      setLedgerData(response.data || null);
    } catch (loadError) {
      console.error("Load detailed customer ledger failed:", loadError);
      setError(loadError.message || "Detailed customer ledger could not be loaded.");
      setLedgerData(null);
    } finally {
      setLoadingLedger(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleCustomerChange(event) {
    const customerId = event.target.value;
    setSelectedCustomerId(customerId);
    setTypeFilter("all");
    setLedgerData(null);
    setError("");
    if (customerId) loadLedger(customerId);
  }

  function resetFilters() {
    setFromDate("");
    setToDate("");
    setTypeFilter("all");
    if (selectedCustomerId) {
      loadLedger(selectedCustomerId, { from: "", to: "" });
    }
  }

  function printLedger() {
    window.print();
  }

  return (
    <div
      className={`customer-detail-ledger ${isUrdu ? "ledger-rtl" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <style>{ledgerStyles}</style>

      <section className="ledger-page-header">
        <div>
          <div className="ledger-eyebrow">ALI CAGE ERP</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="ledger-header-actions no-print">
          <button
            type="button"
            className="ledger-button ledger-button-light"
            onClick={() => setLanguage(isUrdu ? "en" : "ur")}
          >
            {t.language}
          </button>
          <button
            type="button"
            className="ledger-button ledger-button-light"
            onClick={() => loadLedger()}
            disabled={!selectedCustomerId || loadingLedger}
          >
            {t.refresh}
          </button>
          <button
            type="button"
            className="ledger-button ledger-button-primary"
            onClick={printLedger}
            disabled={!ledgerData}
          >
            {t.print}
          </button>
        </div>
      </section>

      <section className="ledger-filter-panel no-print">
        <div className="ledger-field ledger-customer-search">
          <label>{t.customerSearch}</label>
          <input
            type="search"
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            placeholder={t.customerSearch}
          />
        </div>

        <div className="ledger-field ledger-customer-select">
          <label>{t.selectCustomer}</label>
          <select
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            disabled={loadingCustomers}
          >
            <option value="">
              {loadingCustomers ? t.loadingCustomers : t.chooseCustomer}
            </option>
            {filteredCustomers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.customer_name}
                {item.phone ? ` — ${item.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="ledger-field">
          <label>{t.fromDate}</label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </div>

        <div className="ledger-field">
          <label>{t.toDate}</label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </div>

        <div className="ledger-filter-buttons">
          <button
            type="button"
            className="ledger-button ledger-button-primary"
            onClick={() => loadLedger()}
            disabled={!selectedCustomerId || loadingLedger}
          >
            {t.apply}
          </button>
          <button
            type="button"
            className="ledger-button ledger-button-light"
            onClick={resetFilters}
            disabled={!selectedCustomerId || loadingLedger}
          >
            {t.reset}
          </button>
        </div>
      </section>

      {error && (
        <section className="ledger-error-box">
          <strong>{t.errorTitle}</strong>
          <span>{error}</span>
        </section>
      )}

      {!selectedCustomerId && !loadingCustomers ? (
        <section className="ledger-empty-state">
          <div className="ledger-empty-icon">≡</div>
          <h2>{t.title}</h2>
          <p>{t.selectMessage}</p>
        </section>
      ) : loadingLedger ? (
        <section className="ledger-loading-state">
          <div className="ledger-spinner" />
          <p>{t.loadingLedger}</p>
        </section>
      ) : ledgerData ? (
        <>
          <section className="ledger-customer-card">
            <div className="ledger-customer-avatar">
              {String(customer?.customer_name || "C").charAt(0).toUpperCase()}
            </div>
            <div className="ledger-customer-main">
              <span className="ledger-muted-label">{t.customer}</span>
              <h2>{customer?.customer_name || "-"}</h2>
            </div>
            <InfoItem label={t.phone} value={customer?.phone || "-"} />
            <InfoItem label={t.city} value={customer?.city || "-"} />
            <InfoItem
              label={t.transactionCount}
              value={formatNumber(summary.transaction_count)}
            />
          </section>

          <section className="ledger-summary-grid">
            <SummaryCard
              label={t.openingBalance}
              value={formatBalance(summary.opening_balance)}
              tone="neutral"
            />
            <SummaryCard
              label={t.totalInvoices}
              value={formatMoney(summary.total_invoice)}
              tone="debit"
              meta={`${formatNumber(summary.invoice_count)} ${t.invoices}`}
            />
            <SummaryCard
              label={t.totalReturns}
              value={formatMoney(summary.total_return)}
              tone="credit"
              meta={`${formatNumber(summary.return_count)} ${t.returns}`}
            />
            <SummaryCard
              label={t.closingBalance}
              value={formatBalance(summary.closing_balance)}
              tone={toNumber(summary.closing_balance) < 0 ? "credit" : "strong"}
            />
            <SummaryCard
              label={t.soldQty}
              value={formatNumber(summary.products_sold_qty)}
              tone="neutral"
            />
            <SummaryCard
              label={t.returnedQty}
              value={formatNumber(summary.products_returned_qty)}
              tone="neutral"
            />
          </section>

          <section className="ledger-type-filters no-print">
            <FilterButton
              active={typeFilter === "all"}
              onClick={() => setTypeFilter("all")}
              label={t.all}
              count={transactions.length}
            />
            <FilterButton
              active={typeFilter === "invoice"}
              onClick={() => setTypeFilter("invoice")}
              label={t.invoices}
              count={summary.invoice_count}
            />
            <FilterButton
              active={typeFilter === "return"}
              onClick={() => setTypeFilter("return")}
              label={t.returns}
              count={summary.return_count}
            />
            <FilterButton
              active={typeFilter === "manual"}
              onClick={() => setTypeFilter("manual")}
              label={t.manual}
              count={transactions.filter((item) => item.type === "manual").length}
            />
          </section>

          <section className="ledger-table-card">
            <div className="ledger-table-heading">
              <div>
                <h3>{t.all}</h3>
                <p>
                  {t.filtered}: {visibleTransactions.length}
                </p>
              </div>
              {(fromDate || toDate) && (
                <div className="ledger-date-chip">
                  {formatDate(fromDate) || "-"} — {formatDate(toDate) || "-"}
                </div>
              )}
            </div>

            {visibleTransactions.length === 0 ? (
              <div className="ledger-no-records">{t.noTransactions}</div>
            ) : (
              <>
                <div className="ledger-desktop-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t.date}</th>
                        <th>{t.type}</th>
                        <th>{t.reference}</th>
                        <th>{t.description}</th>
                        <th className="ledger-number-cell">{t.quantity}</th>
                        <th className="ledger-number-cell">{t.debit}</th>
                        <th className="ledger-number-cell">{t.credit}</th>
                        <th className="ledger-number-cell">{t.balance}</th>
                        <th className="no-print">{t.action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTransactions.map((transaction, index) => (
                        <tr key={transaction.id}>
                          <td>{index + 1}</td>
                          <td>{formatDate(transaction.date)}</td>
                          <td>
                            <span className={transactionTypeClass(transaction.type)}>
                              {transactionTypeLabel(transaction.type, t)}
                            </span>
                          </td>
                          <td>
                            <strong>{transaction.reference_no || "-"}</strong>
                            {transaction.linked_invoice_no &&
                              transaction.type === "return" && (
                                <small className="ledger-linked-ref">
                                  {t.linkedInvoice}: {transaction.linked_invoice_no}
                                </small>
                              )}
                          </td>
                          <td className="ledger-description-cell">
                            {transaction.description || "-"}
                            {transaction.type === "invoice" && transaction.shipment_to && (
                              <small>
                                {t.shipTo}: {transaction.shipment_to}
                              </small>
                            )}
                            {transaction.type === "return" && transaction.reason && (
                              <small>
                                {t.reason}: {transaction.reason}
                              </small>
                            )}
                          </td>
                          <td className="ledger-number-cell">
                            {transaction.quantity
                              ? formatNumber(transaction.quantity)
                              : "-"}
                          </td>
                          <td className="ledger-number-cell ledger-debit-text">
                            {toNumber(transaction.debit) > 0
                              ? formatMoney(transaction.debit)
                              : "-"}
                          </td>
                          <td className="ledger-number-cell ledger-credit-text">
                            {toNumber(transaction.credit) > 0
                              ? formatMoney(transaction.credit)
                              : "-"}
                          </td>
                          <td
                            className={`ledger-number-cell ledger-balance-text ${
                              toNumber(transaction.balance) < 0
                                ? "ledger-negative-balance"
                                : ""
                            }`}
                          >
                            {formatBalance(transaction.balance)}
                          </td>
                          <td className="no-print">
                            {transaction.type === "opening" ? (
                              "-"
                            ) : (
                              <button
                                type="button"
                                className="ledger-detail-button"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                {t.details}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ledger-mobile-list">
                  {visibleTransactions.map((transaction, index) => (
                    <article className="ledger-mobile-transaction" key={transaction.id}>
                      <div className="ledger-mobile-topline">
                        <div>
                          <span className={transactionTypeClass(transaction.type)}>
                            {transactionTypeLabel(transaction.type, t)}
                          </span>
                          <strong>{transaction.reference_no || "-"}</strong>
                        </div>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      <p>{transaction.description || "-"}</p>
                      <div className="ledger-mobile-values">
                        <MobileValue
                          label={t.debit}
                          value={
                            toNumber(transaction.debit) > 0
                              ? formatMoney(transaction.debit)
                              : "-"
                          }
                        />
                        <MobileValue
                          label={t.credit}
                          value={
                            toNumber(transaction.credit) > 0
                              ? formatMoney(transaction.credit)
                              : "-"
                          }
                        />
                        <MobileValue
                          label={t.balance}
                          value={formatBalance(transaction.balance)}
                        />
                      </div>
                      {transaction.type !== "opening" && (
                        <button
                          type="button"
                          className="ledger-detail-button ledger-mobile-detail-button no-print"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          {t.details}
                        </button>
                      )}
                      <span className="ledger-mobile-index">#{index + 1}</span>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      ) : null}

      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          customer={customer}
          t={t}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="ledger-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryCard({ label, value, meta, tone = "neutral" }) {
  return (
    <article className={`ledger-summary-card ledger-summary-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {meta && <small>{meta}</small>}
    </article>
  );
}

function FilterButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      className={`ledger-filter-pill ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <b>{toNumber(count)}</b>
    </button>
  );
}

function MobileValue({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TransactionModal({ transaction, customer, t, onClose }) {
  const isInvoice = transaction.type === "invoice";
  const isReturn = transaction.type === "return";
  const items = Array.isArray(transaction.items) ? transaction.items : [];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="ledger-modal-backdrop no-print" onMouseDown={onClose}>
      <section
        className="ledger-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t.transactionDetails}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ledger-modal-header">
          <div>
            <span className={transactionTypeClass(transaction.type)}>
              {transactionTypeLabel(transaction.type, t)}
            </span>
            <h2>{transaction.reference_no || t.transactionDetails}</h2>
            <p>
              {formatDate(transaction.date)} · {customer?.customer_name || "-"}
            </p>
          </div>
          <button
            type="button"
            className="ledger-modal-close"
            onClick={onClose}
            aria-label={t.close}
          >
            ×
          </button>
        </header>

        <div className="ledger-modal-body">
          <section className="ledger-modal-section">
            <h3>{isInvoice ? t.invoiceInformation : isReturn ? t.returnInformation : t.transactionDetails}</h3>
            <div className="ledger-detail-grid">
              <DetailItem label={t.customer} value={customer?.customer_name || "-"} />
              <DetailItem label={t.date} value={formatDate(transaction.date)} />
              <DetailItem label={t.reference} value={transaction.reference_no || "-"} />
              {isReturn && (
                <DetailItem
                  label={t.linkedInvoice}
                  value={transaction.linked_invoice_no || "-"}
                />
              )}
              {hasValue(transaction.status) && (
                <DetailItem label={t.status} value={transaction.status} />
              )}
              {isReturn && hasValue(transaction.return_mode) && (
                <DetailItem label={t.returnMode} value={transaction.return_mode} />
              )}
              {isReturn && hasValue(transaction.reason) && (
                <DetailItem label={t.reason} value={transaction.reason} wide />
              )}
              {!isInvoice && !isReturn && (
                <DetailItem
                  label={t.description}
                  value={transaction.description || "-"}
                  wide
                />
              )}
            </div>
          </section>

          {(hasValue(transaction.shipment_to) || hasValue(transaction.address)) && (
            <section className="ledger-modal-section">
              <h3>{t.shippingInformation}</h3>
              <div className="ledger-detail-grid">
                <DetailItem
                  label={t.shipTo}
                  value={transaction.shipment_to || "-"}
                />
                <DetailItem
                  label={t.address}
                  value={transaction.address || "-"}
                  wide
                />
              </div>
            </section>
          )}

          {items.length > 0 && (
            <section className="ledger-modal-section">
              <h3>
                {t.productDetails} <span>({items.length})</span>
              </h3>
              <div className="ledger-product-table-wrap">
                <table className="ledger-product-table">
                  <thead>
                    <tr>
                      <th>{t.sr}</th>
                      <th>{t.product}</th>
                      <th>{t.category}</th>
                      <th>{t.unit}</th>
                      {isInvoice ? (
                        <>
                          <th>{t.saleType}</th>
                          <th className="ledger-number-cell">{t.cartons}</th>
                          <th className="ledger-number-cell">{t.pieces}</th>
                          <th className="ledger-number-cell">{t.quantity}</th>
                        </>
                      ) : (
                        <>
                          <th className="ledger-number-cell">{t.sold}</th>
                          <th className="ledger-number-cell">{t.alreadyReturned}</th>
                          <th className="ledger-number-cell">{t.returned}</th>
                        </>
                      )}
                      <th className="ledger-number-cell">{t.rate}</th>
                      <th className="ledger-number-cell">{t.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id || `${transaction.id}-${index}`}>
                        <td>{item.sr || index + 1}</td>
                        <td>
                          <strong>{item.product_name || "Product"}</strong>
                          {item.description && <small>{item.description}</small>}
                        </td>
                        <td>{item.category_name || "-"}</td>
                        <td>{item.unit_name || "-"}</td>
                        {isInvoice ? (
                          <>
                            <td>{item.sale_type || "-"}</td>
                            <td className="ledger-number-cell">
                              {formatNumber(item.carton_qty)}
                            </td>
                            <td className="ledger-number-cell">
                              {formatNumber(item.pieces_qty)}
                            </td>
                            <td className="ledger-number-cell">
                              {formatNumber(item.qty ?? item.quantity)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="ledger-number-cell">
                              {formatNumber(item.sold_qty)}
                            </td>
                            <td className="ledger-number-cell">
                              {formatNumber(item.already_returned_qty)}
                            </td>
                            <td className="ledger-number-cell">
                              {formatNumber(item.return_qty)}
                            </td>
                          </>
                        )}
                        <td className="ledger-number-cell">{formatMoney(item.rate)}</td>
                        <td className="ledger-number-cell">
                          <strong>{formatMoney(item.amount)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="ledger-modal-section ledger-amount-section">
            <div className="ledger-amount-summary">
              {isInvoice && (
                <>
                  <AmountRow
                    label={t.previousBalance}
                    value={formatMoney(transaction.previous_balance)}
                  />
                  <AmountRow
                    label={t.invoiceTotal}
                    value={formatMoney(transaction.invoice_total)}
                  />
                  <AmountRow
                    label={t.deliveryCharges}
                    value={formatMoney(transaction.delivery_charges)}
                  />
                  <AmountRow
                    label={t.discount}
                    value={`- ${formatMoney(transaction.discount)}`}
                  />
                  <AmountRow
                    label={t.grandTotal}
                    value={formatMoney(transaction.grand_total)}
                    strong
                  />
                </>
              )}
              <AmountRow
                label={t.debit}
                value={formatMoney(transaction.debit)}
                tone="debit"
              />
              <AmountRow
                label={t.credit}
                value={formatMoney(transaction.credit)}
                tone="credit"
              />
              <AmountRow
                label={t.balance}
                value={formatBalance(transaction.balance)}
                strong
              />
            </div>
          </section>
        </div>

        <footer className="ledger-modal-footer">
          <button
            type="button"
            className="ledger-button ledger-button-primary"
            onClick={onClose}
          >
            {t.close}
          </button>
        </footer>
      </section>
    </div>
  );
}

function DetailItem({ label, value, wide = false }) {
  return (
    <div className={`ledger-detail-item ${wide ? "ledger-detail-wide" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AmountRow({ label, value, strong = false, tone = "" }) {
  return (
    <div
      className={`ledger-amount-row ${strong ? "ledger-amount-strong" : ""} ${
        tone ? `ledger-amount-${tone}` : ""
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const ledgerStyles = `
  .customer-detail-ledger {
    --ledger-ink: #111827;
    --ledger-muted: #64748b;
    --ledger-border: #e2e8f0;
    --ledger-surface: #ffffff;
    --ledger-soft: #f8fafc;
    --ledger-primary: #0f172a;
    --ledger-primary-hover: #1e293b;
    --ledger-debit: #b91c1c;
    --ledger-credit: #047857;
    min-height: 100%;
    padding: 24px;
    background: #f4f6f8;
    color: var(--ledger-ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .customer-detail-ledger * {
    box-sizing: border-box;
  }

  .ledger-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  .ledger-eyebrow {
    margin-bottom: 6px;
    color: #475569;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.16em;
  }

  .ledger-page-header h1 {
    margin: 0;
    font-size: clamp(26px, 3vw, 38px);
    line-height: 1.15;
    letter-spacing: -0.03em;
  }

  .ledger-page-header p {
    max-width: 760px;
    margin: 9px 0 0;
    color: var(--ledger-muted);
    font-size: 14px;
    line-height: 1.65;
  }

  .ledger-header-actions,
  .ledger-filter-buttons {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  .ledger-button {
    min-height: 40px;
    padding: 9px 15px;
    border: 1px solid transparent;
    border-radius: 10px;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
    transition: 0.18s ease;
  }

  .ledger-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .ledger-button-primary {
    background: var(--ledger-primary);
    color: #fff;
  }

  .ledger-button-primary:hover:not(:disabled) {
    background: var(--ledger-primary-hover);
    transform: translateY(-1px);
  }

  .ledger-button-light {
    border-color: var(--ledger-border);
    background: #fff;
    color: #334155;
  }

  .ledger-button-light:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .ledger-filter-panel {
    display: grid;
    grid-template-columns: minmax(210px, 1.1fr) minmax(260px, 1.3fr) 155px 155px auto;
    gap: 12px;
    align-items: end;
    padding: 16px;
    border: 1px solid var(--ledger-border);
    border-radius: 16px;
    background: var(--ledger-surface);
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
  }

  .ledger-field {
    min-width: 0;
  }

  .ledger-field label {
    display: block;
    margin-bottom: 6px;
    color: #475569;
    font-size: 12px;
    font-weight: 750;
  }

  .ledger-field input,
  .ledger-field select {
    width: 100%;
    height: 42px;
    padding: 0 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    outline: none;
    background: #fff;
    color: var(--ledger-ink);
    font: inherit;
    font-size: 13px;
  }

  .ledger-field input:focus,
  .ledger-field select:focus {
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.12);
  }

  .ledger-error-box {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding: 13px 15px;
    border: 1px solid #fecaca;
    border-radius: 12px;
    background: #fef2f2;
    color: #991b1b;
    font-size: 13px;
  }

  .ledger-error-box strong {
    white-space: nowrap;
  }

  .ledger-empty-state,
  .ledger-loading-state {
    display: grid;
    place-items: center;
    min-height: 350px;
    margin-top: 18px;
    padding: 40px;
    border: 1px dashed #cbd5e1;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.72);
    text-align: center;
  }

  .ledger-empty-state h2 {
    margin: 12px 0 5px;
  }

  .ledger-empty-state p,
  .ledger-loading-state p {
    margin: 0;
    color: var(--ledger-muted);
  }

  .ledger-empty-icon {
    display: grid;
    place-items: center;
    width: 62px;
    height: 62px;
    border-radius: 18px;
    background: #e2e8f0;
    color: #334155;
    font-size: 30px;
    font-weight: 900;
  }

  .ledger-spinner {
    width: 36px;
    height: 36px;
    margin-bottom: 14px;
    border: 3px solid #e2e8f0;
    border-top-color: #0f172a;
    border-radius: 50%;
    animation: ledger-spin 0.8s linear infinite;
  }

  @keyframes ledger-spin {
    to { transform: rotate(360deg); }
  }

  .ledger-customer-card {
    display: grid;
    grid-template-columns: auto minmax(200px, 1.3fr) repeat(3, minmax(130px, 0.7fr));
    gap: 18px;
    align-items: center;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--ledger-border);
    border-radius: 16px;
    background: #fff;
  }

  .ledger-customer-avatar {
    display: grid;
    place-items: center;
    width: 50px;
    height: 50px;
    border-radius: 14px;
    background: #0f172a;
    color: #fff;
    font-size: 20px;
    font-weight: 850;
  }

  .ledger-customer-main h2 {
    margin: 3px 0 0;
    font-size: 20px;
  }

  .ledger-muted-label,
  .ledger-info-item span {
    color: var(--ledger-muted);
    font-size: 11px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ledger-info-item {
    min-width: 0;
    padding-left: 18px;
    border-left: 1px solid var(--ledger-border);
  }

  .ledger-rtl .ledger-info-item {
    padding-right: 18px;
    padding-left: 0;
    border-right: 1px solid var(--ledger-border);
    border-left: 0;
  }

  .ledger-info-item strong {
    display: block;
    overflow: hidden;
    margin-top: 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }

  .ledger-summary-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .ledger-summary-card {
    min-height: 118px;
    padding: 16px;
    border: 1px solid var(--ledger-border);
    border-radius: 15px;
    background: #fff;
  }

  .ledger-summary-card span {
    display: block;
    color: var(--ledger-muted);
    font-size: 12px;
    font-weight: 700;
  }

  .ledger-summary-card strong {
    display: block;
    margin-top: 13px;
    font-size: 19px;
    line-height: 1.25;
  }

  .ledger-summary-card small {
    display: block;
    margin-top: 7px;
    color: #64748b;
    font-size: 11px;
  }

  .ledger-summary-debit {
    border-top: 3px solid #dc2626;
  }

  .ledger-summary-debit strong,
  .ledger-debit-text {
    color: var(--ledger-debit);
  }

  .ledger-summary-credit {
    border-top: 3px solid #059669;
  }

  .ledger-summary-credit strong,
  .ledger-credit-text {
    color: var(--ledger-credit);
  }

  .ledger-summary-strong {
    border-top: 3px solid #0f172a;
    background: #f8fafc;
  }

  .ledger-type-filters {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    margin-top: 18px;
    padding-bottom: 2px;
  }

  .ledger-filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 38px;
    padding: 7px 11px 7px 14px;
    border: 1px solid var(--ledger-border);
    border-radius: 999px;
    background: #fff;
    color: #475569;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
    cursor: pointer;
  }

  .ledger-filter-pill b {
    display: grid;
    place-items: center;
    min-width: 23px;
    height: 23px;
    padding: 0 6px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #334155;
    font-size: 11px;
  }

  .ledger-filter-pill.active {
    border-color: #0f172a;
    background: #0f172a;
    color: #fff;
  }

  .ledger-filter-pill.active b {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
  }

  .ledger-table-card {
    margin-top: 12px;
    overflow: hidden;
    border: 1px solid var(--ledger-border);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.035);
  }

  .ledger-table-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 17px 18px;
    border-bottom: 1px solid var(--ledger-border);
  }

  .ledger-table-heading h3 {
    margin: 0;
    font-size: 16px;
  }

  .ledger-table-heading p {
    margin: 4px 0 0;
    color: var(--ledger-muted);
    font-size: 12px;
  }

  .ledger-date-chip {
    padding: 7px 10px;
    border-radius: 9px;
    background: #f1f5f9;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
  }

  .ledger-desktop-table {
    overflow-x: auto;
  }

  .ledger-desktop-table table,
  .ledger-product-table {
    width: 100%;
    border-collapse: collapse;
  }

  .ledger-desktop-table th,
  .ledger-product-table th {
    padding: 11px 12px;
    border-bottom: 1px solid var(--ledger-border);
    background: #f8fafc;
    color: #475569;
    font-size: 10px;
    font-weight: 850;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.055em;
    white-space: nowrap;
  }

  .ledger-rtl .ledger-desktop-table th,
  .ledger-rtl .ledger-product-table th {
    text-align: right;
  }

  .ledger-desktop-table td,
  .ledger-product-table td {
    padding: 12px;
    border-bottom: 1px solid #edf2f7;
    color: #334155;
    font-size: 12px;
    vertical-align: top;
  }

  .ledger-desktop-table tbody tr:hover {
    background: #fbfdff;
  }

  .ledger-desktop-table tbody tr:last-child td,
  .ledger-product-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .ledger-description-cell {
    min-width: 210px;
    max-width: 340px;
  }

  .ledger-description-cell small,
  .ledger-linked-ref,
  .ledger-product-table td small {
    display: block;
    margin-top: 4px;
    color: var(--ledger-muted);
    font-size: 10px;
    line-height: 1.45;
  }

  .ledger-number-cell {
    text-align: right !important;
    white-space: nowrap;
  }

  .ledger-balance-text {
    color: #0f172a;
    font-weight: 800;
  }

  .ledger-negative-balance {
    color: var(--ledger-credit);
  }

  .ledger-type {
    display: inline-flex;
    align-items: center;
    min-height: 23px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
  }

  .ledger-type-invoice {
    background: #fee2e2;
    color: #991b1b;
  }

  .ledger-type-return {
    background: #d1fae5;
    color: #065f46;
  }

  .ledger-type-manual {
    background: #e0e7ff;
    color: #3730a3;
  }

  .ledger-type-opening {
    background: #e2e8f0;
    color: #334155;
  }

  .ledger-detail-button {
    min-height: 30px;
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
    color: #334155;
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
  }

  .ledger-detail-button:hover {
    border-color: #0f172a;
    color: #0f172a;
  }

  .ledger-no-records {
    padding: 50px 20px;
    color: var(--ledger-muted);
    text-align: center;
    font-size: 13px;
  }

  .ledger-mobile-list {
    display: none;
  }

  .ledger-modal-backdrop {
    position: fixed;
    z-index: 9999;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(15, 23, 42, 0.66);
    backdrop-filter: blur(5px);
  }

  .ledger-modal {
    display: flex;
    flex-direction: column;
    width: min(1180px, 96vw);
    max-height: 92vh;
    overflow: hidden;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 30px 80px rgba(2, 6, 23, 0.35);
  }

  .ledger-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 22px;
    border-bottom: 1px solid var(--ledger-border);
  }

  .ledger-modal-header h2 {
    margin: 8px 0 3px;
    font-size: 23px;
  }

  .ledger-modal-header p {
    margin: 0;
    color: var(--ledger-muted);
    font-size: 12px;
  }

  .ledger-modal-close {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    border: 1px solid var(--ledger-border);
    border-radius: 10px;
    background: #fff;
    color: #475569;
    font-size: 24px;
    cursor: pointer;
  }

  .ledger-modal-body {
    overflow: auto;
    padding: 20px 22px;
    background: #f8fafc;
  }

  .ledger-modal-section {
    margin-bottom: 14px;
    padding: 17px;
    border: 1px solid var(--ledger-border);
    border-radius: 14px;
    background: #fff;
  }

  .ledger-modal-section:last-child {
    margin-bottom: 0;
  }

  .ledger-modal-section h3 {
    margin: 0 0 13px;
    color: #334155;
    font-size: 13px;
  }

  .ledger-modal-section h3 span {
    color: var(--ledger-muted);
    font-weight: 600;
  }

  .ledger-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .ledger-detail-item {
    min-height: 70px;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fafafa;
  }

  .ledger-detail-wide {
    grid-column: span 2;
  }

  .ledger-detail-item span {
    display: block;
    color: var(--ledger-muted);
    font-size: 10px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ledger-detail-item strong {
    display: block;
    margin-top: 6px;
    color: #1e293b;
    font-size: 13px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .ledger-product-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--ledger-border);
    border-radius: 11px;
  }

  .ledger-product-table {
    min-width: 920px;
  }

  .ledger-product-table td strong {
    color: #1e293b;
  }

  .ledger-amount-section {
    display: flex;
    justify-content: flex-end;
  }

  .ledger-amount-summary {
    width: min(420px, 100%);
  }

  .ledger-amount-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 9px 0;
    border-bottom: 1px solid #e5e7eb;
    color: #475569;
    font-size: 12px;
  }

  .ledger-amount-row:last-child {
    border-bottom: 0;
  }

  .ledger-amount-row strong {
    color: #0f172a;
    white-space: nowrap;
  }

  .ledger-amount-strong {
    margin-top: 4px;
    padding-top: 13px;
    font-size: 14px;
  }

  .ledger-amount-debit strong {
    color: var(--ledger-debit);
  }

  .ledger-amount-credit strong {
    color: var(--ledger-credit);
  }

  .ledger-modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 14px 22px;
    border-top: 1px solid var(--ledger-border);
    background: #fff;
  }

  @media (max-width: 1280px) {
    .ledger-filter-panel {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .ledger-customer-search,
    .ledger-customer-select {
      grid-column: span 2;
    }

    .ledger-filter-buttons {
      grid-column: span 2;
    }

    .ledger-summary-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .customer-detail-ledger {
      padding: 16px;
    }

    .ledger-page-header {
      flex-direction: column;
    }

    .ledger-header-actions {
      width: 100%;
    }

    .ledger-filter-panel {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ledger-customer-search,
    .ledger-customer-select,
    .ledger-filter-buttons {
      grid-column: span 2;
    }

    .ledger-customer-card {
      grid-template-columns: auto 1fr;
    }

    .ledger-info-item {
      padding: 12px 0 0;
      border-top: 1px solid var(--ledger-border);
      border-left: 0;
    }

    .ledger-rtl .ledger-info-item {
      padding: 12px 0 0;
      border-top: 1px solid var(--ledger-border);
      border-right: 0;
    }

    .ledger-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ledger-desktop-table {
      display: none;
    }

    .ledger-mobile-list {
      display: grid;
      gap: 10px;
      padding: 12px;
    }

    .ledger-mobile-transaction {
      position: relative;
      padding: 14px;
      border: 1px solid var(--ledger-border);
      border-radius: 13px;
      background: #fff;
    }

    .ledger-mobile-topline {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      color: var(--ledger-muted);
      font-size: 11px;
    }

    .ledger-mobile-topline > div {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ledger-mobile-topline strong {
      color: #1e293b;
    }

    .ledger-mobile-transaction > p {
      margin: 12px 0;
      color: #475569;
      font-size: 12px;
      line-height: 1.55;
    }

    .ledger-mobile-values {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .ledger-mobile-values > div {
      padding: 9px;
      border-radius: 9px;
      background: #f8fafc;
    }

    .ledger-mobile-values span {
      display: block;
      color: var(--ledger-muted);
      font-size: 9px;
      font-weight: 750;
      text-transform: uppercase;
    }

    .ledger-mobile-values strong {
      display: block;
      margin-top: 4px;
      color: #1e293b;
      font-size: 10px;
      overflow-wrap: anywhere;
    }

    .ledger-mobile-detail-button {
      width: 100%;
      margin-top: 10px;
    }

    .ledger-mobile-index {
      position: absolute;
      right: 12px;
      bottom: 12px;
      color: #cbd5e1;
      font-size: 10px;
      font-weight: 800;
    }

    .ledger-rtl .ledger-mobile-index {
      right: auto;
      left: 12px;
    }

    .ledger-detail-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .customer-detail-ledger {
      padding: 12px;
    }

    .ledger-page-header h1 {
      font-size: 25px;
    }

    .ledger-header-actions .ledger-button {
      flex: 1 1 auto;
    }

    .ledger-filter-panel {
      grid-template-columns: 1fr;
    }

    .ledger-customer-search,
    .ledger-customer-select,
    .ledger-filter-buttons {
      grid-column: auto;
    }

    .ledger-filter-buttons .ledger-button {
      flex: 1 1 0;
    }

    .ledger-customer-card {
      gap: 13px;
      padding: 14px;
    }

    .ledger-customer-main h2 {
      font-size: 17px;
    }

    .ledger-info-item {
      grid-column: span 2;
    }

    .ledger-summary-grid {
      grid-template-columns: 1fr;
    }

    .ledger-summary-card {
      min-height: 96px;
    }

    .ledger-table-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .ledger-mobile-values {
      grid-template-columns: 1fr;
    }

    .ledger-modal-backdrop {
      align-items: end;
      padding: 0;
    }

    .ledger-modal {
      width: 100%;
      max-height: 94vh;
      border-radius: 18px 18px 0 0;
    }

    .ledger-modal-header,
    .ledger-modal-body,
    .ledger-modal-footer {
      padding-right: 15px;
      padding-left: 15px;
    }

    .ledger-detail-grid {
      grid-template-columns: 1fr;
    }

    .ledger-detail-wide {
      grid-column: auto;
    }
  }

  @media print {
    body {
      background: #fff !important;
    }

    .customer-detail-ledger {
      padding: 0;
      background: #fff;
      color: #000;
    }

    .no-print,
    .ledger-mobile-list,
    .ledger-error-box,
    .ledger-empty-state,
    .ledger-loading-state {
      display: none !important;
    }

    .ledger-page-header {
      margin-bottom: 12px;
    }

    .ledger-page-header p {
      color: #444;
    }

    .ledger-customer-card,
    .ledger-summary-card,
    .ledger-table-card {
      box-shadow: none;
      break-inside: avoid;
    }

    .ledger-summary-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .ledger-desktop-table {
      display: block !important;
      overflow: visible;
    }

    .ledger-desktop-table table {
      font-size: 9px;
    }

    .ledger-desktop-table th,
    .ledger-desktop-table td {
      padding: 6px;
    }

    .ledger-table-card {
      overflow: visible;
    }
  }
`;
