import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Edit3,
  Languages,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
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

const TEXT = {
  en: {
    title: "Cash Book",
    subtitle: "Create and manage cash receive and payment vouchers",
    language: "اردو",
    addAccount: "Add Account",
    addVoucher: "Add New Voucher",
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
    totalVouchers: "Total Vouchers",
    totalReceive: "Total Receive",
    totalPaid: "Total Paid",
    netBalance: "Net Balance",
    grandTotal: "Grand Total",
    vouchers: "Cash Book Vouchers",
    search: "Search voucher, account or description...",
    edit: "Edit",
    print: "Print",
    delete: "Delete",
    cancel: "Cancel",
    loading: "Loading...",
    noRecords: "No vouchers found.",
    accountModalTitle: "Add General Ledger Account",
    accountModalText:
      "Create a new account. It will appear in the dropdown immediately after saving.",
    accountCode: "Account Code",
    accountTitle: "Account Title",
    group: "Account Group",
    openingBalance: "Opening Balance",
    autoCode: "Leave blank for automatic code",
    saveAccount: "Save Account",
  },

  ur: {
    title: "کیش بک",
    subtitle: "کیش وصولی اور ادائیگی کے واؤچرز بنائیں اور منظم کریں",
    language: "English",
    addAccount: "اکاؤنٹ شامل کریں",
    addVoucher: "نیا واؤچر شامل کریں",
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
    totalVouchers: "کل واؤچرز",
    totalReceive: "کل وصولی",
    totalPaid: "کل ادائیگی",
    netBalance: "نیٹ بیلنس",
    grandTotal: "مجموعی رقم",
    vouchers: "کیش بک واؤچرز",
    search: "واؤچر، اکاؤنٹ یا تفصیل تلاش کریں...",
    edit: "ترمیم",
    print: "پرنٹ",
    delete: "حذف",
    cancel: "منسوخ",
    loading: "لوڈ ہو رہا ہے...",
    noRecords: "کوئی واؤچر نہیں ملا۔",
    accountModalTitle: "جنرل لیجر اکاؤنٹ شامل کریں",
    accountModalText:
      "نیا اکاؤنٹ بنائیں۔ محفوظ ہونے کے بعد یہ فوراً ڈراپ ڈاؤن میں نظر آئے گا۔",
    accountCode: "اکاؤنٹ کوڈ",
    accountTitle: "اکاؤنٹ ٹائٹل",
    group: "اکاؤنٹ گروپ",
    openingBalance: "ابتدائی بیلنس",
    autoCode: "خالی چھوڑیں تو کوڈ خود بنے گا",
    saveAccount: "اکاؤنٹ محفوظ کریں",
  },
};

const today = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
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

const makeRows = (count = 6) =>
  Array.from(
    { length: count },
    () => makeRow()
  );

const num = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const money = (value) =>
  num(value).toLocaleString(
    "en-PK",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

const asList = (
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

const errorText = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong.";

const displayName = (row) =>
  row?.display_name ||
  row?.account_title ||
  row?.customer_name_en ||
  row?.supplier_name ||
  row?.full_name ||
  row?.name ||
  "-";

const Button = ({
  className = "",
  children,
  ...props
}) => (
  <button
    {...props}
    className={`
      inline-flex
      min-h-10
      items-center
      justify-center
      gap-2
      rounded-xl
      px-4
      py-2
      text-sm
      font-bold
      transition
      disabled:cursor-not-allowed
      disabled:opacity-60
      ${className}
    `}
  >
    {children}
  </button>
);

export default function CashBookPage() {
  const [lang, setLang] =
    useState("en");

  const text = TEXT[lang];

  const isUrdu =
    lang === "ur";

  const toastTimer =
    useRef(null);

  const [
    voucherModal,
    setVoucherModal,
  ] = useState(false);

  const [
    accountModal,
    setAccountModal,
  ] = useState(false);

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

  const [
    accountSaving,
    setAccountSaving,
  ] = useState(false);

  const [toast, setToast] =
    useState({
      type: "",
      message: "",
    });

  const [voucher, setVoucher] =
    useState({
      voucher_no: "",
      voucher_date: today(),
      notes: "",
    });

  const [rows, setRows] =
    useState(makeRows());

  const [records, setRecords] =
    useState([]);

  const [lookups, setLookups] =
    useState({
      customer: [],
      general_ledger: [],
      supplier: [],
      employee: [],
      groups: [],
    });

  const [
    accountTargetRow,
    setAccountTargetRow,
  ] = useState(null);

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

    window.clearTimeout(
      toastTimer.current
    );

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
      window.clearTimeout(
        toastTimer.current
      );
    },
    []
  );

  useEffect(() => {
    if (
      !voucherModal &&
      !accountModal
    ) {
      return undefined;
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [
    voucherModal,
    accountModal,
  ]);

  useEffect(() => {
    const onEscape = (event) => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      if (
        accountModal &&
        !accountSaving
      ) {
        setAccountModal(false);
        setAccountTargetRow(null);
        return;
      }

      if (
        voucherModal &&
        !saving
      ) {
        setVoucherModal(false);
      }
    };

    window.addEventListener(
      "keydown",
      onEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onEscape
      );
  }, [
    accountModal,
    accountSaving,
    voucherModal,
    saving,
  ]);

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
        customer: asList(
          data.customers,
          "customers"
        ),

        general_ledger: asList(
          data.general_ledgers,
          "general_ledgers"
        ),

        supplier: asList(
          data.suppliers,
          "suppliers"
        ),

        employee: asList(
          data.employees,
          "employees"
        ),

        groups: asList(
          data.groups,
          "groups"
        ),
      });
    };

  const fetchRecords =
    async () => {
      const response =
        await axios.get(
          `${API}/vouchers`
        );

      setRecords(
        asList(
          response.data,
          "vouchers"
        )
      );
    };

  const fetchNextNumber =
    async () => {
      const response =
        await axios.get(
          `${API}/next-number`
        );

      const nextNo =
        response.data
          ?.voucher_no ||
        response.data?.data
          ?.voucher_no ||
        "";

      setVoucher(
        (current) => ({
          ...current,
          voucher_no: nextNo,
        })
      );
    };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        await Promise.all([
          fetchLookups(),
          fetchRecords(),
        ]);
      } catch (error) {
        notify(
          "error",
          errorText(error)
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const optionsFor = (type) =>
    lookups[type] || [];

  const resetVoucher = () => {
    setEditingId(null);

    setRows(makeRows());

    setVoucher({
      voucher_no: "",
      voucher_date: today(),
      notes: "",
    });
  };

  const openNewVoucher =
    async () => {
      resetVoucher();

      setVoucherModal(true);

      try {
        await fetchNextNumber();
      } catch (error) {
        notify(
          "error",
          errorText(error)
        );
      }
    };

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
              displayName(selected);
          }
        }

        if (
          field === "receive" &&
          num(value) > 0
        ) {
          updated.paid = "";
        }

        if (
          field === "paid" &&
          num(value) > 0
        ) {
          updated.receive = "";
        }

        return updated;
      })
    );
  };

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
          num(row.receive),

        paid:
          num(row.paid),
      }))
      .filter(
        (row) =>
          row.account_id ||
          row.description ||
          row.receive > 0 ||
          row.paid > 0
      );

  const totals = useMemo(
    () => ({
      receive: rows.reduce(
        (sum, row) =>
          sum +
          num(row.receive),
        0
      ),

      paid: rows.reduce(
        (sum, row) =>
          sum +
          num(row.paid),
        0
      ),
    }),
    [rows]
  );

  const summary = useMemo(
    () => {
      const receive =
        records.reduce(
          (sum, record) =>
            sum +
            num(
              record.total_receive
            ),
          0
        );

      const paid =
        records.reduce(
          (sum, record) =>
            sum +
            num(
              record.total_paid
            ),
          0
        );

      return {
        count: records.length,
        receive,
        paid,
        net: receive - paid,
      };
    },
    [records]
  );

  const validate = () => {
    if (
      !voucher.voucher_no.trim()
    ) {
      return "Invoice number is required.";
    }

    if (
      !voucher.voucher_date
    ) {
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

  const saveVoucher =
    async () => {
      const validation =
        validate();

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

        setVoucherModal(false);

        resetVoucher();

        await fetchRecords();
      } catch (error) {
        notify(
          "error",
          errorText(error)
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
            record.voucher_no ||
            "",

          voucher_date:
            String(
              record.voucher_date ||
                ""
            ).slice(0, 10) ||
            today(),

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
              num(item.receive) >
              0
                ? String(
                    item.receive
                  )
                : "",

            paid:
              num(item.paid) > 0
                ? String(item.paid)
                : "",
          }));

        setRows(
          loaded.length
            ? loaded
            : makeRows()
        );

        setVoucherModal(true);
      } catch (error) {
        notify(
          "error",
          errorText(error)
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

        await fetchRecords();

        notify(
          "success",
          "Voucher deleted successfully."
        );
      } catch (error) {
        notify(
          "error",
          errorText(error)
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

        if (
          accountTargetRow
        ) {
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
                      displayName(
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
          errorText(error)
        );
      } finally {
        setAccountSaving(false);
      }
    };

  const printVoucher =
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

        const body =
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
                    num(
                      item.receive
                    ) > 0
                      ? money(
                          item.receive
                        )
                      : "-"
                  }</td>

                  <td>${
                    num(item.paid) >
                    0
                      ? money(
                          item.paid
                        )
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
                  font-family: Arial;
                  padding: 28px;
                  color: #172033;
                }

                h1 {
                  text-align: center;
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
                  border: 1px solid #ddd;
                  padding: 10px;
                  text-align: left;
                }

                th {
                  background: #111827;
                  color: white;
                }

                .totals {
                  display: flex;
                  justify-content: flex-end;
                  gap: 30px;
                  margin-top: 18px;
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
                  ${body}
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
          errorText(error)
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
    }, [
      records,
      search,
    ]);

  return (
    <div
      className="min-h-screen text-slate-800"
      dir={
        isUrdu
          ? "rtl"
          : "ltr"
      }
    >
      {toast.message && (
        <div
          className={`
            fixed
            left-1/2
            top-5
            z-[100000]
            -translate-x-1/2
            rounded-xl
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-2xl
            ${
              toast.type ===
              "success"
                ? "bg-emerald-600"
                : "bg-red-600"
            }
          `}
        >
          {toast.message}
        </div>
      )}

      <section
        className="
          mb-4
          flex
          flex-col
          justify-between
          gap-5
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          lg:flex-row
          lg:items-start
        "
      >
        <div>
          <h1
            className="
              text-3xl
              font-black
              tracking-tight
              text-slate-950
            "
          >
            {text.title}
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {text.subtitle}
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          <Button
            className="
              border
              border-slate-300
              bg-white
              text-slate-700
              hover:bg-slate-50
            "
            onClick={() =>
              setLang((value) =>
                value === "en"
                  ? "ur"
                  : "en"
              )
            }
          >
            <Languages size={16} />

            {text.language}
          </Button>

          <Button
            className="
              border
              border-blue-200
              bg-blue-50
              text-blue-700
              hover:bg-blue-100
            "
            onClick={() =>
              openAccountModal()
            }
          >
            <UserPlus size={16} />

            {text.addAccount}
          </Button>

          <Button
            className="
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              text-white
              shadow-lg
              shadow-blue-200
              hover:-translate-y-0.5
            "
            onClick={
              openNewVoucher
            }
          >
            <Plus size={17} />

            {text.addVoucher}
          </Button>
        </div>
      </section>

      <section
        className="
          mb-4
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {[
          [
            text.totalVouchers,
            summary.count,
            "border-blue-500",
          ],

          [
            text.totalReceive,
            `Rs ${money(
              summary.receive
            )}`,
            "border-emerald-500",
          ],

          [
            text.totalPaid,
            `Rs ${money(
              summary.paid
            )}`,
            "border-red-500",
          ],

          [
            text.netBalance,
            `Rs ${money(
              summary.net
            )}`,
            "border-indigo-500",
          ],
        ].map(
          ([
            label,
            value,
            border,
          ]) => (
            <div
              key={label}
              className={`
                rounded-2xl
                border
                border-slate-200
                border-t-4
                ${border}
                bg-white
                p-5
                shadow-sm
              `}
            >
              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                {label}
              </p>

              <p
                className="
                  mt-2
                  truncate
                  text-2xl
                  font-black
                  text-slate-950
                "
              >
                {value}
              </p>
            </div>
          )
        )}
      </section>

      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            justify-between
            gap-4
            border-b
            border-slate-100
            p-5
            md:flex-row
            md:items-center
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-black
                text-slate-950
              "
            >
              {text.vouchers}
            </h2>

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              {records.length} voucher
              {records.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <div
            className="
              relative
              w-full
              md:max-w-md
            "
          >
            <Search
              size={17}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                text.search
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                pl-10
                pr-3
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>
        </div>

        <div
          className="
            overflow-x-auto
            p-4
          "
        >
          <table
            className="
              w-full
              min-w-[850px]
              overflow-hidden
              rounded-2xl
              text-left
              text-sm
            "
          >
            <thead
              className="
                bg-slate-950
                text-xs
                uppercase
                tracking-wide
                text-white
              "
            >
              <tr>
                <th className="px-4 py-3">
                  #
                </th>

                <th className="px-4 py-3">
                  {text.invoiceNo}
                </th>

                <th className="px-4 py-3">
                  {text.date}
                </th>

                <th className="px-4 py-3">
                  {text.receive}
                </th>

                <th className="px-4 py-3">
                  {text.paid}
                </th>

                <th className="px-4 py-3">
                  Lines
                </th>

                <th className="px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody
              className="
                divide-y
                divide-slate-100
              "
            >
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="
                      px-4
                      py-12
                      text-center
                      text-slate-400
                    "
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
                      className="
                        hover:bg-slate-50
                      "
                    >
                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          font-bold
                        "
                      >
                        {
                          record.voucher_no
                        }
                      </td>

                      <td className="px-4 py-3">
                        {String(
                          record.voucher_date ||
                            ""
                        ).slice(
                          0,
                          10
                        )}
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          font-bold
                          text-emerald-600
                        "
                      >
                        Rs{" "}
                        {money(
                          record.total_receive
                        )}
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          font-bold
                          text-red-600
                        "
                      >
                        Rs{" "}
                        {money(
                          record.total_paid
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {record.items_count ||
                          0}
                      </td>

                      <td className="px-4 py-3">
                        <div
                          className="
                            flex
                            flex-wrap
                            gap-2
                          "
                        >
                          <Button
                            className="
                              min-h-9
                              border
                              border-blue-200
                              bg-blue-50
                              px-3
                              py-1.5
                              text-xs
                              text-blue-700
                            "
                            onClick={() =>
                              editVoucher(
                                record.id
                              )
                            }
                          >
                            <Edit3
                              size={14}
                            />

                            {text.edit}
                          </Button>

                          <Button
                            className="
                              min-h-9
                              border
                              border-slate-300
                              bg-white
                              px-3
                              py-1.5
                              text-xs
                              text-slate-700
                            "
                            onClick={() =>
                              printVoucher(
                                record.id
                              )
                            }
                          >
                            <Printer
                              size={14}
                            />

                            {text.print}
                          </Button>

                          <Button
                            className="
                              min-h-9
                              border
                              border-red-200
                              bg-red-50
                              px-3
                              py-1.5
                              text-xs
                              text-red-700
                            "
                            onClick={() =>
                              deleteVoucher(
                                record.id
                              )
                            }
                          >
                            <Trash2
                              size={14}
                            />

                            {text.delete}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="
                      px-4
                      py-12
                      text-center
                      text-slate-400
                    "
                  >
                    {text.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {voucherModal &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[99990]
              flex
              items-center
              justify-center
              overflow-y-auto
              bg-slate-950/65
              p-3
              backdrop-blur-sm
              sm:p-6
            "
            onMouseDown={(event) => {
              if (
                event.target ===
                  event.currentTarget &&
                !saving
              ) {
                setVoucherModal(false);
              }
            }}
          >
            <section
              className="
                flex
                max-h-[calc(100vh-24px)]
                w-full
                max-w-6xl
                flex-col
                overflow-hidden
                rounded-3xl
                border
                border-white/70
                bg-white
                shadow-2xl
              "
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <header
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-slate-200
                  bg-gradient-to-r
                  from-blue-50
                  to-indigo-50
                  p-5
                "
              >
                <div>
                  <span
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.18em]
                      text-blue-700
                    "
                  >
                    Cash Book
                  </span>

                  <h2
                    className="
                      mt-1
                      text-2xl
                      font-black
                      text-slate-950
                    "
                  >
                    {editingId
                      ? text.updateVoucher
                      : text.addVoucher}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    Select accounts and
                    enter Receive or Paid
                    amounts.
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Button
                    className="
                      hidden
                      border
                      border-blue-200
                      bg-white
                      text-blue-700
                      sm:inline-flex
                    "
                    onClick={() =>
                      openAccountModal()
                    }
                  >
                    <UserPlus size={16} />

                    {text.addAccount}
                  </Button>

                  <button
                    type="button"
                    onClick={() =>
                      !saving &&
                      setVoucherModal(
                        false
                      )
                    }
                    className="
                      grid
                      h-10
                      w-10
                      place-items-center
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      text-red-600
                    "
                  >
                    <X size={20} />
                  </button>
                </div>
              </header>

              <div
                className="
                  overflow-y-auto
                  bg-slate-50
                  p-4
                  sm:p-5
                "
              >
                <div
                  className="
                    mb-4
                    grid
                    grid-cols-1
                    gap-3
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    md:grid-cols-[190px_190px_1fr]
                  "
                >
                  <label
                    className="
                      grid
                      gap-1.5
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    {text.invoiceNo}

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
                      className="
                        h-11
                        rounded-xl
                        border
                        border-slate-300
                        px-3
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />
                  </label>

                  <label
                    className="
                      grid
                      gap-1.5
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    {text.date}

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
                      className="
                        h-11
                        rounded-xl
                        border
                        border-slate-300
                        px-3
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />
                  </label>

                  <label
                    className="
                      grid
                      gap-1.5
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    {text.notes}

                    <input
                      value={
                        voucher.notes
                      }
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
                      className="
                        h-11
                        rounded-xl
                        border
                        border-slate-300
                        px-3
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />
                  </label>
                </div>

                <div
                  className="
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-slate-300
                    bg-white
                  "
                >
                  <table
                    className="
                      w-full
                      min-w-[920px]
                      table-fixed
                      text-sm
                    "
                  >
                    <thead
                      className="
                        bg-slate-800
                        text-white
                      "
                    >
                      <tr>
                        <th
                          className="
                            w-12
                            bg-cyan-400
                            p-0
                            text-slate-950
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setRows(
                                (current) => [
                                  ...current,
                                  makeRow(),
                                ]
                              )
                            }
                            className="
                              grid
                              h-12
                              w-full
                              place-items-center
                            "
                          >
                            <Plus size={24} />
                          </button>
                        </th>

                        <th
                          className="
                            w-[17%]
                            px-3
                            py-3
                          "
                        >
                          {text.accountType}
                        </th>

                        <th
                          className="
                            w-[22%]
                            px-3
                            py-3
                          "
                        >
                          {text.account}
                        </th>

                        <th
                          className="
                            w-[30%]
                            px-3
                            py-3
                          "
                        >
                          {text.description}
                        </th>

                        <th
                          className="
                            w-[14%]
                            px-3
                            py-3
                            text-right
                          "
                        >
                          {text.receive}
                        </th>

                        <th
                          className="
                            w-[14%]
                            px-3
                            py-3
                            text-right
                          "
                        >
                          {text.paid}
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      className="
                        divide-y
                        divide-slate-200
                      "
                    >
                      {rows.map((row) => (
                        <tr key={row.localId}>
                          <td
                            className="
                              bg-rose-400
                              p-0
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setRows(
                                  (current) => {
                                    const next =
                                      current.filter(
                                        (item) =>
                                          item.localId !==
                                          row.localId
                                      );

                                    return next.length
                                      ? next
                                      : [
                                          makeRow(),
                                        ];
                                  }
                                )
                              }
                              className="
                                grid
                                h-13
                                w-full
                                place-items-center
                                text-rose-950
                              "
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </td>

                          <td
                            className="
                              border-r
                              border-slate-200
                              p-0
                            "
                          >
                            <select
                              value={
                                row.account_type
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.localId,
                                  "account_type",
                                  event.target
                                    .value
                                )
                              }
                              className="
                                h-13
                                w-full
                                border-0
                                bg-transparent
                                px-3
                                outline-none
                                focus:ring-2
                                focus:ring-inset
                                focus:ring-blue-500
                              "
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

                          <td
                            className="
                              border-r
                              border-slate-200
                              p-0
                            "
                          >
                            <div
                              className="
                                flex
                                h-13
                                items-center
                              "
                            >
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
                                className="
                                  h-full
                                  min-w-0
                                  flex-1
                                  border-0
                                  bg-transparent
                                  px-3
                                  outline-none
                                  focus:ring-2
                                  focus:ring-inset
                                  focus:ring-blue-500
                                "
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
                                      {displayName(
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
                                  onClick={() =>
                                    openAccountModal(
                                      row.localId
                                    )
                                  }
                                  className="
                                    mr-2
                                    grid
                                    h-8
                                    w-8
                                    place-items-center
                                    rounded-lg
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    text-blue-700
                                  "
                                >
                                  <Plus
                                    size={16}
                                  />
                                </button>
                              )}
                            </div>
                          </td>

                          <td
                            className="
                              border-r
                              border-slate-200
                              p-0
                            "
                          >
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
                              className="
                                h-13
                                w-full
                                border-0
                                bg-transparent
                                px-3
                                outline-none
                                focus:ring-2
                                focus:ring-inset
                                focus:ring-blue-500
                              "
                            />
                          </td>

                          <td
                            className="
                              border-r
                              border-slate-200
                              p-0
                            "
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.01"
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
                              className="
                                h-13
                                w-full
                                border-0
                                bg-transparent
                                px-3
                                text-right
                                font-bold
                                text-emerald-600
                                outline-none
                                focus:ring-2
                                focus:ring-inset
                                focus:ring-blue-500
                              "
                            />
                          </td>

                          <td className="p-0">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
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
                              className="
                                h-13
                                w-full
                                border-0
                                bg-transparent
                                px-3
                                text-right
                                font-bold
                                text-red-500
                                outline-none
                                focus:ring-2
                                focus:ring-inset
                                focus:ring-blue-500
                              "
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-1
                    gap-3
                    lg:grid-cols-[1fr_240px_240px]
                  "
                >
                  <div
                    className="
                      flex
                      min-h-16
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                    "
                  >
                    <span
                      className="
                        text-sm
                        font-black
                        text-slate-600
                      "
                    >
                      {text.grandTotal}
                    </span>

                    <strong
                      className="
                        text-xl
                        text-slate-950
                      "
                    >
                      Rs{" "}
                      {money(
                        totals.receive -
                          totals.paid
                      )}
                    </strong>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      border
                      border-emerald-200
                      bg-white
                      px-5
                      py-3
                      text-right
                    "
                  >
                    <span
                      className="
                        text-xs
                        font-bold
                        text-slate-500
                      "
                    >
                      {text.totalReceive}
                    </span>

                    <strong
                      className="
                        mt-1
                        block
                        text-xl
                        text-emerald-600
                      "
                    >
                      Rs{" "}
                      {money(
                        totals.receive
                      )}
                    </strong>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      border
                      border-red-200
                      bg-white
                      px-5
                      py-3
                      text-right
                    "
                  >
                    <span
                      className="
                        text-xs
                        font-bold
                        text-slate-500
                      "
                    >
                      {text.totalPaid}
                    </span>

                    <strong
                      className="
                        mt-1
                        block
                        text-xl
                        text-red-600
                      "
                    >
                      Rs{" "}
                      {money(
                        totals.paid
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <footer
                className="
                  flex
                  justify-end
                  gap-2
                  border-t
                  border-slate-200
                  bg-white
                  p-4
                "
              >
                <Button
                  className="
                    border
                    border-slate-300
                    bg-white
                    text-slate-700
                  "
                  onClick={() =>
                    !saving &&
                    setVoucherModal(
                      false
                    )
                  }
                  disabled={saving}
                >
                  {text.cancel}
                </Button>

                <Button
                  className="
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    text-white
                    shadow-lg
                    shadow-blue-200
                  "
                  onClick={
                    saveVoucher
                  }
                  disabled={saving}
                >
                  {saving ? (
                    <RefreshCw
                      size={16}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving
                    ? text.loading
                    : editingId
                    ? text.updateVoucher
                    : text.saveVoucher}
                </Button>
              </footer>
            </section>
          </div>,

          document.body
        )}

      {accountModal &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[100100]
              flex
              items-center
              justify-center
              overflow-y-auto
              bg-slate-950/65
              p-3
              backdrop-blur-sm
            "
            onMouseDown={(event) => {
              if (
                event.target ===
                  event.currentTarget &&
                !accountSaving
              ) {
                setAccountModal(false);
                setAccountTargetRow(
                  null
                );
              }
            }}
          >
            <section
              className="
                w-full
                max-w-2xl
                overflow-hidden
                rounded-3xl
                border
                border-white/70
                bg-white
                shadow-2xl
              "
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <header
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-slate-200
                  bg-gradient-to-r
                  from-blue-50
                  to-indigo-50
                  p-5
                "
              >
                <div>
                  <h2
                    className="
                      text-2xl
                      font-black
                      text-slate-950
                    "
                  >
                    {
                      text.accountModalTitle
                    }
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    {
                      text.accountModalText
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      !accountSaving
                    ) {
                      setAccountModal(
                        false
                      );

                      setAccountTargetRow(
                        null
                      );
                    }
                  }}
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    text-red-600
                  "
                >
                  <X size={20} />
                </button>
              </header>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  p-5
                  sm:grid-cols-2
                "
              >
                <label
                  className="
                    grid
                    gap-1.5
                    text-xs
                    font-bold
                    text-slate-600
                  "
                >
                  {text.accountCode}

                  <input
                    value={
                      accountForm.account_code
                    }
                    placeholder={
                      text.autoCode
                    }
                    onChange={(event) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          account_code:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </label>

                <label
                  className="
                    grid
                    gap-1.5
                    text-xs
                    font-bold
                    text-slate-600
                  "
                >
                  {text.group}

                  <select
                    value={
                      accountForm.group_id
                    }
                    onChange={(event) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          group_id:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                    "
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

                <label
                  className="
                    grid
                    gap-1.5
                    text-xs
                    font-bold
                    text-slate-600
                    sm:col-span-2
                  "
                >
                  {text.accountTitle} *

                  <input
                    autoFocus
                    value={
                      accountForm.account_title
                    }
                    placeholder="e.g. Office Expense"
                    onChange={(event) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          account_title:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </label>

                <label
                  className="
                    grid
                    gap-1.5
                    text-xs
                    font-bold
                    text-slate-600
                    sm:col-span-2
                  "
                >
                  {
                    text.openingBalance
                  }

                  <input
                    type="number"
                    step="0.01"
                    value={
                      accountForm.opening_balance
                    }
                    placeholder="0"
                    onChange={(event) =>
                      setAccountForm(
                        (current) => ({
                          ...current,

                          opening_balance:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </label>
              </div>

              <footer
                className="
                  flex
                  justify-end
                  gap-2
                  border-t
                  border-slate-200
                  bg-slate-50
                  p-4
                "
              >
                <Button
                  className="
                    border
                    border-slate-300
                    bg-white
                    text-slate-700
                  "
                  disabled={
                    accountSaving
                  }
                  onClick={() => {
                    setAccountModal(
                      false
                    );

                    setAccountTargetRow(
                      null
                    );
                  }}
                >
                  {text.cancel}
                </Button>

                <Button
                  className="
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    text-white
                    shadow-lg
                    shadow-blue-200
                  "
                  disabled={
                    accountSaving
                  }
                  onClick={saveAccount}
                >
                  {accountSaving ? (
                    <RefreshCw
                      size={16}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <UserPlus
                      size={16}
                    />
                  )}

                  {accountSaving
                    ? text.loading
                    : text.saveAccount}
                </Button>
              </footer>
            </section>
          </div>,

          document.body
        )}
    </div>
  );
}
