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

  if (res.status === 204) return null;
  return res.json();
}

const getSaleOrderPageData = () => apiFetch(SALE_ORDER_API);

const createSaleOrder = (data) =>
  apiFetch(SALE_ORDER_API, {
    method: "POST",
    body: JSON.stringify(data),
  });

const updateSaleOrder = (id, data) =>
  apiFetch(`${SALE_ORDER_API}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

const deleteSaleOrder = (id) =>
  apiFetch(`${SALE_ORDER_API}/${id}`, {
    method: "DELETE",
  });

const PARTY_TYPES = [
  { value: "customer", label: "Customer" },
  { value: "employee", label: "Employee" },
  { value: "supplier", label: "Supplier" },
  { value: "general_ledger", label: "General Ledger" },
];

const PAYMENT_METHODS = ["Cash", "Bank", "JazzCash", "EasyPaisa", "Cheque", "Other"];
const ORDER_STATUSES = ["Pending", "Completed", "Cancelled"];

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

const today = () => new Date().toISOString().slice(0, 10);

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

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
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
  row?.customer_id ??
  row?.employee_id ??
  row?.supplier_id ??
  row?.ledger_id ??
  row?.general_ledger_id ??
  row?.account_id ??
  "";

const firstText = (row, keys, fallback = "") => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && String(row[key]).trim()) {
      return String(row[key]).trim();
    }
  }

  const id = getId(row);
  return fallback || (id ? `#${id}` : "");
};

const getProductName = (row) =>
  firstText(row, [
    "product_name",
    "product_name_en",
    "product_item_en",
    "item_name",
    "name",
    "name_en",
    "title",
  ]);

const getCategoryName = (row) =>
  firstText(row, ["category_name", "category_name_en", "name", "name_en", "title"]);

const getUnitName = (row) =>
  firstText(row, ["unit_name", "unit_name_en", "name", "name_en", "symbol", "title"]);

const getTypeName = (row) =>
  firstText(row, ["product_type_en", "product_type", "type_name", "name", "name_en", "title"]);

const getCustomerName = (row) =>
  firstText(row, ["customer_name_en", "customer_name", "name", "name_en", "title"]);

const getEmployeeName = (row) =>
  firstText(row, ["employee_name", "employee_name_en", "full_name", "name", "name_en", "title"]);

const getSupplierName = (row) =>
  firstText(row, ["supplier_name", "supplier_name_en", "vendor_name", "name", "name_en", "title"]);

const getLedgerName = (row) =>
  firstText(row, ["ledger_name", "account_title", "account_name", "name", "name_en", "title"]);

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
    product_type_id: String(item.product_type_id ?? item.productTypeId ?? ""),
    category_id: String(item.category_id ?? item.categoryId ?? ""),
    product_id: String(item.product_id ?? item.productId ?? ""),
    unit_id: String(item.unit_id ?? item.unitId ?? ""),
    order_qty: String(item.order_qty ?? item.qty ?? item.quantity ?? ""),
    rate: String(item.rate ?? ""),
    debit: String(item.debit ?? "0"),
    credit: String(item.credit ?? "0"),
  }));
}

const lineTotal = (item) => num(item.order_qty) * num(item.rate);

const orderTotal = (items) =>
  items.reduce((sum, item) => sum + lineTotal(item), 0);

const remainingAmount = (grand, paid) =>
  Math.max(0, num(grand) - num(paid));

const paymentStatus = (grand, paid) => {
  const p = num(paid);
  const g = num(grand);

  if (p <= 0) return "Unpaid";
  if (g > 0 && p >= g) return "Paid";
  return "Partial";
};

function makeMap(list, nameGetter) {
  const map = {};

  list.forEach((row) => {
    const id = String(getId(row));
    if (id) map[id] = nameGetter(row);
  });

  return map;
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
  return order.party_type || order.customer_type || (order.customer_id ? "customer" : "customer");
}

function pickOrderPartyId(order) {
  const type = pickOrderPartyType(order);

  if (order.party_id) return String(order.party_id);
  if (type === "employee") return String(order.employee_id || "");
  if (type === "supplier") return String(order.supplier_id || "");
  if (type === "general_ledger") {
    return String(order.general_ledger_id || order.ledger_id || order.account_id || "");
  }

  return String(order.customer_id || "");
}

const badgeStyle = (tone) => {
  const tones = {
    green: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    yellow: { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a" },
    red: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
    blue: { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    gray: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
    ...(tones[tone] || tones.gray),
  };
};

function fieldStyle() {
  return {
    width: "100%",
    minHeight: 38,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "8px 10px",
    outline: "none",
    fontSize: 13,
    fontWeight: 650,
    background: "#fff",
    color: "#0f172a",
  };
}

function Field({ label, children, span = 1 }) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        gridColumn: `span ${span}`,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export default function SaleOrderPage() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [generalLedgers, setGeneralLedgers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const productMap = useMemo(() => makeMap(products, getProductName), [products]);
  const categoryMap = useMemo(() => makeMap(categories, getCategoryName), [categories]);
  const typeMap = useMemo(() => makeMap(types, getTypeName), [types]);
  const unitMap = useMemo(() => makeMap(units, getUnitName), [units]);

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

  const orderItems = form.order_items || [];

  const totalAmount = useMemo(() => orderTotal(orderItems), [orderItems]);

  const grandTotal = useMemo(
    () =>
      totalAmount +
      num(form.previous_balance) +
      num(form.delivery_charges) -
      num(form.discount),
    [totalAmount, form.previous_balance, form.delivery_charges, form.discount]
  );

  const remaining = remainingAmount(grandTotal, form.paid_amount);
  const payStatus = paymentStatus(grandTotal, form.paid_amount);

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);

      const pageData = await getSaleOrderPageData();
      const dropdowns = pageData?.dropdowns || {};

      setOrders(getList(pageData?.orders || pageData?.data || pageData));
      setCategories(getList(dropdowns.categories));
      setUnits(getList(dropdowns.units));
      setProducts(getList(dropdowns.products));
      setTypes(getList(dropdowns.product_types || dropdowns.types));
      setCustomers(getList(dropdowns.customers));
      setEmployees(getList(dropdowns.employees));
      setSuppliers(getList(dropdowns.suppliers));
      setGeneralLedgers(getList(dropdowns.general_ledgers || dropdowns.generalLedgers));
    } catch (err) {
      showToast("error", err.message || "Failed to load sale orders.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return orders;

    return orders.filter((order) => {
      const items = normalizeItems(order);

      const itemText = items
        .map((item) =>
          [
            productMap[item.product_id],
            categoryMap[item.category_id],
            typeMap[item.product_type_id],
            unitMap[item.unit_id],
          ].join(" ")
        )
        .join(" ");

      return [
        order.order_no,
        order.reference_no,
        getOrderPartyName(order),
        order.status,
        order.payment_status,
        order.payment_method,
        itemText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [orders, search, productMap, categoryMap, typeMap, unitMap, getOrderPartyName]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), order_no: generateOrderNo(orders) });
    setShowForm(true);
  };

  const openEdit = (order) => {
    const partyType = pickOrderPartyType(order);
    const partyId = pickOrderPartyId(order);

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
      order_items: normalizeItems(order).length ? normalizeItems(order) : [emptyItem()],
    });

    setDetailsOrder(null);
    setShowForm(true);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  const updateItem = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      order_items: [...prev.order_items, emptyItem()],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      order_items:
        prev.order_items.length === 1
          ? prev.order_items
          : prev.order_items.filter((_, i) => i !== index),
    }));
  };

  const preparePayload = () => {
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

    if (!form.order_no.trim()) throw new Error("Order No required.");
    if (!form.party_type || !form.party_id || !form.party_name) {
      throw new Error("Customer Type and Name required.");
    }
    if (!validItems.length) throw new Error("At least one product required.");

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

  const handleSave = async () => {
    let payload;

    try {
      payload = preparePayload();
    } catch (err) {
      showToast("error", err.message);
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await updateSaleOrder(editingId, payload);
      } else {
        await createSaleOrder(payload);
      }

      showToast("success", editingId ? "Order updated." : "Order saved.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await loadAll();
    } catch (err) {
      showToast("error", err.message || "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await deleteSaleOrder(id);
      showToast("success", "Order deleted.");
      setDetailsOrder(null);
      await loadAll();
    } catch (err) {
      showToast("error", err.message || "Delete failed.");
    }
  };

  const printOrder = (order) => {
    const items = normalizeItems(order);
    const total = num(order.total_amount) || orderTotal(items);
    const grand =
      num(order.grand_total) ||
      total + num(order.previous_balance) + num(order.delivery_charges) - num(order.discount);

    const paid = num(order.paid_amount);
    const remain =
      order.remaining_balance !== undefined
        ? num(order.remaining_balance)
        : remainingAmount(grand, paid);

    const rows = items
      .map(
        (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
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

    const html = `<!doctype html>
<html>
<head>
<title>${order.order_no || "Sale Order"}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;background:#f8fafc;color:#0f172a}
.page{padding:24px}
.sheet{background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden}
.head{background:#0f172a;color:#fff;padding:20px}
.head h1{margin:0;font-size:24px}
.body{padding:18px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.box{border:1px solid #e2e8f0;border-radius:12px;padding:10px}
.box small{display:block;color:#64748b;margin-bottom:6px}
.box b{font-size:15px}
table{width:100%;border-collapse:collapse}
th{background:#1e293b;color:white;text-align:left}
th,td{border:1px solid #e2e8f0;padding:9px;font-size:12px}
.num{text-align:right;font-family:monospace}
.totals{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}
@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style>
</head>
<body>
<div class="page">
  <div class="sheet">
    <div class="head">
      <h1>Ali Cages - Sale Order</h1>
      <p>${order.order_no || ""}</p>
    </div>

    <div class="body">
      <div class="grid">
        <div class="box"><small>Party</small><b>${getOrderPartyName(order) || "-"}</b></div>
        <div class="box"><small>Order Date</small><b>${order.order_date || "-"}</b></div>
        <div class="box"><small>Delivery Date</small><b>${order.delivery_date || "-"}</b></div>
        <div class="box"><small>Status</small><b>${order.status || "-"}</b></div>
      </div>

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
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="box"><small>Total</small><b>${fmt(total)}</b></div>
        <div class="box"><small>Grand Total</small><b>${fmt(grand)}</b></div>
        <div class="box"><small>Paid</small><b>${fmt(paid)}</b></div>
        <div class="box"><small>Remaining</small><b>${fmt(remain)}</b></div>
      </div>
    </div>
  </div>
</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: 18,
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <style>{`
        *{box-sizing:border-box}
        .btn{border:none;border-radius:10px;padding:9px 13px;font-weight:800;cursor:pointer}
        .btn:hover{filter:brightness(.98);transform:translateY(-1px)}
        .grid-form{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:10px}
        .modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:flex;align-items:center;justify-content:center;padding:14px}
        .modal{background:white;border-radius:18px;width:min(1080px,100%);max-height:92vh;overflow:hidden;box-shadow:0 30px 80px rgba(15,23,42,.25);display:flex;flex-direction:column}
        .modal-body{padding:14px;overflow:auto}
        .card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 1px 3px rgba(15,23,42,.05)}
        .table-wrap{overflow-x:auto}
        table.orders{width:100%;border-collapse:collapse;table-layout:fixed}
        table.orders th{background:#0f172a;color:rgba(255,255,255,.78);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:11px 8px}
        table.orders td{padding:11px 8px;border-bottom:1px solid #f1f5f9;font-size:13px}
        table.orders tr:hover td{background:#f8fafc}
        .item-row{border:1px solid #e2e8f0;border-radius:14px;padding:10px;background:#fff}
        @media(max-width:850px){
          .grid-form{grid-template-columns:1fr}
          .grid-form>label{grid-column:span 1!important}
          table.orders{min-width:820px}
        }
      `}</style>

      {message.text && (
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 90,
            background: message.type === "error" ? "#dc2626" : "#16a34a",
            color: "white",
            padding: "12px 16px",
            borderRadius: 14,
            fontWeight: 800,
            boxShadow: "0 20px 50px rgba(15,23,42,.25)",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          className="card"
          style={{
            padding: 18,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 950 }}>Sale Order</h1>
            <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>
              Single route frontend: /api/sale-orders
            </p>
          </div>

          <button
            className="btn"
            onClick={openAdd}
            style={{
              background: "#4f46e5",
              color: "white",
              boxShadow: "0 12px 24px rgba(79,70,229,.25)",
            }}
          >
            + New Order
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, party, product, payment..."
            style={{ ...fieldStyle(), maxWidth: 420 }}
          />

          <button
            className="btn"
            onClick={loadAll}
            style={{ background: "#e0f2fe", color: "#0369a1" }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="card table-wrap">
          <table className="orders">
            <thead>
              <tr>
                <th style={{ width: 45 }}>#</th>
                <th style={{ width: 120, textAlign: "left" }}>Order</th>
                <th style={{ textAlign: "left" }}>Name</th>
                <th style={{ width: 115 }}>Date</th>
                <th style={{ width: 120, textAlign: "right" }}>Grand Total</th>
                <th style={{ width: 135 }}>Payment</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 190 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const items = normalizeItems(order);
                  const total = num(order.total_amount) || orderTotal(items);
                  const grand =
                    num(order.grand_total) ||
                    total +
                      num(order.previous_balance) +
                      num(order.delivery_charges) -
                      num(order.discount);

                  const paid = num(order.paid_amount);
                  const pStatus = order.payment_status || paymentStatus(grand, paid);
                  const statusTone =
                    order.status === "Completed"
                      ? "green"
                      : order.status === "Cancelled"
                      ? "red"
                      : "yellow";

                  const payTone = pStatus === "Paid" ? "green" : pStatus === "Partial" ? "yellow" : "red";

                  return (
                    <tr key={order.id || index}>
                      <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace" }}>
                        {index + 1}
                      </td>

                      <td>
                        <div style={{ fontFamily: "monospace", fontWeight: 900 }}>
                          {order.order_no}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 11 }}>
                          {items.length} products
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            fontWeight: 850,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {getOrderPartyName(order)}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>
                          {pickOrderPartyType(order)}
                        </div>
                      </td>

                      <td
                        style={{
                          textAlign: "center",
                          fontFamily: "monospace",
                          color: "#475569",
                          fontSize: 12,
                        }}
                      >
                        {order.order_date || "-"}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          color: "#1d4ed8",
                          fontFamily: "monospace",
                          fontWeight: 900,
                        }}
                      >
                        {fmt(grand)}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span style={badgeStyle(payTone)}>{pStatus}</span>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span style={badgeStyle(statusTone)}>{order.status || "Pending"}</span>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            className="btn"
                            onClick={() => setDetailsOrder(order)}
                            style={{ background: "#eef2ff", color: "#4f46e5", padding: "7px 9px" }}
                          >
                            See Details
                          </button>

                          <button
                            className="btn"
                            onClick={() => openEdit(order)}
                            style={{ background: "#dcfce7", color: "#166534", padding: "7px 9px" }}
                          >
                            Edit
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
        <div className="modal-bg">
          <div className="modal">
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>
                {editingId ? "Edit Sale Order" : "New Sale Order"}
              </h2>

              <button
                className="btn"
                onClick={() => setShowForm(false)}
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="grid-form" style={{ marginBottom: 14 }}>
                <Field label="Order No *" span={3}>
                  <input
                    style={fieldStyle()}
                    value={form.order_no}
                    onChange={(e) => updateForm("order_no", e.target.value)}
                  />
                </Field>

                <Field label="Reference No" span={3}>
                  <input
                    style={fieldStyle()}
                    value={form.reference_no}
                    onChange={(e) => updateForm("reference_no", e.target.value)}
                  />
                </Field>

                <Field label="Customer Type *" span={3}>
                  <select
                    style={fieldStyle()}
                    value={form.party_type}
                    onChange={(e) => handlePartyTypeChange(e.target.value)}
                  >
                    {PARTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Name *" span={3}>
                  <select
                    style={fieldStyle()}
                    value={form.party_id}
                    onChange={(e) => handlePartyChange(e.target.value)}
                  >
                    <option value="">-- Select Name --</option>
                    {partyOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Order Date" span={3}>
                  <input
                    type="date"
                    style={fieldStyle()}
                    value={form.order_date}
                    onChange={(e) => updateForm("order_date", e.target.value)}
                  />
                </Field>

                <Field label="Delivery Date" span={3}>
                  <input
                    type="date"
                    style={fieldStyle()}
                    value={form.delivery_date}
                    onChange={(e) => updateForm("delivery_date", e.target.value)}
                  />
                </Field>

                <Field label="Shipment To" span={3}>
                  <input
                    style={fieldStyle()}
                    value={form.shipment_to}
                    onChange={(e) => updateForm("shipment_to", e.target.value)}
                  />
                </Field>

                <Field label="Status" span={3}>
                  <select
                    style={fieldStyle()}
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "8px 0 10px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16 }}>Products</h3>

                <button
                  className="btn"
                  onClick={addItem}
                  style={{ background: "#0f172a", color: "white" }}
                >
                  + Add Product
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {form.order_items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                      <b>Product Row {index + 1}</b>

                      <button
                        className="btn"
                        onClick={() => removeItem(index)}
                        disabled={form.order_items.length === 1}
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          padding: "5px 9px",
                          opacity: form.order_items.length === 1 ? 0.5 : 1,
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid-form">
                      <Field label="Product Type *" span={2}>
                        <select
                          style={fieldStyle()}
                          value={item.product_type_id}
                          onChange={(e) => updateItem(index, "product_type_id", e.target.value)}
                        >
                          <option value="">Select</option>
                          {types.map((x) => (
                            <option key={getId(x)} value={getId(x)}>
                              {getTypeName(x)}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Category *" span={2}>
                        <select
                          style={fieldStyle()}
                          value={item.category_id}
                          onChange={(e) => updateItem(index, "category_id", e.target.value)}
                        >
                          <option value="">Select</option>
                          {categories.map((x) => (
                            <option key={getId(x)} value={getId(x)}>
                              {getCategoryName(x)}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Product *" span={2}>
                        <select
                          style={fieldStyle()}
                          value={item.product_id}
                          onChange={(e) => updateItem(index, "product_id", e.target.value)}
                        >
                          <option value="">Select</option>
                          {products.map((x) => (
                            <option key={getId(x)} value={getId(x)}>
                              {getProductName(x)}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Unit" span={2}>
                        <select
                          style={fieldStyle()}
                          value={item.unit_id}
                          onChange={(e) => updateItem(index, "unit_id", e.target.value)}
                        >
                          <option value="">Select</option>
                          {units.map((x) => (
                            <option key={getId(x)} value={getId(x)}>
                              {getUnitName(x)}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Qty *" span={1}>
                        <input
                          type="number"
                          style={fieldStyle()}
                          value={item.order_qty}
                          onChange={(e) => updateItem(index, "order_qty", e.target.value)}
                        />
                      </Field>

                      <Field label="Rate" span={1}>
                        <input
                          type="number"
                          style={fieldStyle()}
                          value={item.rate}
                          onChange={(e) => updateItem(index, "rate", e.target.value)}
                        />
                      </Field>

                      <Field label="Line Total" span={2}>
                        <input
                          readOnly
                          style={{
                            ...fieldStyle(),
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 900,
                          }}
                          value={fmt(lineTotal(item))}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ margin: "18px 0 10px", fontSize: 16 }}>Payment & Totals</h3>

              <div className="grid-form">
                <Field label="Total Amount" span={2}>
                  <input
                    readOnly
                    style={{
                      ...fieldStyle(),
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontWeight: 900,
                    }}
                    value={fmt(totalAmount)}
                  />
                </Field>

                <Field label="Previous Balance" span={2}>
                  <input
                    type="number"
                    style={fieldStyle()}
                    value={form.previous_balance}
                    onChange={(e) => updateForm("previous_balance", e.target.value)}
                  />
                </Field>

                <Field label="Delivery Charges" span={2}>
                  <input
                    type="number"
                    style={fieldStyle()}
                    value={form.delivery_charges}
                    onChange={(e) => updateForm("delivery_charges", e.target.value)}
                  />
                </Field>

                <Field label="Discount" span={2}>
                  <input
                    type="number"
                    style={fieldStyle()}
                    value={form.discount}
                    onChange={(e) => updateForm("discount", e.target.value)}
                  />
                </Field>

                <Field label="Grand Total" span={2}>
                  <input
                    readOnly
                    style={{
                      ...fieldStyle(),
                      background: "#0f172a",
                      color: "white",
                      fontWeight: 900,
                    }}
                    value={fmt(grandTotal)}
                  />
                </Field>

                <Field label="Payment Method" span={2}>
                  <select
                    style={fieldStyle()}
                    value={form.payment_method}
                    onChange={(e) => updateForm("payment_method", e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Paid Amount" span={2}>
                  <input
                    type="number"
                    style={fieldStyle()}
                    value={form.paid_amount}
                    onChange={(e) => updateForm("paid_amount", e.target.value)}
                  />
                </Field>

                <Field label="Remaining" span={2}>
                  <input
                    readOnly
                    style={{
                      ...fieldStyle(),
                      background: "#fff1f2",
                      color: "#be123c",
                      fontWeight: 900,
                    }}
                    value={fmt(remaining)}
                  />
                </Field>

                <Field label="Payment Status" span={2}>
                  <input
                    readOnly
                    style={{
                      ...fieldStyle(),
                      background: "#f8fafc",
                      fontWeight: 900,
                    }}
                    value={payStatus}
                  />
                </Field>

                <Field label="Payment Note" span={6}>
                  <input
                    style={fieldStyle()}
                    value={form.payment_note}
                    onChange={(e) => updateForm("payment_note", e.target.value)}
                    placeholder="Transaction no / note"
                  />
                </Field>
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                className="btn"
                onClick={() => setShowForm(false)}
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                Cancel
              </button>

              <button
                className="btn"
                disabled={submitting}
                onClick={handleSave}
                style={{
                  background: submitting ? "#94a3b8" : "#2563eb",
                  color: "white",
                }}
              >
                {submitting ? "Saving..." : editingId ? "Update Order" : "Save Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsOrder &&
        (() => {
          const items = normalizeItems(detailsOrder);
          const total = num(detailsOrder.total_amount) || orderTotal(items);
          const grand =
            num(detailsOrder.grand_total) ||
            total +
              num(detailsOrder.previous_balance) +
              num(detailsOrder.delivery_charges) -
              num(detailsOrder.discount);

          const paid = num(detailsOrder.paid_amount);

          const remain =
            detailsOrder.remaining_balance !== undefined
              ? num(detailsOrder.remaining_balance)
              : remainingAmount(grand, paid);

          const pStatus = detailsOrder.payment_status || paymentStatus(grand, paid);

          return (
            <div className="modal-bg">
              <div className="modal" style={{ width: "min(980px,100%)" }}>
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20 }}>Order Details</h2>
                    <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                      {detailsOrder.order_no}
                    </p>
                  </div>

                  <button
                    className="btn"
                    onClick={() => setDetailsOrder(null)}
                    style={{ background: "#f1f5f9", color: "#475569" }}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    {[
                      ["Name", getOrderPartyName(detailsOrder)],
                      ["Order Date", detailsOrder.order_date || "-"],
                      ["Delivery Date", detailsOrder.delivery_date || "-"],
                      ["Status", detailsOrder.status || "Pending"],
                      ["Grand Total", fmt(grand)],
                      ["Paid", fmt(paid)],
                      ["Remaining", fmt(remain)],
                      ["Payment", pStatus],
                    ].map(([label, value]) => (
                      <div key={label} className="card" style={{ padding: 12 }}>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </div>

                        <div style={{ marginTop: 7, fontWeight: 900 }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="table-wrap card">
                    <table className="orders" style={{ minWidth: 760 }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th style={{ textAlign: "left" }}>Product</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Unit</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: "center" }}>{idx + 1}</td>
                            <td>{productMap[item.product_id] || item.product_id}</td>
                            <td style={{ textAlign: "center" }}>
                              {categoryMap[item.category_id] || item.category_id}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {typeMap[item.product_type_id] || item.product_type_id}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {unitMap[item.unit_id] || item.unit_id}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {fmt(item.order_qty)}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {fmt(item.rate)}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 900 }}>
                              {fmt(lineTotal(item))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn"
                    onClick={() => setDetailsOrder(null)}
                    style={{ background: "#f1f5f9", color: "#475569" }}
                  >
                    Close
                  </button>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn"
                      onClick={() => openEdit(detailsOrder)}
                      style={{ background: "#dcfce7", color: "#166534" }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn"
                      onClick={() => printOrder(detailsOrder)}
                      style={{ background: "#fef9c3", color: "#854d0e" }}
                    >
                      Print
                    </button>

                    <button
                      className="btn"
                      onClick={() => handleDelete(detailsOrder.id)}
                      style={{ background: "#fee2e2", color: "#991b1b" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
