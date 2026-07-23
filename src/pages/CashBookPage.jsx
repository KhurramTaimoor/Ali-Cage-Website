import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
)
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");

const API = `${API_ORIGIN}/api/cash-book`;

const ACCOUNT_TYPES = [
  { value: "customer", label: "Customer", urdu: "کسٹمر" },
  {
    value: "general_ledger",
    label: "General Ledger",
    urdu: "جنرل لیجر",
  },
  { value: "supplier", label: "Supplier", urdu: "سپلائر" },
  { value: "employee", label: "Employee", urdu: "ملازم" },
];

const TEXT = {
  en: {
    title: "Cash Book",
    subtitle:
      "Create multi-account cash receive and payment vouchers",
    urdu: "اردو",
    addAccount: "Add Account",
    newVoucher: "New Voucher",
    saveVoucher: "Save Voucher",
    updateVoucher: "Update Voucher",
    invoiceNo: "Invoice No",
    date: "Date",
    accountType: "Account Type",
    account: "Account",
    description: "Description",
    receive: "Receive",
    paid: "Paid",
    select: "Select",
    enter: "Enter",
    grandTotal: "Grand Total",
    totalReceive: "Total Receive",
    totalPaid: "Total Paid",
    addRow: "Add Row",
    savedVouchers: "Saved Cash Book Vouchers",
    search: "Search voucher, account or description...",
    actions: "Actions",
    edit: "Edit",
    print: "Print",
    delete: "Delete",
    noRecords: "No vouchers found.",
    accountModalTitle: "Add General Ledger Account",
    accountCode: "Account Code",
    accountTitle: "Account Title",
    group: "Account Group",
    openingBalance: "Opening Balance",
    autoCode: "Leave blank for automatic code",
    optional: "Optional",
    cancel: "Cancel",
    saveAccount: "Save Account",
    loading: "Loading...",
    notes: "Voucher Notes",
  },
  ur: {
    title: "کیش بک",
    subtitle:
      "متعدد اکاؤنٹس کے لیے کیش وصولی اور ادائیگی واؤچر بنائیں",
    urdu: "English",
    addAccount: "اکاؤنٹ شامل کریں",
    newVoucher: "نیا واؤچر",
    saveVoucher: "واؤچر محفوظ کریں",
    updateVoucher: "واؤچر اپڈیٹ کریں",
    invoiceNo: "انوائس نمبر",
    date: "تاریخ",
    accountType: "اکاؤنٹ کی قسم",
    account: "اکاؤنٹ",
    description: "تفصیل",
    receive: "وصولی",
    paid: "ادائیگی",
    select: "منتخب کریں",
    enter: "درج کریں",
    grandTotal: "مجموعی رقم",
    totalReceive: "کل وصولی",
    totalPaid: "کل ادائیگی",
    addRow: "قطار شامل کریں",
    savedVouchers: "محفوظ شدہ کیش بک واؤچرز",
    search: "واؤچر، اکاؤنٹ یا تفصیل تلاش کریں...",
    actions: "اقدامات",
    edit: "ترمیم",
    print: "پرنٹ",
    delete: "حذف",
    noRecords: "کوئی واؤچر نہیں ملا۔",
    accountModalTitle: "جنرل لیجر اکاؤنٹ شامل کریں",
    accountCode: "اکاؤنٹ کوڈ",
    accountTitle: "اکاؤنٹ ٹائٹل",
    group: "اکاؤنٹ گروپ",
    openingBalance: "ابتدائی بیلنس",
    autoCode: "خالی چھوڑیں تو کوڈ خود بنے گا",
    optional: "اختیاری",
    cancel: "منسوخ",
    saveAccount: "اکاؤنٹ محفوظ کریں",
    loading: "لوڈ ہو رہا ہے...",
    notes: "واؤچر نوٹس",
  },
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const makeRow = () => ({
  local_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  account_type: "customer",
  account_id: "",
  description: "",
  receive: "",
  paid: "",
});

const initialRows = (count = 6) =>
  Array.from({ length: count }, () => makeRow());

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const money = (value) =>
  numberValue(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const normalizeArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong.";

export default function CashBookPage() {
  const [lang, setLang] = useState("en");
  const t = TEXT[lang];
  const isUrdu = lang === "ur";

  const [voucher, setVoucher] = useState({
    voucher_no: "",
    voucher_date: today(),
    notes: "",
  });

  const [rows, setRows] = useState(initialRows());
  const [lookups, setLookups] = useState({
    customer: [],
    general_ledger: [],
    supplier: [],
    employee: [],
    groups: [],
  });

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountTargetRow, setAccountTargetRow] = useState(null);
  const [accountForm, setAccountForm] = useState({
    account_code: "",
    account_title: "",
    group_id: "",
    opening_balance: "",
  });

  const showNotice = (type, text) => {
    setNotice({ type, text });
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(
      () => setNotice({ type: "", text: "" }),
      3500
    );
  };

  const fetchLookups = async () => {
    const response = await axios.get(`${API}/lookups`);
    const data = response.data?.data || response.data || {};

    setLookups({
      customer: normalizeArray(data.customers, "customers"),
      general_ledger: normalizeArray(
        data.general_ledgers,
        "general_ledgers"
      ),
      supplier: normalizeArray(data.suppliers, "suppliers"),
      employee: normalizeArray(data.employees, "employees"),
      groups: normalizeArray(data.groups, "groups"),
    });
  };

  const fetchNextNumber = async () => {
    const response = await axios.get(`${API}/next-number`);
    const nextNo =
      response.data?.voucher_no ||
      response.data?.data?.voucher_no ||
      "";

    setVoucher((current) => ({
      ...current,
      voucher_no: nextNo,
    }));
  };

  const fetchRecords = async () => {
    const response = await axios.get(`${API}/vouchers`);
    setRecords(
      normalizeArray(response.data, "vouchers")
    );
  };

  const loadPage = async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchLookups(),
        fetchNextNumber(),
        fetchRecords(),
      ]);
    } catch (error) {
      showNotice("error", errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const accountOptions = (type) =>
    lookups[type] || [];

  const accountLabel = (account) =>
    account?.display_name ||
    account?.account_title ||
    account?.customer_name_en ||
    account?.supplier_name ||
    account?.full_name ||
    account?.name ||
    "-";

  const updateRow = (rowId, field, value) => {
    setRows((current) =>
      current.map((row) => {
        if (row.local_id !== rowId) return row;

        const updated = {
          ...row,
          [field]: value,
        };

        if (field === "account_type") {
          updated.account_id = "";
        }

        if (field === "account_id" && !row.description.trim()) {
          const selected = accountOptions(row.account_type).find(
            (account) => String(account.id) === String(value)
          );

          if (selected) {
            updated.description = accountLabel(selected);
          }
        }

        if (field === "receive" && numberValue(value) > 0) {
          updated.paid = "";
        }

        if (field === "paid" && numberValue(value) > 0) {
          updated.receive = "";
        }

        return updated;
      })
    );
  };

  const addRow = () => {
    setRows((current) => [...current, makeRow()]);
  };

  const removeRow = (rowId) => {
    setRows((current) => {
      const next = current.filter(
        (row) => row.local_id !== rowId
      );

      return next.length ? next : [makeRow()];
    });
  };

  const totals = useMemo(
    () => ({
      receive: rows.reduce(
        (sum, row) => sum + numberValue(row.receive),
        0
      ),
      paid: rows.reduce(
        (sum, row) => sum + numberValue(row.paid),
        0
      ),
    }),
    [rows]
  );

  const cleanItems = () =>
    rows
      .map((row) => ({
        account_type: row.account_type,
        account_id: row.account_id,
        description: row.description.trim(),
        receive: numberValue(row.receive),
        paid: numberValue(row.paid),
      }))
      .filter(
        (row) =>
          row.account_id ||
          row.description ||
          row.receive > 0 ||
          row.paid > 0
      );

  const resetVoucher = async () => {
    setEditingId(null);
    setRows(initialRows());
    setVoucher({
      voucher_no: "",
      voucher_date: today(),
      notes: "",
    });

    try {
      await fetchNextNumber();
    } catch (error) {
      showNotice("error", errorMessage(error));
    }
  };

  const validateVoucher = () => {
    if (!voucher.voucher_no.trim()) {
      return "Invoice number is required.";
    }

    if (!voucher.voucher_date) {
      return "Date is required.";
    }

    const items = cleanItems();

    if (!items.length) {
      return "At least one valid account row is required.";
    }

    for (const [index, item] of items.entries()) {
      if (!item.account_type || !item.account_id) {
        return `Select account type and account in row ${index + 1}.`;
      }

      if (item.receive <= 0 && item.paid <= 0) {
        return `Enter Receive or Paid amount in row ${index + 1}.`;
      }

      if (item.receive > 0 && item.paid > 0) {
        return `Receive and Paid cannot both be entered in row ${
          index + 1
        }.`;
      }
    }

    return "";
  };

  const saveVoucher = async () => {
    const validation = validateVoucher();

    if (validation) {
      showNotice("error", validation);
      return;
    }

    setSaving(true);

    const payload = {
      ...voucher,
      items: cleanItems(),
    };

    try {
      if (editingId) {
        await axios.put(
          `${API}/vouchers/${editingId}`,
          payload
        );

        showNotice(
          "success",
          "Cash Book voucher updated successfully."
        );
      } else {
        await axios.post(`${API}/vouchers`, payload);

        showNotice(
          "success",
          "Cash Book voucher saved successfully."
        );
      }

      await Promise.all([
        fetchRecords(),
        resetVoucher(),
      ]);
    } catch (error) {
      showNotice("error", errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const editVoucher = async (id) => {
    try {
      const response = await axios.get(
        `${API}/vouchers/${id}`
      );

      const record =
        response.data?.data ||
        response.data?.voucher ||
        response.data;

      setEditingId(record.id);

      setVoucher({
        voucher_no: record.voucher_no || "",
        voucher_date:
          String(record.voucher_date || "").slice(0, 10) ||
          today(),
        notes: record.notes || "",
      });

      const loadedRows = (record.items || []).map((item) => ({
        local_id: `${item.id}-${Math.random()
          .toString(16)
          .slice(2)}`,
        account_type: item.account_type || "customer",
        account_id: String(item.account_id || ""),
        description: item.description || "",
        receive:
          numberValue(item.receive) > 0
            ? String(item.receive)
            : "",
        paid:
          numberValue(item.paid) > 0
            ? String(item.paid)
            : "",
      }));

      setRows(
        loadedRows.length
          ? loadedRows
          : initialRows()
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      showNotice("error", errorMessage(error));
    }
  };

  const deleteVoucher = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this voucher?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API}/vouchers/${id}`);

      if (editingId === id) {
        await resetVoucher();
      }

      await fetchRecords();

      showNotice(
        "success",
        "Voucher deleted successfully."
      );
    } catch (error) {
      showNotice("error", errorMessage(error));
    }
  };

  const openAddAccount = (rowId = null) => {
    setAccountTargetRow(rowId);
    setAccountForm({
      account_code: "",
      account_title: "",
      group_id: "",
      opening_balance: "",
    });
    setShowAccountModal(true);
  };

  const saveAccount = async () => {
    if (!accountForm.account_title.trim()) {
      showNotice("error", "Account title is required.");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/accounts`,
        accountForm
      );

      const account =
        response.data?.data ||
        response.data?.account ||
        response.data;

      setLookups((current) => ({
        ...current,
        general_ledger: [
          account,
          ...current.general_ledger.filter(
            (item) =>
              String(item.id) !== String(account.id)
          ),
        ],
      }));

      if (accountTargetRow) {
        setRows((current) =>
          current.map((row) =>
            row.local_id === accountTargetRow
              ? {
                  ...row,
                  account_type: "general_ledger",
                  account_id: String(account.id),
                  description:
                    row.description ||
                    accountLabel(account),
                }
              : row
          )
        );
      }

      setShowAccountModal(false);
      setAccountTargetRow(null);

      showNotice(
        "success",
        "Account added and dropdown refreshed."
      );
    } catch (error) {
      showNotice("error", errorMessage(error));
    }
  };

  const printVoucher = async (recordOrId) => {
    try {
      let record = recordOrId;

      if (typeof recordOrId !== "object") {
        const response = await axios.get(
          `${API}/vouchers/${recordOrId}`
        );

        record =
          response.data?.data ||
          response.data?.voucher ||
          response.data;
      }

      const rowsHtml = (record.items || [])
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.account_type_label || item.account_type}</td>
              <td>${item.account_name || "-"}</td>
              <td>${item.description || "-"}</td>
              <td>${numberValue(item.receive) > 0 ? money(item.receive) : "-"}</td>
              <td>${numberValue(item.paid) > 0 ? money(item.paid) : "-"}</td>
            </tr>
          `
        )
        .join("");

      const popup = window.open("", "_blank");

      popup.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>${record.voucher_no}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 28px;
                color: #172033;
              }
              h1 { text-align: center; margin-bottom: 6px; }
              .meta {
                display: flex;
                justify-content: space-between;
                margin: 24px 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #d5dae3;
                padding: 10px;
                text-align: left;
              }
              th {
                background: #111827;
                color: white;
              }
              .totals {
                margin-top: 18px;
                display: flex;
                justify-content: flex-end;
                gap: 30px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>Cash Book Voucher</h1>
            <div class="meta">
              <strong>Invoice No: ${record.voucher_no}</strong>
              <strong>Date: ${String(record.voucher_date || "").slice(0, 10)}</strong>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Account Type</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Receive</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <div class="totals">
              <span>Total Receive: Rs ${money(record.total_receive)}</span>
              <span>Total Paid: Rs ${money(record.total_paid)}</span>
            </div>
          </body>
        </html>
      `);

      popup.document.close();
      popup.focus();
      popup.print();
    } catch (error) {
      showNotice("error", errorMessage(error));
    }
  };

  const filteredRecords = records.filter((record) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      record.voucher_no,
      record.voucher_date,
      record.notes,
      record.account_names,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="cash-voucher-page"
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {notice.text && (
        <div
          className={`cash-toast cash-toast-${notice.type}`}
        >
          {notice.text}
        </div>
      )}

      <section className="cash-page-header">
        <div>
          <span className="cash-eyebrow">
            ALI CAGE ERP · ACCOUNTS
          </span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="cash-header-actions">
          <button
            type="button"
            className="cash-btn cash-btn-light"
            onClick={() =>
              setLang((current) =>
                current === "en" ? "ur" : "en"
              )
            }
          >
            ◉ {t.urdu}
          </button>

          <button
            type="button"
            className="cash-btn cash-btn-account"
            onClick={() => openAddAccount()}
          >
            ＋ {t.addAccount}
          </button>

          <button
            type="button"
            className="cash-btn cash-btn-light"
            onClick={resetVoucher}
          >
            ↻ {t.newVoucher}
          </button>

          <button
            type="button"
            className="cash-btn cash-btn-primary"
            onClick={saveVoucher}
            disabled={saving}
          >
            {saving
              ? t.loading
              : editingId
              ? t.updateVoucher
              : t.saveVoucher}
          </button>
        </div>
      </section>

      <section className="cash-entry-card">
        <div className="cash-card-topbar">
          <button
            type="button"
            className="cash-close-button"
            onClick={resetVoucher}
            title="Clear voucher"
          >
            ×
          </button>

          <div className="cash-book-pill">
            {t.title}
          </div>

          <button
            type="button"
            className="cash-inline-account-button"
            onClick={() => openAddAccount()}
          >
            ＋ {t.addAccount}
          </button>
        </div>

        <div className="cash-meta-grid">
          <label>
            <span>{t.invoiceNo}</span>
            <input
              value={voucher.voucher_no}
              onChange={(event) =>
                setVoucher((current) => ({
                  ...current,
                  voucher_no: event.target.value,
                }))
              }
            />
          </label>

          <label>
            <span>{t.date}</span>
            <input
              type="date"
              value={voucher.voucher_date}
              onChange={(event) =>
                setVoucher((current) => ({
                  ...current,
                  voucher_date: event.target.value,
                }))
              }
            />
          </label>

          <label className="cash-notes-field">
            <span>{t.notes}</span>
            <input
              value={voucher.notes}
              placeholder={t.optional}
              onChange={(event) =>
                setVoucher((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="cash-entry-table-wrap">
          <table className="cash-entry-table">
            <thead>
              <tr>
                <th className="cash-add-column">
                  <button
                    type="button"
                    onClick={addRow}
                    title={t.addRow}
                  >
                    ＋
                  </button>
                </th>
                <th>{t.accountType}</th>
                <th>{t.account}</th>
                <th>{t.description}</th>
                <th>{t.receive}</th>
                <th>{t.paid}</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.local_id}>
                  <td className="cash-delete-column">
                    <button
                      type="button"
                      onClick={() =>
                        removeRow(row.local_id)
                      }
                      title="Delete row"
                    >
                      ▣
                    </button>
                  </td>

                  <td>
                    <select
                      value={row.account_type}
                      onChange={(event) =>
                        updateRow(
                          row.local_id,
                          "account_type",
                          event.target.value
                        )
                      }
                    >
                      {ACCOUNT_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {isUrdu
                            ? type.urdu
                            : type.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <div className="cash-account-cell">
                      <select
                        value={row.account_id}
                        onChange={(event) =>
                          updateRow(
                            row.local_id,
                            "account_id",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          {t.select}
                        </option>

                        {accountOptions(
                          row.account_type
                        ).map((account) => (
                          <option
                            key={account.id}
                            value={account.id}
                          >
                            {accountLabel(account)}
                          </option>
                        ))}
                      </select>

                      {row.account_type ===
                        "general_ledger" && (
                        <button
                          type="button"
                          className="cash-mini-add"
                          onClick={() =>
                            openAddAccount(row.local_id)
                          }
                          title={t.addAccount}
                        >
                          ＋
                        </button>
                      )}
                    </div>
                  </td>

                  <td>
                    <input
                      value={row.description}
                      placeholder={t.enter}
                      onChange={(event) =>
                        updateRow(
                          row.local_id,
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      className="cash-money-input cash-receive-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.receive}
                      placeholder={t.enter}
                      onChange={(event) =>
                        updateRow(
                          row.local_id,
                          "receive",
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      className="cash-money-input cash-paid-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.paid}
                      placeholder={t.enter}
                      onChange={(event) =>
                        updateRow(
                          row.local_id,
                          "paid",
                          event.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cash-total-bar">
          <div className="cash-grand-total">
            <span>{t.grandTotal}</span>
            <strong>
              Rs {money(totals.receive - totals.paid)}
            </strong>
          </div>

          <div className="cash-total-box receive">
            <span>{t.totalReceive}</span>
            <strong>Rs {money(totals.receive)}</strong>
          </div>

          <div className="cash-total-box paid">
            <span>{t.totalPaid}</span>
            <strong>Rs {money(totals.paid)}</strong>
          </div>
        </div>
      </section>

      <section className="cash-records-card">
        <div className="cash-records-head">
          <div>
            <h2>{t.savedVouchers}</h2>
            <p>
              {records.length} voucher
              {records.length === 1 ? "" : "s"}
            </p>
          </div>

          <input
            value={search}
            placeholder={t.search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="cash-records-table-wrap">
          <table className="cash-records-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.invoiceNo}</th>
                <th>{t.date}</th>
                <th>{t.receive}</th>
                <th>{t.paid}</th>
                <th>Lines</th>
                <th>{t.actions}</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="cash-empty">
                    {t.loading}
                  </td>
                </tr>
              ) : filteredRecords.length ? (
                filteredRecords.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{record.voucher_no}</strong>
                    </td>
                    <td>
                      {String(
                        record.voucher_date || ""
                      ).slice(0, 10)}
                    </td>
                    <td className="cash-positive">
                      Rs {money(record.total_receive)}
                    </td>
                    <td className="cash-negative">
                      Rs {money(record.total_paid)}
                    </td>
                    <td>{record.items_count || 0}</td>
                    <td>
                      <div className="cash-record-actions">
                        <button
                          type="button"
                          onClick={() =>
                            editVoucher(record.id)
                          }
                        >
                          {t.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printVoucher(record.id)
                          }
                        >
                          {t.print}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            deleteVoucher(record.id)
                          }
                        >
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="cash-empty">
                    {t.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showAccountModal && (
        <div
          className="cash-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAccountModal(false);
            }
          }}
        >
          <div className="cash-account-modal">
            <div className="cash-modal-head">
              <div>
                <span>CHART OF ACCOUNTS</span>
                <h3>{t.accountModalTitle}</h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAccountModal(false)
                }
              >
                ×
              </button>
            </div>

            <div className="cash-account-form">
              <label>
                <span>{t.accountCode}</span>
                <input
                  value={accountForm.account_code}
                  placeholder={t.autoCode}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      account_code: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="cash-full-field">
                <span>{t.accountTitle} *</span>
                <input
                  value={accountForm.account_title}
                  placeholder="e.g. Office Expense"
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      account_title: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                <span>{t.group}</span>
                <select
                  value={accountForm.group_id}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      group_id: event.target.value,
                    }))
                  }
                >
                  <option value="">
                    {t.optional}
                  </option>

                  {lookups.groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                    >
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>{t.openingBalance}</span>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.opening_balance}
                  placeholder="0"
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      opening_balance:
                        event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="cash-modal-footer">
              <button
                type="button"
                className="cash-btn cash-btn-light"
                onClick={() =>
                  setShowAccountModal(false)
                }
              >
                {t.cancel}
              </button>

              <button
                type="button"
                className="cash-btn cash-btn-primary"
                onClick={saveAccount}
              >
                {t.saveAccount}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cash-voucher-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(
              circle at top right,
              rgba(53, 86, 255, 0.09),
              transparent 32%
            ),
            #f3f6fc;
          color: #152038;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .cash-voucher-page,
        .cash-voucher-page * {
          box-sizing: border-box;
        }

        .cash-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
          padding: 22px 24px;
          border: 1px solid #dbe3f2;
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 12px 32px rgba(24, 55, 105, 0.06);
        }

        .cash-eyebrow {
          color: #60708f;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.12em;
        }

        .cash-page-header h1 {
          margin: 5px 0 3px;
          color: #091a3a;
          font-size: clamp(28px, 3vw, 38px);
          line-height: 1.15;
          letter-spacing: -0.035em;
        }

        .cash-page-header p {
          margin: 0;
          color: #70809c;
          font-size: 14px;
        }

        .cash-header-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .cash-btn {
          min-height: 42px;
          padding: 9px 16px;
          border-radius: 13px;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .cash-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .cash-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .cash-btn-primary {
          border: 1px solid transparent;
          background: linear-gradient(135deg, #315efb, #4f46e5);
          color: white;
          box-shadow: 0 9px 20px rgba(49, 94, 251, 0.22);
        }

        .cash-btn-account {
          border: 1px solid #c7d4ff;
          background: #edf2ff;
          color: #2448ca;
        }

        .cash-btn-light {
          border: 1px solid #ccd7e9;
          background: #ffffff;
          color: #33435f;
        }

        .cash-entry-card,
        .cash-records-card {
          overflow: hidden;
          margin-bottom: 18px;
          border: 1px solid #d7e0ef;
          border-radius: 24px;
          background: #eef2f8;
          box-shadow: 0 14px 38px rgba(25, 48, 91, 0.075);
        }

        .cash-card-topbar {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 12px;
          padding: 14px 18px 9px;
        }

        .cash-close-button {
          display: grid;
          place-items: center;
          width: 58px;
          height: 45px;
          border: 0;
          border-radius: 12px;
          background: #ef7d8f;
          color: #1f1720;
          font-size: 30px;
          line-height: 1;
          cursor: pointer;
        }

        .cash-book-pill {
          min-width: 200px;
          padding: 9px 28px;
          border-radius: 15px;
          background: #172b68;
          color: white;
          font-size: 21px;
          font-weight: 850;
          text-align: center;
          box-shadow: 0 8px 18px rgba(23, 43, 104, 0.22);
        }

        .cash-inline-account-button {
          justify-self: end;
          min-height: 40px;
          padding: 8px 15px;
          border: 1px solid #bdcaf5;
          border-radius: 12px;
          background: #ffffff;
          color: #274aca;
          font-weight: 800;
          cursor: pointer;
        }

        .cash-meta-grid {
          display: grid;
          grid-template-columns: 190px 190px minmax(240px, 1fr);
          gap: 12px;
          padding: 10px 20px 16px;
        }

        .cash-meta-grid label,
        .cash-account-form label {
          display: grid;
          gap: 7px;
        }

        .cash-meta-grid label span,
        .cash-account-form label span {
          color: #52617c;
          font-size: 12px;
          font-weight: 800;
        }

        .cash-meta-grid input,
        .cash-account-form input,
        .cash-account-form select {
          width: 100%;
          min-height: 43px;
          padding: 9px 12px;
          border: 1px solid #cbd5e5;
          border-radius: 11px;
          outline: none;
          background: rgba(255, 255, 255, 0.9);
          color: #172039;
          font: inherit;
        }

        .cash-meta-grid input:focus,
        .cash-account-form input:focus,
        .cash-account-form select:focus {
          border-color: #315efb;
          box-shadow: 0 0 0 4px rgba(49, 94, 251, 0.12);
        }

        .cash-entry-table-wrap,
        .cash-records-table-wrap {
          overflow-x: auto;
          margin: 0 18px;
          border: 1px solid #cfd8e6;
          border-radius: 18px;
          background: #ffffff;
        }

        .cash-entry-table,
        .cash-records-table {
          width: 100%;
          min-width: 920px;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
        }

        .cash-entry-table th,
        .cash-records-table th {
          padding: 13px 12px;
          border: 0;
          background: #33353a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          text-align: left;
          white-space: nowrap;
        }

        .cash-records-table th {
          background: #0c1933;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .cash-entry-table th:first-child,
        .cash-records-table th:first-child {
          border-top-left-radius: 16px;
        }

        .cash-entry-table th:last-child,
        .cash-records-table th:last-child {
          border-top-right-radius: 16px;
        }

        .cash-entry-table th:nth-child(1) {
          width: 48px;
          padding: 0;
          background: #67c8de;
          text-align: center;
        }

        .cash-entry-table th:nth-child(2) {
          width: 17%;
        }

        .cash-entry-table th:nth-child(3) {
          width: 22%;
        }

        .cash-entry-table th:nth-child(4) {
          width: 30%;
        }

        .cash-entry-table th:nth-child(5),
        .cash-entry-table th:nth-child(6) {
          width: 14%;
          text-align: right;
        }

        .cash-add-column button {
          width: 100%;
          height: 45px;
          border: 0;
          background: transparent;
          color: #092033;
          font-size: 28px;
          cursor: pointer;
        }

        .cash-entry-table td,
        .cash-records-table td {
          height: 53px;
          padding: 0;
          border-top: 1px solid #e2e6ec;
          border-right: 1px solid #e2e6ec;
          background: rgba(255, 255, 255, 0.94);
          color: #172039;
          vertical-align: middle;
        }

        .cash-records-table td {
          height: auto;
          padding: 13px 12px;
          font-size: 13px;
        }

        .cash-entry-table td:last-child,
        .cash-records-table td:last-child {
          border-right: 0;
        }

        .cash-entry-table select,
        .cash-entry-table input {
          width: 100%;
          height: 52px;
          padding: 0 12px;
          border: 0;
          outline: none;
          background: transparent;
          color: #273046;
          font: inherit;
          font-size: 14px;
        }

        .cash-entry-table select:focus,
        .cash-entry-table input:focus {
          box-shadow: inset 0 0 0 2px #315efb;
        }

        .cash-delete-column {
          background: #ee7b8e !important;
          text-align: center;
        }

        .cash-delete-column button {
          width: 100%;
          height: 52px;
          border: 0;
          background: transparent;
          color: #88172b;
          font-size: 18px;
          cursor: pointer;
        }

        .cash-account-cell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          height: 52px;
        }

        .cash-mini-add {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          margin-right: 7px;
          border: 1px solid #b9c8fb;
          border-radius: 8px;
          background: #edf2ff;
          color: #3155d8;
          font-size: 19px;
          cursor: pointer;
        }

        .cash-money-input {
          text-align: right;
          font-weight: 750 !important;
        }

        .cash-receive-input {
          color: #078255 !important;
        }

        .cash-paid-input {
          color: #c43232 !important;
        }

        .cash-total-bar {
          display: grid;
          grid-template-columns: 1fr 245px 245px;
          gap: 12px;
          align-items: stretch;
          padding: 18px;
        }

        .cash-grand-total,
        .cash-total-box {
          min-height: 58px;
          padding: 12px 16px;
          border: 1px solid #d5deeb;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.86);
        }

        .cash-grand-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 340px;
        }

        .cash-grand-total span,
        .cash-total-box span {
          color: #3c475d;
          font-size: 13px;
          font-weight: 800;
        }

        .cash-grand-total strong {
          color: #13203a;
          font-size: 18px;
        }

        .cash-total-box {
          display: grid;
          grid-template-columns: 1fr;
          align-content: center;
          text-align: right;
        }

        .cash-total-box strong {
          margin-top: 4px;
          font-size: 18px;
        }

        .cash-total-box.receive strong {
          color: #087d55;
        }

        .cash-total-box.paid strong {
          color: #c13232;
        }

        .cash-records-card {
          padding: 18px 0;
          background: #ffffff;
        }

        .cash-records-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 0 18px 15px;
        }

        .cash-records-head h2 {
          margin: 0 0 3px;
          color: #0b1933;
          font-size: 20px;
        }

        .cash-records-head p {
          margin: 0;
          color: #75839c;
          font-size: 12px;
        }

        .cash-records-head input {
          width: min(390px, 100%);
          min-height: 43px;
          padding: 9px 13px;
          border: 1px solid #ccd7e8;
          border-radius: 13px;
          outline: none;
          font: inherit;
        }

        .cash-records-head input:focus {
          border-color: #315efb;
          box-shadow: 0 0 0 4px rgba(49, 94, 251, 0.1);
        }

        .cash-record-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .cash-record-actions button {
          padding: 7px 10px;
          border: 1px solid #c7d4f9;
          border-radius: 9px;
          background: #edf2ff;
          color: #284bc9;
          font-weight: 750;
          cursor: pointer;
        }

        .cash-record-actions button.danger {
          border-color: #facaca;
          background: #fff0f0;
          color: #c42e2e;
        }

        .cash-positive {
          color: #078255 !important;
          font-weight: 800;
        }

        .cash-negative {
          color: #c43232 !important;
          font-weight: 800;
        }

        .cash-empty {
          padding: 35px !important;
          color: #8290aa !important;
          text-align: center;
        }

        .cash-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          z-index: 99999;
          min-width: 280px;
          max-width: min(560px, calc(100vw - 32px));
          padding: 13px 18px;
          border-radius: 13px;
          color: white;
          font-weight: 750;
          text-align: center;
          transform: translateX(-50%);
          box-shadow: 0 15px 38px rgba(8, 20, 48, 0.24);
        }

        .cash-toast-success {
          background: #087f5b;
        }

        .cash-toast-error {
          background: #c93636;
        }

        .cash-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(6, 16, 38, 0.58);
          backdrop-filter: blur(5px);
        }

        .cash-account-modal {
          width: min(620px, 100%);
          overflow: hidden;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 35px 90px rgba(4, 14, 38, 0.34);
        }

        .cash-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 22px;
          border-bottom: 1px solid #e5e9f1;
        }

        .cash-modal-head span {
          color: #71809b;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.11em;
        }

        .cash-modal-head h3 {
          margin: 5px 0 0;
          color: #0b1935;
          font-size: 23px;
        }

        .cash-modal-head button {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 10px;
          background: #feecec;
          color: #bd2b2b;
          font-size: 25px;
          cursor: pointer;
        }

        .cash-account-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          padding: 22px;
        }

        .cash-full-field {
          grid-column: 1 / -1;
        }

        .cash-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #e5e9f1;
          background: #f8faff;
        }

        @media (max-width: 980px) {
          .cash-page-header {
            flex-direction: column;
          }

          .cash-header-actions {
            justify-content: flex-start;
          }

          .cash-meta-grid {
            grid-template-columns: 1fr 1fr;
          }

          .cash-notes-field {
            grid-column: 1 / -1;
          }

          .cash-total-bar {
            grid-template-columns: 1fr 1fr;
          }

          .cash-grand-total {
            grid-column: 1 / -1;
            max-width: none;
          }
        }

        @media (max-width: 680px) {
          .cash-voucher-page {
            padding: 10px;
          }

          .cash-page-header {
            padding: 17px;
            border-radius: 19px;
          }

          .cash-header-actions {
            width: 100%;
          }

          .cash-header-actions .cash-btn {
            flex: 1 1 145px;
          }

          .cash-card-topbar {
            grid-template-columns: auto 1fr;
          }

          .cash-book-pill {
            min-width: 0;
          }

          .cash-inline-account-button {
            grid-column: 1 / -1;
            justify-self: stretch;
          }

          .cash-meta-grid,
          .cash-account-form {
            grid-template-columns: 1fr;
          }

          .cash-notes-field,
          .cash-full-field {
            grid-column: auto;
          }

          .cash-total-bar {
            grid-template-columns: 1fr;
          }

          .cash-grand-total,
          .cash-total-box {
            grid-column: auto;
          }

          .cash-records-head {
            align-items: stretch;
            flex-direction: column;
          }

          .cash-records-head input {
            width: 100%;
          }
        }

        @media print {
          .cash-page-header,
          .cash-records-card,
          .cash-card-topbar button,
          .cash-inline-account-button,
          .cash-close-button {
            display: none !important;
          }

          .cash-voucher-page {
            padding: 0;
            background: white;
          }

          .cash-entry-card {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
