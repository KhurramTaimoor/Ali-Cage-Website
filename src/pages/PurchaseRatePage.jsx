import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Purchase Rate",
    subtitle: "Manage purchase rates for suppliers and products",
    addBtn: "Add Purchase Rate",
    searchPlaceholder: "Search by supplier, product, unit, category or type...",
    supplier: "Supplier",
    product: "Product",
    unit: "Unit",
    category: "Category",
    type: "Type",
    rate: "Rate (PKR)",
    quantity: "Quantity (Pcs)",
    effectiveDate: "Effective Date",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No records found.",
    toggleLang: "اردو",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Purchase Rates List",
    printedOn: "Printed On",
    supplierPlaceholder: "Select supplier",
    productPlaceholder: "Select product",
    unitPlaceholder: "Select unit",
    categoryPlaceholder: "Select category",
    typePlaceholder: "Select type",
    quantityPlaceholder: "e.g. 50",
    fetchError: "Failed to load purchase rates.",
    saveError: "Failed to save purchase rate.",
    deleteError: "Failed to delete purchase rate.",
    productRequiredError: "At least one product is required.",
    addProductRow: "Add Product",
    removeProductRow: "Remove",
    productGroup: "Product",
    loading: "Loading...",
    optional: "Optional",
  },
  ur: {
    title: "خریداری کا ریٹ",
    subtitle: "سپلائرز اور مصنوعات کے خریداری ریٹس کا انتظام کریں",
    addBtn: "نیا خریداری ریٹ شامل کریں",
    searchPlaceholder: "سپلائر، پروڈکٹ، یونٹ، کیٹیگری یا ٹائپ سے تلاش کریں...",
    supplier: "سپلائر",
    product: "پروڈکٹ",
    unit: "یونٹ",
    category: "کیٹیگری",
    type: "ٹائپ",
    rate: "ریٹ (روپے)",
    quantity: "تعداد (پیس)",
    effectiveDate: "مؤثر تاریخ",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    toggleLang: "English",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "خریداری کے ریٹس کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    supplierPlaceholder: "سپلائر منتخب کریں",
    productPlaceholder: "پروڈکٹ منتخب کریں",
    unitPlaceholder: "یونٹ منتخب کریں",
    categoryPlaceholder: "کیٹیگری منتخب کریں",
    typePlaceholder: "ٹائپ منتخب کریں",
    quantityPlaceholder: "مثلاً ۵۰",
    fetchError: "خریداری کے ریٹس لوڈ نہیں ہو سکے۔",
    saveError: "خریداری کا ریٹ محفوظ نہیں ہو سکا۔",
    deleteError: "خریداری کا ریٹ حذف نہیں ہو سکا۔",
    productRequiredError: "کم از کم ایک پروڈکٹ ضروری ہے۔",
    addProductRow: "پروڈکٹ شامل کریں",
    removeProductRow: "ہٹائیں",
    productGroup: "پروڈکٹ",
    loading: "لوڈ ہو رہا ہے...",
    optional: "اختیاری",
  },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyProduct = () => ({
  product_name: "",
  unit_name: "",
  category_name: "",
  type_name: "",
  rate: "",
  quantity: "",
  effective_date: "",
});

const fmt = (v) => Number(v || 0).toLocaleString("en-PK");

const getOptionLabel = (item) =>
  item?.name ||
  item?.title ||
  item?.label ||
  item?.supplier_name ||
  item?.product_name ||
  item?.unit_name ||
  item?.category_name ||
  item?.type_name ||
  item?.product_type_en ||
  "";

const extractOptions = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => getOptionLabel(item)).filter(Boolean);
};

const PurchaseRatePage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const [form, setForm] = useState({
    supplier_name: "",
    products: [emptyProduct()],
  });

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        purchaseRes,
        suppliersRes,
        productsRes,
        unitsRes,
        categoriesRes,
        productTypesRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE}/purchase-rates`),
        axios.get(`${API_BASE}/suppliers`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/units`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/product-types`),
      ]);

      const purchaseData =
        purchaseRes.status === "fulfilled" && Array.isArray(purchaseRes.value?.data)
          ? purchaseRes.value.data
          : [];

      const suppliersData =
        suppliersRes.status === "fulfilled" ? suppliersRes.value?.data : [];
      const productsData =
        productsRes.status === "fulfilled" ? productsRes.value?.data : [];
      const unitsData = unitsRes.status === "fulfilled" ? unitsRes.value?.data : [];
      const categoriesData =
        categoriesRes.status === "fulfilled" ? categoriesRes.value?.data : [];
      const productTypesData =
        productTypesRes.status === "fulfilled" ? productTypesRes.value?.data : [];

      setRecords(purchaseData);
      setSupplierOptions(extractOptions(suppliersData));
      setProductOptions(extractOptions(productsData));
      setUnitOptions(extractOptions(unitsData));
      setCategoryOptions(extractOptions(categoriesData));
      setTypeOptions(
        Array.isArray(productTypesData)
          ? productTypesData
              .map((item) => item?.product_type_en || "")
              .filter(Boolean)
          : []
      );
    } catch (err) {
      showToast("error", err?.response?.data?.message || t.fetchError);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setForm({
      supplier_name: "",
      products: [emptyProduct()],
    });
    setEditingName(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      supplier_name: r.supplier_name || "",
      products: r.products?.length
        ? r.products.map((p) => ({
            product_name: p.product_name || "",
            unit_name: p.unit_name || "",
            category_name: p.category_name || "",
            type_name: p.type_name || "",
            rate: p.rate ?? "",
            quantity: p.quantity ?? "",
            effective_date: p.effective_date || "",
          }))
        : [emptyProduct()],
    });

    setEditingName(r.supplier_name || "");
    setShowForm(true);
  };

  const updateProduct = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === index ? { ...p, [key]: value } : p
      ),
    }));
  };

  const addProduct = () => {
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, emptyProduct()],
    }));
  };

  const removeProduct = (index) => {
    setForm((prev) =>
      prev.products.length === 1
        ? prev
        : {
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
          }
    );
  };

  const handleSave = async () => {
    const cleanedProducts = form.products
      .map((p) => ({
        product_name: p.product_name?.trim() || "",
        unit_name: p.unit_name?.trim() || "",
        category_name: p.category_name?.trim() || "",
        type_name: p.type_name?.trim() || "",
        rate: p.rate === "" ? null : Number(p.rate) || 0,
        quantity: p.quantity === "" ? null : Number(p.quantity) || 0,
        effective_date: p.effective_date || null,
      }))
      .filter((p) => p.product_name);

    if (!cleanedProducts.length) {
      showToast("error", t.productRequiredError);
      return;
    }

    const payload = {
      supplier_name: form.supplier_name?.trim() || null,
      products: cleanedProducts,
    };

    try {
      setSubmitting(true);

      if (editingName) {
        const res = await axios.put(
          `${API_BASE}/purchase-rates/${encodeURIComponent(editingName)}`,
          payload
        );

        const updated = res?.data?.data;

        setRecords((prev) =>
          prev.map((r) => (r.supplier_name === editingName ? updated : r))
        );
      } else {
        const res = await axios.post(`${API_BASE}/purchase-rates`, payload);
        const created = res?.data?.data;
        setRecords((prev) => [created, ...prev]);
      }

      setShowForm(false);
      setEditingName(null);
      setForm({
        supplier_name: "",
        products: [emptyProduct()],
      });
    } catch (err) {
      showToast("error", err?.response?.data?.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplier_name) => {
    try {
      await axios.delete(
        `${API_BASE}/purchase-rates/${encodeURIComponent(supplier_name)}`
      );
      setRecords((prev) => prev.filter((r) => r.supplier_name !== supplier_name));
    } catch (err) {
      showToast("error", err?.response?.data?.message || t.deleteError);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return records;

    return records.filter(
      (r) =>
        (r.supplier_name || "").toLowerCase().includes(q) ||
        r.products?.some(
          (p) =>
            (p.product_name || "").toLowerCase().includes(q) ||
            (p.unit_name || "").toLowerCase().includes(q) ||
            (p.category_name || "").toLowerCase().includes(q) ||
            (p.type_name || "").toLowerCase().includes(q)
        )
    );
  }, [records, search]);

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif";

    const rowsHtml = filtered
      .map((r, i) =>
        (r.products || [])
          .map(
            (p, idx) => `
          <tr>
            ${
              idx === 0
                ? `<td rowspan="${r.products.length}">${i + 1}</td>
                   <td rowspan="${r.products.length}"><strong>${r.supplier_name || "—"}</strong></td>`
                : ""
            }
            <td>${p.product_name || "—"}</td>
            <td>${p.unit_name || "—"}</td>
            <td>${p.category_name || "—"}</td>
            <td>${p.type_name || "—"}</td>
            <td style="text-align:center"><strong>${p.quantity > 0 ? fmt(p.quantity) : "—"}</strong></td>
            <td style="text-align:right"><strong>${
              p.rate !== null && p.rate !== undefined && p.rate !== ""
                ? `₨ ${fmt(p.rate)}`
                : "—"
            }</strong></td>
            <td>${p.effective_date || "—"}</td>
          </tr>`
          )
          .join("")
      )
      .join("");

    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${t.title}</title>
  ${
    isUrdu
      ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">`
      : ""
  }
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${font};background:#fff;color:#0f172a;padding:40px}
    .header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1e40af;padding-bottom:20px;margin-bottom:30px}
    .brand{font-size:28px;font-weight:bold;color:#1e40af;text-transform:uppercase}
    .report-title{font-size:18px;color:#64748b;margin-top:5px}
    .meta{text-align:right;font-size:12px;color:#64748b}
    table{width:100%;border-collapse:collapse;font-size:14px}
    th{background:#1e40af;color:#fff;padding:12px;font-weight:normal;text-align:left}
    td{border-bottom:1px solid #e2e8f0;padding:12px;color:#334155;vertical-align:middle}
    tr:nth-child(even) td{background:#f8fafc}
    .hint{background:#eff6ff;color:#1d4ed8;padding:15px;text-align:center;border-radius:8px;margin-bottom:20px;font-size:14px;border:1px solid #bfdbfe}
    @media print{body{padding:0}.hint{display:none}}
  </style>
</head>
<body>
  ${
    isPdf
      ? `<div class="hint">Please select <strong>"Save as PDF"</strong> in destination dropdown.</div>`
      : ""
  }
  <div class="header">
    <div>
      <div class="brand">Ali Cages</div>
      <div class="report-title">${t.reportHeader}</div>
    </div>
    <div class="meta">${t.printedOn}: ${new Date().toLocaleString(
      isUrdu ? "ur-PK" : "en-PK"
    )}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>${t.supplier}</th>
        <th>${t.product}</th>
        <th>${t.unit}</th>
        <th>${t.category}</th>
        <th>${t.type}</th>
        <th style="text-align:center">${t.quantity}</th>
        <th style="text-align:right">${t.rate}</th>
        <th>${t.effectiveDate}</th>
      </tr>
    </thead>
    <tbody>
      ${
        filtered.length
          ? rowsHtml
          : `<tr><td colspan="9" style="text-align:center">${t.noRecords}</td></tr>`
      }
    </tbody>
  </table>
  <script>window.onload=()=>{setTimeout(()=>{window.print();${
    !isPdf ? "window.onafterprint=()=>window.close();" : ""
  }},300)}</script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      dir={dir}
      style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Georgia', serif" }}
      className="min-h-screen bg-slate-50 p-6"
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
          className={`fixed bottom-6 ${
            isUrdu ? "left-6" : "right-6"
          } z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${
            message.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <i
            className={`bi ${
              message.type === "error"
                ? "bi-exclamation-triangle-fill"
                : "bi-check-circle-fill"
            }`}
          ></i>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-w-6xl mx-auto">
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

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <i
              className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isUrdu ? "right-3" : "left-3"
              }`}
            ></i>
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
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm"
            >
              <i className="bi bi-printer text-blue-600"></i>
              {t.printBtn}
            </button>

            <button
              onClick={() => generatePrintDocument(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm"
            >
              <i className="bi bi-file-earmark-pdf text-red-600"></i>
              {t.pdfBtn}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.supplier}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.unit}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                  <th className="px-5 py-3 text-center">{t.quantity}</th>
                  <th className="px-5 py-3 text-right">{t.rate}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.effectiveDate}</th>
                  <th className="px-5 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400">
                      {t.loading}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={`${r.supplier_name || "no-supplier"}-${i}`} className="hover:bg-blue-50 transition align-top">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>

                      <td className="px-5 py-3.5 font-bold text-slate-700">
                        {r.supplier_name || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx}>
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">
                                {p.product_name || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx}>{p.unit_name || "—"}</div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx}>{p.category_name || "—"}</div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx}>{p.type_name || "—"}</div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx} className="font-mono font-bold text-blue-700">
                              {p.quantity > 0 ? fmt(p.quantity) : "—"}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx} className="font-mono font-bold text-green-700">
                              {p.rate !== null && p.rate !== undefined && p.rate !== ""
                                ? `₨ ${fmt(p.rate)}`
                                : "—"}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        <div className="space-y-1.5">
                          {(r.products || []).map((p, idx) => (
                            <div key={idx}>{p.effective_date || "—"}</div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div
                          className={`flex items-center justify-center gap-1.5 ${
                            isUrdu ? "flex-row-reverse" : ""
                          }`}
                        >
                          <button
                            onClick={() => openEdit(r)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                          >
                            <i className="bi bi-pencil-square"></i>
                            {t.edit}
                          </button>

                          <button
                            onClick={() => handleDelete(r.supplier_name)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"
                          >
                            <i className="bi bi-trash3"></i>
                            {t.delete}
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
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
              dir={dir}
            >
              <h2 className="text-xl font-bold text-slate-800 mb-5">
                {editingName ? t.edit : t.addBtn}
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {t.supplier} <span className="text-slate-400">({t.optional})</span>
                </label>
                <div className="relative">
                  <i
                    className={`bi bi-building absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                      isUrdu ? "right-3" : "left-3"
                    }`}
                  ></i>
                  <select
                    value={form.supplier_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, supplier_name: e.target.value }))
                    }
                    className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-300 ${
                      isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                    }`}
                  >
                    <option value="">{t.supplierPlaceholder}</option>
                    {supplierOptions.map((option, idx) => (
                      <option key={`${option}-${idx}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {form.products.map((p, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-600">
                        {t.productGroup} {index + 1}
                      </h3>

                      {form.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-xs px-3 py-1 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 font-semibold"
                        >
                          {t.removeProductRow}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.product} *
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-box-seam absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <select
                            value={p.product_name}
                            onChange={(e) =>
                              updateProduct(index, "product_name", e.target.value)
                            }
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                            }`}
                          >
                            <option value="">{t.productPlaceholder}</option>
                            {productOptions.map((option, idx) => (
                              <option key={`${option}-${idx}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.unit} <span className="text-slate-400">({t.optional})</span>
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-rulers absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <select
                            value={p.unit_name}
                            onChange={(e) =>
                              updateProduct(index, "unit_name", e.target.value)
                            }
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                            }`}
                          >
                            <option value="">{t.unitPlaceholder}</option>
                            {unitOptions.map((option, idx) => (
                              <option key={`${option}-${idx}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.category} <span className="text-slate-400">({t.optional})</span>
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-diagram-3 absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <select
                            value={p.category_name}
                            onChange={(e) =>
                              updateProduct(index, "category_name", e.target.value)
                            }
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                            }`}
                          >
                            <option value="">{t.categoryPlaceholder}</option>
                            {categoryOptions.map((option, idx) => (
                              <option key={`${option}-${idx}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.type} <span className="text-slate-400">({t.optional})</span>
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-tags absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <select
                            value={p.type_name}
                            onChange={(e) =>
                              updateProduct(index, "type_name", e.target.value)
                            }
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                            }`}
                          >
                            <option value="">{t.typePlaceholder}</option>
                            {typeOptions.map((option, idx) => (
                              <option key={`${option}-${idx}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.quantity} <span className="text-slate-400">({t.optional})</span>
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-stack absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <input
                            type="number"
                            min="0"
                            value={p.quantity}
                            onChange={(e) =>
                              updateProduct(index, "quantity", e.target.value)
                            }
                            placeholder={t.quantityPlaceholder}
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.rate} <span className="text-slate-400">({t.optional})</span>
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-currency-rupee absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <input
                            type="number"
                            min="0"
                            value={p.rate}
                            onChange={(e) => updateProduct(index, "rate", e.target.value)}
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          {t.effectiveDate} <span className="text-slate-400">({t.optional})</span>
                        </label>
                        <div className="relative">
                          <i
                            className={`bi bi-calendar-event absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                              isUrdu ? "right-3" : "left-3"
                            }`}
                          ></i>
                          <input
                            type="date"
                            value={p.effective_date}
                            onChange={(e) =>
                              updateProduct(index, "effective_date", e.target.value)
                            }
                            className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-300 ${
                              isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full border border-dashed border-blue-300 text-blue-700 py-3 rounded-2xl text-sm font-semibold hover:bg-blue-50 transition"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  {t.addProductRow}
                </button>
              </div>

              <div className={`flex gap-3 mt-8 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-60"
                >
                  {submitting ? t.saving : t.save}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseRatePage;