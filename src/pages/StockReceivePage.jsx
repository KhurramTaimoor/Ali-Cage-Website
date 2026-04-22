import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Stock Receive",
    subtitle: "Manage goods receipt notes (GRN) and incoming stock",
    addBtn: "Receive Stock",
    editEntry: "Edit Stock Receive",
    newEntry: "New Stock Receive",
    searchPlaceholder: "Search by GRN, supplier, product, unit, category or type...",
    grnNo: "GRN No",
    receiveDate: "Receive Date",
    supplier: "Supplier",
    supplierPlaceholder: "Select supplier",
    product: "Product",
    productPlaceholder: "Select product",
    category: "Category",
    categoryPlaceholder: "Select category",
    unit: "Unit",
    unitPlaceholder: "Select unit",
    type: "Product Type",
    typePlaceholder: "Select type",
    receivedQty: "Received Qty",
    save: "Save",
    update: "Update",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No stock receive records found.",
    toggleLang: "اردو",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    reportHeader: "Stock Receive (GRN) Report",
    printedOn: "Printed On",
    successSave: "Stock received successfully!",
    successUpdate: "Record updated successfully!",
    errorMsg: "Please fill all required fields (GRN No, Supplier and at least one product).",
    deleteConfirm: "Are you sure you want to delete this record?",
    addItem: "Add Product",
    removeItem: "Remove",
    itemNo: "Item",
    products: "Products",
    loadError: "Failed to load data from server.",
    savingError: "Failed to save record.",
    deletingError: "Failed to delete record.",
    deleteSuccess: "Record deleted successfully!",
    loading: "Loading...",
    optional: "Optional",
  },
  ur: {
    title: "اسٹاک کی وصولی",
    subtitle: "گڈز ریسیٹ نوٹس (GRN) اور آنے والے اسٹاک کا انتظام کریں",
    addBtn: "اسٹاک وصول کریں",
    editEntry: "اسٹاک وصولی میں ترمیم",
    newEntry: "نئی اسٹاک وصولی",
    searchPlaceholder: "جی آر این، سپلائر، پروڈکٹ، یونٹ، کیٹیگری یا ٹائپ سے تلاش کریں...",
    grnNo: "جی آر این نمبر",
    receiveDate: "وصولی کی تاریخ",
    supplier: "سپلائر",
    supplierPlaceholder: "سپلائر منتخب کریں",
    product: "پروڈکٹ",
    productPlaceholder: "پروڈکٹ منتخب کریں",
    category: "کیٹیگری",
    categoryPlaceholder: "کیٹیگری منتخب کریں",
    unit: "یونٹ",
    unitPlaceholder: "یونٹ منتخب کریں",
    type: "پروڈکٹ کی قسم",
    typePlaceholder: "قسم منتخب کریں",
    receivedQty: "وصول شدہ مقدار",
    save: "محفوظ کریں",
    update: "اپ ڈیٹ کریں",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "اسٹاک وصولی کا کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "اسٹاک وصولی (GRN) کی رپورٹ",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "اسٹاک کامیابی سے وصول کر لیا گیا!",
    successUpdate: "ریکارڈ کامیابی سے اپڈیٹ ہو گیا!",
    errorMsg: "براہ کرم تمام لازمی خانے پُر کریں (جی آر این نمبر، سپلائر، اور کم از کم ایک پروڈکٹ)۔",
    deleteConfirm: "کیا آپ واقعی یہ ریکارڈ حذف کرنا چاہتے ہیں؟",
    addItem: "پروڈکٹ شامل کریں",
    removeItem: "ہٹائیں",
    itemNo: "آئٹم",
    products: "پروڈکٹس",
    loadError: "سرور سے ڈیٹا لوڈ نہیں ہو سکا۔",
    savingError: "ریکارڈ محفوظ نہیں ہو سکا۔",
    deletingError: "ریکارڈ حذف نہیں ہو سکا۔",
    deleteSuccess: "ریکارڈ کامیابی سے حذف ہو گیا!",
    loading: "لوڈ ہو رہا ہے...",
    optional: "اختیاری",
  },
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyItem = () => ({
  product_name: "",
  category_name: "",
  unit_name: "",
  type_name: "",
  received_qty: "",
});

const emptyForm = {
  grn_no: "",
  receive_date: "",
  supplier_name: "",
  items: [emptyItem()],
};

const pickLabel = (item, keys = []) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && `${item[key]}`.trim() !== "") {
      return `${item[key]}`.trim();
    }
  }
  return "";
};

const extractOptions = (data, preferredKeys = []) => {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => {
      const value =
        pickLabel(item, preferredKeys) ||
        pickLabel(item, [
          "name",
          "product_name",
          "supplier_name",
          "unit_name",
          "category_name",
          "type_name",
          "product_type_en",
          "product_type_ur",
          "title",
        ]) ||
        `${item?.id ?? index}`;

      return value ? value : "";
    })
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
};

const normalizeRecord = (r) => ({
  id: r?.id,
  grn_no: r?.grn_no || "",
  receive_date: r?.receive_date || "",
  supplier_name: r?.supplier_name || r?.supplier || "",
  items: Array.isArray(r?.items)
    ? r.items.map((item) => ({
        id: item?.id,
        product_name: item?.product_name || "",
        category_name: item?.category_name || "",
        unit_name: item?.unit_name || "",
        type_name: item?.type_name || "",
        received_qty: item?.received_qty ?? "",
      }))
    : [],
});

export default function StockReceivePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [
        stockRes,
        suppliersRes,
        productsRes,
        unitsRes,
        categoriesRes,
        productTypesRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE}/stock-receive`),
        axios.get(`${API_BASE}/suppliers`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/units`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/product-types`),
      ]);

      const stockList =
        stockRes.status === "fulfilled"
          ? Array.isArray(stockRes.value?.data)
            ? stockRes.value.data
            : stockRes.value?.data?.data || []
          : [];

      const suppliersData =
        suppliersRes.status === "fulfilled" ? suppliersRes.value?.data : [];
      const productsData =
        productsRes.status === "fulfilled" ? productsRes.value?.data : [];
      const unitsData =
        unitsRes.status === "fulfilled" ? unitsRes.value?.data : [];
      const categoriesData =
        categoriesRes.status === "fulfilled" ? categoriesRes.value?.data : [];
      const productTypesData =
        productTypesRes.status === "fulfilled" ? productTypesRes.value?.data : [];

      setRecords(stockList.map(normalizeRecord));

      setSupplierOptions(
        extractOptions(suppliersData, ["supplier_name", "name"])
      );

      setProductOptions(
        extractOptions(productsData, ["product_name", "name"])
      );

      setUnitOptions(
        extractOptions(unitsData, ["unit_name", "name"])
      );

      setCategoryOptions(
        extractOptions(categoriesData, ["category_name", "name"])
      );

      setTypeOptions(
        extractOptions(productTypesData, [
          "product_type_en",
          "type_name",
          "name",
          "product_type_ur",
        ])
      );
    } catch (error) {
      console.error("Fetch error:", error);
      setRecords([]);
      showToast("error", t.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage({ type: "", text: "" });
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/stock-receive/${id}`);
      const data = normalizeRecord(res.data?.data || res.data);

      setEditingId(data.id);
      setForm({
        grn_no: data.grn_no || "",
        receive_date: data.receive_date || "",
        supplier_name: data.supplier_name || "",
        items:
          data.items?.length > 0
            ? data.items.map((item) => ({
                id: item.id,
                product_name: item.product_name || "",
                category_name: item.category_name || "",
                unit_name: item.unit_name || "",
                type_name: item.type_name || "",
                received_qty: item.received_qty ?? "",
              }))
            : [emptyItem()],
      });

      setShowForm(true);
    } catch (error) {
      console.error("Edit fetch error:", error);
      showToast("error", t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItemRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? prev.items
          : prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const validItems = form.items.filter((item) => item.product_name);

    if (!form.grn_no || !form.supplier_name || validItems.length === 0) {
      showToast("error", t.errorMsg);
      return;
    }

    const payload = {
      grn_no: form.grn_no,
      receive_date: form.receive_date || "",
      supplier_name: form.supplier_name,
      items: validItems.map((item) => ({
        product_name: item.product_name,
        category_name: item.category_name || "",
        unit_name: item.unit_name || "",
        type_name: item.type_name || "",
        received_qty: item.received_qty || "",
      })),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(`${API_BASE}/stock-receive/${editingId}`, payload);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/stock-receive`, payload);
        showToast("success", t.successSave);
      }

      await fetchAll();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
      showToast("error", t.savingError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const res = await axios.delete(`${API_BASE}/stock-receive/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast("success", res?.data?.message || t.deleteSuccess);
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", t.deletingError);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return records;

    return records.filter(
      (r) =>
        (r.grn_no || "").toLowerCase().includes(q) ||
        (r.supplier_name || "").toLowerCase().includes(q) ||
        r.items?.some(
          (item) =>
            (item.product_name || "").toLowerCase().includes(q) ||
            (item.category_name || "").toLowerCase().includes(q) ||
            (item.unit_name || "").toLowerCase().includes(q) ||
            (item.type_name || "").toLowerCase().includes(q)
        )
    );
  }, [records, search]);

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";

    const rowsHtml = filtered
      .map((r, i) => {
        const itemsHtml = (r.items || [])
          .map(
            (item) => `
              <div style="margin-bottom:8px;">
                <strong>${item.product_name || "-"}</strong>
                <div style="font-size:12px; color:#64748b;">
                  ${item.category_name || "-"} | ${item.unit_name || "-"} | ${item.type_name || "-"} | Qty: ${item.received_qty || 0}
                </div>
              </div>
            `
          )
          .join("");

        const totalQty = (r.items || []).reduce(
          (sum, item) => sum + Number(item.received_qty || 0),
          0
        );

        return `
          <tr>
            <td style="text-align:center;">${i + 1}</td>
            <td><strong>${r.grn_no || "-"}</strong></td>
            <td>${r.receive_date || "-"}</td>
            <td>${r.supplier_name || "-"}</td>
            <td>${itemsHtml || "-"}</td>
            <td style="text-align:center; font-weight:bold;">${totalQty}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html dir="${dir}" lang="${lang}">
      <head>
        <meta charset="UTF-8" />
        <title>${t.reportHeader}</title>
        ${
          isUrdu
            ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">`
            : ""
        }
        <style>
          body {
            font-family: ${font};
            margin: 24px;
            color: #0f172a;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 24px;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 10px;
            vertical-align: top;
            font-size: 13px;
          }
          th {
            background: #eff6ff;
            text-align: ${isUrdu ? "right" : "left"};
          }
        </style>
      </head>
      <body>
        <h1>${t.reportHeader}</h1>
        <div class="meta">${t.printedOn}: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t.grnNo}</th>
              <th>${t.receiveDate}</th>
              <th>${t.supplier}</th>
              <th>${t.products}</th>
              <th>${t.receivedQty}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="6">${t.noRecords}</td></tr>`}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(html);
    win.document.close();

    if (isPdf) {
      win.focus();
      win.print();
    } else {
      win.focus();
      win.print();
    }
  };

  return (
    <div
      dir={dir}
      className={`min-h-screen bg-slate-50 p-4 md:p-6 ${
        isUrdu ? "font-['Noto_Nastaliq_Urdu']" : "font-sans"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 mb-6">
          <div
            className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
              isUrdu ? "md:flex-row-reverse" : ""
            }`}
          >
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-3 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={() => setLang((prev) => (prev === "en" ? "ur" : "en"))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
              >
                {t.toggleLang}
              </button>

              <button
                onClick={openAdd}
                className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition shadow"
              >
                <i className="bi bi-plus-lg me-2"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {message.text && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 mb-6">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
              isUrdu ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="relative flex-1">
              <i
                className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isUrdu ? "right-3" : "left-3"
                }`}
              ></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
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
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-white text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"} w-12`}>#</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.grnNo}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.receiveDate}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.supplier}</th>
                  <th className={`px-4 py-3.5 ${isUrdu ? "text-right" : "text-left"}`}>{t.products}</th>
                  <th className="px-4 py-3.5 text-center">{t.receivedQty}</th>
                  <th className="px-4 py-3.5 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      {t.loading}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <i className="bi bi-inbox text-4xl block mb-2 opacity-30"></i>
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const totalQty = (r.items || []).reduce(
                      (sum, item) => sum + Number(item.received_qty || 0),
                      0
                    );

                    return (
                      <tr key={r.id} className="hover:bg-blue-50 transition align-top">
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">{r.grn_no || "-"}</td>
                        <td className="px-4 py-3.5">{r.receive_date || "-"}</td>
                        <td className="px-4 py-3.5">{r.supplier_name || "-"}</td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-2">
                            {(r.items || []).map((item, idx) => (
                              <div key={idx} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                                <div className="font-semibold text-slate-800">
                                  {item.product_name || "-"}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {item.category_name || "-"} | {item.unit_name || "-"} | {item.type_name || "-"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                          {totalQty}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={`flex gap-2 justify-center ${isUrdu ? "flex-row-reverse" : ""}`}>
                            <button
                              onClick={() => openEdit(r.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
                            >
                              {t.edit}
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                            >
                              {t.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {editingId ? t.editEntry : t.newEntry}
                  </h2>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t.grnNo} <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <i className={`bi bi-hash absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input
                        type="text"
                        value={form.grn_no}
                        onChange={(e) => setForm({ ...form, grn_no: e.target.value })}
                        placeholder="GRN-001"
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t.receiveDate}{" "}
                      <span className="text-slate-400 text-[11px]">({t.optional})</span>
                    </label>
                    <div className="relative">
                      <i className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <input
                        type="date"
                        value={form.receive_date}
                        onChange={(e) => setForm({ ...form, receive_date: e.target.value })}
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t.supplier} <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <i className={`bi bi-person-badge absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                      <select
                        value={form.supplier_name}
                        onChange={(e) =>
                          setForm({ ...form, supplier_name: e.target.value })
                        }
                        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                          isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                        }`}
                      >
                        <option value="">{t.supplierPlaceholder}</option>
                        {supplierOptions.map((supplier, index) => (
                          <option key={`${supplier}-${index}`} value={supplier}>
                            {supplier}
                          </option>
                        ))}
                      </select>
                      <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700">{t.products}</h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition shadow"
                  >
                    <i className="bi bi-plus-lg"></i>
                    {t.addItem}
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-slate-700">
                          {t.itemNo} {index + 1}
                        </h4>

                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs hover:bg-red-100 transition"
                          >
                            {t.removeItem}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {t.product} <span className="text-blue-500">*</span>
                          </label>
                          <div className="relative">
                            <i className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                            <select
                              value={item.product_name}
                              onChange={(e) =>
                                updateItem(index, "product_name", e.target.value)
                              }
                              className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                                isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                              }`}
                            >
                              <option value="">{t.productPlaceholder}</option>
                              {productOptions.map((product, pIndex) => (
                                <option key={`${product}-${pIndex}`} value={product}>
                                  {product}
                                </option>
                              ))}
                            </select>
                            <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {t.category}{" "}
                            <span className="text-slate-400 text-[11px]">({t.optional})</span>
                          </label>
                          <div className="relative">
                            <i className={`bi bi-tags absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                            <select
                              value={item.category_name}
                              onChange={(e) =>
                                updateItem(index, "category_name", e.target.value)
                              }
                              className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                                isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                              }`}
                            >
                              <option value="">{t.categoryPlaceholder}</option>
                              {categoryOptions.map((category, cIndex) => (
                                <option key={`${category}-${cIndex}`} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {t.unit}{" "}
                            <span className="text-slate-400 text-[11px]">({t.optional})</span>
                          </label>
                          <div className="relative">
                            <i className={`bi bi-box absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                            <select
                              value={item.unit_name}
                              onChange={(e) =>
                                updateItem(index, "unit_name", e.target.value)
                              }
                              className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                                isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                              }`}
                            >
                              <option value="">{t.unitPlaceholder}</option>
                              {unitOptions.map((unit, uIndex) => (
                                <option key={`${unit}-${uIndex}`} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                            <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {t.type}{" "}
                            <span className="text-slate-400 text-[11px]">({t.optional})</span>
                          </label>
                          <div className="relative">
                            <i className={`bi bi-diagram-2 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                            <select
                              value={item.type_name}
                              onChange={(e) =>
                                updateItem(index, "type_name", e.target.value)
                              }
                              className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${
                                isUrdu ? "pr-9 pl-8 text-right" : "pl-9 pr-8"
                              }`}
                            >
                              <option value="">{t.typePlaceholder}</option>
                              {typeOptions.map((type, tIndex) => (
                                <option key={`${type}-${tIndex}`} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            <i className={`bi bi-chevron-down absolute top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none ${isUrdu ? "left-3" : "right-3"}`}></i>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {t.receivedQty}{" "}
                            <span className="text-slate-400 text-[11px]">({t.optional})</span>
                          </label>
                          <div className="relative">
                            <i className={`bi bi-boxes absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-3" : "left-3"}`}></i>
                            <input
                              type="number"
                              min="0"
                              value={item.received_qty}
                              onChange={(e) =>
                                updateItem(index, "received_qty", e.target.value)
                              }
                              placeholder="0"
                              className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold text-slate-700 ${
                                isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0 rounded-b-2xl ${isUrdu ? "flex-row-reverse" : "justify-end"}`}>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition bg-white disabled:opacity-60"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 transition shadow flex items-center gap-2 disabled:opacity-60"
                >
                  <i className="bi bi-save"></i>
                  {submitting ? "..." : editingId ? t.update : t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}