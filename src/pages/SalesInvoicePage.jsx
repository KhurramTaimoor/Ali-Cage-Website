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
