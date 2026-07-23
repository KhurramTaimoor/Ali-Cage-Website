import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
)
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");

const API = `${API_ORIGIN}/api/cash-book`;

const ACCOUNT_TYPES = [
  {
    value: "customer",
    en: "Customer",
    ur: "کسٹمر",
  },
  {
    value: "general_ledger",
    en: "General Ledger",
    ur: "جنرل لیجر",
  },
  {
    value: "supplier",
    en: "Supplier",
    ur: "سپلائر",
  },
  {
    value: "employee",
    en: "Employee",
    ur: "ملازم",
  },
];

const COPY = {
  en: {
    title: "Cash Book",
    subtitle:
      "Create multi-account cash receive and payment vouchers",
    language: "اردو",
    addAccount: "Add Account",
    newVoucher: "New Voucher",
    saveVoucher: "Save Voucher",
    updateVoucher: "Update Voucher",
    invoiceNo: "Invoice No",
    date: "Date",
    notes: "Voucher Notes",
    optional: "Optional",
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
    saved: "Saved Cash Book Vouchers",
    search:
      "Search voucher, account or description...",
    actions: "Actions",
    edit: "Edit",
    print: "Print",
    delete: "Delete",
    noRecords: "No vouchers found.",
    loading: "Loading...",
    modalTitle: "Add General Ledger Account",
    modalText:
      "Create a new account. It will appear in the account dropdown immediately after saving.",
    accountCode: "Account Code",
    accountTitle: "Account Title",
    group: "Account Group",
    openingBalance: "Opening Balance",
    autoCode:
      "Leave blank for automatic code",
    cancel: "Cancel",
    saveAccount: "Save Account",
  },

  ur: {
    title: "کیش بک",
    subtitle:
      "متعدد اکاؤنٹس کے لیے کیش وصولی اور ادائیگی واؤچر بنائیں",
    language: "English",
    addAccount: "اکاؤنٹ شامل کریں",
    newVoucher: "نیا واؤچر",
    saveVoucher: "واؤچر محفوظ کریں",
    updateVoucher: "واؤچر اپڈیٹ کریں",
    invoiceNo: "انوائس نمبر",
    date: "تاریخ",
    notes: "واؤچر نوٹس",
    optional: "اختیاری",
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
    saved:
      "محفوظ شدہ کیش بک واؤچرز",
    search:
      "واؤچر، اکاؤنٹ یا تفصیل تلاش کریں...",
    actions: "اقدامات",
    edit: "ترمیم",
    print: "پرنٹ",
    delete: "حذف",
    noRecords:
      "کوئی واؤچر نہیں ملا۔",
    loading: "لوڈ ہو رہا ہے...",
    modalTitle:
      "جنرل لیجر اکاؤنٹ شامل کریں",
    modalText:
      "نیا اکاؤنٹ بنائیں۔ محفوظ ہونے کے بعد یہ فوراً ڈراپ ڈاؤن میں نظر آئے گا۔",
    accountCode: "اکاؤنٹ کوڈ",
    accountTitle: "اکاؤنٹ ٹائٹل",
    group: "اکاؤنٹ گروپ",
    openingBalance: "ابتدائی بیلنس",
    autoCode:
      "خالی چھوڑیں تو کوڈ خود بنے گا",
    cancel: "منسوخ",
    saveAccount:
      "اکاؤنٹ محفوظ کریں",
  },
};

const localDate = () => {
  const value = new Date();

  const year =
    value.getFullYear();

  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    value.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const makeRow = () => ({
  localId: `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`,

  account_type: "customer",
  account_id: "",
  description: "",
  receive: "",
  paid: "",
});

const createRows = (count = 6) =>
  Array.from(
    { length: count },
    () => makeRow()
  );

const asNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const money = (value) =>
  asNumber(value).toLocaleString(
    "en-PK",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

const listFrom = (
  payload,
  key
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    Array.isArray(payload?.data)
  ) {
    return payload.data;
  }

  if (
    Array.isArray(payload?.[key])
  ) {
    return payload[key];
  }

  return [];
};

const apiError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong.";

const accountName = (account) =>
  account?.display_name ||
  account?.account_title ||
  account?.customer_name_en ||
  account?.supplier_name ||
  account?.full_name ||
  account?.name ||
  "-";

export default function CashBookPage() {
  const [lang, setLang] =
    useState("en");

  const text = COPY[lang];

  const isUrdu =
    lang === "ur";

  const toastTimer =
    useRef(null);

  const [voucher, setVoucher] =
    useState({
      voucher_no: "",
      voucher_date: localDate(),
      notes: "",
    });

  const [rows, setRows] =
    useState(createRows());

  const [lookups, setLookups] =
    useState({
      customer: [],
      general_ledger: [],
      supplier: [],
      employee: [],
      groups: [],
    });

  const [records, setRecords] =
    useState([]);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [toast, setToast] =
    useState({
      type: "",
      message: "",
    });

  const [
    accountModal,
    setAccountModal,
  ] = useState(false);

  const [
    accountTargetRow,
    setAccountTargetRow,
  ] = useState(null);

  const [
    accountSaving,
    setAccountSaving,
  ] = useState(false);

  const [
    accountForm,
    setAccountForm,
  ] = useState({
    account_code: "",
    account_title: "",
    group_id: "",
    opening_balance: "",
  });

  const notify = (
    type,
    message
  ) => {
    setToast({
      type,
      message,
    });

    if (toastTimer.current) {
      window.clearTimeout(
        toastTimer.current
      );
    }

    toastTimer.current =
      window.setTimeout(() => {
        setToast({
          type: "",
          message: "",
        });
      }, 3500);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) {
        window.clearTimeout(
          toastTimer.current
        );
      }
    },
    []
  );

  const fetchLookups =
    async () => {
      const response =
        await axios.get(
          `${API}/lookups`
        );

      const data =
        response.data?.data ||
        response.data ||
        {};

      setLookups({
        customer: listFrom(
          data.customers,
          "customers"
        ),

        general_ledger: listFrom(
          data.general_ledgers,
          "general_ledgers"
        ),

        supplier: listFrom(
          data.suppliers,
          "suppliers"
        ),

        employee: listFrom(
          data.employees,
          "employees"
        ),

        groups: listFrom(
          data.groups,
          "groups"
        ),
      });
    };

  const fetchNextNumber =
    async () => {
      const response =
        await axios.get(
          `${API}/next-number`
        );

      const voucherNo =
        response.data?.voucher_no ||
        response.data?.data
          ?.voucher_no ||
        "";

      setVoucher((current) => ({
        ...current,
        voucher_no: voucherNo,
      }));
    };

  const fetchRecords =
    async () => {
      const response =
        await axios.get(
          `${API}/vouchers`
        );

      setRecords(
        listFrom(
          response.data,
          "vouchers"
        )
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
      notify(
        "error",
        apiError(error)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const optionsFor = (type) =>
    lookups[type] || [];

  const updateRow = (
    localId,
    field,
    value
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (
          row.localId !== localId
        ) {
          return row;
        }

        const updated = {
          ...row,
          [field]: value,
        };

        if (
          field === "account_type"
        ) {
          updated.account_id = "";
          updated.description = "";
        }

        if (
          field === "account_id"
        ) {
          const selected =
            optionsFor(
              row.account_type
            ).find(
              (item) =>
                String(item.id) ===
                String(value)
            );

          if (
            selected &&
            !row.description.trim()
          ) {
            updated.description =
              accountName(selected);
          }
        }

        if (
          field === "receive" &&
          asNumber(value) > 0
        ) {
          updated.paid = "";
        }

        if (
          field === "paid" &&
          asNumber(value) > 0
        ) {
          updated.receive = "";
        }

        return updated;
      })
    );
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      makeRow(),
    ]);
  };

  const removeRow = (
    localId
  ) => {
    setRows((current) => {
      const next =
        current.filter(
          (row) =>
            row.localId !== localId
        );

      return next.length
        ? next
        : [makeRow()];
    });
  };

  const totals = useMemo(
    () => ({
      receive: rows.reduce(
        (sum, row) =>
          sum +
          asNumber(row.receive),
        0
      ),

      paid: rows.reduce(
        (sum, row) =>
          sum +
          asNumber(row.paid),
        0
      ),
    }),
    [rows]
  );

  const cleanItems = () =>
    rows
      .map((row) => ({
        account_type:
          row.account_type,

        account_id:
          row.account_id,

        description:
          row.description.trim(),

        receive:
          asNumber(row.receive),

        paid:
          asNumber(row.paid),
      }))
      .filter(
        (row) =>
          row.account_id ||
          row.description ||
          row.receive > 0 ||
          row.paid > 0
      );

  const validateVoucher = () => {
    if (
      !voucher.voucher_no.trim()
    ) {
      return "Invoice number is required.";
    }

    if (!voucher.voucher_date) {
      return "Date is required.";
    }

    const items =
      cleanItems();

    if (!items.length) {
      return "At least one valid account row is required.";
    }

    for (
      const [
        index,
        item,
      ] of items.entries()
    ) {
      if (
        !item.account_type ||
        !item.account_id
      ) {
        return `Select account type and account in row ${
          index + 1
        }.`;
      }

      if (
        item.receive <= 0 &&
        item.paid <= 0
      ) {
        return `Enter Receive or Paid amount in row ${
          index + 1
        }.`;
      }

      if (
        item.receive > 0 &&
        item.paid > 0
      ) {
        return `Receive and Paid cannot both be entered in row ${
          index + 1
        }.`;
      }
    }

    return "";
  };

  const resetVoucher =
    async () => {
      setEditingId(null);

      setRows(createRows());

      setVoucher({
        voucher_no: "",
        voucher_date: localDate(),
        notes: "",
      });

      try {
        await fetchNextNumber();
      } catch (error) {
        notify(
          "error",
          apiError(error)
        );
      }
    };

  const saveVoucher =
    async () => {
      const validation =
        validateVoucher();

      if (validation) {
        notify(
          "error",
          validation
        );

        return;
      }

      setSaving(true);

      try {
        const payload = {
          ...voucher,
          items: cleanItems(),
        };

        if (editingId) {
          await axios.put(
            `${API}/vouchers/${editingId}`,
            payload
          );

          notify(
            "success",
            "Cash Book voucher updated successfully."
          );
        } else {
          await axios.post(
            `${API}/vouchers`,
            payload
          );

          notify(
            "success",
            "Cash Book voucher saved successfully."
          );
        }

        await fetchRecords();
        await resetVoucher();
      } catch (error) {
        notify(
          "error",
          apiError(error)
        );
      } finally {
        setSaving(false);
      }
    };

  const editVoucher =
    async (id) => {
      try {
        const response =
          await axios.get(
            `${API}/vouchers/${id}`
          );

        const record =
          response.data?.data ||
          response.data?.voucher ||
          response.data;

        setEditingId(
          record.id
        );

        setVoucher({
          voucher_no:
            record.voucher_no || "",

          voucher_date:
            String(
              record.voucher_date ||
                ""
            ).slice(0, 10) ||
            localDate(),

          notes:
            record.notes || "",
        });

        const loaded =
          (
            record.items || []
          ).map((item) => ({
            localId: `${item.id}-${Math.random()
              .toString(16)
              .slice(2)}`,

            account_type:
              item.account_type ||
              "customer",

            account_id:
              String(
                item.account_id ||
                  ""
              ),

            description:
              item.description || "",

            receive:
              asNumber(
                item.receive
              ) > 0
                ? String(
                    item.receive
                  )
                : "",

            paid:
              asNumber(
                item.paid
              ) > 0
                ? String(item.paid)
                : "",
          }));

        setRows(
          loaded.length
            ? loaded
            : createRows()
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        notify(
          "error",
          apiError(error)
        );
      }
    };

  const deleteVoucher =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this voucher?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await axios.delete(
          `${API}/vouchers/${id}`
        );

        if (
          editingId === id
        ) {
          await resetVoucher();
        }

        await fetchRecords();

        notify(
          "success",
          "Voucher deleted successfully."
        );
      } catch (error) {
        notify(
          "error",
          apiError(error)
        );
      }
    };

  const openAccountModal = (
    rowId = null
  ) => {
    setAccountTargetRow(
      rowId
    );

    setAccountForm({
      account_code: "",
      account_title: "",
      group_id: "",
      opening_balance: "",
    });

    setAccountModal(true);
  };

  const closeAccountModal =
    () => {
      if (accountSaving) {
        return;
      }

      setAccountModal(false);
      setAccountTargetRow(null);
    };

  const saveAccount =
    async () => {
      if (
        !accountForm.account_title.trim()
      ) {
        notify(
          "error",
          "Account title is required."
        );

        return;
      }

      setAccountSaving(true);

      try {
        const response =
          await axios.post(
            `${API}/accounts`,
            accountForm
          );

        const account =
          response.data?.data ||
          response.data?.account ||
          response.data;

        setLookups(
          (current) => ({
            ...current,

            general_ledger: [
              account,

              ...current.general_ledger.filter(
                (item) =>
                  String(item.id) !==
                  String(
                    account.id
                  )
              ),
            ],
          })
        );

        if (accountTargetRow) {
          setRows((current) =>
            current.map((row) =>
              row.localId ===
              accountTargetRow
                ? {
                    ...row,

                    account_type:
                      "general_ledger",

                    account_id:
                      String(
                        account.id
                      ),

                    description:
                      row.description ||
                      accountName(
                        account
                      ),
                  }
                : row
            )
          );
        }

        setAccountModal(false);
        setAccountTargetRow(null);

        notify(
          "success",
          "Account added and dropdown refreshed."
        );
      } catch (error) {
        notify(
          "error",
          apiError(error)
        );
      } finally {
        setAccountSaving(false);
      }
    };

  const printVoucher =
    async (recordOrId) => {
      try {
        let record =
          recordOrId;

        if (
          typeof recordOrId !==
          "object"
        ) {
          const response =
            await axios.get(
              `${API}/vouchers/${recordOrId}`
            );

          record =
            response.data?.data ||
            response.data?.voucher ||
            response.data;
        }

        const tableRows =
          (
            record.items || []
          )
            .map(
              (
                item,
                index
              ) => `
                <tr>
                  <td>${
                    index + 1
                  }</td>

                  <td>${
                    item.account_type_label ||
                    item.account_type
                  }</td>

                  <td>${
                    item.account_name ||
                    "-"
                  }</td>

                  <td>${
                    item.description ||
                    "-"
                  }</td>

                  <td>${
                    asNumber(
                      item.receive
                    ) > 0
                      ? money(
                          item.receive
                        )
                      : "-"
                  }</td>

                  <td>${
                    asNumber(
                      item.paid
                    ) > 0
                      ? money(item.paid)
                      : "-"
                  }</td>
                </tr>
              `
            )
            .join("");

        const popup =
          window.open(
            "",
            "_blank",
            "width=1100,height=800"
          );

        if (!popup) {
          throw new Error(
            "Please allow pop-ups for printing."
          );
        }

        popup.document.write(`
          <!doctype html>

          <html>
            <head>
              <title>
                ${record.voucher_no}
              </title>

              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 28px;
                  color: #172033;
                }

                h1 {
                  text-align: center;
                  margin: 0 0 8px;
                }

                .meta {
                  display: flex;
                  justify-content: space-between;
                  margin: 24px 0;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                }

                th,
                td {
                  border: 1px solid #d5dae3;
                  padding: 10px;
                  text-align: left;
                }

                th {
                  background: #111827;
                  color: #ffffff;
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
              <h1>
                Cash Book Voucher
              </h1>

              <div class="meta">
                <strong>
                  Invoice No:
                  ${record.voucher_no}
                </strong>

                <strong>
                  Date:
                  ${String(
                    record.voucher_date ||
                      ""
                  ).slice(0, 10)}
                </strong>
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

                <tbody>
                  ${tableRows}
                </tbody>
              </table>

              <div class="totals">
                <span>
                  Total Receive:
                  Rs ${money(
                    record.total_receive
                  )}
                </span>

                <span>
                  Total Paid:
                  Rs ${money(
                    record.total_paid
                  )}
                </span>
              </div>
            </body>
          </html>
        `);

        popup.document.close();
        popup.focus();
        popup.print();
      } catch (error) {
        notify(
          "error",
          apiError(error)
        );
      }
    };

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return records;
      }

      return records.filter(
        (record) =>
          [
            record.voucher_no,
            record.voucher_date,
            record.notes,
            record.account_names,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          )
      );
    }, [records, search]);

  return (
    <div
      className="cash-page"
      dir={
        isUrdu ? "rtl" : "ltr"
      }
    >
      {toast.message && (
        <div
          className={`cash-toast ${toast.type}`}
        >
          {toast.message}
        </div>
      )}

      <section className="cash-header">
        <div>
          <h1>{text.title}</h1>

          <p>
            {text.subtitle}
          </p>
        </div>

        <div className="cash-header-actions">
          <button
            type="button"
            className="btn outline"
            onClick={() =>
              setLang((value) =>
                value === "en"
                  ? "ur"
                  : "en"
              )
            }
          >
            ◉ {text.language}
          </button>

          <button
            type="button"
            className="btn soft"
            onClick={() =>
              openAccountModal()
            }
          >
            ＋ {text.addAccount}
          </button>

          <button
            type="button"
            className="btn outline"
            onClick={resetVoucher}
          >
            ↻ {text.newVoucher}
          </button>

          <button
            type="button"
            className="btn primary"
            onClick={saveVoucher}
            disabled={saving}
          >
            {saving
              ? text.loading
              : editingId
              ? text.updateVoucher
              : text.saveVoucher}
          </button>
        </div>
      </section>

      <section className="cash-voucher-card">
        <div className="voucher-toolbar">
          <div>
            <h2>
              {editingId
                ? text.updateVoucher
                : text.newVoucher}
            </h2>

            <p>
              {text.invoiceNo},{" "}
              {text.date} aur account
              entries complete karein.
            </p>
          </div>

          <button
            type="button"
            className="clear-btn"
            title="Clear voucher"
            onClick={resetVoucher}
          >
            ×
          </button>
        </div>

        <div className="voucher-meta">
          <label>
            <span>
              {text.invoiceNo}
            </span>

            <input
              value={
                voucher.voucher_no
              }
              onChange={(event) =>
                setVoucher(
                  (current) => ({
                    ...current,

                    voucher_no:
                      event.target
                        .value,
                  })
                )
              }
            />
          </label>

          <label>
            <span>
              {text.date}
            </span>

            <input
              type="date"
              value={
                voucher.voucher_date
              }
              onChange={(event) =>
                setVoucher(
                  (current) => ({
                    ...current,

                    voucher_date:
                      event.target
                        .value,
                  })
                )
              }
            />
          </label>

          <label className="notes-field">
            <span>
              {text.notes}
            </span>

            <input
              value={voucher.notes}
              placeholder={
                text.optional
              }
              onChange={(event) =>
                setVoucher(
                  (current) => ({
                    ...current,

                    notes:
                      event.target
                        .value,
                  })
                )
              }
            />
          </label>
        </div>

        <div className="entry-table-wrap">
          <table className="entry-table">
            <thead>
              <tr>
                <th className="row-action-head">
                  <button
                    type="button"
                    onClick={addRow}
                    title="Add row"
                  >
                    ＋
                  </button>
                </th>

                <th>
                  {text.accountType}
                </th>

                <th>
                  {text.account}
                </th>

                <th>
                  {text.description}
                </th>

                <th>
                  {text.receive}
                </th>

                <th>
                  {text.paid}
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.localId}>
                  <td className="row-delete-cell">
                    <button
                      type="button"
                      title="Delete row"
                      onClick={() =>
                        removeRow(
                          row.localId
                        )
                      }
                    >
                      ▣
                    </button>
                  </td>

                  <td>
                    <select
                      value={
                        row.account_type
                      }
                      onChange={(event) =>
                        updateRow(
                          row.localId,
                          "account_type",
                          event.target
                            .value
                        )
                      }
                    >
                      {ACCOUNT_TYPES.map(
                        (type) => (
                          <option
                            key={
                              type.value
                            }
                            value={
                              type.value
                            }
                          >
                            {isUrdu
                              ? type.ur
                              : type.en}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  <td>
                    <div className="account-cell">
                      <select
                        value={
                          row.account_id
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            row.localId,
                            "account_id",
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="">
                          {text.select}
                        </option>

                        {optionsFor(
                          row.account_type
                        ).map(
                          (account) => (
                            <option
                              key={
                                account.id
                              }
                              value={
                                account.id
                              }
                            >
                              {accountName(
                                account
                              )}
                            </option>
                          )
                        )}
                      </select>

                      {row.account_type ===
                        "general_ledger" && (
                        <button
                          type="button"
                          className="mini-add"
                          title={
                            text.addAccount
                          }
                          onClick={() =>
                            openAccountModal(
                              row.localId
                            )
                          }
                        >
                          ＋
                        </button>
                      )}
                    </div>
                  </td>

                  <td>
                    <input
                      value={
                        row.description
                      }
                      placeholder={
                        text.enter
                      }
                      onChange={(
                        event
                      ) =>
                        updateRow(
                          row.localId,
                          "description",
                          event.target
                            .value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="amount-input receive"
                      value={
                        row.receive
                      }
                      placeholder={
                        text.enter
                      }
                      onChange={(
                        event
                      ) =>
                        updateRow(
                          row.localId,
                          "receive",
                          event.target
                            .value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="amount-input paid"
                      value={row.paid}
                      placeholder={
                        text.enter
                      }
                      onChange={(
                        event
                      ) =>
                        updateRow(
                          row.localId,
                          "paid",
                          event.target
                            .value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals-bar">
          <div className="grand-total">
            <span>
              {text.grandTotal}
            </span>

            <strong>
              Rs{" "}
              {money(
                totals.receive -
                  totals.paid
              )}
            </strong>
          </div>

          <div className="total-box receive">
            <span>
              {text.totalReceive}
            </span>

            <strong>
              Rs{" "}
              {money(
                totals.receive
              )}
            </strong>
          </div>

          <div className="total-box paid">
            <span>
              {text.totalPaid}
            </span>

            <strong>
              Rs {money(totals.paid)}
            </strong>
          </div>
        </div>
      </section>

      <section className="records-card">
        <div className="records-head">
          <div>
            <h2>{text.saved}</h2>

            <p>
              {records.length} voucher
              {records.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <input
            value={search}
            placeholder={text.search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="records-table-wrap">
          <table className="records-table">
            <thead>
              <tr>
                <th>#</th>
                <th>
                  {text.invoiceNo}
                </th>
                <th>{text.date}</th>
                <th>
                  {text.receive}
                </th>
                <th>{text.paid}</th>
                <th>Lines</th>
                <th>
                  {text.actions}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-cell"
                  >
                    {text.loading}
                  </td>
                </tr>
              ) : filteredRecords.length ? (
                filteredRecords.map(
                  (
                    record,
                    index
                  ) => (
                    <tr
                      key={record.id}
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {
                            record.voucher_no
                          }
                        </strong>
                      </td>

                      <td>
                        {String(
                          record.voucher_date ||
                            ""
                        ).slice(
                          0,
                          10
                        )}
                      </td>

                      <td className="positive">
                        Rs{" "}
                        {money(
                          record.total_receive
                        )}
                      </td>

                      <td className="negative">
                        Rs{" "}
                        {money(
                          record.total_paid
                        )}
                      </td>

                      <td>
                        {record.items_count ||
                          0}
                      </td>

                      <td>
                        <div className="record-actions">
                          <button
                            type="button"
                            onClick={() =>
                              editVoucher(
                                record.id
                              )
                            }
                          >
                            {text.edit}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              printVoucher(
                                record.id
                              )
                            }
                          >
                            {text.print}
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              deleteVoucher(
                                record.id
                              )
                            }
                          >
                            {text.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-cell"
                  >
                    {text.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {accountModal &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeAccountModal();
              }
            }}
          >
            <section
              className="account-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-modal-title"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <header className="modal-head">
                <div>
                  <h3 id="account-modal-title">
                    {text.modalTitle}
                  </h3>

                  <p>
                    {text.modalText}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  aria-label="Close modal"
                  onClick={
                    closeAccountModal
                  }
                >
                  ×
                </button>
              </header>

              <div className="account-form">
                <label>
                  <span>
                    {text.accountCode}
                  </span>

                  <input
                    value={
                      accountForm.account_code
                    }
                    placeholder={
                      text.autoCode
                    }
                    onChange={(
                      event
                    ) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          account_code:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    {text.group}
                  </span>

                  <select
                    value={
                      accountForm.group_id
                    }
                    onChange={(
                      event
                    ) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          group_id:
                            event.target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="">
                      {text.optional}
                    </option>

                    {lookups.groups.map(
                      (group) => (
                        <option
                          key={group.id}
                          value={group.id}
                        >
                          {
                            group.group_name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="full-field">
                  <span>
                    {text.accountTitle} *
                  </span>

                  <input
                    autoFocus
                    value={
                      accountForm.account_title
                    }
                    placeholder="e.g. Office Expense"
                    onChange={(
                      event
                    ) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          account_title:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label className="full-field">
                  <span>
                    {
                      text.openingBalance
                    }
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      accountForm.opening_balance
                    }
                    placeholder="0"
                    onChange={(
                      event
                    ) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          opening_balance:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn outline"
                  onClick={
                    closeAccountModal
                  }
                  disabled={
                    accountSaving
                  }
                >
                  {text.cancel}
                </button>

                <button
                  type="button"
                  className="btn primary"
                  onClick={saveAccount}
                  disabled={
                    accountSaving
                  }
                >
                  {accountSaving
                    ? text.loading
                    : `＋ ${text.saveAccount}`}
                </button>
              </footer>
            </section>
          </div>,

          document.body
        )}

      <style>{`
        .cash-page {
          min-height: 100vh;
          padding: 0;
          color: #14203a;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            "Segoe UI",
            sans-serif;
        }

        .cash-page,
        .cash-page * {
          box-sizing: border-box;
        }

        .cash-header,
        .cash-voucher-card,
        .records-card {
          border: 1px solid #d8e2f3;
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 12px 32px
            rgba(24, 55, 105, 0.06);
        }

        .cash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
          padding: 22px 24px;
        }

        .cash-header h1 {
          margin: 0 0 5px;
          color: #091a3a;
          font-size: 34px;
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .cash-header p,
        .voucher-toolbar p,
        .records-head p,
        .modal-head p {
          margin: 0;
          color: #74829c;
          font-size: 13px;
        }

        .cash-header-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn {
          min-height: 42px;
          padding: 9px 16px;
          border-radius: 13px;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.18s;
        }

        .btn:hover:not(:disabled),
        .clear-btn:hover,
        .record-actions button:hover {
          transform:
            translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn.primary {
          border:
            1px solid transparent;
          background:
            linear-gradient(
              135deg,
              #315efb,
              #4f46e5
            );
          color: #ffffff;
          box-shadow:
            0 9px 20px
            rgba(49, 94, 251, 0.22);
        }

        .btn.outline {
          border:
            1px solid #cbd6e8;
          background: #ffffff;
          color: #34435f;
        }

        .btn.soft {
          border:
            1px solid #c5d2fb;
          background: #edf2ff;
          color: #274bc9;
        }

        .cash-voucher-card {
          overflow: hidden;
          margin-bottom: 18px;
        }

        .voucher-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding:
            19px 20px 8px;
        }

        .voucher-toolbar h2,
        .records-head h2 {
          margin: 0 0 4px;
          color: #0b1935;
          font-size: 20px;
          font-weight: 850;
        }

        .clear-btn {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border:
            1px solid #fecaca;
          border-radius: 12px;
          background: #fff0f0;
          color: #c62e3e;
          font-size: 25px;
          cursor: pointer;
          transition: 0.18s;
        }

        .voucher-meta {
          display: grid;
          grid-template-columns:
            190px
            190px
            minmax(240px, 1fr);
          gap: 12px;
          padding:
            14px 20px 18px;
        }

        .voucher-meta label,
        .account-form label {
          display: grid;
          gap: 7px;
        }

        .voucher-meta span,
        .account-form span {
          color: #52617c;
          font-size: 12px;
          font-weight: 800;
        }

        .voucher-meta input,
        .account-form input,
        .account-form select {
          width: 100%;
          min-height: 44px;
          padding: 9px 12px;
          border:
            1px solid #cbd5e5;
          border-radius: 11px;
          outline: none;
          background: #ffffff;
          color: #172039;
          font: inherit;
        }

        .voucher-meta input:focus,
        .account-form input:focus,
        .account-form select:focus {
          border-color: #315efb;
          box-shadow:
            0 0 0 4px
            rgba(49, 94, 251, 0.12);
        }

        .entry-table-wrap,
        .records-table-wrap {
          overflow-x: auto;
          margin: 0 18px;
          border:
            1px solid #cfd8e6;
          border-radius: 18px;
          background: #ffffff;
        }

        .entry-table,
        .records-table {
          width: 100%;
          min-width: 920px;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
        }

        .entry-table th,
        .records-table th {
          padding: 13px 12px;
          border: 0;
          background: #30343a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          text-align: left;
          white-space: nowrap;
        }

        .records-table th {
          background: #0c1933;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .entry-table th:first-child,
        .records-table th:first-child {
          border-top-left-radius:
            16px;
        }

        .entry-table th:last-child,
        .records-table th:last-child {
          border-top-right-radius:
            16px;
        }

        .entry-table th:nth-child(1) {
          width: 48px;
          padding: 0;
          background: #62c8de;
          text-align: center;
        }

        .entry-table th:nth-child(2) {
          width: 17%;
        }

        .entry-table th:nth-child(3) {
          width: 22%;
        }

        .entry-table th:nth-child(4) {
          width: 30%;
        }

        .entry-table th:nth-child(5),
        .entry-table th:nth-child(6) {
          width: 14%;
          text-align: right;
        }

        .row-action-head button {
          width: 100%;
          height: 45px;
          border: 0;
          background: transparent;
          color: #092033;
          font-size: 28px;
          cursor: pointer;
        }

        .entry-table td,
        .records-table td {
          height: 53px;
          padding: 0;
          border-top:
            1px solid #e2e6ec;
          border-right:
            1px solid #e2e6ec;
          background: #ffffff;
          color: #172039;
          vertical-align: middle;
        }

        .entry-table td:last-child,
        .records-table td:last-child {
          border-right: 0;
        }

        .entry-table select,
        .entry-table input {
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

        .entry-table select:focus,
        .entry-table input:focus {
          box-shadow:
            inset 0 0 0 2px
            #315efb;
        }

        .row-delete-cell {
          background:
            #ef7890 !important;
          text-align: center;
        }

        .row-delete-cell button {
          width: 100%;
          height: 52px;
          border: 0;
          background: transparent;
          color: #8c1730;
          font-size: 18px;
          cursor: pointer;
        }

        .account-cell {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto;
          align-items: center;
          height: 52px;
        }

        .mini-add {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          margin-right: 7px;
          border:
            1px solid #b9c8fb;
          border-radius: 8px;
          background: #edf2ff;
          color: #3155d8;
          font-size: 19px;
          cursor: pointer;
        }

        .amount-input {
          text-align: right;
          font-weight:
            750 !important;
        }

        .amount-input.receive {
          color:
            #078255 !important;
        }

        .amount-input.paid {
          color:
            #c43232 !important;
        }

        .totals-bar {
          display: grid;
          grid-template-columns:
            1fr
            245px
            245px;
          gap: 12px;
          align-items: stretch;
          padding: 18px;
        }

        .grand-total,
        .total-box {
          min-height: 58px;
          padding: 12px 16px;
          border:
            1px solid #d5deeb;
          border-radius: 13px;
          background: #f9fbff;
        }

        .grand-total {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          max-width: 340px;
        }

        .grand-total span,
        .total-box span {
          color: #3c475d;
          font-size: 13px;
          font-weight: 800;
        }

        .grand-total strong,
        .total-box strong {
          font-size: 18px;
        }

        .total-box {
          display: grid;
          align-content: center;
          text-align: right;
        }

        .total-box strong {
          margin-top: 4px;
        }

        .total-box.receive strong,
        .positive {
          color:
            #078255 !important;
        }

        .total-box.paid strong,
        .negative {
          color:
            #c43232 !important;
        }

        .records-card {
          padding: 18px 0;
        }

        .records-head {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 18px;
          padding:
            0 18px 15px;
        }

        .records-head input {
          width:
            min(390px, 100%);
          min-height: 43px;
          padding: 9px 13px;
          border:
            1px solid #ccd7e8;
          border-radius: 13px;
          outline: none;
          font: inherit;
        }

        .records-head input:focus {
          border-color: #315efb;
          box-shadow:
            0 0 0 4px
            rgba(49, 94, 251, 0.1);
        }

        .records-table td {
          height: auto;
          padding: 13px 12px;
          font-size: 13px;
        }

        .record-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .record-actions button {
          padding: 7px 10px;
          border:
            1px solid #c7d4f9;
          border-radius: 9px;
          background: #edf2ff;
          color: #284bc9;
          font-weight: 750;
          cursor: pointer;
          transition: 0.18s;
        }

        .record-actions button.danger {
          border-color: #facaca;
          background: #fff0f0;
          color: #c42e2e;
        }

        .empty-cell {
          padding:
            35px !important;
          color:
            #8290aa !important;
          text-align: center;
        }

        .cash-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          z-index: 100000;
          min-width: 280px;
          max-width:
            min(
              560px,
              calc(100vw - 32px)
            );
          padding: 13px 18px;
          border-radius: 13px;
          color: #ffffff;
          font-weight: 750;
          text-align: center;
          transform:
            translateX(-50%);
          box-shadow:
            0 15px 38px
            rgba(8, 20, 48, 0.24);
        }

        .cash-toast.success {
          background: #087f5b;
        }

        .cash-toast.error {
          background: #c93636;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: grid;
          place-items: center;
          overflow-y: auto;
          padding: 24px;
          background:
            rgba(7, 18, 42, 0.62);
          backdrop-filter: blur(5px);
        }

        .account-modal {
          width:
            min(720px, 100%);
          overflow: hidden;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.75
            );
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 34px 90px
            rgba(3, 13, 36, 0.38);
          animation:
            modalOpen
            0.2s ease-out;
        }

        @keyframes modalOpen {
          from {
            opacity: 0;
            transform:
              translateY(12px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        .modal-head {
          display: flex;
          align-items: flex-start;
          justify-content:
            space-between;
          gap: 20px;
          padding: 22px 24px;
          border-bottom:
            1px solid #e5eaf3;
          background:
            linear-gradient(
              135deg,
              rgba(
                49,
                94,
                251,
                0.08
              ),
              rgba(
                79,
                70,
                229,
                0.035
              )
            ),
            #ffffff;
        }

        .modal-head h3 {
          margin: 0 0 6px;
          color: #0a1936;
          font-size: 24px;
          font-weight: 900;
          letter-spacing:
            -0.025em;
        }

        .modal-head p {
          max-width: 520px;
          line-height: 1.55;
        }

        .modal-close {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border:
            1px solid #fecaca;
          border-radius: 11px;
          background: #fff0f0;
          color: #c62e3e;
          font-size: 26px;
          cursor: pointer;
        }

        .account-form {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 17px;
          padding: 24px;
        }

        .full-field {
          grid-column: 1 / -1;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px;
          border-top:
            1px solid #e5eaf3;
          background: #f8faff;
        }

        @media (max-width: 980px) {
          .cash-header {
            flex-direction: column;
          }

          .cash-header-actions {
            justify-content:
              flex-start;
          }

          .voucher-meta {
            grid-template-columns:
              1fr 1fr;
          }

          .notes-field {
            grid-column: 1 / -1;
          }

          .totals-bar {
            grid-template-columns:
              1fr 1fr;
          }

          .grand-total {
            grid-column: 1 / -1;
            max-width: none;
          }
        }

        @media (max-width: 680px) {
          .cash-header {
            padding: 17px;
            border-radius: 19px;
          }

          .cash-header h1 {
            font-size: 28px;
          }

          .cash-header-actions {
            width: 100%;
          }

          .cash-header-actions .btn {
            flex: 1 1 145px;
          }

          .voucher-meta,
          .account-form {
            grid-template-columns: 1fr;
          }

          .notes-field,
          .full-field {
            grid-column: auto;
          }

          .totals-bar {
            grid-template-columns: 1fr;
          }

          .grand-total,
          .total-box {
            grid-column: auto;
          }

          .records-head {
            align-items: stretch;
            flex-direction: column;
          }

          .records-head input {
            width: 100%;
          }

          .modal-backdrop {
            padding: 12px;
          }

          .account-modal {
            border-radius: 18px;
          }

          .modal-head,
          .account-form,
          .modal-footer {
            padding-left: 17px;
            padding-right: 17px;
          }
        }

        @media print {
          .cash-header,
          .records-card,
          .clear-btn {
            display: none !important;
          }

          .cash-page {
            padding: 0;
          }

          .cash-voucher-card {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
