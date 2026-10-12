import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Eye, Pencil, Printer, Trash2 } from "lucide-react";
import { resolveSalesRate } from "../utils/salesRateResolver";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api/sales-invoices`;
const SALE_ORDERS_API = `${API_ROOT}/api/sale-orders`;
const CUSTOMERS_API = `${API_ROOT}/api/customers`;
const EMPLOYEES_API = `${API_ROOT}/api/employees`;
const SUPPLIERS_API = `${API_ROOT}/api/suppliers`;
const GENERAL_LEDGERS_API = `${API_ROOT}/api/general-ledgers`;
const CATEGORIES_API = `${API_ROOT}/api/categories`;
const PRODUCTS_API = `${API_ROOT}/api/products`;
const CUSTOMER_LEDGER_API = `${API_ROOT}/api/ledger/customer`;
const LEDGER_SUMMARY_API = `${API_ROOT}/api/ledger-summary`;
const UNITS_API = `${API_ROOT}/api/units`;
const RATES_API = `${API_ROOT}/api/rates`;

const LANG = {
  en: {
    title: "Sales Invoice",
    subtitle: "Create invoices with products, quantities, dates and totals",
    newInvoice: "New Invoice",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    refresh: "Refresh",
    todayFilter: "Today",
    selectDate: "Select Date",
    fromDate: "From",
    toDate: "To",
    showingDate: "Showing Date",
    showingPeriod: "Showing Period",
    toggleLang: "اردو",
    searchPlaceholder: "Search invoice no, name, product or date...",
    customerInvoiceSearch: "Customer Invoices",
    customerInvoicePlaceholder: "Type customer name to show all invoices...",
    bulkPrint: "Bulk Print",
    bulkPrinting: "Printing...",
    allCustomerInvoices: "All invoices for this customer",
    all: "All",
    last24: "24 Hours",
    last7: "7 Days",
    month: "This Month",
    totalInvoices: "Total Invoices",
    totalItems: "Total Items",
    totalValue: "Total Value",
    totalPrev: "Previous Balance",
    totalDiscount: "Total Discount",
    totalDelivery: "Delivery Charges",
    customerType: "Customer Type",
    name: "Name",
    reference: "Description",
    address: "Address",
    invoiceNo: "Invoice No",
    date: "Date",
    dateFull: "Date",
    dueDate: "Due Date",
    viewDetails: "View Details",
    shipTo: "Ship To",
    rateList: "Rate List",
    rateListAuto: "Auto / Customer",
    rateListHint: "Leave Auto to use the customer's assigned list. Select any list here to override rates for this invoice, including General/other accounts.",
    products: "Products",
    addRow: "+ Add Row",
    productType: "Product Type",
    category: "Category",
    product: "Product",
    desc: "Desc",
    unit: "Unit",
    saleType: "Sale Type",
    single: "Single",
    multiple: "Multiple",
    carton: "Carton",
    pieces: "Pieces",
    cartonQty: "Carton Qty",
    piecesQty: "Pieces Qty",
    pcsCtn: "Pcs/Ctn",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    totalQty: "Total Quantity",
    invoiceTotal: "Invoice Total",
    previousBalance: "Previous Balance",
    deliveryCharges: "Delivery Charges",
    discount: "Discount",
    discountFlat: "Flat",
    discountPercent: "Percentage",
    balanceLoadError: "Could not refresh remaining balance. Please check the ledger.",
    grandTotal: "Grand Total",
    save: "Save",
    update: "Update",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    print: "Print",
    actions: "Actions",
    loading: "Loading...",
    noRecords: "No invoices found.",
    select: "Select",
    selectName: "Select Name",
    customer: "Customer",
    employee: "Employee",
    supplier: "Supplier",
    generalLedger: "General Ledger",
    requiredInvoice: "Invoice No is required.",
    requiredPartyType: "Customer Type is required.",
    requiredParty: "Please select a name.",
    requiredItem: "Add at least one valid product row.",
    saved: "Invoice saved.",
    updated: "Invoice updated.",
    deleted: "Invoice deleted.",
    saveError: "Save failed. Check backend.",
    loadError: "Data load failed.",
    printError: "Print failed.",
    editError: "Could not load invoice details.",
    deleteConfirm: "Delete this invoice?",
    createMode: "Create Mode",
    editMode: "Edit Mode",
  },
  ur: {
    title: "سیلز انوائس",
    subtitle: "پروڈکٹس، مقدار، تاریخ اور ٹوٹل کے ساتھ انوائس بنائیں",
    newInvoice: "نئی انوائس",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    refresh: "ری فریش",
    todayFilter: "آج",
    selectDate: "تاریخ منتخب کریں",
    fromDate: "شروع",
    toDate: "اختتام",
    showingDate: "دکھائی جانے والی تاریخ",
    showingPeriod: "دکھائی جانے والی مدت",
    toggleLang: "English",
    searchPlaceholder: "انوائس نمبر، نام، پروڈکٹ یا تاریخ تلاش کریں...",
    customerInvoiceSearch: "کسٹمر انوائسز",
    customerInvoicePlaceholder: "کسٹمر کا نام لکھیں، تمام انوائسز آئیں گی...",
    bulkPrint: "بلک پرنٹ",
    bulkPrinting: "پرنٹ ہو رہا ہے...",
    allCustomerInvoices: "اس کسٹمر کی تمام انوائسز",
    all: "سب",
    last24: "24 گھنٹے",
    last7: "7 دن",
    month: "یہ مہینہ",
    totalInvoices: "کل انوائسز",
    totalItems: "کل آئٹمز",
    totalValue: "کل رقم",
    totalPrev: "سابقہ بیلنس",
    totalDiscount: "کل ڈسکاؤنٹ",
    totalDelivery: "ڈیلیوری چارجز",
    customerType: "کسٹمر ٹائپ",
    name: "نام",
    reference: "تفصیل",
    address: "ایڈریس",
    invoiceNo: "انوائس نمبر",
    date: "تاریخ",
    dateFull: "تاریخ",
    dueDate: "ادائیگی کی تاریخ",
    viewDetails: "تفصیل دیکھیں",
    shipTo: "شپ ٹو",
    rateList: "ریٹ لسٹ",
    rateListAuto: "آٹو / کسٹمر",
    rateListHint: "آٹو پر کسٹمر کی اسائن شدہ لسٹ استعمال ہوگی۔ اس انوائس کے لیے کسی بھی ریٹ لسٹ کو منتخب کر کے ریٹس اوور رائیڈ کر سکتے ہیں، جنرل یا دوسرے اکاؤنٹس پر بھی۔",
    products: "پروڈکٹس",
    addRow: "+ لائن شامل کریں",
    productType: "پروڈکٹ ٹائپ",
    category: "کیٹیگری",
    product: "پروڈکٹ",
    desc: "تفصیل",
    unit: "یونٹ",
    saleType: "قسم",
    single: "سنگل",
    multiple: "ملٹی پل",
    carton: "کارٹن",
    pieces: "پیسز",
    cartonQty: "کارٹن مقدار",
    piecesQty: "پیسز مقدار",
    pcsCtn: "فی کارٹن",
    qty: "مقدار",
    rate: "ریٹ",
    amount: "رقم",
    totalQty: "کل مقدار",
    invoiceTotal: "انوائس ٹوٹل",
    previousBalance: "سابقہ بیلنس",
    deliveryCharges: "ڈیلیوری چارجز",
    discount: "ڈسکاؤنٹ",
    discountFlat: "فلیٹ",
    discountPercent: "فیصد",
    balanceLoadError: "بقایا بیلنس لوڈ نہیں ہو سکا۔ لیجر چیک کریں۔",
    grandTotal: "کل رقم",
    save: "محفوظ کریں",
    update: "اپڈیٹ",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    close: "بند کریں",
    edit: "ترمیم",
    delete: "حذف",
    print: "پرنٹ",
    actions: "اقدامات",
    loading: "لوڈ ہو رہا ہے...",
    noRecords: "کوئی انوائس نہیں ملی۔",
    select: "منتخب کریں",
    selectName: "نام منتخب کریں",
    customer: "کسٹمر",
    employee: "ملازم",
    supplier: "سپلائر",
    generalLedger: "جنرل لیجر",
    requiredInvoice: "انوائس نمبر ضروری ہے۔",
    requiredPartyType: "کسٹمر ٹائپ ضروری ہے۔",
    requiredParty: "نام منتخب کریں۔",
    requiredItem: "کم از کم ایک درست پروڈکٹ لائن شامل کریں۔",
    saved: "انوائس محفوظ ہو گئی۔",
    updated: "انوائس اپڈیٹ ہو گئی۔",
    deleted: "انوائس حذف ہو گئی۔",
    saveError: "محفوظ نہیں ہوئی، بیک اینڈ چیک کریں۔",
    loadError: "ڈیٹا لوڈ نہیں ہوا۔",
    printError: "پرنٹ نہیں ہو سکا۔",
    editError: "انوائس تفصیل لوڈ نہیں ہوئی۔",
    deleteConfirm: "کیا یہ انوائس حذف کرنی ہے؟",
    createMode: "نیا موڈ",
    editMode: "ترمیم موڈ",
  },
};

const PARTY_TYPES = [
  { value: "customer", labelKey: "customer" },
  { value: "employee", labelKey: "employee" },
  { value: "supplier", labelKey: "supplier" },
  { value: "general_ledger", labelKey: "generalLedger" },
];

const DATE_FILTERS = [
  { value: "all", labelKey: "all" },
  { value: "24h", labelKey: "last24" },
  { value: "7d", labelKey: "last7" },
  { value: "month", labelKey: "month" },
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyItem = () => ({
  category_id: "",
  product_id: "",
  product_description: "",
  product_type_id: "",
  unit_id: "",
  sale_type: "multiple",
  rate_manual: false,
  carton_qty: "",
  pieces_qty: "",
  qty: "",
  pieces_per_carton: "0",
  rate: "0",
  amount: "0",
});

const defaultInvoiceItems = (count = 5) =>
  Array.from({ length: count }, () => emptyItem());

const emptyForm = () => ({
  invoice_no: "",
  reference_no: "",
  party_type: "customer",
  party_id: "",
  customer_id: "",
  invoice_date: today(),
  due_date: "",
  shipment_to: "",
  rate_list_name: "",
  previous_balance: "0",
  delivery_charges: "0",
  discount: "0",
  discount_type: "flat",
});

const getList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.products)) return d.products;
  if (Array.isArray(d?.result)) return d.result;
  if (Array.isArray(d?.rows)) return d.rows;
  return [];
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const calculateDiscountAmount = (subtotal, value, mode) => {
  const entered = Math.max(0, toNum(value));
  const amount = mode === "percent" ? (Math.max(0, toNum(subtotal)) * Math.min(entered, 100)) / 100 : entered;
  return Math.round(amount * 100) / 100;
};

const money = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getRecordId = (o) =>
  o?.id ??
  o?.value ??
  o?.ID ??
  o?.Id ??
  o?.customer_id ??
  o?.CustomerID ??
  o?.employee_id ??
  o?.EmployeeID ??
  o?.supplier_id ??
  o?.SupplierID ??
  o?.general_ledger_id ??
  o?.ledger_id ??
  o?.account_id ??
  o?.category_id ??
  o?.CategoryID ??
  o?.unit_id ??
  o?.UnitID ??
  o?.product_id ??
  o?.ProductID ??
  "";

const pickText = (o, keys) => {
  for (const key of keys) {
    if (o?.[key] !== undefined && o?.[key] !== null && String(o[key]).trim()) return String(o[key]).trim();
  }
  const id = getRecordId(o);
  return id ? `#${id}` : "";
};

const getCustomerName = (o) => pickText(o, ["customer_name", "customer_name_en", "name", "name_en", "title"]);
const getEmployeeName = (o) => pickText(o, ["employee_name", "employee_name_en", "full_name", "name", "name_en", "title"]);
const getSupplierName = (o) => pickText(o, ["supplier_name", "supplier_name_en", "vendor_name", "name", "name_en", "title"]);
const getLedgerName = (o) => pickText(o, ["ledger_name", "ledger_name_en", "account_name", "account_title", "name", "name_en", "title"]);

const getPreviousBalance = (row) => {
  if (!row) return 0;
  // Remaining/closing balance comes from posted transactions. Opening balance
  // is a starting entry, and must not override the current outstanding amount.
  const keys = [
    "remaining_balance", "remainingBalance", "due_balance", "dueBalance",
    "closing_balance", "closingBalance", "current_balance", "currentBalance",
    "ledger_balance", "ledgerBalance", "account_balance", "accountBalance",
    "previous_balance", "previousBalance", "prev_balance", "prevBalance",
    "balance", "payable", "receivable",
  ];
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") return toNum(row[key]);
  }
  const debit = toNum(row.debit || row.total_debit || row.debit_amount || row.dr || row.total_dr);
  const credit = toNum(row.credit || row.total_credit || row.credit_amount || row.cr || row.total_cr);
  if (debit || credit) return debit - credit;
  return 0;
};

const makePartyOption = (row, nameGetter) => ({
  id: String(getRecordId(row)),
  name: nameGetter(row),
  previous_balance: getPreviousBalance(row),
});
const getCategoryName = (o) => pickText(o, ["category_name", "category_name_en", "CategoryName", "name", "name_en", "title"]);
const getProductName = (o) => pickText(o, ["product_name", "product_name_en", "ProductName", "item_name", "ItemName", "name", "name_en", "title"]);
const getUnitName = (o) => pickText(o, ["unit_name", "unit_name_en", "UnitName", "name", "name_en", "symbol", "title"]);
const getProductTypeLabel = (product, typeMap) => {
  const keys = ["product_type_en", "product_type_name", "type_name", "product_type", "typeName"];
  for (const key of keys) {
    const value = product?.[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return typeMap[String(getProductTypeId(product))] || "";
};
const getProductDesc = (o) => pickText(o, ["product_description", "ProductDescription", "description", "Description", "details", "remarks"]);

const getCategoryId = (o) =>
  o?.id ?? o?.value ?? o?.category_id ?? o?.categoryId ?? o?.CategoryID ?? o?.cat_id ?? o?.CatID ?? "";

const getProductId = (o) =>
  o?.id ?? o?.value ?? o?.product_id ?? o?.productId ?? o?.ProductID ?? o?.item_id ?? o?.ItemID ?? "";

const getUnitId = (o) =>
  o?.id ?? o?.value ?? o?.unit_id ?? o?.unitId ?? o?.UnitID ?? "";

const sameId = (a, b) => String(a ?? "") !== "" && String(a ?? "") === String(b ?? "");

const getProductCatId = (p) =>
  p?.category_id ??
  p?.categoryId ??
  p?.CategoryID ??
  p?.cat_id ??
  p?.CatID ??
  p?.product_category_id ??
  p?.productCategoryId ??
  p?.ProductCategoryID ??
  p?.category?.id ??
  p?.category?.category_id ??
  p?.category?.CategoryID ??
  "";

const getProductUnitId = (p) =>
  p?.unit_id ?? p?.unitId ?? p?.UnitID ?? p?.unit?.id ?? p?.unit?.unit_id ?? p?.unit?.UnitID ?? "";

const getProductPieceRate = (p) =>
  p?.piece_rate ??
  p?.pieceRate ??
  p?.PieceRate ??
  p?.sale_rate ??
  p?.saleRate ??
  p?.SaleRate ??
  p?.rate ??
  p?.Rate ??
  p?.price ??
  p?.Price ??
  p?.sale_price ??
  p?.SalePrice ??
  p?.retail_price ??
  p?.RetailPrice ??
  0;

// Rate List may provide different prices for a single piece and a multiple sale.
// Product master values are fallback when no matching rate-list record exists.
const getProductModeRate = (product, saleType) => {
  const keys = saleType === "single"
    ? ["single_rate", "singleRate", "piece_rate", "pieceRate", "retail_rate", "retailRate"]
    : ["retail_rate", "retailRate", "wholesale_rate", "wholesaleRate", "multiple_rate", "multipleRate"];
  for (const key of keys) {
    if (Number.isFinite(Number(product?.[key])) && Number(product[key]) > 0) return Number(product[key]);
  }
  return Number(getProductPieceRate(product)) || 0;
};

// The /api/rates endpoint stores customer/list prices inside price_options,
// not as single_rate/retail_rate columns on the products API response.
// Prefer the customer's assigned list; never borrow another customer's prices.
const getCatalogModeRate = (option, saleType) => {
  const keys = saleType === "single"
    ? ["single_rate", "singleRate", "piece_rate", "pieceRate"]
    : ["retail_rate", "retailRate", "multiple_rate", "multipleRate", "wholesale_rate", "wholesaleRate", "distributor_rate", "distributorRate"];
  for (const key of keys) {
    const value = Number(option?.[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
};

const getCatalogRate = (rates, row, prod, customerId, listName) => {
  const productId = row.product_id || getProductId(prod || {});
  if (!productId) return 0;
  const customerKey = String(customerId ?? "");
  const desiredList = String(listName || "").trim();
  const sameList = (rate, name) => String(rate.list_name || "Default Rate List").trim() === name;
  const customerAssigned = (rate) =>
    (customerKey && String(rate.customer_id || "") === customerKey) ||
    (customerKey && Array.isArray(rate.assigned_customer_ids) && rate.assigned_customer_ids.some((id) => String(id) === customerKey)) ||
    (customerKey && Array.isArray(rate.assigned_customers) && rate.assigned_customers.some((c) => String(c.customer_id ?? c.id) === customerKey));
  const isGlobal = (rate) =>
    !rate.customer_id &&
    (!Array.isArray(rate.assigned_customer_ids) || rate.assigned_customer_ids.length === 0) &&
    (!Array.isArray(rate.assigned_customers) || rate.assigned_customers.length === 0);

  const productRates = (Array.isArray(rates) ? rates : []).filter((rate) => sameId(rate.product_id, productId));
  let eligible;
  if (desiredList) {
    eligible = productRates.filter((rate) => sameList(rate, desiredList));
  } else {
    const assigned = productRates.filter(customerAssigned);
    const global = productRates.filter(isGlobal);
    if (assigned.length) {
      eligible = assigned;
    } else {
      const defaults = global.filter((rate) => sameList(rate, "Default Rate List"));
      const globalNames = new Set(global.map((rate) => String(rate.list_name || "Default Rate List")));
      eligible = defaults.length ? defaults : globalNames.size === 1 ? global : [];
    }
  }

  const expectedCategory = row.category_id || getProductCatId(prod || {});
  const expectedType = row.product_type_id || getProductTypeId(prod || {});
  const expectedUnit = row.unit_id || getProductUnitId(prod || {});
  let bestRate = 0;
  let bestScore = -Infinity;

  for (const record of eligible) {
    let options = record.price_options;
    if (typeof options === "string") {
      try { options = JSON.parse(options); } catch { options = []; }
    }
    if (!Array.isArray(options) || !options.length) options = [record];

    for (const option of options) {
      const rate = getCatalogModeRate(option, row.sale_type);
      if (rate <= 0) continue;
      // Exact product is authoritative. Dimension mismatches get lower priority
      // instead of incorrectly discarding a configured rate altogether.
      let score = 0;
      for (const [a, b, weight] of [
        [option.category_id, expectedCategory, 4],
        [option.product_type_id, expectedType, 4],
        [option.unit_id, expectedUnit, 2],
      ]) {
        if (a && b) score += sameId(a, b) ? weight : -weight;
      }
      if (customerAssigned(record)) score += 30;
      if (score > bestScore) {
        bestScore = score;
        bestRate = rate;
      }
    }
  }
  return bestRate;
};

// Show each product only once in the Product dropdown. The selected product's
// own sale unit decides whether the invoice row uses single or multiple rates.
const makeInvoiceProductChoice = (id) => id ? String(id) : "";
const parseInvoiceProductChoice = (choice) => {
  return { product_id: String(choice || "") };
};

const roundPreviousBalance = (value) => String(Math.round(toNum(value)));

const getProductSaleUnit = (p) => String(
  p?.sale_type ||
  p?.saleType ||
  p?.SaleType ||
  p?.sale_unit ||
  p?.saleUnit ||
  p?.SaleUnit ||
  "single"
).toLowerCase();
const getProductSaleMode = (p) =>
  /multiple|carton|pack|box|wholesale/.test(getProductSaleUnit(p)) ? "multiple" : "single";
const getProductPcsCtn = (p) => Number(p?.pieces_per_carton ?? p?.piecesPerCarton ?? p?.PiecesPerCarton ?? 0);
const getProductTypeId = (p) =>
  p?.product_type_id ??
  p?.productTypeId ??
  p?.ProductTypeID ??
  p?.type_id ??
  p?.typeId ??
  p?.TypeID ??
  p?.product_type?.id ??
  p?.type?.id ??
  "";
const getTypeName = (o) => pickText(o, ["product_type_en", "product_type", "type_name", "type", "name", "name_en", "title"]);
const getDefaultFmsTypeId = (types = []) => {
  const found = types.find((x) => /fms/i.test(getTypeName(x)));
  return found ? String(getRecordId(found)) : types[0] ? String(getRecordId(types[0])) : "";
};

const getPartyNameByType = (type, row) => {
  if (type === "employee") return getEmployeeName(row);
  if (type === "supplier") return getSupplierName(row);
  if (type === "general_ledger") return getLedgerName(row);
  return getCustomerName(row);
};

const getInvPartyType = (inv) =>
  inv?.customer_type ||
  inv?.party_type ||
  (inv?.customer_id ? "customer" : inv?.employee_id ? "employee" : inv?.supplier_id ? "supplier" : inv?.general_ledger_id ? "general_ledger" : "customer");

const getInvPartyId = (inv) => {
  const type = getInvPartyType(inv);
  if (inv?.party_id) return inv.party_id;
  if (type === "employee") return inv?.employee_id || "";
  if (type === "supplier") return inv?.supplier_id || "";
  if (type === "general_ledger") return inv?.general_ledger_id || inv?.ledger_id || inv?.account_id || "";
  return inv?.customer_id || "";
};

function makeMap(list, getter) {
  const map = {};
  list.forEach((row) => {
    const id = String(getRecordId(row));
    if (id) map[id] = getter(row);
  });
  return map;
}

function genInvoiceNo(list) {
  let max = 0;
  list.forEach((inv) => {
    const m1 = String(inv.invoice_no || "").match(/^sales-invoice(\d+)$/i);
    const m2 = String(inv.invoice_no || "").match(/^SI[- ]?(\d+)$/i);
    const m = m1 || m2;
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `SI-${String(max + 1).padStart(6, "0")}`;
}

// ✅ Date format: 25/06/2026 (day name removed)
function formatFullDate(dateValue) {
  if (!dateValue) return "-";
  const raw = String(dateValue).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}


function parseDisplayDate(value) {
  const v = String(value || "").trim();
  const slash = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (slash) {
    const dd = slash[1].padStart(2, "0");
    const mm = slash[2].padStart(2, "0");
    const yyyy = slash[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return "";
}

function DateTextInput({ value, onChange, className = "", style = {}, readOnly = false, ...props }) {
  return (
    <input
      {...props}
      type="date"
      className={className}
      style={style}
      value={String(value || "").slice(0, 10)}
      readOnly={readOnly}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      onClick={(e) => {
        if (!readOnly && typeof e.currentTarget.showPicker === "function") {
          try { e.currentTarget.showPicker(); } catch { /* browser fallback */ }
        }
      }}
    />
  );
}
function useLookup(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(url);
      setData(getList(res.data));
    } catch (err) {
      setError(err?.message || "Load error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

function badgeStyle(tone) {
  const styles = {
    green: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    blue: { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    red: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
    amber: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    slate: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
  };
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
    ...(styles[tone] || styles.slate),
  };
}

function printInvoice(invoice, maps, t, isUrdu) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const invTotal = toNum(invoice.invoice_total) || items.reduce((s, r) => s + toNum(r.amount), 0);
  const prev = toNum(invoice.previous_balance);
  const delivery = toNum(invoice.delivery_charges ?? invoice.deliveryCharges);
  const discount = toNum(invoice.discount);
  const grand = toNum(invoice.grand_total) || invTotal + prev + delivery - discount;

  const rows = items
    .map((row, idx) => {
      const product = row.product_name || maps.prod[String(row.product_id)] || row.product_id || "-";
      const category = row.category_name || maps.cat[String(row.category_id)] || row.category_id || "-";
      const unit = row.unit_name || maps.unit[String(row.unit_id)] || row.unit_id || "-";
      return `<tr>
        <td class="center">${idx + 1}</td>
        <td>${product}<div class="desc">${row.product_description || row.description || ""}</div></td>
        <td>${category}</td>
        <td class="center">${unit}</td>
        <td class="num">${money(row.qty || row.pieces_qty || row.carton_qty)}</td>
        <td class="num">${money(row.rate)}</td>
        <td class="num strong">${money(row.amount)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8"/>
<title>${invoice.invoice_no || "Sales Invoice"}</title>
<style>
body{font-family:${isUrdu ? "\"Noto Nastaliq Urdu\",\"Noto Naskh Arabic\",\"Jameel Noori Nastaleeq\",\"Segoe UI\",Arial,sans-serif" : "Arial,\"Segoe UI\",sans-serif"};direction:${isUrdu ? "rtl" : "ltr"};line-height:${isUrdu ? "1.9" : "1.4"};margin:0;background:#f8fafc;color:#111827}.page{padding:22px}.sheet{background:#fff;border:1px solid #d1d5db;border-radius:18px;overflow:hidden}.head{background:#111827;color:#fff;padding:18px 22px;display:flex;justify-content:space-between}.head h1{margin:0;font-size:24px}.body{padding:16px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.box{border:1px solid #d1d5db;border-radius:10px;padding:9px}.box small{display:block;color:#64748b;margin-bottom:5px;font-size:11px}.box b{font-size:14px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;color:#111827}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px}.center{text-align:center}.num{text-align:right;font-family:monospace}.strong{font-weight:900}.desc{font-size:10px;color:#64748b;margin-top:4px}.totals{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}}
</style>
</head>
<body><div class="page"><div class="sheet">
  <div class="head"><div><h1>Ali Cages</h1><div>${t.title}</div></div><div>${t.invoiceNo}: <b>${invoice.invoice_no || "-"}</b><br/>${t.date}: ${invoice.invoice_date || "-"}</div></div>
  <div class="body">
    <div class="grid">
      <div class="box"><small>${t.invoiceNo}</small><b>${invoice.invoice_no || "-"}</b></div>
      <div class="box"><small>${t.reference}</small><b>${invoice.reference_no || "-"}</b></div>
      <div class="box"><small>${t.name}</small><b>${invoice.party_name || invoice.customer_name || "-"}</b></div>
      <div class="box"><small>${t.dateFull}</small><b>${formatFullDate(invoice.invoice_date, isUrdu ? "ur" : "en")}</b></div>
      <div class="box"><small>${t.shipTo}</small><b>${invoice.shipment_to || "-"}</b></div>
    </div>
    <table><thead><tr><th>#</th><th>${t.product}</th><th>${t.category}</th><th>${t.unit}</th><th>${t.qty}</th><th>${t.rate}</th><th>${t.amount}</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totals">
      <div class="box"><small>${t.invoiceTotal}</small><b>${money(invTotal)}</b></div>
      <div class="box"><small>${t.previousBalance}</small><b>${money(prev)}</b></div>
      <div class="box"><small>${t.deliveryCharges}</small><b>${money(delivery)}</b></div>
      <div class="box"><small>${t.discount}${invoice.discount_type === "percent" ? ` (${money(invoice.discount_value)}%)` : ""}</small><b>${money(discount)}</b></div>
      <div class="box"><small>${t.grandTotal}</small><b>${money(grand)}</b></div>
    </div>
  </div>
</div></div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;

  const w = window.open("", "_blank", "width=1200,height=800");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function makeInvoiceSheet(invoice, maps, t, isUrdu) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const invTotal = toNum(invoice.invoice_total) || items.reduce((s, r) => s + toNum(r.amount), 0);
  const prev = toNum(invoice.previous_balance);
  const delivery = toNum(invoice.delivery_charges ?? invoice.deliveryCharges);
  const discount = toNum(invoice.discount);
  const grand = toNum(invoice.grand_total) || invTotal + prev + delivery - discount;

  const rows = items
    .map((row, idx) => {
      const product = row.product_name || maps.prod[String(row.product_id)] || row.product_id || "-";
      const category = row.category_name || maps.cat[String(row.category_id)] || row.category_id || "-";
      const unit = row.unit_name || maps.unit[String(row.unit_id)] || row.unit_id || "-";
      return `<tr>
        <td class="center">${idx + 1}</td>
        <td>${product}<div class="desc">${row.product_description || row.description || ""}</div></td>
        <td>${category}</td>
        <td class="center">${unit}</td>
        <td class="num">${money(row.qty || row.pieces_qty || row.carton_qty)}</td>
        <td class="num">${money(row.rate)}</td>
        <td class="num strong">${money(row.amount)}</td>
      </tr>`;
    })
    .join("");

  return `<div class="sheet">
    <div class="head"><div><h1>Ali Cages</h1><div>${t.title}</div></div><div>${t.invoiceNo}: <b>${invoice.invoice_no || "-"}</b><br/>${t.date}: ${invoice.invoice_date || "-"}</div></div>
    <div class="body">
      <div class="grid">
        <div class="box"><small>${t.invoiceNo}</small><b>${invoice.invoice_no || "-"}</b></div>
        <div class="box"><small>${t.reference}</small><b>${invoice.reference_no || "-"}</b></div>
        <div class="box"><small>${t.name}</small><b>${invoice.party_name || invoice.customer_name || "-"}</b></div>
        <div class="box"><small>${t.dateFull}</small><b>${formatFullDate(invoice.invoice_date, isUrdu ? "ur" : "en")}</b></div>
        <div class="box"><small>${t.shipTo}</small><b>${invoice.shipment_to || "-"}</b></div>
      </div>
      <table><thead><tr><th>#</th><th>${t.product}</th><th>${t.category}</th><th>${t.unit}</th><th>${t.qty}</th><th>${t.rate}</th><th>${t.amount}</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <div class="box"><small>${t.invoiceTotal}</small><b>${money(invTotal)}</b></div>
        <div class="box"><small>${t.previousBalance}</small><b>${money(prev)}</b></div>
        <div class="box"><small>${t.deliveryCharges}</small><b>${money(delivery)}</b></div>
        <div class="box"><small>${t.discount}${invoice.discount_type === "percent" ? ` (${money(invoice.discount_value)}%)` : ""}</small><b>${money(discount)}</b></div>
        <div class="box"><small>${t.grandTotal}</small><b>${money(grand)}</b></div>
      </div>
    </div>
  </div>`;
}

function printBulkInvoices(invoices, maps, t, isUrdu) {
  const sheets = invoices.map((invoice) => makeInvoiceSheet(invoice, maps, t, isUrdu)).join("<div class='page-break'></div>");
  const html = `<!doctype html>
<html dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8"/>
<title>${t.bulkPrint}</title>
<style>
body{font-family:${isUrdu ? "\"Noto Nastaliq Urdu\",\"Noto Naskh Arabic\",\"Jameel Noori Nastaleeq\",\"Segoe UI\",Arial,sans-serif" : "Arial,\"Segoe UI\",sans-serif"};direction:${isUrdu ? "rtl" : "ltr"};line-height:${isUrdu ? "1.9" : "1.4"};margin:0;background:#f8fafc;color:#111827}.page{padding:22px}.sheet{background:#fff;border:1px solid #d1d5db;border-radius:18px;overflow:hidden;margin-bottom:18px}.head{background:#111827;color:#fff;padding:18px 22px;display:flex;justify-content:space-between}.head h1{margin:0;font-size:24px}.body{padding:16px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.box{border:1px solid #d1d5db;border-radius:10px;padding:9px}.box small{display:block;color:#64748b;margin-bottom:5px;font-size:11px}.box b{font-size:14px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;color:#111827}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px}.center{text-align:center}.num{text-align:right;font-family:monospace}.strong{font-weight:900}.desc{font-size:10px;color:#64748b;margin-top:4px}.totals{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.page-break{page-break-after:always}@media print{body{background:white}.page{padding:0}.sheet{border:none;border-radius:0}.page-break{page-break-after:always}}
</style>
</head>
<body><div class="page">${sheets}</div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;

  const w = window.open("", "_blank", "width=1200,height=800");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function SalesInvoicePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const { data: customers, loading: cuLoading } = useLookup(CUSTOMERS_API);
  const { data: employees, loading: emLoading } = useLookup(EMPLOYEES_API);
  const { data: suppliers, loading: suLoading } = useLookup(SUPPLIERS_API);
  const { data: generalLedgers, loading: glLoading } = useLookup(GENERAL_LEDGERS_API);
  const { data: categories, loading: catLoading } = useLookup(CATEGORIES_API);
  const { data: products, loading: prodLoading } = useLookup(PRODUCTS_API);
  const { data: units, loading: unLoading } = useLookup(UNITS_API);
  const [productTypes, setProductTypes] = useState([]);
  const [salesRates, setSalesRates] = useState([]);

  const [invoices, setInvoices] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [items, setItems] = useState(defaultInvoiceItems(5));
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [bulkPrinting, setBulkPrinting] = useState(false);
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const partyBalanceRequestId = useRef(0);

  const mastersLoading = cuLoading || emLoading || suLoading || glLoading || catLoading || prodLoading || unLoading;

  useEffect(() => {
    let alive = true;
    axios.get(RATES_API)
      .then((res) => { if (alive) setSalesRates(getList(res.data)); })
      .catch(() => { if (alive) setSalesRates([]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(SALE_ORDERS_API);
        const dropdowns = res.data?.dropdowns || {};
        const list = getList(dropdowns.product_types || dropdowns.types || res.data?.product_types || res.data?.types);
        if (alive) setProductTypes(list);
      } catch {
        if (alive) setProductTypes([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const customerMap = useMemo(() => makeMap(customers, getCustomerName), [customers]);
  const employeeMap = useMemo(() => makeMap(employees, getEmployeeName), [employees]);
  const supplierMap = useMemo(() => makeMap(suppliers, getSupplierName), [suppliers]);
  const ledgerMap = useMemo(() => makeMap(generalLedgers, getLedgerName), [generalLedgers]);
  const categoryMap = useMemo(() => makeMap(categories, getCategoryName), [categories]);
  const productMap = useMemo(() => makeMap(products, getProductName), [products]);
  const unitMap = useMemo(() => makeMap(units, getUnitName), [units]);
  const typeMap = useMemo(() => makeMap(productTypes, getTypeName), [productTypes]);
  const defaultFmsTypeId = useMemo(() => getDefaultFmsTypeId(productTypes), [productTypes]);
  const rateListNames = useMemo(() => [...new Set(salesRates.map((r) => String(r.list_name || "Default Rate List").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [salesRates]);

  const partyOptions = useMemo(() => {
    if (form.party_type === "employee") return employees.map((x) => makePartyOption(x, getEmployeeName));
    if (form.party_type === "supplier") return suppliers.map((x) => makePartyOption(x, getSupplierName));
    if (form.party_type === "general_ledger") return generalLedgers.map((x) => makePartyOption(x, getLedgerName));
    if (form.party_type === "customer") return customers.map((x) => makePartyOption(x, getCustomerName));
    return [];
  }, [form.party_type, customers, employees, suppliers, generalLedgers]);

  const getInvoicePartyName = useCallback(
    (inv) => {
      const type = getInvPartyType(inv);
      const id = String(getInvPartyId(inv));
      const fallback = inv.party_name || inv.customer_name || inv.employee_name || inv.supplier_name || inv.general_ledger_name || "";
      if (type === "employee") return employeeMap[id] || fallback;
      if (type === "supplier") return supplierMap[id] || fallback;
      if (type === "general_ledger") return ledgerMap[id] || fallback;
      return customerMap[id] || fallback;
    },
    [customerMap, employeeMap, supplierMap, ledgerMap]
  );

  const toast = useCallback((type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2800);
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoadingInv(true);
    try {
      const res = await axios.get(API_BASE);
      setInvoices(getList(res.data));
    } catch {
      toast("error", t.loadError);
    } finally {
      setLoadingInv(false);
    }
  }, [t.loadError, toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (!defaultFmsTypeId) return;
    setItems((prev) =>
      prev.map((row) => (row.product_type_id ? row : { ...row, product_type_id: defaultFmsTypeId }))
    );
  }, [defaultFmsTypeId]);

  const invTotal = useMemo(() => items.reduce((sum, row) => sum + toNum(row.amount), 0), [items]);
  const totalQty = useMemo(() => items.reduce((sum, row) => sum + toNum(row.qty || row.pieces_qty || row.carton_qty), 0), [items]);
  const discountAmount = calculateDiscountAmount(invTotal, form.discount, form.discount_type);
  const grandTotal = invTotal + Math.round(toNum(form.previous_balance)) + toNum(form.delivery_charges) - discountAmount;

  const summary = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        const total = toNum(inv.grand_total) || toNum(inv.invoice_total);
        acc.totalInvoices += 1;
        acc.totalItems += Number(inv.items_count || inv.items?.length || 0);
        acc.totalValue += total;
        acc.totalPrev += toNum(inv.previous_balance);
        acc.totalDiscount += toNum(inv.discount);
        acc.totalDelivery += toNum(inv.delivery_charges ?? inv.deliveryCharges);
        return acc;
      },
      { totalInvoices: 0, totalItems: 0, totalValue: 0, totalPrev: 0, totalDiscount: 0, totalDelivery: 0 }
    );
  }, [invoices]);

  const filtered = useMemo(() => {
    const customerQ = customerFilter.toLowerCase().trim();
    let list = invoices;

    if (dateFrom || dateTo) {
      list = list.filter((inv) => {
        const value = String(inv.invoice_date || "").slice(0, 10);
        if (!value) return false;
        if (dateFrom && value < dateFrom) return false;
        if (dateTo && value > dateTo) return false;
        return true;
      });
    }

    if (customerQ) {
      list = list.filter((inv) => getInvoicePartyName(inv).toLowerCase().includes(customerQ));
    }

    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((inv) =>
      [inv.invoice_no, inv.reference_no, getInvoicePartyName(inv), inv.invoice_date, inv.due_date, inv.shipment_to]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [invoices, search, customerFilter, dateFrom, dateTo, getInvoicePartyName]);

  const openAdd = async () => {
    partyBalanceRequestId.current += 1;
    setBalanceLoading(false);
    setEditingId(null);
    setItems(defaultInvoiceItems(5));
    setForm({ ...emptyForm(), invoice_no: genInvoiceNo(invoices) });
    setShowForm(true);

    try {
      const res = await axios.get(`${API_BASE}/next-number`);
      const nextNumber = res.data?.invoice_no || res.data?.data?.invoice_no;
      if (nextNumber) {
        setForm((current) => ({ ...current, invoice_no: nextNumber }));
      }
    } catch (error) {
      console.warn("Could not fetch next invoice number; using local fallback.", error);
    }
  };

  const openEdit = async (id) => {
    partyBalanceRequestId.current += 1;
    setBalanceLoading(false);
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const inv = res.data?.data || res.data;
      const pType = getInvPartyType(inv);
      const pId = String(getInvPartyId(inv) || "");
      setEditingId(inv.id);
      setForm({
        invoice_no: inv.invoice_no || "",
        reference_no: inv.reference_no || "",
        party_type: pType || "",
        party_id: pId,
        customer_id: pType === "customer" ? pId : "",
        invoice_date: inv.invoice_date || today(),
        due_date: inv.due_date || "",
        shipment_to: inv.shipment_to || "",
        rate_list_name: inv.rate_list_name || "",
        previous_balance: roundPreviousBalance(inv.previous_balance),
        delivery_charges: String(inv.delivery_charges ?? inv.deliveryCharges ?? 0),
        discount: String(inv.discount_value ?? inv.discount ?? 0),
        discount_type: inv.discount_type === "percent" ? "percent" : "flat",
      });
      setItems(
        Array.isArray(inv.items) && inv.items.length
          ? inv.items.map((row) => ({
              category_id: String(row.category_id ?? row.category?.id ?? ""),
              product_id: String(row.product_id ?? row.product?.id ?? ""),
              product_description: String(row.product_description ?? row.description ?? ""),
              product_type_id: String(row.product_type_id ?? row.productTypeId ?? row.type_id ?? row.typeId ?? ""),
              unit_id: String(row.unit_id ?? row.unit?.id ?? ""),
              sale_type: String(row.sale_type || "single"),
              rate_manual: true, // A saved invoice keeps its historical rate until mode/product changes.
              carton_qty: String(row.carton_qty || ""),
              pieces_qty: String(row.pieces_qty || ""),
              qty: String(row.qty || row.quantity || ""),
              pieces_per_carton: String(row.pieces_per_carton || 0),
              rate: String(row.rate || 0),
              amount: String(row.amount || 0),
            }))
          : defaultInvoiceItems(5)
      );
      setShowForm(true);
    } catch {
      toast("error", t.editError);
    }
  };

  const rateForRow = useCallback((row, prod, customerId = form.party_type === "customer" ? form.party_id : null, listName = form.rate_list_name || "") => {
    const mode = row.sale_type === "single" ? "single" : "retail";
    const listed = resolveSalesRate(salesRates, {
      customerId,
      productId: row.product_id || getProductId(prod || {}),
      categoryId: row.category_id || getProductCatId(prod || {}),
      productTypeId: row.product_type_id || getProductTypeId(prod || {}),
      unitId: row.unit_id || getProductUnitId(prod || {}),
      rateMode: mode,
      listName,
    });
    // Try a product-ID match from the rate-list catalog if strict option
    // matching fails (for example, a stale category/type/unit ID).
    const catalogRate = getCatalogRate(salesRates, row, prod, customerId, listName);
    return catalogRate || listed?.rate || getProductModeRate(prod || {}, row.sale_type) || 0;
  }, [salesRates, form.party_type, form.party_id, form.rate_list_name]);

  // Refresh auto-filled rates if the rate list loads after a product was chosen.
  // Never overwrite a rate typed by the user or saved on an older invoice.
  useEffect(() => {
    if (!salesRates.length || !products.length) return;
    setItems((prev) => prev.map((row) => {
      if (!row.product_id || row.rate_manual) return row;
      const product = products.find((p) => sameId(getProductId(p), row.product_id));
      const nextRate = rateForRow(row, product);
      if (String(row.rate) === String(nextRate)) return row;
      return { ...row, rate: String(nextRate), amount: String((toNum(row.qty) * nextRate).toFixed(2)) };
    }));
  }, [salesRates, products, rateForRow]);

  const calcRow = useCallback(
    (row) => {
      const prod = products.find((p) => sameId(getProductId(p), row.product_id));
      const qty = toNum(row.qty);
      const rate = row.rate === "" || row.rate == null ? toNum(rateForRow(row, prod)) : toNum(row.rate);
      return {
        qty: String(qty || ""),
        pieces_qty: String(qty || ""),
        amount: String((qty * rate).toFixed(2)),
        rate: String(rate),
        pieces_per_carton: "0",
      };
    },
    [products, rateForRow]
  );

  const handleItemChange = (index, field, value) => {
    setItems((prev) => prev.map((row, i) => {
      if (i !== index) return row;
      const selection = field === "product_choice" ? parseInvoiceProductChoice(value) : null;
      const next = selection ? { ...row, ...selection } : { ...row, [field]: value };

      if (field === "product_id" || field === "product_choice") {
        const selectedProductId = selection?.product_id ?? value;
        const prod = products.find((p) => sameId(getProductId(p), selectedProductId));
        if (prod) {
          next.sale_type = getProductSaleMode(prod);
          next.category_id = String(getProductCatId(prod) || next.category_id || "");
          next.unit_id = String(getProductUnitId(prod) || "");
          next.product_type_id = String(getProductTypeId(prod) || next.product_type_id || defaultFmsTypeId || "");
        }
        next.product_description = "";
        next.rate_manual = false;
        next.rate = String(rateForRow(next, prod) || 0);
        next.carton_qty = "";
        next.pieces_qty = "";
        next.pieces_per_carton = "0";
        next.qty = "";
      }

      // BOTH modes auto-fill their matching rate (Single -> single_rate,
      // Multiple -> retail_rate); the numeric input remains editable.
      if (field === "sale_type" || (["category_id", "product_type_id", "unit_id"].includes(field) && next.product_id)) {
        const prod = products.find((p) => sameId(getProductId(p), next.product_id));
        next.rate_manual = false;
        next.rate = String(rateForRow(next, prod) || 0);
      }
      if (field === "rate") next.rate_manual = true;
      if (field === "product_description") return next;

      const calculated = calcRow(next);
      return { ...next, ...calculated };
    }));
  };

  const addRow = () => setItems((prev) => [...prev, emptyItem()]);
  const removeRow = (index) => setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const handlePartyTypeChange = (value) => {
    partyBalanceRequestId.current += 1;
    setBalanceLoading(false);
    setForm((prev) => ({ ...prev, party_type: value, party_id: "", customer_id: "", previous_balance: "0" }));
  };

  const handlePartyChange = async (value) => {
    const selected = partyOptions.find((x) => String(x.id) === String(value));
    const isCustomer = form.party_type === "customer";
    const selectedPartyType = form.party_type;
    const requestId = ++partyBalanceRequestId.current;
    setBalanceLoading(Boolean(value));
    setForm((prev) => ({
      ...prev,
      party_id: value,
      customer_id: prev.party_type === "customer" ? value : "",
      previous_balance: value ? roundPreviousBalance(selected?.previous_balance) : "0",
    }));

    // Always fetch the posted/remaining ledger balance, not master opening balance.
    // For an invoice being edited, its saved balance snapshot is kept by openEdit.
    if (value) {
      try {
        let balance;
        if (isCustomer) {
          const res = await axios.get(`${CUSTOMER_LEDGER_API}/${encodeURIComponent(value)}/details`);
          balance = res.data?.data?.summary?.closing_balance;
        } else if (selectedPartyType === "supplier" && selected) {
          // Supplier master already exposes its calculated closing balance.
          balance = selected.previous_balance;
        } else {
          const res = await axios.get(LEDGER_SUMMARY_API, {
            params: { type: selectedPartyType === "general_ledger" ? "general" : selectedPartyType },
          });
          const match = (res.data?.rows || []).find((entry) =>
            String(entry.entity_id) === String(value)
          );
          if (!match) throw new Error("Ledger account not found");
          balance = match.closing_balance;
        }
        if (balance == null || !Number.isFinite(Number(balance))) throw new Error("Invalid ledger balance");
        if (partyBalanceRequestId.current === requestId) {
          setForm((current) => current.party_id === value && current.party_type === selectedPartyType
            ? { ...current, previous_balance: roundPreviousBalance(balance) }
            : current);
        }
      } catch {
        if (partyBalanceRequestId.current === requestId) toast("error", t.balanceLoadError);
      } finally {
        if (partyBalanceRequestId.current === requestId) setBalanceLoading(false);
      }
    }
    if (isCustomer) {
      setItems((prev) => prev.map((row) => {
        if (!row.product_id || row.rate_manual) return row;
        const prod = products.find((p) => sameId(getProductId(p), row.product_id));
        const nextRate = rateForRow(row, prod, value);
        return { ...row, rate: String(nextRate), amount: String((toNum(row.qty) * nextRate).toFixed(2)) };
      }));
    }
  };

  const handleRateListChange = (value) => {
    setForm((prev) => ({ ...prev, rate_list_name: value }));
    setItems((prev) => prev.map((row) => {
      if (!row.product_id || row.rate_manual) return row;
      const prod = products.find((p) => sameId(getProductId(p), row.product_id));
      const nextRate = rateForRow(row, prod, form.party_type === "customer" ? form.party_id : null, value);
      return { ...row, rate: String(nextRate), amount: String((toNum(row.qty) * nextRate).toFixed(2)) };
    }));
  };

  const preparePayload = () => {
    if (!String(form.invoice_no || "").trim()) throw new Error(t.requiredInvoice);
    if (!form.party_type) throw new Error(t.requiredPartyType);
    if (!form.party_id) throw new Error(t.requiredParty);

    const validItems = items
      .map((row, idx) => {
        const prod = products.find((p) => sameId(getProductId(p), row.product_id));
        const enriched = {
          ...row,
          category_id: row.category_id || getProductCatId(prod || {}),
          unit_id: row.unit_id || getProductUnitId(prod || {}),
          product_type_id: row.product_type_id || getProductTypeId(prod || {}) || defaultFmsTypeId,
          rate: row.rate === "" || row.rate == null ? getProductModeRate(prod || {}, row.sale_type) : row.rate,
          pieces_per_carton: 0,
        };
        const calculated = calcRow(enriched);
        const qty = toNum(calculated.qty || enriched.qty || enriched.pieces_qty || enriched.carton_qty);
        const amount = toNum(calculated.amount || enriched.amount);

        return {
          sr: idx + 1,
          category_id: Number(enriched.category_id) || null,
          product_id: Number(enriched.product_id) || null,
          product_type_id: Number(enriched.product_type_id) || null,
          product_description: String(enriched.product_description || "").trim(),
          description: String(enriched.product_description || "").trim(),
          unit_id: Number(enriched.unit_id) || null,
          sale_type: enriched.sale_type === "single" ? "single" : "multiple",
          carton_qty: 0,
          pieces_qty: qty,
          qty,
          quantity: qty,
          pieces_per_carton: 0,
          rate: toNum(calculated.rate),
          amount,
        };
      })
      .filter((row) => row.product_id && row.qty > 0);

    if (!validItems.length) throw new Error(t.requiredItem);
    if (Number(form.discount) < 0 || (form.discount_type === "percent" && toNum(form.discount) > 100)) {
      throw new Error(form.discount_type === "percent" ? "Percentage discount must be between 0 and 100." : "Discount cannot be negative.");
    }

    const partyId = Number(form.party_id);
    const total = validItems.reduce((sum, row) => sum + toNum(row.amount), 0);
    const delivery = toNum(form.delivery_charges);
    const previous = Math.round(toNum(form.previous_balance));
    const discount = calculateDiscountAmount(total, form.discount, form.discount_type);
    const partyName = partyOptions.find((p) => String(p.id) === String(form.party_id))?.name || "";

    return {
      invoice_no: form.invoice_no.trim(),
      reference_no: form.reference_no.trim(),
      customer_type: form.party_type,
      party_type: form.party_type,
      party_id: partyId,
      party_name: partyName,
      customer_id: form.party_type === "customer" ? partyId : null,
      employee_id: form.party_type === "employee" ? partyId : null,
      supplier_id: form.party_type === "supplier" ? partyId : null,
      general_ledger_id: form.party_type === "general_ledger" ? partyId : null,
      invoice_date: form.invoice_date,
      due_date: form.due_date || null,
      shipment_to: form.shipment_to || "",
      rate_list_name: form.rate_list_name || null,
      previous_balance: previous,
      delivery_charges: delivery,
      discount,
      discount_type: form.discount_type === "percent" ? "percent" : "flat",
      discount_value: Math.max(0, toNum(form.discount)),
      invoice_total: total,
      grand_total: total + previous + delivery - discount,
      items: validItems,
    };
  };

  const handleSave = async () => {
    if (balanceLoading) return;
    let payload;
    try {
      payload = preparePayload();
    } catch (err) {
      toast("error", err.message);
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, payload);
        toast("success", t.updated);
      } else {
        await axios.post(API_BASE, payload);
        toast("success", t.saved);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      setItems(defaultInvoiceItems(5));
      fetchInvoices();
    } catch {
      toast("error", t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      toast("success", t.deleted);
      fetchInvoices();
    } catch {
      toast("error", t.loadError);
    }
  };

  const handlePrint = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const inv = res.data?.data || res.data;
      const normItems = (inv.items || []).map((row, index) => ({
        sr: row.sr || index + 1,
        category_id: String(row.category_id ?? row.category?.id ?? ""),
        product_id: String(row.product_id ?? row.product?.id ?? ""),
        unit_id: String(row.unit_id ?? row.unit?.id ?? ""),
        product_description: row.product_description || row.description || "",
        category_name: row.category_name || categoryMap[String(row.category_id ?? "")] || "",
        product_name: row.product_name || productMap[String(row.product_id ?? "")] || "",
        unit_name: row.unit_name || unitMap[String(row.unit_id ?? "")] || "",
        sale_type: row.sale_type || "single",
        carton_qty: row.carton_qty || "",
        pieces_qty: row.pieces_qty || "",
        pieces_per_carton: row.pieces_per_carton || 0,
        qty: row.qty || row.quantity || "",
        rate: row.rate || 0,
        amount: row.amount || 0,
      }));

      const partyName = getInvoicePartyName(inv);
      printInvoice({ ...inv, party_name: inv.party_name || partyName, items: normItems }, { cat: categoryMap, prod: productMap, unit: unitMap }, t, isUrdu);
    } catch {
      toast("error", t.printError);
    }
  };

  const normalizeInvoiceForPrint = useCallback(
    (inv) => {
      const normItems = (inv.items || []).map((row, index) => ({
        sr: row.sr || index + 1,
        category_id: String(row.category_id ?? row.category?.id ?? ""),
        product_id: String(row.product_id ?? row.product?.id ?? ""),
        unit_id: String(row.unit_id ?? row.unit?.id ?? ""),
        product_description: row.product_description || row.description || "",
        category_name: row.category_name || categoryMap[String(row.category_id ?? "")] || "",
        product_name: row.product_name || productMap[String(row.product_id ?? "")] || "",
        unit_name: row.unit_name || unitMap[String(row.unit_id ?? "")] || "",
        sale_type: row.sale_type || "single",
        carton_qty: row.carton_qty || "",
        pieces_qty: row.pieces_qty || "",
        pieces_per_carton: row.pieces_per_carton || 0,
        qty: row.qty || row.quantity || "",
        rate: row.rate || 0,
        amount: row.amount || 0,
      }));
      const partyName = getInvoicePartyName(inv);
      return { ...inv, party_name: inv.party_name || partyName, items: normItems };
    },
    [categoryMap, productMap, unitMap, getInvoicePartyName]
  );

  const handleBulkPrint = async () => {
    if (!filtered.length) {
      toast("error", t.noRecords);
      return;
    }

    try {
      setBulkPrinting(true);
      const detailed = await Promise.all(
        filtered.map(async (inv) => {
          const res = await axios.get(`${API_BASE}/${inv.id}`);
          return normalizeInvoiceForPrint(res.data?.data || res.data);
        })
      );
      printBulkInvoices(detailed, { cat: categoryMap, prod: productMap, unit: unitMap }, t, isUrdu);
    } catch {
      toast("error", t.printError);
    } finally {
      setBulkPrinting(false);
    }
  };

  return (
    <div dir={dir} className="invoice-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        *{box-sizing:border-box}
        .invoice-page{min-height:100vh;background:#F4F7FB;padding:18px;color:#0f172a;font-family:${isUrdu ? "'Noto Nastaliq Urdu', serif" : "Arial, sans-serif"};overflow-x:hidden}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .page-wrap{max-width:1220px;width:100%;margin:0 auto}.form-page-wrap{max-width:1220px;width:100%;margin:0 auto;animation:fadeSlide .22s ease-out both}.fullPageInputBox{width:100%!important;max-width:100%!important;min-height:calc(100vh - 36px);box-shadow:0 18px 48px rgba(15,23,42,.08)!important}.top-card{background:rgba(255,255,255,.94);border:1px solid #D6E0EE;border-radius:12px;padding:20px 22px;box-shadow:0 18px 48px rgba(15,23,42,.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.title{margin:0;font-size:30px;font-weight:950;letter-spacing:-.8px}.subtitle{margin:5px 0 0;color:#64748b;font-size:13px}.btn{border:1px solid #cbd5e1;background:white;color:#0f172a;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.12s;box-shadow:none}.btn:hover{background:#f8fafc;transform:none;filter:none}.btn-primary{background:#4A86F7;color:white;border:1px solid #4A86F7;box-shadow:0 8px 18px rgba(74,134,247,.18)}.btn-primary:hover{background:#2563eb;color:white}.btn-soft{background:white;color:#0f172a;border:1px solid #cbd5e1}.btn-active{background:#f8fafc;color:#0f172a;border:1px solid #94a3b8}.btn-green{background:white;color:#0f172a;border:1px solid #cbd5e1}.btn-red{background:white;color:#0f172a;border:1px solid #cbd5e1}.btn-yellow{background:white;color:#0f172a;border:1px solid #cbd5e1}.summary-grid{animation:fadeSlide .24s ease-out both;display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:14px 0}.summary-card{background:white;border:1px solid #D6E0EE;border-radius:18px;padding:14px;box-shadow:0 8px 22px rgba(15,23,42,.05);animation:pop .22s ease-out both}.summary-card small{display:block;color:#64748b;font-size:10.5px;font-weight:950;text-transform:uppercase;letter-spacing:.5px}.summary-card b{display:block;margin-top:7px;font-size:18px;font-weight:950;font-family:monospace}.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.search{width:min(430px,100%);height:40px;border:1px solid #cbd5e1;border-radius:14px;padding:0 13px;font-size:13px;outline:none;background:white}.filter{height:36px;border:1px solid #cbd5e1;border-radius:12px;background:white;padding:0 10px;font-weight:800;color:#475569;cursor:pointer}.filter.active{background:#0B4E9B;color:white;border-color:#0B4E9B}.card{background:white;border:1px solid #E2E8F0;border-radius:16px;box-shadow:0 1px 3px rgba(15,23,42,.055);overflow:hidden}.table-wrap{overflow-x:auto}table.list{width:100%;min-width:1180px;border-collapse:separate;border-spacing:0;table-layout:auto}table.list th{background:#F8FAFD;color:#64748B;font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:11px 12px;border-bottom:1px solid #E2E8F0;white-space:nowrap}table.list td{padding:12px;border-bottom:1px solid #EEF2F7;font-size:12px;vertical-align:middle}table.list tr:hover td{background:#F8FBFF}.invoice-number-cell{min-width:130px;white-space:nowrap}.invoice-party-cell{min-width:210px;max-width:260px}.invoice-party-name{display:block;line-height:1.5;word-break:normal;overflow-wrap:break-word;color:#334155}.invoice-ship-cell{min-width:150px;max-width:220px;line-height:1.45}.invoice-action-cell{width:180px;min-width:180px}.invoice-action-group{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:nowrap}.invoice-icon-btn{width:34px;height:34px;min-width:34px;padding:0!important;border:1px solid #E2E8F0;border-radius:8px;background:#fff;color:#64748B;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:.16s}.invoice-icon-btn:hover{background:#EFF6FF;border-color:#BFDBFE;color:#0B4E9B}.invoice-icon-btn.primary{background:#0B4E9B;border-color:#0B4E9B;color:#fff}.invoice-icon-btn.primary:hover{background:#0A65BD;border-color:#0A65BD;color:#fff}.invoice-icon-btn.danger:hover{background:#FFF1F2;border-color:#FECDD3;color:#BE123C}.toast{position:fixed;${isUrdu ? "left" : "right"}:18px;bottom:18px;z-index:120;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 20px 50px rgba(15,23,42,.25)}
        .modal-back{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(6px);z-index:80;display:flex;align-items:flex-start;justify-content:center;padding:12px;overflow:auto}.invoice-modal{width:min(1060px,100%);background:#f8fafc;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 30px 90px rgba(15,23,42,.28);overflow:hidden;animation:fadeSlide .22s ease-out both}.modal-title{height:54px;background:#13263A;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 18px}.modal-title h2{margin:0;font-size:17px;font-weight:900}.mode-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.10);border-radius:999px;padding:3px 9px;font-size:9.5px;font-weight:900;margin-bottom:3px}.close-btn{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:white;width:34px;height:32px;border-radius:10px;cursor:pointer;font-size:18px}.modal-body{padding:14px;background:#f3f6fb;max-height:calc(100vh - 112px);overflow:auto}.form-box{background:white;border:1px solid #D6E0EE;border-radius:14px;padding:10px;box-shadow:0 8px 20px rgba(15,23,42,.045);margin-bottom:10px}.top-line{display:grid;grid-template-columns:150px 235px 130px 160px 120px 210px;gap:8px;align-items:end}.second-line{display:grid;grid-template-columns:1fr 145px 145px 145px;gap:8px;align-items:end}.label{font-size:11px;color:#334155;margin-bottom:5px;display:block;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.input,.select,.product-input{width:100%;height:34px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 9px;font-size:13px;border-radius:10px;outline:none;font-weight:650;box-shadow:none;transition:.16s}.input:focus,.select:focus,.product-input:focus,.search:focus{border-color:#0B4E9B;box-shadow:0 0 0 3px rgba(79,70,229,.10)}.date-box{display:grid;grid-template-columns:105px 1fr;gap:6px}.date-preview{height:34px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc;padding:7px 9px;font-size:11px;font-weight:900;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.section-head{height:38px;background:linear-gradient(135deg,#EFF6FF,#f8fafc);border:1px solid #cbd5e1;border-radius:14px 14px 0 0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;margin-top:12px;font-weight:950;color:#0f172a;box-shadow:0 10px 24px rgba(15,23,42,.045)}.section-body{background:white;border:1px solid #D6E0EE;border-top:none;border-radius:0 0 14px 14px;padding:8px;box-shadow:0 12px 28px rgba(15,23,42,.055);overflow:auto}.product-table{width:100%;min-width:1030px;border-collapse:collapse;background:white}.product-table th,.product-table td{border:1px solid #D6E0EE;padding:5px;font-size:12px}.product-table th{background:#e2e8f0;text-align:center;color:#334155;font-weight:900}.product-table tr:last-child td{border-bottom:none}.product-table td:last-child,.product-table th:last-child{border-right:none}.totals-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.total-box{border:1px solid #D6E0EE;background:linear-gradient(180deg,#fff,#f8fafc);border-radius:18px;padding:12px 14px;box-shadow:0 8px 20px rgba(15,23,42,.045)}.total-box label{display:block;font-size:10.5px;color:#64748b;margin-bottom:6px;font-weight:950;text-transform:uppercase}.total-box b{display:block;text-align:${isUrdu ? "left" : "right"};font-family:monospace;font-size:20px;letter-spacing:-.4px}.grand{background:#EFF6FF;border-color:#DBEAFE;color:#285DB8}.footer{padding:14px 0 0;display:flex;justify-content:flex-end;gap:10px;position:sticky;bottom:0;background:linear-gradient(180deg,rgba(248,250,252,0),#eef2f7 35%)}.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:flex;align-items:flex-start;justify-content:center;padding:12px;overflow:auto}.inputModalBox{width:min(1060px,100%);background:#f8fafc;border:1px solid #cbd5e1;border-radius:18px;box-shadow:0 30px 90px rgba(15,23,42,.28);overflow:hidden}.inputModalTitle{height:54px;background:#13263A;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:17px;font-weight:900}.closeBtn{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:white;width:34px;height:32px;border-radius:10px;cursor:pointer}.inputModalBody{padding:14px}.form-box{background:transparent;border:none;border-radius:0;padding:0;box-shadow:none;margin-bottom:0}.formTopLine{display:grid;grid-template-columns:135px 220px 120px 110px 175px 175px 160px;gap:10px;align-items:end;margin-bottom:10px}.basicLabel{font-size:11px;color:#334155;margin-bottom:5px;display:block;font-weight:900;text-transform:uppercase;letter-spacing:.35px}.basicInput,.basicSelect,.productInput{width:100%;height:34px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 9px;font-size:13px;border-radius:10px;outline:none;font-weight:650}.basicInput[readonly]{background:#f1f5f9}.basicInput:focus,.basicSelect:focus,.productInput:focus,.search:focus{border-color:#0B4E9B;box-shadow:0 0 0 3px rgba(79,70,229,.10)}.sectionHead{height:38px;background:linear-gradient(135deg,#EFF6FF,#f8fafc);border:1px solid #cbd5e1;border-radius:14px 14px 0 0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;margin-top:12px;font-weight:950;color:#0f172a}.basicBtn{height:32px;border:1px solid #cbd5e1;background:white;color:#0f172a;padding:5px 12px;font-size:12px;cursor:pointer;border-radius:10px;font-weight:850}.basicBtn:hover{background:#f8fafc}.basicBtnGreen{background:white;border-color:#cbd5e1;color:#0f172a}.basicBtnRed{background:white;border-color:#cbd5e1;color:#0f172a}.basicProductTable{width:100%;border-collapse:collapse;background:white;min-width:1030px}.basicProductTable th,.basicProductTable td{border:1px solid #D6E0EE;padding:5px;font-size:12px}.basicProductTable th{background:#e2e8f0;text-align:center;color:#334155;font-weight:900}.paymentPanel{border:1px solid #cbd5e1;border-top:none;padding:12px;background:white;border-radius:0 0 14px 14px;overflow:auto}.finalTotalBar{margin-top:12px;display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.totalBox{border:1px solid #D6E0EE;background:#f8fafc;border-radius:14px;padding:10px 12px}.totalBox label{display:block;font-size:11px;color:#64748b;margin-bottom:6px;font-weight:900}.totalBox b{display:block;text-align:${isUrdu ? "left" : "right"};font-family:monospace;font-size:18px}.grandBox{background:#EFF6FF;border-color:#DBEAFE;color:#285DB8}.modalFooterBasic{padding:12px 0 0;display:flex;justify-content:flex-end;gap:8px}@media(max-width:1120px){.summary-grid{grid-template-columns:repeat(2,1fr)}.top-line,.second-line{grid-template-columns:1fr 1fr}.date-box{grid-template-columns:1fr}.totals-grid{grid-template-columns:repeat(2,1fr)}table.list{min-width:860px}}@media(max-width:650px){.summary-grid,.top-line,.second-line,.totals-grid{grid-template-columns:1fr}.title{font-size:24px}}

        .inputModalBox{width:100%!important;max-width:100%!important}.inputModalBody{overflow-x:hidden}.formTopLine{grid-template-columns:150px 250px 140px 140px minmax(230px,1fr)!important}.formTopLine>div:nth-child(7){grid-column:1/-1}.date-box{display:grid;grid-template-columns:118px minmax(0,1fr)!important;gap:6px}.date-preview{min-width:0;text-overflow:ellipsis!important;white-space:nowrap}.paymentPanel{overflow-x:auto}.basicProductTable{min-width:1110px!important;table-layout:fixed}.basicProductTable th:nth-child(1),.basicProductTable td:nth-child(1){width:36px}.basicProductTable th:nth-child(2),.basicProductTable td:nth-child(2){width:170px}.basicProductTable th:nth-child(3),.basicProductTable td:nth-child(3){width:135px}.basicProductTable th:nth-child(4),.basicProductTable td:nth-child(4){width:145px}.basicProductTable th:nth-child(5),.basicProductTable td:nth-child(5){width:110px}.basicProductTable th:nth-child(6),.basicProductTable td:nth-child(6){width:110px}.basicProductTable th:nth-child(7),.basicProductTable td:nth-child(7){width:70px}.basicProductTable th:nth-child(8),.basicProductTable td:nth-child(8){width:85px}.basicProductTable th:nth-child(9),.basicProductTable td:nth-child(9){width:85px}.basicProductTable th:nth-child(10),.basicProductTable td:nth-child(10){width:70px}.basicProductTable th:nth-child(11),.basicProductTable td:nth-child(11){width:100px}.basicProductTable th:nth-child(12),.basicProductTable td:nth-child(12){width:36px}.productInput{min-width:0!important;padding:5px 6px!important}.finalTotalBar{grid-template-columns:repeat(3,1fr)!important}
        .invoice-mobile-list{display:none}.invoice-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.invoice-detail-box{border:1px solid #e2e8f0;border-radius:12px;background:white;padding:10px}.invoice-detail-box small{display:block;color:#64748b;font-size:10px;font-weight:800;text-transform:uppercase;margin-bottom:4px}.invoice-detail-box b{display:block;color:#13263a;font-size:13px}.invoice-detail-items{margin-top:12px;overflow:auto;border:1px solid #e2e8f0;border-radius:12px;background:white}.invoice-detail-items table{width:100%;min-width:720px;border-collapse:collapse}.invoice-detail-items th{background:#13263a;color:#fff;padding:9px;font-size:10px;text-transform:uppercase}.invoice-detail-items td{padding:9px;border-bottom:1px solid #eef2f7;font-size:12px}
@media(max-width:1250px){.formTopLine{grid-template-columns:repeat(3,minmax(0,1fr))!important}.formTopLine>div:nth-child(6){grid-column:1/-1}.date-box{grid-template-columns:125px minmax(0,1fr)!important}.inputModalBox{width:100%!important}.finalTotalBar{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:780px){.table-wrap table.list{display:none}.invoice-mobile-list{display:grid;gap:10px;padding:10px}.invoice-detail-grid{grid-template-columns:1fr 1fr}.formTopLine{grid-template-columns:1fr!important}.formTopLine>div:nth-child(7){grid-column:1}.date-box{grid-template-columns:1fr!important}.date-preview{min-width:0}.finalTotalBar{grid-template-columns:1fr!important}.basicProductTable{min-width:980px!important}.inputModalBody{padding:10px!important}}@media(max-width:520px){.invoice-detail-grid{grid-template-columns:1fr}.invoice-page{padding:10px}.top-card{padding:15px}.toolbar{gap:7px}}
        .invoiceHeaderGrid{display:grid;grid-template-columns:145px minmax(210px,1.25fr) minmax(160px,.9fr) minmax(180px,1fr) 185px;gap:10px;align-items:end;margin-bottom:10px}.invoiceHeaderGrid>div{min-width:0}.invoiceHeaderGrid .basicInput,.invoiceHeaderGrid .basicSelect{height:38px}.invoiceHeaderGrid .basicLabel{min-height:16px;display:flex;align-items:flex-end;margin-bottom:5px}.invoiceHeaderGrid>div:nth-child(6),.invoiceHeaderGrid>div:nth-child(7){max-width:185px}.invoiceHeaderGrid>div:nth-child(8){grid-column:3/6}.invoiceHeaderGrid>div:nth-child(8) .basicInput{width:100%}@media(max-width:1100px){.invoiceHeaderGrid{grid-template-columns:140px minmax(190px,1.2fr) minmax(145px,.85fr) minmax(165px,1fr) 170px}.invoiceHeaderGrid>div:nth-child(8){grid-column:3/6}}@media(max-width:920px){.invoiceHeaderGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.invoiceHeaderGrid>div:nth-child(6),.invoiceHeaderGrid>div:nth-child(7){max-width:none}.invoiceHeaderGrid>div:nth-child(8){grid-column:1/-1}}@media(max-width:640px){.invoiceHeaderGrid{grid-template-columns:1fr}.invoiceHeaderGrid>div:nth-child(8){grid-column:1}.invoiceHeaderGrid .basicInput,.invoiceHeaderGrid .basicSelect{height:40px}}


      `}</style>

      {msg.text && <div className="toast" style={{ background: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</div>}

      {!showForm && (
        <div className="page-wrap">
        <div className="top-card">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isUrdu ? "row-reverse" : "row" }}>
            <button className="btn btn-soft" onClick={() => setLang(isUrdu ? "en" : "ur")}>{t.toggleLang}</button>
            <button className={`btn ${showSummary ? "btn-active" : "btn-soft"}`} onClick={() => setShowSummary((v) => !v)}>{showSummary ? t.hideSummary : t.viewSummary}</button>
            <button className="btn btn-soft" onClick={fetchInvoices}>{loadingInv ? t.loading : t.refresh}</button>
            <button className="btn btn-primary" onClick={openAdd}>+ {t.newInvoice}</button>
          </div>
        </div>

        {showSummary && (
          <div className="summary-grid">
            {[
              [t.totalInvoices, summary.totalInvoices],
              [t.totalItems, summary.totalItems],
              [t.totalValue, money(summary.totalValue)],
              [t.totalPrev, money(summary.totalPrev)],
              [t.totalDelivery, money(summary.totalDelivery)],
              [t.totalDiscount, money(summary.totalDiscount)],
            ].map(([label, value], idx) => (
              <div className="summary-card" key={label} style={{ animationDelay: `${idx * 30}ms` }}>
                <small>{label}</small>
                <b>{value}</b>
              </div>
            ))}
          </div>
        )}

        <div className="toolbar">
          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
          <input className="search" style={{ width: "min(360px,100%)" }} value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} placeholder={t.customerInvoicePlaceholder} />
          <button className="btn btn-yellow" disabled={bulkPrinting || loadingInv || filtered.length === 0} onClick={handleBulkPrint}>{bulkPrinting ? t.bulkPrinting : `${t.bulkPrint} (${filtered.length})`}</button>
          {customerFilter.trim() && <span style={{ height: 36, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: 12, background: "#dcfce7", color: "#166534", fontWeight: 900, border: "1px solid #bbf7d0", fontSize: 12 }}>{t.allCustomerInvoices}</span>}
          <button className={`filter ${!dateFrom && !dateTo ? "active" : ""}`} onClick={() => { setDateFrom(""); setDateTo(""); }}>{t.all}</button>
          <button className={`filter ${dateFrom === today() && dateTo === today() ? "active" : ""}`} onClick={() => { const d = today(); setDateFrom(d); setDateTo(d); }}>{t.todayFilter}</button>
          <div className="camz-period-filter" aria-label="Invoice period filter">
            <label><span>{t.fromDate}</span><DateTextInput value={dateFrom} onChange={(v) => setDateFrom(v)} /></label>
            <span className="camz-period-separator">→</span>
            <label><span>{t.toDate}</span><DateTextInput value={dateTo} onChange={(v) => setDateTo(v)} /></label>
          </div>
          {(dateFrom || dateTo) && (
            <span className="camz-period-summary">
              {t.showingPeriod}: {dateFrom ? formatFullDate(dateFrom, lang) : "…"} — {dateTo ? formatFullDate(dateTo, lang) : "…"}
            </span>
          )}
        </div>

        <div className="card table-wrap">
          <table className="list">
            <thead>
              <tr>
                <th style={{ width: 45 }}>#</th>
                <th style={{ width: 135, textAlign: isUrdu ? "right" : "left" }}>{t.invoiceNo}</th>
                <th style={{ minWidth: 210, textAlign: isUrdu ? "right" : "left" }}>{t.name}</th>
                <th style={{ minWidth: 150, textAlign: isUrdu ? "right" : "left" }}>{t.shipTo}</th>
                <th style={{ width: 150 }}>{t.dateFull}</th>
                <th style={{ width: 150 }}>{t.dueDate}</th>
                <th style={{ width: 115, textAlign: "right" }}>{t.invoiceTotal}</th>
                <th style={{ width: 120, textAlign: "right" }}>{t.grandTotal}</th>
                <th style={{ width: 180 }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loadingInv ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 44, color: "#94a3b8" }}>{t.noRecords}</td></tr>
              ) : filtered.map((inv, idx) => (
                <tr
                  key={inv.id || idx}
                  onClick={() => setViewInvoice(inv)}
                  title="View invoice details"
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace" }}>{idx + 1}</td>
                  <td className="invoice-number-cell"><b style={{ fontFamily: "monospace", color: "#4A86F7" }}>{inv.invoice_no}</b><div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{inv.reference_no || "-"}</div></td>
                  <td className="invoice-party-cell"><b className="invoice-party-name">{getInvoicePartyName(inv)}</b><div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, textTransform: "capitalize" }}>{getInvPartyType(inv).replaceAll("_", " ")}</div></td>
                  <td className="invoice-ship-cell">{inv.shipment_to || "-"}</td>
                  <td style={{ textAlign: "center", fontSize: 12, fontWeight: 800 }}>{formatFullDate(inv.invoice_date, lang)}</td>
                  <td style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: inv.due_date ? "#b45309" : "#94a3b8" }}>{inv.due_date ? formatFullDate(inv.due_date, lang) : "—"}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900 }}>{money(inv.invoice_total)}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 900, color: "#1d4ed8" }}>{money(inv.grand_total)}</td>
                  <td className="invoice-action-cell" style={{ textAlign: "center" }}>
                    <div className="invoice-action-group">
                      <button className="invoice-icon-btn primary" title={t.viewDetails} aria-label={t.viewDetails} onClick={(e) => { e.stopPropagation(); setViewInvoice(inv); }}><Eye size={14} /></button>
                      <button className="invoice-icon-btn" title={t.edit} aria-label={t.edit} onClick={(e) => { e.stopPropagation(); openEdit(inv.id); }}><Pencil size={14} /></button>
                      <button className="invoice-icon-btn" title={t.print} aria-label={t.print} onClick={(e) => { e.stopPropagation(); handlePrint(inv.id); }}><Printer size={14} /></button>
                      <button className="invoice-icon-btn danger" title={t.delete} aria-label={t.delete} onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="invoice-mobile-list">
            {loadingInv ? (
              <div style={{padding:24,textAlign:"center",color:"#94a3b8"}}>{t.loading}</div>
            ) : filtered.length === 0 ? (
              <div style={{padding:24,textAlign:"center",color:"#94a3b8"}}>{t.noRecords}</div>
            ) : filtered.map((inv, idx) => (
              <article key={inv.id || idx} style={{border:"1px solid #e2e8f0",borderRadius:14,padding:13,background:"#fff",boxShadow:"0 4px 16px rgba(15,23,42,.04)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:11,color:"#64748b",fontWeight:800}}>#{idx + 1} · {formatFullDate(inv.invoice_date, lang)}</div>
                    <div style={{fontSize:15,fontWeight:950,color:"#13263a",marginTop:2}}>{inv.invoice_no}</div>
                    <div style={{fontSize:12,fontWeight:800,color:"#475569",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getInvoicePartyName(inv)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:800,textTransform:"uppercase"}}>{t.grandTotal}</div>
                    <div style={{fontFamily:"monospace",fontSize:15,fontWeight:950,color:"#1d4ed8"}}>{money(inv.grand_total)}</div>
                    {inv.due_date && <div style={{fontSize:10,color:"#b45309",fontWeight:800,marginTop:3}}>{t.dueDate}: {formatFullDate(inv.due_date, lang)}</div>}
                  </div>
                </div>
                <button className="btn btn-primary" style={{width:"100%",marginTop:12,height:38}} onClick={() => setViewInvoice(inv)}>{t.viewDetails}</button>
              </article>
            ))}
          </div>
        </div>
        </div>
      )}

      {viewInvoice && (
        <div className="modal-bg" onClick={() => setViewInvoice(null)}>
          <div className="inputModalBox" style={{maxWidth:920}} onClick={(e) => e.stopPropagation()}>
            <div className="inputModalTitle">
              <span>{t.viewDetails} · {viewInvoice.invoice_no}</span>
              <button className="closeBtn" onClick={() => setViewInvoice(null)}>×</button>
            </div>
            <div className="inputModalBody">
              <div className="invoice-detail-grid">
                <div className="invoice-detail-box"><small>{t.invoiceNo}</small><b>{viewInvoice.invoice_no}</b></div>
                <div className="invoice-detail-box"><small>{t.name}</small><b>{getInvoicePartyName(viewInvoice)}</b></div>
                <div className="invoice-detail-box"><small>{t.dateFull}</small><b>{formatFullDate(viewInvoice.invoice_date, lang)}</b></div>
                <div className="invoice-detail-box"><small>{t.dueDate}</small><b>{viewInvoice.due_date ? formatFullDate(viewInvoice.due_date, lang) : "—"}</b></div>
                <div className="invoice-detail-box"><small>{t.shipTo}</small><b>{viewInvoice.shipment_to || "—"}</b></div>
                <div className="invoice-detail-box"><small>{t.rateList}</small><b>{viewInvoice.rate_list_name || t.rateListAuto}</b></div>
                <div className="invoice-detail-box"><small>{t.invoiceTotal}</small><b>{money(viewInvoice.invoice_total)}</b></div>
                <div className="invoice-detail-box"><small>{t.previousBalance}</small><b>{money(viewInvoice.previous_balance)}</b></div>
                <div className="invoice-detail-box"><small>{t.grandTotal}</small><b>{money(viewInvoice.grand_total)}</b></div>
              </div>
              <div className="invoice-detail-items">
                <table><thead><tr><th>#</th><th>{t.product}</th><th>{t.desc}</th><th>{t.qty}</th><th>{t.rate}</th><th>{t.amount}</th></tr></thead><tbody>
                  {(viewInvoice.items || []).map((item, i) => <tr key={item.id || i}><td>{i+1}</td><td>{item.product_name || productMap[String(item.product_id)] || `#${item.product_id}`}</td><td>{item.product_description || item.description || "—"}</td><td style={{textAlign:"right"}}>{money(item.qty || item.quantity)}</td><td style={{textAlign:"right"}}>{money(item.rate)}</td><td style={{textAlign:"right",fontWeight:900}}>{money(item.amount)}</td></tr>)}
                </tbody></table>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12,flexWrap:"wrap"}}>
                <button className="btn btn-soft" onClick={() => { setViewInvoice(null); openEdit(viewInvoice.id); }}>{t.edit}</button>
                <button className="btn btn-soft" onClick={() => handlePrint(viewInvoice.id)}>{t.print}</button>
                <button className="btn btn-primary" onClick={() => setViewInvoice(null)}>{t.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="page-wrap form-page-wrap">
          <div className="inputModalBox fullPageInputBox">
            <div className="inputModalTitle">
              <span>{editingId ? t.update : t.newInvoice}</span>
              <button className="closeBtn" style={{ width: "auto", padding: "0 12px", fontWeight: 900 }} onClick={() => setShowForm(false)}>← {t.cancel}</button>
            </div>

            <div className="inputModalBody">
              <div className="form-box">
                <div className="invoiceHeaderGrid">
                  <div>
                    <label className="basicLabel">{t.customerType}</label>
                    <select className="basicSelect" value={form.party_type} onChange={(e) => handlePartyTypeChange(e.target.value)}>
                      <option value="">{t.select}</option>
                      {PARTY_TYPES.map((p) => <option key={p.value} value={p.value}>{t[p.labelKey]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="basicLabel">{t.name} *</label>
                    <select data-searchable="true" className="basicSelect" value={form.party_id} disabled={!form.party_type || mastersLoading} onChange={(e) => handlePartyChange(e.target.value)}>
                      <option value="">{mastersLoading ? t.loading : t.selectName}</option>
                      {partyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="basicLabel">{t.rateList}</label>
                    <select data-searchable="true" data-no-hint="true" className="basicSelect" value={form.rate_list_name || ""} onChange={(e) => handleRateListChange(e.target.value)}>
                      <option value="">{t.rateListAuto}</option>
                      {rateListNames.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="basicLabel">{t.reference}</label>
                    <input className="basicInput" value={form.reference_no} onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.invoiceNo}</label>
                    <input className="basicInput" style={{ fontFamily: "monospace", fontWeight: 900, background: "#f8fafc" }} value={form.invoice_no} readOnly title="Auto generated invoice number" />
                  </div>
                  <div>
                    <label className="basicLabel">{t.dateFull}</label>
                    <DateTextInput className="basicInput" value={form.invoice_date} onChange={(v) => setForm((f) => ({ ...f, invoice_date: v }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.dueDate}</label>
                    <DateTextInput className="basicInput" value={form.due_date} onChange={(v) => setForm((f) => ({ ...f, due_date: v }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.shipTo}</label>
                    <input className="basicInput" value={form.shipment_to} onChange={(e) => setForm((f) => ({ ...f, shipment_to: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="sectionHead">
                <span>{t.products}</span>
                <button className="basicBtn" type="button" onClick={addRow}>{t.addRow}</button>
              </div>
              <div className="paymentPanel">
                <table className="basicProductTable">
                  <thead>
                    <tr>
                      <th style={{ width: 35 }}>#</th>
                      <th style={{ width: 260 }}>{t.product}</th>
                      <th>{t.desc}</th>
                      <th style={{ width: 130 }}>{t.productType}</th>
                      <th style={{ width: 145 }}>{t.category}</th>
                      <th style={{ width: 115 }}>{t.unit}</th>
                      <th style={{ width: 85 }}>{t.qty}</th>
                      <th style={{ width: 95 }}>{t.rate}</th>
                      <th style={{ width: 105 }}>{t.amount}</th>
                      <th style={{ width: 35 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, idx) => {
                      return (
                        <tr key={idx}>
                          <td style={{ textAlign: "center", fontWeight: 900 }}>{idx + 1}</td>
                          <td>
                            <select
                              data-searchable="true"
                              className="productInput"
                              value={makeInvoiceProductChoice(row.product_id)}
                              onChange={(e) => handleItemChange(idx, "product_choice", e.target.value)}
                            >
                              <option value="">{t.select}</option>
                              {(() => {
                                const selectedCategory = String(row.category_id || "");
                                const matchedProducts = products.filter((p) => {
                                  const productCatId = getProductCatId(p);
                                  return !selectedCategory || !productCatId || sameId(productCatId, selectedCategory);
                                });
                                const list = selectedCategory && !matchedProducts.length ? products : matchedProducts;
                                const uniqueProducts = Array.from(
                                  new Map(
                                    list
                                      .filter((p) => getProductId(p))
                                      .map((p) => [String(getProductId(p)), p])
                                  ).values()
                                );
                                return uniqueProducts.map((p) => {
                                  const id = getProductId(p);
                                  const typeName = getProductTypeLabel(p, typeMap);
                                  const label = `${getProductName(p)}${typeName ? ` — ${typeName}` : ""}`;
                                  const saleMode = getProductSaleMode(p);
                                  const saleModeLabel = saleMode === "single" ? t.single : t.multiple;
                                  return <option key={id} value={makeInvoiceProductChoice(id)}>{label} — {saleModeLabel}</option>;
                                });
                              })()}
                            </select>
                          </td>
                          <td>
                            <input className="productInput" value={row.product_description} onChange={(e) => handleItemChange(idx, "product_description", e.target.value)} />
                          </td>
                          <td>
                            <select data-searchable="true" className="productInput" value={row.product_type_id || defaultFmsTypeId || "FMS"} onChange={(e) => handleItemChange(idx, "product_type_id", e.target.value)}>
                              <option value="">{t.select}</option>
                              {productTypes.map((tp) => <option key={getRecordId(tp)} value={getRecordId(tp)}>{getTypeName(tp)}</option>)}
                              {!productTypes.length && <option value="FMS">FMS</option>}
                            </select>
                          </td>
                          <td>
                            <select data-searchable="true" className="productInput" value={row.category_id} onChange={(e) => handleItemChange(idx, "category_id", e.target.value)}>
                              <option value="">{t.select}</option>
                              {categories.map((c) => <option key={getCategoryId(c)} value={getCategoryId(c)}>{getCategoryName(c)}</option>)}
                            </select>
                          </td>
                          <td>
                            <select data-searchable="true" className="productInput" value={row.unit_id} onChange={(e) => handleItemChange(idx, "unit_id", e.target.value)}>
                              <option value="">{t.select}</option>
                              {units.map((u) => <option key={getUnitId(u)} value={getUnitId(u)}>{getUnitName(u)}</option>)}
                            </select>
                          </td>
                          <td><input type="number" min="0" className="productInput" style={{ textAlign: "right" }} value={row.qty} onChange={(e) => handleItemChange(idx, "qty", e.target.value)} /></td>
                          <td><input type="number" min="0" step="0.01" className="productInput" style={{ textAlign: "right" }} title={row.product_id && !toNum(row.rate) ? "No price found for this product/mode in the selected Rate List. Set a rate in Rate List or enter one manually." : ""} value={row.rate} onChange={(e) => handleItemChange(idx, "rate", e.target.value)} /></td>
                          <td><input readOnly className="productInput" style={{ textAlign: "right", background: "#f8fafc", fontWeight: 900 }} value={money(row.amount)} /></td>
                          <td style={{ textAlign: "center" }}><button type="button" className="basicBtn basicBtnRed" style={{ width: 22, padding: 0 }} onClick={() => removeRow(idx)}>×</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="sectionHead"><span>{t.invoiceTotal}</span></div>
              <div className="paymentPanel">
                <div className="second-line" style={{ boxShadow: "none", border: "none", padding: 0, marginBottom: 12 }}>
                  <div>
                    <label className="basicLabel">{t.totalQty}</label>
                    <input readOnly className="basicInput" value={money(totalQty)} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.previousBalance}{balanceLoading ? ` (${t.loading})` : ""}</label>
                    <input type="number" className="basicInput" step="1" value={form.previous_balance} onChange={(e) => setForm((f) => ({ ...f, previous_balance: e.target.value }))} onBlur={(e) => setForm((f) => ({ ...f, previous_balance: roundPreviousBalance(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.deliveryCharges}</label>
                    <input type="number" className="basicInput" value={form.delivery_charges} onChange={(e) => setForm((f) => ({ ...f, delivery_charges: e.target.value }))} />
                  </div>
                  <div>
                    <label className="basicLabel">{t.discount}</label>
                    <div style={{ display: "flex", alignItems: "stretch", gap: 6, minWidth: 0 }}>
                      <input
                        type="number"
                        min="0"
                        max={form.discount_type === "percent" ? "100" : undefined}
                        step="0.01"
                        className="basicInput"
                        aria-label={t.discount}
                        placeholder="0"
                        style={{ flex: "1 1 50%", width: 0, minWidth: 56 }}
                        value={form.discount}
                        onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                      />
                      <select
                        className="basicSelect"
                        aria-label={t.discountFlat + " / " + t.discountPercent}
                        data-no-search="true"
                        style={{ flex: "0 1 50%", width: 0, minWidth: 90 }}
                        value={form.discount_type}
                        onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
                      >
                        <option value="flat">{t.discountFlat}</option>
                        <option value="percent">{t.discountPercent} (%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="finalTotalBar">
                  <div className="totalBox"><label>{t.totalQty}</label><b>{money(totalQty)}</b></div>
                  <div className="totalBox"><label>{t.invoiceTotal}</label><b>{money(invTotal)}</b></div>
                  <div className="totalBox"><label>{t.previousBalance}</label><b>{money(Math.round(toNum(form.previous_balance)))}</b></div>
                  <div className="totalBox"><label>{t.deliveryCharges}</label><b>{money(form.delivery_charges)}</b></div>
                  <div className="totalBox"><label>{t.discount}{form.discount_type === "percent" ? ` (${money(form.discount)}%)` : ""}</label><b>{money(discountAmount)}</b></div>
                  <div className="totalBox grandBox"><label>{t.grandTotal}</label><b>{money(grandTotal)}</b></div>
                </div>
              </div>

              <div className="modalFooterBasic">
                <button className="basicBtn" type="button" onClick={() => setShowForm(false)}>{t.cancel}</button>
                <button className="basicBtn basicBtnGreen" type="button" disabled={saving || balanceLoading} onClick={handleSave}>{saving ? t.saving : balanceLoading ? t.loading : editingId ? t.update : t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
