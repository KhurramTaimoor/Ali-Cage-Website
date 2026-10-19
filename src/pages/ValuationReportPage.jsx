import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Printer, RefreshCw, FileText } from "lucide-react";

const ROOT=(import.meta.env.VITE_API_BASE_URL||"http://localhost:5000").replace(/\/$/,"");
const n=(v)=>Number(v)||0;
const money=(v)=>n(v).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2});
const arr=(v)=>Array.isArray(v)?v:Array.isArray(v?.data)?v.data:Array.isArray(v?.records)?v.records:[];
const localDate=(value)=>[value.getFullYear(),String(value.getMonth()+1).padStart(2,"0"),String(value.getDate()).padStart(2,"0")].join("-");
const initialDates=()=>{const today=new Date(),from=new Date(today);from.setMonth(from.getMonth()-1);return {from_date:localDate(from),to_date:localDate(today),customer_id:"",product_id:"",search:""}};
const productName=(p)=>p?.product_name||p?.product_name_en||p?.name||`Product #${p.id}`;
const customerName=(c)=>c?.customer_name_en||c?.customer_name||c?.name||`Customer #${c.id}`;
const tableClass="w-full min-w-[1050px] border-collapse text-left text-xs";
const td="border-b border-slate-100 px-3 py-3";
const th="bg-[#13263A] px-3 py-3 font-bold uppercase text-white";
const btn="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold shadow-sm";

export default function ValuationReportPage(){
  const [filters,setFilters]=useState(initialDates);
  const [records,setRecords]=useState([]);
  const [summary,setSummary]=useState({});
  const [groups,setGroups]=useState({customer:[],product:[]});
  const [customers,setCustomers]=useState([]),[products,setProducts]=useState([]);
  const [mode,setMode]=useState("invoice");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [searched,setSearched]=useState(false);
  useEffect(()=>{let alive=true;Promise.allSettled([axios.get(`${ROOT}/api/customers`),axios.get(`${ROOT}/api/products`)]).then(([c,p])=>{if(!alive)return;setCustomers(c.status==="fulfilled"?arr(c.value.data):[]);setProducts(p.status==="fulfilled"?arr(p.value.data):[])});return()=>{alive=false}},[]);
  const fetchReport=async()=>{
    if(filters.from_date&&filters.to_date&&filters.from_date>filters.to_date){setError("From Date cannot be after To Date.");return}
    setLoading(true);setError("");
    try{
      const params=new URLSearchParams(Object.entries(filters).filter(([,v])=>v!==""&&v!==null));
      const {data}=await axios.get(`${ROOT}/api/valuation-report?${params.toString()}`);
      setRecords(arr(data));setSummary(data.summary||{});setGroups(data.groups||{customer:[],product:[]});setSearched(true);
    }catch(e){setError(e.response?.data?.message||e.message||"Could not load valuation report.");setSearched(false)}
    finally{setLoading(false)}
  };
  const rows=useMemo(()=>mode==="invoice"?records:(groups[mode]||[]),[records,groups,mode]);
  const update=(key,value)=>setFilters(f=>({...f,[key]:value}));
  return <div className="min-h-screen bg-[#F4F7FB] p-3 text-[#13263A] sm:p-5 lg:p-6">
    <style>{`
      @media print{
        body *{visibility:hidden!important}
        #valuation-print-area,#valuation-print-area *{visibility:visible!important}
        #valuation-print-area{position:absolute!important;left:0!important;top:0!important;width:100%!important;padding:0!important;background:white!important}
        .valuation-no-print{display:none!important}
        .valuation-print-only{display:block!important}
        @page{size:A4 landscape;margin:9mm}
        #valuation-print-area table{font-size:9px!important}
        #valuation-print-area tr{break-inside:avoid}
      }
    `}</style>
    <div id="valuation-print-area" className="mx-auto max-w-[1550px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-600">Ali Cages ERP · Sales Reports</p>
          <h1 className="mt-1 text-2xl font-extrabold">Valuation Report</h1>
          <p className="mt-1 text-xs text-slate-500">Invoice product amount after discount minus customer rate list Evaluation amount. Previous balance and freight excluded.</p>
        </div>
        <div className="valuation-no-print flex gap-2">
          <button type="button" className={`${btn} border border-slate-200 bg-white text-slate-700`} onClick={()=>window.print()} disabled={!searched}><Printer size={15}/> Print / PDF</button>
          <button type="button" className={`${btn} bg-blue-600 text-white`} onClick={fetchReport} disabled={loading}><RefreshCw size={15}/>{loading?"Loading...":"Show Report"}</button>
        </div>
      </div>
      <div className="valuation-no-print grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-slate-600">From Date<input type="date" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2" value={filters.from_date} onChange={e=>update("from_date",e.target.value)}/></label>
        <label className="text-xs font-bold text-slate-600">To Date<input type="date" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2" value={filters.to_date} onChange={e=>update("to_date",e.target.value)}/></label>
        <label className="text-xs font-bold text-slate-600">Customer<select className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2" value={filters.customer_id} onChange={e=>update("customer_id",e.target.value)}><option value="">All Customers</option>{customers.map(c=><option key={c.id} value={c.id}>{customerName(c)}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-600">Product<select className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2" value={filters.product_id} onChange={e=>update("product_id",e.target.value)}><option value="">All Products</option>{products.map(p=><option key={p.id} value={p.id}>{productName(p)}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-600">Search<input className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" value={filters.search} onChange={e=>update("search",e.target.value)} placeholder="Invoice / Customer / Product"/></label>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Sales Amount",summary.sales_amount,"text-blue-700"],
          ["Valuation Amount",summary.valuation_amount,"text-violet-700"],
          ["Difference",summary.difference,"text-emerald-700"],
          ["Missing Evaluation",summary.missing_items,"text-amber-700"],
        ].map(([label,value,color])=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-bold uppercase text-slate-500">{label}</p><b className={`mt-2 block text-xl ${color}`}>{label==="Missing Evaluation"?n(value):`Rs ${money(value)}`}</b></div>)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="valuation-no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-wrap gap-2">{[["invoice","Invoice Details"],["customer","By Customer"],["product","By Products"]].map(([key,label])=><button key={key} onClick={()=>setMode(key)} className={`${btn} ${mode===key?"bg-[#13263A] text-white":"border border-slate-200 bg-white text-slate-700"}`}>{label}</button>)}</div>
          <div className="text-xs text-slate-500">{rows.length} rows · {n(summary.invoice_count)} invoices</div>
        </div>
        <div className="hidden p-3 text-xs font-bold valuation-print-only" style={{display:"none"}}>Valuation Report · {filters.from_date||"All"} to {filters.to_date||"All"} · {mode==="invoice"?"Invoice-wise":mode==="customer"?"Customer-wise":"Product-wise"}</div>
        {!!summary.missing_items&&searched&&<div className="m-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Some products have no Evaluation rate in their selected customer rate list. Their difference is shown as Missing Rate, not a false profit. Valuation/Difference totals include only matched rows.</div>}
        {error&&<div className="m-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead><tr>{(mode==="invoice"?["#","Date","Invoice No","Customer","Product","Qty","Rate List","Sale Amount","Evaluation Rate","Valuation Amount","Difference"]:["#",(mode==="customer"?"Customer":"Product"),"Invoices","Qty","Sale Amount","Valuation Amount","Difference","Missing Rate"]).map(x=><th key={x} className={th}>{x}</th>)}</tr></thead>
            <tbody>{!searched?<tr><td className="px-4 py-12 text-center text-slate-400" colSpan={11}><FileText size={24} className="mx-auto mb-2"/>Select dates and click Show Report.</td></tr>:loading?<tr><td className="p-12 text-center" colSpan={11}>Loading...</td></tr>:rows.length===0?<tr><td className="p-12 text-center text-slate-500" colSpan={11}>No matching invoices.</td></tr>:rows.map((r,i)=><tr key={mode==="invoice"?`${r.invoice_id}-${i}`:`${mode}-${r.name}-${i}`} className="hover:bg-slate-50">{mode==="invoice"?<>
                <td className={td}>{i+1}</td><td className={td}>{r.invoice_date||"—"}</td><td className={`${td} font-bold`}>{r.invoice_no}</td><td className={td}>{r.customer_name}</td><td className={td}>{r.product_name}</td><td className={td}>{r.qty}</td><td className={td}>{r.rate_list_name||"Not Assigned"}</td><td className={`${td} text-right`}>Rs {money(r.invoice_amount)}</td><td className={`${td} text-right`}>{r.rate_missing?"Missing":"Rs "+money(r.evaluation_rate)}</td><td className={`${td} text-right`}>{r.rate_missing?"—":"Rs "+money(r.valuation_amount)}</td><td className={`${td} text-right font-bold`}>{r.rate_missing?"Missing Rate":"Rs "+money(r.difference)}</td>
              </>:<>
                <td className={td}>{i+1}</td><td className={`${td} font-bold`}>{r.name}</td><td className={td}>{r.invoice_count}</td><td className={td}>{r.qty}</td><td className={`${td} text-right`}>Rs {money(r.sales_amount)}</td><td className={`${td} text-right`}>Rs {money(r.valuation_amount)}</td><td className={`${td} text-right font-bold`}>Rs {money(r.difference)}</td><td className={td}>{r.missing_items||"—"}</td>
              </>}</tr>)}</tbody>
            {searched&&<tfoot className="bg-slate-50 text-xs font-extrabold">{mode==="invoice"?
              <tr><td className="px-3 py-3" colSpan={7}>Total (difference excludes missing rates)</td><td className="px-3 py-3 text-right">Rs {money(summary.sales_amount)}</td><td></td><td className="px-3 py-3 text-right">Rs {money(summary.valuation_amount)}</td><td className="px-3 py-3 text-right">Rs {money(summary.difference)}</td></tr>
              :<tr><td className="px-3 py-3" colSpan={4}>Total (difference excludes missing rates)</td><td className="px-3 py-3 text-right">Rs {money(summary.sales_amount)}</td><td className="px-3 py-3 text-right">Rs {money(summary.valuation_amount)}</td><td className="px-3 py-3 text-right">Rs {money(summary.difference)}</td><td className="px-3 py-3">{summary.missing_items||0}</td></tr>}</tfoot>}
          </table>
        </div>
      </div>
    </div>
  </div>;
}
