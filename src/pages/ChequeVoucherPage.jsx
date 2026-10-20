import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { openChequeVoucherPrintWindow } from "../utils/chequeVoucherPrint";
import { useOutletContext } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");
const API_BASE = `${API_ROOT}/api`;

const LANG = {
  en: {
    accounts: "Accounts",
    title: "Cheque Vouchers",
    subtitle: "Receive and issue cheques, track partial clearing and Cash Book entries.",
    toggleLang: "اردو",
    refresh: "Refresh",
    newVoucher: "New Voucher",
    vouchers: "Vouchers",
    issuedTotal: "Cheque Total",
    paidCleared: "Cleared Amount",
    remaining: "Remaining",
    all: "All",
    directionAll: "All Cheques",
    received: "Received",
    paid: "Paid / Issued",
    directionFilter: "Cheque Type",
    nearestDate: "Nearest Date",
    newestFirst: "Newest First",
    sortBy: "Sort",
    todayFilter: "Today",
    fromDate: "From",
    toDate: "To",
    clearDates: "Clear Dates",
    accountColumn: "Account Name",
    filterAccountType: "Filter Account Type",
    filterAccountName: "Filter Account Name",
    allTypes: "All Account Types",
    allNames: "All Accounts",
    printFiltered: "Print Filtered",
    printSelected: "Print Selected",
    printSingle: "Print Voucher",
    receivedTotal: "Received Cheques",
    receivedCleared: "Received Cleared",
    issuedTotal: "Issued Cheques",
    issuedCleared: "Issued Cleared",
    chequeDateFilterNote: "Date range filters cheque dates; clearance details show actual dates.",
    cleared: "Cleared",
    partial: "Partially Paid",
    search: "Search voucher, payee or account...",
    voucherPayee: "Voucher / Payee",
    issueDate: "Issue Date",
    clearanceDate: "Clearance Date",
    chequeAmount: "Cheque Amount",
    paidRemaining: "Cleared / Remaining",
    paidShort: "Cleared",
    remShort: "Rem",
    status: "Status",
    actions: "Actions",
    loading: "Loading vouchers...",
    noVouchers: "No vouchers found",
    noMatch: "No cheque vouchers match the selected filter.",
    details: "Details",
    viewDetails: "View complete details",
    editPayment: "Edit / add payment",
    delete: "Delete",
    editVoucher: "Edit Cheque Voucher",
    createVoucher: "New Cheque Voucher",
    voucherNo: "Voucher No",
    autoVoucher: "Leave blank to generate automatically",
    voucherPlaceholder: "CHQ-00001",
    payee: "Payee / Party Name",
    payeePlaceholder: "Enter payee name",
    chequeDirection: "Cheque Action",
    receiveCheque: "Receive Cheque",
    issueCheque: "Pay / Issue Cheque",
    accountType: "Account Type",
    customer: "Customer", supplier: "Supplier", employee: "Employee", general_ledger: "General Account",
    accountName: "Account Name",
    cashbookHelp: "Each cleared amount appears as a separate dated Cash Book voucher. Ledger: received cheque = Credit; issued cheque = Debit.",
    ledgerAccount: "Ledger Account",
    ledgerHint: "The amount is deducted from this ledger on the issuance date",
    selectLedger: "Select ledger account",
    issuanceDate: "Cheque Date",
    chequeTotal: "Cheque Total",
    notes: "Notes",
    notesPlaceholder: "Optional voucher notes",
    paymentDetails: "Payment / Clearance Details",
    paymentHelp: "Add another row whenever a payment is cleared.",
    addRow: "Add Row",
    date: "Date",
    detail: "Details",
    amount: "Amount",
    paymentPlaceholder: "Payment / clearance detail",
    remainingBalance: "Remaining Balance",
    cancel: "Cancel",
    saveVoucher: "Save Voucher",
    updateVoucher: "Update Voucher",
    close: "Close",
    paymentRows: "Payment Rows",
    allPayments: "All Payment / Clearance Details",
    noPayments: "No payment entries have been added yet.",
    requiredMain: "Payee, ledger account and issuance date are required.",
    requiredTotal: "Clearance date and a valid cheque total are required.",
    overPaid: "Paid amount cannot be greater than the cheque total.",
    loadError: "Unable to load cheque vouchers. Please try again.",
    accountsError: "Unable to load ledger accounts. Please try again.",
    detailsError: "Unable to load voucher details.",
    saveError: "Unable to save the cheque voucher.",
    deleteError: "Unable to delete the cheque voucher.",
    saved: "Cheque voucher saved.",
    updated: "Cheque voucher updated.",
    deleted: "Cheque voucher deleted.",
    deleteConfirm: "Delete cheque voucher",
    dueToday: "Due today",
    dueIn: "Due in",
    overdue: "overdue",
    day: "day",
    days: "days",
  },
  ur: {
    accounts: "اکاؤنٹس",
    title: "چیک واؤچرز",
    subtitle: "وصول شدہ اور جاری چیک، جزوی کلیئرنس اور کیش بک ریکارڈ سنبھالیں۔",
    toggleLang: "English",
    refresh: "ری فریش",
    newVoucher: "نیا واؤچر",
    vouchers: "واؤچرز",
    issuedTotal: "چیک کی کل رقم",
    paidCleared: "کلیئر رقم",
    remaining: "باقی رقم",
    all: "سب",
    directionAll: "تمام چیک",
    received: "وصول شدہ",
    paid: "ادا / جاری شدہ",
    directionFilter: "چیک کی قسم",
    nearestDate: "قریب ترین تاریخ",
    newestFirst: "تازہ ترین پہلے",
    sortBy: "ترتیب",
    todayFilter: "آج",
    fromDate: "شروع کی تاریخ",
    toDate: "آخری تاریخ",
    clearDates: "تاریخ صاف کریں",
    accountColumn: "اکاؤنٹ کا نام",
    filterAccountType: "اکاؤنٹ کی قسم",
    filterAccountName: "اکاؤنٹ کا نام",
    allTypes: "تمام اکاؤنٹس کی اقسام",
    allNames: "تمام اکاؤنٹس",
    printFiltered: "فلٹر شدہ پرنٹ",
    printSelected: "منتخب پرنٹ",
    printSingle: "واؤچر پرنٹ",
    receivedTotal: "وصول شدہ چیک",
    receivedCleared: "وصول شدہ کلیئر",
    issuedTotal: "جاری شدہ چیک",
    issuedCleared: "جاری شدہ کلیئر",
    chequeDateFilterNote: "تاریخ کا فلٹر چیک کی تاریخ پر ہے، کلیئرنس کی تاریخیں الگ دکھائی گئی ہیں۔",
    cleared: "کلیئر",
    partial: "جزوی ادائیگی",
    search: "واؤچر، پارٹی یا اکاؤنٹ تلاش کریں...",
    voucherPayee: "واؤچر / پارٹی",
    issueDate: "اجراء کی تاریخ",
    clearanceDate: "کلیئرنس کی تاریخ",
    chequeAmount: "چیک کی رقم",
    paidRemaining: "کلیئر / باقی",
    paidShort: "کلیئر",
    remShort: "باقی",
    status: "حالت",
    actions: "ایکشنز",
    loading: "واؤچرز لوڈ ہو رہے ہیں...",
    noVouchers: "کوئی واؤچر نہیں ملا",
    noMatch: "منتخب فلٹر کے مطابق کوئی چیک واؤچر نہیں ملا۔",
    details: "تفصیلات",
    viewDetails: "مکمل تفصیلات دیکھیں",
    editPayment: "ترمیم / ادائیگی شامل کریں",
    delete: "حذف کریں",
    editVoucher: "چیک واؤچر میں ترمیم",
    createVoucher: "نیا چیک واؤچر",
    voucherNo: "واؤچر نمبر",
    autoVoucher: "خالی چھوڑنے پر نمبر خود بن جائے گا",
    voucherPlaceholder: "CHQ-00001",
    payee: "پارٹی / وصول کنندہ",
    payeePlaceholder: "پارٹی کا نام درج کریں",
    chequeDirection: "چیک کی قسم",
    receiveCheque: "چیک وصول کریں",
    issueCheque: "چیک جاری / ادا کریں",
    accountType: "اکاؤنٹ ٹائپ",
    customer: "کسٹمر", supplier: "سپلائر", employee: "ملازم", general_ledger: "جنرل اکاؤنٹ",
    accountName: "اکاؤنٹ کا نام",
    cashbookHelp: "ہر کلیئر ہونے والی رقم تاریخ کے ساتھ کیش بک میں الگ درج ہوگی؛ چیک وصول = کریڈٹ، چیک جاری = ڈیبٹ۔",
    ledgerAccount: "لیجر اکاؤنٹ",
    ledgerHint: "اجراء کی تاریخ پر رقم اسی لیجر سے منہا ہوگی",
    selectLedger: "لیجر اکاؤنٹ منتخب کریں",
    issuanceDate: "چیک کی تاریخ",
    chequeTotal: "چیک کی کل رقم",
    notes: "نوٹس",
    notesPlaceholder: "اختیاری واؤچر نوٹس",
    paymentDetails: "ادائیگی / کلیئرنس کی تفصیلات",
    paymentHelp: "ہر ادائیگی کلیئر ہونے پر نئی قطار شامل کریں۔",
    addRow: "قطار شامل کریں",
    date: "تاریخ",
    detail: "تفصیل",
    amount: "رقم",
    paymentPlaceholder: "ادائیگی یا کلیئرنس کی تفصیل",
    remainingBalance: "باقی بیلنس",
    cancel: "واپس",
    saveVoucher: "واؤچر محفوظ کریں",
    updateVoucher: "واؤچر اپڈیٹ کریں",
    close: "بند کریں",
    paymentRows: "ادائیگی کی قطاریں",
    allPayments: "تمام ادائیگی / کلیئرنس تفصیلات",
    noPayments: "ابھی کوئی ادائیگی شامل نہیں کی گئی۔",
    requiredMain: "پارٹی، لیجر اکاؤنٹ اور اجراء کی تاریخ ضروری ہیں۔",
    requiredTotal: "کلیئرنس کی تاریخ اور درست چیک رقم ضروری ہے۔",
    overPaid: "ادا شدہ رقم چیک کی کل رقم سے زیادہ نہیں ہو سکتی۔",
    loadError: "چیک واؤچرز لوڈ نہیں ہو سکے۔ دوبارہ کوشش کریں۔",
    accountsError: "لیجر اکاؤنٹس لوڈ نہیں ہو سکے۔",
    detailsError: "واؤچر کی تفصیلات لوڈ نہیں ہو سکیں۔",
    saveError: "چیک واؤچر محفوظ نہیں ہو سکا۔",
    deleteError: "چیک واؤچر حذف نہیں ہو سکا۔",
    saved: "چیک واؤچر محفوظ ہوگیا۔",
    updated: "چیک واؤچر اپڈیٹ ہوگیا۔",
    deleted: "چیک واؤچر حذف ہوگیا۔",
    deleteConfirm: "یہ چیک واؤچر حذف کریں",
    dueToday: "آج واجب الادا",
    dueIn: "باقی دن",
    overdue: "دن تاخیر",
    day: "دن",
    days: "دن",
  },
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyPayment = () => ({
  local_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  payment_date: today(),
  details: "",
  amount: "",
});

const emptyForm = () => ({
  voucher_no: "",
  payee_name: "",
  account_id: "",
  account_type: "customer",
  cheque_direction: "issue",
  issuance_date: today(),
  clearance_date: "",
  total_amount: "",
  notes: "",
  payments: [emptyPayment()],
});

const money = (value) =>
  `₨ ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.vouchers)) return payload.vouchers;
  return [];
};

const statusMeta = (status, t) => {
  if (status === "cleared") {
    return {
      label: t.cleared,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "partial") {
    return {
      label: t.partial,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: t.remaining,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
};

const dueMeta = (dateValue, status, t, isUrdu) => {
  if (status === "cleared" || !dateValue) return null;

  const due = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  const current = new Date(`${today()}T00:00:00`);
  const days = Math.round((due - current) / 86400000);

  if (days < 0) {
    return {
      text: isUrdu
        ? `${Math.abs(days)} ${t.overdue}`
        : `${Math.abs(days)} ${Math.abs(days) === 1 ? t.day : t.days} ${t.overdue}`,
      tone: "text-rose-600",
    };
  }

  if (days === 0) {
    return { text: t.dueToday, tone: "text-amber-600" };
  }

  return {
    text: isUrdu
      ? `${t.dueIn}: ${days}`
      : `${t.dueIn} ${days} ${days === 1 ? t.day : t.days}`,
    tone: "text-sky-600",
  };
};

export default function ChequeVoucherPage() {
  const outlet = useOutletContext() || {};
  const [fallbackLang, setFallbackLang] = useState("en");
  const lang = outlet.lang === "ur" || outlet.lang === "en" ? outlet.lang : fallbackLang;
  const t = LANG[lang];
  const isUrdu = typeof outlet.isRTL === "boolean" ? outlet.isRTL : lang === "ur";

  const toggleLanguage = () => {
    const nextLanguage = lang === "en" ? "ur" : "en";

    if (typeof outlet.setLang === "function") {
      outlet.setLang(nextLanguage);
      return;
    }

    setFallbackLang(nextLanguage);
  };
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState({ customer: [], supplier: [], employee: [], general_ledger: [] });
  const [filter, setFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nearest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [accountIdFilter, setAccountIdFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewVoucher, setViewVoucher] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const reportParams = useMemo(() => {
    const params = {};
    if (filter !== "all") params.status = filter;
    if (directionFilter !== "all") params.direction = directionFilter;
    params.sort = sortBy;
    if (dateFrom) params.from_date = dateFrom;
    if (dateTo) params.to_date = dateTo;
    if (accountTypeFilter !== "all") params.account_type = accountTypeFilter;
    if (accountIdFilter) params.account_id = accountIdFilter;
    if (search.trim()) params.search = search.trim();
    return params;
  }, [filter, directionFilter, sortBy, dateFrom, dateTo, accountTypeFilter, accountIdFilter, search]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_BASE + "/cheque-vouchers", {params:reportParams});
      setRecords(normalizeArray(response.data));
      setSelectedIds([]);
    } catch (requestError) {
      setRecords([]);
      setSelectedIds([]);
      setError(requestError.response?.data?.message || t.loadError);
    } finally { setLoading(false); }
  }, [reportParams, t.loadError]);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/cheque-vouchers/lookups`);
      setAccounts(response.data?.data || { customer: [], supplier: [], employee: [], general_ledger: [] });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t.accountsError
      );
    }
  }, [t.accountsError]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const timer = window.setTimeout(loadRecords, 250);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const paidInForm = useMemo(
    () =>
      form.payments.reduce((sum, row) => {
        const amount = Number(row.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [form.payments]
  );

  const formTotal = Number(form.total_amount) || 0;
  const remainingInForm = Math.max(formTotal - paidInForm, 0);

  const summary = useMemo(() => records.reduce((acc, row) => {
    const amount = Number(row.total_amount) || 0;
    const cleared = Number(row.paid_amount) || 0;
    if (row.cheque_direction === "receive") {
      acc.receivedTotal += amount;
      acc.receivedCleared += cleared;
    } else {
      acc.issuedTotal += amount;
      acc.issuedCleared += cleared;
    }
    return acc;
  }, {receivedTotal:0,receivedCleared:0,issuedTotal:0,issuedCleared:0}), [records]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  };

  const getVoucher = async (id) => {
    const response = await axios.get(`${API_BASE}/cheque-vouchers/${id}`);
    return response.data?.data || response.data?.voucher;
  };

  const openEdit = async (record) => {
    setError("");

    try {
      const voucher = await getVoucher(record.id);
      setEditingId(voucher.id);
      setForm({
        voucher_no: voucher.voucher_no || "",
        payee_name: voucher.payee_name || "",
        account_type: voucher.account_type || "general_ledger",
        cheque_direction: voucher.cheque_direction || "issue",
        account_id: String(voucher.account_id || ""),
        issuance_date: voucher.issuance_date || today(),
        clearance_date: voucher.clearance_date || "",
        total_amount: String(voucher.total_amount || ""),
        notes: voucher.notes || "",
        payments: voucher.payments?.length
          ? voucher.payments.map((row) => ({
              ...row,
              local_id: `saved-${row.id}`,
              amount: String(row.amount || ""),
            }))
          : [emptyPayment()],
      });
      setShowForm(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t.detailsError
      );
    }
  };

  const openView = async (record) => {
    setError("");

    try {
      setViewVoucher(await getVoucher(record.id));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t.detailsError
      );
    }
  };

  const toggleSelected = (id) => setSelectedIds(previous =>
    previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]
  );

  const printSingleVoucher = async (record) => {
    const popup = window.open("", "_blank", "width=1050,height=850");
    if (!popup) return setError("Please allow pop-ups for printing.");
    popup.document.write('<p style="font-family:Arial;padding:20px">Preparing cheque voucher...</p>');
    try {
      const voucher = await getVoucher(record.id);
      openChequeVoucherPrintWindow([voucher], {lang,single:true}, popup);
    } catch (e) {
      popup.close();
      setError(e.response?.data?.message || e.message || t.detailsError);
    }
  };

  const printFilteredReport = async () => {
    if (!records.length || printing) return;
    const popup = window.open("", "_blank", "width=1150,height=900");
    if (!popup) return setError("Please allow pop-ups for printing.");
    popup.document.write('<p style="font-family:Arial;padding:20px">Preparing filtered cheque report...</p>');
    setPrinting(true);
    try {
      const response = await axios.get(API_BASE + "/cheque-vouchers/print-report", {params:reportParams});
      const rows = normalizeArray(response.data);
      const selected = new Set(selectedIds.map(Number));
      const toPrint = selected.size ? rows.filter(v => selected.has(Number(v.id))) : rows;
      if (!toPrint.length) throw new Error("No matching vouchers to print.");
      const accountName = (accounts[accountTypeFilter] || []).find(a => String(a.id) === String(accountIdFilter))?.name || "";
      openChequeVoucherPrintWindow(toPrint, {lang,filters:{...reportParams,account_name:accountName}}, popup);
    } catch (e) {
      popup.close();
      setError(e.response?.data?.message || e.message || "Unable to print cheque report.");
    } finally { setPrinting(false); }
  };

  const updateForm = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value,
      ...(key === "account_type" ? { account_id: "", payee_name: "" } : {}),
      ...(key === "account_id" ? {
        payee_name: (accounts[previous.account_type] || []).find(a => String(a.id) === String(value))?.name || "",
      } : {}),
    }));

  const updatePayment = (localId, key, value) => {
    setForm((previous) => ({
      ...previous,
      payments: previous.payments.map((row) =>
        row.local_id === localId ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addPayment = () => {
    setForm((previous) => ({
      ...previous,
      payments: [...previous.payments, emptyPayment()],
    }));
  };

  const removePayment = (localId) => {
    setForm((previous) => ({
      ...previous,
      payments:
        previous.payments.length === 1
          ? [emptyPayment()]
          : previous.payments.filter((row) => row.local_id !== localId),
    }));
  };

  const saveVoucher = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.payee_name.trim() || !form.account_id || !form.issuance_date) {
      setError(t.requiredMain);
      return;
    }

    if (!form.clearance_date || formTotal <= 0) {
      setError(t.requiredTotal);
      return;
    }

    if (paidInForm > formTotal) {
      setError(t.overPaid);
      return;
    }

    const payments = form.payments
      .filter((row) => row.details.trim() || Number(row.amount))
      .map(({ payment_date, details, amount }) => ({
        payment_date,
        details: details.trim(),
        amount: Number(amount),
      }));

    setSaving(true);

    try {
      const payload = {
        ...form,
        account_id: Number(form.account_id),
        total_amount: formTotal,
        payments,
      };

      if (editingId) {
        await axios.put(`${API_BASE}/cheque-vouchers/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE}/cheque-vouchers`, payload);
      }

      setShowForm(false);
      flash(editingId ? t.updated : t.saved);
      await loadRecords();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t.saveError
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteVoucher = async (record) => {
    if (!window.confirm(`${t.deleteConfirm} ${record.voucher_no}?`)) return;

    setError("");

    try {
      await axios.delete(`${API_BASE}/cheque-vouchers/${record.id}`);
      flash(t.deleted);
      await loadRecords();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t.deleteError
      );
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 px-3 py-3 sm:px-4 sm:py-4 pb-16 ${
        isUrdu ? "font-['Noto_Nastaliq_Urdu',serif]" : ""
      }`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {notice && (
        <div className="fixed bottom-4 right-4 z-[80] rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg">
          {notice}
        </div>
      )}

      {!showForm && (
      <div className="mx-auto max-w-[1500px] space-y-3">
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-sky-700">
                <WalletCards size={12} /> {t.accounts}
              </div>
              <h1 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
                {t.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {t.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
              >
                {t.toggleLang}
              </button>

              <button
                type="button"
                onClick={loadRecords}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={14} /> {t.refresh}
              </button>

              <button type="button" onClick={printFilteredReport} disabled={loading || printing || !records.length}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100 disabled:opacity-50">
                <Printer size={14} /> {printing ? t.loading : selectedIds.length ? t.printSelected + " (" + selectedIds.length + ")" : t.printFiltered}
              </button>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Plus size={15} /> {t.newVoucher}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
              className="rounded-md p-0.5 hover:bg-rose-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Cheque receiving and paying summary">
          <SummaryCard icon={<WalletCards />} label={t.receivedTotal} value={money(summary.receivedTotal)} tone="emerald" />
          <SummaryCard icon={<CheckCircle2 />} label={t.receivedCleared} value={money(summary.receivedCleared)} tone="emerald" />
          <SummaryCard icon={<CircleDollarSign />} label={t.issuedTotal} value={money(summary.issuedTotal)} tone="amber" />
          <SummaryCard icon={<CalendarClock />} label={t.issuedCleared} value={money(summary.issuedCleared)} tone="sky" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2.5 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1">
              {[
                ["all", t.all],
                ["remaining", t.remaining],
                ["cleared", t.cleared],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`h-8 rounded-md px-3 text-xs font-bold transition ${
                    filter === value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1" aria-label={t.directionFilter}>
                {[
                  ["all", t.directionAll],
                  ["receive", t.received],
                  ["issue", t.paid],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={directionFilter === value}
                    onClick={() => setDirectionFilter(value)}
                    className={`h-8 rounded-md px-2.5 text-[11px] font-bold transition ${
                      directionFilter === value
                        ? value === "receive"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : value === "issue"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-sky-700 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold text-slate-500">
                {t.sortBy}
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 outline-none focus:border-sky-400"
                >
                  <option value="nearest">{t.nearestDate}</option>
                  <option value="newest">{t.newestFirst}</option>
                </select>
              </label>
            </div>

            <label className="relative block w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                const value = today();
                if (dateFrom === value && dateTo === value) {
                  setDateFrom("");
                  setDateTo("");
                } else {
                  setDateFrom(value);
                  setDateTo(value);
                }
              }}
              className={`h-8 rounded-lg border px-3 text-[11px] font-bold transition ${
                dateFrom === today() && dateTo === today()
                  ? "border-sky-700 bg-sky-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-sky-50"
              }`}
            >
              {t.todayFilter}
            </button>
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500">
              {t.fromDate}
              <input type="date" value={dateFrom} max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-sky-400" />
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500">
              {t.toDate}
              <input type="date" value={dateTo} min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-sky-400" />
            </label>
            {(dateFrom || dateTo) && (
              <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="h-8 rounded-lg px-2 text-[11px] font-bold text-sky-700 hover:bg-sky-50">
                {t.clearDates}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-3 py-2.5">
            <label className="block min-w-[160px] text-[10px] font-bold text-slate-600">
              {t.filterAccountType}
              <select value={accountTypeFilter} onChange={e => {setAccountTypeFilter(e.target.value);setAccountIdFilter("");}}
                className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs">
                <option value="all">{t.allTypes}</option>
                {["customer","supplier","employee","general_ledger"].map(type => <option key={type} value={type}>{t[type]}</option>)}
              </select>
            </label>
            <label className="block min-w-[210px] text-[10px] font-bold text-slate-600">
              {t.filterAccountName}
              <select value={accountIdFilter} disabled={accountTypeFilter === "all"} onChange={e=>setAccountIdFilter(e.target.value)}
                className="mt-1 block h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs disabled:bg-slate-50">
                <option value="">{t.allNames}</option>
                {(accounts[accountTypeFilter] || []).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <p className="self-end pb-2 text-[10px] text-slate-500">{t.chequeDateFilterNote}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1230px] text-left text-[11px]">
              <thead className="bg-slate-50 text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="w-8 px-2 py-2 text-center"><input type="checkbox" aria-label="Select all filtered vouchers"
                    checked={records.length>0 && records.every(row=>selectedIds.includes(row.id))}
                    onChange={e=>setSelectedIds(e.target.checked?records.map(row=>row.id):[])} /></th>
                  <th className="px-3 py-2">{t.voucherPayee}</th>
                  <th className="px-3 py-2">{t.accountColumn}</th>
                  <th className="px-3 py-2">{t.directionFilter}</th>
                  <th className="px-3 py-2">{t.issueDate}</th>
                  <th className="px-3 py-2">{t.clearanceDate}</th>
                  <th className="px-3 py-2 text-right">{t.chequeAmount}</th>
                  <th className="px-3 py-2 text-right">{t.paidRemaining}</th>
                  <th className="px-3 py-2 text-center">{t.status}</th>
                  <th className="px-3 py-2 text-center">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-8 text-center text-slate-400">
                      <Loader2 className="mx-auto mb-2 animate-spin" size={22} />
                      {t.loading}
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-8 text-center text-slate-400">
                      <WalletCards className="mx-auto mb-2 text-slate-300" size={26} />
                      <div className="font-semibold text-slate-500">{t.noVouchers}</div>
                      <div className="mt-0.5 text-[10px]">
                        {t.noMatch}
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const status = statusMeta(record.status, t);
                    const due = dueMeta(record.clearance_date, record.status, t, isUrdu);
                    const accountName = record.account_title ||
                      (accounts[record.account_type] || []).find(
                        (account) => String(account.id) === String(record.account_id)
                      )?.name || record.payee_name || "—";

                    return (
                      <tr key={record.id} className="transition hover:bg-sky-50/50">
                        <td className="px-2 py-2 text-center"><input type="checkbox" checked={selectedIds.includes(record.id)} onChange={()=>toggleSelected(record.id)} aria-label={"Select voucher " + record.voucher_no} /></td>
                        <td className="px-3 py-2">
                          <div className="font-extrabold text-slate-900">
                            {record.voucher_no}
                          </div>
                          <div className="max-w-[170px] truncate text-[10px] text-slate-500">
                            {record.payee_name || "—"}
                          </div>
                        </td>

                        <td className="px-3 py-2">
                          <div className="max-w-[200px] break-words font-extrabold text-slate-800">
                            {accountName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t[record.account_type] || record.account_type}
                          </div>
                        </td>

                        <td className="px-3 py-2">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-extrabold ${
                            record.cheque_direction === "receive"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}>
                            {record.cheque_direction === "receive" ? t.received : t.paid}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[10px] text-slate-600">
                          {formatDate(record.issuance_date)}
                        </td>

                        <td className="px-3 py-2">
                          <div className="whitespace-nowrap font-mono text-[10px] text-slate-700">
                            {formatDate(record.clearance_date)}
                          </div>
                          {due && (
                            <div className={`mt-0.5 text-[9px] font-bold ${due.tone}`}>
                              {due.text}
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-[10px] font-extrabold text-slate-900">
                          {money(record.total_amount)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <div className="font-mono text-[10px] font-bold text-emerald-700">
                            {t.paidShort}: {money(record.paid_amount)}
                          </div>
                          <div className="font-mono text-[10px] font-bold text-rose-700">
                            {t.remShort}: {money(record.remaining_amount)}
                          </div>
                        </td>

                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[9px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>

                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton title={t.viewDetails} primary onClick={() => openView(record)}>
                              <Eye size={12} />
                              <span>{t.details}</span>
                            </ActionButton>
                            <ActionButton title={t.printSingle} onClick={() => printSingleVoucher(record)}>
                              <Printer size={13} />
                            </ActionButton>
                            <ActionButton title={t.editPayment} onClick={() => openEdit(record)}>
                              <Edit3 size={13} />
                            </ActionButton>
                            <ActionButton title={t.delete} danger onClick={() => deleteVoucher(record)}>
                              <Trash2 size={13} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      )}

      {showForm && (
        <Modal
          title={editingId ? t.editVoucher : t.createVoucher}
          eyebrow={`${t.accounts} • ${t.title}`}
          closeLabel={t.cancel}
          onClose={() => !saving && setShowForm(false)}
          wide
          inline
        >
          <form onSubmit={saveVoucher} className="space-y-3">
            <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[150px_minmax(175px,1fr)_minmax(210px,1.2fr)_170px_170px]">
              <Field label={t.voucherNo} hint={t.autoVoucher}>
                <input
                  value={form.voucher_no}
                  onChange={(event) => updateForm("voucher_no", event.target.value)}
                  className="input min-w-0"
                  placeholder={t.voucherPlaceholder}
                />
              </Field>

              <Field label={t.chequeDirection} required>
                <select value={form.cheque_direction}
                  onChange={e => updateForm("cheque_direction",e.target.value)} className="input min-w-0">
                  <option value="receive">{t.receiveCheque}</option>
                  <option value="issue">{t.issueCheque}</option>
                </select>
              </Field>
              <Field label={t.accountType} required>
                <select value={form.account_type} onChange={e => updateForm("account_type",e.target.value)} className="input min-w-0">
                  {["customer", "supplier", "employee", "general_ledger"].map(type =>
                    <option key={type} value={type}>{t[type]}</option>)}
                </select>
              </Field>
              <Field label={t.accountName} required>
                <select value={form.account_id} onChange={e => updateForm("account_id",e.target.value)} className="input min-w-0 truncate">
                  <option value="">{t.selectLedger}</option>
                  {(accounts[form.account_type] || []).map(account =>
                    <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </Field>
              <Field label={t.payee}>
                <input value={form.payee_name} onChange={e => updateForm("payee_name",e.target.value)}
                  className="input min-w-0" placeholder={t.payeePlaceholder}/>
              </Field>

              <Field label={t.issuanceDate} required>
                <input
                  type="date"
                  value={form.issuance_date}
                  onChange={(event) => updateForm("issuance_date", event.target.value)}
                  className="input min-w-0"
                />
              </Field>

              <Field label={t.clearanceDate} required>
                <input
                  type="date"
                  min={form.issuance_date || undefined}
                  value={form.clearance_date}
                  onChange={(event) => updateForm("clearance_date", event.target.value)}
                  className="input min-w-0"
                />
              </Field>

              <Field label={t.chequeTotal} required className="xl:col-start-1">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.total_amount}
                  onChange={(event) => updateForm("total_amount", event.target.value)}
                  className="input min-w-0"
                  placeholder="0.00"
                />
              </Field>

                <Field
                  label={t.notes}
                  className="sm:col-span-2 lg:col-span-3 xl:col-span-4"
                >
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateForm("notes", event.target.value)}
                    className="input block h-[52px] min-h-[52px] w-full min-w-0 resize-y"
                    placeholder={t.notesPlaceholder}
                  />
                </Field>
              </div>
            </section>

            <p className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2 text-xs text-sky-800">{t.cashbookHelp}</p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-slate-50 px-3 py-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {t.paymentDetails}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {t.paymentHelp}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPayment}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-sky-100 px-2.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-200"
                >
                  <Plus size={13} /> {t.addRow}
                </button>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full min-w-[680px] text-xs">
                  <thead className="text-left text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="w-44 px-2 py-1.5">{t.date}</th>
                      <th className="px-2 py-1.5">{t.detail}</th>
                      <th className="w-48 px-2 py-1.5">{t.amount}</th>
                      <th className="w-10 px-2 py-1.5" />
                    </tr>
                  </thead>

                  <tbody>
                    {form.payments.map((row) => (
                      <tr key={row.local_id}>
                        <td className="p-1.5">
                          <input
                            type="date"
                            value={row.payment_date}
                            onChange={(event) =>
                              updatePayment(row.local_id, "payment_date", event.target.value)
                            }
                            className="input"
                          />
                        </td>

                        <td className="p-1.5">
                          <input
                            value={row.details}
                            onChange={(event) =>
                              updatePayment(row.local_id, "details", event.target.value)
                            }
                            className="input"
                            placeholder={t.paymentPlaceholder}
                          />
                        </td>

                        <td className="p-1.5">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={row.amount}
                            onChange={(event) =>
                              updatePayment(row.local_id, "amount", event.target.value)
                            }
                            className="input text-right font-mono"
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-1.5">
                          <button
                            type="button"
                            onClick={() => removePayment(row.local_id)}
                            className="rounded-md p-1.5 text-rose-500 transition hover:bg-rose-50"
                            aria-label="Remove payment row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Total label={t.chequeTotal} value={money(formTotal)} />
              <Total label={t.paidShort} value={money(paidInForm)} tone="text-emerald-700" />
              <Total
                label={t.remainingBalance}
                value={money(remainingInForm)}
                tone="text-amber-700"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                {t.cancel}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Save size={15} />
                )}
                {editingId ? t.updateVoucher : t.saveVoucher}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewVoucher && (
        <Modal
          title={`${t.title} ${viewVoucher.voucher_no}`}
          eyebrow={`${t.accounts} • ${t.details}`}
          onClose={() => setViewVoucher(null)}
          wide
        >
          <VoucherDetails voucher={viewVoucher} t={t} />
          <div className="mt-2 flex justify-end"><button type="button" onClick={()=>printSingleVoucher(viewVoucher)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-800"><Printer size={14}/>{t.printSingle}</button></div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setViewVoucher(null)}
              className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              {t.close}
            </button>

            <button
              type="button"
              onClick={() => {
                setViewVoucher(null);
                openEdit(viewVoucher);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              <Edit3 size={14} /> {t.editPayment}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const SummaryCard = ({ icon, label, value, tone = "sky" }) => {
  const colors = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="flex min-h-[64px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors[tone]}`}
      >
        {React.cloneElement(icon, { size: 15 })}
      </div>

      <div className="min-w-0">
        <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </div>
        <div className="truncate text-sm font-extrabold text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({
  children,
  title,
  onClick,
  danger = false,
  primary = false,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`inline-flex h-7 items-center justify-center gap-1 rounded-md border px-2 text-[9px] font-bold transition ${
      danger
        ? "border-rose-100 text-rose-600 hover:bg-rose-50"
        : primary
        ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
        : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sky-700"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, hint, required, children, className = "" }) => (
  <label className={`block min-w-0 ${className}`}>
    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-600">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}
  </label>
);

const Total = ({ label, value, tone = "text-slate-900" }) => (
  <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <div className="text-[8px] font-bold uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className={`mt-0.5 truncate font-mono text-sm font-extrabold ${tone}`}>
      {value}
    </div>
  </div>
);

const Modal = ({
  title,
  eyebrow,
  closeLabel,
  onClose,
  children,
  wide = false,
  inline = false,
}) => (
  <div
    className={
      inline
        ? "mx-auto w-full max-w-[1060px]"
        : "fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-2.5 backdrop-blur-sm sm:p-3"
    }
  >
    <div
      className={`${inline ? "" : "my-auto"} w-full overflow-hidden rounded-[18px] border border-slate-300 bg-slate-50 shadow-[0_30px_90px_rgba(15,23,42,0.28)] ${
        wide ? "max-w-[1060px]" : "max-w-2xl"
      }`}
    >
      <div className="flex h-[54px] items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 px-4 text-white sm:px-[18px]">
        <div className="min-w-0">
          <div className="mb-0.5 inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide">
            {eyebrow}
          </div>
          <h2 className="truncate text-[15px] font-black sm:text-[17px]">{title}</h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`flex h-8 shrink-0 items-center justify-center rounded-[10px] border border-white/25 bg-white/10 text-white transition hover:bg-white/20 ${
            inline ? "w-auto gap-1.5 px-3 text-[10px] font-black" : "w-8"
          }`}
          aria-label="Close modal"
        >
          {inline ? (
            <>
              <span aria-hidden="true">←</span> {closeLabel}
            </>
          ) : (
            <X size={17} />
          )}
        </button>
      </div>

      <div className="max-h-[calc(100vh-82px)] overflow-y-auto bg-slate-100 p-3 sm:p-3.5">
        {children}
      </div>
    </div>
  </div>
);

const VoucherDetails = ({ voucher, t }) => {
  const status = statusMeta(voucher.status, t);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Detail label={t.voucherNo} value={voucher.voucher_no} />
        <Detail label={t.payee} value={voucher.payee_name} />
        <Detail label={t.chequeDirection} value={voucher.cheque_direction === "receive" ? t.receiveCheque : t.issueCheque} />
        <Detail label={t.accountType} value={t[voucher.account_type] || voucher.account_type} />
        <Detail
          label={t.ledgerAccount}
          value={voucher.account_title || voucher.payee_name}
        />
        <Detail label={t.status} value={status.label} />
        <Detail label={t.issuanceDate} value={formatDate(voucher.issuance_date)} />
        <Detail label={t.clearanceDate} value={formatDate(voucher.clearance_date)} />
        <Detail label={t.chequeTotal} value={money(voucher.total_amount)} />
        <Detail label={t.paidShort} value={money(voucher.paid_amount)} />
        <Detail label={t.remaining} value={money(voucher.remaining_amount)} />
        <Detail label={t.paymentRows} value={voucher.payments?.length || 0} />
      </div>

      {voucher.notes && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          <strong className="text-slate-800">{t.notes}:</strong> {voucher.notes}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
          {t.allPayments}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="bg-white text-left text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">{t.date}</th>
                <th className="px-3 py-2">{t.detail}</th>
                <th className="px-3 py-2 text-right">{t.amount}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {voucher.payments?.length ? (
                voucher.payments.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                      {formatDate(row.payment_date)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.details || "—"}
                      {row.cash_book_voucher_no && <div className="text-[10px] text-sky-700 font-semibold">Cash Book: {row.cash_book_voucher_no}</div>}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11px] font-bold text-slate-900">
                      {money(row.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-3 py-8 text-center text-slate-400">
                    {t.noPayments}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Total label={t.chequeTotal} value={money(voucher.total_amount)} />
        <Total label={t.paidShort} value={money(voucher.paid_amount)} tone="text-emerald-700" />
        <Total
          label={t.remaining}
          value={money(voucher.remaining_amount)}
          tone="text-amber-700"
        />
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            {t.status}
          </div>
          <span
            className={`mt-1 inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-0.5 truncate text-xs font-semibold text-slate-800">
      {value === 0 ? 0 : value || "—"}
    </div>
  </div>
);
