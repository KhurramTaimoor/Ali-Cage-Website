import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const SALE_ORDER_API = "/api/sale-orders";
const SALES_INVOICE_API = "/api/sales-invoices";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

const getSaleOrderPageData = () => apiFetch(SALE_ORDER_API);
const getSaleOrderById = (id) => apiFetch(`${SALE_ORDER_API}/${id}`);

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

const createSalesInvoice = (data) =>
  apiFetch(SALES_INVOICE_API, {
    method: "POST",
    body: JSON.stringify(data),
  });

const LANG = {
  en: {
    title: "Sale Order",
    subtitle: "Manage sale orders, products, payments and summaries",
    newOrder: "New Order",
    refresh: "Refresh",
    search: "Search order, party, product, payment...",
    urdu: "اردو",
    english: "English",
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
    invoiceNo: "Inv#",
    date: "Date",
    deliveryDate: "Delivery Date",
    shipTo: "Ship To",
    orderStatus: "Status",

    products: "Products",
    addRow: "+ Add Row",
    productType: "Product Type",
    category: "Category",
    product: "Product",
    productDescription: "Product Description",
    unit: "Unit",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",

    payment: "Payment",
    paymentMethod: "Payment Method",
    advanceReceive: "Advance Receive",
    paidAmount: "Payment Received",
    paymentReceived: "Payment Received",
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
    action: "Action",
    actions: "Action",
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

    printOptions: "Print Options",
    saleOrderPrint: "Sales Order",
    orderInvoicePrint: "Order Invoice",
    withAmount: "With Amount",
    withoutAmount: "Without Amount",
    convertToInvoice: "Make Sales Invoice",
    printAll: "Print All Orders",
    allSaleOrders: "All Sale Orders",
    noOrdersToPrint: "No orders available to print",
    invoiceCreated: "Sales invoice created successfully",
    invoiceCreateError: "Sales invoice could not be created",
    alreadyInvoice: "Invoice already created for this order",
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
    orderStatus: "حالت",

    products: "پروڈکٹس",
    addRow: "+ نئی لائن",
    productType: "پروڈکٹ ٹائپ",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    productDescription: "پروڈکٹ تفصیل",
    unit: "یونٹ",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",

    payment: "پیمنٹ",
    paymentMethod: "پیمنٹ طریقہ",
    advanceReceive: "ایڈوانس وصول",
    paidAmount: "پیمنٹ وصول",
    paymentReceived: "پیمنٹ وصول",
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
    action: "ایکشن",
    actions: "ایکشن",
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

    printOptions: "پرنٹ آپشنز",
    saleOrderPrint: "سیلز آرڈر",
    orderInvoicePrint: "آرڈر انوائس",
    withAmount: "رقم کے ساتھ",
    withoutAmount: "رقم کے بغیر",
    convertToInvoice: "سیلز انوائس بنائیں",
    printAll: "تمام آرڈرز پرنٹ",
    allSaleOrders: "تمام سیل آرڈرز",
    noOrdersToPrint: "پرنٹ کے لیے کوئی آرڈر موجود نہیں",
    invoiceCreated: "سیلز انوائس کامیابی سے بن گئی",
    invoiceCreateError: "سیلز انوائس نہیں بن سکی",
    alreadyInvoice: "اس آرڈر کی انوائس پہلے بن چکی ہے",
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

const emptyItem = (defaultProductTypeId = "") => ({
  product_description: "",
  product_type_id: defaultProductTypeId,
  category_id: "",
  product_id: "",
  unit_id: "",
  order_qty: "",
  rate: "",
  debit: "0",
  credit: "0",
});

const defaultOrderItems = (count = 5, defaultProductTypeId = "") =>
  Array.from({ length: count }, () => emptyItem(defaultProductTypeId));

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
  order_items: defaultOrderItems(5),
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
  if (Array.isArray(value?.items)) return value.items;
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
    if (
      row?.[key] !== undefined &&
      row?.[key] !== null &&
      String(row[key]).trim()
    ) {
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

const getProductDescription = (row) =>
  firstText(
    row,
    [
      "product_description",
      "product_description_en",
      "description",
      "details",
      "product_details",
      "remarks",
    ],
    ""
  );

const getProductRate = (row) =>
  num(
    row?.sale_rate ??
      row?.saleRate ??
      row?.rate ??
      row?.price ??
      row?.sale_price ??
      row?.retail_price ??
      row?.product_rate ??
      row?.productRate ??
      row?.unit_price ??
      0
  );

const getProductCategoryId = (row) =>
  row?.category_id ??
  row?.categoryId ??
  row?.cat_id ??
  row?.product_category_id ??
  row?.category?.id ??
  row?.category ??
  "";

const getProductTypeId = (row) =>
  row?.product_type_id ??
  row?.productTypeId ??
  row?.type_id ??
  row?.typeId ??
  row?.product_type?.id ??
  row?.type ??
  "";

const getProductUnitId = (row) =>
  row?.unit_id ?? row?.unitId ?? row?.unit?.id ?? row?.unit ?? "";

const getCategoryName = (row) =>
  firstText(row, ["category_name", "category_name_en", "name", "name_en", "title"]);

const getUnitName = (row) =>
  firstText(row, ["unit_name", "unit_name_en", "name", "name_en", "symbol", "title"]);

const getTypeName = (row) =>
  firstText(row, [
    "product_type_en",
    "product_type",
    "type_name",
    "name",
    "name_en",
    "title",
  ]);

const getCustomerName = (row) =>
  firstText(row, ["customer_name_en", "customer_name", "name", "name_en", "title"]);

const getEmployeeName = (row) =>
  firstText(row, [
    "employee_name",
    "employee_name_en",
    "full_name",
    "name",
    "name_en",
    "title",
  ]);

const getSupplierName = (row) =>
  firstText(row, [
    "supplier_name",
    "supplier_name_en",
    "vendor_name",
    "name",
    "name_en",
    "title",
  ]);

const getLedgerName = (row) =>
  firstText(row, [
    "ledger_name",
    "account_title",
    "account_name",
    "name",
    "name_en",
    "title",
  ]);

const getDefaultFmsTypeId = (list = []) => {
  const found =
    list.find((row) => String(getTypeName(row)).trim().toLowerCase() === "fms") ||
    list.find((row) =>
      String(getTypeName(row)).trim().toLowerCase().includes("fms")
    );

  return found ? String(getId(found)) : "";
};

const getPreviousBalance = (row) => {
  if (!row) return 0;

  const keys = [
    "previous_balance",
    "previousBalance",
    "prev_balance",
    "prevBalance",
    "opening_balance",
    "openingBalance",
    "balance",
    "current_balance",
    "currentBalance",
    "closing_balance",
    "closingBalance",
    "ledger_balance",
    "ledgerBalance",
    "account_balance",
    "accountBalance",
    "old_balance",
    "oldBalance",
    "remaining_balance",
    "remainingBalance",
    "due_balance",
    "dueBalance",
    "payable",
    "receivable",
  ];

  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null &&
      String(row[key]).trim() !== ""
    ) {
      return num(row[key]);
    }
  }

  const debit = num(
    row.debit || row.total_debit || row.debit_amount || row.dr || row.total_dr
  );
  const credit = num(
    row.credit ||
      row.total_credit ||
      row.credit_amount ||
      row.cr ||
      row.total_cr
  );

  if (debit || credit) return debit - credit;
  return 0;
};

const makePartyOption = (row, nameGetter) => ({
  id: String(getId(row)),
  name: nameGetter(row),
  previous_balance: getPreviousBalance(row),
});

function normalizeItems(order) {
  let items =
    order?.order_items ??
    order?.items ??
    order?.invoice_items ??
    order?.sale_order_items ??
    order?.sales_order_items ??
    order?.products ??
    [];

  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  if (items && !Array.isArray(items) && Array.isArray(items.data)) {
    items = items.data;
  }

  if (!Array.isArray(items) || !items.length) return [];

  return items.map((item) => ({
    product_description: String(
      item.product_description ??
        item.description ??
        item.productDescription ??
        item.details ??
        ""
    ),
    product_type_id: String(
      item.product_type_id ??
        item.productTypeId ??
        item.type_id ??
        item.product_type?.id ??
        ""
    ),
    category_id: String(
      item.category_id ??
        item.categoryId ??
        item.cat_id ??
        item.category?.id ??
        ""
    ),
    product_id: String(
      item.product_id ??
        item.productId ??
        item.product?.id ??
        item.item_id ??
        ""
    ),
    unit_id: String(item.unit_id ?? item.unitId ?? item.unit?.id ?? ""),
    order_qty: String(
      item.order_qty ??
        item.qty ??
        item.quantity ??
        item.sale_qty ??
        item.invoice_qty ??
        ""
    ),
    rate: String(
      item.rate ?? item.sale_rate ?? item.price ?? item.unit_price ?? ""
    ),
    debit: String(item.debit ?? "0"),
    credit: String(item.credit ?? "0"),
  }));
}

const lineTotal = (item) => num(item.order_qty) * num(item.rate);

const orderTotal = (items) =>
  items.reduce((sum, item) => sum + lineTotal(item), 0);

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

function generateInvoiceNoFromOrder(order) {
  const base = String(order?.order_no || order?.id || Date.now()).replace(
    /\s+/g,
    "-"
  );

  return `SI-${base}`;
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
    return String(
      order.general_ledger_id || order.ledger_id || order.account_id || ""
    );
  }

  return String(order.customer_id || "");
}

const badgeStyle = (tone) => {
  const tones = {
    green: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    yellow: {
      background: "#fef9c3",
      color: "#854d0e",
      border: "1px solid #fde68a",
    },
    red: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    blue: {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    gray: {
      background: "#f1f5f9",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
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
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const productMap = useMemo(() => makeMap(products, getProductName), [products]);
  const categoryMap = useMemo(() => makeMap(categories, getCategoryName), [categories]);
  const typeMap = useMemo(() => makeMap(types, getTypeName), [types]);
  const unitMap = useMemo(() => makeMap(units, getUnitName), [units]);
  const defaultFmsTypeId = useMemo(() => getDefaultFmsTypeId(types), [types]);

  const partyOptions = useMemo(() => {
    if (form.party_type === "employee") {
      return employees.map((x) => makePartyOption(x, getEmployeeName));
    }

    if (form.party_type === "supplier") {
      return suppliers.map((x) => makePartyOption(x, getSupplierName));
    }

    if (form.party_type === "general_ledger") {
      return generalLedgers.map((x) => makePartyOption(x, getLedgerName));
    }

    return customers.map((x) => makePartyOption(x, getCustomerName));
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
  const payStatus = form.payment_status || paymentStatus(grandTotal, form.paid_amount);

  const getOrderPartyName = useCallback(
    (order) => {
      const type = pickOrderPartyType(order);
      const id = pickOrderPartyId(order);
      const fallback =
        order.party_name || order.customer_name_en || order.customer_name || "";

      if (type === "employee") return makeMap(employees, getEmployeeName)[id] || fallback;
      if (type === "supplier") return makeMap(suppliers, getSupplierName)[id] || fallback;
      if (type === "general_ledger") {
        return makeMap(generalLedgers, getLedgerName)[id] || fallback;
      }

      return makeMap(customers, getCustomerName)[id] || fallback;
    },
    [customers, employees, suppliers, generalLedgers]
  );

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
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
      setGeneralLedgers(
        getList(dropdowns.general_ledgers || dropdowns.generalLedgers)
      );
    } catch (err) {
      showToast("error", err.message || "Failed to load sale orders.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!defaultFmsTypeId) return;

    setForm((prev) => ({
      ...prev,
      order_items: (prev.order_items || []).map((item) =>
        item.product_type_id
          ? item
          : { ...item, product_type_id: defaultFmsTypeId }
      ),
    }));
  }, [defaultFmsTypeId]);

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const items = normalizeItems(order);
        const total = num(order.total_amount) || orderTotal(items);
        const grand =
          num(order.grand_total) ||
          total +
            num(order.previous_balance) +
            num(order.delivery_charges) -
            num(order.discount);
        const paid = num(order.paid_amount);
        const remain =
          order.remaining_balance !== undefined
            ? num(order.remaining_balance)
            : remainingAmount(grand, paid);

        acc.total += 1;

        if (order.status === "Completed") acc.completed += 1;
        else if (order.status === "Cancelled") acc.cancelled += 1;
        else acc.pending += 1;

        acc.value += grand;
        acc.paid += paid;
        acc.remaining += remain;

        return acc;
      },
      {
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        value: 0,
        paid: 0,
        remaining: 0,
      }
    );
  }, [orders]);

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
        order.shipment_to,
        order.status,
        order.payment_status,
        order.payment_method,
        itemText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [
    orders,
    search,
    productMap,
    categoryMap,
    typeMap,
    unitMap,
    getOrderPartyName,
  ]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm(),
      order_no: generateOrderNo(orders),
      order_items: defaultOrderItems(5, defaultFmsTypeId),
    });
    setShowForm(true);
  };

  const openEdit = (order) => {
    const partyType = pickOrderPartyType(order);
    const partyId = pickOrderPartyId(order);
    const items = normalizeItems(order);

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
      payment_status:
        order.payment_status || paymentStatus(order.grand_total || 0, order.paid_amount || 0),
      payment_note: order.payment_note || "",
      status: order.status || "Pending",
      order_items: items.length
        ? items.map((item) => ({
            ...item,
            product_type_id: item.product_type_id || defaultFmsTypeId,
          }))
        : defaultOrderItems(5, defaultFmsTypeId),
    });

    setDetailsOrder(null);
    setShowForm(true);
  };

  const updateForm = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

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
      previous_balance: "0",
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
      previous_balance: id ? String(selected?.previous_balance ?? 0) : "0",
    }));
  };

  const updateItem = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.map((item, i) => {
        if (i !== index) return item;

        if (key === "product_id") {
          const selectedProduct = products.find(
            (p) => String(getId(p)) === String(value)
          );

          const productRate = getProductRate(selectedProduct);

          return {
            ...item,
            product_id: value,
            product_description:
              getProductDescription(selectedProduct) ||
              item.product_description ||
              "",
            product_type_id: String(
              getProductTypeId(selectedProduct) ||
                item.product_type_id ||
                defaultFmsTypeId ||
                ""
            ),
            category_id: String(
              getProductCategoryId(selectedProduct) || item.category_id || ""
            ),
            unit_id: String(
              getProductUnitId(selectedProduct) || item.unit_id || ""
            ),
            rate: String(productRate || ""),
          };
        }

        return { ...item, [key]: value };
      }),
    }));
  };

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      order_items: [...prev.order_items, emptyItem(defaultFmsTypeId)],
    }));

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      order_items:
        prev.order_items.length === 1
          ? prev.order_items
          : prev.order_items.filter((_, i) => i !== index),
    }));
  };

  const stepDeliveryCharges = (delta) => {
    setForm((prev) => ({
      ...prev,
      delivery_charges: String(num(prev.delivery_charges) + delta),
    }));
  };

  const preparePayload = () => {
    const validItems = form.order_items
      .map((item) => ({
        product_description: String(item.product_description || "").trim(),
        description: String(item.product_description || "").trim(),
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

    if (!form.party_type || !form.party_id || !form.party_name) {
      throw new Error(t.requiredParty);
    }

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
      general_ledger_id:
        form.party_type === "general_ledger" ? Number(form.party_id) : null,
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

  const handleConvertToInvoice = async (order) => {
    try {
      setSubmitting(true);

      let fullOrder = order;

      let items = normalizeItems(fullOrder).filter(
        (item) => Number(item.product_id) > 0 && num(item.order_qty) > 0
      );

      if (!items.length && order?.id) {
        try {
          const detailRes = await getSaleOrderById(order.id);
          fullOrder = detailRes?.data || detailRes?.order || detailRes;

          items = normalizeItems(fullOrder).filter(
            (item) => Number(item.product_id) > 0 && num(item.order_qty) > 0
          );
        } catch {
          fullOrder = order;
        }
      }

      if (!items.length) {
        showToast("error", t.requiredProduct);
        return;
      }

      const alreadyCreated =
        fullOrder.sales_invoice_id ||
        fullOrder.sale_invoice_id ||
        fullOrder.generated_invoice_id ||
        fullOrder.sales_invoice_no ||
        fullOrder.sale_invoice_no ||
        fullOrder.invoice_id;

      if (alreadyCreated) {
        showToast("error", t.alreadyInvoice);
        return;
      }

      const partyType = pickOrderPartyType(fullOrder) || "customer";

      const partyId = Number(
        pickOrderPartyId(fullOrder) || fullOrder.party_id || 0
      );

      const invoiceItems = items.map((item, index) => {
        const qty = num(item.order_qty);
        const rate = num(item.rate);
        const amount = qty * rate;

        return {
          sr: index + 1,
          product_description: String(item.product_description || "").trim(),
          description: String(item.product_description || "").trim(),
          product_type_id: Number(item.product_type_id) || 0,
          category_id: Number(item.category_id) || 0,
          product_id: Number(item.product_id) || 0,
          unit_id: Number(item.unit_id) || 0,
          sale_type: "single",
          carton_qty: 0,
          pieces_qty: 0,
          pieces_per_carton: 0,
          qty,
          quantity: qty,
          order_qty: qty,
          rate,
          sale_rate: rate,
          amount,
          total_amount: amount,
        };
      });

      const invoiceTotal = invoiceItems.reduce(
        (sum, item) => sum + num(item.amount),
        0
      );

      const grand =
        invoiceTotal +
        num(fullOrder.previous_balance) +
        num(fullOrder.delivery_charges) -
        num(fullOrder.discount);

      const paid = num(fullOrder.paid_amount);
      const remain = remainingAmount(grand, paid);

      const payload = {
        invoice_no: generateInvoiceNoFromOrder(fullOrder),
        reference_no: fullOrder.reference_no || fullOrder.order_no || "",
        customer_type: partyType,
        party_type: partyType,
        party_id: partyId || null,
        party_name: getOrderPartyName(fullOrder),
        customer_name_en: getOrderPartyName(fullOrder),
        customer_id: partyType === "customer" ? partyId || null : null,
        employee_id: partyType === "employee" ? partyId || null : null,
        supplier_id: partyType === "supplier" ? partyId || null : null,
        general_ledger_id:
          partyType === "general_ledger" ? partyId || null : null,
        invoice_date: today(),
        shipment_to: fullOrder.shipment_to || "",
        previous_balance: num(fullOrder.previous_balance),
        delivery_charges: num(fullOrder.delivery_charges),
        discount: num(fullOrder.discount),
        invoice_total: invoiceTotal,
        total_amount: invoiceTotal,
        grand_total: grand,
        payment_method: fullOrder.payment_method || "Cash",
        paid_amount: paid,
        remaining_balance: remain,
        payment_status: fullOrder.payment_status || paymentStatus(grand, paid),
        payment_note: fullOrder.payment_note || "",
        sale_order_id: fullOrder.id,
        items: invoiceItems,
        invoice_items: invoiceItems,
        sales_invoice_items: invoiceItems,
      };

      await createSalesInvoice(payload);

      showToast("success", t.invoiceCreated);
      setDetailsOrder(null);
      await loadAll();
    } catch (err) {
      showToast("error", err.message || t.invoiceCreateError);
    } finally {
      setSubmitting(false);
    }
  };

  const printOrderDocument = (order, documentType = "sale_order", showAmount = true) => {
    const items = normalizeItems(order);

    const total = num(order.total_amount) || orderTotal(items);

    const grand =
      num(order.grand_total) ||
      total +
        num(order.previous_balance) +
        num(order.delivery_charges) -
        num(order.discount);

    const paid = num(order.paid_amount);

    const remain =
      order.remaining_balance !== undefined
        ? num(order.remaining_balance)
        : remainingAmount(grand, paid);

    const documentTitle =
      documentType === "order_invoice" ? t.orderInvoicePrint : t.saleOrderPrint;

    const amountHead = showAmount ? `<th>${t.rate}</th><th>${t.amount}</th>` : "";

    const rows = items
      .map((item, idx) => {
        const amountCells = showAmount
          ? `<td class="num">${fmt(item.rate)}</td><td class="num strong">${fmt(
              lineTotal(item)
            )}</td>`
          : "";

        return `
          <tr>
            <td class="center">${idx + 1}</td>
            <td>
              ${productMap[item.product_id] || item.product_id}
              ${
                item.product_description
                  ? `<div style="font-size:10px;color:#64748b;margin-top:3px">${item.product_description}</div>`
                  : ""
              }
            </td>
            <td>${categoryMap[item.category_id] || item.category_id}</td>
            <td>${typeMap[item.product_type_id] || item.product_type_id}</td>
            <td>${unitMap[item.unit_id] || item.unit_id}</td>
            <td class="num">${fmt(item.order_qty)}</td>
            ${amountCells}
          </tr>
        `;
      })
      .join("");

    const totalsHtml = showAmount
      ? `
        <div class="totals">
          <div class="box"><small>${t.totalAmount}</small><b>${fmt(total)}</b></div>
          <div class="box"><small>${t.previousBalance}</small><b>${fmt(
            order.previous_balance
          )}</b></div>
          <div class="box"><small>${t.deliveryCharges}</small><b>${fmt(
            order.delivery_charges
          )}</b></div>
          <div class="box"><small>${t.discount}</small><b>${fmt(order.discount)}</b></div>
          <div class="box grand"><small>${t.grandTotal}</small><b>${fmt(grand)}</b></div>
          <div class="box"><small>${t.paidAmount}</small><b>${fmt(paid)}</b></div>
          <div class="box"><small>${t.remaining}</small><b>${fmt(remain)}</b></div>
        </div>
      `
      : `<div class="note">${
          isUrdu ? "یہ پرنٹ رقم کے بغیر ہے۔" : "This print is without amount."
        }</div>`;

    const html = `<!doctype html>
<html lang="${isUrdu ? "ur" : "en"}" dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<title>${documentTitle} - ${order.order_no || ""}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{font-family:${
      isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial,sans-serif"
    };margin:0;background:#f8fafc;color:#0f172a}
.page{padding:18px}
.sheet{background:#fff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
.head{background:#111827;color:#fff;padding:18px 22px;display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
.head h1{margin:0;font-size:24px;font-weight:900}
.head p{margin:5px 0 0;color:rgba(255,255,255,.75);font-size:12px}
.meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;line-height:1.9}
.body{padding:16px}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:12px}
.box{border:1px solid #dbe3ee;border-radius:10px;padding:9px;background:#fff}
.box small{display:block;color:#64748b;margin-bottom:5px;font-size:10px;font-weight:900;text-transform:uppercase}
.box b{font-size:13px;font-weight:900}
table{width:100%;border-collapse:collapse}
th{background:#1f2937;color:white;text-align:${
      isUrdu ? "right" : "left"
    };font-size:11px;text-transform:uppercase}
th,td{border:1px solid #dbe3ee;padding:8px;font-size:12px}
.center{text-align:center}
.num{text-align:${isUrdu ? "left" : "right"};font-family:monospace;white-space:nowrap}
.strong{font-weight:900}
.totals{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:12px}
.totals .grand{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}
.note{margin-top:12px;border:1px dashed #cbd5e1;border-radius:12px;padding:10px;background:#f8fafc;color:#475569;font-weight:800}
.footer{padding:10px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#64748b}
@media print{@page{size:A4 landscape;margin:8mm}body{background:white}.page{padding:0}.sheet{border:none;border-radius:0;box-shadow:none}.footer{position:fixed;bottom:0;left:0;right:0}}
</style>
</head>
<body>
<div class="page"><div class="sheet">
<div class="head">
<div><h1>Ali Cages</h1><p>${documentTitle}</p></div>
<div class="meta">
<div>${t.invoiceNo}: <b>${order.order_no || "-"}</b></div>
<div>${t.date}: ${order.order_date || "-"}</div>
<div>${t.deliveryDate}: ${order.delivery_date || "-"}</div>
</div>
</div>
<div class="body">
<div class="grid">
<div class="box"><small>${t.name}</small><b>${getOrderPartyName(order) || "-"}</b></div>
<div class="box"><small>${t.customerType}</small><b>${
      t[PARTY_TYPES.find((x) => x.value === pickOrderPartyType(order))?.labelKey || "customer"]
    }</b></div>
<div class="box"><small>${t.referenceNo}</small><b>${order.reference_no || "-"}</b></div>
<div class="box"><small>${t.shipTo}</small><b>${order.shipment_to || "-"}</b></div>
<div class="box"><small>${t.orderStatus}</small><b>${
      t[
        ORDER_STATUSES.find((x) => x.value === (order.status || "Pending"))
          ?.labelKey || "pending"
      ]
    }</b></div>
<div class="box"><small>${t.paymentStatus}</small><b>${
      t[
        PAYMENT_STATUSES.find(
          (x) => x.value === (order.payment_status || paymentStatus(grand, paid))
        )?.labelKey || "unpaid"
      ]
    }</b></div>
</div>
<table>
<thead>
<tr>
<th class="center">#</th>
<th>${t.product}</th>
<th>${t.category}</th>
<th>${t.productType}</th>
<th>${t.unit}</th>
<th>${t.qty}</th>
${amountHead}
</tr>
</thead>
<tbody>${rows}</tbody>
</table>
${totalsHtml}
</div>
<div class="footer">
<span>${documentTitle}</span>
<span>${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</span>
</div>
</div></div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body></html>`;

    const w = window.open("", "_blank", "width=1200,height=850");
    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const printAllSaleOrders = () => {
    if (!orders.length) {
      showToast("error", t.noOrdersToPrint);
      return;
    }

    const totalValue = orders.reduce((sum, order) => {
      const items = normalizeItems(order);
      const total = num(order.total_amount) || orderTotal(items);

      const grand =
        num(order.grand_total) ||
        total +
          num(order.previous_balance) +
          num(order.delivery_charges) -
          num(order.discount);

      return sum + grand;
    }, 0);

    const rows = orders
      .map((order, idx) => {
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

        return `
          <tr>
            <td class="center">${idx + 1}</td>
            <td>${order.order_date || "-"}</td>
            <td>${order.order_no || "-"}</td>
            <td>${getOrderPartyName(order) || "-"}</td>
            <td>${order.shipment_to || "-"}</td>
            <td class="num">${fmt(grand)}</td>
            <td>${
              t[
                PAYMENT_STATUSES.find((x) => x.value === pStatus)?.labelKey ||
                  "unpaid"
              ]
            }</td>
            <td>${
              t[
                ORDER_STATUSES.find((x) => x.value === (order.status || "Pending"))
                  ?.labelKey || "pending"
              ]
            }</td>
          </tr>
        `;
      })
      .join("");

    const html = `<!doctype html>
<html lang="${isUrdu ? "ur" : "en"}" dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<title>${t.allSaleOrders}</title>
<style>
*{box-sizing:border-box}
body{font-family:${isUrdu ? "serif" : "Arial,sans-serif"};margin:0;background:#f8fafc;color:#111827}
.page{padding:18px}
.sheet{background:#fff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden}
.head{background:#111827;color:#fff;padding:18px 22px;display:flex;justify-content:space-between}
.head h1{margin:0;font-size:24px;font-weight:900}
.head p{margin:5px 0 0;color:rgba(255,255,255,.75);font-size:12px}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:14px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
.box{border:1px solid #dbe3ee;border-radius:10px;padding:9px;background:#fff}
.box small{display:block;color:#64748b;margin-bottom:5px;font-size:10px;font-weight:900;text-transform:uppercase}
.box b{font-size:13px;font-weight:900}
.body{padding:14px}
table{width:100%;border-collapse:collapse}
th{background:#1f2937;color:white;text-align:${isUrdu ? "right" : "left"};font-size:11px;text-transform:uppercase}
th,td{border:1px solid #dbe3ee;padding:8px;font-size:12px}
.center{text-align:center}
.num{text-align:${isUrdu ? "left" : "right"};font-family:monospace;font-weight:900}
.footer{padding:10px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#64748b}
@media print{@page{size:A4 landscape;margin:8mm}body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style>
</head>
<body>
<div class="page">
<div class="sheet">
<div class="head">
<div><h1>Ali Cages</h1><p>${t.allSaleOrders}</p></div>
<div>${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
</div>
<div class="summary">
<div class="box"><small>${t.totalOrders}</small><b>${orders.length}</b></div>
<div class="box"><small>${t.totalValue}</small><b>${fmt(totalValue)}</b></div>
<div class="box"><small>${t.totalPaid}</small><b>${fmt(summary.paid)}</b></div>
<div class="box"><small>${t.totalRemaining}</small><b>${fmt(summary.remaining)}</b></div>
</div>
<div class="body">
<table>
<thead>
<tr>
<th class="center">#</th>
<th>${t.date}</th>
<th>${t.invoiceNo}</th>
<th>${t.name}</th>
<th>${t.shipTo}</th>
<th>${t.grandTotal}</th>
<th>${t.paymentStatus}</th>
<th>${t.orderStatus}</th>
</tr>
</thead>
<tbody>${rows}</tbody>
</table>
</div>
<div class="footer"><span>${t.allSaleOrders}</span><span>Ali Cages</span></div>
</div>
</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=1200,height=850");
    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const renderStatusText = (status) =>
    t[ORDER_STATUSES.find((x) => x.value === status)?.labelKey || "pending"];

  return (
    <div className="sale-page" dir={isUrdu ? "rtl" : "ltr"}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .sale-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #f1f5f9 100%);
          padding: 18px;
          color: #0f172a;
          font-family: ${isUrdu ? "'Noto Nastaliq Urdu', Arial, sans-serif" : "Inter, Arial, sans-serif"};
        }

        .page-wrap {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top-card {
          background: rgba(255,255,255,.92);
          border: 1px solid #dbe3ee;
          border-radius: 22px;
          padding: 20px 22px;
          box-shadow: 0 18px 50px rgba(15,23,42,.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .title {
          margin: 0;
          font-size: 30px;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 10px 15px;
          font-weight: 900;
          cursor: pointer;
          transition: .15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(.98);
        }

        .btn:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          box-shadow: 0 12px 25px rgba(79,70,229,.28);
        }

        .btn-summary {
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        .btn-summary-active {
          background: #4f46e5;
          color: white;
          border: 1px solid #4f46e5;
          box-shadow: 0 12px 25px rgba(79,70,229,.25);
        }

        .btn-soft {
          background: white;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-green {
          background: #dcfce7;
          color: #166534;
        }

        .btn-red {
          background: #fee2e2;
          color: #991b1b;
        }

        .convertAction {
          background: linear-gradient(135deg,#4f46e5,#2563eb) !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 12px 25px rgba(37,99,235,.28) !important;
        }

        .headerPrintBtn {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid #0f172a !important;
          box-shadow: 0 10px 22px rgba(15,23,42,.18) !important;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
          margin: 14px 0;
        }

        .summary-card {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 22px rgba(15,23,42,.05);
        }

        .summary-card small {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .summary-card b {
          display: block;
          margin-top: 7px;
          font-size: 19px;
          font-weight: 950;
          color: #0f172a;
          font-family: monospace;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          margin: 14px 0 12px;
        }

        .search {
          width: min(440px, 100%);
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          padding: 0 13px;
          font-size: 13px;
          outline: none;
          background: white;
        }

        .search:focus,
        .basicInput:focus,
        .basicSelect:focus,
        .productInput:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,.10);
        }

        .card {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(15,23,42,.05);
          overflow: hidden;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table.orders {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        table.orders th {
          background: #0f172a;
          color: rgba(255,255,255,.78);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .5px;
          padding: 12px 9px;
        }

        table.orders td {
          padding: 12px 9px;
          border-bottom: 1px solid #eef2f7;
          font-size: 13px;
        }

        table.orders tr:hover td {
          background: #f8fafc;
        }

        .order-action-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .order-action-row .btn {
          padding: 7px 9px;
          font-size: 12px;
        }

        .orders-desktop {
          display: block;
        }

        .orders-mobile {
          display: none;
        }

        .order-mobile-list {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .order-mobile-card {
          background: #ffffff;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 24px rgba(15,23,42,.06);
        }

        .order-mobile-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .order-mobile-title {
          min-width: 0;
        }

        .order-mobile-date {
          font-size: 11px;
          color: #64748b;
          font-weight: 900;
          font-family: monospace;
        }

        .order-mobile-inv {
          margin-top: 3px;
          font-size: 15px;
          font-weight: 950;
          color: #0f172a;
          font-family: monospace;
        }

        .order-mobile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .order-info-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          border-radius: 13px;
          padding: 9px 10px;
        }

        .order-info-line small {
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
        }

        .order-info-line b {
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          text-align: right;
        }

        .order-mobile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .order-mobile-actions .btn {
          width: 100%;
          padding: 9px 8px;
          font-size: 12px;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,.45);
          z-index: 50;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 12px;
          overflow: auto;
        }

        .inputModalBox {
          width: min(1060px, 100%);
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          box-shadow: 0 30px 90px rgba(15,23,42,.28);
          overflow: hidden;
        }

        .inputModalTitle {
          min-height: 54px;
          background: linear-gradient(135deg,#0f172a,#1e293b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          font-size: 17px;
          font-weight: 900;
        }

        .closeBtn {
          border: 1px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.08);
          color: white;
          min-width: 34px;
          height: 32px;
          border-radius: 10px;
          cursor: pointer;
          padding: 0 12px;
          font-weight: 900;
        }

        .inputModalBody {
          padding: 14px;
        }

        .formTopLine {
          display: grid;
          grid-template-columns: 160px 260px 140px 120px 140px 140px;
          gap: 10px;
          align-items: end;
          margin-bottom: 10px;
        }

        .formSecondLine {
          display: grid;
          grid-template-columns: 160px 150px;
          gap: 10px;
          align-items: end;
          margin-bottom: 14px;
        }

        .basicLabel {
          font-size: 11px;
          color: #334155;
          margin-bottom: 5px;
          display: block;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .35px;
        }

        .basicInput,
        .basicSelect,
        .productInput {
          width: 100%;
          height: 34px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #0f172a;
          padding: 5px 9px;
          font-size: 13px;
          border-radius: 10px;
          outline: none;
          font-weight: 650;
        }

        .basicInput[readonly] {
          background: #f1f5f9;
        }

        .sectionHead {
          min-height: 38px;
          background: linear-gradient(135deg,#eef2ff,#f8fafc);
          border: 1px solid #cbd5e1;
          border-radius: 14px 14px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          margin-top: 12px;
          font-weight: 950;
          color: #0f172a;
          gap: 10px;
          flex-wrap: wrap;
        }

        .basicBtn {
          height: 32px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #0f172a;
          padding: 5px 12px;
          font-size: 12px;
          cursor: pointer;
          border-radius: 10px;
          font-weight: 850;
        }

        .basicBtn:hover {
          background: #f8fafc;
        }

        .basicBtnGreen {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }

        .basicBtnRed {
          background: #fee2e2;
          border-color: #fecaca;
          color: #991b1b;
        }

        .basicProductTable {
          width: 100%;
          min-width: 920px;
          border-collapse: collapse;
          background: white;
        }

        .basicProductTable th,
        .basicProductTable td {
          border: 1px solid #dbe3ee;
          padding: 5px;
          font-size: 12px;
        }

        .basicProductTable th {
          background: #e2e8f0;
          text-align: center;
          color: #334155;
          font-weight: 900;
        }

        .paymentPanel {
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 12px;
          background: white;
          border-radius: 0 0 14px 14px;
        }

        .paymentTopGrid {
          display: grid;
          grid-template-columns: 130px 1fr 130px 1fr;
          gap: 9px 10px;
          align-items: center;
        }

        .paymentTopGrid label {
          font-size: 12px;
          color: #334155;
          font-weight: 850;
        }

        .finalTotalBar {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .totalBox {
          border: 1px solid #dbe3ee;
          background: #f8fafc;
          border-radius: 14px;
          padding: 10px 12px;
        }

        .totalBox label {
          display: block;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 900;
        }

        .totalBox b {
          display: block;
          text-align: ${isUrdu ? "left" : "right"};
          font-family: monospace;
          font-size: 18px;
        }

        .grandBox {
          background: #eef2ff;
          border-color: #c7d2fe;
          color: #3730a3;
        }

        .remainingBox {
          background: #fff7ed;
          border-color: #fed7aa;
          color: #9a3412;
        }

        .modalFooterBasic {
          padding: 12px 0 0;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .toast {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 90;
          color: white;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 900;
          box-shadow: 0 20px 50px rgba(15,23,42,.25);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .detail-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px;
        }

        .detail-box small {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .detail-box b {
          display: block;
          margin-top: 7px;
        }

        .printOptionGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .printOptionBtn {
          border: 1px solid #dbe3ee;
          background: linear-gradient(180deg,#fff,#f8fafc);
          border-radius: 16px;
          padding: 13px 12px;
          cursor: pointer;
          text-align: ${isUrdu ? "right" : "left"};
          box-shadow: 0 8px 18px rgba(15,23,42,.045);
          transition: .16s;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 76px;
        }

        .printOptionBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15,23,42,.10);
          border-color: #c7d2fe;
        }

        .printIcon {
          width: 38px;
          height: 38px;
          border-radius: 13px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 950;
          flex: 0 0 auto;
        }

        .printText b {
          display: block;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 3px;
        }

        .printText small {
          display: block;
          font-size: 10.5px;
          color: #64748b;
          font-weight: 800;
        }

        .formPageWrap {
          margin-top: 0;
          max-width: 1280px !important;
        }

        .formPageBox {
          width: 100% !important;
          max-width: 1280px !important;
          margin: 0 auto;
          box-shadow: 0 18px 50px rgba(15,23,42,.08) !important;
        }

        .chargeStepper {
          display: grid;
          grid-template-columns: 36px 1fr 36px;
          gap: 6px;
        }

        .miniChargeBtn {
          height: 34px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 950;
          font-size: 18px;
          color: #0f172a;
        }

        .miniChargeBtn:hover {
          background: #e0e7ff;
          border-color: #a5b4fc;
          color: #3730a3;
        }

        @media(max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .formTopLine {
            grid-template-columns: 1fr 1fr;
          }

          .formSecondLine {
            grid-template-columns: 1fr 1fr;
          }

          .paymentTopGrid {
            grid-template-columns: 130px 1fr;
          }

          .finalTotalBar {
            grid-template-columns: repeat(2, 1fr);
          }

          .printOptionGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 768px) {
          .sale-page {
            padding: 12px;
          }

          .top-card {
            align-items: stretch;
          }

          .top-card > div:last-child {
            width: 100%;
          }

          .top-card .btn {
            width: 100%;
          }

          .toolbar {
            width: 100%;
          }

          .search {
            width: 100%;
          }

          .orders-desktop {
            display: none;
          }

          .orders-mobile {
            display: block;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .modal-bg {
            padding: 0;
          }

          .inputModalBox {
            min-height: 100vh;
            border-radius: 0;
          }

          .inputModalTitle {
            height: auto;
            min-height: 54px;
            padding: 12px 14px;
          }

          .inputModalBody {
            padding: 10px;
          }

          .formTopLine,
          .formSecondLine {
            grid-template-columns: 1fr;
          }

          .paymentTopGrid {
            grid-template-columns: 1fr;
          }

          .finalTotalBar {
            grid-template-columns: 1fr;
          }

          .modalFooterBasic {
            display: grid;
            grid-template-columns: 1fr;
          }

          .modalFooterBasic .btn,
          .modalFooterBasic .basicBtn {
            width: 100%;
          }

          .printOptionGrid {
            grid-template-columns: 1fr;
          }

          .title {
            font-size: 24px;
          }
        }
      `}</style>

      {message.text && (
        <div
          className="toast"
          style={{
            background: message.type === "error" ? "#dc2626" : "#16a34a",
            left: isUrdu ? 18 : "auto",
            right: isUrdu ? "auto" : 18,
          }}
        >
          {message.text}
        </div>
      )}

      <div className="page-wrap" style={{ display: showForm ? "none" : "block" }}>
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              flexDirection: isUrdu ? "row-reverse" : "row",
            }}
          >
            <button
              className="btn btn-soft"
              onClick={() => setLang(isUrdu ? "en" : "ur")}
            >
              {isUrdu ? t.english : t.urdu}
            </button>

            <button
              className={`btn ${
                showSummary ? "btn-summary-active" : "btn-summary"
              }`}
              onClick={() => setShowSummary((v) => !v)}
            >
              {showSummary ? t.hideSummary : t.viewSummary}
            </button>

            <button className="btn headerPrintBtn" onClick={printAllSaleOrders}>
              {t.printAll}
            </button>

            <button className="btn btn-soft" onClick={loadAll}>
              {loading ? t.loading : t.refresh}
            </button>

            <button className="btn btn-primary" onClick={openAdd}>
              + {t.newOrder}
            </button>
          </div>
        </div>

        {showSummary && (
          <div className="summary-grid">
            {[
              [t.totalOrders, summary.total],
              [t.pendingOrders, summary.pending],
              [t.completedOrders, summary.completed],
              [t.cancelledOrders, summary.cancelled],
              [t.totalValue, fmt(summary.value)],
              [t.totalPaid, fmt(summary.paid)],
              [t.totalRemaining, fmt(summary.remaining)],
            ].map(([label, value]) => (
              <div className="summary-card" key={label}>
                <small>{label}</small>
                <b>{value}</b>
              </div>
            ))}
          </div>
        )}

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
          />
        </div>

        <div className="card">
          <div className="orders-desktop table-wrap">
            <table className="orders">
              <thead>
                <tr>
                  <th style={{ width: 115 }}>{t.date}</th>
                  <th
                    style={{
                      width: 130,
                      textAlign: isUrdu ? "right" : "left",
                    }}
                  >
                    {t.invoiceNo}
                  </th>
                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.name}
                  </th>
                  <th
                    style={{
                      width: 160,
                      textAlign: isUrdu ? "right" : "left",
                    }}
                  >
                    {t.shipTo}
                  </th>
                  <th style={{ width: 135, textAlign: "right" }}>
                    {t.grandTotal}
                  </th>
                  <th style={{ width: 120 }}>{t.orderStatus}</th>
                  <th style={{ width: 125 }}>{t.seeDetails}</th>
                  <th style={{ width: 220 }}>{t.actions}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: 44,
                        color: "#94a3b8",
                      }}
                    >
                      {t.loading}
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: 44,
                        color: "#94a3b8",
                      }}
                    >
                      {t.noOrders}
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

                    const orderStatus = order.status || "Pending";

                    return (
                      <tr key={order.id || index}>
                        <td
                          style={{
                            textAlign: "center",
                            fontFamily: "monospace",
                            color: "#475569",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {order.order_date || "-"}
                        </td>

                        <td>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 900,
                            }}
                          >
                            {order.order_no || "-"}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: 11 }}>
                            {items.length} {t.products}
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
                            {getOrderPartyName(order) || "-"}
                          </div>
                          <div style={{ color: "#64748b", fontSize: 11 }}>
                            {
                              t[
                                PARTY_TYPES.find(
                                  (x) => x.value === pickOrderPartyType(order)
                                )?.labelKey || "customer"
                              ]
                            }
                          </div>
                        </td>

                        <td
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {order.shipment_to || "-"}
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
                          <span style={badgeStyle(statusTone(orderStatus))}>
                            {renderStatusText(orderStatus)}
                          </span>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn btn-soft"
                            onClick={() => setDetailsOrder(order)}
                            style={{ padding: "7px 10px" }}
                          >
                            {t.seeDetails}
                          </button>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <div className="order-action-row">
                            <button
                              className="btn btn-green"
                              onClick={() => openEdit(order)}
                            >
                              {t.edit}
                            </button>

                            <button
                              className="btn convertAction"
                              onClick={() => handleConvertToInvoice(order)}
                              disabled={submitting}
                            >
                              {t.convertToInvoice}
                            </button>

                            <button
                              className="btn btn-red"
                              onClick={() => handleDelete(order.id)}
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

          <div className="orders-mobile">
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#94a3b8",
                }}
              >
                {t.loading}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#94a3b8",
                }}
              >
                {t.noOrders}
              </div>
            ) : (
              <div className="order-mobile-list">
                {filteredOrders.map((order, index) => {
                  const items = normalizeItems(order);
                  const total = num(order.total_amount) || orderTotal(items);

                  const grand =
                    num(order.grand_total) ||
                    total +
                      num(order.previous_balance) +
                      num(order.delivery_charges) -
                      num(order.discount);

                  const orderStatus = order.status || "Pending";

                  return (
                    <div className="order-mobile-card" key={order.id || index}>
                      <div
                        className="order-mobile-top"
                        style={{
                          flexDirection: isUrdu ? "row-reverse" : "row",
                        }}
                      >
                        <div className="order-mobile-title">
                          <div className="order-mobile-date">
                            {order.order_date || "-"}
                          </div>

                          <div className="order-mobile-inv">
                            {order.order_no || "-"}
                          </div>

                          <div style={{ color: "#94a3b8", fontSize: 11 }}>
                            #{index + 1} • {items.length} {t.products}
                          </div>
                        </div>

                        <span style={badgeStyle(statusTone(orderStatus))}>
                          {renderStatusText(orderStatus)}
                        </span>
                      </div>

                      <div className="order-mobile-grid">
                        <div className="order-info-line">
                          <small>{t.name}</small>
                          <b>{getOrderPartyName(order) || "-"}</b>
                        </div>

                        <div className="order-info-line">
                          <small>{t.shipTo}</small>
                          <b>{order.shipment_to || "-"}</b>
                        </div>

                        <div className="order-info-line">
                          <small>{t.grandTotal}</small>
                          <b
                            style={{
                              color: "#1d4ed8",
                              fontFamily: "monospace",
                            }}
                          >
                            {fmt(grand)}
                          </b>
                        </div>
                      </div>

                      <div className="order-mobile-actions">
                        <button
                          className="btn btn-soft"
                          onClick={() => setDetailsOrder(order)}
                        >
                          {t.seeDetails}
                        </button>

                        <button
                          className="btn convertAction"
                          onClick={() => handleConvertToInvoice(order)}
                          disabled={submitting}
                        >
                          {t.convertToInvoice}
                        </button>

                        <button
                          className="btn btn-green"
                          onClick={() => openEdit(order)}
                        >
                          {t.edit}
                        </button>

                        <button
                          className="btn btn-red"
                          onClick={() => handleDelete(order.id)}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="page-wrap formPageWrap">
          <div className="inputModalBox formPageBox">
            <div className="inputModalTitle">
              <span>{editingId ? t.update : t.newOrder}</span>

              <button className="closeBtn" onClick={() => setShowForm(false)}>
                × Back
              </button>
            </div>

            <div className="inputModalBody">
              <div className="formTopLine">
                <Field label={t.invoiceNo}>
                  <input
                    className="basicInput"
                    value={form.order_no}
                    onChange={(e) => updateForm("order_no", e.target.value)}
                  />
                </Field>

                <Field label={t.customerType}>
                  <select
                    className="basicSelect"
                    value={form.party_type}
                    onChange={(e) => handlePartyTypeChange(e.target.value)}
                  >
                    {PARTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t[type.labelKey]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t.name}>
                  <select
                    className="basicSelect"
                    value={form.party_id}
                    onChange={(e) => handlePartyChange(e.target.value)}
                  >
                    <option value="">{t.selectName}</option>

                    {partyOptions.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t.date}>
                  <input
                    className="basicInput"
                    type="date"
                    value={form.order_date}
                    onChange={(e) => updateForm("order_date", e.target.value)}
                  />
                </Field>

                <Field label={t.deliveryDate}>
                  <input
                    className="basicInput"
                    type="date"
                    value={form.delivery_date}
                    onChange={(e) => updateForm("delivery_date", e.target.value)}
                  />
                </Field>

                <Field label={t.orderStatus}>
                  <select
                    className="basicSelect"
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {t[status.labelKey]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="formTopLine">
                <Field label={t.referenceNo}>
                  <input
                    className="basicInput"
                    value={form.reference_no}
                    onChange={(e) => updateForm("reference_no", e.target.value)}
                  />
                </Field>

                <Field label={t.shipTo}>
                  <input
                    className="basicInput"
                    value={form.shipment_to}
                    onChange={(e) => updateForm("shipment_to", e.target.value)}
                  />
                </Field>

                <Field label={t.previousBalance}>
                  <input
                    className="basicInput"
                    type="number"
                    value={form.previous_balance}
                    onChange={(e) => updateForm("previous_balance", e.target.value)}
                  />
                </Field>

                <Field label={t.deliveryCharges}>
                  <div className="chargeStepper">
                    <button
                      type="button"
                      className="miniChargeBtn"
                      onClick={() => stepDeliveryCharges(-100)}
                    >
                      -
                    </button>

                    <input
                      className="basicInput"
                      type="number"
                      value={form.delivery_charges}
                      onChange={(e) =>
                        updateForm("delivery_charges", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="miniChargeBtn"
                      onClick={() => stepDeliveryCharges(100)}
                    >
                      +
                    </button>
                  </div>
                </Field>

                <Field label={t.discount}>
                  <input
                    className="basicInput"
                    type="number"
                    value={form.discount}
                    onChange={(e) => updateForm("discount", e.target.value)}
                  />
                </Field>

                <Field label={t.paymentMethod}>
                  <select
                    className="basicSelect"
                    value={form.payment_method}
                    onChange={(e) => updateForm("payment_method", e.target.value)}
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {t[method.labelKey]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="sectionHead">
                <span>{t.products}</span>

                <button className="basicBtn basicBtnGreen" onClick={addItem}>
                  {t.addRow}
                </button>
              </div>

              <div className="table-wrap">
                <table className="basicProductTable">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>{t.productType}</th>
                      <th>{t.category}</th>
                      <th>{t.product}</th>
                      <th>{t.productDescription}</th>
                      <th>{t.unit}</th>
                      <th>{t.qty}</th>
                      <th>{t.rate}</th>
                      <th>{t.amount}</th>
                      <th>{t.action}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: "center", fontWeight: 900 }}>
                          {index + 1}
                        </td>

                        <td>
                          <select
                            className="productInput"
                            value={item.product_type_id}
                            onChange={(e) =>
                              updateItem(index, "product_type_id", e.target.value)
                            }
                          >
                            <option value="">{t.select}</option>

                            {types.map((type) => (
                              <option key={getId(type)} value={getId(type)}>
                                {getTypeName(type)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <select
                            className="productInput"
                            value={item.category_id}
                            onChange={(e) =>
                              updateItem(index, "category_id", e.target.value)
                            }
                          >
                            <option value="">{t.select}</option>

                            {categories.map((cat) => (
                              <option key={getId(cat)} value={getId(cat)}>
                                {getCategoryName(cat)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <select
                            className="productInput"
                            value={item.product_id}
                            onChange={(e) =>
                              updateItem(index, "product_id", e.target.value)
                            }
                          >
                            <option value="">{t.select}</option>

                            {products.map((product) => (
                              <option key={getId(product)} value={getId(product)}>
                                {getProductName(product)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            className="productInput"
                            value={item.product_description}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "product_description",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <select
                            className="productInput"
                            value={item.unit_id}
                            onChange={(e) =>
                              updateItem(index, "unit_id", e.target.value)
                            }
                          >
                            <option value="">{t.select}</option>

                            {units.map((unit) => (
                              <option key={getId(unit)} value={getId(unit)}>
                                {getUnitName(unit)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            className="productInput"
                            type="number"
                            value={item.order_qty}
                            onChange={(e) =>
                              updateItem(index, "order_qty", e.target.value)
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="productInput"
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(index, "rate", e.target.value)
                            }
                          />
                        </td>

                        <td
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 900,
                            textAlign: "right",
                            color: "#1d4ed8",
                          }}
                        >
                          {fmt(lineTotal(item))}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <button
                            className="basicBtn basicBtnRed"
                            onClick={() => removeItem(index)}
                          >
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sectionHead">
                <span>{t.payment}</span>
              </div>

              <div className="paymentPanel">
                <div className="paymentTopGrid">
                  <label>{t.paidAmount}</label>
                  <input
                    className="basicInput"
                    type="number"
                    value={form.paid_amount}
                    onChange={(e) => updateForm("paid_amount", e.target.value)}
                  />

                  <label>{t.paymentStatus}</label>
                  <select
                    className="basicSelect"
                    value={form.payment_status}
                    onChange={(e) => updateForm("payment_status", e.target.value)}
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {t[status.labelKey]}
                      </option>
                    ))}
                  </select>

                  <label>{t.paymentNote}</label>
                  <input
                    className="basicInput"
                    value={form.payment_note}
                    onChange={(e) => updateForm("payment_note", e.target.value)}
                    placeholder={t.transactionNote}
                  />
                </div>

                <div className="finalTotalBar">
                  <div className="totalBox">
                    <label>{t.totalAmount}</label>
                    <b>{fmt(totalAmount)}</b>
                  </div>

                  <div className="totalBox">
                    <label>{t.discount}</label>
                    <b>{fmt(form.discount)}</b>
                  </div>

                  <div className="totalBox grandBox">
                    <label>{t.grandTotal}</label>
                    <b>{fmt(grandTotal)}</b>
                  </div>

                  <div className="totalBox remainingBox">
                    <label>{t.remaining}</label>
                    <b>{fmt(remaining)}</b>
                  </div>
                </div>
              </div>

              <div className="modalFooterBasic">
                <button
                  className="btn btn-soft"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  {t.cancel}
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting ? t.saving : editingId ? t.update : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailsOrder && (
        <OrderDetailsModal
          order={detailsOrder}
          t={t}
          isUrdu={isUrdu}
          getOrderPartyName={getOrderPartyName}
          productMap={productMap}
          categoryMap={categoryMap}
          typeMap={typeMap}
          unitMap={unitMap}
          onClose={() => setDetailsOrder(null)}
          onEdit={openEdit}
          onDelete={handleDelete}
          onPrint={printOrderDocument}
          onConvert={handleConvertToInvoice}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="basicLabel">{label}</label>
      {children}
    </div>
  );
}

function OrderDetailsModal({
  order,
  t,
  isUrdu,
  getOrderPartyName,
  productMap,
  categoryMap,
  typeMap,
  unitMap,
  onClose,
  onEdit,
  onDelete,
  onPrint,
  onConvert,
  submitting,
}) {
  const items = normalizeItems(order);

  const total = num(order.total_amount) || orderTotal(items);

  const grand =
    num(order.grand_total) ||
    total +
      num(order.previous_balance) +
      num(order.delivery_charges) -
      num(order.discount);

  const paid = num(order.paid_amount);

  const remain =
    order.remaining_balance !== undefined
      ? num(order.remaining_balance)
      : remainingAmount(grand, paid);

  const orderStatus = order.status || "Pending";

  return (
    <div className="modal-bg" dir={isUrdu ? "rtl" : "ltr"}>
      <div className="inputModalBox">
        <div className="inputModalTitle">
          <span>{t.orderDetails}</span>

          <button className="closeBtn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="inputModalBody">
          <div className="detail-grid">
            <DetailBox label={t.date} value={order.order_date || "-"} />
            <DetailBox label={t.invoiceNo} value={order.order_no || "-"} />
            <DetailBox label={t.name} value={getOrderPartyName(order) || "-"} />
            <DetailBox label={t.shipTo} value={order.shipment_to || "-"} />
            <DetailBox label={t.grandTotal} value={fmt(grand)} strong />
            <DetailBox
              label={t.orderStatus}
              value={
                t[
                  ORDER_STATUSES.find((x) => x.value === orderStatus)?.labelKey ||
                    "pending"
                ]
              }
            />
          </div>

          <div className="table-wrap">
            <table className="basicProductTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.product}</th>
                  <th>{t.category}</th>
                  <th>{t.productType}</th>
                  <th>{t.unit}</th>
                  <th>{t.qty}</th>
                  <th>{t.rate}</th>
                  <th>{t.amount}</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: 18,
                        color: "#94a3b8",
                      }}
                    >
                      {t.requiredProduct}
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>
                        <b>{productMap[item.product_id] || item.product_id}</b>
                        {item.product_description ? (
                          <div style={{ color: "#64748b", fontSize: 11 }}>
                            {item.product_description}
                          </div>
                        ) : null}
                      </td>
                      <td>{categoryMap[item.category_id] || item.category_id}</td>
                      <td>{typeMap[item.product_type_id] || item.product_type_id}</td>
                      <td>{unitMap[item.unit_id] || item.unit_id}</td>
                      <td style={{ textAlign: "center" }}>{fmt(item.order_qty)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(item.rate)}</td>
                      <td style={{ textAlign: "right", fontWeight: 900 }}>
                        {fmt(lineTotal(item))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="finalTotalBar">
            <div className="totalBox">
              <label>{t.totalAmount}</label>
              <b>{fmt(total)}</b>
            </div>

            <div className="totalBox">
              <label>{t.paidAmount}</label>
              <b>{fmt(paid)}</b>
            </div>

            <div className="totalBox grandBox">
              <label>{t.grandTotal}</label>
              <b>{fmt(grand)}</b>
            </div>

            <div className="totalBox remainingBox">
              <label>{t.remaining}</label>
              <b>{fmt(remain)}</b>
            </div>
          </div>

          <div className="printOptionGrid">
            <button
              className="printOptionBtn"
              onClick={() => onPrint(order, "sale_order", true)}
            >
              <span className="printIcon">₨</span>
              <span className="printText">
                <b>{t.saleOrderPrint}</b>
                <small>{t.withAmount}</small>
              </span>
            </button>

            <button
              className="printOptionBtn"
              onClick={() => onPrint(order, "sale_order", false)}
            >
              <span className="printIcon">—</span>
              <span className="printText">
                <b>{t.saleOrderPrint}</b>
                <small>{t.withoutAmount}</small>
              </span>
            </button>

            <button
              className="printOptionBtn"
              onClick={() => onPrint(order, "order_invoice", true)}
            >
              <span className="printIcon">🧾</span>
              <span className="printText">
                <b>{t.orderInvoicePrint}</b>
                <small>{t.withAmount}</small>
              </span>
            </button>

            <button
              className="printOptionBtn convertAction"
              onClick={() => onConvert(order)}
              disabled={submitting}
            >
              <span className="printIcon">↗</span>
              <span className="printText">
                <b>{t.convertToInvoice}</b>
                <small>{t.invoiceCreated}</small>
              </span>
            </button>
          </div>

          <div className="modalFooterBasic">
            <button className="btn btn-soft" onClick={() => onEdit(order)}>
              {t.edit}
            </button>

            <button className="btn btn-red" onClick={() => onDelete(order.id)}>
              {t.delete}
            </button>

            <button className="btn btn-soft" onClick={onClose}>
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value, strong = false }) {
  return (
    <div className="detail-box">
      <small>{label}</small>
      <b style={{ fontWeight: strong ? 950 : 800 }}>{value}</b>
    </div>
  );
}
