import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Save, Trash2, Search, Edit3, CheckSquare, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const ROOT=(import.meta.env.VITE_API_BASE_URL||"http://localhost:5000").replace(/\/$/,"").replace(/\/api$/i,"");
const BASE=ROOT+"/api/permissions";
const empty=()=>({employee_id:"",role:"employee",username:"",email:"",password:"",status:"active",features:[]});
const groups={sales:"Sales",purchase:"Purchase",inventory:"Inventory",accounts:"Accounts",reports:"Reports",hr:"HR",production:"Production"};
const input="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none";
const box="rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
export default function PermissionsPage(){
 const outlet=useOutletContext()||{},isRTL=!!outlet.isRTL;
 const [users,setUsers]=useState([]),[records,setRecords]=useState([]),[catalog,setCatalog]=useState([]);
 const [form,setForm]=useState(empty),[editId,setEditId]=useState(null),[search,setSearch]=useState(""),[editorOpen,setEditorOpen]=useState(false);
 const [message,setMessage]=useState(""),[error,setError]=useState(""),[saving,setSaving]=useState(false),[loading,setLoading]=useState(false);
 const load=async()=>{setLoading(true);setError("");try{
  const [userResponse,recordResponse,featureResponse]=await Promise.all([axios.get(BASE+"/users"),axios.get(BASE),axios.get(BASE+"/features")]);
  setUsers(Array.isArray(userResponse.data)?userResponse.data:[]);
  setRecords(Array.isArray(recordResponse.data)?recordResponse.data:[]);
  setCatalog(Array.isArray(featureResponse.data?.data)?featureResponse.data.data:[]);
 }catch(e){setError(e.response?.data?.error||e.response?.data?.message||"Unable to load User Accounts. Please sign in as Admin and try again.");}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const rowMap=useMemo(()=>new Map((form.features||[]).map(p=>[p.feature_key,p])),[form.features]);
 const changeGrant=(key,field,checked)=>{
  setForm(previous=>{
   const grants=new Map(previous.features.map(p=>[p.feature_key,{...p}]));
   const current=grants.get(key)||{feature_key:key,can_read:false,can_write:false,can_delete:false};
   current[field]=checked;
   if(field==="can_read"&&!checked){current.can_write=false;current.can_delete=false}
   if(field==="can_write"&&checked)current.can_read=true;
   if(field==="can_write"&&!checked)current.can_delete=false;
   if(field==="can_delete"&&checked){current.can_write=true;current.can_read=true}
   if(current.can_read||current.can_write||current.can_delete)grants.set(key,current);else grants.delete(key);
   return {...previous,features:[...grants.values()]};
  });
 };
 const changeGroup=(group,value)=>{
  setForm(old=>{
   const permissions=new Map(old.features.map(x=>[x.feature_key,{...x}]));
   for(const item of group.items){
    if(value)permissions.set(item.key,{feature_key:item.key,can_read:true,can_write:false,can_delete:false});
    else permissions.delete(item.key);
   }
   return {...old,features:[...permissions.values()]};
  });
 };
 const reset=()=>{setForm(empty());setEditId(null);setError("");setEditorOpen(false);};
 const save=async()=>{
  setMessage("");setError("");
  if(!form.employee_id)return setError("Please select an Employee.");
  if(!form.username.trim()&&!form.email.trim())return setError("Login email or username is required.");
  if(form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))return setError("Enter a valid email.");
  if(!editId && form.password.length<8)return setError("New login password must be at least 8 characters.");
  if(form.password&&form.password.length<8)return setError("Password must be at least 8 characters.");
  if(!form.features.length)return setError("Select at least one module permission below.");
  setSaving(true);
  try{
   const body={...form,role:form.role.toLowerCase(),access_level:"Custom"};
   const r=editId?await axios.put(BASE+"/"+editId,body):await axios.post(BASE,body);
   setMessage(r.data?.message||"Account saved. User can now log in using email/username and password.");
   reset();await load();
  }catch(e){setError(e.response?.data?.error||e.response?.data?.message||"Could not save user account.");}finally{setSaving(false)}
 };
 const edit=row=>{
  setEditorOpen(true);
  setEditId(row.id);
  setForm({employee_id:String(row.employee_id||""),role:String(row.role||"employee").toLowerCase(),username:row.username||"",email:row.email||"",password:"",status:row.status||"active",features:(row.features||[]).map(p=>({...p}))});
  setMessage("");setError("");window.scrollTo({top:0,behavior:"smooth"});
 };
 const revoke=async row=>{if(!window.confirm("Disable login and revoke permissions for "+row.user_name+"?"))return;try{await axios.delete(BASE+"/"+row.id);setMessage("Login disabled; permissions revoked.");await load()}catch(e){setError(e.response?.data?.error||"Could not revoke account.")}};
 const filtered=useMemo(()=>records.filter(x=>[x.user_name,x.username,x.email,x.role].join(" ").toLowerCase().includes(search.toLowerCase())),[records,search]);
 return <div className="mx-auto max-w-[1500px] space-y-4 pb-12 text-slate-800" dir={isRTL?"rtl":"ltr"}>
  <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-900 p-5 text-white shadow">
   <div><p className="text-xs font-extrabold uppercase tracking-widest text-sky-300">Administration</p><h1 className="text-2xl font-black">User Accounts & Module Permissions</h1><p className="mt-1 text-xs text-slate-300">Add users with email/password and turn on permissions one by one for every ERP feature.</p></div>
   <div className="flex flex-wrap gap-2"><button type="button" onClick={load} className="rounded-lg border border-white/30 px-4 py-2 text-xs font-bold">Refresh</button>
     <button type="button" onClick={()=>editorOpen ? reset() : (setForm(empty()),setEditId(null),setEditorOpen(true))} className="erp-back-to-list">
       {editorOpen ? "← Back to List" : "+ New User Account"}
     </button></div>
  </header>
  {message&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</div>}
  {error&&<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</div>}
  {editorOpen && <>
  <section className={box}>
   <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3"><h2 className="text-base font-extrabold">{editId?"Edit Employee Login":"New Employee Login"}</h2>{editId&&<button type="button" onClick={reset} className="inline-flex gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold"><X size={14}/> Cancel Edit</button>}</div>
   <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <label className="text-xs font-bold">Select Employee *<select value={form.employee_id} disabled={!!editId} onChange={e=>setForm(f=>({...f,employee_id:e.target.value}))} className={input}><option value="">Select Employee</option>{users.map(u=><option key={u.id} value={u.id}>{u.full_name}</option>)}</select></label>
    <label className="text-xs font-bold">Role *<select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className={input}>{["employee","manager","admin"].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></label>
    <label className="text-xs font-bold">Login Email<input type="email" autoComplete="off" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={input} placeholder="staff@example.com"/></label>
    <label className="text-xs font-bold">Username (optional if email entered)<input autoComplete="off" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} className={input} placeholder="staff.account"/></label>
    <label className="text-xs font-bold">{editId?"New Password (blank keeps existing)":"Password *"}<input type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className={input} placeholder={editId?"Leave blank to keep old password":"At least 8 characters"}/></label>
    <label className="text-xs font-bold">Login Status<select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className={input}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
   </div>
   <p className="mt-3 text-xs text-slate-500">Passwords are stored as secure hashes. Keep credentials private and use a strong password. A new username is generated from email if the username field is empty.</p>
  </section>
  <section className={box}>
   <div className="flex flex-wrap justify-between gap-2 border-b pb-3"><div><h2 className="flex items-center gap-2 text-lg font-extrabold"><CheckSquare size={18}/> Required User Permissions</h2><p className="text-xs text-slate-500">Enable Read, Write or Delete for each page. Write/Delete automatically includes Read.</p></div><div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{form.features.length} modules selected</div></div>
   <div className="mt-4 grid gap-4 lg:grid-cols-2">{catalog.map(group=><section key={group.group} className="overflow-hidden rounded-xl border border-slate-200">
    <div className="flex items-center justify-between bg-slate-100 p-3"><h3 className="font-black">{groups[group.group]||group.group}</h3><div className="flex items-center gap-2"><button type="button" onClick={()=>changeGroup(group,true)} className="text-[11px] font-bold text-blue-700">All Read</button><button type="button" onClick={()=>changeGroup(group,false)} className="text-[11px] font-bold text-slate-500">Clear</button></div></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[440px] text-xs"><thead><tr className="bg-slate-50 text-slate-500"><th className="px-3 py-2 text-start">Menu / Feature</th><th className="px-2 py-2">Read</th><th className="px-2 py-2">Write</th><th className="px-2 py-2">Delete</th></tr></thead><tbody className="divide-y divide-slate-100">{group.items.map(item=>{const value=rowMap.get(item.key)||{};return <tr key={item.key} className="hover:bg-blue-50/30"><td className="px-3 py-2 font-semibold">{item.label}</td>{["can_read","can_write","can_delete"].map(field=><td key={field} className="px-2 py-2 text-center"><input type="checkbox" className="h-4 w-4 accent-blue-600" aria-label={item.label+" "+field} checked={!!value[field]} onChange={e=>changeGrant(item.key,field,e.target.checked)}/></td>)}</tr>})}</tbody></table></div>
   </section>)}</div>
   <div className="mt-5 flex justify-end"><button type="button" onClick={save} disabled={saving||loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16}/>{saving?"Saving...":editId?"Update Login & Permissions":"Create Login & Save Permissions"}</button></div>
  </section>
  </>}
  {!editorOpen && (
  <section className={box}>
   <div className="flex flex-wrap justify-between gap-3 border-b pb-3"><h2 className="text-base font-extrabold">Saved User Accounts ({filtered.length})</h2><div className="relative"><Search size={16} className="absolute left-2 top-3 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search user/email" className="rounded-lg border px-8 py-2 text-xs"/></div></div>
   <div className="overflow-x-auto"><table className="mt-3 w-full min-w-[750px] text-sm"><thead><tr className="bg-slate-100 text-xs text-slate-600"><th className="p-3 text-start">Employee</th><th className="p-3 text-start">Login</th><th className="p-3 text-start">Role / Status</th><th className="p-3 text-start">Allowed Modules</th><th className="p-3 text-center">Actions</th></tr></thead><tbody>{filtered.map(row=><tr key={row.app_user_id} className="border-b"><td className="p-3 font-bold">{row.user_name}</td><td className="p-3">{row.username}<p className="text-xs text-slate-400">{row.email||"—"}</p></td><td className="p-3">{row.role}<p className="text-xs text-slate-500">{row.status}</p></td><td className="p-3">{(row.features||[]).length} selected</td><td className="p-3 text-center"><button type="button" disabled={!row.id} onClick={()=>edit(row)} title="Edit" className="rounded-lg p-2 text-blue-600 disabled:opacity-30"><Edit3 size={16}/></button><button type="button" disabled={!row.id} onClick={()=>revoke(row)} title="Disable login" className="rounded-lg p-2 text-red-600 disabled:opacity-30"><Trash2 size={16}/></button></td></tr>)}{!filtered.length&&<tr><td colSpan={5} className="p-8 text-center text-slate-400">No users found.</td></tr>}</tbody></table></div>
  </section>
  )}
 </div>;
}
