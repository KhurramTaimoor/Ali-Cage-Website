import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { CalendarDays, Printer, RefreshCw, Wallet, Search, Users, CheckCircle2 } from "lucide-react";

const API = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api/payroll`;
const isoLocal = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const currentWeek = () => {
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  // Friday = 5, Thursday = 4. Previous/current Friday through Thursday.
  day.setDate(day.getDate() - ((day.getDay() - 5 + 7) % 7));
  const end = new Date(day);
  end.setDate(day.getDate() + 6);
  return { from_date: isoLocal(day), to_date: isoLocal(end) };
};
const fmt = number => Number(number || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const labels = {
  en: { title: "Payroll", subtitle: "Friday–Thursday contractor salary sheet linked to Production Work and Cash Book", from: "From Date", to: "To Date", week: "Running Week", apply: "Show Payroll", refresh: "Refresh", name: "Contractor Name", wages: "Wages Amount", advance: "Advance", remaining: "Remaining Balance", previous: "Previous Balance", total: "Total Balance", status: "Status", paid: "Paid", unpaid: "Unpaid", all: "All Status", search: "Search contractor name...", printed: "Print Salary Sheet", empty: "No contractors match the selected filters.", info: "Wages = Production Work in these dates. Advance = Cash Book employee-paid entries in these dates. Previous Balance = movements before the selected start date. Changing Paid/Unpaid does not create a Cash Book payment.", types: "Registered contractors", summaryWages: "Wages (Selected Dates)", summaryAdvance: "Advances (Selected Dates)", summaryRemaining: "Remaining (Selected Dates)", summaryStatus: "Paid / Unpaid (Selected Dates)", production: "Production Work", employee: "Add Employee" },
  ur: { title: "پے رول", subtitle: "جمعہ سے جمعرات کنٹریکٹر سیلری شیٹ — پروڈکشن اور کیش بک سے منسلک", from: "شروع کی تاریخ", to: "ختم کی تاریخ", week: "موجودہ ہفتہ", apply: "پے رول دیکھیں", refresh: "ریفریش", name: "کنٹریکٹر کا نام", wages: "کام کی مزدوری", advance: "ایڈوانس", remaining: "باقی رقم", previous: "سابقہ بقایا", total: "کل بقایا", status: "اسٹیٹس", paid: "ادا شدہ", unpaid: "غیر ادا شدہ", all: "تمام", search: "کنٹریکٹر کا نام تلاش کریں...", printed: "سیلری شیٹ پرنٹ", empty: "اس فلٹر میں کوئی کنٹریکٹر نہیں۔", info: "مزدوری پروڈکشن سے، ایڈوانس منتخب تاریخوں کی کیش بک سے، سابقہ بقایا پچھلی تاریخوں سے۔ اسٹیٹس بدلنے سے کیش بک میں ادائیگی نہیں بنتی۔", types: "رجسٹرڈ کنٹریکٹر", summaryWages: "ان تاریخوں کی مزدوری", summaryAdvance: "ان تاریخوں کا ایڈوانس", summaryRemaining: "ان تاریخوں کا باقی", summaryStatus: "ادا / باقی (ان تاریخوں میں)", production: "پروڈکشن ورک", employee: "ملازم شامل کریں" },
};
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

export default function EmployeeRatePage() {
  const [language, setLanguage] = useState("en");
  const t = labels[language];
  const [dates, setDates] = useState(currentWeek);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loadedDates, setLoadedDates] = useState(null);

  const loadPayroll = useCallback(async (range) => {
    if (!range.from_date || !range.to_date || range.from_date > range.to_date) {
      setError("Please select a valid date range."); return;
    }
    setLoading(true); setError("");
    try {
      const response = await axios.get(API, {params:range});
      setRows(Array.isArray(response.data?.data) ? response.data.data : []);
      setSummary(response.data?.summary || {});
      setLoadedDates(range);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load payroll.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadPayroll(currentWeek()); }, [loadPayroll]);

  const visible = useMemo(() => rows.filter(row => {
    const matchesText = String(row.contractor_name || "").toLowerCase().includes(search.toLowerCase().trim());
    return matchesText && (statusFilter === "All" || row.status === statusFilter);
  }), [rows, search, statusFilter]);

  const setPaid = async (row, status) => {
    if (!loadedDates || savingId) return;
    setSavingId(row.employee_id); setError("");
    try {
      await axios.put(`${API}/status`, { employee_id:row.employee_id, status, ...loadedDates });
      await loadPayroll(loadedDates);
    } catch(err) { setError(err.response?.data?.message || "Could not change status."); }
    finally { setSavingId(null); }
  };

  const printSheet = () => {
    if (!loadedDates) return;
    const cells = visible.map((row, i) => `<tr><td>${i+1}</td><td>${esc(row.contractor_name)}</td><td>${fmt(row.wages_amount)}</td><td>${fmt(row.advance)}</td><td>${fmt(row.remaining_balance)}</td><td>${fmt(row.previous_balance)}</td><td>${fmt(row.total_balance)}</td><td>${esc(row.status)}</td></tr>`).join("");
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Payroll ${esc(loadedDates.from_date)} - ${esc(loadedDates.to_date)}</title><style>body{font-family:Arial,sans-serif;padding:18px;color:#14253d}h1{margin:0 0 6px}p{font-size:12px;color:#475569}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#eaf2fd}td:nth-child(n+3){text-align:right}td:nth-child(8){text-align:center}@page{size:A4 landscape;margin:12mm}</style></head><body><h1>ALI BIRD CAGE — PAYROLL</h1><p>Period: ${esc(loadedDates.from_date)} to ${esc(loadedDates.to_date)} (Friday–Thursday default)</p><table><thead><tr><th>#</th><th>Contractor Name</th><th>Wages Amount</th><th>Advance</th><th>Remaining</th><th>Previous Balance</th><th>Total Balance</th><th>Status</th></tr></thead><tbody>${cells}</tbody></table><p>Selected period only — Wages: ${fmt(summary.total_wages)} | Advance: ${fmt(summary.total_advance)} | Remaining: ${fmt(summary.period_remaining)}</p></body></html>`;
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) {setError("Please allow pop-ups to print payroll."); return;}
    win.document.write(doc); win.document.close(); win.onload = () => win.print();
  };
  const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500";
  const stats = [
    {label:t.summaryWages, value:`Rs. ${fmt(summary.total_wages)}`, color:"text-blue-700", background:"bg-blue-50"},
    {label:t.summaryAdvance, value:`Rs. ${fmt(summary.total_advance)}`, color:"text-orange-700", background:"bg-orange-50"},
    {label:t.summaryRemaining, value:`Rs. ${fmt(summary.period_remaining)}`, color:"text-emerald-700", background:"bg-emerald-50"},
    {label:t.summaryStatus, value:`${summary.paid_count || 0} / ${summary.unpaid_count || 0}`, color:"text-indigo-700", background:"bg-indigo-50"},
  ];
  return <div className="min-h-screen bg-slate-50 p-4 pb-12 md:p-6" dir={language === "ur" ? "rtl":"ltr"}>
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div><h1 className="text-2xl font-bold text-slate-900">{t.title}</h1><p className="mt-1 text-sm text-slate-500">{t.subtitle}</p></div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/hr/employee" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{t.employee}</Link>
          <Link to="/app/production/invoice" className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">{t.production}</Link>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold" onClick={()=>setLanguage(x=>x==="en"?"ur":"en")}>{language==="en"?"اردو":"English"}</button>
          <button onClick={printSheet} disabled={!loadedDates || loading} className="flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><Printer size={15}/>{t.printed}</button>
        </div>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
          <label className="text-xs font-bold text-slate-600"><span className="mb-2 block">{t.from}</span><input type="date" className={field} value={dates.from_date} onChange={e=>setDates(d=>({...d,from_date:e.target.value}))}/></label>
          <label className="text-xs font-bold text-slate-600"><span className="mb-2 block">{t.to}</span><input type="date" className={field} value={dates.to_date} onChange={e=>setDates(d=>({...d,to_date:e.target.value}))}/></label>
          <button onClick={()=>{const w=currentWeek();setDates(w);loadPayroll(w);}} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold"><CalendarDays size={16}/>{t.week}</button>
          <button onClick={()=>loadPayroll(dates)} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15}/>{loading?t.refresh:t.apply}</button>
        </div>
        {loadedDates&&<p className="mt-3 text-xs text-slate-500">{loadedDates.from_date} → {loadedDates.to_date}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(card=><div key={card.label} className={`rounded-xl border border-slate-200 p-4 shadow-sm ${card.background}`}><div className="mb-2 text-xs font-semibold text-slate-600">{card.label}</div><div className={`text-xl font-extrabold ${card.color}`}>{card.value}</div></div>)}
      </div>
      {error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Users size={17}/>{t.types} <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{visible.length}</span></div>
          <div className="flex flex-wrap gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" /></div><select aria-label={t.status} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="All">{t.all}</option><option value="Paid">{t.paid}</option><option value="Unpaid">{t.unpaid}</option></select></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600"><tr>{["#",t.name,t.wages,t.advance,t.remaining,t.previous,t.total,t.status].map(v=><th key={v} className="whitespace-nowrap px-4 py-3 text-left">{v}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{visible.length?visible.map((r,i)=><tr key={r.employee_id} className="hover:bg-slate-50"><td className="px-4 py-3 text-slate-500">{i+1}</td><td className="px-4 py-3 font-semibold text-slate-800">{r.contractor_name}</td><td className="px-4 py-3 text-right font-semibold">{fmt(r.wages_amount)}</td><td className="px-4 py-3 text-right text-orange-700">{fmt(r.advance)}</td><td className="px-4 py-3 text-right font-bold text-emerald-700">{fmt(r.remaining_balance)}</td><td className="px-4 py-3 text-right">{fmt(r.previous_balance)}</td><td className="px-4 py-3 text-right font-extrabold text-blue-800">{fmt(r.total_balance)}</td><td className="px-4 py-3"><select value={r.status} disabled={savingId===r.employee_id||loading} onChange={e=>setPaid(r,e.target.value)} aria-label={`${r.contractor_name} ${t.status}`} className={`rounded-lg border px-3 py-2 text-xs font-bold ${r.status==="Paid"?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-amber-200 bg-amber-50 text-amber-700"}`}><option value="Unpaid">{t.unpaid}</option><option value="Paid">{t.paid}</option></select></td></tr>):<tr><td colSpan="8" className="py-12 text-center text-slate-400">{loading?t.refresh:t.empty}</td></tr>}</tbody></table></div>
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-slate-600">{t.info}</div>
    </div>
  </div>;
}
