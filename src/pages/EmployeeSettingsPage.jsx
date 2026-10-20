import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api/employees`;
const copy = {
  en: {
    title: "Employee Settings", subtitle: "Create departments and designations for Employee Registration.",
    departments: "Departments", designations: "Designations", department: "Department", designation: "Designation",
    add: "Add", edit: "Edit", remove: "Delete", save: "Save", cancel: "Cancel", back: "Back to Employees", refresh: "Refresh",
    name: "Name", actions: "Actions", empty: "No records yet. Add your first option.",
    hint: "These options appear in the New Employee form automatically.",
    delPrompt: "Delete this option? This cannot be undone.",
    error: "Request failed. Please try again.", loading: "Loading settings...", employeeUse: "Options already assigned to employees cannot be deleted.",
    language: "اردو"
  },
  ur: {
    title: "ملازم سیٹنگز", subtitle: "ملازمین کے لیے محکمے اور عہدے الگ سے بنائیں۔",
    departments: "محکمے", designations: "عہدے", department: "محکمہ", designation: "عہدہ",
    add: "شامل کریں", edit: "ترمیم", remove: "حذف", save: "محفوظ", cancel: "منسوخ", back: "ملازمین کی فہرست", refresh: "تازہ کریں",
    name: "نام", actions: "عمل", empty: "ابھی کوئی ریکارڈ موجود نہیں۔",
    hint: "یہ اختیارات نئے ملازم کے فارم میں خود نظر آئیں گے۔",
    delPrompt: "کیا یہ ریکارڈ حذف کرنا ہے؟", error: "درخواست ناکام ہوئی۔", loading: "لوڈ ہو رہا ہے...", employeeUse: "استعمال شدہ آپشن حذف نہیں ہو سکتا۔",
    language: "English"
  }
};

const configs = {
  departments: { singular: "department", id: "id", field: "department_name" },
  designations: { singular: "designation", id: "id", field: "designation_name" },
};

export default function EmployeeSettingsPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = copy[lang];
  const [records, setRecords] = useState({ departments: [], designations: [] });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dep, des] = await Promise.all([
        axios.get(`${API}/departments`),
        axios.get(`${API}/designations`),
      ]);
      setRecords({ departments: dep.data?.data || [], designations: des.data?.data || [] });
    } catch (err) {
      setError(err.response?.data?.message || "Could not load employee settings.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (kind, row = null) => {
    const config = configs[kind];
    setError("");
    setForm({ kind, id: row?.id || null, name: row?.[config.field] || "" });
  };

  const save = async () => {
    const name = (form?.name || "").trim();
    if (!name) { setError("Name is required."); return; }
    setBusy(true);
    setError("");
    try {
      const config = configs[form.kind];
      const data = { [config.field]: name };
      if (form.id) await axios.put(`${API}/${form.kind}/${form.id}`, data);
      else await axios.post(`${API}/${form.kind}`, data);
      setForm(null);
      await load();
    } catch (err) { setError(err.response?.data?.message || t.error); }
    finally { setBusy(false); }
  };

  const remove = async (kind, row) => {
    if (!window.confirm(t.delPrompt)) return;
    setBusy(true);
    setError("");
    try {
      await axios.delete(`${API}/${kind}/${row.id}`);
      await load();
    } catch (err) { setError(err.response?.data?.message || t.error); }
    finally { setBusy(false); }
  };

  return (
    <div dir={lang === "ur" ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setLang(lang === "en" ? "ur" : "en")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">{t.language}</button>
              <button type="button" onClick={load} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">{t.refresh}</button>
              <button type="button" onClick={() => navigate("/app/hr/employee")} className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white">{t.back}</button>
            </div>
          </div>
        </header>
        <p className="text-sm text-slate-500">{t.hint}</p>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Object.keys(configs).map((kind) => (
            <section key={kind} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <h2 className="font-bold">{t[kind]}</h2>
                  <p className="text-xs text-slate-500">{records[kind].length} {t[kind]}</p>
                </div>
                <button type="button" disabled={busy} className="rounded-lg bg-blue-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={() => open(kind)}>+ {t.add} {t[configs[kind].singular]}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-slate-600"><th className="px-4 py-3 text-start">#</th><th className="px-4 py-3 text-start">{t.name}</th><th className="px-4 py-3 text-end">{t.actions}</th></tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">{t.loading}</td></tr> : records[kind].length === 0 ? <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">{t.empty}</td></tr> : records[kind].map((row, i) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold">{row[configs[kind].field]}</td>
                        <td className="px-4 py-3 text-end whitespace-nowrap">
                          <button type="button" disabled={busy} className="rounded-lg border border-slate-200 px-3 py-1.5 text-blue-700 me-2 disabled:opacity-50" onClick={() => open(kind,row)}>{t.edit}</button>
                          <button type="button" disabled={busy} className="rounded-lg border border-red-200 px-3 py-1.5 text-red-700 disabled:opacity-50" onClick={() => remove(kind,row)}>{t.remove}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
      {form && <div className="erp-entry-page fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setForm(null); }}>
        <div className="erp-entry-toolbar"><div className="erp-entry-toolbar-title"><strong>{form.id ? "Edit Employee Setting" : "New Employee Setting"}</strong><small>Full-page form • All original fields preserved</small></div><button type="button" disabled={busy} className="erp-back-to-list" onClick={() => setForm(null)}>← Back to List</button></div>
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 space-y-4">
          <h2 className="text-lg font-bold">{form.id ? t.edit : t.add} {t[configs[form.kind].singular]}</h2>
          <label className="block text-sm font-semibold text-slate-600">{t.name} *
            <input autoFocus type="text" maxLength={180} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')save();}} />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={()=>setForm(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">{t.cancel}</button>
            <button type="button" disabled={busy || !form.name.trim()} onClick={save} className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t.save}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
