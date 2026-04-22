import React, { useState, useEffect } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Opening Stock",
    subtitle: "Manage initial stock levels",
    addBtn: "Add Stock",
    searchPlaceholder: "Search by product, warehouse or category...",
    product: "Product",
    selectProduct: "-- Select Product --",
    productType: "Product Type",
    selectType: "-- Select Type --",
    category: "Category",
    selectCategory: "-- Select Category --",
    warehouse: "Warehouse",
    quantity: "Quantity",
    stockDate: "Stock Date",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No stock records found.",
    toggleLang: "اردو",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    reportHeader: "Opening Stock Report",
    printedOn: "Printed On",
    successSave: "Stock saved successfully!",
    successUpdate: "Stock updated successfully!",
    errorMsg: "Please fill all required fields.",
    deleteConfirm: "Are you sure you want to delete this record?",
  },
  ur: {
    title: "ابتدائی اسٹاک",
    subtitle: "ابتدائی اسٹاک کی سطح کا انتظام کریں",
    addBtn: "اسٹاک شامل کریں",
    searchPlaceholder: "پروڈکٹ، گودام یا کیٹیگری سے تلاش کریں...",
    product: "پروڈکٹ",
    selectProduct: "-- پروڈکٹ منتخب کریں --",
    productType: "پروڈکٹ کی قسم",
    selectType: "-- قسم منتخب کریں --",
    category: "کیٹیگری",
    selectCategory: "-- کیٹیگری منتخب کریں --",
    warehouse: "گودام",
    quantity: "مقدار",
    stockDate: "اسٹاک کی تاریخ",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "اسٹاک کا کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "ابتدائی اسٹاک کی رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "اسٹاک کامیابی سے محفوظ ہو گیا!",
    successUpdate: "اسٹاک کامیابی سے اپڈیٹ ہو گیا!",
    errorMsg: "براہ کرم تمام لازمی خانے پُر کریں۔",
    deleteConfirm: "کیا آپ واقعی یہ ریکارڈ حذف کرنا چاہتے ہیں؟",
  },
};

const API_BASE = "http://localhost:5000/api";

export default function OpeningStockPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    product_id: "",
    product_type_id: "",
    category_id: "",
    warehouse: "",
    quantity: "",
    stock_date: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resStock, resProd, resType, resCat] = await Promise.all([
        axios.get(`${API_BASE}/opening-stock`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/product-types`),
        axios.get(`${API_BASE}/categories`),
      ]);
      setRecords(resStock.data);
      setProducts(resProd.data);
      setTypes(resType.data);
      setCategories(resCat.data);
    } catch {
      setProducts([
        { id: 1, product_name: "Cotton T-Shirt" },
        { id: 2, product_name: "Denim Jeans" },
      ]);
      setTypes([{ id: 1, type_name: "Finished Goods" }]);
      setCategories([{ id: 1, category_name: "Garments" }]);
      setRecords([
        {
          id: 1,
          product_name: "Cotton T-Shirt",
          type_name: "Finished Goods",
          category_name: "Garments",
          warehouse: "Main Godown",
          quantity: 500,
          stock_date: "2024-01-01",
        },
        {
          id: 2,
          product_name: "Denim Jeans",
          type_name: "Finished Goods",
          category_name: "Garments",
          warehouse: "Store A",
          quantity: 200,
          stock_date: "2024-01-01",
        },
      ]);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const openAdd = () => {
    setForm({
      product_id: "",
      product_type_id: "",
      category_id: "",
      warehouse: "",
      quantity: "",
      stock_date: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      product_id: r.product_id,
      product_type_id: r.product_type_id,
      category_id: r.category_id,
      warehouse: r.warehouse,
      quantity: r.quantity,
      stock_date: r.stock_date,
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.product_id || !form.quantity) {
      showToast("error", t.errorMsg);
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/opening-stock/${editingId}`, form);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/opening-stock`, form);
        showToast("success", t.successSave);
      }
      fetchData();
      setShowForm(false);
    } catch {
      const prod = products.find((p) => String(p.id) === String(form.product_id));
      const type = types.find((p) => String(p.id) === String(form.product_type_id));
      const cat = categories.find((p) => String(p.id) === String(form.category_id));
      const newRec = {
        ...form,
        id: editingId || Date.now(),
        product_name: prod?.product_name || "-",
        type_name: type?.type_name || "-",
        category_name: cat?.category_name || "-",
      };
      if (editingId) {
        setRecords((prev) => prev.map((r) => (r.id === editingId ? newRec : r)));
      } else {
        setRecords((prev) => [...prev, newRec]);
      }
      showToast("success", editingId ? t.successUpdate : t.successSave);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/opening-stock/${id}`);
      fetchData();
    } catch {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filtered = records.filter((r) =>
    [r.product_name, r.warehouse, r.category_name].some((v) =>
      (v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";
    const rowsHtml = filtered
      .map(
        (r, i) => `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td><strong>${r.product_name}</strong></td>
        <td>${r.type_name || "-"}</td>
        <td>${r.category_name || "-"}</td>
        <td>${r.warehouse || "-"}</td>
        <td style="text-align:center; font-weight:bold;">${r.quantity}</td>
        <td>${r.stock_date || "-"}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html><html dir="${dir}" lang="${lang}">
      <head><meta charset="UTF-8"/><title>${t.title}</title>
      ${isUrdu ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">` : ""}
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:${font}; background:#fff; color:#0f172a; padding:40px; }
        .container { max-width:1000px; margin:0 auto; }
        .header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #1e40af; padding-bottom:20px; margin-bottom:30px; }
        .brand { font-size:28px; font-weight:bold; color:#1e40af; text-transform:uppercase; }
        .report-title { font-size:18px; color:#64748b; margin-top:5px; }
        .meta { text-align:${isUrdu ? "left" : "right"}; font-size:12px; color:#64748b; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th { background:#1e40af; color:#fff; text-align:${isUrdu ? "right" : "left"}; padding:12px; font-weight:normal; }
        td { border-bottom:1px solid #e2e8f0; padding:10px; color:#334155; }
        tr:nth-child(even) td { background:#f8fafc; }
        .hint { background:#eff6ff; color:#1d4ed8; padding:15px; text-align:center; border-radius:8px; margin-bottom:20px; border:1px solid #bfdbfe; }
        @media print { body { padding:0; } .hint { display:none; } }
      </style></head>
      <body><div class="container">
        ${isPdf ? `<div class="hint">Select <strong>"Save as PDF"</strong> in the print dialog.</div>` : ""}
        <div class="header">
          <div><div class="brand">Unique Wear</div><div class="report-title">${t.reportHeader}</div></div>
          <div class="meta">${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
        </div>
        <table>
          <thead><tr>
            <th style="width:40px;text-align:center;">#</th>
            <th>${t.product}</th><th>${t.productType}</th><th>${t.category}</th>
            <th>${t.warehouse}</th><th style="text-align:center;">${t.quantity}</th><th>${t.stockDate}</th>
          </tr></thead>
          <tbody>${filtered.length > 0 ? rowsHtml : `<tr><td colspan="7" style="text-align:center;">${t.noRecords}</td></tr>`}</tbody>
        </table>
      </div>
      <script>window.onload=()=>{setTimeout(()=>{window.print();${!isPdf ? "window.onafterprint=()=>window.close();" : ""}},300);}</script>
      </body></html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      dir={dir}
      style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }}
      className="min-h-screen bg-slate-50 p-6 pb-20"
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      {isUrdu && (
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap"
          rel="stylesheet"
        />
      )}

      {message.text && (
        <div
          className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${
            message.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <i className={`bi ${message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`}></i>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition"
          >
            <i className="bi bi-translate"></i>
            {t.toggleLang}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition shadow"
          >
            <i className="bi bi-plus-lg"></i>
            {t.addBtn}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border border-slate-200 rounded-lg py-2.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
                isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
              }`}
            />
          </div>
          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => generatePrintDocument(false)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm transition shadow-sm"
            >
              <i className="bi bi-printer text-blue-600"></i>
              {t.printBtn}
            </button>
            <button
              onClick={() => generatePrintDocument(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm transition shadow-sm"
            >
              <i className="bi bi-file-earmark-pdf text-red-500"></i>
              {t.pdfBtn}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-white text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.productType}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.warehouse}</th>
                  <th className="px-4 py-3.5 text-center">{t.quantity}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.stockDate}</th>
                  <th className="px-4 py-3.5 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                      <i className="bi bi-inbox text-4xl block mb-2 opacity-30"></i>
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>

                      <td className="px-4 py-3.5">
                        <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <i className="bi bi-box-seam text-slate-600 text-xs"></i>
                          </div>
                          <span className="font-semibold text-slate-800">{r.product_name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {r.type_name || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {r.category_name || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium">
                          {r.warehouse || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-sm border border-slate-200">
                          {r.quantity}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500">{r.stock_date || "—"}</td>

                      <td className="px-4 py-3.5">
                        <div className={`flex items-center justify-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                          <button
                            onClick={() => openEdit(r)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs hover:bg-blue-100 transition"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs hover:bg-red-100 transition"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col" dir={dir}>
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <i className="bi bi-boxes text-blue-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? t.edit : t.addBtn}</h2>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t.product} <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <i className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select
                        value={form.product_id}
                        onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                          isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                        }`}
                      >
                        <option value="">{t.selectProduct}</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.product_name}
                          </option>
                        ))}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.productType}</label>
                    <div className="relative">
                      <i className={`bi bi-diagram-2 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select
                        value={form.product_type_id}
                        onChange={(e) => setForm({ ...form, product_type_id: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                          isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                        }`}
                      >
                        <option value="">{t.selectType}</option>
                        {types.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.type_name}
                          </option>
                        ))}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.category}</label>
                    <div className="relative">
                      <i className={`bi bi-tags absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                          isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                        }`}
                      >
                        <option value="">{t.selectCategory}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.category_name}
                          </option>
                        ))}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.warehouse}</label>
                    <div className="relative">
                      <i className={`bi bi-building absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input
                        type="text"
                        value={form.warehouse}
                        onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
                        placeholder="e.g. Main Godown"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.stockDate}</label>
                    <div className="relative">
                      <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input
                        type="date"
                        value={form.stock_date}
                        onChange={(e) => setForm({ ...form, stock_date: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t.quantity} <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <i className={`bi bi-boxes absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input
                        type="number"
                        min="0"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        placeholder="0"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold text-slate-700 ${
                          isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${
                  isUrdu ? "flex-row-reverse" : "justify-end"
                }`}
              >
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 transition shadow flex items-center gap-2"
                >
                  <i className="bi bi-save"></i>
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}