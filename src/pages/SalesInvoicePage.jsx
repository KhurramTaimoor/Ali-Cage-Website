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
    backToList: "Back to List",
    invoiceItems: "Invoice Products",
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
    backToList: "فہرست پر واپس",
    invoiceItems: "انوائس پروڈکٹس",
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

// Invoice bill balances are shown in whole rupees; stored calculations remain unchanged.
const moneyWhole = (v) =>
  Math.round(toNum(v)).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

// Product caption used in the Invoice form. Match the screenshot's
// "Single Rate Pcs/Kgs @750" caption, but never label a retail price as Single.
const getAvailableSingleRate = (rates, row, product, customerId, listName) => {
  if (!product || !row?.product_id) return 0;
  const rateFromList = getCatalogRate(
    rates,
    { ...row, sale_type: "single" },
    product,
    customerId,
    listName
  );
  if (rateFromList > 0) return rateFromList;
  for (const key of ["single_rate", "singleRate", "piece_rate", "pieceRate"]) {
    const price = Number(product[key]);
    if (Number.isFinite(price) && price > 0) return price;
  }
  return 0;
};

// Keep Single/Multiple inside the PRODUCT dropdown, not as a separate column.
// The combined value exists only in the UI: invoice APIs still get a numeric
// product_id and an independent sale_type (so existing records remain valid).
const makeInvoiceProductChoice = (id, mode) => id ? `${id}::${mode === "single" ? "single" : "multiple"}` : "";
const parseInvoiceProductChoice = (choice) => {
  const match = String(choice || "").match(/^(\d+)::(single|multiple)$/);
  return match
    ? { product_id: match[1], sale_type: match[2] }
    : { product_id: String(choice || ""), sale_type: "multiple" };
};

const roundPreviousBalance = (value) => String(Math.round(toNum(value)));

const getProductSaleUnit = (p) => String(p?.sale_unit || p?.saleUnit || p?.SaleUnit || "single").toLowerCase();
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


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Official user-provided Ali Bird Cage logo, embedded for offline printing.
const ALI_BIRD_CAGE_LOGO_URI = "data:image/png;base64,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";
function getPrintLogoDataUri() {
  return ALI_BIRD_CAGE_LOGO_URI;
}

function getPrintLabels(isUrdu, t) {
  return isUrdu ? {
    brand: "ALI BIRD CAGE", ribbon: "BILL BOOK",
    invoiceTitle: "انوائس بل", invoiceNo: "انوائس نمبر",
    date: "تاریخ", dueDate: "واجب الادا تاریخ", reference: "تفصیل",
    customer: "کسٹمر", shipTo: "وصول کنندہ", rateList: "ریٹ لسٹ",
    address: "ایڈریس", product: "پروڈکٹ", detail: "تفصیل", type: "ٹائپ",
    unit: "یونٹ", qty: "تعداد", serial: "نمبر شمار",
    rate: "ریٹ", amount: "روپے", invoiceTotal: "انوائس ٹوٹل",
    invoiceNet: "خالص انوائس", previousBalance: "سابقہ بقایا رقم",
    deliveryCharges: "ڈیلیوری چارجز", discount: "ڈسکاؤنٹ",
    grandTotal: "بقایا کھاتہ رقم", customerCopy: "کسٹمر کاپی",
  } : {
    brand: "ALI BIRD CAGE", ribbon: "BILL BOOK",
    invoiceTitle: "Invoice Bill", invoiceNo: t.invoiceNo || "Invoice No",
    date: t.date || "Date", dueDate: t.dueDate || "Due Date",
    reference: "Description", customer: "Customer", shipTo: "Received By",
    rateList: "Rate List", address: "Address", product: "Product", detail: "Description",
    type: "Type", unit: "Unit", qty: "Quantity", serial: "Sr No.",
    rate: "Rate", amount: "Amount", invoiceTotal: "Invoice Total",
    invoiceNet: "Net Invoice", previousBalance: "Previous Balance",
    deliveryCharges: "Delivery Charges", discount: "Discount",
    grandTotal: "Remaining Balance", customerCopy: "Customer Copy",
  };
}

// Format the invoice date without timezone conversion (DD-MM-YY).
function formatBillDate(value) {
  if (!value) return "";
  const date = value instanceof Date
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : String(value).trim();
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}-${match[2]}-${match[1].slice(-2)}` : date;
}

// Only print the product name inside Details. The category/type belongs in the
// Type column; concatenating it to the product name caused duplicate Urdu text.
// The bill prints the description entered in the Sales Invoice row.
// A blank description stays blank; no catalogue ID (#17/#50) fallback.
function buildPrintRows(invoice, maps, isUrdu = true) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  return items.map((row, idx) => {
    const prod = maps.productRecords?.[String(row.product_id)] || {};
    const product = row.product_name || maps.prod?.[String(row.product_id)] || row.product_id || "-";
    const type = String(
      row.product_type_name || row.type_name || row.product_type ||
      maps.types?.[String(row.product_type_id || getProductTypeId(prod))] ||
      getProductTypeLabel(prod, maps.types || {}) ||
      (row.sale_type === "single" ? "Single" : row.sale_type === "multiple" ? "Multiple" : "-")
    ).trim() || "-";
    const unit = row.unit_name || maps.unit?.[String(row.unit_id)] || row.unit_id || "-";
    const savedDescription = String(row.product_description ?? row.description ?? "").trim();
    const description = savedDescription === String(product).trim() || /^#\d+$/.test(savedDescription)
      ? "" : savedDescription;
    const isSingle = String(row.sale_type || "").toLowerCase() === "single";
    // Never print an empty Single Rate label. Only show actual invoice rate > 0.
    const singleRateAmount = isSingle && toNum(row.rate) > 0 ? toNum(row.rate) : 0;
    const qty = money(row.qty ?? row.quantity ?? row.pieces_qty ?? row.carton_qty ?? 0);
    return `<tr>
      <td class="col-serial center">${idx + 1}</td>
      <td class="col-product">
        <div class="product-print-name">${escapeHtml(product)}</div>
        ${singleRateAmount > 0 ? `<div class="product-print-rate-type" dir="ltr">(Single Rate Pcs/Kgs @${moneyWhole(singleRateAmount)})</div>` : ""}
      </td>
      <td class="col-detail"><div class="product-print-description">${escapeHtml(description)}</div></td>
      <td class="col-type center">${escapeHtml(type)}</td>
      <td class="col-qty num">${qty}</td>
      <td class="col-unit center">${escapeHtml(unit)}</td>
      <td class="col-rate num">${moneyWhole(row.rate)}</td>
      <td class="col-amount num strong">${moneyWhole(row.amount)}</td>
    </tr>`;
  }).join("");
}

function makeClassicInvoiceSheet(invoice, maps, t, isUrdu, { showPageBreak = false } = {}) {
  const labels = getPrintLabels(isUrdu, t);
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const itemsRows = buildPrintRows(invoice, maps, isUrdu);
  const invoiceTotal = toNum(invoice.invoice_total) || items.reduce((sum, row) => sum + toNum(row.amount), 0);
  const previousBalance = toNum(invoice.previous_balance);
  const delivery = toNum(invoice.delivery_charges ?? invoice.deliveryCharges);
  const discount = toNum(invoice.discount);
  const invoiceNet = invoiceTotal + delivery - discount;
  // Use stored remaining balance when provided; no example/screenshot amounts.
  const grandTotal = invoice.grand_total !== undefined && invoice.grand_total !== null
    ? toNum(invoice.grand_total) : invoiceNet + previousBalance;
  const infoCards = [
    [labels.invoiceNo, invoice.invoice_no],
    [labels.customer, invoice.party_name || invoice.customer_name],
    [labels.date, formatBillDate(invoice.invoice_date)],
    [labels.reference, invoice.reference_no],
    [labels.dueDate, formatBillDate(invoice.due_date)],
    [labels.shipTo, invoice.shipment_to],
  ];
  const infoHtml = infoCards.map(([label, value]) => `
    <div class="invoice-info-box">
      <span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong>
    </div>`).join("");
  return `<section class="classic-sheet${showPageBreak ? " page-break" : ""}">
    <div class="classic-frame">
      <div class="ribbon">${escapeHtml(labels.ribbon)}</div>
      <div class="brand-row">
        <div class="brand-left"><img src="${getPrintLogoDataUri()}" alt="${escapeHtml(labels.brand)}" /></div>
        <div class="brand-title-stack">
          <div class="brand-center" dir="ltr">ALI <span class="accent">BIRD</span> CAGE</div>
          <div class="invoice-bill-heading" dir="${isUrdu ? "rtl" : "ltr"}">${escapeHtml(labels.invoiceTitle)}</div>
        </div>
        <div></div>
      </div>
      <div class="invoice-copy-label">${escapeHtml(labels.customerCopy)}</div>
      <div class="invoice-info-grid" dir="${isUrdu ? 'rtl' : 'ltr'}">${infoHtml}</div>
      <table class="classic-table" dir="${isUrdu ? 'rtl' : 'ltr'}">
        <thead><tr>
          <th class="col-serial">${escapeHtml(labels.serial)}</th>
          <th class="col-product">${escapeHtml(labels.product)}</th>
          <th class="col-detail">${escapeHtml(labels.detail)}</th>
          <th class="col-type">${escapeHtml(labels.type)}</th>
          <th class="col-qty">${escapeHtml(labels.qty)}</th>
          <th class="col-unit">${escapeHtml(labels.unit)}</th>
          <th class="col-rate">${escapeHtml(labels.rate)}</th>
          <th class="col-amount">${escapeHtml(labels.amount)}</th>
        </tr></thead>
        <tbody>${itemsRows || '<tr><td colspan="8" class="empty-row">—</td></tr>'}</tbody>
      </table>
      <div class="summary-strip" dir="${isUrdu ? 'rtl' : 'ltr'}">
        <div class="summary-box"><span>${escapeHtml(labels.invoiceTotal)}</span><strong>${moneyWhole(invoiceTotal)}</strong></div>
        <div class="summary-box"><span>${escapeHtml(labels.deliveryCharges)}</span><strong>${moneyWhole(delivery)}</strong></div>
        <div class="summary-box"><span>${escapeHtml(labels.discount)}${invoice.discount_type === "percent" ? ` (${money(invoice.discount_value)}%)` : ""}</span><strong>${moneyWhole(discount)}</strong></div>
        <div class="summary-box"><span>${escapeHtml(labels.invoiceNet)}</span><strong>${moneyWhole(invoiceNet)}</strong></div>
      </div>
      <div class="balance-footer" dir="${isUrdu ? 'rtl' : 'ltr'}">
        <div class="balance-text">${escapeHtml(labels.previousBalance)} <b dir="ltr">${moneyWhole(previousBalance)}</b></div>
        <div class="balance-text">${escapeHtml(labels.grandTotal)} <b dir="ltr">${moneyWhole(grandTotal)}</b></div>
      </div>
    </div>
  </section>`;
}

function getClassicPrintCss(isUrdu) {
  return `
    *{box-sizing:border-box}
    body{margin:0;background:#edf2f7;color:#172337;font-family:${isUrdu ? '"Noto Nastaliq Urdu","Noto Naskh Arabic","Jameel Noori Nastaleeq","Segoe UI",Arial,sans-serif' : 'Arial,"Segoe UI",sans-serif'};direction:${isUrdu ? 'rtl' : 'ltr'}}
    .print-page{padding:16px}
    .classic-sheet{padding-bottom:15px}
    .classic-frame{position:relative;background:#fff;border:2px solid #27374c;padding:19px 19px 16px;overflow:hidden}
    .ribbon{position:absolute;top:16px;left:-52px;z-index:1;transform:rotate(-45deg);width:196px;text-align:center;background:#267fc8;color:#fff;padding:5px 0;font:700 14px Arial,sans-serif;letter-spacing:.6px}
    .brand-row{direction:ltr;display:grid;grid-template-columns:190px 1fr 75px;align-items:center;gap:8px;margin-bottom:6px}
    .brand-left img{display:block;width:175px;max-width:100%;height:auto}
    .brand-title-stack{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-width:0}
    .brand-center{text-align:center;white-space:nowrap;font:900 clamp(30px,4.4vw,49px)/1.14 Georgia,Arial,sans-serif;letter-spacing:.4px;color:#101b31}
    .invoice-bill-heading{color:#192f48;font-weight:900;font-size:${isUrdu ? "30px" : "23px"};line-height:1.55;text-align:center}
    .brand-center .accent{color:#2577bf}
    .invoice-copy-label{text-align:${isUrdu ? 'right' : 'left'};font-size:15px;color:#1972bd;font-weight:800;margin:3px 2px 9px}
    .invoice-info-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:18px}
    .invoice-info-box{min-width:0;border:1px solid #b9c6d6;border-radius:7px;min-height:62px;padding:9px 11px;background:#fbfcff;display:flex;flex-direction:column;justify-content:center;gap:3px;break-inside:avoid;box-shadow:0 1px 0 rgba(38,79,125,.06)}
    .invoice-info-box span{font-size:${isUrdu ? '13px' : '11px'};font-weight:800;color:#496177}
    .invoice-info-box strong{font-size:${isUrdu ? '15px' : '13px'};font-weight:800;overflow-wrap:anywhere;color:#142b44}
    .classic-table{width:100%;border-collapse:collapse;table-layout:fixed;direction:${isUrdu ? 'rtl' : 'ltr'}}
    .classic-table th,.classic-table td{border:1.6px solid #344255;padding:9px 6px;vertical-align:middle;font-size:${isUrdu ? '14px' : '12px'}}
    .classic-table th{font-weight:900;background:#edf4fb;text-align:center}
    .classic-table .col-serial{width:7%;text-align:center}
    .classic-table .col-product{width:23%;text-align:${isUrdu ? 'right' : 'left'};overflow-wrap:anywhere}
    .classic-table .col-detail{width:18%;text-align:${isUrdu ? 'right' : 'left'};overflow-wrap:anywhere}
    .product-print-name{font-weight:800}
    .product-print-description{font-size:12px;color:#334155;font-weight:500;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;min-height:1em}
    .product-print-rate-type{display:block;font-size:11px;font-weight:800;line-height:1.6;color:#475569;margin-top:5px;padding-top:3px;white-space:normal;overflow-wrap:anywhere}
    .product-print-rate-type b{font-family:Arial,"Segoe UI",sans-serif;font-weight:900;white-space:nowrap}
    .classic-table .col-type{width:10%;text-align:center}
    .classic-table .col-qty{width:10%;text-align:center}
    .classic-table .col-unit{width:9%;text-align:center}
    .classic-table .col-rate{width:11%;text-align:center}
    .classic-table .col-amount{width:12%;text-align:center}
    .num{text-align:center!important;direction:ltr;font-family:Arial,"Segoe UI",sans-serif;font-weight:600;font-variant-numeric:tabular-nums}
    .strong{font-weight:900}
    .empty-row{text-align:center;padding:18px}
    .summary-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:14px}
    .summary-box{border:1.6px solid #344255;background:#fcfdff;min-height:62px;padding:8px 10px;display:flex;flex-direction:column;gap:5px;justify-content:center}
    .summary-box span{font-size:${isUrdu ? '13px' : '11px'};font-weight:800;color:#44586c}
    .summary-box strong{font-size:17px;font-family:Arial,"Segoe UI",sans-serif;direction:ltr;text-align:${isUrdu ? 'right' : 'left'}}
    .balance-footer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin-top:17px}
    .balance-text{font-size:${isUrdu ? '21px' : '17px'};font-weight:900;color:#bf2626;display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
    .balance-text b{font:900 22px Arial,"Segoe UI",sans-serif;color:#bf2626}
    .page-break{break-after:page;page-break-after:always}
    @media(max-width:920px){.brand-row{grid-template-columns:150px 1fr 20px}.brand-left img{width:140px}.brand-center{font-size:clamp(26px,4.2vw,44px)}}
    @media(max-width:560px){.print-page{padding:6px}.classic-frame{padding:11px 6px}.brand-row{grid-template-columns:85px 1fr 0}.brand-left img{width:80px}.brand-center{font-size:clamp(15px,4.4vw,26px)}.invoice-bill-heading{font-size:17px}.ribbon{width:128px;left:-36px;top:10px;font-size:9px}.invoice-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.invoice-info-box{padding:6px;min-height:50px}.invoice-info-box strong{font-size:12px}.classic-table th,.classic-table td{font-size:10px;padding:4px 2px}.product-print-description{font-size:10px}.product-print-rate-type{font-size:9px}.summary-box{min-height:55px;padding:4px}.summary-box strong{font-size:12px}.balance-footer{gap:6px}.balance-text{font-size:13px}.balance-text b{font-size:14px}}
    @page{size:A4 portrait;margin:10mm}
    @media print{body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-page{padding:0}.classic-sheet{padding:0}.classic-frame{border:2px solid #27374c;break-inside:auto}.invoice-info-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.brand-row,.invoice-info-grid,.summary-strip,.balance-footer{break-inside:avoid}.classic-table tr{break-inside:avoid}.page-break{page-break-after:always}}
  `;
}

function printInvoice(invoice, maps, t, isUrdu) {
  const html = `<!doctype html>
<html dir="${isUrdu ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8"/>
<title>${escapeHtml(invoice.invoice_no || 'Sales Invoice')}</title>
<style>${getClassicPrintCss(isUrdu)}</style>
</head>
<body><div class="print-page">${makeClassicInvoiceSheet(invoice, maps, t, isUrdu)}</div><script>window.onload=()=>setTimeout(()=>window.print(),350)</script></body></html>`;

  const w = window.open('', '_blank', 'width=1280,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function makeInvoiceSheet(invoice, maps, t, isUrdu) {
  return makeClassicInvoiceSheet(invoice, maps, t, isUrdu);
}

function printBulkInvoices(invoices, maps, t, isUrdu) {
  const sheets = invoices.map((invoice, idx) => makeClassicInvoiceSheet(invoice, maps, t, isUrdu, { showPageBreak: idx !== invoices.length - 1 })).join('');
  const html = `<!doctype html>
<html dir="${isUrdu ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8"/>
<title>${escapeHtml(t.bulkPrint || 'Bulk Print')}</title>
<style>${getClassicPrintCss(isUrdu)}</style>
</head>
<body><div class="print-page">${sheets}</div><script>window.onload=()=>setTimeout(()=>window.print(),350)</script></body></html>`;

  const w = window.open('', '_blank', 'width=1280,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function buildInvoicePreviewHtml(invoice, maps, t) {
  // Render the exact same bill-book template used by Print, without opening the print dialog.
  return `<!doctype html>
<html lang="ur" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" />
<style>${getClassicPrintCss(true)}</style>
</head>
<body><div class="print-page">${makeClassicInvoiceSheet(invoice, maps, t, true)}</div></body>
</html>`;
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
  const productRecordMap = useMemo(() => Object.fromEntries(products.map((prod) => [String(getProductId(prod)), prod])), [products]);
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

  const backToList = () => {
    setViewInvoice(null);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openDetails = async (invoice) => {
    setShowForm(false);
    setViewInvoice(invoice);
    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      const res = await axios.get(`${API_BASE}/${invoice.id}`);
      const fullInvoice = res.data?.data || res.data?.invoice || res.data;
      setViewInvoice((current) =>
        String(current?.id) === String(invoice.id)
          ? { ...current, ...fullInvoice }
          : current
      );
    } catch {
      // List data remains visible if a details refresh fails.
    }
  };

  const openAdd = async () => {
    setViewInvoice(null);
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
      setViewInvoice(null);
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
        const prod = products.find((p) => sameId(getProductId(p), next.product_id));
        if (prod) {
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
      printInvoice({ ...inv, party_name: inv.party_name || partyName, items: normItems }, { cat: categoryMap, prod: productMap, unit: unitMap, types: typeMap, productRecords: productRecordMap }, t, true);
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
    [categoryMap, productMap, unitMap, typeMap, productRecordMap, getInvoicePartyName]
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
      printBulkInvoices(detailed, { cat: categoryMap, prod: productMap, unit: unitMap, types: typeMap, productRecords: productRecordMap }, t, true);
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


        /* Standalone multicolor Invoice Details page. The list and form do not render behind it. */
        .invoice-details-page{max-width:1220px}
        .invoice-details-shell{min-height:calc(100vh - 36px);background:#fff;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden;box-shadow:0 16px 45px rgba(17,37,76,.07);animation:fadeSlide .22s ease-out both}
        .invoice-details-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:24px 26px;color:#fff;background:linear-gradient(113deg,#173c79 0%,#315db3 42%,#5d54a5 72%,#087e91 100%);border-bottom:4px solid #48c6c4}
        .invoice-details-overline{display:block;font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#cce9ff;margin-bottom:6px}
        .invoice-details-heading{min-width:0}
        .invoice-details-heading h1{margin:0;font-size:clamp(18px,2vw,25px);line-height:1.4;font-weight:950;overflow-wrap:anywhere;color:#fff}
        .invoice-details-heading h1 span{color:#bff6ed}
        .invoice-details-heading p{margin:6px 0 0;color:#e4edff;font-size:12px;font-weight:750;overflow-wrap:anywhere}
        .invoice-details-header-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
        .invoice-details-back{border:1px solid rgba(255,255,255,.58);color:#173c79;background:white;padding:10px 15px;min-height:38px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
        .invoice-details-back:hover{background:#e9fbff}
        .invoice-details-body{padding:20px 22px 24px;background:linear-gradient(180deg,#f8fbff 0%,#fff 52%)}
        .invoice-details-page .invoice-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}
        .invoice-details-page .invoice-detail-box{min-height:76px;background:#fff;border:1px solid #dee6f3;border-top:3px solid #3b82f6;border-radius:12px;padding:12px 13px;box-shadow:0 2px 10px rgba(30,64,125,.035);min-width:0}
        .invoice-details-page .invoice-detail-box:nth-child(6n + 2){border-top-color:#8b5cf6;background:#fbfaff}
        .invoice-details-page .invoice-detail-box:nth-child(6n + 3){border-top-color:#12a994;background:#f4fffc}
        .invoice-details-page .invoice-detail-box:nth-child(6n + 4){border-top-color:#e9a23b;background:#fffcf6}
        .invoice-details-page .invoice-detail-box:nth-child(6n + 5){border-top-color:#ec6993;background:#fff8fb}
        .invoice-details-page .invoice-detail-box:nth-child(6n + 6){border-top-color:#1489c6;background:#f6fcff}
        .invoice-details-page .invoice-detail-box small{display:block;font-size:10px;letter-spacing:.3px;font-weight:900;text-transform:uppercase;color:#64748b;margin:0 0 7px}
        .invoice-details-page .invoice-detail-box b{display:block;font-size:13px;font-weight:900;color:#142d4c;line-height:1.6;overflow-wrap:anywhere}
        .invoice-financial-grid{margin-top:15px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
        .invoice-financial-card{min-width:0;min-height:86px;display:flex;flex-direction:column;justify-content:center;padding:12px 13px;background:#eff6ff;border:1px solid #cfe1fc;border-radius:12px}
        .invoice-financial-card:nth-child(2){background:#f4f0ff;border-color:#dcd3fe}
        .invoice-financial-card:nth-child(3){background:#effdf9;border-color:#bcefe2}
        .invoice-financial-card:nth-child(4){background:#fff7ed;border-color:#f9ddba}
        .invoice-financial-card small{display:block;color:#47617e;font-size:10px;text-transform:uppercase;font-weight:900;margin-bottom:8px;letter-spacing:.15px}
        .invoice-financial-card b{display:block;font-size:17px;font-weight:950;font-family:monospace;color:#153c8f;overflow-wrap:anywhere}
        .invoice-financial-card:nth-child(2) b{color:#6d3fc1}
        .invoice-financial-card:nth-child(3) b{color:#0e8273}
        .invoice-financial-card:nth-child(4) b{color:#ba6223}
        .invoice-financial-card.invoice-financial-grand{background:linear-gradient(125deg,#16396d,#244f95);border-color:#244f95}
        .invoice-financial-grand small{color:#c8e8ff}.invoice-financial-grand b{color:white;font-size:21px}
        .invoice-details-section-title{display:flex;gap:12px;align-items:center;justify-content:space-between;margin:23px 0 10px;font-weight:950;font-size:15px;color:#123054}
        .invoice-details-section-title>div{display:flex;align-items:center;gap:9px}
        .invoice-details-section-dot{display:inline-block;width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,#4875e4,#14b8a6)}
        .invoice-details-count{padding:5px 10px;background:#e9f3ff;color:#2855a0;border-radius:999px;font-size:11px}
        .invoice-details-page .invoice-detail-items{margin-top:0;background:#fff;border:1px solid #dbe5f1;border-radius:13px;overflow-x:auto}
        .invoice-details-page .invoice-detail-items table{width:100%;min-width:690px;border-collapse:collapse}
        .invoice-details-page .invoice-detail-items th{text-align:start;background:#e8f1ff;color:#264879;font-size:10px;text-transform:uppercase;padding:13px 12px;white-space:nowrap;border-bottom:2px solid #bdd2f5}
        .invoice-details-page .invoice-detail-items td{font-size:12px;padding:12px;border-bottom:1px solid #eaf0f8;color:#28415e;vertical-align:middle}
        .invoice-details-page .invoice-detail-items tbody tr:nth-child(even){background:#f6faff}
        .invoice-details-page .invoice-detail-items tbody tr:hover{background:#eef8ff}
        .invoice-details-page .invoice-detail-items tbody tr:last-child td{border-bottom:0}
        .invoice-detail-sr{font-weight:950;color:#547db6!important;width:42px}
        .invoice-detail-product{font-weight:900;color:#183f70!important;line-height:1.7}
        .invoice-detail-mode{display:inline-block;margin-inline-start:7px;padding:1px 7px;background:#e7f7f4;border:1px solid #b7e3d8;border-radius:6px;color:#13776b;font-size:9px;font-weight:900;white-space:nowrap}
        .invoice-details-page .invoice-detail-items td.invoice-detail-number{text-align:end;font-variant-numeric:tabular-nums;white-space:nowrap}
        .invoice-details-page .invoice-detail-items td.invoice-detail-amount{font-weight:950;color:#2259a3;background:rgba(59,130,246,.045)}
        .invoice-detail-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:1px solid #e6edf5}
        .invoice-detail-action-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .invoice-detail-actions .btn{min-height:38px;padding:9px 16px;font-size:12px}
        .invoice-detail-actions .invoice-detail-action-back{border-color:#c9d7ed;background:#f3f7ff;color:#24549b}
        .invoice-detail-actions .invoice-detail-action-edit{border-color:#c1e4db;background:#edfdf7;color:#08765f}
        .invoice-detail-actions .invoice-detail-action-print{border-color:#d9d0fa;background:#f5f2ff;color:#6948b6}
        @media(max-width:1050px){.invoice-details-page .invoice-detail-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.invoice-financial-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:720px){.invoice-details-header{padding:18px}.invoice-details-body{padding:14px}.invoice-details-page .invoice-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.invoice-financial-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.invoice-financial-grand{grid-column:1/-1}.invoice-details-page .invoice-detail-items table{min-width:630px}}
        @media(max-width:480px){.invoice-details-page .invoice-detail-grid{grid-template-columns:1fr}.invoice-detail-actions{align-items:stretch;flex-direction:column}.invoice-detail-action-right{width:100%}.invoice-detail-actions .invoice-detail-action-back{width:100%}.invoice-detail-action-right .btn{flex:1}.invoice-details-header-actions{width:100%}.invoice-details-back{width:100%;justify-content:center}}

        /* Bill book details: View Details now uses the SAME invoice layout as Print. */
        .invoice-bill-details-page{max-width:1220px;}
        .invoice-bill-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:14px 17px;background:#fff;border:1px solid #d9e3f0;border-radius:12px 12px 0 0;box-shadow:0 7px 24px rgba(20,43,82,.05)}
        .invoice-bill-back{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#edf5ff;color:#215397;border:1px solid #c9def6;font-weight:900;font-size:12px;padding:10px 14px;border-radius:9px;cursor:pointer;white-space:nowrap}
        .invoice-bill-back:hover{background:#dbeafe}
        .invoice-bill-toolbar-title{flex:1;min-width:160px;display:flex;align-items:flex-start;flex-direction:column;gap:4px;color:#153251;line-height:1.4}
        .invoice-bill-toolbar-title strong{font-size:16px}
        .invoice-bill-toolbar-title span{font-size:12px;color:#64748b}
        .invoice-bill-toolbar-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
        .invoice-bill-print{background:#1e63b3;border-color:#1e63b3;color:white}
        .invoice-bill-print:hover{background:#144e94;color:white}
        .invoice-bill-paper{background:#e9eef5;padding:14px 18px 20px;border-left:1px solid #d9e3f0;border-right:1px solid #d9e3f0;overflow-x:auto}
        .invoice-bill-frame{display:block;width:100%;min-width:0;height:680px;background:#fff;border:0;box-shadow:0 8px 24px rgba(15,23,42,.11)}
        .invoice-bill-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:14px 17px;border:1px solid #d9e3f0;border-radius:0 0 12px 12px;background:#fff}
        @media(max-width:650px){.invoice-bill-toolbar{padding:12px}.invoice-bill-toolbar-title{order:-1;flex:1 1 100%}.invoice-bill-paper{padding:6px}.invoice-bill-toolbar-actions .btn{flex:1}.invoice-bill-bottom .btn{font-size:11px}}


      `}</style>

      {msg.text && <div className="toast" style={{ background: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</div>}

      {!showForm && !viewInvoice && (
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
                  onClick={() => openDetails(inv)}
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
                      <button className="invoice-icon-btn primary" title={t.viewDetails} aria-label={t.viewDetails} onClick={(e) => { e.stopPropagation(); openDetails(inv); }}><Eye size={14} /></button>
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
                <button className="btn btn-primary" style={{width:"100%",marginTop:12,height:38}} onClick={() => openDetails(inv)}>{t.viewDetails}</button>
              </article>
            ))}
          </div>
        </div>
        </div>
      )}

      {viewInvoice && !showForm && (
        <div className="page-wrap invoice-bill-details-page form-page-wrap">
          <div className="invoice-bill-toolbar">
            <button type="button" className="invoice-bill-back" onClick={backToList}>
              <span aria-hidden="true">←</span> {t.backToList}
            </button>
            <div className="invoice-bill-toolbar-title">
              <strong>{t.viewDetails} · {viewInvoice.invoice_no}</strong>
              <span>{getInvoicePartyName(viewInvoice)}</span>
            </div>
            <div className="invoice-bill-toolbar-actions">
              <button type="button" className="btn invoice-detail-action-edit" onClick={() => openEdit(viewInvoice.id)}>
                <Pencil size={15} /> {t.edit}
              </button>
              <button type="button" className="btn invoice-bill-print" onClick={() => handlePrint(viewInvoice.id)}>
                <Printer size={15} /> {t.print}
              </button>
            </div>
          </div>

          <div className="invoice-bill-paper" dir="ltr">
            <iframe
              title={`Invoice ${viewInvoice.invoice_no} - bill book preview`}
              className="invoice-bill-frame"
              srcDoc={buildInvoicePreviewHtml(
                { ...viewInvoice, party_name: getInvoicePartyName(viewInvoice) },
                { cat: categoryMap, prod: productMap, unit: unitMap, types: typeMap, productRecords: productRecordMap },
                t
              )}
              onLoad={(event) => {
                const frame = event.currentTarget;
                const document = frame.contentDocument;
                if (!document) return;
                const fitPreviewHeight = () => {
                  const height = Math.max(document.documentElement?.scrollHeight || 0, document.body?.scrollHeight || 0);
                  frame.style.height = `${Math.max(560, height + 8)}px`;
                };
                fitPreviewHeight();
                if (document.fonts?.ready) {
                  document.fonts.ready.then(fitPreviewHeight).catch(() => {});
                }
              }}
            />
          </div>

          <div className="invoice-bill-bottom">
            <button type="button" className="btn invoice-detail-action-back" onClick={backToList}>
              ← {t.backToList}
            </button>
            <div className="invoice-bill-toolbar-actions">
              <button type="button" className="btn invoice-detail-action-edit" onClick={() => openEdit(viewInvoice.id)}>
                <Pencil size={15} /> {t.edit}
              </button>
              <button type="button" className="btn invoice-bill-print" onClick={() => handlePrint(viewInvoice.id)}>
                <Printer size={15} /> {t.print}
              </button>
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
                      const selectedProduct = productRecordMap[String(row.product_id || "")];
                      const configuredSingleRate = getAvailableSingleRate(
                        salesRates,
                        row,
                        selectedProduct,
                        form.party_type === "customer" ? form.party_id : null,
                        form.rate_list_name || ""
                      );
                      return (
                        <tr key={idx}>
                          <td style={{ textAlign: "center", fontWeight: 900 }}>{idx + 1}</td>
                          <td>
                            <select
                              data-searchable="true"
                              className="productInput"
                              value={makeInvoiceProductChoice(row.product_id, row.sale_type)}
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
                                return list.flatMap((p) => {
                                  const id = getProductId(p);
                                  if (!id) return [];
                                  const typeName = getProductTypeLabel(p, typeMap);
                                  const label = `${getProductName(p)}${typeName ? ` — ${typeName}` : ""}`;
                                  return [
                                    <option key={`${id}-multiple`} value={makeInvoiceProductChoice(id, "multiple")}>{label} — {t.multiple}</option>,
                                    <option key={`${id}-single`} value={makeInvoiceProductChoice(id, "single")}>{label} — {t.single}</option>,
                                  ];
                                });
                              })()}
                            </select>
                            {configuredSingleRate > 0 && (
                              <div
                                className="invoice-single-rate-caption"
                                style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginTop: 6, lineHeight: 1.4, whiteSpace: "nowrap" }}
                                dir="ltr"
                              >
                                (Single Rate Pcs/Kgs @{moneyWhole(configuredSingleRate)})
                              </div>
                            )}
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
