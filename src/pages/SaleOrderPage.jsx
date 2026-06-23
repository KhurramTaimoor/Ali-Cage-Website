import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const SALE_ORDER_API = "/api/sale-orders";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }

  return res.status === 204 ? null : res.json();
}

const getPageData = () => apiFetch(SALE_ORDER_API);
const createOrder = (data) => apiFetch(SALE_ORDER_API, { method: "POST", body: JSON.stringify(data) });
const updateOrder = (id, data) => apiFetch(`${SALE_ORDER_API}/${id}`, { method: "PUT", body: JSON.stringify(data) });
const deleteOrder = (id) => apiFetch(`${SALE_ORDER_API}/${id}`, { method: "DELETE" });

const PARTY_TYPES = [
  { value: "customer", label: "Customer" },
  { value: "employee", label: "Employee" },
  { value: "supplier", label: "Supplier" },
  { value: "general_ledger", label: "General Ledger" },
];

const PAYMENT_METHODS = ["Cash", "Bank", "JazzCash", "EasyPaisa", "Cheque", "Other"];
const ORDER_STATUSES = ["Pending", "Completed", "Cancelled"];

const today = () => new Date().toISOString().slice(0, 10);

const emptyItem = () => ({
  product_type_id: "",
  category_id: "",
  product_id: "",
  unit_id: "",
  order_qty: "",
  rate: "",
  debit: "0",
  credit: "0",
});

const emptyForm = () => ({
  order_no: "",
  reference_no: "",
  party_type: "customer",
  party_id: "",
  party_name: "",
  customer_type: "customer",
  customer_id: "",
  employee_id: "",
  supplier_id: "",
  general_ledger_id: "",
  order_date: today(),
  delivery_date: "",
  shipment_to: "",
  previous_balance: "0",
  delivery_charges: "0",
  discount: "0",
  payment_method: "Cash",
  paid_amount: "0",
  payment_note: "",
  status: "Pending",
  order_items: [emptyItem()],
});

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};

const getId = (row) =>
  row?.id ??
  row?.value ??
  row?.customer_id ??
  row?.employee_id ??
  row?.supplier_id ??
  row?.general_ledger_id ??
  row?.ledger_id ??
  row?.account_id ??
  "";

const pickText = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  const id = getId(row);
  return id ? `#${id}` : "";
};

const getProductName = (row) =>
  pickText(row, ["product_name", "product_name_en", "product_item_en", "item_name", "name", "name_en", "title"]);

const getCategoryName = (row) =>
  pickText(row, ["category_name", "category_name_en", "name", "name_en", "title"]);

const getTypeName = (row) =>
  pickText(row, ["product_type_en", "product_type", "type_name", "name", "name_en", "title"]);

const getUnitName = (row) =>
  pickText(row, ["unit_name", "unit_name_en", "name", "name_en", "symbol", "title"]);

const getCustomerName = (row) =>
  pickText(row, ["customer_name_en", "customer_name", "name", "name_en", "title"]);

const getEmployeeName = (row) =>
  pickText(row, ["employee_name", "employee_name_en", "full_name", "name", "name_en", "title"]);

const getSupplierName = (row) =>
  pickText(row, ["supplier_name", "supplier_name_en", "vendor_name", "name", "name_en", "title"]);

const getLedgerName = (row) =>
  pickText(row, ["ledger_name", "account_title", "account_name", "name", "name_en", "title"]);

const makeMap = (list, getter) => {
  const map = {};
  list.forEach((row) => {
    const id = String(getId(row));
    if (id) map[id] = getter(row);
  });
  return map;
};

function normalizeItems(order) {
  let items = order?.order_items || [];
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  if (!Array.isArray(items) || !items.length) return [];

  return items.map((item) => ({
    product_type_id: String(item.product_type_id ?? ""),
    category_id: String(item.category_id ?? ""),
    product_id: String(item.product_id ?? ""),
    unit_id: String(item.unit_id ?? ""),
    order_qty: String(item.order_qty ?? item.qty ?? item.quantity ?? ""),
    rate: String(item.rate ?? ""),
    debit: String(item.debit ?? "0"),
    credit: String(item.credit ?? "0"),
  }));
}

const lineTotal = (item) => num(item.order_qty) * num(item.rate);
const itemsTotal = (items) => items.reduce((sum, item) => sum + lineTotal(item), 0);
const itemsQty = (items) => items.reduce((sum, item) => sum + num(item.order_qty), 0);
const remainingAmount = (grand, paid) => Math.max(0, num(grand) - num(paid));

function getPaymentStatus(grand, paid) {
  const p = num(paid);
  const g = num(grand);
  if (p <= 0) return "Unpaid";
  if (g > 0 && p >= g) return "Paid";
  return "Partial";
}

function generateOrderNo(orders) {
  let max = 0;
  orders.forEach((order) => {
    const match = String(order.order_no || "").match(/SO-(\d+)/i);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `SO-${String(max + 1).padStart(3, "0")}`;
}

function pickOrderPartyType(order) {
  return order.party_type || order.customer_type || "customer";
}

function pickOrderPartyId(order) {
  const type = pickOrderPartyType(order);
  if (order.party_id) return String(order.party_id);
  if (type === "employee") return String(order.employee_id || "");
  if (type === "supplier") return String(order.supplier_id || "");
  if (type === "general_ledger") return String(order.general_ledger_id || order.ledger_id || order.account_id || "");
  return String(order.customer_id || "");
}

const inputStyle = {
  width: "100%",
  height: 24,
  border: "1px solid #9ca3af",
  padding: "2px 5px",
  fontSize: 12,
  background: "#fff",
  color: "#111827",
  borderRadius: 0,
  outline: "none",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 2,
  display: "block",
};

const buttonStyle = {
  border: "1px solid #6b7280",
  background: "#e5e7eb",
  color: "#111827",
  padding: "4px 10px",
  height: 26,
  fontSize: 12,
  cursor: "pointer",
  borderRadius: 0,
};

const smallButtonStyle = {
  ...buttonStyle,
  padding: "2px 7px",
  height: 23,
  fontSize: 11,
};

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SaleOrderPage() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [generalLedgers, setGeneralLedgers] = useState([]);

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const productMap = useMemo(() => makeMap(products, getProductName), [products]);
  const categoryMap = useMemo(() => makeMap(categories, getCategoryName), [categories]);
  const typeMap = useMemo(() => makeMap(types, getTypeName), [types]);
  const unitMap = useMemo(() => makeMap(units, getUnitName), [units]);

  const totalQty = itemsQty(form.order_items);
  const totalAmount = itemsTotal(form.order_items);
  const grandTotal = totalAmount + num(form.previous_balance) + num(form.delivery_charges) - num(form.discount);
  const remaining = remainingAmount(grandTotal, form.paid_amount);
  const payStatus = getPaymentStatus(grandTotal, form.paid_amount);

  const partyOptions = useMemo(() => {
    if (form.party_type === "employee") {
      return employees.map((x) => ({ id: String(getId(x)), name: getEmployeeName(x) }));
    }
    if (form.party_type === "supplier") {
      return suppliers.map((x) => ({ id: String(getId(x)), name: getSupplierName(x) }));
    }
    if (form.party_type === "general_ledger") {
      return generalLedgers.map((x) => ({ id: String(getId(x)), name: getLedgerName(x) }));
    }
    return customers.map((x) => ({ id: String(getId(x)), name: getCustomerName(x) }));
  }, [form.party_type, customers, employees, suppliers, generalLedgers]);

  const getOrderPartyName = useCallback(
    (order) => {
      const type = pickOrderPartyType(order);
      const id = pickOrderPartyId(order);
      const fallback = order.party_name || order.customer_name_en || order.customer_name || "";
      if (type === "employee") return makeMap(employees, getEmployeeName)[id] || fallback;
      if (type === "supplier") return makeMap(suppliers, getSupplierName)[id] || fallback;
      if (type === "general_ledger") return makeMap(generalLedgers, getLedgerName)[id] || fallback;
      return makeMap(customers, getCustomerName)[id] || fallback;
    },
    [customers, employees, suppliers, generalLedgers]
  );

  const showMsg = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPageData();
      const dropdowns = data?.dropdowns || {};

      setOrders(getList(data?.orders || data?.data || data));
      setCategories(getList(dropdowns.categories));
      setUnits(getList(dropdowns.units));
      setProducts(getList(dropdowns.products));
      setTypes(getList(dropdowns.product_types || dropdowns.types));
      setCustomers(getList(dropdowns.customers));
      setEmployees(getList(dropdowns.employees));
      setSuppliers(getList(dropdowns.suppliers));
      setGeneralLedgers(getList(dropdowns.general_ledgers || dropdowns.generalLedgers));
    } catch (err) {
      showMsg(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const items = normalizeItems(order);
      const productsText = items.map((item) => productMap[item.product_id] || "").join(" ");
      return [order.order_no, order.reference_no, getOrderPartyName(order), order.status, order.payment_status, productsText]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [orders, search, productMap, getOrderPartyName]);

  const setFormValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setItemValue = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, order_items: [...prev.order_items, emptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.length === 1 ? prev.order_items : prev.order_items.filter((_, i) => i !== index),
    }));
  };

  const handlePartyTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      party_type: type,
      customer_type: type,
      party_id: "",
      party_name: "",
      customer_id: "",
      employee_id: "",
      supplier_id: "",
      general_ledger_id: "",
    }));
  };

  const handlePartyChange = (id) => {
    const selected = partyOptions.find((x) => String(x.id) === String(id));
    setForm((prev) => ({
      ...prev,
      party_id: id,
      party_name: selected?.name || "",
      customer_id: prev.party_type === "customer" ? id : "",
      employee_id: prev.party_type === "employee" ? id : "",
      supplier_id: prev.party_type === "supplier" ? id : "",
      general_ledger_id: prev.party_type === "general_ledger" ? id : "",
    }));
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), order_no: generateOrderNo(orders) });
    setShowForm(true);
  };

  const openEdit = (order) => {
    const partyType = pickOrderPartyType(order);
    const partyId = pickOrderPartyId(order);
    const orderItems = normalizeItems(order);

    setEditingId(order.id);
    setForm({
      order_no: order.order_no || "",
      reference_no: order.reference_no || "",
      party_type: partyType,
      party_id: partyId,
      party_name: order.party_name || order.customer_name_en || getOrderPartyName(order) || "",
      customer_type: partyType,
      customer_id: partyType === "customer" ? partyId : "",
      employee_id: partyType === "employee" ? partyId : "",
      supplier_id: partyType === "supplier" ? partyId : "",
      general_ledger_id: partyType === "general_ledger" ? partyId : "",
      order_date: order.order_date || today(),
      delivery_date: order.delivery_date || "",
      shipment_to: order.shipment_to || "",
      previous_balance: String(order.previous_balance || 0),
      delivery_charges: String(order.delivery_charges || 0),
      discount: String(order.discount || 0),
      payment_method: order.payment_method || "Cash",
      paid_amount: String(order.paid_amount || 0),
      payment_note: order.payment_note || "",
      status: order.status || "Pending",
      order_items: orderItems.length ? orderItems : [emptyItem()],
    });
    setDetailOrder(null);
    setShowForm(true);
  };

  const buildPayload = () => {
    const validItems = form.order_items
      .map((item) => ({
        product_type_id: Number(item.product_type_id) || 0,
        category_id: Number(item.category_id) || 0,
        product_id: Number(item.product_id) || 0,
        unit_id: Number(item.unit_id) || 0,
        order_qty: num(item.order_qty),
        rate: num(item.rate),
        debit: num(item.debit),
        credit: num(item.credit),
      }))
      .filter((item) => item.product_id > 0 && item.order_qty > 0);

    if (!form.order_no.trim()) throw new Error("Order No required");
    if (!form.party_type || !form.party_id || !form.party_name) throw new Error("Customer Type and Name required");
    if (!validItems.length) throw new Error("At least one product required");

    return {
      order_no: form.order_no.trim(),
      reference_no: form.reference_no.trim(),
      party_type: form.party_type,
      party_id: Number(form.party_id),
      party_name: form.party_name,
      customer_type: form.party_type,
      customer_name_en: form.party_name,
      customer_id: form.party_type === "customer" ? Number(form.party_id) : null,
      employee_id: form.party_type === "employee" ? Number(form.party_id) : null,
      supplier_id: form.party_type === "supplier" ? Number(form.party_id) : null,
      general_ledger_id: form.party_type === "general_ledger" ? Number(form.party_id) : null,
      order_date: form.order_date || null,
      delivery_date: form.delivery_date || null,
      shipment_to: form.shipment_to.trim(),
      previous_balance: num(form.previous_balance),
      delivery_charges: num(form.delivery_charges),
      discount: num(form.discount),
      total_amount: totalAmount,
      grand_total: grandTotal,
      payment_method: form.payment_method || "Cash",
      paid_amount: num(form.paid_amount),
      remaining_balance: remaining,
      payment_status: payStatus,
      payment_note: form.payment_note.trim(),
      status: form.status || "Pending",
      order_items: validItems,
    };
  };

  const saveOrder = async () => {
    let payload;
    try {
      payload = buildPayload();
    } catch (err) {
      showMsg(err.message);
      return;
    }

    try {
      setSaving(true);
      if (editingId) await updateOrder(editingId, payload);
      else await createOrder(payload);
      showMsg(editingId ? "Order updated" : "Order saved");
      setEditingId(null);
      setForm(emptyForm());
      await loadAll();
    } catch (err) {
      showMsg(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await deleteOrder(id);
      setDetailOrder(null);
      showMsg("Order deleted");
      await loadAll();
    } catch (err) {
      showMsg(err.message || "Delete failed");
    }
  };

  const printOrder = (order) => {
    const items = normalizeItems(order);
    const total = num(order.total_amount) || itemsTotal(items);
    const grand = num(order.grand_total) || total + num(order.previous_balance) + num(order.delivery_charges) - num(order.discount);
    const paid = num(order.paid_amount);
    const remain = order.remaining_balance !== undefined ? num(order.remaining_balance) : remainingAmount(grand, paid);

    const rows = items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${productMap[item.product_id] || item.product_id}</td>
          <td>${categoryMap[item.category_id] || item.category_id}</td>
          <td>${typeMap[item.product_type_id] || item.product_type_id}</td>
          <td>${unitMap[item.unit_id] || item.unit_id}</td>
          <td class="num">${fmt(item.order_qty)}</td>
          <td class="num">${fmt(item.rate)}</td>
          <td class="num">${fmt(lineTotal(item))}</td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
<title>${order.order_no || "Sale Order"}</title>
<style>
body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#111}
h2{margin:0 0 6px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{border:1px solid #999;padding:5px}
th{background:#eee}
.num{text-align:right}
.box{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
.box div{border:1px solid #999;padding:6px}
@media print{button{display:none}}
</style>
</head>
<body>
<h2>Sale Order</h2>
<div>Order No: <b>${order.order_no || ""}</b></div>
<div>Customer: <b>${getOrderPartyName(order) || ""}</b></div>
<div>Date: ${order.order_date || ""}</div>
<table>
<thead>
<tr>
<th>#</th>
<th>Product</th>
<th>Category</th>
<th>Type</th>
<th>Unit</th>
<th>Qty</th>
<th>Rate</th>
<th>Amount</th>
</tr>
</thead>
<tbody>${rows}</tbody>
</table>
<div class="box">
<div>Total: <b>${fmt(total)}</b></div>
<div>Grand Total: <b>${fmt(grand)}</b></div>
<div>Paid: <b>${fmt(paid)}</b></div>
<div>Remaining: <b>${fmt(remain)}</b></div>
</div>
<script>window.onload=()=>window.print()</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "#111", background: "#f3f4f6", minHeight: "100vh", padding: 10 }}>
      <style>{`
        *{box-sizing:border-box}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #9ca3af;padding:3px;font-size:12px;vertical-align:middle}
        th{background:#d1d5db;font-weight:700;text-align:left}
        .panel{border:1px solid #9ca3af;background:#e5e7eb;padding:8px;margin-bottom:8px}
        .row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:6px}
        .totals{display:grid;grid-template-columns:180px 180px;gap:5px;align-items:center;margin-top:8px}
        .right{text-align:right}
        .center{text-align:center}
        .modalBack{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:99;padding:15px}
        .modalBox{background:#e5e7eb;border:1px solid #111;width:min(950px,100%);max-height:90vh;overflow:auto;padding:10px}
        @media(max-width:800px){
          .row{grid-template-columns:1fr}
          .totals{grid-template-columns:1fr}
          table{min-width:850px}
          .tableWrap{overflow:auto}
        }
      `}</style>

      {message && (
        <div style={{ position: "fixed", right: 10, bottom: 10, background: "#fff", border: "1px solid #111", padding: 8, zIndex: 200 }}>
          {message}
        </div>
      )}

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <b style={{ fontSize: 16 }}>Sale Order</b>
          <div style={{ display: "flex", gap: 5 }}>
            <button style={buttonStyle} onClick={openNew}>New</button>
            <button style={buttonStyle} onClick={loadAll}>{loading ? "Loading" : "Refresh"}</button>
          </div>
        </div>

        {showForm && (
          <>
            <div className="row">
              <Field label="Customer Type">
                <select style={inputStyle} value={form.party_type} onChange={(e) => handlePartyTypeChange(e.target.value)}>
                  {PARTY_TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </Field>

              <Field label="Select">
                <select style={inputStyle} value={form.party_id} onChange={(e) => handlePartyChange(e.target.value)}>
                  <option value="">Select</option>
                  {partyOptions.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </Field>

              <Field label="Invoice No">
                <input style={inputStyle} value={form.order_no} onChange={(e) => setFormValue("order_no", e.target.value)} />
              </Field>

              <Field label="Date">
                <input type="date" style={inputStyle} value={form.order_date} onChange={(e) => setFormValue("order_date", e.target.value)} />
              </Field>
            </div>

            <div className="row">
              <Field label="Reference">
                <input style={inputStyle} value={form.reference_no} onChange={(e) => setFormValue("reference_no", e.target.value)} />
              </Field>

              <Field label="Delivery Date">
                <input type="date" style={inputStyle} value={form.delivery_date} onChange={(e) => setFormValue("delivery_date", e.target.value)} />
              </Field>

              <Field label="Ship To">
                <input style={inputStyle} value={form.shipment_to} onChange={(e) => setFormValue("shipment_to", e.target.value)} />
              </Field>

              <Field label="Status">
                <select style={inputStyle} value={form.status} onChange={(e) => setFormValue("status", e.target.value)}>
                  {ORDER_STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </Field>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 30 }}></th>
                    <th>Product Type</th>
                    <th>Category</th>
                    <th>Product</th>
                    <th>Unit</th>
                    <th style={{ width: 90 }}>Qty</th>
                    <th style={{ width: 90 }}>Rate</th>
                    <th style={{ width: 110 }}>Amount</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {form.order_items.map((item, index) => (
                    <tr key={index}>
                      <td className="center">{index + 1}</td>

                      <td>
                        <select style={inputStyle} value={item.product_type_id} onChange={(e) => setItemValue(index, "product_type_id", e.target.value)}>
                          <option value="">Select</option>
                          {types.map((x) => <option key={getId(x)} value={getId(x)}>{getTypeName(x)}</option>)}
                        </select>
                      </td>

                      <td>
                        <select style={inputStyle} value={item.category_id} onChange={(e) => setItemValue(index, "category_id", e.target.value)}>
                          <option value="">Select</option>
                          {categories.map((x) => <option key={getId(x)} value={getId(x)}>{getCategoryName(x)}</option>)}
                        </select>
                      </td>

                      <td>
                        <select style={inputStyle} value={item.product_id} onChange={(e) => setItemValue(index, "product_id", e.target.value)}>
                          <option value="">Select</option>
                          {products.map((x) => <option key={getId(x)} value={getId(x)}>{getProductName(x)}</option>)}
                        </select>
                      </td>

                      <td>
                        <select style={inputStyle} value={item.unit_id} onChange={(e) => setItemValue(index, "unit_id", e.target.value)}>
                          <option value="">Select</option>
                          {units.map((x) => <option key={getId(x)} value={getId(x)}>{getUnitName(x)}</option>)}
                        </select>
                      </td>

                      <td>
                        <input type="number" style={{ ...inputStyle, textAlign: "right" }} value={item.order_qty} onChange={(e) => setItemValue(index, "order_qty", e.target.value)} />
                      </td>

                      <td>
                        <input type="number" style={{ ...inputStyle, textAlign: "right" }} value={item.rate} onChange={(e) => setItemValue(index, "rate", e.target.value)} />
                      </td>

                      <td>
                        <input readOnly style={{ ...inputStyle, textAlign: "right", background: "#f9fafb" }} value={fmt(lineTotal(item))} />
                      </td>

                      <td className="center">
                        <button style={smallButtonStyle} onClick={() => removeItem(index)}>-</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 5 }}>
              <button style={buttonStyle} onClick={addItem}>Add Row</button>
            </div>

            <div className="totals">
              <label>Total Quantity</label>
              <input readOnly style={inputStyle} value={fmt(totalQty)} />

              <label>Total Amount</label>
              <input readOnly style={inputStyle} value={fmt(totalAmount)} />

              <label>Previous Balance</label>
              <input type="number" style={inputStyle} value={form.previous_balance} onChange={(e) => setFormValue("previous_balance", e.target.value)} />

              <label>Delivery Charges</label>
              <input type="number" style={inputStyle} value={form.delivery_charges} onChange={(e) => setFormValue("delivery_charges", e.target.value)} />

              <label>Discount</label>
              <input type="number" style={inputStyle} value={form.discount} onChange={(e) => setFormValue("discount", e.target.value)} />

              <label>Grand Total</label>
              <input readOnly style={inputStyle} value={fmt(grandTotal)} />

              <label>Payment Method</label>
              <select style={inputStyle} value={form.payment_method} onChange={(e) => setFormValue("payment_method", e.target.value)}>
                {PAYMENT_METHODS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>

              <label>Paid Amount</label>
              <input type="number" style={inputStyle} value={form.paid_amount} onChange={(e) => setFormValue("paid_amount", e.target.value)} />

              <label>Remaining</label>
              <input readOnly style={inputStyle} value={fmt(remaining)} />

              <label>Payment Status</label>
              <input readOnly style={inputStyle} value={payStatus} />

              <label>Payment Note</label>
              <input style={inputStyle} value={form.payment_note} onChange={(e) => setFormValue("payment_note", e.target.value)} />
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <button style={buttonStyle} onClick={saveOrder} disabled={saving}>{saving ? "Saving" : editingId ? "Update" : "Save"}</button>
              <button style={buttonStyle} onClick={() => setForm(emptyForm())}>Clear</button>
              <button style={buttonStyle} onClick={() => setShowForm(false)}>Hide Form</button>
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <b>Orders</b>
          <input style={{ ...inputStyle, width: 260 }} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 35 }}>#</th>
                <th>Order No</th>
                <th>Name</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th style={{ width: 230 }}>Buttons</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="center">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="center">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const items = normalizeItems(order);
                  const total = num(order.total_amount) || itemsTotal(items);
                  const grand = num(order.grand_total) || total + num(order.previous_balance) + num(order.delivery_charges) - num(order.discount);
                  const paid = num(order.paid_amount);
                  const remain = order.remaining_balance !== undefined ? num(order.remaining_balance) : remainingAmount(grand, paid);

                  return (
                    <tr key={order.id || index}>
                      <td className="center">{index + 1}</td>
                      <td>{order.order_no}</td>
                      <td>{getOrderPartyName(order)}</td>
                      <td>{order.order_date || ""}</td>
                      <td className="right">{fmt(grand)}</td>
                      <td className="right">{fmt(paid)}</td>
                      <td className="right">{fmt(remain)}</td>
                      <td>{order.status || "Pending"}</td>
                      <td>
                        <button style={smallButtonStyle} onClick={() => setDetailOrder(order)}>See Details</button>{" "}
                        <button style={smallButtonStyle} onClick={() => openEdit(order)}>Edit</button>{" "}
                        <button style={smallButtonStyle} onClick={() => printOrder(order)}>Print</button>{" "}
                        <button style={smallButtonStyle} onClick={() => handleDelete(order.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailOrder && (() => {
        const items = normalizeItems(detailOrder);
        const total = num(detailOrder.total_amount) || itemsTotal(items);
        const grand = num(detailOrder.grand_total) || total + num(detailOrder.previous_balance) + num(detailOrder.delivery_charges) - num(detailOrder.discount);
        const paid = num(detailOrder.paid_amount);
        const remain = detailOrder.remaining_balance !== undefined ? num(detailOrder.remaining_balance) : remainingAmount(grand, paid);

        return (
          <div className="modalBack">
            <div className="modalBox">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <b>Order Details - {detailOrder.order_no}</b>
                <button style={smallButtonStyle} onClick={() => setDetailOrder(null)}>Close</button>
              </div>

              <div className="row">
                <div><b>Name:</b> {getOrderPartyName(detailOrder)}</div>
                <div><b>Order Date:</b> {detailOrder.order_date}</div>
                <div><b>Delivery Date:</b> {detailOrder.delivery_date}</div>
                <div><b>Status:</b> {detailOrder.status}</div>
              </div>

              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Type</th>
                      <th>Category</th>
                      <th>Product</th>
                      <th>Unit</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="center">{index + 1}</td>
                        <td>{typeMap[item.product_type_id] || item.product_type_id}</td>
                        <td>{categoryMap[item.category_id] || item.category_id}</td>
                        <td>{productMap[item.product_id] || item.product_id}</td>
                        <td>{unitMap[item.unit_id] || item.unit_id}</td>
                        <td className="right">{fmt(item.order_qty)}</td>
                        <td className="right">{fmt(item.rate)}</td>
                        <td className="right">{fmt(lineTotal(item))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="totals">
                <label>Total</label>
                <input readOnly style={inputStyle} value={fmt(total)} />

                <label>Grand Total</label>
                <input readOnly style={inputStyle} value={fmt(grand)} />

                <label>Paid</label>
                <input readOnly style={inputStyle} value={fmt(paid)} />

                <label>Remaining</label>
                <input readOnly style={inputStyle} value={fmt(remain)} />
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <button style={buttonStyle} onClick={() => openEdit(detailOrder)}>Edit</button>
                <button style={buttonStyle} onClick={() => printOrder(detailOrder)}>Print</button>
                <button style={buttonStyle} onClick={() => handleDelete(detailOrder.id)}>Delete</button>
                <button style={buttonStyle} onClick={() => setDetailOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default SaleOrderPage;
