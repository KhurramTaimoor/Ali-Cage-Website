import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { escapeHtml, openUnicodePrint, printableText } from '../utils/unicodePrint';

const ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
async function request(path, options={}) {
  const result=await fetch(`${ROOT}${path}`,{...options,headers:{'Content-Type':'application/json',...options.headers}});
  const data=await result.json().catch(()=>({}));
  if(!result.ok)throw new Error(data.message||'Request failed');
  return data.data ?? data;
}
const name=p=>String(p.product_name||p.name||`Product #${p.id}`);
const category=p=>String(p.category_name||p.category_name_en||'—');
const type=p=>String(p.product_type_en||p.type_name||p.product_type_name||'—');
const unit=p=>String(p.unit_name||p.unit||'—');
const money=v=>Number(v||0).toLocaleString('en-PK',{maximumFractionDigits:2});
const baseItem=p=>({product_id:Number(p.id),category_id:Number(p.category_id)||0,product_type_id:Number(p.product_type_id)||0,unit_id:Number(p.unit_id)||0,retail_rate:'',wholesale_rate:''});
const selectClass='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500';
const buttonClass='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50';

export default function ScopedRateListsPanel({scope,products=[],onScopeChange}){
  const [lists,setLists]=useState([]),[entities,setEntities]=useState([]),[loading,setLoading]=useState(false),[message,setMessage]=useState('');
  const [form,setForm]=useState(null),[editing,setEditing]=useState(false),[search,setSearch]=useState(''),[categoryFilter,setCategoryFilter]=useState(''),[typeFilter,setTypeFilter]=useState('');
  const [assign,setAssign]=useState(null),[selected,setSelected]=useState([]),[nameFilter,setNameFilter]=useState('');
  const [printName,setPrintName]=useState('');
  const label=scope==='supplier'?'Supplier':'Production';
  const notice=msg=>setMessage(msg);
  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [l,e]=await Promise.all([request(`/api/scoped-rate-lists?scope=${scope}`),request(`/api/scoped-rate-lists/entities?scope=${scope}`)]);
      setLists(Array.isArray(l)?l:[]);setEntities(Array.isArray(e)?e:[]);setMessage('');
    }catch(err){notice(err.message)}finally{setLoading(false)}
  },[scope]);
  useEffect(()=>{load()},[load]);
  useEffect(()=>{setForm(null);setAssign(null);setCategoryFilter('');setTypeFilter('');setSearch('');setPrintName('');},[scope]);
  const categories=useMemo(()=>[...new Set(products.map(category).filter(x=>x!=='—'))].sort(),[products]);
  const types=useMemo(()=>[...new Set(products.map(type).filter(x=>x!=='—'))].sort(),[products]);
  const visibleProducts=useMemo(()=>products.filter(p=>{
    if(categoryFilter&&category(p)!==categoryFilter)return false;
    if(typeFilter&&type(p)!==typeFilter)return false;
    return !search||`${name(p)} ${category(p)} ${type(p)}`.toLowerCase().includes(search.toLowerCase());
  }),[products,categoryFilter,typeFilter,search]);
  const openNew=()=>{setForm({list_name:'',items:products.map(baseItem)});setEditing(false);};
  const openEdit=async list=>{try{const data=await request(`/api/scoped-rate-lists/${list.id}?scope=${scope}`);const existing=new Map(data.items.map(i=>[Number(i.product_id),i]));setForm({id:list.id,list_name:data.list_name,items:products.map(p=>({...baseItem(p),...(existing.get(Number(p.id))||{})}))});setEditing(true);}catch(err){notice(err.message)}};
  const setRate=(productId,key,value)=>setForm(f=>({...f,items:f.items.map(x=>Number(x.product_id)===Number(productId)?{...x,[key]:value}:x)}));
  const save=async()=>{
    if(!form.list_name.trim())return notice('Rate list name required.');
    if(!form.items.some(x=>Number(x.retail_rate)>0||Number(x.wholesale_rate)>0))return notice('Enter at least one product rate.');
    try{
      const payload={scope,list_name:form.list_name.trim(),items:form.items.filter(x=>Number(x.retail_rate)>0||Number(x.wholesale_rate)>0)};
      await request(editing?`/api/scoped-rate-lists/${form.id}`:'/api/scoped-rate-lists',{method:editing?'PUT':'POST',body:JSON.stringify(payload)});
      setForm(null);await load();
    }catch(err){notice(err.message)}
  };
  const openAssign=list=>{setAssign(list);setSelected((list.assigned_ids||[]).map(Number));setNameFilter('');};
  const saveAssign=async()=>{try{await request(`/api/scoped-rate-lists/${assign.id}/assign`,{method:'PUT',body:JSON.stringify({scope,entity_ids:selected})});setAssign(null);await load();}catch(err){notice(err.message)}};
  const remove=async list=>{if(!window.confirm(`Delete ${list.list_name}?`))return;try{await request(`/api/scoped-rate-lists/${list.id}?scope=${scope}`,{method:'DELETE'});await load();}catch(err){notice(err.message)}};
  const print=list=>{
    const productMap=new Map(products.map(p=>[Number(p.id),p]));
    const items=(list.items||[]).filter(i=>{const p=productMap.get(Number(i.product_id))||{};return (!categoryFilter||category(p)===categoryFilter)&&(!typeFilter||type(p)===typeFilter)});
    const target=printName?entities.find(e=>String(e.id)===String(printName)):null;
    if(target&&!list.assigned_ids?.includes(Number(target.id))){return notice(`This list is not assigned to ${target.name}.`);}
    const rows=items.map((it,index)=>{const p=productMap.get(Number(it.product_id))||{};return `<tr><td>${index+1}</td><td>${printableText(name(p))}</td><td>${printableText(type(p))}</td><td>${printableText(category(p))}</td><td>${printableText(unit(p))}</td><td class="num">${money(it.retail_rate)}</td><td class="num">${money(it.wholesale_rate)}</td></tr>`}).join('');
    const bodyHtml=`<section><header class="head"><div><b>ALI BIRD CAGE</b><h2>${escapeHtml(label)} Rate List: ${printableText(list.list_name)}</h2><p>${target?`Assigned to: ${printableText(target.name)}`:'All assigned '+label+' accounts'}</p></div><span>Printed: ${escapeHtml(new Date().toLocaleDateString('en-PK'))}</span></header><p>Type: ${printableText(typeFilter||'All')} · Category: ${printableText(categoryFilter||'All')}</p><table><thead><tr><th>#</th><th>Product</th><th>Type</th><th>Category</th><th>Unit</th><th>Rate</th><th>Evaluation</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No matching products</td></tr>'}</tbody></table></section>`;
    openUnicodePrint({title:`${label} - ${list.list_name}${target?'-'+target.name:''}`,bodyHtml,dir:'ltr',lang:'en',pageSize:'A4 landscape',styles:'.head{display:flex;justify-content:space-between;background:#13263A;color:white;padding:14px}.head h2{margin:6px 0}.head p{margin:0}table{border-collapse:collapse;width:100%;font-size:12px}th,td{padding:8px;border:1px solid #cbd5e1;text-align:left}th{background:#0B4E9B;color:white}.num{text-align:right}tbody tr:nth-child(odd){background:#f8fafc}'});
  };
  const visibleList=lists.filter(l=>!search||`${l.list_name} ${(l.assigned||[]).map(a=>a.name).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const FilterSelect=({value,onChange,options,label:fieldLabel})=><label className="text-xs font-bold text-slate-600">{fieldLabel}<select className={`${selectClass} mt-1`} value={value} onChange={e=>onChange(e.target.value)}><option value="">All {fieldLabel}</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></label>;
  return <div className="min-h-screen bg-[#F4F7FB] p-3 sm:p-6 text-slate-900"><div className="mx-auto max-w-[1500px] space-y-4">
    {message&&<p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{message}</p>}
    <div className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Rate Lists</h1><p className="text-xs text-slate-500">Create and assign {label.toLowerCase()} rate lists without Single Rate.</p></div><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white" onClick={openNew}>+ New {label} List</button></div><div className="mt-3 flex flex-wrap gap-2">{[['customer','Customer'],['supplier','Supplier'],['production','Production']].map(([s,l])=><button key={s} className={`rounded-lg px-5 py-2 text-xs font-bold ${s===scope?'bg-[#13263A] text-white':'border border-slate-200 bg-white text-slate-700'}`} onClick={()=>onScopeChange(s)}>{l}</button>)}</div></div>
    <div className="rounded-xl border bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold text-slate-600">Search by List / Name<input className={`${selectClass} mt-1`} placeholder="Search rate list..." value={search} onChange={e=>setSearch(e.target.value)}/></label><FilterSelect value={typeFilter} onChange={setTypeFilter} options={types} label="Product Type"/><FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categories} label="Category"/><label className="text-xs font-bold text-slate-600">Print by Account Name<select className={`${selectClass} mt-1`} value={printName} onChange={e=>setPrintName(e.target.value)}><option value="">All assigned</option>{entities.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label></div><p className="mt-2 text-xs text-slate-500">Print uses selected Product Type, Category and Account Name filters. Lists assigned per {label.toLowerCase()} account.</p></div>
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm"><table className="w-full min-w-[710px] text-sm"><thead className="bg-slate-100 text-xs"><tr><th className="p-3 text-left">Rate List</th><th>Products</th><th className="text-left">Assigned {label} Names</th><th className="text-left">Actions</th></tr></thead><tbody>{loading?<tr><td colSpan="4" className="p-7 text-center">Loading...</td></tr>:visibleList.length===0?<tr><td colSpan="4" className="p-7 text-center">No rate lists</td></tr>:visibleList.map(l=><tr key={l.id} className="border-t"><td className="p-3 font-bold">{l.list_name}</td><td>{l.product_count}</td><td className="text-xs text-slate-500">{(l.assigned||[]).map(e=>e.name).join(', ')||'Unassigned'}</td><td className="space-x-1 p-3"><button className={buttonClass} onClick={()=>openEdit(l)}>Edit</button><button className={buttonClass} onClick={()=>openAssign(l)}>Assign</button><button className={buttonClass} onClick={()=>print(l)}>Print / PDF</button><button className={`${buttonClass} text-rose-600`} onClick={()=>remove(l)}>Delete</button></td></tr>)}</tbody></table></div>
    {form&&<div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 p-3"><div className="mx-auto my-4 max-w-6xl rounded-xl bg-white p-4 sm:p-6"><div className="flex justify-between gap-3"><h2 className="text-lg font-bold">{editing?'Edit':'New'} {label} Rate List</h2><button onClick={()=>setForm(null)}>✕</button></div><label className="mt-3 block text-xs font-bold">List Name<input className={`${selectClass} mt-1`} value={form.list_name} onChange={e=>setForm(f=>({...f,list_name:e.target.value}))}/></label><div className="mt-3 grid gap-2 sm:grid-cols-2"><FilterSelect value={typeFilter} onChange={setTypeFilter} options={types} label="Product Type"/><FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categories} label="Category"/></div><div className="mt-3 max-h-[55vh] overflow-auto"><table className="w-full min-w-[600px] text-xs"><thead className="sticky top-0 bg-[#13263A] text-white"><tr><th>#</th><th>Product</th><th>Type</th><th>Category</th><th>Rate</th><th>Evaluation</th></tr></thead><tbody>{visibleProducts.map((p,i)=>{const item=form.items.find(x=>Number(x.product_id)===Number(p.id));return <tr key={p.id} className="border-b"><td>{i+1}</td><td className="p-2 font-bold">{name(p)}</td><td>{type(p)}</td><td>{category(p)}</td>{['retail_rate','wholesale_rate'].map(key=><td key={key} className="p-1"><input type="number" min="0" step="0.01" className="w-28 rounded border p-2 text-right" value={item?.[key]??''} onChange={e=>setRate(p.id,key,e.target.value)}/></td>)}</tr>})}</tbody></table></div><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setForm(null)} className={buttonClass}>Cancel</button><button onClick={save} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white">Save List</button></div></div></div>}
    {assign&&<div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/50 p-3"><div className="mx-auto my-8 max-w-xl rounded-xl bg-white p-5"><div className="flex justify-between"><h2 className="font-bold">Assign {label}: {assign.list_name}</h2><button onClick={()=>setAssign(null)}>✕</button></div><input value={nameFilter} onChange={e=>setNameFilter(e.target.value)} placeholder="Search names..." className={`${selectClass} my-3`}/><div className="max-h-[55vh] overflow-y-auto space-y-1">{entities.filter(e=>String(e.name||'').toLowerCase().includes(nameFilter.toLowerCase())).map(e=><label key={e.id} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2"><input type="checkbox" checked={selected.includes(Number(e.id))} onChange={ev=>setSelected(v=>ev.target.checked?[...new Set([...v,Number(e.id)])]:v.filter(id=>id!==Number(e.id)))}/>{e.name}</label>)}</div><div className="mt-4 flex justify-end gap-2"><button className={buttonClass} onClick={()=>setAssign(null)}>Cancel</button><button className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white" onClick={saveAssign}>Save Assignments</button></div></div></div>}
  </div></div>;
}
