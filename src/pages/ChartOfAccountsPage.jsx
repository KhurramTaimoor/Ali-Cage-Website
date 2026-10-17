import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, Edit3, FolderTree, Plus, Printer, Save, Search, Trash2, X } from "lucide-react";

const API_ROOT = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;
const emptyCategory = { group_name: "", parent_group: "" };

const LANG = {
  en: {
    title: "Chart of Accounts", subtitle: "Create categories to organize General Accounts",
    add: "New Category", back: "Back to List", name: "Category Name",
    parent: "Parent Category (Optional)", noParent: "No Parent",
    actions: "Actions", search: "Search categories...", save: "Save Category", update: "Update Category",
    cancel: "Cancel", edit: "Edit", remove: "Delete", loading: "Loading categories...",
    empty: "No categories yet. Create one to organize General Accounts.",
    deleteConfirm: "Delete this category? Categories with linked accounts cannot be deleted.",
    print: "Print List", general: "General Accounts", required: "Category name is required.",
    newTitle: "New Chart Category", editTitle: "Edit Chart Category", total: "Total Categories", toggle: "اردو",
    saved: "Category saved successfully.", deleted: "Category deleted successfully.",
    noRecords: "No matching categories.",
  },
  ur: {
    title: "چارٹ آف اکاؤنٹس", subtitle: "جنرل اکاؤنٹس منظم کرنے کے لیے کیٹیگریز بنائیں",
    add: "نئی کیٹیگری", back: "فہرست پر واپس", name: "کیٹیگری کا نام",
    parent: "والدین کیٹیگری (اختیاری)", noParent: "کوئی نہیں",
    actions: "عمل", search: "کیٹیگری تلاش کریں...", save: "کیٹیگری محفوظ کریں", update: "کیٹیگری اپڈیٹ کریں",
    cancel: "منسوخ", edit: "ترمیم", remove: "حذف", loading: "کیٹیگریز لوڈ ہو رہی ہیں...",
    empty: "ابھی کوئی کیٹیگری نہیں۔ جنرل اکاؤنٹس کے لیے کیٹیگری بنائیں۔",
    deleteConfirm: "کیا یہ کیٹیگری حذف کرنی ہے؟ منسلک اکاؤنٹس والی کیٹیگری حذف نہیں ہو سکتی۔",
    print: "فہرست پرنٹ کریں", general: "جنرل اکاؤنٹس", required: "کیٹیگری کا نام ضروری ہے۔",
    newTitle: "نئی چارٹ کیٹیگری", editTitle: "چارٹ کیٹیگری میں ترمیم", total: "کل کیٹیگریز", toggle: "English",
    saved: "کیٹیگری محفوظ ہو گئی۔", deleted: "کیٹیگری حذف ہو گئی۔",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
  }
};

const unpack = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const errorMessage = error => error?.response?.data?.error || error?.response?.data?.message || error?.message || "Request failed";
const inputStyle = "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function ChartOfAccountsPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCategory);
  const [notice, setNotice] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ROOT}/account-groups`);
      setCategories(unpack(response.data));
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = useMemo(() => categories.filter(row => {
    const q = search.trim().toLowerCase();
    return !q || [row.group_name, row.parent_group, row.id].some(
      value => String(value || "").toLowerCase().includes(q)
    );
  }), [categories, search]);

  function addCategory() {
    setEditingId(null);
    setForm(emptyCategory);
    setNotice(null);
    setShowForm(true);
  }
  function editCategory(item) {
    setEditingId(item.id);
    setForm({ group_name: item.group_name || "", parent_group: item.parent_group || "" });
    setNotice(null);
    setShowForm(true);
  }
  function back() {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyCategory);
  }
  async function save(event) {
    event.preventDefault();
    if (!form.group_name.trim()) {
      setNotice({ kind: "error", text: t.required });
      return;
    }
    setSaving(true);
    try {
      const payload = { group_name: form.group_name.trim(), parent_group: form.parent_group };
      if (editingId) await axios.put(`${API_ROOT}/account-groups/${editingId}`, payload);
      else await axios.post(`${API_ROOT}/account-groups`, payload);
      setNotice({ kind: "success", text: t.saved });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyCategory);
      await fetchCategories();
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  }
  async function removeCategory(item) {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_ROOT}/account-groups/${item.id}`);
      setNotice({ kind: "success", text: t.deleted });
      await fetchCategories();
    } catch (error) { setNotice({ kind: "error", text: errorMessage(error) }); }
  }

  function printList() {
    window.print();
  }

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-3 pb-16 sm:p-4" style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, Helvetica, Arial, sans-serif" }}>
      <div className="mx-auto max-w-[1220px]">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm print:border-none print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-black text-slate-950 sm:text-2xl"><FolderTree size={23} className="text-indigo-600" /> {t.title}</h1>
              <p className="mt-1 text-xs text-slate-500">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button type="button" onClick={() => setLang(lang === "en" ? "ur" : "en")} className="h-9 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-bold text-indigo-700">{t.toggle}</button>
              {showForm ? (
                <button type="button" onClick={back} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"><ArrowLeft size={14}/>{t.back}</button>
              ) : (
                <>
                  <a href="/app/accounts/groups" className="inline-flex h-9 items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 text-xs font-bold text-indigo-700">{t.general}</a>
                  <button type="button" onClick={addCategory} className="inline-flex h-9 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-700"><Plus size={15}/>{t.add}</button>
                </>
              )}
            </div>
          </div>
        </section>

        {notice && <div role="status" className={`mb-3 rounded-xl border p-3 text-sm font-semibold ${notice.kind === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{notice.text}</div>}

        {showForm ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 text-base font-black text-slate-900">{editingId ? t.editTitle : t.newTitle}</div>
            <form onSubmit={save} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{t.name} *</span>
                  <input required autoFocus maxLength={180} className={inputStyle} value={form.group_name} onChange={e => setForm({...form,group_name:e.target.value})} placeholder={isUrdu ? "مثلاً اثاثے" : "e.g. Bank Accounts"} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{t.parent}</span>
                  <select className={inputStyle} value={form.parent_group} onChange={e => setForm({...form,parent_group:e.target.value})}>
                    <option value="">{t.noParent}</option>
                    {categories.filter(row => row.id !== editingId).map(row => <option value={row.group_name} key={row.id}>{row.group_name}</option>)}
                  </select></label>
              </div>
              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" disabled={saving} onClick={back} className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"><X size={15}/>{t.cancel}</button>
                <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-1 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white disabled:opacity-60"><Save size={15}/>{saving ? "..." : editingId ? t.update : t.save}</button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:hidden">
              <div className="flex flex-wrap gap-2">
                <div className="relative"><Search size={15} className={`absolute top-3 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}/><input className={`${inputStyle} w-[260px] max-w-full ${isUrdu ? "pr-9" : "pl-9"}`} placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)}/></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">{t.total}: {categories.length}</span>
                <button type="button" onClick={printList} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700"><Printer size={14}/>{t.print}</button>
              </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-slate-900 text-xs font-bold uppercase text-white">
                    <tr><th className="px-4 py-3 text-center">#</th><th className="px-4 py-3 text-start">{t.name}</th><th className="px-4 py-3 text-start">{t.parent}</th><th className="px-4 py-3 text-center print:hidden">{t.actions}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t.loading}</td></tr> : filtered.length ? filtered.map((row,i) => (
                      <tr key={row.id} className="hover:bg-indigo-50/40">
                        <td className="px-4 py-3 text-center text-slate-500">{i+1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{row.group_name}</td>
                        
                        <td className="px-4 py-3 text-slate-600">{row.parent_group || "—"}</td>
                        
                        <td className="px-4 py-3 text-center print:hidden"><div className="flex justify-center gap-2">
                          <button type="button" onClick={() => editCategory(row)} title={t.edit} aria-label={t.edit} className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"><Edit3 size={15}/></button>
                          <button type="button" onClick={() => removeCategory(row)} title={t.remove} aria-label={t.remove} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><Trash2 size={15}/></button>
                        </div></td>
                      </tr>
                    )) : <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">{categories.length ? t.noRecords : t.empty}</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
