import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");
const API_BASE = `${API_ROOT}/api`;

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyPayment = () => ({
  local_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  payment_date: today(),
  details: "",
  amount: "",
});

const emptyForm = () => ({
  voucher_no: "",
  payee_name: "",
  account_id: "",
  issuance_date: today(),
  clearance_date: "",
  total_amount: "",
  notes: "",
  payments: [emptyPayment()],
});

const money = (value) =>
  `₨ ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.vouchers)) return payload.vouchers;
  return [];
};

const statusMeta = (status) => {
  if (status === "cleared") {
    return {
      label: "Cleared",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "partial") {
    return {
      label: "Partially Paid",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Remaining",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
};

const dueMeta = (dateValue, status) => {
  if (status === "cleared" || !dateValue) return null;

  const due = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  const current = new Date(`${today()}T00:00:00`);
  const days = Math.round((due - current) / 86400000);

  if (days < 0) {
    return {
      text: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`,
      tone: "text-rose-600",
    };
  }

  if (days === 0) {
    return { text: "Due today", tone: "text-amber-600" };
  }

  return {
    text: `Due in ${days} day${days === 1 ? "" : "s"}`,
    tone: "text-sky-600",
  };
};

export default function ChequeVoucherPage() {
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewVoucher, setViewVoucher] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (filter !== "all") params.status = filter;
      if (search.trim()) params.search = search.trim();

      const response = await axios.get(`${API_BASE}/cheque-vouchers`, { params });
      setRecords(normalizeArray(response.data));
    } catch (requestError) {
      setRecords([]);
      setError(
        requestError.response?.data?.message ||
          "Unable to load cheque vouchers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/chart-of-accounts`);
      setAccounts(normalizeArray(response.data));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load ledger accounts. Please try again."
      );
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const timer = window.setTimeout(loadRecords, 250);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const paidInForm = useMemo(
    () =>
      form.payments.reduce((sum, row) => {
        const amount = Number(row.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [form.payments]
  );

  const formTotal = Number(form.total_amount) || 0;
  const remainingInForm = Math.max(formTotal - paidInForm, 0);

  const summary = useMemo(
    () => ({
      count: records.length,
      total: records.reduce((sum, row) => sum + Number(row.total_amount || 0), 0),
      paid: records.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0),
      remaining: records.reduce(
        (sum, row) => sum + Number(row.remaining_amount || 0),
        0
      ),
    }),
    [records]
  );

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  };

  const getVoucher = async (id) => {
    const response = await axios.get(`${API_BASE}/cheque-vouchers/${id}`);
    return response.data?.data || response.data?.voucher;
  };

  const openEdit = async (record) => {
    setError("");

    try {
      const voucher = await getVoucher(record.id);
      setEditingId(voucher.id);
      setForm({
        voucher_no: voucher.voucher_no || "",
        payee_name: voucher.payee_name || "",
        account_id: String(voucher.account_id || ""),
        issuance_date: voucher.issuance_date || today(),
        clearance_date: voucher.clearance_date || "",
        total_amount: String(voucher.total_amount || ""),
        notes: voucher.notes || "",
        payments: voucher.payments?.length
          ? voucher.payments.map((row) => ({
              ...row,
              local_id: `saved-${row.id}`,
              amount: String(row.amount || ""),
            }))
          : [emptyPayment()],
      });
      setShowForm(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load voucher details."
      );
    }
  };

  const openView = async (record) => {
    setError("");

    try {
      setViewVoucher(await getVoucher(record.id));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load voucher details."
      );
    }
  };

  const updateForm = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const updatePayment = (localId, key, value) => {
    setForm((previous) => ({
      ...previous,
      payments: previous.payments.map((row) =>
        row.local_id === localId ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addPayment = () => {
    setForm((previous) => ({
      ...previous,
      payments: [...previous.payments, emptyPayment()],
    }));
  };

  const removePayment = (localId) => {
    setForm((previous) => ({
      ...previous,
      payments:
        previous.payments.length === 1
          ? [emptyPayment()]
          : previous.payments.filter((row) => row.local_id !== localId),
    }));
  };

  const saveVoucher = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.payee_name.trim() || !form.account_id || !form.issuance_date) {
      setError("Payee, ledger account and issuance date are required.");
      return;
    }

    if (!form.clearance_date || formTotal <= 0) {
      setError("Clearance date and a valid cheque total are required.");
      return;
    }

    if (paidInForm > formTotal) {
      setError("Paid amount cannot be greater than the cheque total.");
      return;
    }

    const payments = form.payments
      .filter((row) => row.details.trim() || Number(row.amount))
      .map(({ payment_date, details, amount }) => ({
        payment_date,
        details: details.trim(),
        amount: Number(amount),
      }));

    setSaving(true);

    try {
      const payload = {
        ...form,
        account_id: Number(form.account_id),
        total_amount: formTotal,
        payments,
      };

      if (editingId) {
        await axios.put(`${API_BASE}/cheque-vouchers/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE}/cheque-vouchers`, payload);
      }

      setShowForm(false);
      flash(editingId ? "Cheque voucher updated." : "Cheque voucher saved.");
      await loadRecords();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save the cheque voucher."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteVoucher = async (record) => {
    if (!window.confirm(`Delete cheque voucher ${record.voucher_no}?`)) return;

    setError("");

    try {
      await axios.delete(`${API_BASE}/cheque-vouchers/${record.id}`);
      flash("Cheque voucher deleted.");
      await loadRecords();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete the cheque voucher."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-3 sm:px-4 sm:py-4 pb-16">
      {notice && (
        <div className="fixed bottom-4 right-4 z-[80] rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg">
          {notice}
        </div>
      )}

      <div className="mx-auto max-w-[1500px] space-y-3">
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-sky-700">
                <WalletCards size={12} /> Accounts
              </div>
              <h1 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
                Cheque Vouchers
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage issued cheques, clearance dates and payment progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadRecords}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={14} /> Refresh
              </button>

              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Plus size={15} /> New Voucher
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
              className="rounded-md p-0.5 hover:bg-rose-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <SummaryCard
            icon={<FileText />}
            label="Vouchers"
            value={summary.count}
          />
          <SummaryCard
            icon={<CircleDollarSign />}
            label="Issued Total"
            value={money(summary.total)}
          />
          <SummaryCard
            icon={<CheckCircle2 />}
            label="Paid / Cleared"
            value={money(summary.paid)}
            tone="emerald"
          />
          <SummaryCard
            icon={<CalendarClock />}
            label="Remaining"
            value={money(summary.remaining)}
            tone="rose"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2.5 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1">
              {[
                ["all", "All"],
                ["remaining", "Remaining"],
                ["cleared", "Cleared"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`h-8 rounded-md px-3 text-xs font-bold transition ${
                    filter === value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="relative block w-full md:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search voucher, payee or account..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Voucher / Payee</th>
                  <th className="px-3 py-2.5">Ledger Account</th>
                  <th className="px-3 py-2.5">Issued</th>
                  <th className="px-3 py-2.5">Clearance</th>
                  <th className="px-3 py-2.5 text-right">Total</th>
                  <th className="px-3 py-2.5 text-right">Paid</th>
                  <th className="px-3 py-2.5 text-right">Remaining</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-10 text-center text-slate-400">
                      <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                      Loading vouchers...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-10 text-center text-slate-400">
                      <WalletCards className="mx-auto mb-2 text-slate-300" size={28} />
                      <div className="font-semibold text-slate-500">No vouchers found</div>
                      <div className="mt-0.5 text-[11px]">
                        No cheque vouchers match the selected filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const status = statusMeta(record.status);
                    const due = dueMeta(record.clearance_date, record.status);

                    return (
                      <tr key={record.id} className="transition hover:bg-sky-50/40">
                        <td className="px-3 py-2.5">
                          <div className="font-extrabold text-slate-900">
                            {record.voucher_no}
                          </div>
                          <div className="mt-0.5 max-w-[220px] truncate text-[11px] text-slate-500">
                            {record.payee_name || "—"}
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="max-w-[220px] truncate font-semibold text-slate-800">
                            {record.account_title || "—"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {record.account_code || "No code"}
                          </div>
                        </td>

                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                          {formatDate(record.issuance_date)}
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="font-mono text-[11px] text-slate-700">
                            {formatDate(record.clearance_date)}
                          </div>
                          {due && (
                            <div className={`mt-0.5 text-[9px] font-bold ${due.tone}`}>
                              {due.text}
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[11px] font-bold text-slate-900">
                          {money(record.total_amount)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[11px] font-bold text-emerald-700">
                          {money(record.paid_amount)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[11px] font-bold text-rose-700">
                          {money(record.remaining_amount)}
                        </td>

                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center gap-0.5">
                            <ActionButton title="View details" onClick={() => openView(record)}>
                              <Eye size={14} />
                            </ActionButton>
                            <ActionButton title="Edit / add payment" onClick={() => openEdit(record)}>
                              <Edit3 size={14} />
                            </ActionButton>
                            <ActionButton title="Delete" danger onClick={() => deleteVoucher(record)}>
                              <Trash2 size={14} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <Modal
          title={editingId ? "Edit Cheque Voucher" : "New Cheque Voucher"}
          onClose={() => !saving && setShowForm(false)}
          wide
        >
          <form onSubmit={saveVoucher} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Voucher No" hint="Leave blank to generate automatically">
                <input
                  value={form.voucher_no}
                  onChange={(event) => updateForm("voucher_no", event.target.value)}
                  className="input"
                  placeholder="CHQ-00001"
                />
              </Field>

              <Field label="Payee / Party Name" required>
                <input
                  value={form.payee_name}
                  onChange={(event) => updateForm("payee_name", event.target.value)}
                  className="input"
                  placeholder="Enter payee name"
                />
              </Field>

              <Field
                label="Ledger Account"
                required
                hint="The amount is deducted from this ledger on the issuance date"
              >
                <select
                  value={form.account_id}
                  onChange={(event) => updateForm("account_id", event.target.value)}
                  className="input"
                >
                  <option value="">Select ledger account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {[account.account_code, account.account_title]
                        .filter(Boolean)
                        .join(" - ")}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Issuance Date" required>
                <input
                  type="date"
                  value={form.issuance_date}
                  onChange={(event) => updateForm("issuance_date", event.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Clearance Date" required>
                <input
                  type="date"
                  min={form.issuance_date || undefined}
                  value={form.clearance_date}
                  onChange={(event) => updateForm("clearance_date", event.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Cheque Total" required>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.total_amount}
                  onChange={(event) => updateForm("total_amount", event.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                className="input min-h-16 resize-y"
                placeholder="Optional voucher notes"
              />
            </Field>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Payment / Clearance Details
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Add another row whenever a payment is cleared.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPayment}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-sky-100 px-2.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-200"
                >
                  <Plus size={13} /> Add Row
                </button>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full min-w-[680px] text-xs">
                  <thead className="text-left text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="w-44 px-2 py-1.5">Date</th>
                      <th className="px-2 py-1.5">Details</th>
                      <th className="w-48 px-2 py-1.5">Amount</th>
                      <th className="w-10 px-2 py-1.5" />
                    </tr>
                  </thead>

                  <tbody>
                    {form.payments.map((row) => (
                      <tr key={row.local_id}>
                        <td className="p-1.5">
                          <input
                            type="date"
                            value={row.payment_date}
                            onChange={(event) =>
                              updatePayment(row.local_id, "payment_date", event.target.value)
                            }
                            className="input"
                          />
                        </td>

                        <td className="p-1.5">
                          <input
                            value={row.details}
                            onChange={(event) =>
                              updatePayment(row.local_id, "details", event.target.value)
                            }
                            className="input"
                            placeholder="Payment / clearance detail"
                          />
                        </td>

                        <td className="p-1.5">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={row.amount}
                            onChange={(event) =>
                              updatePayment(row.local_id, "amount", event.target.value)
                            }
                            className="input text-right font-mono"
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-1.5">
                          <button
                            type="button"
                            onClick={() => removePayment(row.local_id)}
                            className="rounded-md p-1.5 text-rose-500 transition hover:bg-rose-50"
                            aria-label="Remove payment row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 rounded-xl bg-slate-900 p-3 text-white sm:grid-cols-3">
              <Total label="Cheque Total" value={money(formTotal)} />
              <Total label="Paid" value={money(paidInForm)} tone="text-emerald-300" />
              <Total
                label="Remaining Balance"
                value={money(remainingInForm)}
                tone="text-amber-300"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Save size={15} />
                )}
                {editingId ? "Update Voucher" : "Save Voucher"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewVoucher && (
        <Modal
          title={`Cheque Voucher ${viewVoucher.voucher_no}`}
          onClose={() => setViewVoucher(null)}
          wide
        >
          <VoucherDetails voucher={viewVoucher} />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setViewVoucher(null)}
              className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                setViewVoucher(null);
                openEdit(viewVoucher);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              <Edit3 size={14} /> Edit / Add Payment
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const SummaryCard = ({ icon, label, value, tone = "sky" }) => {
  const colors = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="flex min-h-[78px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[tone]}`}
      >
        {React.cloneElement(icon, { size: 17 })}
      </div>

      <div className="min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm font-extrabold text-slate-900 sm:text-base">
          {value}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ children, title, onClick, danger = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-md p-1.5 transition ${
      danger
        ? "text-rose-600 hover:bg-rose-50"
        : "text-slate-500 hover:bg-sky-50 hover:text-sky-700"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, hint, required, children }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-600">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}
  </label>
);

const Total = ({ label, value, tone = "text-white" }) => (
  <div className="min-w-0">
    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className={`mt-0.5 truncate font-mono text-sm font-extrabold sm:text-base ${tone}`}>
      {value}
    </div>
  </div>
);

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-2.5 backdrop-blur-sm sm:p-4">
    <div
      className={`max-h-[94vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
        wide ? "max-w-5xl" : "max-w-2xl"
      }`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4">{children}</div>
    </div>
  </div>
);

const VoucherDetails = ({ voucher }) => {
  const status = statusMeta(voucher.status);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Detail label="Voucher No" value={voucher.voucher_no} />
        <Detail label="Payee" value={voucher.payee_name} />
        <Detail
          label="Ledger Account"
          value={[voucher.account_code, voucher.account_title]
            .filter(Boolean)
            .join(" - ")}
        />
        <Detail label="Status" value={status.label} />
        <Detail label="Issuance Date" value={formatDate(voucher.issuance_date)} />
        <Detail label="Clearance Date" value={formatDate(voucher.clearance_date)} />
        <Detail label="Cheque Total" value={money(voucher.total_amount)} />
        <Detail label="Paid Amount" value={money(voucher.paid_amount)} />
        <Detail label="Remaining" value={money(voucher.remaining_amount)} />
        <Detail label="Payment Rows" value={voucher.payments?.length || 0} />
      </div>

      {voucher.notes && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          <strong className="text-slate-800">Notes:</strong> {voucher.notes}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
          All Payment / Clearance Details
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="bg-white text-left text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {voucher.payments?.length ? (
                voucher.payments.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                      {formatDate(row.payment_date)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.details || "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11px] font-bold text-slate-900">
                      {money(row.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-3 py-8 text-center text-slate-400">
                    No payment entries have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-3 text-white md:grid-cols-4">
        <Total label="Total" value={money(voucher.total_amount)} />
        <Total label="Paid" value={money(voucher.paid_amount)} tone="text-emerald-300" />
        <Total
          label="Remaining"
          value={money(voucher.remaining_amount)}
          tone="text-amber-300"
        />
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Status
          </div>
          <span
            className={`mt-1 inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-0.5 truncate text-xs font-semibold text-slate-800">
      {value === 0 ? 0 : value || "—"}
    </div>
  </div>
);
