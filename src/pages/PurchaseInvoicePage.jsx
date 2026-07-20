import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const RAW_API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;

const today = () => new Date().toISOString().slice(0, 10);
const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const money = (value) =>
  toNumber(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.products)) return value.products;
  return [];
};
const getId = (row) =>
  row?.id ??
  row?.value ??
  row?.supplier_id ??
  row?.category_id ??
  row?.product_id ??
  row?.unit_id ??
  "";
const pickText = (row, keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && String(row[key]).trim()) {
      return String(row[key]).trim();
    }
  }
  return "";
};
const supplierName = (row) =>
  pickText(row, [
    "supplier_name",
    "supplier_name_en",
    "vendor_name",
    "company_name",
    "name",
    "name_en",
    "title",
  ]);
const categoryName = (row) =>
  pickText(row, ["category_name", "category_name_en", "name", "name_en", "title"]);
const productName = (row) =>
  pickText(row, [
    "product_name",
    "product_name_en",
    "item_name",
    "name",
    "name_en",
    "title",
  ]);
const unitName = (row) =>
  pickText(row, ["unit_name", "unit_name_en", "name", "name_en", "symbol", "title"]);
const productTypeName = (row) =>
  pickText(row, [
    "type_name",
    "product_type",
    "product_type_en",
    "type",
    "productType",
  ]);
const productCategoryId = (row) =>
  row?.category_id ??
  row?.categoryId ??
  row?.product_category_id ??
  row?.category?.id ??
  "";
const productUnitId = (row) =>
  row?.unit_id ?? row?.unitId ?? row?.unit?.id ?? "";
const productRate = (row) =>
  toNumber(
    row?.purchase_rate ??
      row?.purchaseRate ??
      row?.cost_price ??
      row?.costPrice ??
      row?.purchase_price ??
      row?.rate ??
      row?.price ??
      row?.sale_rate
  );

const emptyItem = () => ({
  category_id: "",
  category_name: "",
  product_id: "",
  product_name: "",
  product_description: "",
  unit_id: "",
  unit_name: "",
  type_name: "",
  quantity: "",
  rate: "",
  amount: 0,
});

const emptyForm = () => ({
  invoice_no: "",
  supplier_id: "",
  supplier_name: "",
  invoice_date: today(),
  debit: "",
  credit: "0",
  status: "pending",
});

const inputClass =
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500";
const buttonPrimary =
  "inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60";
const buttonSoft =
  "inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50";

function StatusMessage({ message }) {
  if (!message.text) return null;
  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm font-bold ${
        message.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {message.text}
    </div>
  );
}

function PurchaseInvoicePage() {
  const [records, setRecords] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoiceRes, supplierRes, categoryRes, productRes, unitRes] =
        await Promise.all([
          axios.get(`${API_BASE}/purchase-invoices`),
          axios.get(`${API_BASE}/suppliers`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/categories`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/products`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/units`).catch(() => ({ data: [] })),
        ]);

      setRecords(getList(invoiceRes.data));
      setSuppliers(getList(supplierRes.data));
      setCategories(getList(categoryRes.data));
      setProducts(getList(productRes.data));
      setUnits(getList(unitRes.data));
    } catch (error) {
      showMessage(
        "error",
        error?.response?.data?.message || "Purchase invoices load nahi ho sakin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculatedTotal = useMemo(
    () => items.reduce((sum, item) => sum + toNumber(item.amount), 0),
    [items]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const headerMatch = [
        record.invoice_no,
        record.supplier_name,
        record.invoice_date,
        record.status,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const itemMatch = (record.items || []).some((item) =>
        [
          item.product_name,
          item.category_name,
          item.unit_name,
          item.type_name,
        ].some((value) => String(value || "").toLowerCase().includes(query))
      );

      return headerMatch || itemMatch;
    });
  }, [records, search]);

  const summary = useMemo(
    () => ({
      invoices: filteredRecords.length,
      items: filteredRecords.reduce(
        (sum, record) => sum + (record.items?.length || 0),
        0
      ),
      total: filteredRecords.reduce(
        (sum, record) => sum + toNumber(record.total_amount),
        0
      ),
      debit: filteredRecords.reduce(
        (sum, record) => sum + toNumber(record.debit),
        0
      ),
      credit: filteredRecords.reduce(
        (sum, record) => sum + toNumber(record.credit),
        0
      ),
    }),
    [filteredRecords]
  );

  const generateInvoiceNo = () => {
    const max = records.reduce((currentMax, record) => {
      const match = String(record.invoice_no || "").match(/(\d+)\s*$/);
      return match ? Math.max(currentMax, Number(match[1])) : currentMax;
    }, 0);
    return `PI-${String(max + 1).padStart(4, "0")}`;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setItems([emptyItem()]);
  };

  const openNew = () => {
    resetForm();
    setForm((previous) => ({ ...previous, invoice_no: generateInvoiceNo() }));
    setShowForm(true);
  };

  const openEdit = async (record) => {
    try {
      const response = await axios.get(`${API_BASE}/purchase-invoices/${record.id}`);
      const data = response.data?.data || response.data || record;

      setEditingId(data.id);
      setForm({
        invoice_no: data.invoice_no || "",
        supplier_id: "",
        supplier_name: data.supplier_name || "",
        invoice_date: String(data.invoice_date || today()).slice(0, 10),
        debit: data.debit ?? data.total_amount ?? "",
        credit: data.credit ?? "0",
        status: data.status || "pending",
      });
      setItems(
        Array.isArray(data.items) && data.items.length
          ? data.items.map((item) => ({
              ...emptyItem(),
              product_id: item.product_id ? String(item.product_id) : "",
              product_name: item.product_name || "",
              category_name: item.category_name || "",
              unit_name: item.unit_name || "",
              type_name: item.type_name || "",
              quantity: item.quantity ?? "",
              rate: item.rate ?? "",
              amount: toNumber(item.amount),
            }))
          : [emptyItem()]
      );
      setShowForm(true);
    } catch (error) {
      showMessage(
        "error",
        error?.response?.data?.message || "Invoice details load nahi ho sakin."
      );
    }
  };

  const handleSupplierChange = (value) => {
    const selected = suppliers.find((row) => String(getId(row)) === String(value));
    setForm((previous) => ({
      ...previous,
      supplier_id: value,
      supplier_name: selected ? supplierName(selected) : "",
    }));
  };

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        let next = { ...item, [field]: value };

        if (field === "category_id") {
          const selectedCategory = categories.find(
            (row) => String(getId(row)) === String(value)
          );
          next = {
            ...next,
            category_name: selectedCategory ? categoryName(selectedCategory) : "",
            product_id: "",
            product_name: "",
            product_description: "",
          };
        }

        if (field === "product_id") {
          const selectedProduct = products.find(
            (row) => String(getId(row)) === String(value)
          );

          if (selectedProduct) {
            const selectedCategoryId = productCategoryId(selectedProduct);
            const selectedUnitId = productUnitId(selectedProduct);
            const selectedCategory = categories.find(
              (row) => String(getId(row)) === String(selectedCategoryId)
            );
            const selectedUnit = units.find(
              (row) => String(getId(row)) === String(selectedUnitId)
            );

            next = {
              ...next,
              product_name: productName(selectedProduct),
              product_description: pickText(selectedProduct, [
                "product_description",
                "description",
                "details",
              ]),
              category_id: selectedCategoryId
                ? String(selectedCategoryId)
                : next.category_id,
              category_name: selectedCategory
                ? categoryName(selectedCategory)
                : next.category_name,
              unit_id: selectedUnitId ? String(selectedUnitId) : next.unit_id,
              unit_name: selectedUnit ? unitName(selectedUnit) : next.unit_name,
              type_name: productTypeName(selectedProduct) || next.type_name,
              rate: productRate(selectedProduct) || next.rate,
            };
          }
        }

        if (field === "unit_id") {
          const selectedUnit = units.find(
            (row) => String(getId(row)) === String(value)
          );
          next.unit_name = selectedUnit ? unitName(selectedUnit) : "";
        }

        next.amount = toNumber(next.quantity) * toNumber(next.rate);
        return next;
      })
    );
  };

  const addItem = () => setItems((previous) => [...previous, emptyItem()]);
  const removeItem = (index) =>
    setItems((previous) => {
      const next = previous.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [emptyItem()];
    });

  const saveInvoice = async () => {
    if (!form.invoice_no.trim()) {
      showMessage("error", "Invoice number zaroori hai.");
      return;
    }
    if (!form.supplier_name.trim()) {
      showMessage("error", "Supplier select ya enter karein.");
      return;
    }

    const validItems = items
      .map((item) => ({
        product_name: item.product_name.trim(),
        unit_name: item.unit_name.trim(),
        category_name: item.category_name.trim(),
        type_name: item.type_name.trim(),
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        amount: toNumber(item.quantity) * toNumber(item.rate),
      }))
      .filter(
        (item) =>
          item.product_name ||
          item.quantity > 0 ||
          item.rate > 0 ||
          item.amount > 0
      );

    if (!validItems.length || validItems.some((item) => !item.product_name || item.quantity <= 0)) {
      showMessage("error", "Kam az kam aik valid product aur quantity add karein.");
      return;
    }

    const total = validItems.reduce((sum, item) => sum + item.amount, 0);
    const payload = {
      invoice_no: form.invoice_no.trim(),
      supplier_name: form.supplier_name.trim(),
      invoice_date: form.invoice_date || today(),
      total_amount: Number(total.toFixed(2)),
      debit:
        form.debit === "" ? Number(total.toFixed(2)) : toNumber(form.debit),
      credit: toNumber(form.credit),
      status: form.status || "pending",
      items: validItems.map((item) => ({
        ...item,
        amount: Number(item.amount.toFixed(2)),
      })),
    };

    try {
      setSaving(true);
      const response = editingId
        ? await axios.put(`${API_BASE}/purchase-invoices/${editingId}`, payload)
        : await axios.post(`${API_BASE}/purchase-invoices`, payload);

      showMessage(
        "success",
        response?.data?.message ||
          (editingId
            ? "Purchase invoice update ho gaya."
            : "Purchase invoice save ho gaya.")
      );
      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (error) {
      showMessage(
        "error",
        error?.response?.data?.message || "Purchase invoice save nahi hua."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteInvoice = async (record) => {
    if (!window.confirm(`Invoice ${record.invoice_no || ""} delete karna hai?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/purchase-invoices/${record.id}`);
      setRecords((previous) =>
        previous.filter((item) => String(item.id) !== String(record.id))
      );
      showMessage("success", "Purchase invoice delete ho gaya.");
    } catch (error) {
      showMessage(
        "error",
        error?.response?.data?.message || "Invoice delete nahi hua."
      );
    }
  };

  const printInvoice = (record) => {
    const rows = (record.items || [])
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product_name || "-"}</td>
            <td>${item.category_name || "-"}</td>
            <td>${item.unit_name || "-"}</td>
            <td>${item.type_name || "-"}</td>
            <td class="num">${money(item.quantity)}</td>
            <td class="num">${money(item.rate)}</td>
            <td class="num">${money(item.amount)}</td>
          </tr>`
      )
      .join("");

    const total =
      toNumber(record.total_amount) ||
      (record.items || []).reduce((sum, item) => sum + toNumber(item.amount), 0);
    const balance = toNumber(record.debit) - toNumber(record.credit);

    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
      <head>
        <title>${record.invoice_no || "Purchase Invoice"}</title>
        <style>
          body{font-family:Arial,sans-serif;color:#0f172a;margin:28px}
          h1{margin:0;font-size:28px} h2{margin:6px 0 20px;font-size:18px;color:#475569}
          .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:20px}
          .box{border:1px solid #cbd5e1;border-radius:8px;padding:10px}
          table{width:100%;border-collapse:collapse;margin-top:14px}
          th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px}
          th{background:#f1f5f9}.num{text-align:right}
          .totals{margin-left:auto;margin-top:16px;width:320px}
          .totals div{display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding:7px}
          .grand{font-weight:800;font-size:16px}
          @media print{button{display:none}}
        </style>
      </head>
      <body>
        <h1>Ali Cages</h1>
        <h2>Purchase Invoice</h2>
        <div class="meta">
          <div class="box"><b>Invoice No:</b> ${record.invoice_no || "-"}</div>
          <div class="box"><b>Date:</b> ${String(record.invoice_date || "-").slice(0, 10)}</div>
          <div class="box"><b>Supplier:</b> ${record.supplier_name || "-"}</div>
          <div class="box"><b>Status:</b> ${record.status || "pending"}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Product</th><th>Category</th><th>Unit</th>
              <th>Type</th><th>Qty</th><th>Rate</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="8">No items</td></tr>'}</tbody>
        </table>
        <div class="totals">
          <div><span>Invoice Total</span><b>Rs. ${money(total)}</b></div>
          <div><span>Debit</span><b>Rs. ${money(record.debit)}</b></div>
          <div><span>Credit</span><b>Rs. ${money(record.credit)}</b></div>
          <div class="grand"><span>Balance</span><b>Rs. ${money(balance)}</b></div>
        </div>
        <script>window.onload=()=>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const visibleProducts = (item) =>
    item.category_id
      ? products.filter(
          (product) =>
            !productCategoryId(product) ||
            String(productCategoryId(product)) === String(item.category_id)
        )
      : products;

  return (
    <div className="min-h-full bg-slate-50 p-3 sm:p-5">
      <StatusMessage message={message} />

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Purchase Invoice
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sales Invoice jaisa multi-product purchase invoice module — shipment field ke baghair.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={buttonSoft} onClick={() => setShowSummary((value) => !value)}>
              {showSummary ? "Hide Summary" : "View Summary"}
            </button>
            <button className={buttonSoft} onClick={fetchData}>
              Refresh
            </button>
            <button className={buttonPrimary} onClick={openNew}>
              + New Invoice
            </button>
          </div>
        </div>

        <div className="mt-4">
          <input
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice no, supplier, product or date..."
          />
        </div>
      </div>

      {showSummary && (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ["Total Invoices", summary.invoices],
            ["Total Items", summary.items],
            ["Total Value", `Rs. ${money(summary.total)}`],
            ["Total Debit", `Rs. ${money(summary.debit)}`],
            ["Total Credit", `Rs. ${money(summary.credit)}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-slate-100">
              <tr className="text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-sm font-bold text-slate-500">
                    Loading purchase invoices...
                  </td>
                </tr>
              ) : filteredRecords.length ? (
                filteredRecords.map((record, index) => {
                  const balance = toNumber(record.debit) - toNumber(record.credit);
                  return (
                    <tr key={record.id || `${record.invoice_no}-${index}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-black text-indigo-700">
                        {record.invoice_no || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">
                        {record.supplier_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {String(record.invoice_date || "-").slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                        {record.items?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                        {money(record.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">
                        {money(record.debit)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">
                        {money(record.credit)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                        {money(balance)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1.5">
                          <button
                            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200"
                            onClick={() => printInvoice(record)}
                          >
                            Print
                          </button>
                          <button
                            className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-black text-indigo-700 hover:bg-indigo-100"
                            onClick={() => openEdit(record)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-100"
                            onClick={() => deleteInvoice(record)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-sm font-bold text-slate-500">
                    No purchase invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4">
          <div className="flex max-h-[96vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {editingId ? "Edit Purchase Invoice" : "New Purchase Invoice"}
                </h2>
                <p className="text-sm text-slate-500">
                  Supplier, products, quantity, rate, debit aur credit enter karein.
                </p>
              </div>
              <button
                className="h-10 w-10 rounded-xl bg-slate-100 text-xl font-black text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label className={labelClass}>Invoice No</label>
                  <input
                    className={inputClass}
                    value={form.invoice_no}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        invoice_no: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Supplier</label>
                  {suppliers.length ? (
                    <select
                      className={inputClass}
                      value={form.supplier_id}
                      onChange={(event) => handleSupplierChange(event.target.value)}
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map((supplier) => (
                        <option key={getId(supplier)} value={getId(supplier)}>
                          {supplierName(supplier) || `Supplier #${getId(supplier)}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={inputClass}
                      value={form.supplier_name}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          supplier_name: event.target.value,
                        }))
                      }
                      placeholder="Supplier name"
                    />
                  )}
                </div>

                <div>
                  <label className={labelClass}>Invoice Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.invoice_date}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        invoice_date: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <h3 className="font-black text-slate-900">Products</h3>
                    <p className="text-xs text-slate-500">
                      Purchase rate product se auto-fill hoga; zaroorat par manually change kar sakte hain.
                    </p>
                  </div>
                  <button className={buttonSoft} onClick={addItem}>
                    + Add Row
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1250px]">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-3">#</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Product</th>
                        <th className="px-3 py-3">Description</th>
                        <th className="px-3 py-3">Unit</th>
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">Qty</th>
                        <th className="px-3 py-3">Rate</th>
                        <th className="px-3 py-3 text-right">Amount</th>
                        <th className="px-3 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => (
                        <tr key={index} className="align-top">
                          <td className="px-3 py-3 text-sm font-bold text-slate-500">
                            {index + 1}
                          </td>
                          <td className="w-44 px-3 py-3">
                            <select
                              className={inputClass}
                              value={item.category_id}
                              onChange={(event) =>
                                updateItem(index, "category_id", event.target.value)
                              }
                            >
                              <option value="">-- Category --</option>
                              {categories.map((category) => (
                                <option key={getId(category)} value={getId(category)}>
                                  {categoryName(category) || `#${getId(category)}`}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="w-52 px-3 py-3">
                            {products.length ? (
                              <select
                                className={inputClass}
                                value={item.product_id}
                                onChange={(event) =>
                                  updateItem(index, "product_id", event.target.value)
                                }
                              >
                                <option value="">-- Product --</option>
                                {visibleProducts(item).map((product) => (
                                  <option key={getId(product)} value={getId(product)}>
                                    {productName(product) || `#${getId(product)}`}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className={inputClass}
                                value={item.product_name}
                                onChange={(event) =>
                                  updateItem(index, "product_name", event.target.value)
                                }
                                placeholder="Product name"
                              />
                            )}
                          </td>
                          <td className="min-w-56 px-3 py-3">
                            <input
                              className={inputClass}
                              value={item.product_description}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "product_description",
                                  event.target.value
                                )
                              }
                              placeholder="Optional description"
                            />
                          </td>
                          <td className="w-36 px-3 py-3">
                            {units.length ? (
                              <select
                                className={inputClass}
                                value={item.unit_id}
                                onChange={(event) =>
                                  updateItem(index, "unit_id", event.target.value)
                                }
                              >
                                <option value="">-- Unit --</option>
                                {units.map((unit) => (
                                  <option key={getId(unit)} value={getId(unit)}>
                                    {unitName(unit) || `#${getId(unit)}`}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className={inputClass}
                                value={item.unit_name}
                                onChange={(event) =>
                                  updateItem(index, "unit_name", event.target.value)
                                }
                                placeholder="Unit"
                              />
                            )}
                          </td>
                          <td className="w-36 px-3 py-3">
                            <input
                              className={inputClass}
                              value={item.type_name}
                              onChange={(event) =>
                                updateItem(index, "type_name", event.target.value)
                              }
                              placeholder="Type"
                            />
                          </td>
                          <td className="w-28 px-3 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`${inputClass} text-right`}
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(index, "quantity", event.target.value)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="w-32 px-3 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`${inputClass} text-right`}
                              value={item.rate}
                              onChange={(event) =>
                                updateItem(index, "rate", event.target.value)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="w-32 px-3 py-3 text-right text-sm font-black text-slate-900">
                            Rs. {money(item.amount)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              className="h-10 rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-700 hover:bg-rose-100"
                              onClick={() => removeItem(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
                <div />
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-slate-500">Invoice Total</span>
                    <span className="text-xl font-black text-slate-900">
                      Rs. {money(calculatedTotal)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Debit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputClass} text-right`}
                        value={form.debit}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            debit: event.target.value,
                          }))
                        }
                        placeholder={String(calculatedTotal)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Credit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputClass} text-right`}
                        value={form.credit}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            credit: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                    <span className="font-bold">Balance</span>
                    <span className="text-lg font-black">
                      Rs.{" "}
                      {money(
                        (form.debit === ""
                          ? calculatedTotal
                          : toNumber(form.debit)) - toNumber(form.credit)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
              <button
                className={buttonSoft}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving} onClick={saveInvoice}>
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Invoice"
                  : "Save Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseInvoicePage;
