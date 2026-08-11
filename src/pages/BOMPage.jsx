import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const RAW_API = import.meta.env.VITE_API_BASE_URL || "https://apii.alibirdcageofficial.store";
const CLEAN_API = RAW_API.replace(/\/$/, "");
const API_BASE = CLEAN_API.endsWith("/api") ? CLEAN_API : `${CLEAN_API}/api`;

const LANG = {
  en: {
    title: "Bill of Materials (BOM)",
    subtitle: "Select one product head and define all materials used in its assembly",
    add: "Create BOM", refresh: "Refresh", toggle: "اردو", search: "Search BOM...",
    code: "BOM Code", head: "Product Head", headCategory: "Head Category", outputQty: "Assembly Qty", outputUnit: "Output Unit",
    materials: "Materials Used", matCategory: "Material Category", material: "Material Product", unit: "Unit",
    qty: "Required Qty", wastage: "Wastage %", effective: "Effective Qty", rate: "Rate", cost: "Material Cost",
    addMaterial: "Add Material", labor: "Labor Cost", notes: "Notes", totalMaterials: "Materials", materialTotal: "Material Total",
    totalCost: "Total BOM Cost", unitCost: "Cost / Output Unit", save: "Save BOM", saving: "Saving...", cancel: "Cancel",
    edit: "Edit", delete: "Delete", details: "Details", actions: "Actions", noRecords: "No BOM records found.",
    loading: "Loading...", selectHead: "-- Select Product Head --", selectCategory: "-- Select Category --",
    selectMaterial: "-- Select Material --", close: "Close", saved: "BOM saved successfully.", updated: "BOM updated successfully.",
    deleted: "BOM deleted successfully.", loadError: "Failed to load BOM data.", saveError: "Failed to save BOM.",
    deleteError: "Failed to delete BOM.", confirmDelete: "Are you sure you want to delete this BOM?",
    needHead: "Select a product head.", needQty: "Assembly quantity must be greater than zero.",
    needMaterial: "Complete at least one material row with category, product and quantity.", duplicate: "Same material cannot be added twice.",
    self: "Product head cannot be used as its own material.", categoryHelp: "Select category first; material list will only show products from that category.",
  },
  ur: {
    title: "بل آف مٹیریلز (BOM)",
    subtitle: "ایک پروڈکٹ ہیڈ منتخب کریں اور اسمبلی میں استعمال ہونے والا تمام میٹریل مقرر کریں",
    add: "نیا BOM", refresh: "ریفریش", toggle: "English", search: "BOM تلاش کریں...",
    code: "BOM کوڈ", head: "پروڈکٹ ہیڈ", headCategory: "ہیڈ کیٹیگری", outputQty: "اسمبلی مقدار", outputUnit: "آؤٹ پٹ یونٹ",
    materials: "استعمال ہونے والا میٹریل", matCategory: "میٹریل کیٹیگری", material: "میٹریل پروڈکٹ", unit: "یونٹ",
    qty: "مطلوبہ مقدار", wastage: "ویسٹج %", effective: "مؤثر مقدار", rate: "ریٹ", cost: "میٹریل لاگت",
    addMaterial: "میٹریل شامل کریں", labor: "لیبر لاگت", notes: "نوٹس", totalMaterials: "میٹریلز", materialTotal: "میٹریل ٹوٹل",
    totalCost: "کل BOM لاگت", unitCost: "فی یونٹ لاگت", save: "BOM محفوظ کریں", saving: "محفوظ ہو رہا ہے...", cancel: "منسوخ",
    edit: "ترمیم", delete: "حذف", details: "تفصیل", actions: "عمل", noRecords: "کوئی BOM ریکارڈ نہیں ملا۔",
    loading: "لوڈ ہو رہا ہے...", selectHead: "-- پروڈکٹ ہیڈ منتخب کریں --", selectCategory: "-- کیٹیگری منتخب کریں --",
    selectMaterial: "-- میٹریل منتخب کریں --", close: "بند کریں", saved: "BOM محفوظ ہو گیا۔", updated: "BOM اپڈیٹ ہو گیا۔",
    deleted: "BOM حذف ہو گیا۔", loadError: "BOM ڈیٹا لوڈ نہیں ہو سکا۔", saveError: "BOM محفوظ نہیں ہو سکا۔",
    deleteError: "BOM حذف نہیں ہو سکا۔", confirmDelete: "کیا آپ واقعی یہ BOM حذف کرنا چاہتے ہیں؟",
    needHead: "پروڈکٹ ہیڈ منتخب کریں۔", needQty: "اسمبلی مقدار صفر سے زیادہ ہونی چاہیے۔",
    needMaterial: "کم از کم ایک مکمل میٹریل رو شامل کریں۔", duplicate: "ایک ہی میٹریل دو بار شامل نہیں ہو سکتا۔",
    self: "پروڈکٹ ہیڈ کو میٹریل کے طور پر استعمال نہیں کیا جا سکتا۔", categoryHelp: "پہلے کیٹیگری منتخب کریں؛ صرف اسی کیٹیگری کے پروڈکٹس نظر آئیں گے۔",
  },
};

const list = (x) => Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : Array.isArray(x?.rows) ? x.rows : Array.isArray(x?.items) ? x.items : [];
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const money = (v) => `₨ ${n(v).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
const productName = (p) => p?.product_name || p?.name || "";
const categoryName = (c) => c?.category_name || c?.name || "";
const unitName = (u) => u?.unit_name || u?.name || u?.symbol || "";
const productCategoryId = (p) => p?.category_id ?? p?.product_category_id ?? "";
const productUnitId = (p) => p?.unit_id ?? "";
const active = (p) => !["0", "false", "inactive", "disabled"].includes(String(p?.is_active ?? p?.active ?? "1").toLowerCase());

const newRow = () => ({ key: `${Date.now()}-${Math.random()}`, category_id: "", product_id: "", qty: "", wastage_percent: "0", rate: "" });
const blankForm = () => ({ bom_code: `BOM-${Date.now().toString().slice(-6)}`, product_id: "", output_qty: "1", labor_cost: "", notes: "", items: [newRow()] });

function normalizeBom(r) {
  const items = list(r?.items).length ? list(r.items) : list(r?.materials).length ? list(r.materials) : r?.raw_material ? [{ raw_material: r.raw_material, qty: r.qty, rate: r.rate }] : [];
  return {
    ...r,
    product_id: r?.product_id ?? r?.head_product_id ?? r?.finished_product_id ?? "",
    product_name: r?.product_name ?? r?.head_product_name ?? r?.finished_product_name ?? "",
    category_name: r?.category_name ?? r?.product_category_name ?? "",
    output_qty: r?.output_qty ?? r?.batch_size ?? 1,
    items: items.map((x, i) => ({
      ...x, key: x?.id || `saved-${r?.id}-${i}`,
      category_id: x?.category_id ?? x?.material_category_id ?? "",
      product_id: x?.product_id ?? x?.material_product_id ?? "",
      product_name: x?.product_name ?? x?.material_name ?? x?.raw_material ?? "",
      qty: x?.qty ?? x?.quantity ?? x?.required_qty ?? "",
      wastage_percent: x?.wastage_percent ?? x?.wastage ?? 0,
      rate: x?.rate ?? x?.unit_rate ?? 0,
    })),
  };
}

export default function BOMPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const rtl = lang === "ur";
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const toast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [b, p, c, u] = await Promise.all([
        axios.get(`${API_BASE}/bom`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/units`),
      ]);
      setRecords(list(b.data).map(normalizeBom));
      setProducts(list(p.data));
      setCategories(list(c.data));
      setUnits(list(u.data));
    } catch (e) {
      toast("error", e?.response?.data?.error || e?.response?.data?.message || t.loadError);
    } finally { setLoading(false); }
  }, [t.loadError, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const categoryMap = useMemo(() => new Map(categories.map(c => [String(c.id), categoryName(c)])), [categories]);
  const unitMap = useMemo(() => new Map(units.map(u => [String(u.id), unitName(u)])), [units]);
  const productMap = useMemo(() => new Map(products.map(p => [String(p.id), p])), [products]);
  const usableProducts = useMemo(() => products.filter(active), [products]);
  const head = productMap.get(String(form.product_id));
  const headCategory = head?.category_name || categoryMap.get(String(productCategoryId(head))) || "-";
  const headUnit = head?.unit_name || unitMap.get(String(productUnitId(head))) || "-";

  const rows = useMemo(() => form.items.map(x => {
    const p = productMap.get(String(x.product_id));
    const qty = n(x.qty), waste = n(x.wastage_percent), effective = qty + qty * waste / 100, rate = n(x.rate);
    return { ...x, product: p, product_name: productName(p) || x.product_name || "-", unit_name: p?.unit_name || unitMap.get(String(productUnitId(p))) || "-", category_name: p?.category_name || categoryMap.get(String(x.category_id)) || "-", effective, cost: effective * rate };
  }), [form.items, productMap, unitMap, categoryMap]);

  const materialTotal = rows.reduce((s, x) => s + x.cost, 0);
  const totalCost = materialTotal + n(form.labor_cost);
  const perUnit = n(form.output_qty) > 0 ? totalCost / n(form.output_qty) : 0;

  const openAdd = () => { setEditingId(null); setForm(blankForm()); setShowForm(true); };
  const closeForm = () => { if (!saving) { setShowForm(false); setEditingId(null); } };

  const openEdit = (r) => {
    const b = normalizeBom(r);
    let headId = b.product_id;
    if (!headId && b.product_name) headId = products.find(p => productName(p).toLowerCase() === String(b.product_name).toLowerCase())?.id || "";
    setEditingId(b.id);
    setForm({
      bom_code: b.bom_code || `BOM-${b.id}`,
      product_id: headId || "",
      output_qty: String(b.output_qty || 1),
      labor_cost: String(b.labor_cost || ""),
      notes: b.notes || "",
      items: b.items.length ? b.items.map(x => ({ key: x.key || `${Date.now()}-${Math.random()}`, category_id: String(x.category_id || ""), product_id: String(x.product_id || ""), qty: String(x.qty ?? ""), wastage_percent: String(x.wastage_percent ?? 0), rate: String(x.rate ?? "") })) : [newRow()],
    });
    setShowForm(true);
  };

  const changeRow = (key, field, value) => setForm(f => ({ ...f, items: f.items.map(x => x.key !== key ? x : field === "category_id" ? { ...x, category_id: value, product_id: "" } : { ...x, [field]: value }) }));
  const addRow = () => setForm(f => ({ ...f, items: [...f.items, newRow()] }));
  const removeRow = (key) => setForm(f => f.items.length === 1 ? f : ({ ...f, items: f.items.filter(x => x.key !== key) }));
  const optionsFor = (row) => !row.category_id ? [] : usableProducts.filter(p => String(productCategoryId(p)) === String(row.category_id) && String(p.id) !== String(form.product_id));

  const validate = () => {
    if (!form.product_id) return toast("error", t.needHead), false;
    if (n(form.output_qty) <= 0) return toast("error", t.needQty), false;
    if (!form.items.length || form.items.some(x => !x.category_id || !x.product_id || n(x.qty) <= 0)) return toast("error", t.needMaterial), false;
    if (form.items.some(x => String(x.product_id) === String(form.product_id))) return toast("error", t.self), false;
    const ids = form.items.map(x => String(x.product_id));
    if (new Set(ids).size !== ids.length) return toast("error", t.duplicate), false;
    return true;
  };

  const payload = () => ({
    bom_code: form.bom_code,
    product_id: Number(form.product_id),
    product_name: productName(head),
    product_category_id: productCategoryId(head) ? Number(productCategoryId(head)) : null,
    category_name: headCategory,
    output_qty: n(form.output_qty), batch_size: n(form.output_qty), bom_type: "Assembly",
    output_unit_id: productUnitId(head) ? Number(productUnitId(head)) : null,
    output_unit_name: headUnit,
    labor_cost: n(form.labor_cost), notes: form.notes.trim(), material_total: Number(materialTotal.toFixed(2)), total_cost: Number(totalCost.toFixed(2)), per_unit_cost: Number(perUnit.toFixed(4)),
    items: rows.map(x => ({ category_id: Number(x.category_id), category_name: x.category_name, product_id: Number(x.product_id), product_name: x.product_name, unit_id: productUnitId(x.product) ? Number(productUnitId(x.product)) : null, unit_name: x.unit_name, qty: n(x.qty), required_qty: n(x.qty), wastage_percent: n(x.wastage_percent), effective_qty: Number(x.effective.toFixed(4)), rate: n(x.rate), material_cost: Number(x.cost.toFixed(2)), total: Number(x.cost.toFixed(2)) })),
  });

  const saveBom = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const data = payload();
      if (editingId) { await axios.put(`${API_BASE}/bom/${editingId}`, data); toast("success", t.updated); }
      else { await axios.post(`${API_BASE}/bom`, data); toast("success", t.saved); }
      setShowForm(false); setEditingId(null); await loadData();
    } catch (e) {
      console.error("BOM save:", e?.response?.data || e);
      toast("error", e?.response?.data?.error || e?.response?.data?.message || t.saveError);
    } finally { setSaving(false); }
  };

  const deleteBom = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await axios.delete(`${API_BASE}/bom/${id}`); toast("success", t.deleted); await loadData(); }
    catch (e) { toast("error", e?.response?.data?.error || e?.response?.data?.message || t.deleteError); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(r => [r.bom_code, r.product_name, r.category_name, ...(r.items || []).map(x => x.product_name || x.raw_material)].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [records, search]);

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-3 pb-16 sm:p-4" style={{ fontFamily: rtl ? "'Noto Nastaliq Urdu', serif" : "Inter, Arial, sans-serif" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {message.text && <div className={`fixed bottom-5 z-[150] rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-2xl ${rtl ? "left-5" : "right-5"} ${message.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>{message.text}</div>}

      <main className="mx-auto max-w-[1220px]">
        <section className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-xl font-black text-slate-950 sm:text-2xl">{t.title}</h1><p className="mt-0.5 text-[11px] text-slate-500">{t.subtitle}</p></div>
            <div className="flex gap-2"><TopButton onClick={() => setLang(x => x === "en" ? "ur" : "en")} soft icon="bi-translate">{t.toggle}</TopButton><TopButton onClick={loadData} soft icon="bi-arrow-clockwise">{t.refresh}</TopButton><TopButton onClick={openAdd} icon="bi-plus-lg">{t.add}</TopButton></div>
          </div>
        </section>

        <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="relative max-w-lg"><i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${rtl ? "right-3" : "left-3"}`} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className={`h-9 w-full rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${rtl ? "pr-9 pl-3" : "pl-9 pr-3"}`} /></div></section>

        <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <table className="w-full table-fixed text-xs"><colgroup><col style={{width:"5%"}}/><col style={{width:"14%"}}/><col style={{width:"25%"}}/><col style={{width:"18%"}}/><col style={{width:"10%"}}/><col style={{width:"9%"}}/><col style={{width:"10%"}}/><col style={{width:"9%"}}/></colgroup>
            <thead className="bg-slate-900 text-white"><tr><Th c>#</Th><Th>{t.code}</Th><Th>{t.head}</Th><Th>{t.headCategory}</Th><Th c>{t.outputQty}</Th><Th c>{t.totalMaterials}</Th><Th r>{t.totalCost}</Th><Th c>{t.actions}</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={8} className="py-10 text-center text-slate-400">{t.loading}</td></tr> : filtered.length === 0 ? <tr><td colSpan={8} className="py-10 text-center text-slate-400">{t.noRecords}</td></tr> : filtered.map((b,i) => <tr key={b.id} className="hover:bg-indigo-50/40"><Td c muted>{i+1}</Td><Td><span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-[9px] font-black text-indigo-700">{b.bom_code || `BOM-${b.id}`}</span></Td><Td><b className="text-slate-950">{b.product_name || "-"}</b></Td><Td>{b.category_name || "-"}</Td><Td c>{b.output_qty || 1}</Td><Td c><button onClick={() => setSelected(b)} className="rounded-lg bg-indigo-600 px-2 py-1.5 text-[9px] font-black text-white"><i className="bi bi-list-check mr-1"/>{b.items?.length || 0}</button></Td><Td r><b className="font-mono text-indigo-700">{money(b.total_cost ?? b.total ?? 0)}</b></Td><Td c><div className="flex justify-center gap-1"><IconButton green icon="bi-pencil-square" onClick={() => openEdit(b)}/><IconButton red icon="bi-trash3" onClick={() => deleteBom(b.id)}/></div></Td></tr>)}
            </tbody>
          </table>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:hidden">{filtered.map((b,i) => <article key={b.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex justify-between gap-2"><div><div className="text-[9px] font-black text-indigo-700">{b.bom_code || `BOM-${b.id}`}</div><h3 className="mt-1 text-sm font-black text-slate-950">{b.product_name}</h3><p className="text-[10px] text-slate-500">{b.category_name || "-"}</p></div><button onClick={() => setSelected(b)} className="h-8 rounded-lg bg-indigo-600 px-2 text-[9px] font-black text-white">{b.items?.length || 0} {t.totalMaterials}</button></div><div className="mt-2 grid grid-cols-2 gap-1.5"><Info label={t.outputQty} value={b.output_qty || 1}/><Info label={t.totalCost} value={money(b.total_cost ?? 0)}/></div><div className="mt-2 grid grid-cols-2 gap-1.5"><button onClick={() => openEdit(b)} className="h-8 rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-700">{t.edit}</button><button onClick={() => deleteBom(b.id)} className="h-8 rounded-lg bg-rose-50 text-[10px] font-black text-rose-600">{t.delete}</button></div></article>)}</section>
      </main>

      {showForm && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && closeForm()}><div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><i className="bi bi-diagram-3-fill"/></div><div><h2 className="text-base font-black text-slate-950">{editingId ? t.edit : t.add}</h2><p className="text-[9px] text-slate-500">{t.categoryHelp}</p></div></div><button onClick={closeForm} className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><i className="bi bi-x-lg"/></button></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <section className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3"><div className="grid gap-2 md:grid-cols-6"><Field label={t.code}><input className="field font-mono" value={form.bom_code} onChange={e => setForm(f => ({...f,bom_code:e.target.value}))}/></Field><Field label={t.head} span="md:col-span-2"><select className="field" value={form.product_id} onChange={e => setForm(f => ({...f,product_id:e.target.value,items:f.items.map(x => String(x.product_id)===String(e.target.value)?{...x,product_id:""}:x)}))}><option value="">{t.selectHead}</option>{usableProducts.map(p => <option key={p.id} value={p.id}>{productName(p)}</option>)}</select></Field><Field label={t.headCategory}><Read>{headCategory}</Read></Field><Field label={t.outputQty}><input type="number" min="0.0001" step="any" className="field" value={form.output_qty} onChange={e => setForm(f => ({...f,output_qty:e.target.value}))}/></Field><Field label={t.outputUnit}><Read>{headUnit}</Read></Field></div></section>

          <section className="overflow-hidden rounded-xl border border-slate-200"><div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5"><div><h3 className="text-xs font-black text-slate-950">{t.materials}</h3><p className="text-[9px] text-slate-500">{t.categoryHelp}</p></div><button onClick={addRow} className="h-8 rounded-lg bg-indigo-600 px-3 text-[10px] font-black text-white"><i className="bi bi-plus-lg mr-1"/>{t.addMaterial}</button></div>
            <div className="hidden lg:block"><div className="grid grid-cols-[32px_1.2fr_1.6fr_.7fr_.7fr_.7fr_.8fr_.8fr_36px] gap-1.5 bg-slate-900 px-2 py-2 text-[8px] font-black uppercase text-white"><div>#</div><div>{t.matCategory}</div><div>{t.material}</div><div>{t.unit}</div><div>{t.qty}</div><div>{t.wastage}</div><div>{t.effective}</div><div>{t.rate}</div><div/></div>{rows.map((x,i) => <div key={x.key} className="grid grid-cols-[32px_1.2fr_1.6fr_.7fr_.7fr_.7fr_.8fr_.8fr_36px] gap-1.5 border-b border-slate-100 px-2 py-2"><div className="flex items-center justify-center text-[9px] font-black text-slate-400">{i+1}</div><select className="field h-8 text-[9px]" value={x.category_id} onChange={e => changeRow(x.key,"category_id",e.target.value)}><option value="">{t.selectCategory}</option>{categories.map(c => <option key={c.id} value={c.id}>{categoryName(c)}</option>)}</select><select className="field h-8 text-[9px]" disabled={!x.category_id} value={x.product_id} onChange={e => changeRow(x.key,"product_id",e.target.value)}><option value="">{t.selectMaterial}</option>{optionsFor(x).map(p => <option key={p.id} value={p.id}>{productName(p)}</option>)}</select><Read small>{x.unit_name}</Read><input type="number" className="field h-8 text-[9px]" value={x.qty} onChange={e => changeRow(x.key,"qty",e.target.value)}/><input type="number" className="field h-8 text-[9px]" value={x.wastage_percent} onChange={e => changeRow(x.key,"wastage_percent",e.target.value)}/><Read small>{x.effective.toLocaleString("en-PK",{maximumFractionDigits:4})}</Read><input type="number" className="field h-8 text-[9px]" value={x.rate} onChange={e => changeRow(x.key,"rate",e.target.value)}/><button disabled={form.items.length===1} onClick={() => removeRow(x.key)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 disabled:opacity-30"><i className="bi bi-trash3"/></button></div>)}</div>
            <div className="grid gap-2 p-2 lg:hidden">{rows.map((x,i) => <article key={x.key} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"><div className="mb-2 flex justify-between"><b className="text-[10px] text-indigo-700">{t.material} #{i+1}</b><button disabled={form.items.length===1} onClick={() => removeRow(x.key)} className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600"><i className="bi bi-trash3"/></button></div><div className="grid gap-2 sm:grid-cols-2"><Field label={t.matCategory}><select className="field" value={x.category_id} onChange={e => changeRow(x.key,"category_id",e.target.value)}><option value="">{t.selectCategory}</option>{categories.map(c => <option key={c.id} value={c.id}>{categoryName(c)}</option>)}</select></Field><Field label={t.material}><select className="field" value={x.product_id} onChange={e => changeRow(x.key,"product_id",e.target.value)}><option value="">{t.selectMaterial}</option>{optionsFor(x).map(p => <option key={p.id} value={p.id}>{productName(p)}</option>)}</select></Field><Field label={t.unit}><Read>{x.unit_name}</Read></Field><Field label={t.qty}><input type="number" className="field" value={x.qty} onChange={e => changeRow(x.key,"qty",e.target.value)}/></Field><Field label={t.wastage}><input type="number" className="field" value={x.wastage_percent} onChange={e => changeRow(x.key,"wastage_percent",e.target.value)}/></Field><Field label={t.rate}><input type="number" className="field" value={x.rate} onChange={e => changeRow(x.key,"rate",e.target.value)}/></Field></div><div className="mt-2 grid grid-cols-2 gap-1.5"><Info label={t.effective} value={x.effective}/><Info label={t.cost} value={money(x.cost)}/></div></article>)}</div>
          </section>

          <section className="mt-3 grid gap-2 lg:grid-cols-[1fr_390px]"><div className="rounded-xl border border-slate-200 bg-white p-3"><Field label={t.notes}><textarea rows={3} className="field min-h-[76px] py-2" value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))}/></Field></div><div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3"><div className="grid grid-cols-2 gap-2"><Field label={t.labor}><input type="number" className="field" value={form.labor_cost} onChange={e => setForm(f => ({...f,labor_cost:e.target.value}))}/></Field><Info label={t.totalMaterials} value={rows.length}/><Info label={t.materialTotal} value={money(materialTotal)}/><Info label={t.totalCost} value={money(totalCost)}/><div className="col-span-2"><Info accent label={t.unitCost} value={money(perUnit)}/></div></div></div></section>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3"><button onClick={closeForm} className="h-9 rounded-lg border border-indigo-200 bg-indigo-50 px-4 text-xs font-black text-indigo-700">{t.cancel}</button><button disabled={saving} onClick={saveBom} className="h-9 rounded-lg bg-indigo-600 px-4 text-xs font-black text-white disabled:opacity-60">{saving ? t.saving : t.save}</button></div>
      </div></div>}

      {selected && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-3" onMouseDown={e => e.target===e.currentTarget && setSelected(null)}><div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"><div><h2 className="font-black text-slate-950">{t.details}</h2><p className="text-[10px] text-slate-500">{selected.bom_code} · {selected.product_name}</p></div><button onClick={() => setSelected(null)} className="h-8 w-8 rounded-lg bg-indigo-600 text-white"><i className="bi bi-x-lg"/></button></div><div className="max-h-[75vh] overflow-auto p-3"><div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><Info label={t.head} value={selected.product_name}/><Info label={t.headCategory} value={selected.category_name || "-"}/><Info label={t.outputQty} value={selected.output_qty || 1}/><Info accent label={t.totalMaterials} value={selected.items?.length || 0}/></div><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[760px] text-[10px]"><thead className="bg-slate-900 text-white"><tr><Th c>#</Th><Th>{t.matCategory}</Th><Th>{t.material}</Th><Th>{t.unit}</Th><Th r>{t.qty}</Th><Th r>{t.wastage}</Th><Th r>{t.rate}</Th><Th r>{t.cost}</Th></tr></thead><tbody>{(selected.items||[]).map((x,i) => <tr key={x.id||x.key||i} className="border-b border-slate-100"><Td c>{i+1}</Td><Td>{x.category_name || categoryMap.get(String(x.category_id)) || "-"}</Td><Td><b>{x.product_name || x.raw_material || "-"}</b></Td><Td>{x.unit_name || "-"}</Td><Td r>{x.qty || x.required_qty || 0}</Td><Td r>{x.wastage_percent || 0}%</Td><Td r>{money(x.rate)}</Td><Td r>{money(x.material_cost ?? x.total ?? n(x.qty)*n(x.rate))}</Td></tr>)}</tbody></table></div></div></div></div>}

      <style>{`.field{width:100%;height:36px;border:1px solid #cbd5e1;border-radius:9px;background:#f8fafc;padding:0 10px;color:#0f172a;font-size:11px;outline:none}.field:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}.field:disabled{background:#f1f5f9;color:#94a3b8}`}</style>
    </div>
  );
}

function TopButton({children,onClick,soft=false,icon}) { return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-black ${soft ? "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}><i className={`bi ${icon}`}/>{children}</button>; }
function Field({label,children,span=""}) { return <div className={span}><label className="mb-1 block text-[9px] font-black text-slate-500">{label}</label>{children}</div>; }
function Read({children,small=false}) { return <div className={`flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 px-2 font-bold text-slate-600 ${small ? "text-[9px]" : "text-[10px]"}`}>{children || "-"}</div>; }
function Info({label,value,accent=false}) { return <div className={`rounded-lg border p-2 ${accent ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}><div className="text-[8px] font-black uppercase text-slate-500">{label}</div><div className={`mt-1 text-[10px] font-black ${accent ? "text-indigo-700" : "text-slate-950"}`}>{value}</div></div>; }
function IconButton({icon,onClick,green,red}) { return <button type="button" onClick={onClick} className={`flex h-7 w-7 items-center justify-center rounded-lg ${green ? "bg-emerald-50 text-emerald-700" : red ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-700"}`}><i className={`bi ${icon}`}/></button>; }
function Th({children,c=false,r=false}) { return <th className={`px-2 py-2.5 text-[8px] font-black uppercase ${c ? "text-center" : r ? "text-right" : "text-left"}`}>{children}</th>; }
function Td({children,c=false,r=false,muted=false}) { return <td className={`px-2 py-2.5 text-[10px] ${c ? "text-center" : r ? "text-right" : "text-left"} ${muted ? "text-slate-400" : "text-slate-600"}`}>{children}</td>; }
