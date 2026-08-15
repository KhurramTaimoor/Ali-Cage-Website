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
    return { label: "Cleared", className: "bg-emerald-100 text-emerald-700" };
  }
  if (status === "partial") {
    return { label: "Partially Paid", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Remaining", className: "bg-rose-100 text-rose-700" };
};

const dueMeta = (dateValue, status) => {
  if (status === "cleared" || !dateValue) return null;
  const due = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  const current = new Date(`${today()}T00:00:00`);
  const days = Math.round((due - current) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)} day overdue`, tone: "text-rose-700" };
  if (days === 0) return { text: "Due today", tone: "text-amber-700" };
  return { text: `Due in ${days} day${days === 1 ? "" : "s"}`, tone: "text-sky-700" };
};

export default function ChequeVoucherPage() {
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filter, setFilter] = useState("remaining");
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
      setError(requestError.response?.data?.message || "Cheque vouchers load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/chart-of-accounts`);
      setAccounts(normalizeArray(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Ledger accounts load nahi ho sake.");
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
      setError(requestError.response?.data?.message || "Voucher details load nahi ho sakin.");
    }
  };

  const openView = async (record) => {
    setError("");
    try {
      setViewVoucher(await getVoucher(record.id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Voucher details load nahi ho sakin.");
    }
  };

  const updateForm = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const updatePayment = (localId, key, value) => {
    setForm((previous) => ({
      ...previous,
      payments: previous.payments.map((row) =>
        row.local_id === localId ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addPayment = () =>
    setForm((previous) => ({
      ...previous,
      payments: [...previous.payments, emptyPayment()],
    }));

  const removePayment = (localId) =>
    setForm((previous) => ({
      ...previous,
      payments:
        previous.payments.length === 1
          ? [emptyPayment()]
          : previous.payments.filter((row) => row.local_id !== localId),
    }));

  const saveVoucher = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.payee_name.trim() || !form.account_id || !form.issuance_date) {
      setError("Payee, ledger account aur issuance date zaroori hain.");
      return;
    }
    if (!form.clearance_date || formTotal <= 0) {
      setError("Clearance date aur valid total amount zaroori hai.");
      return;
    }
    if (paidInForm > formTotal) {
      setError("Paid amount cheque total se zyada nahi ho sakta.");
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
      flash(editingId ? "Cheque voucher update ho gaya." : "Cheque voucher save ho gaya.");
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Voucher save nahi ho saka.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVoucher = async (record) => {
    if (!window.confirm(`${record.voucher_no} delete karna hai?`)) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/cheque-vouchers/${record.id}`);
      flash("Cheque voucher delete ho gaya.");
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Voucher delete nahi ho saka.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 sm:p-6 pb-20">
      {notice && (
        <div className="fixed z-[80] right-5 bottom-5 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {notice}
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-3xl border border-sky-100 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                <WalletCards size={14} /> Accounts
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Cheque Vouchers</h1>
              <p className="mt-1 text-sm text-slate-500">
                Issued cheques, clearance schedules aur payment progress manage karein.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadRecords}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sky-700"
              >
                <Plus size={17} /> New Cheque Voucher
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Close error">
              <X size={17} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={<FileText />} label="Vouchers" value={summary.count} />
          <SummaryCard icon={<CircleDollarSign />} label="Issued Total" value={money(summary.total)} />
          <SummaryCard icon={<CheckCircle2 />} label="Paid / Cleared" value={money(summary.paid)} tone="emerald" />
          <SummaryCard icon={<CalendarClock />} label="Remaining" value={money(summary.remaining)} tone="rose" />
        </section>

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-wrap gap-2">
              {[
                ["remaining", "Remaining"],
                ["cleared", "Cleared"],
                ["all", "All"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    filter === value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="relative block w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Voucher, payee ya account search..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Voucher / Payee</th>
                  <th className="px-5 py-4">Ledger Account</th>
                  <th className="px-5 py-4">Issued</th>
                  <th className="px-5 py-4">Clearance</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-right">Paid</th>
                  <th className="px-5 py-4 text-right">Remaining</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-5 py-14 text-center text-slate-400">
                      <Loader2 className="mx-auto mb-2 animate-spin" /> Loading vouchers...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-5 py-14 text-center text-slate-400">
                      <WalletCards className="mx-auto mb-3" size={34} />
                      Is filter mein koi cheque voucher nahi mila.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const status = statusMeta(record.status);
                    const due = dueMeta(record.clearance_date, record.status);
                    return (
                      <tr key={record.id} className="hover:bg-sky-50/40">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-900">{record.voucher_no}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{record.payee_name}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{record.account_title || "—"}</div>
                          <div className="text-xs text-slate-400">{record.account_code || "No code"}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-600">
                          {formatDate(record.issuance_date)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-mono text-xs text-slate-700">{formatDate(record.clearance_date)}</div>
                          {due && <div className={`mt-1 text-[11px] font-bold ${due.tone}`}>{due.text}</div>}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">{money(record.total_amount)}</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700">{money(record.paid_amount)}</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-rose-700">{money(record.remaining_amount)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton title="View" onClick={() => openView(record)}><Eye size={16} /></ActionButton>
                            <ActionButton title="Edit / add payment" onClick={() => openEdit(record)}><Edit3 size={16} /></ActionButton>
                            <ActionButton title="Delete" danger onClick={() => deleteVoucher(record)}><Trash2 size={16} /></ActionButton>
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
        <Modal title={editingId ? "Edit Cheque Voucher" : "New Cheque Voucher"} onClose={() => !saving && setShowForm(false)} wide>
          <form onSubmit={saveVoucher} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Voucher No" hint="Blank chhorain to auto generate hoga">
                <input value={form.voucher_no} onChange={(e) => updateForm("voucher_no", e.target.value)} className="input" placeholder="CHQ-00001" />
              </Field>
              <Field label="Payee / Party Name" required>
                <input value={form.payee_name} onChange={(e) => updateForm("payee_name", e.target.value)} className="input" placeholder="Cheque kis ko issue hua" />
              </Field>
              <Field label="Ledger Account" required hint="Issuance date par isi ledger se amount deduct hoga">
                <select value={form.account_id} onChange={(e) => updateForm("account_id", e.target.value)} className="input">
                  <option value="">Select ledger account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {[account.account_code, account.account_title].filter(Boolean).join(" - ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Issuance Date" required>
                <input type="date" value={form.issuance_date} onChange={(e) => updateForm("issuance_date", e.target.value)} className="input" />
              </Field>
              <Field label="Clearance Date" required>
                <input type="date" min={form.issuance_date || undefined} value={form.clearance_date} onChange={(e) => updateForm("clearance_date", e.target.value)} className="input" />
              </Field>
              <Field label="Cheque Total" required>
                <input type="number" min="0.01" step="0.01" value={form.total_amount} onChange={(e) => updateForm("total_amount", e.target.value)} className="input" placeholder="0.00" />
              </Field>
            </div>

            <Field label="Notes">
              <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} className="input min-h-20 resize-y" placeholder="Optional voucher notes" />
            </Field>

            <div className="rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <h3 className="font-extrabold text-slate-900">Payment / Clearance Details</h3>
                  <p className="text-xs text-slate-500">Payment clear hoti jaye to edit mein nayi row add karein.</p>
                </div>
                <button type="button" onClick={addPayment} className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-200">
                  <Plus size={15} /> Add Row
                </button>
              </div>

              <div className="overflow-x-auto p-3">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-2 py-2 w-44">Date</th>
                      <th className="px-2 py-2">Details</th>
                      <th className="px-2 py-2 w-48">Amount</th>
                      <th className="px-2 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.payments.map((row) => (
                      <tr key={row.local_id}>
                        <td className="p-2"><input type="date" value={row.payment_date} onChange={(e) => updatePayment(row.local_id, "payment_date", e.target.value)} className="input" /></td>
                        <td className="p-2"><input value={row.details} onChange={(e) => updatePayment(row.local_id, "details", e.target.value)} className="input" placeholder="Payment / clearance detail" /></td>
                        <td className="p-2"><input type="number" min="0.01" step="0.01" value={row.amount} onChange={(e) => updatePayment(row.local_id, "amount", e.target.value)} className="input text-right font-mono" placeholder="0.00" /></td>
                        <td className="p-2"><button type="button" onClick={() => removePayment(row.local_id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" aria-label="Remove row"><Trash2 size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-900 p-4 text-white sm:grid-cols-3">
              <Total label="Cheque Total" value={money(formTotal)} />
              <Total label="Paid" value={money(paidInForm)} tone="text-emerald-300" />
              <Total label="Remaining Balance" value={money(remainingInForm)} tone="text-amber-300" />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                {editingId ? "Update Voucher" : "Save Voucher"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewVoucher && (
        <Modal title={`Cheque Voucher ${viewVoucher.voucher_no}`} onClose={() => setViewVoucher(null)} wide>
          <VoucherDetails voucher={viewVoucher} />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setViewVoucher(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Close</button>
            <button type="button" onClick={() => { setViewVoucher(null); openEdit(viewVoucher); }} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white">
              <Edit3 size={16} /> Edit / Add Payment
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const SummaryCard = ({ icon, label, value, tone = "sky" }) => {
  const colors = {
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}>{React.cloneElement(icon, { size: 19 })}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
};

const ActionButton = ({ children, title, onClick, danger = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-lg p-2 transition ${danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-500 hover:bg-sky-50 hover:text-sky-700"}`}
  >
    {children}
  </button>
);

const Field = ({ label, hint, required, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
  </label>
);

const Total = ({ label, value, tone = "text-white" }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
    <div className={`mt-1 font-mono text-xl font-extrabold ${tone}`}>{value}</div>
  </div>
);

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
    <div className={`max-h-[94vh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${wide ? "max-w-6xl" : "max-w-2xl"}`}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal"><X size={20} /></button>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  </div>
);

const VoucherDetails = ({ voucher }) => {
  const status = statusMeta(voucher.status);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Payee" value={voucher.payee_name} />
        <Detail label="Ledger Account" value={[voucher.account_code, voucher.account_title].filter(Boolean).join(" - ")} />
        <Detail label="Issuance Date" value={formatDate(voucher.issuance_date)} />
        <Detail label="Clearance Date" value={formatDate(voucher.clearance_date)} />
      </div>
      {voucher.notes && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><strong className="text-slate-800">Notes:</strong> {voucher.notes}</div>}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Details</th><th className="px-4 py-3 text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {voucher.payments?.length ? voucher.payments.map((row) => (
              <tr key={row.id}><td className="px-4 py-3 font-mono text-xs">{formatDate(row.payment_date)}</td><td className="px-4 py-3">{row.details}</td><td className="px-4 py-3 text-right font-mono font-bold">{money(row.amount)}</td></tr>
            )) : <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">Abhi koi payment row add nahi hui.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-900 p-4 text-white sm:grid-cols-4">
        <Total label="Total" value={money(voucher.total_amount)} />
        <Total label="Paid" value={money(voucher.paid_amount)} tone="text-emerald-300" />
        <Total label="Remaining" value={money(voucher.remaining_amount)} tone="text-amber-300" />
        <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</div><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span></div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
    <div className="mt-1 font-semibold text-slate-800">{value || "—"}</div>
  </div>
);
