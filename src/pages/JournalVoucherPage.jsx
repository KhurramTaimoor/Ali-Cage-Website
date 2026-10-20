import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { oneMonthRange, todayIso } from "../utils/dateDefaults";

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;
const money = (value) => Number(value || 0).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const types = ["customer", "supplier", "employee", "general"];
const emptyLine = () => ({ account_type: "", account_id: "", description: "", debit: "", credit: "" });
const emptyForm = () => ({ voucher_no: "", voucher_date: todayIso(), narration: "", lines: [emptyLine(), emptyLine()] });
const safe = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const dateOnly = (v) => String(v || "").slice(0, 10);
const normalizeType = (v) => types.includes(String(v || "").toLowerCase()) ? String(v).toLowerCase() : "general";
const typeLabel = (value) => ({ customer: "Customer", supplier: "Supplier", employee: "Employee", general: "General Account" }[value] || "General Account");
const lineTotal = (lines, side) => (lines || []).reduce((sum, line) => sum + Number(line[side] || 0), 0);

const LANG = {
  en: {
    title: "Journal Voucher", subtitle: "Account-wise double-entry vouchers and date-wise report",
    new: "New Voucher", edit: "Edit Voucher", voucher: "Voucher No", date: "Date",
    debitAccount: "Debit Account", creditAccount: "Credit Account", note: "Note", actions: "Action", accountType: "Account Type",
    account: "Account Name", description: "Line Note", debit: "Debit", credit: "Credit", addRow: "+ Add Rows",
    save: "Save Voucher", update: "Update Voucher", cancel: "Cancel", editBtn: "Edit", deleteBtn: "Delete",
    from: "From Date", to: "To Date", report: "Show Report", reset: "Reset Dates", print: "Print Report",
    search: "Search voucher, account or note...", noRows: "No vouchers found for this period.",
    selectType: "Select Account Type", selectAccount: "Select Account Name", total: "Total",
    balanced: "Balanced", notBalanced: "Debit and Credit must be equal and greater than zero.",
    formError: "Enter a date and at least two complete, balanced lines.",
    deleteConfirm: "Delete this voucher?", loading: "Loading vouchers...", language: "اردو",
    vouchers: "Vouchers", totalDebit: "Total Debit", totalCredit: "Total Credit", reportTitle: "Date-wise JV Report",
    applyHint: "Select the date range to view its Journal Voucher report.", empty: "No account names available for this type.",
    autoNo: "Auto-generated on save",
  },
  ur: {
    title: "جرنل واؤچر", subtitle: "اکاؤنٹ کے مطابق ڈبل انٹری اور تاریخ وار رپورٹ",
    new: "نیا واؤچر", edit: "واؤچر میں ترمیم", voucher: "واؤچر نمبر", date: "تاریخ",
    debitAccount: "ڈیبٹ اکاؤنٹ", creditAccount: "کریڈٹ اکاؤنٹ", note: "نوٹ", actions: "ایکشن", accountType: "اکاؤنٹ ٹائپ",
    account: "اکاؤنٹ نام", description: "لائن کی تفصیل", debit: "ڈیبٹ", credit: "کریڈٹ", addRow: "+ قطار شامل کریں",
    save: "واؤچر محفوظ کریں", update: "واؤچر اپڈیٹ کریں", cancel: "منسوخ", editBtn: "ترمیم", deleteBtn: "حذف",
    from: "شروع کی تاریخ", to: "آخری تاریخ", report: "رپورٹ دیکھیں", reset: "تاریخ ری سیٹ", print: "رپورٹ پرنٹ کریں",
    search: "واؤچر، اکاؤنٹ یا نوٹ تلاش کریں...", noRows: "اس تاریخ میں کوئی واؤچر نہیں ملا۔",
    selectType: "اکاؤنٹ ٹائپ منتخب کریں", selectAccount: "اکاؤنٹ منتخب کریں", total: "کل",
    balanced: "برابر", notBalanced: "ڈیبٹ اور کریڈٹ برابر اور صفر سے زیادہ ہونے چاہئیں۔",
    formError: "تاریخ اور کم از کم دو مکمل، برابر لائنیں درج کریں۔",
    deleteConfirm: "کیا یہ واؤچر حذف کرنا ہے؟", loading: "واؤچر لوڈ ہو رہے ہیں...", language: "English",
    vouchers: "واؤچرز", totalDebit: "کل ڈیبٹ", totalCredit: "کل کریڈٹ", reportTitle: "تاریخ وار جرنل واؤچر رپورٹ",
    applyHint: "تاریخ منتخب کرکے جرنل واؤچر رپورٹ دیکھیں۔", empty: "اس ٹائپ میں کوئی اکاؤنٹ نہیں۔",
    autoNo: "محفوظ کرنے پر نمبر خود بنے گا",
  },
};

export default function JournalVoucherPage() {
  const [lang, setLang] = useState("en");
  const ur = lang === "ur";
  const t = LANG[lang];
  const [accounts, setAccounts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [dates, setDates] = useState(() => oneMonthRange());
  const [appliedDates, setAppliedDates] = useState(() => oneMonthRange());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [numberLoading, setNumberLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (filterDates = appliedDates) => {
    setLoading(true);
    setMessage("");
    try {
      const [vRes, aRes] = await Promise.all([
        axios.get(`${API_BASE}/journal-vouchers/report`, { params: filterDates }),
        axios.get(`${API_BASE}/journal-vouchers/accounts`),
      ]);
      setVouchers(Array.isArray(vRes.data?.data) ? vRes.data.data : []);
      setAccounts(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || "Report loading failed.");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, [appliedDates]);

  useEffect(() => { load(); }, [load]);

  const accountGroups = useMemo(() => {
    const byType = { customer: [], supplier: [], employee: [], general: [] };
    accounts.forEach((account) => {
      if (byType[account.account_type]) byType[account.account_type].push(account);
    });
    return byType;
  }, [accounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vouchers;
    return vouchers.filter((row) => [row.voucher_no, row.voucher_date, row.narration,
      ...(row.lines || []).flatMap((line) => [line.account_title, line.account_type, line.description])]
      .join(" ").toLowerCase().includes(q));
  }, [search, vouchers]);

  const totals = useMemo(() => ({
    debit: lineTotal(form.lines, "debit"),
    credit: lineTotal(form.lines, "credit"),
  }), [form.lines]);
  const balanced = totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.01;
  const reportTotals = useMemo(() => filtered.reduce((acc, row) => {
    const lines = row.lines || [];
    acc.debit += lineTotal(lines, "debit");
    acc.credit += lineTotal(lines, "credit");
    return acc;
  }, { debit: 0, credit: 0 }), [filtered]);

  const applyReport = (event) => {
    event.preventDefault();
    if (dates.from_date && dates.to_date && dates.from_date > dates.to_date) {
      setMessage(ur ? "آخری تاریخ شروع کی تاریخ سے پہلے نہیں ہو سکتی۔" : "To Date must be after From Date.");
      return;
    }
    setAppliedDates({ ...dates });
  };
  const resetReport = () => {
    const fresh = oneMonthRange();
    setDates(fresh);
    setAppliedDates(fresh);
    setSearch("");
  };

  const updateLine = (index, field, value) => {
    setForm(prev => ({ ...prev, lines: prev.lines.map((line, i) => {
      if (i !== index) return line;
      if (field === "account_type") return { ...line, account_type: value, account_id: "" };
      if (field === "debit") return { ...line, debit: value, ...(Number(value) > 0 ? { credit: "" } : {}) };
      if (field === "credit") return { ...line, credit: value, ...(Number(value) > 0 ? { debit: "" } : {}) };
      return { ...line, [field]: value };
    }) }));
  };

  const openNew = async () => {
    setForm(emptyForm());
    setEditingId(null);
    setMessage("");
    setShowForm(true);
    setNumberLoading(true);
    try {
      const result = await axios.get(`${API_BASE}/journal-vouchers/next-number`);
      // A preview is informative only; the server assigns the final number on Save.
      setForm(prev => prev.voucher_no ? prev : { ...prev, voucher_no: result.data?.voucher_no || "" });
    } catch (_error) {
      // Saving works even if a next-number preview cannot be loaded.
    } finally { setNumberLoading(false); }
  };
  const openEdit = (voucher) => {
    const lines = (voucher.lines || []).map((line) => ({
      account_type: normalizeType(line.account_type), account_id: String(line.account_id || ""),
      description: line.description || "", debit: Number(line.debit || 0) ? String(line.debit) : "",
      credit: Number(line.credit || 0) ? String(line.credit) : "",
    }));
    setForm({ voucher_no: voucher.voucher_no || "", voucher_date: dateOnly(voucher.voucher_date) || todayIso(),
      narration: voucher.narration || "", lines: lines.length >= 2 ? lines : [emptyLine(), emptyLine()] });
    setEditingId(voucher.id);
    setMessage("");
    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const filled = form.lines.filter(line => line.account_id || line.debit || line.credit || line.description);
    const validLines = filled.length >= 2 && filled.every(line => {
      if (!line.account_type || !line.account_id || !accountGroups[line.account_type]?.some(a => String(a.id) === String(line.account_id))) return false;
      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);
      return Number.isFinite(debit) && Number.isFinite(credit) && debit >= 0 && credit >= 0 && (debit > 0) !== (credit > 0);
    });
    if (!form.voucher_date || !balanced || !validLines) {
      setMessage(t.formError);
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      const payload = { ...form, lines: filled.map(line => ({ ...line, debit: Number(line.debit || 0), credit: Number(line.credit || 0) })) };
      if (!editingId) delete payload.voucher_no; // server is the authority for JV numbering
      if (editingId) await axios.put(`${API_BASE}/journal-vouchers/${editingId}`, payload);
      else await axios.post(`${API_BASE}/journal-vouchers`, payload);
      setShowForm(false);
      await load(appliedDates);
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.response?.data?.message || "Could not save voucher.");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try { await axios.delete(`${API_BASE}/journal-vouchers/${id}`); await load(appliedDates); }
    catch (err) { setMessage(err?.response?.data?.error || "Could not delete voucher."); }
  };

  const accountSide = (row, side, asHtml = false) => {
    const matching = (row.lines || []).filter(line => Number(line[side] || 0) > 0);
    if (!matching.length) return asHtml ? "—" : [];
    return asHtml ? matching.map(line => `${safe(line.account_title || `Account #${line.account_id}`)} <small>(${safe(typeLabel(line.account_type))})</small> — Rs. ${money(line[side])}`).join("<br/>")
      : matching;
  };

  const printReport = () => {
    const body = filtered.map((row, index) => `<tr><td>${index + 1}</td><td>${safe(row.voucher_no)}</td><td>${safe(dateOnly(row.voucher_date))}</td><td>${accountSide(row, "debit", true)}</td><td>${accountSide(row, "credit", true)}</td><td>${safe(row.narration || "-")}</td></tr>`).join("");
    const reportHtml = `<!doctype html><html lang="${lang}" dir="${ur ? "rtl" : "ltr"}"><head><meta charset="UTF-8"/><title>${safe(t.reportTitle)}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,"Noto Naskh Arabic","Segoe UI",sans-serif;padding:20px;color:#0f172a}h1{font-size:22px;margin:0 0 8px}.range{margin:0 0 20px;color:#64748b}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #cbd5e1;padding:9px;text-align:start;vertical-align:top}th{background:#e2e8f0}small{color:#64748b}.summary{margin-top:16px;display:flex;gap:28px;font-weight:bold}@page{size:A4 landscape;margin:12mm}@media print{body{padding:0}}
      </style></head><body><h1>${safe(t.reportTitle)}</h1><p class="range">${safe(t.from)}: ${safe(appliedDates.from_date || "—")} &nbsp; ${safe(t.to)}: ${safe(appliedDates.to_date || "—")}</p>
      <table><thead><tr><th>#</th><th>${safe(t.voucher)}</th><th>${safe(t.date)}</th><th>${safe(t.debitAccount)}</th><th>${safe(t.creditAccount)}</th><th>${safe(t.note)}</th></tr></thead><tbody>${body || `<tr><td colspan="6">${safe(t.noRows)}</td></tr>`}</tbody></table>
      <div class="summary"><span>${safe(t.vouchers)}: ${filtered.length}</span><span>${safe(t.totalDebit)}: Rs. ${money(reportTotals.debit)}</span><span>${safe(t.totalCredit)}: Rs. ${money(reportTotals.credit)}</span></div><script>window.onload=()=>window.print();<\/script></body></html>`;
    const win = window.open("", "_blank", "width=1200,height=850");
    if (!win) return;
    win.document.open(); win.document.write(reportHtml); win.document.close();
  };

  return <div dir={ur ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 p-3 sm:p-6 text-slate-800">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div><h1 className="text-2xl font-black">{t.title}</h1><p className="text-sm text-slate-500">{t.subtitle}</p></div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => setLang(ur ? "en" : "ur")} className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-100">{t.language}</button>
          <button type="button" onClick={openNew} className="px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-semibold">{t.new}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap gap-2 items-baseline justify-between mb-4">
          <h2 className="font-bold text-lg">{t.reportTitle}</h2><span className="text-xs text-slate-500">{t.applyHint}</span>
        </div>
        <form onSubmit={applyReport} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[170px]"><label className="text-xs font-bold text-slate-600 block mb-1">{t.from}</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5" value={dates.from_date} onChange={e => setDates(d => ({ ...d, from_date: e.target.value }))} /></div>
          <div className="flex-1 min-w-[170px]"><label className="text-xs font-bold text-slate-600 block mb-1">{t.to}</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5" value={dates.to_date} onChange={e => setDates(d => ({ ...d, to_date: e.target.value }))} /></div>
          <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg px-5 py-2.5">{t.report}</button>
          <button type="button" onClick={resetReport} className="border border-slate-200 rounded-lg px-4 py-2.5 bg-white">{t.reset}</button>
          <button type="button" disabled={loading || !filtered.length} onClick={printReport} className="border border-slate-200 rounded-lg px-4 py-2.5 bg-white disabled:opacity-50">{t.print}</button>
        </form>
      </div>

      {message && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[[t.vouchers, filtered.length], [t.totalDebit, `Rs. ${money(reportTotals.debit)}`], [t.totalCredit, `Rs. ${money(reportTotals.credit)}`]].map(([label, value]) =>
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm"><div className="text-xs text-slate-500 mb-1">{label}</div><div className="text-xl font-extrabold">{value}</div></div>)}
      </div>
      <div className="flex justify-between items-center gap-3 mb-3"><h3 className="font-bold">{t.reportTitle}</h3><input value={search} onChange={e => setSearch(e.target.value)} className="bg-white border rounded-lg px-3 py-2 text-sm w-full max-w-[340px]" placeholder={t.search} /></div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-900 text-white"><tr>
          <th className="p-3 text-center w-12">#</th><th className="p-3 text-start">{t.voucher}</th><th className="p-3 text-start">{t.date}</th><th className="p-3 text-start">{t.debitAccount}</th><th className="p-3 text-start">{t.creditAccount}</th><th className="p-3 text-start">{t.note}</th><th className="p-3 text-center">{t.actions}</th>
        </tr></thead><tbody>
          {loading ? <tr><td colSpan={7} className="p-10 text-center text-slate-400">{t.loading}</td></tr>
            : filtered.length === 0 ? <tr><td colSpan={7} className="p-10 text-center text-slate-400">{t.noRows}</td></tr>
            : filtered.map((row, index) => <tr key={row.id} className="border-t align-top hover:bg-slate-50">
              <td className="p-3 text-center text-slate-400">{index + 1}</td>
              <td className="p-3 font-bold whitespace-nowrap">{row.voucher_no}</td>
              <td className="p-3 whitespace-nowrap">{dateOnly(row.voucher_date)}</td>
              {[["debit", "text-emerald-700"], ["credit", "text-rose-700"]].map(([side, tone]) => <td key={side} className="p-3">
                {accountSide(row, side).map((line, i) => <div key={line.id || i} className="mb-2 last:mb-0">
                  <div className="font-semibold">{line.account_title || `Account #${line.account_id}`}</div>
                  <div className={`text-xs ${tone}`}>{typeLabel(line.account_type)} · Rs. {money(line[side])}</div>
                </div>)}
              </td>)}
              <td className="p-3 max-w-[240px] break-words">{row.narration || "—"}</td>
              <td className="p-3 text-center whitespace-nowrap"><button type="button" onClick={() => openEdit(row)} className="px-2 py-1 font-semibold text-violet-700 hover:underline">{t.editBtn}</button><button type="button" onClick={() => remove(row.id)} className="px-2 py-1 font-semibold text-red-600 hover:underline">{t.deleteBtn}</button></td>
            </tr>)}
        </tbody></table></div>
      </div>
    </div>

    {showForm && <div className="erp-entry-page fixed inset-0 z-50 bg-slate-900/60 p-2 sm:p-4 flex items-center justify-center"><div className="erp-entry-toolbar"><div className="erp-entry-toolbar-title"><strong>{editingId ? "Edit Journal Voucher" : "New Journal Voucher"}</strong><small>Full-page form • All original fields preserved</small></div><button type="button" className="erp-back-to-list" onClick={() => setShowForm(false)}>← Back to List</button></div>
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-black">{editingId ? t.edit : t.new}</h2>
          <button type="button" onClick={() => setShowForm(false)} className="text-2xl text-slate-500 hover:text-slate-900" aria-label="Close">×</button>
        </div>
        <form onSubmit={save} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div><label className="text-xs font-bold block mb-1">{t.voucher}</label><input readOnly value={form.voucher_no || (numberLoading ? "..." : t.autoNo)} className="w-full border rounded-lg px-3 py-2.5 bg-slate-50 text-slate-700 cursor-default" />{!editingId && <small className="text-slate-500">{t.autoNo}</small>}</div>
            <div><label className="text-xs font-bold block mb-1">{t.date}</label><input required type="date" value={form.voucher_date} onChange={e => setForm(f => ({ ...f, voucher_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2.5" /></div>
            <div><label className="text-xs font-bold block mb-1">{t.note}</label><input value={form.narration} onChange={e => setForm(f => ({ ...f, narration: e.target.value }))} className="w-full border rounded-lg px-3 py-2.5" /></div>
          </div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-bold">{t.debitAccount} / {t.creditAccount}</h3>
            <button type="button" onClick={() => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))} className="px-4 py-2 rounded-lg bg-violet-50 border border-violet-200 text-violet-800 font-semibold hover:bg-violet-100">{t.addRow}</button>
          </div>
          <div className="overflow-x-auto border rounded-xl"><table className="w-full min-w-[950px] text-sm"><thead className="bg-slate-100"><tr>
            <th className="p-2 w-10">#</th><th className="p-2 text-start">{t.accountType}</th><th className="p-2 text-start">{t.account}</th><th className="p-2 text-start">{t.description}</th><th className="p-2 text-end">{t.debit}</th><th className="p-2 text-end">{t.credit}</th><th className="p-2 w-10"></th>
          </tr></thead><tbody>
            {form.lines.map((line, index) => <tr key={index} className="border-t"><td className="p-2 text-center text-slate-400">{index + 1}</td>
              <td className="p-2"><select value={line.account_type} onChange={e => updateLine(index, "account_type", e.target.value)} className="w-full border rounded px-2 py-2.5"><option value="">{t.selectType}</option>{types.map(type => <option key={type} value={type}>{typeLabel(type)}</option>)}</select></td>
              <td className="p-2"><select disabled={!line.account_type} value={line.account_id} onChange={e => updateLine(index, "account_id", e.target.value)} className="w-full border rounded px-2 py-2.5 disabled:bg-slate-50"><option value="">{t.selectAccount}</option>{(accountGroups[line.account_type] || []).map(a => <option key={`${a.account_type}-${a.id}`} value={a.id}>{a.account_title}</option>)}</select>{line.account_type && !(accountGroups[line.account_type] || []).length && <small className="text-amber-700">{t.empty}</small>}</td>
              <td className="p-2"><input value={line.description} onChange={e => updateLine(index, "description", e.target.value)} className="w-full border rounded px-2 py-2.5" /></td>
              <td className="p-2"><input type="number" min="0" step="0.01" value={line.debit} onChange={e => updateLine(index, "debit", e.target.value)} className="w-full border rounded px-2 py-2.5 text-right" /></td>
              <td className="p-2"><input type="number" min="0" step="0.01" value={line.credit} onChange={e => updateLine(index, "credit", e.target.value)} className="w-full border rounded px-2 py-2.5 text-right" /></td>
              <td className="p-2 text-center"><button type="button" disabled={form.lines.length <= 2} onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== index) }))} className="text-red-600 disabled:opacity-30" title="Remove line">×</button></td>
            </tr>)}
          </tbody><tfoot className="bg-slate-50 font-bold"><tr><td colSpan={4} className="p-3 text-end">{t.total}</td><td className="p-3 text-end font-mono">{money(totals.debit)}</td><td className="p-3 text-end font-mono">{money(totals.credit)}</td><td></td></tr></tfoot></table></div>
          <div className={`inline-block mt-3 px-3 py-2 rounded-lg text-sm font-bold ${balanced ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{balanced ? t.balanced : t.notBalanced}</div>
          {message && <div role="alert" className="mt-3 text-sm text-red-700">{message}</div>}
          <div className="flex gap-2 justify-end mt-5"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border rounded-lg">{t.cancel}</button><button type="submit" disabled={saving || !balanced} className="px-5 py-2.5 bg-violet-700 text-white font-semibold rounded-lg disabled:opacity-50">{saving ? "..." : editingId ? t.update : t.save}</button></div>
        </form>
      </div>
    </div>}
  </div>;
}
