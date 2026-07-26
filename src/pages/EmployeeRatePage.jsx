import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const SALARY_API = `${API_ROOT}/api/employee-salary`;
const EMPLOYEES_API = `${API_ROOT}/api/employees`;

const LANG = {
  en: {
    title: "Employee Salary",
    subtitle: "Create and manage monthly employee salary records",
    newSalary: "New Salary",
    toggleLang: "اردو",
    refresh: "Refresh",
    searchPlaceholder: "Search employee, month or status...",
    allMonths: "All Months",
    allStatuses: "All Statuses",

    employee: "Employee",
    selectEmployee: "-- Select Employee --",
    salaryMonth: "Salary Month",
    status: "Status",
    paid: "Paid",
    pending: "Pending",
    viewDetails: "View Details",
    details: "Salary Details",
    close: "Close",

    salary: "Salary",
    perDaySalary: "Per Day Salary",
    extraDays: "Extra Days",
    extraDayAmount: "Extra Day Amount",
    absentDays: "Absent Days",
    absentAmount: "Absent Deduction",
    timeDeductionHours: "Time Deduction Hours",
    timeDeductionRate: "Time Deduction Rate",
    timeDeductionAmount: "Time Deduction Amount",
    overtimeHours: "Overtime Hours",
    overtimeRate: "Overtime Rate",
    overtimeAmount: "Overtime Amount",
    calculatedAmount: "Calculated Amount",
    advance: "Advance",
    previousAdvance: "Previous Advance",
    totalAdvance: "Total Advance",
    remainingBalance: "Remaining Balance",
    notes: "Notes",
    notesPlaceholder: "Optional note...",

    employeeInformation: "Employee Information",
    attendanceInformation: "Attendance & Time",
    salaryCalculation: "Salary Calculation",

    save: "Save Salary",
    update: "Update Salary",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",

    loading: "Loading salary records...",
    loadingDetails: "Loading details...",
    noRecords: "No salary records found.",
    noEmployees: "No employees found from backend.",
    loadError: "Salary data could not be loaded from backend.",
    saveError: "Salary could not be saved. Check backend.",
    deleteError: "Salary record could not be deleted.",
    requiredError: "Employee, salary month and salary are required.",
    saved: "Salary saved successfully.",
    updated: "Salary updated successfully.",
    deleted: "Salary deleted successfully.",
    deleteConfirm: "Are you sure you want to delete this salary record?",

    days: "days",
    hours: "hours",
    automatic: "Automatic",
    formula:
      "Calculated Amount = Salary + Extra Day + Overtime − Absent − Time Deduction",
    balanceFormula:
      "Remaining Balance = Calculated Amount − Advance − Previous Advance",
  },

  ur: {
    title: "ملازم کی تنخواہ",
    subtitle: "ملازمین کی ماہانہ تنخواہ کا ریکارڈ بنائیں اور منظم کریں",
    newSalary: "نئی تنخواہ",
    toggleLang: "English",
    refresh: "ری فریش",
    searchPlaceholder: "ملازم، مہینہ یا حالت تلاش کریں...",
    allMonths: "تمام مہینے",
    allStatuses: "تمام حالتیں",

    employee: "ملازم",
    selectEmployee: "-- ملازم منتخب کریں --",
    salaryMonth: "تنخواہ کا مہینہ",
    status: "حالت",
    paid: "ادا شدہ",
    pending: "زیر التواء",
    viewDetails: "تفصیل دیکھیں",
    details: "تنخواہ کی تفصیل",
    close: "بند کریں",

    salary: "تنخواہ",
    perDaySalary: "فی دن تنخواہ",
    extraDays: "اضافی دن",
    extraDayAmount: "اضافی دن کی رقم",
    absentDays: "غیر حاضر دن",
    absentAmount: "غیر حاضری کی کٹوتی",
    timeDeductionHours: "ٹائم کٹوتی کے گھنٹے",
    timeDeductionRate: "ٹائم کٹوتی ریٹ",
    timeDeductionAmount: "ٹائم کٹوتی کی رقم",
    overtimeHours: "اوور ٹائم گھنٹے",
    overtimeRate: "اوور ٹائم ریٹ",
    overtimeAmount: "اوور ٹائم رقم",
    calculatedAmount: "حساب رقم",
    advance: "ایڈوانس",
    previousAdvance: "سابقہ ایڈوانس",
    totalAdvance: "کل ایڈوانس",
    remainingBalance: "بقایا حساب",
    notes: "نوٹس",
    notesPlaceholder: "اختیاری نوٹ...",

    employeeInformation: "ملازم کی معلومات",
    attendanceInformation: "حاضری اور وقت",
    salaryCalculation: "تنخواہ کا حساب",

    save: "تنخواہ محفوظ کریں",
    update: "تنخواہ اپڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",

    loading: "تنخواہ ریکارڈ لوڈ ہو رہے ہیں...",
    loadingDetails: "تفصیل لوڈ ہو رہی ہے...",
    noRecords: "تنخواہ کا کوئی ریکارڈ نہیں ملا۔",
    noEmployees: "بیک اینڈ سے کوئی ملازم نہیں ملا۔",
    loadError: "بیک اینڈ سے تنخواہ کا ڈیٹا لوڈ نہیں ہوا۔",
    saveError: "تنخواہ محفوظ نہیں ہوئی، بیک اینڈ چیک کریں۔",
    deleteError: "تنخواہ ریکارڈ حذف نہیں ہوا۔",
    requiredError: "ملازم، تنخواہ کا مہینہ اور تنخواہ ضروری ہیں۔",
    saved: "تنخواہ کامیابی سے محفوظ ہو گئی۔",
    updated: "تنخواہ کامیابی سے اپڈیٹ ہو گئی۔",
    deleted: "تنخواہ کامیابی سے حذف ہو گئی۔",
    deleteConfirm: "کیا آپ یہ تنخواہ ریکارڈ حذف کرنا چاہتے ہیں؟",

    days: "دن",
    hours: "گھنٹے",
    automatic: "خودکار",
    formula:
      "حساب رقم = تنخواہ + اضافی دن + اوور ٹائم − غیر حاضری − ٹائم کٹوتی",
    balanceFormula:
      "بقایا حساب = حساب رقم − ایڈوانس − سابقہ ایڈوانس",
  },
};

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const emptyForm = () => ({
  employee_id: "",
  salary_month: currentMonth(),
  basic_salary: "",
  extra_days: "0",
  absent_days: "0",
  time_deduction_hours: "0",
  time_deduction_rate: "0",
  overtime_hours: "0",
  overtime_rate: "0",
  advance: "0",
  previous_advance: "0",
  status: "Pending",
  notes: "",
});

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.employees)) return value.employees;
  if (Array.isArray(value?.salaries)) return value.salaries;
  return [];
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  toNumber(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getEmployeeId = (employee) =>
  employee?.id ??
  employee?.employee_id ??
  employee?.EmployeeID ??
  employee?.value ??
  "";

const getEmployeeName = (employee) =>
  employee?.full_name ??
  employee?.employee_name ??
  employee?.name ??
  employee?.name_en ??
  employee?.title ??
  "";

const getEmployeeSalary = (employee) =>
  toNumber(
    employee?.basic_salary ??
      employee?.salary ??
      employee?.monthly_salary ??
      employee?.current_salary
  );

const getEmployeePreviousAdvance = (employee) =>
  toNumber(
    employee?.previous_advance ??
      employee?.outstanding_advance ??
      employee?.advance_balance ??
      employee?.remaining_advance
  );

const getRecordId = (record) =>
  record?.id ??
  record?.salary_id ??
  record?.employee_salary_id ??
  record?.EmployeeSalaryID ??
  "";

const getRecordEmployeeName = (record, employees) => {
  if (record?.employee_name) return record.employee_name;

  const employee = employees.find(
    (item) =>
      String(getEmployeeId(item)) === String(record?.employee_id)
  );

  return getEmployeeName(employee) || "-";
};

const normalizeStatus = (status) =>
  String(status || "Pending").toLowerCase() === "paid"
    ? "Paid"
    : "Pending";

const pickValue = (record, keys, fallback = 0) => {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
};

const calculationsFromForm = (form) => {
  const salary = toNumber(form.basic_salary);
  const perDaySalary = salary / 30;

  const extraDays = toNumber(form.extra_days);
  const absentDays = toNumber(form.absent_days);
  const timeDeductionHours = toNumber(form.time_deduction_hours);
  const timeDeductionRate = toNumber(form.time_deduction_rate);
  const overtimeHours = toNumber(form.overtime_hours);
  const overtimeRate = toNumber(form.overtime_rate);
  const advance = toNumber(form.advance);
  const previousAdvance = toNumber(form.previous_advance);

  const extraDayAmount = extraDays * perDaySalary;
  const absentAmount = absentDays * perDaySalary;
  const timeDeductionAmount =
    timeDeductionHours * timeDeductionRate;
  const overtimeAmount = overtimeHours * overtimeRate;

  const calculatedAmount =
    salary +
    extraDayAmount +
    overtimeAmount -
    absentAmount -
    timeDeductionAmount;

  const totalAdvance = advance + previousAdvance;
  const remainingBalance = calculatedAmount - totalAdvance;

  return {
    salary,
    perDaySalary,
    extraDays,
    extraDayAmount,
    absentDays,
    absentAmount,
    timeDeductionHours,
    timeDeductionRate,
    timeDeductionAmount,
    overtimeHours,
    overtimeRate,
    overtimeAmount,
    calculatedAmount,
    advance,
    previousAdvance,
    totalAdvance,
    remainingBalance,
  };
};

function FormField({
  label,
  value,
  onChange,
  type = "number",
  min = "0",
  step = "0.01",
  readOnly = false,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>

      {children || (
        <input
          type={type}
          min={type === "number" ? min : undefined}
          step={type === "number" ? step : undefined}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            readOnly
              ? "border-slate-200 bg-slate-100 font-semibold text-slate-600"
              : "border-slate-300 bg-white text-slate-800"
          }`}
        />
      )}
    </div>
  );
}

function DetailItem({ label, value, important = false, negative = false }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        important
          ? negative
            ? "border-red-200 bg-red-50"
            : "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm font-bold ${
          important
            ? negative
              ? "text-red-700"
              : "text-emerald-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function EmployeeRatePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [detailRecord, setDetailRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const calculations = useMemo(
    () => calculationsFromForm(form),
    [form]
  );

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [salaryResponse, employeeResponse] = await Promise.all([
        axios.get(SALARY_API),
        axios.get(EMPLOYEES_API),
      ]);

      setRecords(getList(salaryResponse.data));
      setEmployees(getList(employeeResponse.data));
    } catch (error) {
      console.error("Employee salary load error:", error);
      setRecords([]);
      setEmployees([]);
      showToast("error", LANG[lang].loadError);
    } finally {
      setLoading(false);
    }
  }, [lang, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(
      (item) => String(getEmployeeId(item)) === String(employeeId)
    );

    const salary = getEmployeeSalary(employee);
    const perDay = salary / 30;

    setForm((previous) => ({
      ...previous,
      employee_id: employeeId,
      basic_salary: salary ? String(salary) : "",
      overtime_rate: salary ? (perDay / 8).toFixed(2) : "0",
      time_deduction_rate: salary ? (perDay / 10).toFixed(2) : "0",
      previous_advance: String(getEmployeePreviousAdvance(employee)),
    }));
  };

  const handleSalaryChange = (salaryValue) => {
    const salary = toNumber(salaryValue);
    const perDay = salary / 30;

    setForm((previous) => ({
      ...previous,
      basic_salary: salaryValue,
      overtime_rate: salary ? (perDay / 8).toFixed(2) : "0",
      time_deduction_rate: salary ? (perDay / 10).toFixed(2) : "0",
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const recordToForm = (record) => {
    const salary = toNumber(record?.basic_salary);
    const perDay = salary / 30;

    return {
      employee_id: String(record?.employee_id ?? ""),
      salary_month: record?.salary_month || currentMonth(),
      basic_salary: String(record?.basic_salary ?? ""),
      extra_days: String(record?.extra_days ?? 0),
      absent_days: String(
        pickValue(record, ["absent_days", "absent"], 0)
      ),
      time_deduction_hours: String(
        pickValue(
          record,
          ["time_deduction_hours", "time_deduction"],
          0
        )
      ),
      time_deduction_rate: String(
        pickValue(
          record,
          ["time_deduction_rate"],
          salary ? perDay / 10 : 0
        )
      ),
      overtime_hours: String(record?.overtime_hours ?? 0),
      overtime_rate: String(
        pickValue(
          record,
          ["overtime_rate"],
          salary ? perDay / 8 : 0
        )
      ),
      advance: String(
        pickValue(record, ["advance", "current_advance"], 0)
      ),
      previous_advance: String(record?.previous_advance ?? 0),
      status: normalizeStatus(record?.status),
      notes: record?.notes || "",
    };
  };

  const openEdit = (record) => {
    setEditingId(getRecordId(record));
    setForm(recordToForm(record));
    setShowDetails(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const buildPayload = () => ({
    employee_id: Number(form.employee_id),
    salary_month: form.salary_month,
    basic_salary: calculations.salary,
    per_day_salary: calculations.perDaySalary,
    extra_days: calculations.extraDays,
    extra_day_amount: calculations.extraDayAmount,
    absent_days: calculations.absentDays,
    absent_amount: calculations.absentAmount,
    time_deduction_hours: calculations.timeDeductionHours,
    time_deduction_rate: calculations.timeDeductionRate,
    time_deduction_amount: calculations.timeDeductionAmount,
    overtime_hours: calculations.overtimeHours,
    overtime_rate: calculations.overtimeRate,
    overtime_amount: calculations.overtimeAmount,
    calculated_amount: calculations.calculatedAmount,
    advance: calculations.advance,
    previous_advance: calculations.previousAdvance,
    total_advance: calculations.totalAdvance,
    remaining_balance: calculations.remainingBalance,
    status: form.status,
    notes: form.notes.trim(),
  });

  const handleSave = async () => {
    if (
      !form.employee_id ||
      !form.salary_month ||
      calculations.salary <= 0
    ) {
      showToast("error", t.requiredError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (editingId) {
        await axios.put(`${SALARY_API}/${editingId}`, payload);
        showToast("success", t.updated);
      } else {
        await axios.post(SALARY_API, payload);
        showToast("success", t.saved);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await fetchData();
    } catch (error) {
      console.error("Employee salary save error:", error);
      showToast(
        "error",
        error?.response?.data?.message || t.saveError
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await axios.delete(`${SALARY_API}/${recordId}`);
      setShowDetails(false);
      setDetailRecord(null);
      await fetchData();
      showToast("success", t.deleted);
    } catch (error) {
      console.error("Employee salary delete error:", error);
      showToast(
        "error",
        error?.response?.data?.message || t.deleteError
      );
    }
  };

  const openDetails = async (record) => {
    setDetailRecord(record);
    setShowDetails(true);

    const recordId = getRecordId(record);
    if (!recordId) return;

    setDetailLoading(true);

    try {
      const response = await axios.get(`${SALARY_API}/${recordId}`);
      const responseRecord =
        response?.data?.data ??
        response?.data?.result ??
        response?.data?.salary ??
        response?.data;

      if (responseRecord && !Array.isArray(responseRecord)) {
        setDetailRecord((previous) => ({
          ...previous,
          ...responseRecord,
        }));
      }
    } catch (error) {
      // The list record is still displayed when a dedicated detail endpoint
      // is not available on the backend.
      console.warn("Salary detail endpoint unavailable:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const availableMonths = useMemo(
    () =>
      [
        ...new Set(
          records
            .map((record) => record.salary_month)
            .filter(Boolean)
        ),
      ]
        .sort()
        .reverse(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const employeeName = getRecordEmployeeName(record, employees);
      const status = normalizeStatus(record.status);

      const matchesSearch =
        !query ||
        [employeeName, record.salary_month, status, record.notes]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesMonth =
        !monthFilter || record.salary_month === monthFilter;

      const matchesStatus =
        !statusFilter || status === statusFilter;

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [records, employees, search, monthFilter, statusFilter]);

  const selectedDetailName = detailRecord
    ? getRecordEmployeeName(detailRecord, employees)
    : "-";

  const detailBalance = toNumber(
    pickValue(
      detailRecord,
      ["remaining_balance", "baqaya_hisaab"],
      0
    )
  );

  return (
    <div
      dir={dir}
      className={`min-h-full w-full ${
        isUrdu
          ? "[font-family:'Noto_Nastaliq_Urdu',serif]"
          : "font-sans"
      }`}
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />

      {isUrdu && (
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      )}

      {message.text && (
        <div
          className={`fixed bottom-6 z-[100] max-w-sm rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${
            isUrdu ? "left-6" : "right-6"
          } ${
            message.type === "error"
              ? "bg-red-600"
              : "bg-emerald-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <i
              className={`bi ${
                message.type === "error"
                  ? "bi-exclamation-triangle"
                  : "bi-check-circle"
              }`}
            />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1450px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setLang((previous) =>
                  previous === "en" ? "ur" : "en"
                )
              }
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600"
            >
              <i className="bi bi-translate" />
              {t.toggleLang}
            </button>

            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <i className="bi bi-plus-lg" />
              {t.newSalary}
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(220px,1fr)_170px_170px_auto]">
            <div className="relative">
              <i
                className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isUrdu ? "right-3" : "left-3"
                }`}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className={`h-10 w-full rounded-lg border border-slate-300 bg-white text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  isUrdu ? "pl-3 pr-9" : "pl-9 pr-3"
                }`}
              />
            </div>

            <select
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">{t.allMonths}</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">{t.allStatuses}</option>
              <option value="Paid">{t.paid}</option>
              <option value="Pending">{t.pending}</option>
            </select>

            <button
              type="button"
              onClick={fetchData}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <i className="bi bi-arrow-clockwise text-blue-600" />
              {t.refresh}
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[50%]" />
              <col className="w-[22%]" />
              <col className="w-[28%]" />
            </colgroup>

            <thead className="bg-slate-900 text-white">
              <tr>
                <th
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wide ${
                    isUrdu ? "text-right" : "text-left"
                  }`}
                >
                  {t.employee}
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">
                  {t.status}
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">
                  {t.viewDetails}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-14 text-center text-sm text-slate-400"
                  >
                    <i className="bi bi-arrow-repeat mx-2" />
                    {t.loading}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-14 text-center text-sm text-slate-400"
                  >
                    <i className="bi bi-inbox mx-2" />
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const employeeName = getRecordEmployeeName(
                    record,
                    employees
                  );
                  const status = normalizeStatus(record.status);

                  return (
                    <tr
                      key={getRecordId(record)}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {employeeName.charAt(0).toUpperCase()}
                          </div>
                          <span className="min-w-0 break-words text-sm font-bold text-slate-800">
                            {employeeName}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            status === "Paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {status === "Paid" ? t.paid : t.pending}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openDetails(record)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:px-4"
                        >
                          <i className="bi bi-eye" />
                          <span className="hidden sm:inline">
                            {t.viewDetails}
                          </span>
                        </button>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-[2px] sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            dir={dir}
            className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? t.update : t.newSalary}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t.formula}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="overflow-y-auto bg-slate-50 p-3 sm:p-5">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
                  {t.employeeInformation}
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <FormField label={t.employee} required>
                    <select
                      value={form.employee_id}
                      onChange={(event) =>
                        handleEmployeeChange(event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">{t.selectEmployee}</option>
                      {employees.map((employee) => (
                        <option
                          key={getEmployeeId(employee)}
                          value={getEmployeeId(employee)}
                        >
                          {getEmployeeName(employee)}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label={t.salaryMonth}
                    type="month"
                    value={form.salary_month}
                    onChange={(event) =>
                      updateField("salary_month", event.target.value)
                    }
                    required
                  />

                  <FormField label={t.status}>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Pending">{t.pending}</option>
                      <option value="Paid">{t.paid}</option>
                    </select>
                  </FormField>

                  <FormField
                    label={t.salary}
                    value={form.basic_salary}
                    onChange={(event) =>
                      handleSalaryChange(event.target.value)
                    }
                    required
                  />

                  <FormField
                    label={t.perDaySalary}
                    value={`PKR ${money(calculations.perDaySalary)}`}
                    readOnly
                    type="text"
                  />
                </div>

                {!loading && employees.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {t.noEmployees}
                  </p>
                )}

                <h3 className="mb-3 mt-5 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
                  {t.attendanceInformation}
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    label={t.extraDays}
                    value={form.extra_days}
                    onChange={(event) =>
                      updateField("extra_days", event.target.value)
                    }
                  />

                  <FormField
                    label={t.extraDayAmount}
                    value={`PKR ${money(calculations.extraDayAmount)}`}
                    readOnly
                    type="text"
                  />

                  <FormField
                    label={t.absentDays}
                    value={form.absent_days}
                    onChange={(event) =>
                      updateField("absent_days", event.target.value)
                    }
                  />

                  <FormField
                    label={t.absentAmount}
                    value={`PKR ${money(calculations.absentAmount)}`}
                    readOnly
                    type="text"
                  />

                  <FormField
                    label={t.timeDeductionHours}
                    value={form.time_deduction_hours}
                    onChange={(event) =>
                      updateField(
                        "time_deduction_hours",
                        event.target.value
                      )
                    }
                  />

                  <FormField
                    label={t.timeDeductionRate}
                    value={form.time_deduction_rate}
                    onChange={(event) =>
                      updateField(
                        "time_deduction_rate",
                        event.target.value
                      )
                    }
                  />

                  <FormField
                    label={t.overtimeHours}
                    value={form.overtime_hours}
                    onChange={(event) =>
                      updateField("overtime_hours", event.target.value)
                    }
                  />

                  <FormField
                    label={t.overtimeRate}
                    value={form.overtime_rate}
                    onChange={(event) =>
                      updateField("overtime_rate", event.target.value)
                    }
                  />
                </div>

                <h3 className="mb-3 mt-5 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
                  {t.salaryCalculation}
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    label={t.timeDeductionAmount}
                    value={`PKR ${money(
                      calculations.timeDeductionAmount
                    )}`}
                    readOnly
                    type="text"
                  />

                  <FormField
                    label={t.overtimeAmount}
                    value={`PKR ${money(calculations.overtimeAmount)}`}
                    readOnly
                    type="text"
                  />

                  <FormField
                    label={t.advance}
                    value={form.advance}
                    onChange={(event) =>
                      updateField("advance", event.target.value)
                    }
                  />

                  <FormField
                    label={t.previousAdvance}
                    value={form.previous_advance}
                    onChange={(event) =>
                      updateField(
                        "previous_advance",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-blue-600">
                      {t.calculatedAmount}
                    </p>
                    <p className="mt-1 text-lg font-bold text-blue-800">
                      PKR {money(calculations.calculatedAmount)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-violet-600">
                      {t.totalAdvance}
                    </p>
                    <p className="mt-1 text-lg font-bold text-violet-800">
                      PKR {money(calculations.totalAdvance)}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg border p-3 ${
                      calculations.remainingBalance < 0
                        ? "border-red-200 bg-red-50"
                        : "border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        calculations.remainingBalance < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {t.remainingBalance}
                    </p>
                    <p
                      className={`mt-1 text-lg font-bold ${
                        calculations.remainingBalance < 0
                          ? "text-red-700"
                          : "text-emerald-700"
                      }`}
                    >
                      PKR {money(calculations.remainingBalance)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {t.notes}
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      updateField("notes", event.target.value)
                    }
                    placeholder={t.notesPlaceholder}
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="mt-3 rounded-lg bg-slate-100 p-3 text-xs leading-6 text-slate-600">
                  <p>{t.formula}</p>
                  <p>{t.balanceFormula}</p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i
                  className={`bi ${
                    submitting ? "bi-arrow-repeat" : "bi-check2-circle"
                  }`}
                />
                {submitting
                  ? t.saving
                  : editingId
                  ? t.update
                  : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetails && detailRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-[2px] sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div
            dir={dir}
            className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {t.details}
                </h2>
                <p className="mt-0.5 text-sm font-semibold text-blue-700">
                  {selectedDetailName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="overflow-y-auto bg-white p-4 sm:p-5">
              {detailLoading && (
                <div className="mb-3 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
                  <i className="bi bi-arrow-repeat mx-2" />
                  {t.loadingDetails}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem label={t.employee} value={selectedDetailName} />
                <DetailItem
                  label={t.salaryMonth}
                  value={detailRecord.salary_month || "-"}
                />
                <DetailItem
                  label={t.status}
                  value={
                    normalizeStatus(detailRecord.status) === "Paid"
                      ? t.paid
                      : t.pending
                  }
                />
                <DetailItem
                  label={t.salary}
                  value={`PKR ${money(detailRecord.basic_salary)}`}
                />

                <DetailItem
                  label={t.perDaySalary}
                  value={`PKR ${money(
                    pickValue(detailRecord, ["per_day_salary"], 0)
                  )}`}
                />
                <DetailItem
                  label={t.extraDays}
                  value={`${money(detailRecord.extra_days)} ${t.days}`}
                />
                <DetailItem
                  label={t.extraDayAmount}
                  value={`PKR ${money(detailRecord.extra_day_amount)}`}
                />
                <DetailItem
                  label={t.absentDays}
                  value={`${money(
                    pickValue(
                      detailRecord,
                      ["absent_days", "absent"],
                      0
                    )
                  )} ${t.days}`}
                />

                <DetailItem
                  label={t.absentAmount}
                  value={`PKR ${money(
                    pickValue(
                      detailRecord,
                      ["absent_amount", "absent_deduction"],
                      0
                    )
                  )}`}
                />
                <DetailItem
                  label={t.timeDeductionHours}
                  value={`${money(
                    pickValue(
                      detailRecord,
                      ["time_deduction_hours", "time_deduction"],
                      0
                    )
                  )} ${t.hours}`}
                />
                <DetailItem
                  label={t.timeDeductionRate}
                  value={`PKR ${money(
                    detailRecord.time_deduction_rate
                  )}`}
                />
                <DetailItem
                  label={t.timeDeductionAmount}
                  value={`PKR ${money(
                    detailRecord.time_deduction_amount
                  )}`}
                />

                <DetailItem
                  label={t.overtimeHours}
                  value={`${money(detailRecord.overtime_hours)} ${
                    t.hours
                  }`}
                />
                <DetailItem
                  label={t.overtimeRate}
                  value={`PKR ${money(detailRecord.overtime_rate)}`}
                />
                <DetailItem
                  label={t.overtimeAmount}
                  value={`PKR ${money(detailRecord.overtime_amount)}`}
                />
                <DetailItem
                  label={t.calculatedAmount}
                  value={`PKR ${money(
                    pickValue(
                      detailRecord,
                      ["calculated_amount", "hisaab_amount"],
                      0
                    )
                  )}`}
                />

                <DetailItem
                  label={t.advance}
                  value={`PKR ${money(
                    pickValue(
                      detailRecord,
                      ["advance", "current_advance"],
                      0
                    )
                  )}`}
                />
                <DetailItem
                  label={t.previousAdvance}
                  value={`PKR ${money(detailRecord.previous_advance)}`}
                />
                <DetailItem
                  label={t.totalAdvance}
                  value={`PKR ${money(
                    pickValue(detailRecord, ["total_advance"], 0)
                  )}`}
                />
                <DetailItem
                  label={t.remainingBalance}
                  value={`PKR ${money(detailBalance)}`}
                  important
                  negative={detailBalance < 0}
                />
              </div>

              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {t.notes}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {detailRecord.notes || "-"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.close}
              </button>

              <button
                type="button"
                onClick={() => openEdit(detailRecord)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <i className="bi bi-pencil-square" />
                {t.edit}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(getRecordId(detailRecord))}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                <i className="bi bi-trash3" />
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
