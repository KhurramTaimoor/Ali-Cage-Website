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
const createSaleOrder = (data) => apiFetch(SALE_ORDER_API, { method: "POST", body: JSON.stringify(data) });
const updateSaleOrder = (id, data) => apiFetch(`${SALE_ORDER_API}/${id}`, { method: "PUT", body: JSON.stringify(data) });
const deleteSaleOrder = (id) => apiFetch(`${SALE_ORDER_API}/${id}`, { method: "DELETE" });

const LANG = {
  en: {
    title: "Sale Order",
    subtitle: "Manage sale orders, products, payments and summaries",
    newOrder: "New Order",
    refresh: "Refresh",
    search: "Search order, party, product, payment...",
    urdu: "اردو",
    english: "English",
    summary: "Summary",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    totalOrders: "Total Orders",
    pendingOrders: "Pending",
    completedOrders: "Completed",
    cancelledOrders: "Cancelled",
    totalValue: "Total Value",
    totalPaid: "Total Paid",
    totalRemaining: "Remaining",
    customerType: "Customer Type",
    name: "Name",
    referenceNo: "Reference No",
    invoiceNo: "Invoice No",
    date: "Date",
    deliveryDate: "Delivery Date",
    shipTo: "Ship To",
    orderStatus: "Order Status",
    products: "Products",
    addRow: "+ Add Row",
    productType: "Product Type",
    category: "Category",
    product: "Product",
    unit: "Unit",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    payment: "Payment",
    paymentMethod: "Payment Method",
    paidAmount: "Paid Amount",
    paymentStatus: "Payment Status",
    paymentNote: "Payment Note",
    previousBalance: "Previous Balance",
    deliveryCharges: "Delivery Charges",
    discount: "Discount",
    totalAmount: "Total Amount",
    grandTotal: "Grand Total",
    remaining: "Remaining",
    save: "Save",
    update: "Update",
    saving: "Saving",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    print: "Print",
    close: "Close",
    seeDetails: "See Details",
    orderDetails: "Order Details",
    noOrders: "No orders found",
    loading: "Loading orders...",
    select: "-- Select --",
    selectName: "-- Select Name --",
    transactionNote: "Transaction no / note",
    customer: "Customer",
    employee: "Employee",
    supplier: "Supplier",
    generalLedger: "General Ledger",
    cash: "Cash",
    bank: "Bank",
    jazzCash: "JazzCash",
    easypaisa: "EasyPaisa",
    cheque: "Cheque",
    other: "Other",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    unpaid: "Unpaid",
    partial: "Partial",
    paid: "Paid",
    requiredOrderNo: "Order No required",
    requiredParty: "Customer Type and Name required",
    requiredProduct: "At least one product required",
    saved: "Order saved",
    updated: "Order updated",
    deleted: "Order deleted",
    deleteConfirm: "Delete this order?",
  },
  ur: {
    title: "سیل آرڈر",
    subtitle: "سیل آرڈرز، پروڈکٹس، پیمنٹ اور خلاصہ مینج کریں",
    newOrder: "نیا آرڈر",
    refresh: "ری فریش",
    search: "آرڈر، نام، پروڈکٹ یا پیمنٹ تلاش کریں...",
    urdu: "اردو",
    english: "English",
    summary: "خلاصہ",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    totalOrders: "کل آرڈرز",
    pendingOrders: "زیر التواء",
    completedOrders: "مکمل",
    cancelledOrders: "منسوخ",
    totalValue: "کل رقم",
    totalPaid: "ادا شدہ",
    totalRemaining: "باقی رقم",
    customerType: "کسٹمر ٹائپ",
    name: "نام",
    referenceNo: "ریفرنس نمبر",
    invoiceNo: "انوائس نمبر",
    date: "تاریخ",
    deliveryDate: "ڈیلیوری تاریخ",
    shipTo: "شپ ٹو",
    orderStatus: "آرڈر حالت",
    products: "پروڈکٹس",
    addRow: "+ نئی لائن",
    productType: "پروڈکٹ ٹائپ",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    unit: "یونٹ",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",
    payment: "پیمنٹ",
    paymentMethod: "پیمنٹ طریقہ",
    paidAmount: "ادا شدہ رقم",
    paymentStatus: "پیمنٹ حالت",
    paymentNote: "پیمنٹ نوٹ",
    previousBalance: "سابقہ بیلنس",
    deliveryCharges: "ڈیلیوری چارجز",
    discount: "ڈسکاؤنٹ",
    totalAmount: "کل رقم",
    grandTotal: "ٹوٹل بل",
    remaining: "باقی",
    save: "محفوظ کریں",
    update: "اپڈیٹ",
    saving: "محفوظ ہو رہا ہے",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    print: "پرنٹ",
    close: "بند کریں",
    seeDetails: "تفصیل",
    orderDetails: "آرڈر تفصیل",
    noOrders: "کوئی آرڈر نہیں ملا",
    loading: "آرڈرز لوڈ ہو رہے ہیں...",
    select: "-- منتخب کریں --",
    selectName: "-- نام منتخب کریں --",
    transactionNote: "ٹرانزیکشن نمبر / نوٹ",
    customer: "کسٹمر",
    employee: "ملازم",
    supplier: "سپلائر",
    generalLedger: "جنرل لیجر",
    cash: "کیش",
    bank: "بینک",
    jazzCash: "جاز کیش",
    easypaisa: "ایزی پیسہ",
    cheque: "چیک",
    other: "دیگر",
    pending: "زیر التواء",
    completed: "مکمل",
    cancelled: "منسوخ",
    unpaid: "ادا نہیں",
    partial: "جزوی",
    paid: "ادا شدہ",
    requiredOrderNo: "آرڈر نمبر ضروری ہے",
    requiredParty: "کسٹمر ٹائپ اور نام ضروری ہیں",
    requiredProduct: "کم از کم ایک پروڈکٹ ضروری ہے",
    saved: "آرڈر محفوظ ہو گیا",
    updated: "آرڈر اپڈیٹ ہو گیا",
    deleted: "آرڈر حذف ہو گیا",
    deleteConfirm: "کیا آپ یہ آرڈر حذف کرنا چاہتے ہیں؟",
  },
};

const PARTY_TYPES = [
  { value: "customer", labelKey: "customer" },
  { value: "employee", labelKey: "employee" },
  { value: "supplier", labelKey: "supplier" },
  { value: "general_ledger", labelKey: "generalLedger" },
];

const PAYMENT_METHODS = [
  { value: "Cash", labelKey: "cash" },
  { value: "Bank", labelKey: "bank" },
  { value: "JazzCash", labelKey: "jazzCash" },
  { value: "EasyPaisa", labelKey: "easypaisa" },
  { value: "Cheque", labelKey: "cheque" },
  { value: "Other", labelKey: "other" },
];

const ORDER_STATUSES = [
  { value: "Pending", labelKey: "pending" },
  { value: "Completed", labelKey: "completed" },
  { value: "Cancelled", labelKey: "cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "Unpaid", labelKey: "unpaid" },
  { value: "Partial", labelKey: "partial" },
  { value: "Paid", labelKey: "paid" },
];

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
  payment_status: "Unpaid",
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
  if (Array.isArray(value?.orders)) return value.orders;
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

const getProductName = (row) => firstText(row, ["product_name", "product_name_en", "product_item_en", "item_name", "name", "name_en", "title"]);
const getCategoryName = (row) => firstText(row, ["category_name", "category_name_en", "name", "name_en", "title"]);
const getUnitName = (row) => firstText(row, ["unit_name", "unit_name_en", "name", "name_en", "symbol", "title"]);
const getTypeName = (row) => firstText(row, ["product_type_en", "product_type", "type_name", "name", "name_en", "title"]);
const getCustomerName = (row) => firstText(row, ["customer_name_en", "customer_name", "name", "name_en", "title"]);
const getEmployeeName = (row) => firstText(row, ["employee_name", "employee_name_en", "full_name", "name", "name_en", "title"]);
const getSupplierName = (row) => firstText(row, ["supplier_name", "supplier_name_en", "vendor_name", "name", "name_en", "title"]);
const getLedgerName = (row) => firstText(row, ["ledger_name", "account_title", "account_name", "name", "name_en", "title"]);

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
const orderTotal = (items) => items.reduce((sum, item) => sum + lineTotal(item), 0);
const remainingAmount = (grand, paid) => Math.max(0, num(grand) - num(paid));

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
  if (type === "general_ledger") return String(order.general_ledger_id || order.ledger_id || order.account_id || "");
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

function statusTone(value) {
  if (value === "Paid" || value === "Completed") return "green";
  if (value === "Partial" || value === "Pending") return "yellow";
  if (value === "Unpaid" || value === "Cancelled") return "red";
  return "gray";
}

export default function SaleOrderPage() {
  const [lang, setLang] = useState("en");
  const [showSummary, setShowSummary] = useState(false);
  const t = LANG[lang];
  const isUrdu = lang === "ur";

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
    if (form.party_type === "employee") return employees.map((x) => ({ id: String(getId(x)), name: getEmployeeName(x) }));
    if (form.party_type === "supplier") return suppliers.map((x) => ({ id: String(getId(x)), name: getSupplierName(x) }));
    if (form.party_type === "general_ledger") return generalLedgers.map((x) => ({ id: String(getId(x)), name: getLedgerName(x) }));
    return customers.map((x) => ({ id: String(getId(x)), name: getCustomerName(x) }));
  }, [form.party_type, customers, employees, suppliers, generalLedgers]);

  const orderItems = form.order_items || [];
  const totalAmount = useMemo(() => orderTotal(orderItems), [orderItems]);
  const grandTotal = useMemo(
    () => totalAmount + num(form.previous_balance) + num(form.delivery_charges) - num(form.discount),
    [totalAmount, form.previous_balance, form.delivery_charges, form.discount]
  );
  const remaining = remainingAmount(grandTotal, form.paid_amount);
  const payStatus = form.payment_status || paymentStatus(grandTotal, form.paid_amount);

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

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const items = normalizeItems(order);
        const total = num(order.total_amount) || orderTotal(items);
        const grand = num(order.grand_total) || total + num(order.previous_balance) + num(order.delivery_charges) - num(order.discount);
        const paid = num(order.paid_amount);
        const remain = order.remaining_balance !== undefined ? num(order.remaining_balance) : remainingAmount(grand, paid);
        acc.total += 1;
        if (order.status === "Completed") acc.completed += 1;
        else if (order.status === "Cancelled") acc.cancelled += 1;
        else acc.pending += 1;
        acc.value += grand;
        acc.paid += paid;
        acc.remaining += remain;
        return acc;
      },
      { total: 0, pending: 0, completed: 0, cancelled: 0, value: 0, paid: 0, remaining: 0 }
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const items = normalizeItems(order);
      const itemText = items
        .map((item) => [productMap[item.product_id], categoryMap[item.category_id], typeMap[item.product_type_id], unitMap[item.unit_id]].join(" "))
        .join(" ");
      return [order.order_no, order.reference_no, getOrderPartyName(order), order.status, order.payment_status, order.payment_method, itemText]
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
      payment_status: order.payment_status || paymentStatus(order.grand_total || 0, order.paid_amount || 0),
      payment_note: order.payment_note || "",
      status: order.status || "Pending",
      order_items: normalizeItems(order).length ? normalizeItems(order) : [emptyItem()],
    });
    setDetailsOrder(null);
    setShowForm(true);
  };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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
      order_items: prev.order_items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addItem = () => setForm((prev) => ({ ...prev, order_items: [...prev.order_items, emptyItem()] }));
  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.length === 1 ? prev.order_items : prev.order_items.filter((_, i) => i !== index),
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
    if (!form.order_no.trim()) throw new Error(t.requiredOrderNo);
    if (!form.party_type || !form.party_id || !form.party_name) throw new Error(t.requiredParty);
    if (!validItems.length) throw new Error(t.requiredProduct);
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
      if (editingId) await updateSaleOrder(editingId, payload);
      else await createSaleOrder(payload);
      showToast("success", editingId ? t.updated : t.saved);
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
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteSaleOrder(id);
      showToast("success", t.deleted);
      setDetailsOrder(null);
      await loadAll();
    } catch (err) {
      showToast("error", err.message || "Delete failed.");
    }
  };

  const printOrder = (order) => {
    const items = normalizeItems(order);
    const total = num(order.total_amount) || orderTotal(items);
    const grand = num(order.grand_total) || total + num(order.previous_balance) + num(order.delivery_charges) - num(order.discount);
    const paid = num(order.paid_amount);
    const remain = order.remaining_balance !== undefined ? num(order.remaining_balance) : remainingAmount(grand, paid);
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

    const html = `<!doctype html><html><head><title>${order.order_no || "Sale Order"}</title><style>
body{font-family:Arial,sans-serif;margin:0;background:#f8fafc;color:#0f172a}.page{padding:24px}.sheet{background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden}.head{background:#0f172a;color:#fff;padding:20px}.head h1{margin:0;font-size:24px}.body{padding:18px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.box{border:1px solid #e2e8f0;border-radius:12px;padding:10px}.box small{display:block;color:#64748b;margin-bottom:6px}.box b{font-size:15px}table{width:100%;border-collapse:collapse}th{background:#1e293b;color:white;text-align:left}th,td{border:1px solid #e2e8f0;padding:9px;font-size:12px}.num{text-align:right;font-family:monospace}.totals{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style></head><body><div class="page"><div class="sheet"><div class="head"><h1>Ali Cages - ${t.title}</h1><p>${order.order_no || ""}</p></div><div class="body"><div class="grid"><div class="box"><small>${t.name}</small><b>${getOrderPartyName(order) || "-"}</b></div><div class="box"><small>${t.date}</small><b>${order.order_date || "-"}</b></div><div class="box"><small>${t.deliveryDate}</small><b>${order.delivery_date || "-"}</b></div><div class="box"><small>${t.orderStatus}</small><b>${order.status || "-"}</b></div></div><table><thead><tr><th>#</th><th>${t.product}</th><th>${t.category}</th><th>${t.productType}</th><th>${t.unit}</th><th>${t.qty}</th><th>${t.rate}</th><th>${t.amount}</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="box"><small>${t.totalAmount}</small><b>${fmt(total)}</b></div><div class="box"><small>${t.grandTotal}</small><b>${fmt(grand)}</b></div><div class="box"><small>${t.paidAmount}</small><b>${fmt(paid)}</b></div><div class="box"><small>${t.remaining}</small><b>${fmt(remain)}</b></div></div></div></div></div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="sale-page" dir={isUrdu ? "rtl" : "ltr"}>
      <style>{`
        *{box-sizing:border-box}
        .sale-page{min-height:100vh;background:linear-gradient(135deg,#eef2ff 0%,#f8fafc 48%,#f1f5f9 100%);padding:18px;color:#0f172a;font-family:${isUrdu ? "'Noto Nastaliq Urdu', Arial, sans-serif" : "Inter, Arial, sans-serif"}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes popIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes softPulse{0%,100%{box-shadow:0 12px 25px rgba(79,70,229,.22)}50%{box-shadow:0 16px 32px rgba(79,70,229,.32)}}.page-wrap{max-width:1220px;margin:0 auto}.top-card{background:rgba(255,255,255,.92);border:1px solid #dbe3ee;border-radius:22px;padding:20px 22px;box-shadow:0 18px 50px rgba(15,23,42,.08);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}.title{margin:0;font-size:30px;font-weight:950;letter-spacing:-.8px}.subtitle{margin:5px 0 0;color:#64748b;font-size:13px}.btn{border:none;border-radius:12px;padding:10px 15px;font-weight:900;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;justify-content:center;gap:6px}.btn:hover{transform:translateY(-1px);filter:brightness(.98)}.btn-primary{background:#4f46e5;color:white;box-shadow:0 12px 25px rgba(79,70,229,.28);animation:softPulse 2.4s ease-in-out infinite}.btn-summary{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe}.btn-summary-active{background:#4f46e5;color:white;border:1px solid #4f46e5;box-shadow:0 12px 25px rgba(79,70,229,.25)}.btn-soft{background:white;color:#475569;border:1px solid #cbd5e1}.btn-green{background:#dcfce7;color:#166534}.btn-red{background:#fee2e2;color:#991b1b}.btn-yellow{background:#fef9c3;color:#854d0e}.summary-panel{animation:fadeSlideDown .28s ease-out both}.summary-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;margin:14px 0}.summary-card{animation:popIn .24s ease-out both;transition:.18s}.summary-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(15,23,42,.10)}.summary-card{background:white;border:1px solid #dbe3ee;border-radius:18px;padding:14px;box-shadow:0 8px 22px rgba(15,23,42,.05)}.summary-card small{display:block;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.4px}.summary-card b{display:block;margin-top:7px;font-size:19px;font-weight:950;color:#0f172a;font-family:monospace}.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.search{width:min(440px,100%);height:42px;border:1px solid #cbd5e1;border-radius:14px;padding:0 13px;font-size:13px;outline:none;background:white}.card{background:white;border:1px solid #dbe3ee;border-radius:18px;box-shadow:0 8px 24px rgba(15,23,42,.05);overflow:hidden}.table-wrap{overflow-x:auto}table.orders{width:100%;border-collapse:collapse;table-layout:fixed}table.orders th{background:#0f172a;color:rgba(255,255,255,.78);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:12px 9px}table.orders td{padding:12px 9px;border-bottom:1px solid #eef2f7;font-size:13px}table.orders tr:hover td{background:#f8fafc}.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:flex;align-items:flex-start;justify-content:center;padding:12px;overflow:auto}.inputModalBox{width:min(1060px,100%);background:#f8fafc;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 30px 90px rgba(15,23,42,.28);overflow:hidden}.inputModalTitle{height:54px;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:17px;font-weight:900}.closeBtn{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:white;width:34px;height:32px;border-radius:10px;cursor:pointer}.inputModalBody{padding:14px}.formTopLine{display:grid;grid-template-columns:160px 260px 140px 120px 140px 140px;gap:10px;align-items:end;margin-bottom:10px}.formSecondLine{display:grid;grid-template-columns:160px 150px;gap:10px;align-items:end;margin-bottom:14px}.basicLabel{font-size:11px;color:#334155;margin-bottom:5px;display:block;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.basicInput,.basicSelect,.productInput{width:100%;height:34px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 9px;font-size:13px;border-radius:10px;outline:none;font-weight:650}.basicInput[readonly]{background:#f1f5f9}.basicInput:focus,.basicSelect:focus,.productInput:focus,.search:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.10)}.sectionHead{height:38px;background:linear-gradient(135deg,#eef2ff,#f8fafc);border:1px solid #cbd5e1;border-radius:14px 14px 0 0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;margin-top:12px;font-weight:950;color:#0f172a}.basicBtn{height:32px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 12px;font-size:12px;cursor:pointer;border-radius:10px;font-weight:850}.basicBtn:hover{background:#f8fafc}.basicBtnGreen{background:#dcfce7;border-color:#86efac;color:#166534}.basicBtnRed{background:#fee2e2;border-color:#fecaca;color:#991b1b}.basicProductTable{width:100%;border-collapse:collapse;background:white}.basicProductTable th,.basicProductTable td{border:1px solid #dbe3ee;padding:5px;font-size:12px}.basicProductTable th{background:#e2e8f0;text-align:center;color:#334155;font-weight:900}.paymentPanel{border:1px solid #cbd5e1;border-top:none;padding:12px;background:white;border-radius:0 0 14px 14px}.paymentTopGrid{display:grid;grid-template-columns:130px 1fr 130px 1fr;gap:9px 10px;align-items:center}.paymentTopGrid label{font-size:12px;color:#334155;font-weight:850}.finalTotalBar{margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.totalBox{border:1px solid #dbe3ee;background:#f8fafc;border-radius:14px;padding:10px 12px}.totalBox label{display:block;font-size:11px;color:#64748b;margin-bottom:6px;font-weight:900}.totalBox b{display:block;text-align:${isUrdu ? "left" : "right"};font-family:monospace;font-size:18px}.grandBox{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}.remainingBox{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.modalFooterBasic{padding:12px 0 0;display:flex;justify-content:flex-end;gap:8px}.toast{position:fixed;right:18px;bottom:18px;z-index:90;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 20px 50px rgba(15,23,42,.25)}.detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px}.detail-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px}.detail-box small{display:block;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase}.detail-box b{display:block;margin-top:7px}@media(max-width:1100px){.summary-grid{grid-template-columns:repeat(2,1fr)}.formTopLine{grid-template-columns:1fr 1fr}.formSecondLine{grid-template-columns:1fr 1fr}.paymentTopGrid{grid-template-columns:130px 1fr}.finalTotalBar{grid-template-columns:repeat(2,1fr)}table.orders{min-width:860px}}@media(max-width:600px){.summary-grid,.finalTotalBar{grid-template-columns:1fr}.formTopLine,.formSecondLine{grid-template-columns:1fr}.top-card{align-items:flex-start}.title{font-size:24px}}
      `}</style>

      {message.text && <div className="toast" style={{ background: message.type === "error" ? "#dc2626" : "#16a34a" }}>{message.text}</div>}

      <div className="page-wrap">
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
            <button className="btn btn-soft" onClick={() => setLang(isUrdu ? "en" : "ur")}>{isUrdu ? t.english : t.urdu}</button>
            <button
              className={`btn ${showSummary ? "btn-summary-active" : "btn-summary"}`}
              onClick={() => setShowSummary((v) => !v)}
            >
              {showSummary ? t.hideSummary : t.viewSummary}
            </button>
            <button className="btn btn-soft" onClick={loadAll}>{loading ? t.loading : t.refresh}</button>
            <button className="btn btn-primary" onClick={openAdd}>+ {t.newOrder}</button>
          </div>
        </div>

        {showSummary && (
          <div className="summary-panel">
            <div className="summary-grid">
              {[
                [t.totalOrders, summary.total],
                [t.pendingOrders, summary.pending],
                [t.completedOrders, summary.completed],
                [t.cancelledOrders, summary.cancelled],
                [t.totalValue, fmt(summary.value)],
                [t.totalPaid, fmt(summary.paid)],
                [t.totalRemaining, fmt(summary.remaining)],
              ].map(([label, value], idx) => (
                <div className="summary-card" key={label} style={{ animationDelay: `${idx * 35}ms` }}>
                  <small>{label}</small>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="toolbar">
          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} />
        </div>

        <div className="card table-wrap">
          <table className="orders">
            <thead>
              <tr>
                <th style={{ width: 45 }}>#</th>
                <th style={{ width: 130, textAlign: isUrdu ? "right" : "left" }}>{t.invoiceNo}</th>
                <th style={{ textAlign: isUrdu ? "right" : "left" }}>{t.name}</th>
                <th style={{ width: 120 }}>{t.date}</th>
                <th style={{ width: 130, textAlign: "right" }}>{t.grandTotal}</th>
                <th style={{ width: 135 }}>{t.payment}</th>
                <th style={{ width: 120 }}>{t.orderStatus}</th>
                <th style={{ width: 190 }}>{t.seeDetails}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.loading}</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.noOrders}</td></tr>
              ) : filteredOrders.map((order, index) => {
                const items = normalizeItems(order);
                const total = num(order.total_amount) || orderTotal(items);
                const grand = num(order.grand_total) || total + num(order.previous_balance) + num(order.delivery_charges) - num(order.discount);
                const paid = num(order.paid_amount);
                const pStatus = order.payment_status || paymentStatus(grand, paid);
                return (
                  <tr key={order.id || index}>
                    <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace" }}>{index + 1}</td>
                    <td><div style={{ fontFamily: "monospace", fontWeight: 900 }}>{order.order_no}</div><div style={{ color: "#94a3b8", fontSize: 11 }}>{items.length} {t.products}</div></td>
                    <td><div style={{ fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getOrderPartyName(order)}</div><div style={{ color: "#64748b", fontSize: 11 }}>{t[PARTY_TYPES.find((x) => x.value === pickOrderPartyType(order))?.labelKey || "customer"]}</div></td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", color: "#475569", fontSize: 12 }}>{order.order_date || "-"}</td>
                    <td style={{ textAlign: "right", color: "#1d4ed8", fontFamily: "monospace", fontWeight: 900 }}>{fmt(grand)}</td>
                    <td style={{ textAlign: "center" }}><span style={badgeStyle(statusTone(pStatus))}>{t[PAYMENT_STATUSES.find((x) => x.value === pStatus)?.labelKey || "unpaid"]}</span></td>
                    <td style={{ textAlign: "center" }}><span style={badgeStyle(statusTone(order.status || "Pending"))}>{t[ORDER_STATUSES.find((x) => x.value === (order.status || "Pending"))?.labelKey || "pending"]}</span></td>
                    <td style={{ textAlign: "center" }}><div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}><button className="btn btn-soft" onClick={() => setDetailsOrder(order)} style={{ padding: "7px 10px" }}>{t.seeDetails}</button><button className="btn btn-green" onClick={() => openEdit(order)} style={{ padding: "7px 10px" }}>{t.edit}</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-bg">
          <div className="inputModalBox">
            <div className="inputModalTitle">
              <span>{editingId ? t.update : t.newOrder}</span>
              <button className="closeBtn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="inputModalBody">
              <div className="formTopLine">
                <div><label className="basicLabel">{t.customerType}</label><select className="basicSelect" value={form.party_type} onChange={(e) => handlePartyTypeChange(e.target.value)}>{PARTY_TYPES.map((type) => <option key={type.value} value={type.value}>{t[type.labelKey]}</option>)}</select></div>
                <div><label className="basicLabel">{t.name} *</label><select className="basicSelect" value={form.party_id} onChange={(e) => handlePartyChange(e.target.value)}><option value="">{t.selectName}</option>{partyOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label className="basicLabel">{t.referenceNo}</label><input className="basicInput" value={form.reference_no} onChange={(e) => updateForm("reference_no", e.target.value)} /></div>
                <div><label className="basicLabel">{t.invoiceNo}</label><input className="basicInput" value={form.order_no} onChange={(e) => updateForm("order_no", e.target.value)} /></div>
                <div><label className="basicLabel">{t.date}</label><input type="date" className="basicInput" value={form.order_date} onChange={(e) => updateForm("order_date", e.target.value)} /></div>
                <div><label className="basicLabel">{t.deliveryDate}</label><input type="date" className="basicInput" value={form.delivery_date} onChange={(e) => updateForm("delivery_date", e.target.value)} /></div>
              </div>
              <div className="formSecondLine">
                <div><label className="basicLabel">{t.shipTo}</label><input className="basicInput" value={form.shipment_to} onChange={(e) => updateForm("shipment_to", e.target.value)} /></div>
                <div><label className="basicLabel">{t.orderStatus}</label><select className="basicSelect" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>{ORDER_STATUSES.map((status) => <option key={status.value} value={status.value}>{t[status.labelKey]}</option>)}</select></div>
              </div>

              <div className="sectionHead"><span>{t.products}</span><button className="basicBtn" onClick={addItem}>{t.addRow}</button></div>
              <div style={{ overflowX: "auto" }}>
                <table className="basicProductTable">
                  <thead><tr><th style={{ width: 35 }}>#</th><th>{t.productType}</th><th>{t.category}</th><th>{t.product} *</th><th>{t.unit}</th><th style={{ width: 70 }}>{t.qty} *</th><th style={{ width: 90 }}>{t.rate}</th><th style={{ width: 90 }}>{t.amount}</th><th style={{ width: 35 }}></th></tr></thead>
                  <tbody>{form.order_items.map((item, index) => <tr key={index}><td style={{ textAlign: "center" }}>{index + 1}</td><td><select className="productInput" value={item.product_type_id} onChange={(e) => updateItem(index, "product_type_id", e.target.value)}><option value="">{t.select}</option>{types.map((x) => <option key={getId(x)} value={getId(x)}>{getTypeName(x)}</option>)}</select></td><td><select className="productInput" value={item.category_id} onChange={(e) => updateItem(index, "category_id", e.target.value)}><option value="">{t.select}</option>{categories.map((x) => <option key={getId(x)} value={getId(x)}>{getCategoryName(x)}</option>)}</select></td><td><select className="productInput" value={item.product_id} onChange={(e) => updateItem(index, "product_id", e.target.value)}><option value="">{t.select}</option>{products.map((x) => <option key={getId(x)} value={getId(x)}>{getProductName(x)}</option>)}</select></td><td><select className="productInput" value={item.unit_id} onChange={(e) => updateItem(index, "unit_id", e.target.value)}><option value="">{t.select}</option>{units.map((x) => <option key={getId(x)} value={getId(x)}>{getUnitName(x)}</option>)}</select></td><td><input type="number" className="productInput" style={{ textAlign: "right" }} value={item.order_qty} onChange={(e) => updateItem(index, "order_qty", e.target.value)} /></td><td><input type="number" className="productInput" style={{ textAlign: "right" }} value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} /></td><td><input readOnly className="productInput" style={{ textAlign: "right", background: "#eee", fontWeight: 600 }} value={fmt(lineTotal(item))} /></td><td style={{ textAlign: "center" }}><button className="basicBtn basicBtnRed" style={{ width: 22, padding: 0 }} onClick={() => removeItem(index)}>x</button></td></tr>)}</tbody>
                </table>
              </div>

              <div className="sectionHead"><span>{t.payment}</span></div>
              <div className="paymentPanel">
                <div className="paymentTopGrid">
                  <label>{t.paymentMethod}</label><select className="basicSelect" value={form.payment_method} onChange={(e) => updateForm("payment_method", e.target.value)}>{PAYMENT_METHODS.map((method) => <option key={method.value} value={method.value}>{t[method.labelKey]}</option>)}</select>
                  <label>{t.paidAmount}</label><input type="number" className="basicInput" value={form.paid_amount} onChange={(e) => { const paidValue = e.target.value; updateForm("paid_amount", paidValue); updateForm("payment_status", paymentStatus(grandTotal, paidValue)); }} />
                  <label>{t.paymentStatus}</label><select className="basicSelect" value={form.payment_status || payStatus} onChange={(e) => updateForm("payment_status", e.target.value)}>{PAYMENT_STATUSES.map((x) => <option key={x.value} value={x.value}>{t[x.labelKey]}</option>)}</select>
                  <label>{t.paymentNote}</label><input className="basicInput" placeholder={t.transactionNote} value={form.payment_note} onChange={(e) => updateForm("payment_note", e.target.value)} />
                  <label>{t.previousBalance}</label><input type="number" className="basicInput" value={form.previous_balance} onChange={(e) => updateForm("previous_balance", e.target.value)} />
                  <label>{t.deliveryCharges}</label><input type="number" className="basicInput" value={form.delivery_charges} onChange={(e) => updateForm("delivery_charges", e.target.value)} />
                  <label>{t.discount}</label><input type="number" className="basicInput" value={form.discount} onChange={(e) => updateForm("discount", e.target.value)} />
                </div>
                <div className="finalTotalBar">
                  <div className="totalBox"><label>{t.totalAmount}</label><b>{fmt(totalAmount)}</b></div>
                  <div className="totalBox grandBox"><label>{t.grandTotal}</label><b>{fmt(grandTotal)}</b></div>
                  <div className="totalBox"><label>{t.paidAmount}</label><b>{fmt(form.paid_amount)}</b></div>
                  <div className="totalBox remainingBox"><label>{t.remaining}</label><b>{fmt(remaining)}</b></div>
                </div>
              </div>
              <div className="modalFooterBasic"><button className="basicBtn" onClick={() => setShowForm(false)}>{t.cancel}</button><button className="basicBtn basicBtnGreen" onClick={handleSave} disabled={submitting}>{submitting ? t.saving : editingId ? t.update : t.save}</button></div>
            </div>
          </div>
        </div>
      )}

      {detailsOrder && (() => {
        const items = normalizeItems(detailsOrder);
        const total = num(detailsOrder.total_amount) || orderTotal(items);
        const grand = num(detailsOrder.grand_total) || total + num(detailsOrder.previous_balance) + num(detailsOrder.delivery_charges) - num(detailsOrder.discount);
        const paid = num(detailsOrder.paid_amount);
        const remain = detailsOrder.remaining_balance !== undefined ? num(detailsOrder.remaining_balance) : remainingAmount(grand, paid);
        const pStatus = detailsOrder.payment_status || paymentStatus(grand, paid);
        return <div className="modal-bg"><div className="inputModalBox" style={{ width: "min(980px,100%)" }}><div className="inputModalTitle"><span>{t.orderDetails}</span><button className="closeBtn" onClick={() => setDetailsOrder(null)}>×</button></div><div className="inputModalBody"><div className="detail-grid">{[[t.name, getOrderPartyName(detailsOrder)], [t.date, detailsOrder.order_date || "-"], [t.deliveryDate, detailsOrder.delivery_date || "-"], [t.orderStatus, t[ORDER_STATUSES.find((x) => x.value === (detailsOrder.status || "Pending"))?.labelKey || "pending"]], [t.grandTotal, fmt(grand)], [t.paidAmount, fmt(paid)], [t.remaining, fmt(remain)], [t.paymentStatus, t[PAYMENT_STATUSES.find((x) => x.value === pStatus)?.labelKey || "unpaid"]]].map(([label, value]) => <div key={label} className="detail-box"><small>{label}</small><b>{value}</b></div>)}</div><div className="table-wrap card"><table className="orders" style={{ minWidth: 760 }}><thead><tr><th>#</th><th style={{ textAlign: isUrdu ? "right" : "left" }}>{t.product}</th><th>{t.category}</th><th>{t.productType}</th><th>{t.unit}</th><th>{t.qty}</th><th>{t.rate}</th><th>{t.amount}</th></tr></thead><tbody>{items.map((item, idx) => <tr key={idx}><td style={{ textAlign: "center" }}>{idx + 1}</td><td>{productMap[item.product_id] || item.product_id}</td><td style={{ textAlign: "center" }}>{categoryMap[item.category_id] || item.category_id}</td><td style={{ textAlign: "center" }}>{typeMap[item.product_type_id] || item.product_type_id}</td><td style={{ textAlign: "center" }}>{unitMap[item.unit_id] || item.unit_id}</td><td style={{ textAlign: "center" }}>{fmt(item.order_qty)}</td><td style={{ textAlign: "center" }}>{fmt(item.rate)}</td><td style={{ textAlign: "right", fontWeight: 900 }}>{fmt(lineTotal(item))}</td></tr>)}</tbody></table></div></div><div style={{ padding: 14, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><button className="btn btn-soft" onClick={() => setDetailsOrder(null)}>{t.close}</button><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn btn-green" onClick={() => openEdit(detailsOrder)}>{t.edit}</button><button className="btn btn-yellow" onClick={() => printOrder(detailsOrder)}>{t.print}</button><button className="btn btn-red" onClick={() => handleDelete(detailsOrder.id)}>{t.delete}</button></div></div></div></div>;
      })()}
    </div>
  );
}
