import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Purchase Invoice",
    subtitle: "Create and manage your purchase invoices",
    addBtn: "New Invoice",
    editBtn: "Edit",
    newEntry: "New Invoice Entry",
    editEntry: "Edit Purchase Invoice",
    invoiceNo: "Invoice No",
    supplier: "Supplier",
    supplierPlaceholder: "Select supplier",
    date: "Invoice Date",
    debit: "Debit (PKR)",
    credit: "Credit (PKR)",
    debitPlaceholder: "Amount owed to supplier",
    creditPlaceholder: "Amount paid to supplier",
    totalAmount: "Total Amount (PKR)",
    items: "Invoice Items",
    addItem: "Add Item",
    removeItem: "Remove",
    product: "Product",
    productPlaceholder: "Select product",
    unit: "Unit",
    unitPlaceholder: "Select unit",
    category: "Category",
    categoryPlaceholder: "Select category",
    type: "Type",
    typePlaceholder: "Select type",
    qty: "Quantity",
    rate: "Rate",
    amount: "Amount",
    save: "Save Invoice",
    update: "Update Invoice",
    saving: "Saving...",
    cancel: "Cancel",
    records: "Records",
    searchPlaceholder:
      "Search by invoice no, supplier, product, unit, category or type...",
    actions: "Actions",
    delete: "Delete",
    noRecords: "No records found.",
    loading: "Loading purchase invoices...",
    toggleLang: "اردو",
    printList: "Print",
    pdfList: "Download PDF",
    reportHeader: "Purchase Invoices List",
    printedOn: "Printed On",
    balance: "Balance",
    fetchError: "Failed to load purchase invoices.",
    saveError: "Failed to save purchase invoice.",
    updateError: "Failed to update purchase invoice.",
    deleteError: "Failed to delete purchase invoice.",
    successMsg: "Purchase Invoice saved successfully!",
    updateSuccess: "Purchase Invoice updated successfully!",
    deleteSuccess: "Purchase Invoice deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this invoice?",
    optional: "Optional",
    translating: "Translating to Urdu…",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
    companyName: "Ali Cages",
    thankYou: "Thank you for your business!",
  },
  ur: {
    title: "پرچیز انوائس",
    subtitle: "اپنی خریداری کی انوائسز بنائیں اور ان کا انتظام کریں",
    addBtn: "نئی انوائس",
    editBtn: "ترمیم",
    newEntry: "نئی انوائس کا اندراج",
    editEntry: "خریداری کی انوائس میں ترمیم",
    invoiceNo: "انوائس نمبر",
    supplier: "سپلائر",
    supplierPlaceholder: "سپلائر منتخب کریں",
    date: "انوائس کی تاریخ",
    debit: "ڈیبٹ (روپے)",
    credit: "کریڈٹ (روپے)",
    debitPlaceholder: "سپلائر کو واجب الادا رقم",
    creditPlaceholder: "سپلائر کو ادا کی گئی رقم",
    totalAmount: "کل رقم (روپے)",
    items: "انوائس کی اشیاء",
    addItem: "آئٹم شامل کریں",
    removeItem: "ہٹائیں",
    product: "پروڈکٹ",
    productPlaceholder: "پروڈکٹ منتخب کریں",
    unit: "یونٹ",
    unitPlaceholder: "یونٹ منتخب کریں",
    category: "کیٹیگری",
    categoryPlaceholder: "کیٹیگری منتخب کریں",
    type: "ٹائپ",
    typePlaceholder: "ٹائپ منتخب کریں",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",
    save: "انوائس محفوظ کریں",
    update: "انوائس اپڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    records: "ریکارڈز",
    searchPlaceholder:
      "انوائس نمبر، سپلائر، پروڈکٹ، یونٹ، کیٹیگری یا ٹائپ سے تلاش کریں...",
    actions: "اقدامات",
    delete: "حذف",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    loading: "پرچیز انوائسز لوڈ ہو رہی ہیں...",
    toggleLang: "English",
    printList: "پرنٹ کریں",
    pdfList: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "پرچیز انوائسز کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    balance: "بیلنس",
    fetchError: "پرچیز انوائسز لوڈ نہیں ہو سکیں۔",
    saveError: "پرچیز انوائس محفوظ نہیں ہو سکی۔",
    updateError: "پرچیز انوائس اپڈیٹ نہیں ہو سکی۔",
    deleteError: "پرچیز انوائس حذف نہیں ہو سکی۔",
    successMsg: "پرچیز انوائس کامیابی سے محفوظ ہو گئی!",
    updateSuccess: "پرچیز انوائس کامیابی سے اپڈیٹ ہو گئی!",
    deleteSuccess: "پرچیز انوائس کامیابی سے حذف ہو گئی!",
    deleteConfirm: "کیا آپ واقعی یہ انوائس حذف کرنا چاہتے ہیں؟",
    optional: "اختیاری",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
    companyName: "علی کیجز",
    thankYou: "آپ کے کاروبار کا شکریہ!",
  },
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyItem = () => ({
  product_name: "",
  unit_name: "",
  category_name: "",
  type_name: "",
  quantity: "",
  rate: "",
  amount: "",
});

const emptyForm = {
  invoice_no: "",
  supplier_name: "",
  invoice_date: "",
  total_amount: "",
  debit: "",
  credit: "",
};

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

const money = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

async function translateText(text) {
  if (!text || !String(text).trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      String(text).trim()
    )}&langpair=en|ur`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.toLowerCase() === String(text).trim().toLowerCase()) {
      return text;
    }
    return translated;
  } catch {
    return text;
  }
}

const PurchaseInvoicePage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const fmt = (v) => money(v);

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([emptyItem()]);
  const [translating, setTranslating] = useState(false);

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [urduCache, setUrduCache] = useState({});

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const getTranslatedValue = (prefix, value) => {
    if (!value) return "";
    return isUrdu ? urduCache[`${prefix}:${value}`] || value : value;
  };

  const normalizeRecord = (r) => ({
    id: r?.id,
    invoice_no: r?.invoice_no || "",
    supplier_name: r?.supplier_name || "",
    invoice_date: r?.invoice_date || "",
    total_amount: Number(r?.total_amount) || 0,
    debit: Number(r?.debit) || 0,
    credit: Number(r?.credit) || 0,
    items: Array.isArray(r?.items)
      ? r.items.map((item) => ({
          id: item?.id,
          product_name: item?.product_name || "",
          unit_name: item?.unit_name || "",
          category_name: item?.category_name || "",
          type_name: item?.type_name || "",
          quantity: item?.quantity ?? "",
          rate: item?.rate ?? "",
          amount: item?.amount ?? "",
        }))
      : [],
  });

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [
        invoicesRes,
        suppliersRes,
        productsRes,
        unitsRes,
        categoriesRes,
        productTypesRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE}/purchase-invoices`),
        axios.get(`${API_BASE}/suppliers`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/units`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/product-types`),
      ]);

      const invoiceList =
        invoicesRes.status === "fulfilled"
          ? Array.isArray(invoicesRes.value?.data)
            ? invoicesRes.value.data
            : invoicesRes.value?.data?.data || []
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
        productTypesRes.status === "fulfilled"
          ? productTypesRes.value?.data
          : [];

      setRecords(invoiceList.map(normalizeRecord));
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
      setRecords([]);
      showMsg("error", err?.response?.data?.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);

    if (newLang !== "ur") return;

    setTranslating(true);
    try {
      const nextCache = { ...urduCache };

      const translateList = async (prefix, arr) => {
        await Promise.all(
          arr.map(async (value) => {
            if (value && !nextCache[`${prefix}:${value}`]) {
              nextCache[`${prefix}:${value}`] = await translateText(value);
            }
          })
        );
      };

      await translateList("supplier", supplierOptions);
      await translateList("product", productOptions);
      await translateList("unit", unitOptions);
      await translateList("category", categoryOptions);
      await translateList("type", typeOptions);

      setUrduCache(nextCache);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const ensureInvoiceTranslations = async (invoice) => {
    if (lang !== "ur") return urduCache;

    const nextCache = { ...urduCache };

    if (invoice?.supplier_name && !nextCache[`supplier:${invoice.supplier_name}`]) {
      nextCache[`supplier:${invoice.supplier_name}`] = await translateText(invoice.supplier_name);
    }

    for (const row of invoice.items || []) {
      if (row.product_name && !nextCache[`product:${row.product_name}`]) {
        nextCache[`product:${row.product_name}`] = await translateText(row.product_name);
      }
      if (row.unit_name && !nextCache[`unit:${row.unit_name}`]) {
        nextCache[`unit:${row.unit_name}`] = await translateText(row.unit_name);
      }
      if (row.category_name && !nextCache[`category:${row.category_name}`]) {
        nextCache[`category:${row.category_name}`] = await translateText(row.category_name);
      }
      if (row.type_name && !nextCache[`type:${row.type_name}`]) {
        nextCache[`type:${row.type_name}`] = await translateText(row.type_name);
      }
    }

    setUrduCache(nextCache);
    return nextCache;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setItems([emptyItem()]);
    setMessage({ type: "", text: "" });
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/purchase-invoices/${id}`);
      const data = normalizeRecord(res.data?.data || res.data);

      if (lang === "ur") {
        setTranslating(true);
        try {
          await ensureInvoiceTranslations(data);
        } finally {
          setTranslating(false);
        }
      }

      setEditingId(data.id);
      setForm({
        invoice_no: data.invoice_no,
        supplier_name: data.supplier_name || "",
        invoice_date: data.invoice_date || "",
        total_amount: data.total_amount || "",
        debit: data.debit || "",
        credit: data.credit || "",
      });

      setItems(
        data.items?.length
          ? data.items.map((item) => ({
              id: item.id,
              product_name: item.product_name || "",
              unit_name: item.unit_name || "",
              category_name: item.category_name || "",
              type_name: item.type_name || "",
              quantity: item.quantity ?? "",
              rate: item.rate ?? "",
              amount: item.amount ?? "",
            }))
          : [emptyItem()]
      );

      setMessage({ type: "", text: "" });
      setShowForm(true);
    } catch (err) {
      showMsg("error", err?.response?.data?.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleItemChange = (index, key, value) => {
    setItems((prev) => {
      const updated = prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [key]: value };
        const qty = parseFloat(key === "quantity" ? value : next.quantity) || 0;
        const rate = parseFloat(key === "rate" ? value : next.rate) || 0;
        next.amount =
          qty && rate
            ? (qty * rate).toFixed(2)
            : qty || rate
            ? (qty * rate).toFixed(2)
            : "";
        return next;
      });

      const total = updated.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      setForm((f) => ({
        ...f,
        total_amount: total ? total.toFixed(2) : "",
        debit: total ? total.toFixed(2) : "",
      }));

      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    const safeItems = updated.length ? updated : [emptyItem()];
    setItems(safeItems);

    const total = safeItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );

    setForm((f) => ({
      ...f,
      total_amount: total ? total.toFixed(2) : "",
      debit: total ? total.toFixed(2) : "",
    }));
  };

  const handleSave = async () => {
    const cleanedItems = items
      .map((item) => ({
        product_name: item.product_name?.trim() || "",
        unit_name: item.unit_name?.trim() || "",
        category_name: item.category_name?.trim() || "",
        type_name: item.type_name?.trim() || "",
        quantity: item.quantity === "" ? null : Number(item.quantity) || 0,
        rate: item.rate === "" ? null : Number(item.rate) || 0,
        amount:
          item.quantity === "" && item.rate === ""
            ? null
            : Number(item.quantity || 0) * Number(item.rate || 0),
      }))
      .filter(
        (item) =>
          item.product_name ||
          item.unit_name ||
          item.category_name ||
          item.type_name ||
          item.quantity !== null ||
          item.rate !== null
      );

    const totalAmount = cleanedItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const payload = {
      invoice_no: form.invoice_no.trim() || null,
      supplier_name: form.supplier_name.trim() || null,
      invoice_date: form.invoice_date || null,
      total_amount: Number(totalAmount.toFixed(2)) || 0,
      debit:
        form.debit === "" || form.debit === null
          ? Number(totalAmount.toFixed(2)) || 0
          : Number(form.debit) || 0,
      credit:
        form.credit === "" || form.credit === null ? 0 : Number(form.credit) || 0,
      items: cleanedItems.map((item) => ({
        ...item,
        amount:
          item.amount === null ? null : Number((item.amount || 0).toFixed(2)),
      })),
    };

    try {
      setSubmitting(true);
      let res;

      if (editingId) {
        res = await axios.put(`${API_BASE}/purchase-invoices/${editingId}`, payload);
      } else {
        res = await axios.post(`${API_BASE}/purchase-invoices`, payload);
      }

      const saved = normalizeRecord(res?.data?.data || res?.data);

      setRecords((prev) =>
        editingId
          ? prev.map((r) => (r.id === editingId ? saved : r))
          : [saved, ...prev]
      );

      showMsg(
        "success",
        res?.data?.message || (editingId ? t.updateSuccess : t.successMsg)
      );
      setShowForm(false);
      resetForm();
    } catch (err) {
      showMsg(
        "error",
        err?.response?.data?.message || (editingId ? t.updateError : t.saveError)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const res = await axios.delete(`${API_BASE}/purchase-invoices/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showMsg("success", res?.data?.message || t.deleteSuccess);
    } catch (err) {
      showMsg("error", err?.response?.data?.message || t.deleteError);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return records;

    return records.filter(
      (r) =>
        (r.invoice_no || "").toLowerCase().includes(q) ||
        (r.supplier_name || "").toLowerCase().includes(q) ||
        (urduCache[`supplier:${r.supplier_name}`] || "").toLowerCase().includes(q) ||
        r.items?.some(
          (item) =>
            (item.product_name || "").toLowerCase().includes(q) ||
            (item.unit_name || "").toLowerCase().includes(q) ||
            (item.category_name || "").toLowerCase().includes(q) ||
            (item.type_name || "").toLowerCase().includes(q) ||
            (urduCache[`product:${item.product_name}`] || "")
              .toLowerCase()
              .includes(q) ||
            (urduCache[`unit:${item.unit_name}`] || "")
              .toLowerCase()
              .includes(q) ||
            (urduCache[`category:${item.category_name}`] || "")
              .toLowerCase()
              .includes(q) ||
            (urduCache[`type:${item.type_name}`] || "")
              .toLowerCase()
              .includes(q)
        )
    );
  }, [records, search, urduCache]);

  const generateSingleInvoicePrint = (invoice, isPdf = false, cache = urduCache) => {
    const font = isUrdu
      ? "'Noto Nastaliq Urdu', serif"
      : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

    const rowItems =
      Array.isArray(invoice?.items) && invoice.items.length
        ? invoice.items
        : [emptyItem()];

    const totalAmount = Number(invoice?.total_amount) || 0;
    const debit = Number(invoice?.debit) || 0;
    const credit = Number(invoice?.credit) || 0;
    const balance = debit - credit;

    const translate = (prefix, value) =>
      isUrdu ? cache[`${prefix}:${value}`] || value || "-" : value || "-";

    const rowsHtml = rowItems
      .map(
        (item, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td>${translate("product", item.product_name)}</td>
            <td>${translate("category", item.category_name)}</td>
            <td class="center">${translate("unit", item.unit_name)}</td>
            <td>${translate("type", item.type_name)}</td>
            <td class="num">${
              item.quantity !== "" && item.quantity != null
                ? fmt(item.quantity)
                : "-"
            }</td>
            <td class="num">${
              item.rate !== "" && item.rate != null ? fmt(item.rate) : "-"
            }</td>
            <td class="num strong violet">${
              item.amount !== "" && item.amount != null ? fmt(item.amount) : "-"
            }</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="${lang}" dir="${dir}">
        <head>
          <meta charset="UTF-8" />
          <title>${invoice.invoice_no || "purchase-invoice"}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f8fafc;
              color: #0f172a;
              font-family: ${font};
            }
            .page {
              width: 100%;
              min-height: 100vh;
              background: linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%);
              padding: 20px;
            }
            .sheet {
              max-width: 1400px;
              margin: 0 auto;
              background: white;
              border: 1px solid #dbeafe;
              box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
              border-radius: 24px;
              overflow: hidden;
            }
            .header {
              position: relative;
              background: linear-gradient(135deg, #0f4c97 0%, #155eaf 65%, #3b82f6 100%);
              color: white;
              padding: 26px 28px 22px;
              overflow: hidden;
            }
            .header:before {
              content: "";
              position: absolute;
              top: 0;
              ${isUrdu ? "left" : "right"}: 0;
              width: 240px;
              height: 100%;
              background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
              clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
            }
            .header-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              position: relative;
              z-index: 2;
            }
            .brand-wrap {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .logo {
              width: 58px;
              height: 58px;
              min-width: 58px;
              border-radius: 999px;
              border: 4px solid rgba(255,255,255,0.85);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              letter-spacing: 0.5px;
              background: rgba(255,255,255,0.08);
              color: white;
              font-size: 13px;
            }
            .brand h1 {
              margin: 0;
              font-size: 30px;
              line-height: 1.15;
              font-weight: 800;
            }
            .brand p {
              margin: 6px 0 0;
              font-size: 13px;
              color: rgba(255,255,255,0.82);
            }
            .meta {
              text-align: ${isUrdu ? "left" : "right"};
              font-size: 12px;
              color: rgba(255,255,255,0.88);
              line-height: 1.8;
              white-space: nowrap;
            }
            .content { padding: 18px; }
            .hint {
              background: #eff6ff;
              color: #1d4ed8;
              border: 1px solid #bfdbfe;
              border-radius: 14px;
              padding: 12px 14px;
              font-size: 13px;
              margin-bottom: 14px;
            }
            .cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
              margin-bottom: 16px;
            }
            .card {
              border-radius: 18px;
              border: 2px solid;
              padding: 14px 16px;
              min-height: 100px;
              position: relative;
              overflow: hidden;
            }
            .card:before {
              content: "";
              position: absolute;
              top: 0;
              ${isUrdu ? "right" : "left"}: 0;
              width: 6px;
              height: 100%;
              background: currentColor;
              opacity: 0.9;
            }
            .card small {
              display: block;
              font-size: 12px;
              opacity: 0.9;
              margin-bottom: 12px;
            }
            .pill {
              position: absolute;
              top: 12px;
              ${isUrdu ? "left" : "right"}: 12px;
              font-size: 10px;
              font-weight: 800;
              color: white;
              padding: 5px 12px;
              border-radius: 999px;
            }
            .card .value {
              font-size: 24px;
              font-weight: 800;
              line-height: 1.2;
              word-break: break-word;
            }
            .card.blue { background: #eff6ff; color: #0f4c97; border-color: #60a5fa; }
            .card.blue .pill { background: #0f4c97; }
            .card.green { background: #ecfdf5; color: #059669; border-color: #34d399; }
            .card.green .pill { background: #059669; }
            .card.orange { background: #fff7ed; color: #c2410c; border-color: #fb923c; }
            .card.orange .pill { background: #c2410c; }
            .totals {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
              margin-bottom: 14px;
            }
            .total-box {
              background: #f8fafc;
              border: 1px solid #dbeafe;
              border-radius: 16px;
              padding: 14px 16px;
            }
            .total-box .label {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .total-box .value {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              font-family: Helvetica, Arial, sans-serif;
            }
            .section-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f1f5f9;
              border-radius: 10px;
              padding: 8px 12px;
              margin-bottom: 8px;
              color: #475569;
              font-size: 12px;
              font-weight: 700;
            }
            .watermark-wrap { position: relative; }
            .watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              font-size: 82px;
              font-weight: 800;
              color: rgba(15, 76, 151, 0.06);
              transform: rotate(-28deg);
              user-select: none;
              z-index: 0;
              letter-spacing: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              position: relative;
              z-index: 1;
            }
            thead th {
              background: #0f4c97;
              color: white;
              font-size: 12px;
              padding: 12px 10px;
              border: 1px solid #1d4ed8;
              text-align: ${isUrdu ? "right" : "left"};
              white-space: nowrap;
            }
            tbody td, tfoot td {
              border: 1px solid #dbeafe;
              padding: 10px 10px;
              font-size: 12px;
              vertical-align: top;
            }
            tbody tr:nth-child(even) td { background: #f8fbff; }
            .center { text-align: center !important; }
            .num {
              text-align: ${isUrdu ? "left" : "right"} !important;
              white-space: nowrap;
              font-weight: 700;
              font-family: Helvetica, Arial, sans-serif;
            }
            .strong { font-weight: 800; }
            .violet { color: #7c3aed; }
            .foot-row td {
              background: #eaf3ff;
              font-weight: 800;
              color: #0f172a;
            }
            .footer {
              background: #0f4c97;
              color: rgba(255,255,255,0.9);
              padding: 10px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
            }
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
              body { background: white; }
              .page { padding: 0; background: white; }
              .sheet {
                box-shadow: none;
                border: none;
                border-radius: 0;
                max-width: none;
              }
              .hint { display: none; }
            }
            @media (max-width: 900px) {
              .cards, .totals { grid-template-columns: 1fr; }
              .header-row {
                flex-direction: column;
                align-items: flex-start;
              }
              .meta {
                text-align: ${isUrdu ? "right" : "left"};
                white-space: normal;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="sheet">
              <div class="header">
                <div class="header-row">
                  <div class="brand-wrap">
                    <div class="logo">PINV</div>
                    <div class="brand">
                      <h1>${t.companyName}</h1>
                      <p>${t.title}</p>
                    </div>
                  </div>
                  <div class="meta">
                    <div>${t.printedOn}: ${new Date().toLocaleString(
      isUrdu ? "ur-PK" : "en-PK"
    )}</div>
                    <div>${t.date}: ${invoice.invoice_date || "-"}</div>
                  </div>
                </div>
              </div>

              <div class="content">
                ${
                  isPdf
                    ? `<div class="hint">${t.savePdfHint}</div>`
                    : ""
                }

                <div class="cards">
                  <div class="card blue">
                    <small>${t.invoiceNo}</small>
                    <div class="pill">INV</div>
                    <div class="value">${invoice.invoice_no || "-"}</div>
                  </div>

                  <div class="card green">
                    <small>${t.supplier}</small>
                    <div class="pill">SUP</div>
                    <div class="value">${translate("supplier", invoice.supplier_name)}</div>
                  </div>

                  <div class="card orange">
                    <small>${t.date}</small>
                    <div class="pill">DATE</div>
                    <div class="value">${invoice.invoice_date || "-"}</div>
                  </div>
                </div>

                <div class="totals">
                  <div class="total-box">
                    <div class="label">${t.totalAmount}</div>
                    <div class="value">${fmt(totalAmount)}</div>
                  </div>
                  <div class="total-box">
                    <div class="label">${t.debit}</div>
                    <div class="value">${fmt(debit)}</div>
                  </div>
                  <div class="total-box">
                    <div class="label">${t.credit}</div>
                    <div class="value">${fmt(credit)}</div>
                  </div>
                  <div class="total-box">
                    <div class="label">${t.balance}</div>
                    <div class="value">${fmt(Math.abs(balance))}</div>
                  </div>
                </div>

                <div class="section-bar">
                  <span>${t.items}</span>
                  <span>${rowItems.length}</span>
                </div>

                <div class="watermark-wrap">
                  <div class="watermark">${t.companyName}</div>

                  <table>
                    <thead>
                      <tr>
                        <th class="center">#</th>
                        <th>${t.product}</th>
                        <th>${t.category}</th>
                        <th class="center">${t.unit}</th>
                        <th>${t.type}</th>
                        <th class="num">${t.qty}</th>
                        <th class="num">${t.rate}</th>
                        <th class="num">${t.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rowsHtml}
                    </tbody>
                    <tfoot>
                      <tr class="foot-row">
                        <td colspan="7">${t.totalAmount}</td>
                        <td class="num">${fmt(totalAmount)}</td>
                      </tr>
                      <tr class="foot-row">
                        <td colspan="7">${t.debit}</td>
                        <td class="num">${fmt(debit)}</td>
                      </tr>
                      <tr class="foot-row">
                        <td colspan="7">${t.credit}</td>
                        <td class="num">${fmt(credit)}</td>
                      </tr>
                      <tr class="foot-row">
                        <td colspan="7">${t.balance}</td>
                        <td class="num">${fmt(Math.abs(balance))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div class="footer">
                <span>${t.companyName} — ${t.thankYou}</span>
                <span>Page 1 / 1</span>
              </div>
            </div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1400,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handlePrintSingle = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/purchase-invoices/${id}`);
      const data = normalizeRecord(res.data?.data || res.data);

      let cacheToUse = urduCache;
      if (lang === "ur") {
        setTranslating(true);
        try {
          cacheToUse = await ensureInvoiceTranslations(data);
        } finally {
          setTranslating(false);
        }
      }

      generateSingleInvoicePrint(data, false, cacheToUse);
    } catch (err) {
      showMsg("error", err?.response?.data?.message || t.fetchError);
    }
  };

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu
      ? "'Noto Nastaliq Urdu', serif"
      : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

    const balanceTotal = filtered.reduce(
      (sum, r) => sum + ((Number(r.debit) || 0) - (Number(r.credit) || 0)),
      0
    );

    const totalAmountSum = filtered.reduce(
      (sum, r) => sum + (Number(r.total_amount) || 0),
      0
    );

    const debitSum = filtered.reduce(
      (sum, r) => sum + (Number(r.debit) || 0),
      0
    );

    const creditSum = filtered.reduce(
      (sum, r) => sum + (Number(r.credit) || 0),
      0
    );

    const translate = (prefix, value) =>
      isUrdu ? urduCache[`${prefix}:${value}`] || value || "-" : value || "-";

    const rowsHtml = filtered
      .map((r, i) => {
        const rowItems =
          Array.isArray(r.items) && r.items.length ? r.items : [emptyItem()];

        return rowItems
          .map(
            (item, itemIndex) => `
              <tr>
                ${
                  itemIndex === 0
                    ? `
                      <td class="center" rowspan="${rowItems.length}">${i + 1}</td>
                      <td rowspan="${rowItems.length}"><strong>${r.invoice_no || "-"}</strong></td>
                      <td rowspan="${rowItems.length}">${translate("supplier", r.supplier_name)}</td>
                      <td class="center" rowspan="${rowItems.length}">${r.invoice_date || "-"}</td>
                    `
                    : ""
                }

                <td>${translate("product", item.product_name)}</td>
                <td>${translate("category", item.category_name)}</td>
                <td class="center">${translate("unit", item.unit_name)}</td>
                <td>${translate("type", item.type_name)}</td>
                <td class="num">${
                  item.quantity !== "" && item.quantity != null
                    ? fmt(item.quantity)
                    : "-"
                }</td>
                <td class="num">${
                  item.rate !== "" && item.rate != null ? fmt(item.rate) : "-"
                }</td>
                <td class="num strong violet">${
                  item.amount !== "" && item.amount != null
                    ? fmt(item.amount)
                    : "-"
                }</td>

                ${
                  itemIndex === 0
                    ? `
                      <td class="num" rowspan="${rowItems.length}">${fmt(r.total_amount)}</td>
                      <td class="num" rowspan="${rowItems.length}">${fmt(r.debit)}</td>
                      <td class="num" rowspan="${rowItems.length}">${fmt(r.credit)}</td>
                      <td class="num strong" rowspan="${rowItems.length}">
                        ${fmt(
                          Math.abs((Number(r.debit) || 0) - (Number(r.credit) || 0))
                        )}
                        ${
                          (Number(r.debit) || 0) - (Number(r.credit) || 0) > 0
                            ? " DR"
                            : (Number(r.debit) || 0) - (Number(r.credit) || 0) < 0
                            ? " CR"
                            : ""
                        }
                      </td>
                    `
                    : ""
                }
              </tr>
            `
          )
          .join("");
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="${lang}" dir="${dir}">
        <head>
          <meta charset="UTF-8" />
          <title>${t.title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f8fafc;
              color: #0f172a;
              font-family: ${font};
            }
            .page {
              width: 100%;
              min-height: 100vh;
              background: linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%);
              padding: 20px;
            }
            .sheet {
              max-width: 1400px;
              margin: 0 auto;
              background: white;
              border: 1px solid #dbeafe;
              box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
              border-radius: 24px;
              overflow: hidden;
            }
            .header {
              position: relative;
              background: linear-gradient(135deg, #0f4c97 0%, #155eaf 65%, #3b82f6 100%);
              color: white;
              padding: 26px 28px 22px;
              overflow: hidden;
            }
            .header:before {
              content: "";
              position: absolute;
              top: 0;
              ${isUrdu ? "left" : "right"}: 0;
              width: 240px;
              height: 100%;
              background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
              clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
            }
            .header-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              position: relative;
              z-index: 2;
            }
            .brand-wrap {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .logo {
              width: 58px;
              height: 58px;
              min-width: 58px;
              border-radius: 999px;
              border: 4px solid rgba(255,255,255,0.85);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              letter-spacing: 0.5px;
              background: rgba(255,255,255,0.08);
              color: white;
              font-size: 13px;
            }
            .brand h1 {
              margin: 0;
              font-size: 30px;
              line-height: 1.15;
              font-weight: 800;
            }
            .brand p {
              margin: 6px 0 0;
              font-size: 13px;
              color: rgba(255,255,255,0.82);
            }
            .meta {
              text-align: ${isUrdu ? "left" : "right"};
              font-size: 12px;
              color: rgba(255,255,255,0.88);
              line-height: 1.8;
              white-space: nowrap;
            }
            .content { padding: 18px; }
            .hint {
              background: #eff6ff;
              color: #1d4ed8;
              border: 1px solid #bfdbfe;
              border-radius: 14px;
              padding: 12px 14px;
              font-size: 13px;
              margin-bottom: 14px;
            }
            .cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
              margin-bottom: 16px;
            }
            .card {
              border-radius: 18px;
              border: 2px solid;
              padding: 14px 16px;
              min-height: 100px;
              position: relative;
              overflow: hidden;
            }
            .card:before {
              content: "";
              position: absolute;
              top: 0;
              ${isUrdu ? "right" : "left"}: 0;
              width: 6px;
              height: 100%;
              background: currentColor;
              opacity: 0.9;
            }
            .card small {
              display: block;
              font-size: 12px;
              opacity: 0.9;
              margin-bottom: 12px;
            }
            .pill {
              position: absolute;
              top: 12px;
              ${isUrdu ? "left" : "right"}: 12px;
              font-size: 10px;
              font-weight: 800;
              color: white;
              padding: 5px 12px;
              border-radius: 999px;
            }
            .card .value {
              font-size: 24px;
              font-weight: 800;
              line-height: 1.2;
              word-break: break-word;
            }
            .card.blue { background: #eff6ff; color: #0f4c97; border-color: #60a5fa; }
            .card.blue .pill { background: #0f4c97; }
            .card.green { background: #ecfdf5; color: #059669; border-color: #34d399; }
            .card.green .pill { background: #059669; }
            .card.orange { background: #fff7ed; color: #c2410c; border-color: #fb923c; }
            .card.orange .pill { background: #c2410c; }

            .totals {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
              margin-bottom: 14px;
            }
            .total-box {
              background: #f8fafc;
              border: 1px solid #dbeafe;
              border-radius: 16px;
              padding: 14px 16px;
            }
            .total-box .label {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .total-box .value {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              font-family: Helvetica, Arial, sans-serif;
            }
            .section-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f1f5f9;
              border-radius: 10px;
              padding: 8px 12px;
              margin-bottom: 8px;
              color: #475569;
              font-size: 12px;
              font-weight: 700;
            }
            .watermark-wrap { position: relative; }
            .watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              font-size: 82px;
              font-weight: 800;
              color: rgba(15, 76, 151, 0.06);
              transform: rotate(-28deg);
              user-select: none;
              z-index: 0;
              letter-spacing: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              position: relative;
              z-index: 1;
            }
            thead th {
              background: #0f4c97;
              color: white;
              font-size: 12px;
              padding: 12px 10px;
              border: 1px solid #1d4ed8;
              text-align: ${isUrdu ? "right" : "left"};
              white-space: nowrap;
            }
            tbody td, tfoot td {
              border: 1px solid #dbeafe;
              padding: 10px 10px;
              font-size: 12px;
              vertical-align: top;
            }
            tbody tr:nth-child(even) td { background: #f8fbff; }
            .center { text-align: center !important; }
            .num {
              text-align: ${isUrdu ? "left" : "right"} !important;
              white-space: nowrap;
              font-weight: 700;
              font-family: Helvetica, Arial, sans-serif;
            }
            .strong { font-weight: 800; }
            .violet { color: #7c3aed; }
            .foot-row td {
              background: #eaf3ff;
              font-weight: 800;
              color: #0f172a;
            }
            .footer {
              background: #0f4c97;
              color: rgba(255,255,255,0.9);
              padding: 10px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
            }
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
              body { background: white; }
              .page { padding: 0; background: white; }
              .sheet {
                box-shadow: none;
                border: none;
                border-radius: 0;
                max-width: none;
              }
              .hint { display: none; }
            }
            @media (max-width: 900px) {
              .cards, .totals { grid-template-columns: 1fr; }
              .header-row {
                flex-direction: column;
                align-items: flex-start;
              }
              .meta {
                text-align: ${isUrdu ? "right" : "left"};
                white-space: normal;
              }
            }
          </style>
        </head>

        <body>
          <div class="page">
            <div class="sheet">
              <div class="header">
                <div class="header-row">
                  <div class="brand-wrap">
                    <div class="logo">PINV</div>
                    <div class="brand">
                      <h1>${t.companyName}</h1>
                      <p>${t.reportHeader}</p>
                    </div>
                  </div>

                  <div class="meta">
                    <div>${t.printedOn}: ${new Date().toLocaleString(
      isUrdu ? "ur-PK" : "en-PK"
    )}</div>
                    <div>${t.records}: ${filtered.length}</div>
                  </div>
                </div>
              </div>

              <div class="content">
                ${isPdf ? `<div class="hint">${t.savePdfHint}</div>` : ""}

                <div class="cards">
                  <div class="card blue">
                    <small>${t.records}</small>
                    <div class="pill">REC</div>
                    <div class="value">${filtered.length}</div>
                  </div>

                  <div class="card green">
                    <small>${t.totalAmount}</small>
                    <div class="pill">TOT</div>
                    <div class="value">₨ ${fmt(totalAmountSum)}</div>
                  </div>

                  <div class="card orange">
                    <small>${t.balance}</small>
                    <div class="pill">BAL</div>
                    <div class="value">₨ ${fmt(Math.abs(balanceTotal))}</div>
                  </div>
                </div>

                <div class="totals">
                  <div class="total-box">
                    <div class="label">${t.totalAmount}</div>
                    <div class="value">${fmt(totalAmountSum)}</div>
                  </div>

                  <div class="total-box">
                    <div class="label">${t.debit}</div>
                    <div class="value">${fmt(debitSum)}</div>
                  </div>

                  <div class="total-box">
                    <div class="label">${t.credit}</div>
                    <div class="value">${fmt(creditSum)}</div>
                  </div>

                  <div class="total-box">
                    <div class="label">${t.balance}</div>
                    <div class="value">${fmt(Math.abs(balanceTotal))}</div>
                  </div>
                </div>

                <div class="section-bar">
                  <span>${t.records}</span>
                  <span>${filtered.length}</span>
                </div>

                <div class="watermark-wrap">
                  <div class="watermark">${t.companyName}</div>

                  <table>
                    <thead>
                      <tr>
                        <th class="center">#</th>
                        <th>${t.invoiceNo}</th>
                        <th>${t.supplier}</th>
                        <th class="center">${t.date}</th>
                        <th>${t.product}</th>
                        <th>${t.category}</th>
                        <th class="center">${t.unit}</th>
                        <th>${t.type}</th>
                        <th class="num">${t.qty}</th>
                        <th class="num">${t.rate}</th>
                        <th class="num">${t.amount}</th>
                        <th class="num">${t.totalAmount}</th>
                        <th class="num">${t.debit}</th>
                        <th class="num">${t.credit}</th>
                        <th class="num">${t.balance}</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${
                        filtered.length
                          ? rowsHtml
                          : `<tr><td colspan="15" style="text-align:center">${t.noRecords}</td></tr>`
                      }
                    </tbody>

                    <tfoot>
                      <tr class="foot-row">
                        <td colspan="11">${t.totalAmount}</td>
                        <td class="num">${fmt(totalAmountSum)}</td>
                        <td class="num">${fmt(debitSum)}</td>
                        <td class="num">${fmt(creditSum)}</td>
                        <td class="num">${fmt(Math.abs(balanceTotal))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div class="footer">
                <span>${t.companyName} — ${t.thankYou}</span>
                <span>Page 1 / 1</span>
              </div>
            </div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1400,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      dir={dir}
      style={{ fontFamily: baseFont }}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 sm:p-6 pb-20"
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {message.text && !showForm && (
        <div
          className={`fixed bottom-6 ${
            isUrdu ? "left-6" : "right-6"
          } z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-base font-semibold flex items-center gap-2 ${
            message.type === "error" ? "bg-rose-600" : "bg-sky-600"
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

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5 mb-6">
          <div
            className={`flex items-center justify-between gap-4 flex-wrap ${
              isUrdu ? "flex-row-reverse" : ""
            }`}
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black">
                {t.title}
              </h1>
              <p className="text-base text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleLangToggle}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-base font-semibold hover:bg-sky-50 transition shadow-sm"
              >
                <i className="bi bi-translate"></i>
                {t.toggleLang}
              </button>

              <button
                onClick={openAdd}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-xl shadow-lg shadow-sky-200 font-semibold text-base flex items-center gap-2"
              >
                <i className="bi bi-file-earmark-plus-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full max-w-md">
            <i
              className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isUrdu ? "right-4" : "left-4"
              }`}
            ></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full rounded-2xl border border-sky-100 bg-white ${
                isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"
              } py-3.5 text-base text-black focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm`}
            />
          </div>

          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => generatePrintDocument(false)}
              className="flex items-center gap-2 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 px-4 py-3 rounded-xl font-semibold text-base transition shadow-sm"
            >
              <i className="bi bi-printer text-blue-600"></i>
              {t.printList}
            </button>

            <button
              onClick={() => generatePrintDocument(true)}
              className="flex items-center gap-2 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 px-4 py-3 rounded-xl font-semibold text-base transition shadow-sm"
            >
              <i className="bi bi-file-earmark-pdf text-red-600"></i>
              {t.pdfList}
            </button>
          </div>
        </div>

        <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-sky-100 bg-sky-50 flex items-center gap-2">
            <i className="bi bi-table text-slate-400"></i>
            <h3 className="font-bold text-slate-700 text-sm">
              {t.records}
              <span className="mx-2 bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {filtered.length}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 min-w-[1400px]">
              <thead className="bg-sky-50 border-b border-sky-100">
                <tr className="text-slate-600 text-sm font-bold">
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.invoiceNo}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.supplier}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.unit}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.date}</th>
                  <th className="px-5 py-3 text-right">{t.totalAmount}</th>
                  <th className="px-5 py-3 text-right">{t.debit}</th>
                  <th className="px-5 py-3 text-right">{t.credit}</th>
                  <th className="px-5 py-3 text-right">{t.balance}</th>
                  <th className="px-5 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-10 text-center text-slate-400">
                      {t.loading}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-10 text-center text-slate-400">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const balance = (Number(r.debit) || 0) - (Number(r.credit) || 0);
                    const rowItems =
                      Array.isArray(r.items) && r.items.length ? r.items : [emptyItem()];

                    return rowItems.map((item, itemIndex) => (
                      <tr
                        key={`${r.id}-${itemIndex}`}
                        className="hover:bg-sky-50/60 transition align-top"
                      >
                        {itemIndex === 0 && (
                          <>
                            <td
                              rowSpan={rowItems.length}
                              className="px-5 py-3.5 text-slate-400 font-mono text-xs"
                            >
                              {i + 1}
                            </td>

                            <td rowSpan={rowItems.length} className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-100 text-slate-700 text-xs font-mono font-semibold border border-sky-200">
                                <i className="bi bi-receipt text-xs"></i>
                                {r.invoice_no || "—"}
                              </span>
                            </td>

                            <td rowSpan={rowItems.length} className="px-5 py-3.5 font-medium text-black">
                              {getTranslatedValue("supplier", r.supplier_name) || "—"}
                            </td>
                          </>
                        )}

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {getTranslatedValue("product", item.product_name) || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {getTranslatedValue("unit", item.unit_name) || "—"}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {getTranslatedValue("category", item.category_name) || "—"}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {getTranslatedValue("type", item.type_name) || "—"}
                        </td>

                        {itemIndex === 0 && (
                          <>
                            <td
                              rowSpan={rowItems.length}
                              className="px-5 py-3.5 text-slate-500 text-xs"
                            >
                              {r.invoice_date || "—"}
                            </td>

                            <td
                              rowSpan={rowItems.length}
                              className="px-5 py-3.5 text-right font-mono font-bold text-slate-700"
                            >
                              ₨ {fmt(r.total_amount)}
                            </td>

                            <td
                              rowSpan={rowItems.length}
                              className="px-5 py-3.5 text-right font-mono font-bold text-slate-700"
                            >
                              ₨ {fmt(r.debit)}
                            </td>

                            <td
                              rowSpan={rowItems.length}
                              className="px-5 py-3.5 text-right font-mono font-bold text-slate-700"
                            >
                              ₨ {fmt(r.credit)}
                            </td>

                            <td
                              rowSpan={rowItems.length}
                              className="px-5 py-3.5 text-right font-mono font-bold text-slate-700"
                            >
                              ₨ {fmt(Math.abs(balance))}
                              <span className="ml-1 text-[10px] font-semibold text-slate-500">
                                {balance > 0 ? "DR" : balance < 0 ? "CR" : ""}
                              </span>
                            </td>

                            <td rowSpan={rowItems.length} className="px-5 py-3.5">
                              <div className="flex justify-center gap-2 flex-wrap">
                                <button
                                  onClick={() => openEdit(r.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-100 text-sky-700 text-xs font-semibold hover:bg-sky-200 transition"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                  {t.editBtn}
                                </button>

                                <button
                                  onClick={() => handleDelete(r.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-600 text-xs font-semibold hover:bg-rose-200 transition"
                                >
                                  <i className="bi bi-trash3"></i>
                                  {t.delete}
                                </button>

                                <button
                                  onClick={() => handlePrintSingle(r.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition"
                                >
                                  <i className="bi bi-printer-fill"></i>
                                  {t.printList}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ));
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 p-3 overflow-y-auto">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mt-6">
              <div
                className={`px-5 sm:px-6 py-4 border-b border-sky-100 flex items-center justify-between gap-3 ${
                  isUrdu ? "flex-row-reverse" : ""
                }`}
              >
                <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                    <i className="bi bi-receipt text-sky-700 text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-black">
                      {editingId ? t.editEntry : t.newEntry}
                    </h2>
                    <p className="text-base text-slate-500 mt-1">{t.subtitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {message.text && (
                  <div
                    className={`mb-5 text-sm font-bold px-4 py-3 rounded-2xl flex items-center gap-2 border ${
                      message.type === "error"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    <i
                      className={`bi ${
                        message.type === "error"
                          ? "bi-exclamation-triangle"
                          : "bi-check-circle"
                      }`}
                    ></i>
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.invoiceNo} <span className="text-slate-400">({t.optional})</span>
                    </label>
                    <input
                      name="invoice_no"
                      value={form.invoice_no}
                      onChange={handleChange}
                      placeholder="PI-001"
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                        isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.supplier} <span className="text-slate-400">({t.optional})</span>
                    </label>
                    <select
                      name="supplier_name"
                      value={form.supplier_name}
                      onChange={handleChange}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                        isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                      }`}
                    >
                      <option value="">{t.supplierPlaceholder}</option>
                      {supplierOptions.map((option, idx) => (
                        <option key={`${option}-${idx}`} value={option}>
                          {getTranslatedValue("supplier", option)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.date} <span className="text-slate-400">({t.optional})</span>
                    </label>
                    <input
                      type="date"
                      name="invoice_date"
                      value={form.invoice_date}
                      onChange={handleChange}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                        isUrdu ? "pr-4 pl-4" : "px-4"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                      {t.debit}
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="debit"
                      value={form.debit}
                      onChange={handleChange}
                      placeholder={t.debitPlaceholder}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 font-mono text-slate-950 ${
                        isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                      }`}
                    />
                  </div>

                  <div className="rounded-2xl bg-white border border-sky-100 p-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                      {t.credit}
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="credit"
                      value={form.credit}
                      onChange={handleChange}
                      placeholder={t.creditPlaceholder}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 font-mono text-slate-950 ${
                        isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className={`flex items-center justify-between gap-3 flex-wrap ${
                      isUrdu ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div>
                      <h3 className="text-xl font-extrabold text-black">{t.items}</h3>
                    </div>

                    <button
                      onClick={addItem}
                      type="button"
                      className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <i className="bi bi-plus-lg"></i>
                      {t.addItem}
                    </button>
                  </div>

                  <div className="rounded-3xl border border-sky-100 overflow-hidden bg-white mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1100px] text-sm text-slate-600">
                        <thead className="bg-sky-50">
                          <tr className="text-slate-600 text-sm font-bold border-b border-sky-100">
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.unit}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-32`}>{t.qty}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-36`}>{t.rate}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"} w-36`}>{t.amount}</th>
                            <th className="px-4 py-3 w-24 text-center"></th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-sky-50">
                          {items.map((item, index) => (
                            <tr key={index} className="hover:bg-sky-50/60">
                              <td className="px-4 py-3">
                                <select
                                  value={item.product_name}
                                  onChange={(e) =>
                                    handleItemChange(index, "product_name", e.target.value)
                                  }
                                  className={`w-full border border-sky-100 rounded-2xl py-3 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                                    isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                                  }`}
                                >
                                  <option value="">{t.productPlaceholder}</option>
                                  {productOptions.map((option, idx) => (
                                    <option key={`${option}-${idx}`} value={option}>
                                      {getTranslatedValue("product", option)}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-4 py-3">
                                <select
                                  value={item.unit_name}
                                  onChange={(e) =>
                                    handleItemChange(index, "unit_name", e.target.value)
                                  }
                                  className={`w-full border border-sky-100 rounded-2xl py-3 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                                    isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                                  }`}
                                >
                                  <option value="">{t.unitPlaceholder}</option>
                                  {unitOptions.map((option, idx) => (
                                    <option key={`${option}-${idx}`} value={option}>
                                      {getTranslatedValue("unit", option)}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-4 py-3">
                                <select
                                  value={item.category_name}
                                  onChange={(e) =>
                                    handleItemChange(index, "category_name", e.target.value)
                                  }
                                  className={`w-full border border-sky-100 rounded-2xl py-3 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                                    isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                                  }`}
                                >
                                  <option value="">{t.categoryPlaceholder}</option>
                                  {categoryOptions.map((option, idx) => (
                                    <option key={`${option}-${idx}`} value={option}>
                                      {getTranslatedValue("category", option)}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-4 py-3">
                                <select
                                  value={item.type_name}
                                  onChange={(e) =>
                                    handleItemChange(index, "type_name", e.target.value)
                                  }
                                  className={`w-full border border-sky-100 rounded-2xl py-3 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                                    isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                                  }`}
                                >
                                  <option value="">{t.typePlaceholder}</option>
                                  {typeOptions.map((option, idx) => (
                                    <option key={`${option}-${idx}`} value={option}>
                                      {getTranslatedValue("type", option)}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(index, "quantity", e.target.value)
                                  }
                                  className="w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 text-center font-mono"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>

                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) =>
                                    handleItemChange(index, "rate", e.target.value)
                                  }
                                  className="w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 text-right font-mono"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </td>

                              <td
                                className={`px-4 py-3 font-mono font-bold text-slate-950 ${
                                  isUrdu ? "text-left" : "text-right"
                                }`}
                              >
                                ₨ {fmt(item.amount)}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="px-3 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-semibold"
                                  >
                                    {t.removeItem}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                    <p className="text-sm text-slate-500 mb-1">{t.totalAmount}</p>
                    <div className="text-2xl font-extrabold text-slate-950 font-mono">
                      ₨ {fmt(form.total_amount)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-sky-100 p-4">
                    <p className="text-sm text-slate-500 mb-1">{t.debit}</p>
                    <div className="text-2xl font-extrabold text-slate-950 font-mono">
                      ₨ {fmt(form.debit)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-sky-100 p-4">
                    <p className="text-sm text-slate-500 mb-1">{t.credit}</p>
                    <div className="text-2xl font-extrabold text-slate-950 font-mono">
                      ₨ {fmt(form.credit)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-sky-100 border border-sky-200 p-4">
                    <p className="text-sm text-slate-500 mb-1">{t.balance}</p>
                    <div className="text-3xl font-extrabold text-slate-950 font-mono">
                      ₨ {fmt(
                        Math.abs((Number(form.debit) || 0) - (Number(form.credit) || 0))
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex gap-3 pt-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-2xl py-3.5 font-semibold text-base shadow-lg shadow-sky-200"
                  >
                    {submitting ? t.saving : editingId ? t.update : t.save}
                  </button>

                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={submitting}
                    className="flex-1 border border-sky-200 bg-white hover:bg-sky-50 text-sky-700 rounded-2xl py-3.5 font-semibold text-base disabled:opacity-60"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseInvoicePage;