import React, { useEffect, useState } from "react";
import axios from "axios";
import { Printer, RefreshCw, FileDown } from "lucide-react";
import { oneMonthRange } from "../utils/dateDefaults";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "").replace(/\/api$/i, "") + "/api";
const translations = {
  en: {
    title:"Cash Book Report",subtitle:"Opening Balance + Cash In − Cash Out = Closing Balance",
    from:"From Date",to:"To Date",show:"Show Report",print:"Print",pdf:"Save as PDF",
    date:"Date",account:"Account Type / Name",description:"Description",in:"Cash In",out:"Cash Out",
    balance:"Balance",opening:"Opening Balance",closing:"Closing Balance",total:"Period Totals",
    noRows:"No cash entries for the selected dates.",report:"CASH BOOK REPORT",language:"اردو",
    printed:"Printed On",period:"Report Period",voucher:"Voucher",prepared:"Prepared By",authorized:"Authorized Signature"
  },
  ur: {
    title:"کیش بک رپورٹ",subtitle:"ابتدائی بیلنس + کیش ان − کیش آؤٹ = اختتامی بیلنس",
    from:"شروع کی تاریخ",to:"آخری تاریخ",show:"رپورٹ دیکھیں",print:"پرنٹ",pdf:"پی ڈی ایف",
    date:"تاریخ",account:"اکاؤنٹ قسم / نام",description:"تفصیل",in:"کیش ان",out:"کیش آؤٹ",
    balance:"بیلنس",opening:"ابتدائی بیلنس",closing:"اختتامی بیلنس",total:"اس مدت کا کل",
    noRows:"اس مدت میں کوئی کیش ریکارڈ نہیں۔",report:"کیش بک رپورٹ",language:"English",
    printed:"پرنٹ کی تاریخ",period:"رپورٹ کی مدت",voucher:"واؤچر",prepared:"تیار کنندہ",authorized:"دستخط"
  }
};
const cash = (v) => (Number(v) || 0).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2});
const dateDDMMYY = (value) => {
  const m = String(value || "").slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? [m[3],m[2],m[1].slice(2)].join("-") : "—";
};
const accountLabels = {
  customer:["Customer","کسٹمر"],supplier:["Supplier","سپلائر"],employee:["Employee","ملازم"],
  general_ledger:["General Account","جنرل اکاؤنٹ"]
};
const css = [
  "@media print {",
  "@page{size:A4 landscape;margin:9mm}",
  "body *{visibility:hidden!important}",
  "#cash-book-print,#cash-book-print *{visibility:visible!important}",
  "#cash-book-print{position:absolute!important;inset:0 auto auto 0!important;width:100%!important;padding:0!important;border:0!important;box-shadow:none!important;direction:rtl!important;background:white!important}",
  "#cash-book-print .cash-print-top{display:flex!important}",
  "#cash-book-print .cash-no-print{display:none!important}",
  "#cash-book-print .cash-print-table{font-size:9px!important}",
  "#cash-book-print .cash-print-table th,#cash-book-print .cash-print-table td{padding:5px!important}",
  "#cash-book-print thead{display:table-header-group}",
  "#cash-book-print tr{break-inside:avoid}",
  "#cash-book-print .cash-print-footer{display:flex!important}",
  "#cash-book-print .cash-report-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}",
  "#cash-book-print .cash-table-scroll{overflow:visible!important}",
  "}"
].join("\n");

export default function CashBookReportPage(){
  const [lang,setLang]=useState("en");
  const t=translations[lang],isUrdu=lang==="ur";
  const [filters,setFilters]=useState(()=>oneMonthRange());
  const [records,setRecords]=useState([]);
  const [summary,setSummary]=useState({opening_balance:0,cash_in:0,cash_out:0,closing_balance:0,entry_count:0});
  const [loading,setLoading]=useState(false),[error,setError]=useState(""),[searched,setSearched]=useState(false);

  const fetchReport = async (criteria) => {
    const dates=criteria||filters;
    if(dates.from_date&&dates.to_date&&dates.from_date>dates.to_date){setError("From Date must be before To Date.");return;}
    setLoading(true);setError("");
    try{
      const p=new URLSearchParams();
      if(dates.from_date)p.set("from_date",dates.from_date);
      if(dates.to_date)p.set("to_date",dates.to_date);
      const response=await axios.get(API_BASE+"/cash-book-report?"+p.toString());
      const result=response.data;
      setRecords(Array.isArray(result?.data)?result.data:Array.isArray(result)?result:[]);
      setSummary(result?.summary||{opening_balance:0,cash_in:0,cash_out:0,closing_balance:0,entry_count:0});
      setSearched(true);
    }catch(e){setError(e?.response?.data?.message||e?.message||"Cash Book Report could not be loaded.");}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchReport(oneMonthRange());},[]);
  const formatAccount=(row)=>{
    const type=accountLabels[row.account_type]?.[isUrdu?1:0]|| (isUrdu?"کیش بک":"Cash Book");
    return {type,name:row.account_name|| (isUrdu?"براہ راست اندراج":"Direct Cash Entry")};
  };
  const print=()=>{if(searched&&!loading)window.print();};
  const columns=["#",t.date,t.account,t.description,t.in,t.out,t.balance];
  const inputStyle="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500";
  return <div className="min-h-screen bg-[#F4F7FB] px-3 py-4 sm:px-5 lg:px-6">
    <style>{css}</style>
    <div className="cash-no-print mx-auto mb-4 flex max-w-[1500px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-blue-600">ALI BIRD CAGE · Accounts</p>
        <h1 className="text-2xl font-extrabold text-[#13263A]">{t.title}</h1><p className="mt-1 text-xs text-slate-500">{t.subtitle}</p>
      </div>
      <button type="button" onClick={()=>setLang(isUrdu?"en":"ur")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">{t.language}</button>
    </div>
    <div className="cash-no-print mx-auto mb-4 grid max-w-[1500px] gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
      <label className="text-xs font-bold text-slate-700">{t.from}<input type="date" className={inputStyle} value={filters.from_date||""} onChange={e=>setFilters(f=>({...f,from_date:e.target.value}))}/></label>
      <label className="text-xs font-bold text-slate-700">{t.to}<input type="date" className={inputStyle} value={filters.to_date||""} onChange={e=>setFilters(f=>({...f,to_date:e.target.value}))}/></label>
      <div className="flex flex-wrap items-end gap-2">
        <button type="button" disabled={loading} onClick={()=>fetchReport()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0B4E9B] px-4 text-xs font-bold text-white disabled:opacity-50"><RefreshCw size={15}/>{loading?"Loading...":t.show}</button>
        <button type="button" disabled={!searched||loading} onClick={print} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-800 disabled:opacity-40"><Printer size={15}/>{t.print}</button>
        <button type="button" disabled={!searched||loading} onClick={print} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-800 disabled:opacity-40"><FileDown size={15}/>{t.pdf}</button>
      </div>
    </div>
    {error&&<div className="cash-no-print mx-auto mb-4 max-w-[1500px] rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <section id="cash-book-print" dir={isUrdu?"rtl":"ltr"} className="mx-auto max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <header className="cash-print-top mb-5 hidden items-center justify-between gap-4 border-b-2 border-[#13263A] pb-4" dir="rtl">
        <div className="flex items-center gap-4">
          <img src="/images/ali-bird-cage-logo.png" alt="" className="h-16 w-24 object-contain" onError={e=>{e.currentTarget.style.display="none";}}/>
          <div><h2 className="text-2xl font-black tracking-tight text-[#13263A]">ALI BIRD CAGE</h2><p className="font-bold text-[#0B4E9B]">{t.report}</p></div>
        </div>
        <div className="text-left text-xs font-semibold text-slate-600"><p>{t.period}: {dateDDMMYY(filters.from_date)} — {dateDDMMYY(filters.to_date)}</p><p className="mt-1">{t.printed}: {new Date().toLocaleString("en-PK")}</p></div>
      </header>
      <div className="cash-report-grid mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[t.opening,summary.opening_balance,"text-slate-800"],[t.in,summary.cash_in,"text-emerald-700"],[t.out,summary.cash_out,"text-red-700"],[t.closing,summary.closing_balance,"text-blue-700"]].map(([title,value,color])=>
          <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="block text-xs font-bold text-slate-500">{title}</span><b dir="ltr" className={["mt-1 block text-xl",color].join(" ")}>Rs {cash(value)}</b></div>
        )}
      </div>
      <div className="cash-no-print mb-3 flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-500">
        <span>{t.report} · {searched?records.length:0} entries</span><span>{dateDDMMYY(filters.from_date)} — {dateDDMMYY(filters.to_date)}</span>
      </div>
      <div className="cash-table-scroll overflow-x-auto">
        <table className="cash-print-table w-full min-w-[990px] border-collapse text-sm text-slate-700">
          <thead className="bg-[#13263A] text-white"><tr>{columns.map(h=><th key={h} className="border border-[#13263A] px-3 py-3 text-start text-xs font-extrabold">{h}</th>)}</tr></thead>
          <tbody>
            <tr className="bg-blue-50 font-bold text-slate-800"><td className="border border-slate-200 px-3 py-3" colSpan={6}>{t.opening}</td><td dir="ltr" className="border border-slate-200 px-3 py-3 text-right">{cash(summary.opening_balance)}</td></tr>
            {!searched?<tr><td colSpan={7} className="p-10 text-center text-slate-400">{t.show}</td></tr>:records.length===0?<tr><td colSpan={7} className="p-10 text-center text-slate-400">{t.noRows}</td></tr>:records.map((row,index)=>{
              const a=formatAccount(row);
              return <tr key={row.id||index} className="even:bg-slate-50">
                <td className="border border-slate-200 px-3 py-2.5">{index+1}</td>
                <td dir="ltr" className="whitespace-nowrap border border-slate-200 px-3 py-2.5">{dateDDMMYY(row.entry_date)}</td>
                <td className="border border-slate-200 px-3 py-2.5"><b className="block">{a.name}</b><small className="text-slate-500">{a.type}</small>{row.voucher_no&&<small className="block text-slate-400">{t.voucher}: {row.voucher_no}</small>}</td>
                <td className="border border-slate-200 px-3 py-2.5">{row.description||"—"}</td>
                <td dir="ltr" className="border border-slate-200 px-3 py-2.5 text-right font-mono text-emerald-700">{Number(row.cash_in)>0?cash(row.cash_in):"—"}</td>
                <td dir="ltr" className="border border-slate-200 px-3 py-2.5 text-right font-mono text-red-700">{Number(row.cash_out)>0?cash(row.cash_out):"—"}</td>
                <td dir="ltr" className="border border-slate-200 bg-blue-50/40 px-3 py-2.5 text-right font-mono font-bold text-slate-900">{cash(row.balance)}</td>
              </tr>;
            })}
          </tbody>
          <tfoot><tr className="bg-slate-100 font-extrabold text-slate-900">
            <td colSpan={4} className="border border-slate-300 px-3 py-3">{t.total}</td>
            <td dir="ltr" className="border border-slate-300 px-3 py-3 text-right text-emerald-700">{cash(summary.cash_in)}</td>
            <td dir="ltr" className="border border-slate-300 px-3 py-3 text-right text-red-700">{cash(summary.cash_out)}</td>
            <td dir="ltr" className="border border-slate-300 px-3 py-3 text-right text-blue-700">{cash(summary.closing_balance)}</td>
          </tr></tfoot>
        </table>
      </div>
      <div className="cash-print-footer mt-14 hidden justify-between gap-10 text-xs font-bold text-slate-600" dir="rtl"><div className="w-48 border-t border-slate-500 pt-2 text-center">{t.prepared}</div><div className="w-48 border-t border-slate-500 pt-2 text-center">{t.authorized}</div></div>
    </section>
  </div>;
}
