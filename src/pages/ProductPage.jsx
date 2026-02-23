import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Search, Edit } from 'lucide-react';

const API       = 'http://localhost:5000/api/products';
const TYPES_API = 'http://localhost:5000/api/product-types';
const CAT_API   = 'http://localhost:5000/api/categories/by-type';
const UNITS     = ['kg', 'g', 'pcs', 'm', 'ltr', 'box', 'dz', 'set'];
const fmt       = (n) => 'PKR ' + parseFloat(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });

export default function ProductPage() {
  const [records,      setRecords]      = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [form,         setForm]         = useState({ product_name: '', product_type_id: '', category_id: '', unit: '', purchase_rate: '', sale_rate: '', reorder_level: '' });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState('');
  const [search,       setSearch]       = useState('');
  const [editId,       setEditId]       = useState(null);

  const fetchRecords = () => fetch(API).then(r => r.json()).then(d => setRecords(Array.isArray(d) ? d : []));
  const fetchTypes   = () => fetch(TYPES_API).then(r => r.json()).then(d => setProductTypes(Array.isArray(d) ? d : []));

  useEffect(() => { fetchRecords(); fetchTypes(); }, []);

  useEffect(() => {
    if (form.product_type_id) {
      fetch(`${CAT_API}/${form.product_type_id}`)
        .then(r => r.json())
        .then(d => setCategories(Array.isArray(d) ? d : []));
    } else {
      setCategories([]);
    }
  }, [form.product_type_id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const set = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'product_type_id') next.category_id = '';
      return next;
    });
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.product_name.trim()) e.product_name    = 'Product Name required hai';
    if (!form.product_type_id)     e.product_type_id = 'Product Type select karo';
    if (!form.category_id)         e.category_id     = 'Category select karo';
    if (!form.unit)                e.unit            = 'Unit select karo';
    if (!form.purchase_rate)       e.purchase_rate   = 'Purchase Rate likho';
    if (!form.sale_rate)           e.sale_rate       = 'Sale Rate likho';
    if (!form.reorder_level)       e.reorder_level   = 'Reorder Level likho';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url    = editId ? `${API}/${editId}` : API;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editId ? '✅ Update ho gaya!' : '✅ Product save ho gaya!');
      setForm({ product_name: '', product_type_id: '', category_id: '', unit: '', purchase_rate: '', sale_rate: '', reorder_level: '' });
      setEditId(null);
      setErrors({});
      fetchRecords();
    } catch (err) {
      showToast('❌ ' + err.message, 'error');
    }
    setLoading(false);
  };

  const handleEdit = (rec) => {
    setForm({
      product_name:    rec.product_name,
      product_type_id: String(rec.product_type_id),
      category_id:     String(rec.category_id),
      unit:            rec.unit,
      purchase_rate:   rec.purchase_rate,
      sale_rate:       rec.sale_rate,
      reorder_level:   rec.reorder_level,
    });
    setEditId(rec.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna hai?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    showToast('✅ Delete ho gaya!');
    fetchRecords();
  };

  const filtered = records.filter(r =>
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.type_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const codeColors = {
    RMS: 'bg-orange-100 text-orange-700',
    FTM: 'bg-purple-100 text-purple-700',
    PNT: 'bg-pink-100 text-pink-700',
    Pkg: 'bg-yellow-100 text-yellow-700',
    FMS: 'bg-green-100 text-green-700'
  };

  const margin = (r) => r.sale_rate > 0
    ? (((r.sale_rate - r.purchase_rate) / r.sale_rate) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center">
          <h1 className="text-white font-bold text-base flex items-center gap-2">
            <Plus size={18} className="text-blue-400" /> {editId ? 'Edit Product' : 'Product Setup'}
          </h1>
          <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full">
            {editId ? '✏️ Editing' : 'New Entry'}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Product Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Product Name</label>
              <input value={form.product_name} onChange={e => set('product_name', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                  ${errors.product_name ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'}`}
                placeholder="e.g. Steel Wire Roll 18 Gauge" />
              {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>}
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Product Type</label>
              <select value={form.product_type_id} onChange={e => set('product_type_id', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                  ${errors.product_type_id ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'}`}>
                <option value="">-- Type Select Karo --</option>
                {productTypes.map(t => (
                  <option key={t.id} value={t.id}>[{t.short_code}] {t.type_name}</option>
                ))}
              </select>
              {errors.product_type_id && <p className="text-red-500 text-xs mt-1">{errors.product_type_id}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Category</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                disabled={!form.product_type_id}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                  ${errors.category_id ? 'border-red-400 bg-red-50' :
                    !form.product_type_id ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' :
                    'border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'}`}>
                <option value="">{form.product_type_id ? '-- Category Select Karo --' : '-- Pehle Type Select Karo --'}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.category_name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Unit</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                  ${errors.unit ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'}`}>
                <option value="">-- Unit Select Karo --</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>

            {/* Purchase Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Purchase Rate (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 pointer-events-none">PKR</span>
                <input type="number" min="0" step="0.01" value={form.purchase_rate} onChange={e => set('purchase_rate', e.target.value)}
                  className={`w-full pl-12 pr-4 py-2.5 rounded-lg border text-sm font-mono outline-none transition
                    ${errors.purchase_rate ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white'}`}
                  placeholder="0.00" />
              </div>
              {errors.purchase_rate && <p className="text-red-500 text-xs mt-1">{errors.purchase_rate}</p>}
            </div>

            {/* Sale Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Sale Rate (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 pointer-events-none">PKR</span>
                <input type="number" min="0" step="0.01" value={form.sale_rate} onChange={e => set('sale_rate', e.target.value)}
                  className={`w-full pl-12 pr-4 py-2.5 rounded-lg border text-sm font-mono outline-none transition
                    ${errors.sale_rate ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'}`}
                  placeholder="0.00" />
              </div>
              {errors.sale_rate && <p className="text-red-500 text-xs mt-1">{errors.sale_rate}</p>}
              {form.purchase_rate && form.sale_rate && +form.sale_rate > +form.purchase_rate && (
                <p className="text-emerald-600 text-xs mt-1 font-semibold">
                  ✓ Margin: {((+form.sale_rate - +form.purchase_rate) / +form.sale_rate * 100).toFixed(1)}%
                </p>
              )}
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Reorder Level</label>
              <input type="number" min="0" value={form.reorder_level} onChange={e => set('reorder_level', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
                  ${errors.reorder_level ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'}`}
                placeholder="e.g. 25" />
              {errors.reorder_level && <p className="text-red-500 text-xs mt-1">{errors.reorder_level}</p>}
            </div>

          </div>

          <div className="mt-5 flex justify-end gap-3">
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ product_name:'',product_type_id:'',category_id:'',unit:'',purchase_rate:'',sale_rate:'',reorder_level:'' }); }}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition font-medium">
                Cancel
              </button>
            )}
            <button onClick={handleSave} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center gap-2 font-semibold text-sm">
              <Save size={16} /> {loading ? 'Saving...' : editId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Records</h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="relative w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
              placeholder="Search products..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Product Name</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-center">Unit</th>
                <th className="px-5 py-3 text-right">Purchase Rate</th>
                <th className="px-5 py-3 text-right">Sale Rate</th>
                <th className="px-5 py-3 text-center">Margin</th>
                <th className="px-5 py-3 text-center">Reorder</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan="10" className="px-5 py-10 text-center text-slate-400 text-sm">Koi product nahi — upar se add karo ☝️</td></tr>
              )}
              {filtered.map((rec, i) => (
                <tr key={rec.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-5 py-3 text-slate-400 text-xs">{rec.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{rec.product_name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${codeColors[rec.short_code] || 'bg-slate-100 text-slate-600'}`}>
                      {rec.short_code}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{rec.category_name}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{rec.unit}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-slate-600">{fmt(rec.purchase_rate)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-bold text-blue-700">{fmt(rec.sale_rate)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${+margin(rec) >= 20 ? 'bg-emerald-100 text-emerald-700' :
                        +margin(rec) >= 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'}`}>
                      {margin(rec)}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-xs font-bold text-slate-500">{rec.reorder_level}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(rec)} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-lg transition"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(rec.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}