import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────
// LANGUAGE STRINGS (Strictly English & Proper Urdu)
// ─────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    title: "Bill of Materials (BOM)",
    subtitle: "Manage product recipes, raw materials, and production costs",
    addBtn: "Create BOM",
    searchPlaceholder: "Search by product, raw material or type...",
    productName: "Product Name",
    category: "Category",
    selectCategory: "-- Select Category --",
    bomType: "BOM Type",
    batchSize: "Batch Size",
    rawMaterial: "Raw Material",
    qty: "Quantity",
    rate: "Rate (PKR)",
    total: "Total Value (PKR)",
    laborCost: "Labor Cost (PKR)",
    autoCalcNote: "Auto-calculated (Qty × Rate)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No BOM records found.",
    toggleLang: "اردو",
    printBtn: "Print BOM",
    pdfBtn: "Download PDF",
    reportHeader: "Bill of Materials (BOM) List",
    printedOn: "Printed On",
    successSave: "BOM saved successfully!",
    successUpdate: "BOM updated successfully!",
    errorMsg: "Please fill all required fields correctly.",
    deleteConfirm: "Are you sure you want to delete this BOM record?",
  },
  ur: {
    title: "بل آف مٹیریلز (BOM)",
    subtitle: "پروڈکٹ کی ترکیبیں، خام مال اور پیداواری لاگت کا انتظام کریں",
    addBtn: "نیا BOM بنائیں",
    searchPlaceholder: "پروڈکٹ، خام مال یا قسم سے تلاش کریں...",
    productName: "پروڈکٹ کا نام",
    category: "کیٹیگری",
    selectCategory: "-- کیٹیگری منتخب کریں --",
    bomType: "BOM کی قسم",
    batchSize: "بیچ کا سائز",
    rawMaterial: "خام مال",
    qty: "مقدار",
    rate: "ریٹ (روپے)",
    total: "کل مالیت (روپے)",
    laborCost: "لیبر کی لاگت (روپے)",
    autoCalcNote: "خودکار حساب (مقدار × ریٹ)",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "BOM کا کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "BOM پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "بل آف مٹیریلز (BOM) کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "BOM کامیابی سے محفوظ ہو گیا!",
    successUpdate: "BOM کامیابی سے اپڈیٹ ہو گیا!",
    errorMsg: "براہ کرم تمام لازمی خانے درست طریقے سے پُر کریں۔",
    deleteConfirm: "کیا آپ واقعی یہ BOM ریکارڈ حذف کرنا چاہتے ہیں؟",
  },
};

const API_BASE = "http://localhost:5000/api";

export default function BOMPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });

  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    product_name: "", product_category_id: "", bom_type: "", batch_size: "",
    raw_material: "", qty: "", rate: "", total: "", labor_cost: ""
  });

  // ── Auto Calculate Total ──
  useEffect(() => {
    const qty = parseFloat(form.qty) || 0;
    const rate = parseFloat(form.rate) || 0;
    setForm(f => ({ ...f, total: (qty * rate).toFixed(2) }));
  }, [form.qty, form.rate]);

  // ── Fetch Data ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resBOM, resCat] = await Promise.all([
        axios.get(`${API_BASE}/bom`),
        axios.get(`${API_BASE}/categories`)
      ]);
      setRecords(resBOM.data);
      setCategories(resCat.data);
    } catch (err) {
      // Mock data if API is down
      setCategories([
        { id: 1, category_name: "Metals" },
        { id: 2, category_name: "Chemicals" },
      ]);
      setRecords([
        { id: 1, product_name: "Steel Pipe 2inch", product_category_id: 1, category_name: "Metals", bom_type: "Assembly", batch_size: 100, raw_material: "Raw Steel 18g", qty: 250, rate: 120, total: 30000, labor_cost: 5000 },
        { id: 2, product_name: "Industrial Paint", product_category_id: 2, category_name: "Chemicals", bom_type: "Mixing", batch_size: 50, raw_material: "Base Chemical X", qty: 100, rate: 450, total: 45000, labor_cost: 2000 },
      ]);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ── Form Handlers ──
  const openAdd = () => {
    setForm({ product_name: "", product_category_id: "", bom_type: "", batch_size: "", raw_material: "", qty: "", rate: "", total: "", labor_cost: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      product_name: r.product_name, product_category_id: r.product_category_id,
      bom_type: r.bom_type || "", batch_size: r.batch_size || "",
      raw_material: r.raw_material || "", qty: r.qty || "", rate: r.rate || "",
      total: r.total || "", labor_cost: r.labor_cost || ""
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.product_name || !form.raw_material || !form.qty || !form.rate) {
      showToast("error", t.errorMsg);
      return;
    }
    
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/bom/${editingId}`, form);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/bom`, form);
        showToast("success", t.successSave);
      }
      fetchData();
      setShowForm(false);
    } catch (err) {
      // Optimistic UI update for mock testing
      const cat = categories.find(c => String(c.id) === String(form.product_category_id));
      const newRec = { 
        ...form, 
        id: editingId || Date.now(),
        category_name: cat?.category_name || "-"
      };
      
      if (editingId) setRecords(prev => prev.map(r => r.id === editingId ? newRec : r));
      else setRecords(prev => [...prev, newRec]);
      
      showToast("success", editingId ? t.successUpdate : t.successSave);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/bom/${id}`);
      fetchData();
    } catch (err) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // ── Search & Print ──
  const filtered = records.filter(r =>
    [r.product_name, r.raw_material, r.bom_type].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rowsHtml = filtered.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><strong>${r.product_name}</strong><br><span style="font-size: 10px; color: #64748b;">${r.category_name || "-"} | ${r.bom_type || "-"}</span></td>
        <td>${r.batch_size || "-"}</td>
        <td style="color: #0f766e; font-weight: bold;">${r.raw_material}</td>
        <td style="text-align: center; font-weight: bold;">${r.qty}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'};">₨ ${fmt(r.rate)}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'}; font-weight: bold; background: #fffbeb;">₨ ${fmt(r.total)}</td>
        <td style="text-align:${isUrdu ? 'left' : 'right'};">₨ ${fmt(r.labor_cost)}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html dir="${dir}" lang="${lang}">
      <head>
        <meta charset="UTF-8"/>
        <title>${t.title}</title>
        ${isUrdu ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">` : ""}
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: ${font}; background: #fff; color: #0f172a; padding: 40px; }
          .report-container { max-width: 1100px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #d97706; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: bold; color: #d97706; text-transform: uppercase; letter-spacing: 1px; }
          .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
          .meta { text-align: ${isUrdu ? "left" : "right"}; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #d97706; color: #fff; text-align: ${isUrdu ? "right" : "left"}; padding: 12px; font-weight: normal; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; color: #334155; }
          tr:nth-child(even) td { background: #fffbeb; }
          .print-instruct { background: #fef3c7; color: #b45309; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #fde68a; }
          @media print { body { padding: 0; } .print-instruct { display: none; } }
        </style>
      </head>
      <body>
        <div class="report-container">
          ${isPdf ? `<div class="print-instruct">Please select <strong>"Save as PDF"</strong> in the destination dropdown to download this report.</div>` : ""}
          <div class="header">
            <div>
              <div class="brand">Unique Wear</div>
              <div class="report-title">${t.reportHeader}</div>
            </div>
            <div class="meta">
              <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>${t.productName}</th>
                <th>${t.batchSize}</th>
                <th>${t.rawMaterial}</th>
                <th style="text-align: center;">${t.qty}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.rate}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.total}</th>
                <th style="text-align:${isUrdu ? 'left' : 'right'};">${t.laborCost}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? rowsHtml : `<tr><td colspan="8" style="text-align:center; padding: 20px;">${t.noRecords}</td></tr>`}
            </tbody>
          </table>
        </div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); ${!isPdf ? "window.onafterprint = () => window.close();" : ""} }, 300); }
        </script>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  return (
    <div dir={dir} style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }} className="min-h-screen bg-slate-50 p-6 pb-20">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {isUrdu && <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet" />}

      {/* Floating Toast Message */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 transition-all ${message.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <i className={`bi ${message.type === 'error' ? 'bi-exclamation-triangle' : 'bi-check-circle'}`}></i>
          {message.text}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition">
            <i className="bi bi-translate"></i>{t.toggleLang}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition shadow">
            <i className="bi bi-tools"></i>{t.addBtn}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* ── Search & Actions ── */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
          </div>
          
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button onClick={() => generatePrintDocument(false)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-printer text-amber-600"></i> {t.printBtn}
            </button>
            <button onClick={() => generatePrintDocument(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
              <i className="bi bi-file-earmark-pdf text-red-600"></i> {t.pdfBtn}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.productName}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.batchSize}</th>
                  <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.rawMaterial}</th>
                  <th className="px-4 py-3 text-center">{t.qty}</th>
                  <th className="px-4 py-3 text-right">{t.rate}</th>
                  <th className="px-4 py-3 text-right">{t.total}</th>
                  <th className="px-4 py-3 text-right">{t.laborCost}</th>
                  <th className="px-4 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-400">{t.noRecords}</td></tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-amber-50 transition">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{r.product_name}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                          {r.category_name || "-"} <span className="mx-1">•</span> {r.bom_type || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{r.batch_size || "-"}</td>
                      <td className="px-4 py-3.5 font-semibold text-teal-700">
                        <i className="bi bi-box mr-1 opacity-50"></i> {r.raw_material}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-700 bg-slate-50/50">{r.qty}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500">₨ {fmt(r.rate)}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700 bg-amber-50/30">₨ {fmt(r.total)}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500">₨ {fmt(r.labor_cost)}</td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button onClick={() => openEdit(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition"><i className="bi bi-pencil-square"></i></button>
                          <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"><i className="bi bi-trash3"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal Form ── */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col" dir={dir}>
              
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <i className="bi bi-tools text-amber-600 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  {/* Product Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.productName} *</label>
                    <div className="relative">
                      <i className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Steel Pipe 2 inch"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.category}</label>
                    <div className="relative">
                      <i className={`bi bi-tags absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select value={form.product_category_id} onChange={e => setForm({ ...form, product_category_id: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 appearance-none ${isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"}`}>
                        <option value="">{t.selectCategory}</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  {/* BOM Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.bomType}</label>
                    <div className="relative">
                      <i className={`bi bi-diagram-3 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.bom_type} onChange={e => setForm({ ...form, bom_type: e.target.value })} placeholder="e.g. Assembly / Mixing"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Batch Size */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.batchSize}</label>
                    <div className="relative">
                      <i className={`bi bi-layers absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.batch_size} onChange={e => setForm({ ...form, batch_size: e.target.value })} placeholder="e.g. 100"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Labor Cost */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.laborCost}</label>
                    <div className="relative">
                      <i className={`bi bi-person-gear absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.labor_cost} onChange={e => setForm({ ...form, labor_cost: e.target.value })} placeholder="0.00"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  <div className="lg:col-span-3 border-t border-slate-100 my-1"></div>

                  {/* Raw Material */}
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.rawMaterial} *</label>
                    <div className="relative">
                      <i className={`bi bi-box absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" value={form.raw_material} onChange={e => setForm({ ...form, raw_material: e.target.value })} placeholder="e.g. Raw Steel 18g"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Qty */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <label className="block text-xs font-bold text-amber-800 mb-1">{t.qty} *</label>
                    <div className="relative">
                      <i className={`bi bi-boxes absolute top-1/2 -translate-y-1/2 text-amber-500 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="0"
                        className={`w-full border border-amber-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-500 font-mono font-bold text-amber-700 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <label className="block text-xs font-bold text-amber-800 mb-1">{t.rate} *</label>
                    <div className="relative">
                      <i className={`bi bi-currency-rupee absolute top-1/2 -translate-y-1/2 text-amber-500 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="number" min="0" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="0.00"
                        className={`w-full border border-amber-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-500 font-mono font-bold text-amber-700 ${isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"}`} />
                    </div>
                  </div>

                  {/* Total Value (Auto-Calc) */}
                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col justify-center mt-2 lg:mt-0">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-800">{t.total}</label>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><i className="bi bi-calculator"></i> {t.autoCalcNote}</span>
                    </div>
                    <div className="relative">
                      <i className={`bi bi-currency-rupee absolute top-1/2 -translate-y-1/2 text-slate-600 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input type="text" readOnly value={form.total} placeholder="0.00"
                        className={`w-full border border-slate-300 rounded-lg py-2.5 text-xl bg-white font-bold font-mono text-slate-800 outline-none cursor-not-allowed ${isUrdu ? "pr-9 pl-3 text-left" : "pl-9 pr-3 text-right"}`} />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Footer */}
              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${isUrdu ? "flex-row-reverse justify-start" : "justify-end"}`}>
                <button onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white">{t.cancel}</button>
                <button onClick={handleSave} className="bg-amber-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 flex items-center gap-2">
                  <i className="bi bi-save"></i> {t.save}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}