import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const LANG = {
  en: {
    title: "Purchase Return",
    subtitle: "Manage your purchase returns and refunds",
    addBtn: "New Return",
    editBtn: "Edit",
    newEntry: "New Purchase Return",
    editEntry: "Edit Purchase Return",
    searchPlaceholder: "Search by invoice, supplier, product or reason...",
    invoice: "Purchase Invoice",
    selectInvoice: "-- Select Invoice --",
    returnDate: "Return Date",
    totalAmount: "Total Amount (PKR)",
    debit: "Debit (PKR)",
    credit: "Credit (PKR)",
    debitPlaceholder: "Debit amount",
    creditPlaceholder: "Credit amount",
    reason: "Reason",
    invoiceNo: "Invoice No",
    supplier: "Supplier",
    items: "Return Items",
    addItem: "Add Item",
    removeItem: "Remove",
    product: "Product",
    unit: "Unit",
    category: "Category",
    type: "Type",
    purchasedQty: "Purchased Qty",
    returnedQty: "Returned Qty",
    remainingQty: "Remaining Qty",
    returnQty: "Return Qty",
    rate: "Rate",
    amount: "Amount",
    balance: "Balance",
    save: "Save Return",
    update: "Update Return",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    actions: "Actions",
    records: "Records",
    noRecords: "No records found.",
    loading: "Loading purchase returns...",
    toggleLang: "اردو",
    printBtn: "Print",
    pdfBtn: "Download PDF",
    reportHeader: "Purchase Returns List",
    printedOn: "Printed On",
    errorInvoice: "Purchase invoice is required!",
    itemErrorMsg:
      "Return quantity must be greater than 0 and not exceed remaining quantity.",
    fetchError: "Failed to load purchase returns.",
    saveError: "Failed to save purchase return.",
    updateError: "Failed to update purchase return.",
    deleteError: "Failed to delete purchase return.",
    successMsg: "Purchase return saved successfully!",
    updateSuccess: "Purchase return updated successfully!",
    deleteSuccess: "Purchase return deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this return?",
    autoFilled: "Auto-filled from invoice",
    translating: "Translating to Urdu…",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
    companyName: "Ali Cages",
    thankYou: "Thank you for your business!",
  },
  ur: {
    title: "پرچیز ریٹرن",
    subtitle: "اپنی خریداری کی واپسی اور ریفنڈز کا انتظام کریں",
    addBtn: "نئی واپسی",
    editBtn: "ترمیم",
    newEntry: "نئی پرچیز ریٹرن",
    editEntry: "پرچیز ریٹرن میں ترمیم",
    searchPlaceholder: "انوائس، سپلائر، پروڈکٹ یا وجہ سے تلاش کریں...",
    invoice: "پرچیز انوائس",
    selectInvoice: "-- انوائس منتخب کریں --",
    returnDate: "واپسی کی تاریخ",
    totalAmount: "کل رقم (روپے)",
    debit: "ڈیبٹ (روپے)",
    credit: "کریڈٹ (روپے)",
    debitPlaceholder: "ڈیبٹ رقم",
    creditPlaceholder: "کریڈٹ رقم",
    reason: "وجہ",
    invoiceNo: "انوائس نمبر",
    supplier: "سپلائر",
    items: "واپسی کی اشیاء",
    addItem: "آئٹم شامل کریں",
    removeItem: "ہٹائیں",
    product: "پروڈکٹ",
    unit: "یونٹ",
    category: "کیٹیگری",
    type: "ٹائپ",
    purchasedQty: "خریدی گئی مقدار",
    returnedQty: "واپس کی گئی مقدار",
    remainingQty: "باقی مقدار",
    returnQty: "واپسی مقدار",
    rate: "ریٹ",
    amount: "رقم",
    balance: "بیلنس",
    save: "واپسی محفوظ کریں",
    update: "واپسی اپڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    delete: "حذف",
    actions: "اقدامات",
    records: "ریکارڈز",
    noRecords: "کوئی ریکارڈ نہیں ملا۔",
    loading: "پرچیز ریٹرنز لوڈ ہو رہی ہیں...",
    toggleLang: "English",
    printBtn: "پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "پرچیز ریٹرنز کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    errorInvoice: "پرچیز انوائس لازمی ہے!",
    itemErrorMsg:
      "واپسی کی مقدار 0 سے زیادہ ہو اور باقی مقدار سے زیادہ نہ ہو۔",
    fetchError: "پرچیز ریٹرنز لوڈ نہیں ہو سکے۔",
    saveError: "پرچیز ریٹرن محفوظ نہیں ہو سکا۔",
    updateError: "پرچیز ریٹرن اپڈیٹ نہیں ہو سکا۔",
    deleteError: "پرچیز ریٹرن حذف نہیں ہو سکا۔",
    successMsg: "پرچیز ریٹرن کامیابی سے محفوظ ہو گیا!",
    updateSuccess: "پرچیز ریٹرن کامیابی سے اپڈیٹ ہو گیا!",
    deleteSuccess: "پرچیز ریٹرن کامیابی سے حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی یہ واپسی حذف کرنا چاہتے ہیں؟",
    autoFilled: "انوائس سے خودکار بھرا گیا",
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
  purchased_qty: 0,
  already_returned_qty: 0,
  remaining_qty: 0,
  quantity: "",
  rate: "",
  amount: "",
});

const emptyForm = {
  invoice_id: "",
  invoice_no: "",
  supplier_name: "",
  return_date: "",
  total_amount: "",
  debit: "",
  credit: "",
  reason: "",
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

const PurchaseReturnPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const fmt = (v) => money(v);

  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [translating, setTranslating] = useState(false);
  const [urduCache, setUrduCache] = useState({});

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const tr = (prefix, value) =>
    isUrdu ? urduCache[`${prefix}:${value}`] || value || "-" : value || "-";

  const normalizeRecord = (r) => ({
    id: r?.id,
    invoice_id: r?.invoice_id || "",
    invoice_no: r?.invoice_no || "",
    supplier_name: r?.supplier_name || "",
    return_date: r?.return_date || "",
    reason: r?.reason || "",
    total_amount: Number(r?.total_amount) || 0,
    debit: Number(r?.debit) || 0,
    credit: Number(r?.credit) || 0,
    items: Array.isArray(r?.items)
      ? r.items.map((item) => ({
          id: item?.id,
          return_id: item?.return_id,
          product_id: item?.product_id,
          product_name: item?.product_name || "",
          unit_name: item?.unit_name || "",
          category_name: item?.category_name || "",
          type_name: item?.type_name || "",
          purchased_qty: Number(item?.purchased_qty) || 0,
          already_returned_qty: Number(item?.already_returned_qty) || 0,
          remaining_qty: Number(item?.remaining_qty) || 0,
          quantity: item?.quantity ?? "",
          rate: item?.rate ?? "",
          amount: item?.amount ?? "",
        }))
      : [],
  });

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/purchase-invoices`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setInvoices(list);
    } catch {
      setInvoices([]);
    }
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/purchase-returns`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRecords(list.map(normalizeRecord));
    } catch (err) {
      setRecords([]);
      showMsg(
        "error",
        err?.response?.data?.error || err?.response?.data?.message || t.fetchError
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchReturns();
  }, []);

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);

    if (newLang !== "ur") return;

    setTranslating(true);
    try {
      const nextCache = { ...urduCache };

      const texts = new Set();

      invoices.forEach((inv) => {
        if (inv?.supplier_name) texts.add(`supplier:${inv.supplier_name}`);
        if (Array.isArray(inv?.items)) {
          inv.items.forEach((item) => {
            if (item?.product_name) texts.add(`product:${item.product_name}`);
            if (item?.unit_name) texts.add(`unit:${item.unit_name}`);
            if (item?.category_name) texts.add(`category:${item.category_name}`);
            if (item?.type_name) texts.add(`type:${item.type_name}`);
          });
        }
      });

      records.forEach((r) => {
        if (r?.supplier_name) texts.add(`supplier:${r.supplier_name}`);
        if (r?.reason) texts.add(`reason:${r.reason}`);
        (r.items || []).forEach((item) => {
          if (item?.product_name) texts.add(`product:${item.product_name}`);
          if (item?.unit_name) texts.add(`unit:${item.unit_name}`);
          if (item?.category_name) texts.add(`category:${item.category_name}`);
          if (item?.type_name) texts.add(`type:${item.type_name}`);
        });
      });

      await Promise.all(
        [...texts].map(async (entry) => {
          const [prefix, ...rest] = entry.split(":");
          const value = rest.join(":");
          if (value && !nextCache[`${prefix}:${value}`]) {
            nextCache[`${prefix}:${value}`] = await translateText(value);
          }
        })
      );

      setUrduCache(nextCache);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const ensureReturnTranslations = async (ret) => {
    if (lang !== "ur") return urduCache;

    const nextCache = { ...urduCache };

    if (ret?.supplier_name && !nextCache[`supplier:${ret.supplier_name}`]) {
      nextCache[`supplier:${ret.supplier_name}`] = await translateText(ret.supplier_name);
    }
    if (ret?.reason && !nextCache[`reason:${ret.reason}`]) {
      nextCache[`reason:${ret.reason}`] = await translateText(ret.reason);
    }

    for (const item of ret.items || []) {
      if (item.product_name && !nextCache[`product:${item.product_name}`]) {
        nextCache[`product:${item.product_name}`] = await translateText(item.product_name);
      }
      if (item.unit_name && !nextCache[`unit:${item.unit_name}`]) {
        nextCache[`unit:${item.unit_name}`] = await translateText(item.unit_name);
      }
      if (item.category_name && !nextCache[`category:${item.category_name}`]) {
        nextCache[`category:${item.category_name}`] = await translateText(item.category_name);
      }
      if (item.type_name && !nextCache[`type:${item.type_name}`]) {
        nextCache[`type:${item.type_name}`] = await translateText(item.type_name);
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

  const getReturnedQtyMap = (invoiceId, excludeReturnId = null) => {
    const map = {};

    records.forEach((ret) => {
      if (String(ret.invoice_id) !== String(invoiceId)) return;
      if (excludeReturnId && String(ret.id) === String(excludeReturnId)) return;

      (ret.items || []).forEach((item) => {
        const key = [
          item.product_name || "",
          item.unit_name || "",
          item.category_name || "",
          item.type_name || "",
        ].join("||");

        map[key] = (map[key] || 0) + (Number(item.quantity) || 0);
      });
    });

    return map;
  };

  const buildItemsFromInvoice = (invoice, excludeReturnId = null, currentEditItems = []) => {
    const invoiceItems = Array.isArray(invoice?.items) ? invoice.items : [];
    const returnedMap = getReturnedQtyMap(invoice?.id, excludeReturnId);

    return invoiceItems.map((invItem) => {
      const key = [
        invItem.product_name || "",
        invItem.unit_name || "",
        invItem.category_name || "",
        invItem.type_name || "",
      ].join("||");

      const alreadyReturned = Number(returnedMap[key] || 0);

      const existingEditItem = currentEditItems.find(
        (x) =>
          (x.product_name || "") === (invItem.product_name || "") &&
          (x.unit_name || "") === (invItem.unit_name || "") &&
          (x.category_name || "") === (invItem.category_name || "") &&
          (x.type_name || "") === (invItem.type_name || "")
      );

      const currentEditingQty = Number(existingEditItem?.quantity) || 0;
      const purchasedQty = Number(invItem.quantity) || 0;
      const effectiveReturned = excludeReturnId ? Math.max(alreadyReturned, 0) : alreadyReturned;

      const remainingQty = Math.max(purchasedQty - effectiveReturned, 0);

      return {
        product_name: invItem.product_name || "",
        unit_name: invItem.unit_name || "",
        category_name: invItem.category_name || "",
        type_name: invItem.type_name || "",
        purchased_qty: purchasedQty,
        already_returned_qty: effectiveReturned,
        remaining_qty: excludeReturnId
          ? Math.max(purchasedQty - effectiveReturned + currentEditingQty, 0)
          : remainingQty,
        quantity: existingEditItem ? currentEditingQty : "",
        rate: existingEditItem?.rate ?? invItem.rate ?? "",
        amount:
          existingEditItem?.amount ??
          (currentEditingQty && (invItem.rate || existingEditItem?.rate)
            ? (
                currentEditingQty *
                Number(existingEditItem?.rate ?? invItem.rate ?? 0)
              ).toFixed(2)
            : ""),
      };
    });
  };

  const recalcTotals = (updatedItems) => {
    const total = updatedItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );

    setForm((f) => ({
      ...f,
      total_amount: total ? total.toFixed(2) : "",
      credit: total ? total.toFixed(2) : "",
    }));
  };

  const handleInvoiceSelect = (invoiceId, currentEditItems = [], excludeReturnId = null) => {
    const invoice = invoices.find((inv) => String(inv.id) === String(invoiceId));

    if (!invoice) {
      setForm((prev) => ({
        ...prev,
        invoice_id: "",
        invoice_no: "",
        supplier_name: "",
        total_amount: "",
        credit: "",
      }));
      setItems([emptyItem()]);
      return;
    }

    const autoItems = buildItemsFromInvoice(invoice, excludeReturnId, currentEditItems);

    setForm((prev) => ({
      ...prev,
      invoice_id: String(invoice.id),
      invoice_no: invoice.invoice_no || "",
      supplier_name: invoice.supplier_name || "",
    }));

    setItems(autoItems.length ? autoItems : [emptyItem()]);
    recalcTotals(autoItems);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/purchase-returns/${id}`);
      const data = normalizeRecord(res.data?.data || res.data);

      if (lang === "ur") {
        setTranslating(true);
        try {
          await ensureReturnTranslations(data);
        } finally {
          setTranslating(false);
        }
      }

      setEditingId(data.id);
      setForm({
        invoice_id: data.invoice_id || "",
        invoice_no: data.invoice_no || "",
        supplier_name: data.supplier_name || "",
        return_date: data.return_date || "",
        total_amount: data.total_amount || "",
        debit: data.debit || "",
        credit: data.credit || "",
        reason: data.reason || "",
      });

      const currentEditItems =
        data.items?.length
          ? data.items.map((item) => ({
              product_name: item.product_name || "",
              unit_name: item.unit_name || "",
              category_name: item.category_name || "",
              type_name: item.type_name || "",
              quantity: item.quantity ?? "",
              rate: item.rate ?? "",
              amount: item.amount ?? "",
            }))
          : [];

      const invoice = invoices.find((inv) => String(inv.id) === String(data.invoice_id));

      if (invoice) {
        const rebuilt = buildItemsFromInvoice(invoice, data.id, currentEditItems);
        setItems(rebuilt.length ? rebuilt : [emptyItem()]);
      } else {
        setItems(
          data.items?.length
            ? data.items.map((item) => ({
                ...emptyItem(),
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
      }

      setMessage({ type: "", text: "" });
      setShowForm(true);
    } catch (err) {
      showMsg(
        "error",
        err?.response?.data?.error || err?.response?.data?.message || t.fetchError
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "invoice_id") {
      setForm((prev) => ({ ...prev, invoice_id: value }));
      handleInvoiceSelect(value, [], editingId);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;

    setItems((prev) => {
      const updated = prev.map((item, i) => {
        if (i !== index) return item;

        const next = { ...item, [name]: value };

        const maxQty = Number(next.remaining_qty) || 0;
        let qty = parseFloat(name === "quantity" ? value : next.quantity) || 0;
        const rate = parseFloat(name === "rate" ? value : next.rate) || 0;

        if (qty > maxQty) qty = maxQty;
        if (qty < 0) qty = 0;

        next.quantity = qty === 0 && String(value) === "" ? "" : qty;
        next.amount = qty && rate ? (qty * rate).toFixed(2) : "";

        return next;
      });

      recalcTotals(updated);
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    const safeItems = updated.length ? updated : [emptyItem()];
    setItems(safeItems);
    recalcTotals(safeItems);
  };

  const handleSave = async () => {
    if (!form.invoice_id) {
      showMsg("error", t.errorInvoice);
      return;
    }

    const cleanedItems = items
      .map((item) => ({
        product_name: item.product_name?.trim() || "",
        unit_name: item.unit_name?.trim() || "",
        category_name: item.category_name?.trim() || "",
        type_name: item.type_name?.trim() || "",
        purchased_qty: Number(item.purchased_qty) || 0,
        already_returned_qty: Number(item.already_returned_qty) || 0,
        remaining_qty: Number(item.remaining_qty) || 0,
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.quantity || 0) * Number(item.rate || 0),
      }))
      .filter((item) => item.product_name || item.quantity > 0 || item.rate > 0);

    const hasInvalid = cleanedItems.some(
      (item) =>
        !item.product_name ||
        item.quantity <= 0 ||
        item.quantity > item.remaining_qty
    );

    if (!cleanedItems.length || hasInvalid) {
      showMsg("error", t.itemErrorMsg);
      return;
    }

    const totalAmount = cleanedItems.reduce((sum, item) => sum + item.amount, 0);

    const payload = {
      invoice_id: Number(form.invoice_id),
      return_date: form.return_date || "",
      total_amount: Number(totalAmount.toFixed(2)),
      debit: Number(form.debit) || 0,
      credit: Number(form.credit) || totalAmount,
      reason: form.reason?.trim() || "",
      items: cleanedItems.map((item) => ({
        product_name: item.product_name,
        unit_name: item.unit_name,
        category_name: item.category_name,
        type_name: item.type_name,
        quantity: Number(item.quantity),
        rate: Number(item.rate) || 0,
        amount: Number(item.amount.toFixed(2)),
      })),
    };

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await axios.put(`${API_BASE}/purchase-returns/${editingId}`, payload);
      } else {
        res = await axios.post(`${API_BASE}/purchase-returns`, payload);
      }

      const saved = normalizeRecord(res?.data?.data || res?.data);
      setRecords((prev) =>
        editingId ? prev.map((r) => (r.id === editingId ? saved : r)) : [saved, ...prev]
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
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          (editingId ? t.updateError : t.saveError)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const res = await axios.delete(`${API_BASE}/purchase-returns/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showMsg("success", res?.data?.message || t.deleteSuccess);
    } catch (err) {
      showMsg(
        "error",
        err?.response?.data?.error || err?.response?.data?.message || t.deleteError
      );
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return records;
    return records.filter(
      (r) =>
        [r.invoice_no, r.supplier_name, r.reason, urduCache[`supplier:${r.supplier_name}`], urduCache[`reason:${r.reason}`]]
          .some((v) => (v || "").toLowerCase().includes(q)) ||
        (r.items || []).some((item) =>
          [
            item.product_name,
            item.unit_name,
            item.category_name,
            item.type_name,
            urduCache[`product:${item.product_name}`],
            urduCache[`unit:${item.unit_name}`],
            urduCache[`category:${item.category_name}`],
            urduCache[`type:${item.type_name}`],
          ].some((v) => (v || "").toLowerCase().includes(q))
        )
    );
  }, [records, search, urduCache]);

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu
      ? "'Noto Nastaliq Urdu', serif"
      : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

    const totalAmountSum = filtered.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
    const debitSum = filtered.reduce((sum, r) => sum + (Number(r.debit) || 0), 0);
    const creditSum = filtered.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);
    const balanceSum = filtered.reduce(
      (sum, r) => sum + ((Number(r.debit) || 0) - (Number(r.credit) || 0)),
      0
    );

    const rowsHtml = filtered
      .map((r, i) => {
        const balance = (Number(r.debit) || 0) - (Number(r.credit) || 0);
        const rowItems = Array.isArray(r.items) && r.items.length ? r.items : [emptyItem()];

        return rowItems
          .map(
            (item, itemIndex) => `
          <tr>
            ${
              itemIndex === 0
                ? `
                <td rowspan="${rowItems.length}" class="center">${i + 1}</td>
                <td rowspan="${rowItems.length}"><strong>${r.invoice_no || "-"}</strong></td>
                <td rowspan="${rowItems.length}">${tr("supplier", r.supplier_name)}</td>
                <td rowspan="${rowItems.length}" class="center">${r.return_date || "-"}</td>
              `
                : ""
            }
            <td>${tr("product", item.product_name)}</td>
            <td>${tr("unit", item.unit_name)}</td>
            <td>${tr("category", item.category_name)}</td>
            <td>${tr("type", item.type_name)}</td>
            <td class="center">${item.quantity || 0}</td>
            <td class="num">${fmt(item.rate)}</td>
            <td class="num strong violet">${fmt(item.amount)}</td>
            ${
              itemIndex === 0
                ? `
                <td rowspan="${rowItems.length}" class="num">${fmt(r.total_amount)}</td>
                <td rowspan="${rowItems.length}" class="num">${fmt(r.debit)}</td>
                <td rowspan="${rowItems.length}" class="num">${fmt(r.credit)}</td>
                <td rowspan="${rowItems.length}" class="num">${fmt(Math.abs(balance))}</td>
                <td rowspan="${rowItems.length}">${tr("reason", r.reason)}</td>
              `
                : ""
            }
          </tr>`
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
              max-width: 1500px;
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
              grid-template-columns: repeat(4, 1fr);
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
            .card.violet { background: #f5f3ff; color: #7c3aed; border-color: #a78bfa; }
            .card.violet .pill { background: #7c3aed; }
            table {
              width: 100%;
              border-collapse: collapse;
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
          </style>
        </head>
        <body>
          <div class="page">
            <div class="sheet">
              <div class="header">
                <div class="header-row">
                  <div class="brand-wrap">
                    <div class="logo">PRTN</div>
                    <div class="brand">
                      <h1>${t.companyName}</h1>
                      <p>${t.reportHeader}</p>
                    </div>
                  </div>
                  <div class="meta">
                    <div>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
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
                    <small>${t.credit}</small>
                    <div class="pill">CR</div>
                    <div class="value">₨ ${fmt(creditSum)}</div>
                  </div>
                  <div class="card violet">
                    <small>${t.balance}</small>
                    <div class="pill">BAL</div>
                    <div class="value">₨ ${fmt(Math.abs(balanceSum))}</div>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th class="center">#</th>
                      <th>${t.invoiceNo}</th>
                      <th>${t.supplier}</th>
                      <th class="center">${t.returnDate}</th>
                      <th>${t.product}</th>
                      <th>${t.unit}</th>
                      <th>${t.category}</th>
                      <th>${t.type}</th>
                      <th class="center">${t.returnQty}</th>
                      <th class="num">${t.rate}</th>
                      <th class="num">${t.amount}</th>
                      <th class="num">${t.totalAmount}</th>
                      <th class="num">${t.debit}</th>
                      <th class="num">${t.credit}</th>
                      <th class="num">${t.balance}</th>
                      <th>${t.reason}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filtered.length ? rowsHtml : `<tr><td colspan="16" style="text-align:center">${t.noRecords}</td></tr>`}
                  </tbody>
                  <tfoot>
                    <tr class="foot-row">
                      <td colspan="11">${t.totalAmount}</td>
                      <td class="num">${fmt(totalAmountSum)}</td>
                      <td class="num">${fmt(debitSum)}</td>
                      <td class="num">${fmt(creditSum)}</td>
                      <td class="num">${fmt(Math.abs(balanceSum))}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
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

    const w = window.open("", "_blank", "width=1500,height=900");
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
          className={`fixed bottom-6 ${isUrdu ? "left-6" : "right-6"} z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-base font-semibold flex items-center gap-2 ${
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
          <div className={`flex items-center justify-between gap-4 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black">{t.title}</h1>
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
                <i className="bi bi-arrow-return-left"></i>
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
              {t.printBtn}
            </button>
            <button
              onClick={() => generatePrintDocument(true)}
              className="flex items-center gap-2 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 px-4 py-3 rounded-xl font-semibold text-base transition shadow-sm"
            >
              <i className="bi bi-file-earmark-pdf text-red-600"></i>
              {t.pdfBtn}
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
            <table className="w-full text-sm text-slate-600 min-w-[1500px]">
              <thead className="bg-sky-50 border-b border-sky-100">
                <tr className="text-slate-600 text-sm font-bold">
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>#</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.invoiceNo}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.supplier}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.returnDate}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.unit}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                  <th className="px-5 py-3 text-center">{t.returnQty}</th>
                  <th className="px-5 py-3 text-right">{t.rate}</th>
                  <th className="px-5 py-3 text-right">{t.amount}</th>
                  <th className="px-5 py-3 text-right">{t.totalAmount}</th>
                  <th className="px-5 py-3 text-right">{t.debit}</th>
                  <th className="px-5 py-3 text-right">{t.credit}</th>
                  <th className="px-5 py-3 text-right">{t.balance}</th>
                  <th className={`px-5 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.reason}</th>
                  <th className="px-5 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={17} className="px-6 py-10 text-center text-slate-400">
                      {t.loading}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="px-6 py-10 text-center text-slate-400">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const balance = (Number(r.debit) || 0) - (Number(r.credit) || 0);
                    const rowItems = Array.isArray(r.items) && r.items.length ? r.items : [emptyItem()];

                    return rowItems.map((item, itemIndex) => (
                      <tr key={`${r.id}-${itemIndex}`} className="hover:bg-sky-50/60 transition align-top">
                        {itemIndex === 0 && (
                          <>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                              {i + 1}
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-100 text-slate-700 text-xs font-mono font-semibold border border-sky-200">
                                <i className="bi bi-receipt text-xs"></i> {r.invoice_no || "—"}
                              </span>
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 font-medium text-black">
                              {tr("supplier", r.supplier_name)}
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 text-slate-500 text-xs">
                              {r.return_date || "—"}
                            </td>
                          </>
                        )}

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {tr("product", item.product_name)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">{tr("unit", item.unit_name)}</td>
                        <td className="px-5 py-3.5">{tr("category", item.category_name)}</td>
                        <td className="px-5 py-3.5">{tr("type", item.type_name)}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-sky-700">
                          {item.quantity || 0}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono">₨ {fmt(item.rate)}</td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-950">
                          ₨ {fmt(item.amount)}
                        </td>

                        {itemIndex === 0 && (
                          <>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 text-right font-mono font-bold text-slate-700">
                              ₨ {fmt(r.total_amount)}
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 text-right font-mono font-bold text-slate-700">
                              ₨ {fmt(r.debit)}
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 text-right font-mono font-bold text-slate-700">
                              ₨ {fmt(r.credit)}
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5 text-right font-mono font-bold text-slate-700">
                              ₨ {fmt(Math.abs(balance))}
                            </td>
                            <td rowSpan={rowItems.length} className="px-5 py-3.5">
                              {r.reason ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                  <i className="bi bi-chat-left-text text-xs opacity-60"></i>
                                  {tr("reason", r.reason)}
                                </span>
                              ) : (
                                "—"
                              )}
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
                    <i className="bi bi-arrow-return-left text-sky-700 text-xl"></i>
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
                        message.type === "error" ? "bi-exclamation-triangle" : "bi-check-circle"
                      }`}
                    ></i>
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.invoice}
                    </label>
                    <select
                      name="invoice_id"
                      value={form.invoice_id}
                      onChange={handleChange}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 appearance-none ${
                        isUrdu ? "pr-4 pl-4 text-right" : "px-4"
                      }`}
                    >
                      <option value="">{t.selectInvoice}</option>
                      {invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_no} ({tr("supplier", inv.supplier_name || "No Supplier")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.invoiceNo}
                    </label>
                    <input
                      value={form.invoice_no}
                      readOnly
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base bg-sky-50 text-slate-600 ${
                        isUrdu ? "px-4 text-right" : "px-4"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.supplier}
                    </label>
                    <input
                      value={tr("supplier", form.supplier_name)}
                      readOnly
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base bg-sky-50 text-slate-600 ${
                        isUrdu ? "px-4 text-right" : "px-4"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1.5">
                      {t.returnDate}
                    </label>
                    <input
                      type="date"
                      name="return_date"
                      value={form.return_date}
                      onChange={handleChange}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base text-black bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                        isUrdu ? "px-4" : "px-4"
                      }`}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700 font-semibold">
                  <i className="bi bi-info-circle me-2"></i>
                  {t.autoFilled}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="rounded-2xl bg-white border border-sky-100 p-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                      {t.reason}
                    </label>
                    <input
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      placeholder={t.reason}
                      className={`w-full border border-sky-100 rounded-2xl py-3.5 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                        isUrdu ? "px-4 text-right" : "px-4"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className={`flex items-center justify-between gap-3 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
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
                      <table className="w-full min-w-[1500px] text-sm text-slate-600">
                        <thead className="bg-sky-50">
                          <tr className="text-slate-600 text-sm font-bold border-b border-sky-100">
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.unit}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                            <th className={`px-4 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.type}</th>
                            <th className="px-4 py-3 text-center">{t.purchasedQty}</th>
                            <th className="px-4 py-3 text-center">{t.returnedQty}</th>
                            <th className="px-4 py-3 text-center">{t.remainingQty}</th>
                            <th className="px-4 py-3 text-center">{t.returnQty}</th>
                            <th className="px-4 py-3 text-right">{t.rate}</th>
                            <th className="px-4 py-3 text-right">{t.amount}</th>
                            <th className="px-4 py-3 w-24 text-center"></th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-sky-50">
                          {items.map((item, index) => (
                            <tr key={index} className="hover:bg-sky-50/60">
                              <td className="px-4 py-3">
                                <input
                                  value={tr("product", item.product_name)}
                                  readOnly
                                  className={`w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-sky-50 ${
                                    isUrdu ? "text-right" : "text-left"
                                  }`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  value={tr("unit", item.unit_name)}
                                  readOnly
                                  className={`w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-sky-50 ${
                                    isUrdu ? "text-right" : "text-left"
                                  }`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  value={tr("category", item.category_name)}
                                  readOnly
                                  className={`w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-sky-50 ${
                                    isUrdu ? "text-right" : "text-left"
                                  }`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  value={tr("type", item.type_name)}
                                  readOnly
                                  className={`w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-sky-50 ${
                                    isUrdu ? "text-right" : "text-left"
                                  }`}
                                />
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">
                                {item.purchased_qty || 0}
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-amber-600">
                                {item.already_returned_qty || 0}
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">
                                {item.remaining_qty || 0}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  name="quantity"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 text-center font-mono"
                                  placeholder="0"
                                  min="0"
                                  max={item.remaining_qty || 0}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  name="rate"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="w-full border border-sky-100 rounded-2xl py-3 px-4 text-base bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 text-right font-mono"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td className={`px-4 py-3 font-mono font-bold text-slate-950 ${isUrdu ? "text-left" : "text-right"}`}>
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
                      ₨ {fmt(Math.abs((Number(form.debit) || 0) - (Number(form.credit) || 0)))}
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

export default PurchaseReturnPage;