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

const SALARY_API = `${API_ROOT}/api/employee-rates`;
const EMPLOYEES_API = `${API_ROOT}/api/employees`;

const LANG = {
  en: {
    title: "Employee Salary",
    subtitle: "Manage monthly salary, attendance, overtime and advances",
    newSalary: "New Salary",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    printList: "Print List",
    downloadPdf: "Download PDF",
    refresh: "Refresh",
    toggleLang: "اردو",

    searchPlaceholder: "Search by employee name, month or status...",
    employee: "Employee",
    salaryMonth: "Salary Month",
    status: "Status",
    paid: "Paid",
    pending: "Pending",
    viewDetails: "View Details",
    noRecords: "No salary records found.",
    loading: "Loading salary records...",

    totalRecords: "Total Records",
    paidRecords: "Paid Records",
    pendingRecords: "Pending Records",
    totalBalance: "Total Balance",

    createTitle: "New Employee Salary",
    editTitle: "Edit Employee Salary",
    formSubtitle: "Enter salary, attendance, overtime and advance values",
    selectEmployee: "-- Select Employee --",
    basicSalary: "Basic Salary",
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
    save: "Save",
    update: "Update",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    detailsTitle: "Salary Details",

    requiredError: "Employee, salary month and basic salary are required.",
    loadError: "Salary data could not be loaded from backend.",
    saveError: "Salary record could not be saved.",
    deleteError: "Salary record could not be deleted.",
    saved: "Salary record saved successfully.",
    updated: "Salary record updated successfully.",
    deleted: "Salary record deleted successfully.",
    deleteConfirm: "Are you sure you want to delete this salary record?",
    noEmployees: "No employees found from backend.",

    formula:
      "Calculated Amount = Salary + Extra Day + Overtime - Absent - Time Deduction",
    balanceFormula:
      "Remaining Balance = Calculated Amount - Advance - Previous Advance",
    printedOn: "Printed On",
    reportTitle: "Employee Salary List",
  },

  ur: {
    title: "ملازم کی تنخواہ",
    subtitle: "ماہانہ تنخواہ، حاضری، اوور ٹائم اور ایڈوانس کا انتظام کریں",
    newSalary: "نئی تنخواہ",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    printList: "فہرست پرنٹ کریں",
    downloadPdf: "پی ڈی ایف ڈاؤنلوڈ",
    refresh: "ری فریش",
    toggleLang: "English",

    searchPlaceholder: "ملازم کے نام، مہینے یا حالت سے تلاش کریں...",
    employee: "ملازم",
    salaryMonth: "تنخواہ کا مہینہ",
    status: "حالت",
    paid: "ادا شدہ",
    pending: "زیر التواء",
    viewDetails: "تفصیل دیکھیں",
    noRecords: "تنخواہ کا کوئی ریکارڈ نہیں ملا۔",
    loading: "تنخواہ ریکارڈ لوڈ ہو رہے ہیں...",

    totalRecords: "کل ریکارڈ",
    paidRecords: "ادا شدہ ریکارڈ",
    pendingRecords: "زیر التواء ریکارڈ",
    totalBalance: "کل بقایا حساب",

    createTitle: "نئی ملازم تنخواہ",
    editTitle: "ملازم تنخواہ میں ترمیم",
    formSubtitle: "تنخواہ، حاضری، اوور ٹائم اور ایڈوانس کی معلومات درج کریں",
    selectEmployee: "-- ملازم منتخب کریں --",
    basicSalary: "بنیادی تنخواہ",
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
    save: "محفوظ کریں",
    update: "اپڈیٹ",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    close: "بند کریں",
    edit: "ترمیم",
    delete: "حذف",
    detailsTitle: "تنخواہ کی تفصیل",

    requiredError: "ملازم، تنخواہ کا مہینہ اور بنیادی تنخواہ ضروری ہیں۔",
    loadError: "بیک اینڈ سے تنخواہ کا ڈیٹا لوڈ نہیں ہوا۔",
    saveError: "تنخواہ کا ریکارڈ محفوظ نہیں ہوا۔",
    deleteError: "تنخواہ کا ریکارڈ حذف نہیں ہوا۔",
    saved: "تنخواہ کا ریکارڈ کامیابی سے محفوظ ہو گیا۔",
    updated: "تنخواہ کا ریکارڈ کامیابی سے اپڈیٹ ہو گیا۔",
    deleted: "تنخواہ کا ریکارڈ کامیابی سے حذف ہو گیا۔",
    deleteConfirm: "کیا آپ واقعی یہ تنخواہ ریکارڈ حذف کرنا چاہتے ہیں؟",
    noEmployees: "بیک اینڈ سے کوئی ملازم نہیں ملا۔",

    formula:
      "حساب رقم = تنخواہ + اضافی دن + اوور ٹائم - غیر حاضری - ٹائم کٹوتی",
    balanceFormula:
      "بقایا حساب = حساب رقم - ایڈوانس - سابقہ ایڈوانس",
    printedOn: "پرنٹ کی تاریخ",
    reportTitle: "ملازم تنخواہ فہرست",
  },
};

const currentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
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
  "";

const getEmployeeName = (employee) =>
  employee?.full_name ??
  employee?.employee_name ??
  employee?.name ??
  employee?.name_en ??
  "";

const getEmployeeSalary = (employee) =>
  toNumber(
    employee?.basic_salary ??
      employee?.salary ??
      employee?.monthly_salary ??
      employee?.current_salary
  );

const getRecordId = (record) =>
  record?.id ?? record?.salary_id ?? "";

const normalizeStatus = (status) =>
  String(status || "Pending").toLowerCase() === "paid"
    ? "Paid"
    : "Pending";

const calculateSalary = (form) => {
  const basicSalary = toNumber(form.basic_salary);
  const perDaySalary = basicSalary / 30;

  const extraDays = toNumber(form.extra_days);
  const extraDayAmount = extraDays * perDaySalary;

  const absentDays = toNumber(form.absent_days);
  const absentAmount = absentDays * perDaySalary;

  const timeDeductionHours = toNumber(
    form.time_deduction_hours
  );
  const timeDeductionRate = toNumber(
    form.time_deduction_rate
  );
  const timeDeductionAmount =
    timeDeductionHours * timeDeductionRate;

  const overtimeHours = toNumber(form.overtime_hours);
  const overtimeRate = toNumber(form.overtime_rate);
  const overtimeAmount = overtimeHours * overtimeRate;

  const advance = toNumber(form.advance);
  const previousAdvance = toNumber(
    form.previous_advance
  );
  const totalAdvance = advance + previousAdvance;

  const calculatedAmount =
    basicSalary +
    extraDayAmount +
    overtimeAmount -
    absentAmount -
    timeDeductionAmount;

  const remainingBalance =
    calculatedAmount - totalAdvance;

  return {
    basicSalary,
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

export default function EmployeeRatePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const calculations = useMemo(
    () => calculateSalary(form),
    [form]
  );

  const employeeMap = useMemo(() => {
    const map = {};

    employees.forEach((employee) => {
      map[String(getEmployeeId(employee))] =
        getEmployeeName(employee);
    });

    return map;
  }, [employees]);

  const getRecordEmployeeName = useCallback(
    (record) =>
      record?.employee_name ||
      employeeMap[String(record?.employee_id)] ||
      "-",
    [employeeMap]
  );

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });

    window.setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [salaryResponse, employeeResponse] =
        await Promise.all([
          axios.get(SALARY_API),
          axios.get(EMPLOYEES_API),
        ]);

      setRecords(getList(salaryResponse.data));
      setEmployees(getList(employeeResponse.data));
    } catch (error) {
      console.error("Employee salary load error:", error);
      setRecords([]);
      setEmployees([]);
      showToast("error", t.loadError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.loadError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(
      (item) =>
        String(getEmployeeId(item)) ===
        String(employeeId)
    );

    const basicSalary = getEmployeeSalary(employee);
    const perDaySalary = basicSalary / 30;

    setForm((previous) => ({
      ...previous,
      employee_id: employeeId,
      basic_salary: basicSalary
        ? String(basicSalary)
        : "",
      overtime_rate: basicSalary
        ? (perDaySalary / 8).toFixed(2)
        : "0",
      time_deduction_rate: basicSalary
        ? (perDaySalary / 10).toFixed(2)
        : "0",
    }));
  };

  const handleSalaryChange = (value) => {
    const basicSalary = toNumber(value);
    const perDaySalary = basicSalary / 30;

    setForm((previous) => ({
      ...previous,
      basic_salary: value,
      overtime_rate: basicSalary
        ? (perDaySalary / 8).toFixed(2)
        : "0",
      time_deduction_rate: basicSalary
        ? (perDaySalary / 10).toFixed(2)
        : "0",
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const recordToForm = (record) => ({
    employee_id: String(record?.employee_id || ""),
    salary_month:
      record?.salary_month || currentMonth(),
    basic_salary: String(
      record?.basic_salary ?? ""
    ),
    extra_days: String(record?.extra_days ?? 0),
    absent_days: String(record?.absent_days ?? 0),
    time_deduction_hours: String(
      record?.time_deduction_hours ?? 0
    ),
    time_deduction_rate: String(
      record?.time_deduction_rate ?? 0
    ),
    overtime_hours: String(
      record?.overtime_hours ?? 0
    ),
    overtime_rate: String(
      record?.overtime_rate ?? 0
    ),
    advance: String(record?.advance ?? 0),
    previous_advance: String(
      record?.previous_advance ?? 0
    ),
    status: normalizeStatus(record?.status),
    notes: record?.notes || "",
  });

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
    basic_salary: calculations.basicSalary,

    extra_days: calculations.extraDays,
    absent_days: calculations.absentDays,

    time_deduction_hours:
      calculations.timeDeductionHours,
    time_deduction_rate:
      calculations.timeDeductionRate,

    overtime_hours: calculations.overtimeHours,
    overtime_rate: calculations.overtimeRate,

    advance: calculations.advance,
    previous_advance:
      calculations.previousAdvance,

    status: form.status,
    notes: form.notes.trim(),
  });

  const handleSave = async () => {
    if (
      !form.employee_id ||
      !form.salary_month ||
      calculations.basicSalary <= 0
    ) {
      showToast("error", t.requiredError);
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(
          `${SALARY_API}/${editingId}`,
          buildPayload()
        );
        showToast("success", t.updated);
      } else {
        await axios.post(
          SALARY_API,
          buildPayload()
        );
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
        error?.response?.data?.message ||
          t.saveError
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await axios.delete(
        `${SALARY_API}/${recordId}`
      );

      setShowDetails(false);
      setDetailRecord(null);
      await fetchData();
      showToast("success", t.deleted);
    } catch (error) {
      console.error(
        "Employee salary delete error:",
        error
      );
      showToast(
        "error",
        error?.response?.data?.message ||
          t.deleteError
      );
    }
  };

  const openDetails = async (record) => {
    setDetailRecord(record);
    setShowDetails(true);

    try {
      const response = await axios.get(
        `${SALARY_API}/${getRecordId(record)}`
      );

      const data =
        response?.data?.data ??
        response?.data?.salary ??
        response?.data;

      if (data && !Array.isArray(data)) {
        setDetailRecord(data);
      }
    } catch (error) {
      console.warn(
        "Detail endpoint did not return data:",
        error
      );
    }
  };

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [
        getRecordEmployeeName(record),
        record?.salary_month,
        normalizeStatus(record?.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search, getRecordEmployeeName]);

  const summary = useMemo(
    () => ({
      totalRecords: filteredRecords.length,
      paidRecords: filteredRecords.filter(
        (record) =>
          normalizeStatus(record.status) ===
          "Paid"
      ).length,
      pendingRecords: filteredRecords.filter(
        (record) =>
          normalizeStatus(record.status) ===
          "Pending"
      ).length,
      totalBalance: filteredRecords.reduce(
        (sum, record) =>
          sum +
          toNumber(record.remaining_balance),
        0
      ),
    }),
    [filteredRecords]
  );

  const printDocument = (saveAsPdf = false) => {
    const rows = filteredRecords
      .map(
        (record, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td><strong>${getRecordEmployeeName(
              record
            )}</strong></td>
            <td class="center">${
              record.salary_month || "-"
            }</td>
            <td class="money">PKR ${money(
              record.basic_salary
            )}</td>
            <td class="money">PKR ${money(
              record.calculated_amount
            )}</td>
            <td class="money">PKR ${money(
              record.advance
            )}</td>
            <td class="money">PKR ${money(
              record.previous_advance
            )}</td>
            <td class="money strong">PKR ${money(
              record.remaining_balance
            )}</td>
            <td class="center">${normalizeStatus(
              record.status
            )}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=850"
    );

    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}" dir="${dir}">
      <head>
        <meta charset="UTF-8" />
        <title>${t.reportTitle}</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:Arial,sans-serif;background:#fff;color:#0f172a;padding:20px}
          .sheet{max-width:1200px;margin:auto;border:1px solid #dbe3ee}
          .header{background:#0f172a;color:#fff;padding:20px;display:flex;justify-content:space-between}
          h1{margin:0;font-size:24px}
          .sub{margin-top:4px;color:#cbd5e1;font-size:12px}
          table{width:100%;border-collapse:collapse;font-size:11px}
          th{background:#0f172a;color:#fff;padding:10px 8px;border:1px solid #334155}
          td{padding:9px 8px;border:1px solid #e2e8f0}
          tbody tr:nth-child(even){background:#f8fafc}
          .center{text-align:center}
          .money{text-align:right;white-space:nowrap}
          .strong{font-weight:800;color:#4f46e5}
          .hint{padding:10px;background:#eef2ff;color:#3730a3;text-align:center}
          @media print{
            @page{size:A4 landscape;margin:8mm}
            body{padding:0}
            .hint{display:none}
          }
        </style>
      </head>
      <body>
        ${
          saveAsPdf
            ? `<div class="hint">Select <strong>Save as PDF</strong> in the print destination.</div>`
            : ""
        }
        <div class="sheet">
          <div class="header">
            <div>
              <h1>Ali Cage</h1>
              <div class="sub">${t.reportTitle}</div>
            </div>
            <div>${t.printedOn}: ${new Date().toLocaleString(
      isUrdu ? "ur-PK" : "en-PK"
    )}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t.employee}</th>
                <th>${t.salaryMonth}</th>
                <th>${t.basicSalary}</th>
                <th>${t.calculatedAmount}</th>
                <th>${t.advance}</th>
                <th>${t.previousAdvance}</th>
                <th>${t.remainingBalance}</th>
                <th>${t.status}</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows ||
                `<tr><td colspan="9" class="center">${t.noRecords}</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const details = detailRecord
    ? [
        [t.employee, getRecordEmployeeName(detailRecord)],
        [t.salaryMonth, detailRecord.salary_month || "-"],
        [t.basicSalary, `PKR ${money(detailRecord.basic_salary)}`],
        [t.perDaySalary, `PKR ${money(detailRecord.per_day_salary)}`],
        [t.extraDays, money(detailRecord.extra_days)],
        [t.extraDayAmount, `PKR ${money(detailRecord.extra_day_amount)}`],
        [t.absentDays, money(detailRecord.absent_days)],
        [t.absentAmount, `PKR ${money(detailRecord.absent_amount)}`],
        [t.timeDeductionHours, money(detailRecord.time_deduction_hours)],
        [t.timeDeductionRate, `PKR ${money(detailRecord.time_deduction_rate)}`],
        [t.timeDeductionAmount, `PKR ${money(detailRecord.time_deduction_amount)}`],
        [t.overtimeHours, money(detailRecord.overtime_hours)],
        [t.overtimeRate, `PKR ${money(detailRecord.overtime_rate)}`],
        [t.overtimeAmount, `PKR ${money(detailRecord.overtime_amount)}`],
        [t.calculatedAmount, `PKR ${money(detailRecord.calculated_amount)}`],
        [t.advance, `PKR ${money(detailRecord.advance)}`],
        [t.previousAdvance, `PKR ${money(detailRecord.previous_advance)}`],
        [t.totalAdvance, `PKR ${money(detailRecord.total_advance)}`],
        [t.remainingBalance, `PKR ${money(detailRecord.remaining_balance)}`],
        [
          t.status,
          normalizeStatus(detailRecord.status) === "Paid"
            ? t.paid
            : t.pending,
        ],
      ]
    : [];

  return (
    <div className="employee-salary-page" dir={dir}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        *{box-sizing:border-box}

        .employee-salary-page{
          min-height:100vh;
          padding:18px;
          color:#0f172a;
          background:linear-gradient(135deg,#eef2ff 0%,#f8fafc 48%,#f1f5f9 100%);
          font-family:${
            isUrdu
              ? "'Noto Nastaliq Urdu',Arial,sans-serif"
              : "Inter,Helvetica,Arial,sans-serif"
          };
        }

        .page-wrap{
          width:100%;
          max-width:1220px;
          margin:0 auto;
        }

        .top-card{
          background:rgba(255,255,255,.95);
          border:1px solid #dbe3ee;
          border-radius:22px;
          padding:25px 22px 20px;
          box-shadow:0 18px 50px rgba(15,23,42,.08);
        }

        .page-title{
          margin:0;
          font-size:30px;
          line-height:1.2;
          font-weight:950;
          letter-spacing:-.8px;
        }

        .page-subtitle{
          margin:7px 0 0;
          color:#64748b;
          font-size:13px;
        }

        .actions{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          margin-top:16px;
        }

        .btn{
          border:1px solid transparent;
          border-radius:12px;
          padding:10px 14px;
          font-size:13px;
          font-weight:900;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:7px;
          transition:.15s ease;
          white-space:nowrap;
        }

        .btn:hover{transform:translateY(-1px)}
        .btn:disabled{opacity:.55;cursor:not-allowed;transform:none}

        .btn-language{
          background:#fff;
          color:#475569;
          border-color:#cbd5e1;
        }

        .btn-summary{
          background:#eef2ff;
          color:#4338ca;
          border-color:#c7d2fe;
        }

        .btn-dark{
          background:#0f172a;
          color:#fff;
        }

        .btn-white{
          background:#fff;
          color:#475569;
          border-color:#cbd5e1;
        }

        .btn-primary{
          background:#4f46e5;
          color:#fff;
          box-shadow:0 12px 24px rgba(79,70,229,.25);
        }

        .summary-grid{
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:12px;
          margin-top:14px;
        }

        .summary-card{
          background:#fff;
          border:1px solid #dbe3ee;
          border-radius:16px;
          padding:15px;
          box-shadow:0 8px 24px rgba(15,23,42,.05);
        }

        .summary-label{
          color:#64748b;
          font-size:11px;
          font-weight:850;
          text-transform:uppercase;
          letter-spacing:.4px;
        }

        .summary-value{
          margin-top:6px;
          color:#0f172a;
          font-size:21px;
          font-weight:950;
        }

        .search-row{
          margin:14px 0;
          display:flex;
          align-items:center;
          gap:10px;
        }

        .search-box{
          position:relative;
          width:100%;
          max-width:460px;
        }

        .search-icon{
          position:absolute;
          top:50%;
          transform:translateY(-50%);
          color:#94a3b8;
          ${isUrdu ? "right:14px" : "left:14px"};
        }

        .search-input{
          width:100%;
          height:43px;
          border:1px solid #cbd5e1;
          border-radius:12px;
          background:#fff;
          color:#334155;
          font-size:13px;
          outline:none;
          ${
            isUrdu
              ? "padding:0 42px 0 13px"
              : "padding:0 13px 0 42px"
          };
        }

        .search-input:focus,
        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus{
          border-color:#6366f1;
          box-shadow:0 0 0 3px rgba(99,102,241,.12);
        }

        .table-card{
          width:100%;
          background:#fff;
          border:1px solid #dbe3ee;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 18px 45px rgba(15,23,42,.07);
        }

        .salary-table{
          width:100%;
          table-layout:fixed;
          border-collapse:collapse;
        }

        .salary-table th{
          padding:14px 16px;
          background:#0f172a;
          color:#fff;
          font-size:11px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:.5px;
        }

        .salary-table td{
          padding:16px;
          border-bottom:1px solid #e5e7eb;
          color:#475569;
          font-size:13px;
          vertical-align:middle;
        }

        .salary-table tbody tr:last-child td{border-bottom:0}
        .salary-table tbody tr:hover td{background:#f8faff}

        .employee-cell{
          display:flex;
          align-items:center;
          gap:11px;
          min-width:0;
        }

        .avatar{
          width:38px;
          height:38px;
          border-radius:13px;
          flex-shrink:0;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#eef2ff;
          color:#4f46e5;
          font-weight:950;
        }

        .employee-name{
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:#0f172a;
          font-weight:900;
        }

        .status-badge{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:6px 11px;
          border-radius:999px;
          font-size:10px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:.35px;
        }

        .status-paid{
          background:#dcfce7;
          color:#166534;
        }

        .status-pending{
          background:#fef3c7;
          color:#92400e;
        }

        .view-btn{
          border:1px solid #c7d2fe;
          border-radius:10px;
          background:#eef2ff;
          color:#4338ca;
          padding:8px 12px;
          font-size:11px;
          font-weight:900;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          gap:6px;
        }

        .empty{
          padding:50px 20px!important;
          text-align:center!important;
          color:#94a3b8!important;
        }

        .toast{
          position:fixed;
          bottom:22px;
          ${isUrdu ? "left:22px" : "right:22px"};
          z-index:120;
          max-width:420px;
          border-radius:14px;
          padding:12px 15px;
          color:#fff;
          font-size:12px;
          font-weight:850;
          box-shadow:0 20px 50px rgba(15,23,42,.25);
        }

        .toast-success{background:#059669}
        .toast-error{background:#dc2626}

        .modal-backdrop{
          position:fixed;
          inset:0;
          z-index:100;
          padding:12px;
          background:rgba(15,23,42,.62);
          backdrop-filter:blur(3px);
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .modal{
          width:100%;
          max-width:980px;
          max-height:calc(100vh - 24px);
          background:#fff;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 30px 90px rgba(15,23,42,.3);
          display:flex;
          flex-direction:column;
        }

        .details-modal{max-width:900px}

        .modal-header{
          padding:17px 19px;
          border-bottom:1px solid #e2e8f0;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        }

        .modal-title{
          margin:0;
          font-size:20px;
          font-weight:950;
        }

        .modal-subtitle{
          margin-top:4px;
          color:#64748b;
          font-size:11px;
        }

        .close-btn{
          width:36px;
          height:36px;
          border:1px solid #cbd5e1;
          border-radius:10px;
          background:#fff;
          color:#475569;
          cursor:pointer;
        }

        .modal-body{
          padding:18px;
          background:#f8fafc;
          overflow-y:auto;
        }

        .form-grid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
        }

        .span-2{grid-column:span 2}
        .span-3{grid-column:span 3}

        .field-label{
          display:block;
          margin-bottom:6px;
          color:#475569;
          font-size:11px;
          font-weight:850;
        }

        .field-input,
        .field-select,
        .field-textarea{
          width:100%;
          border:1px solid #cbd5e1;
          border-radius:10px;
          background:#fff;
          color:#0f172a;
          font-size:13px;
          outline:none;
        }

        .field-input,
        .field-select{
          height:41px;
          padding:0 11px;
        }

        .field-textarea{
          min-height:75px;
          padding:10px 11px;
          resize:vertical;
        }

        .readonly{
          background:#f1f5f9;
          color:#475569;
          font-weight:850;
        }

        .calculation-box{
          margin-top:14px;
          border:1px solid #c7d2fe;
          border-radius:14px;
          padding:14px;
          background:#eef2ff;
        }

        .calculation-grid{
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:10px;
        }

        .calculation-item{
          border-radius:10px;
          padding:10px;
          background:#fff;
          border:1px solid #dbe3ee;
        }

        .calculation-item small{
          display:block;
          color:#64748b;
          font-size:9px;
          text-transform:uppercase;
          font-weight:850;
        }

        .calculation-item strong{
          display:block;
          margin-top:5px;
          color:#0f172a;
          font-size:14px;
        }

        .balance-item{
          background:#0f172a;
        }

        .balance-item small{color:#cbd5e1}
        .balance-item strong{color:#fff}

        .formula{
          margin-top:10px;
          color:#4338ca;
          font-size:10px;
          line-height:1.6;
        }

        .modal-footer{
          padding:14px 18px;
          border-top:1px solid #e2e8f0;
          background:#fff;
          display:flex;
          justify-content:flex-end;
          gap:8px;
        }

        .details-grid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:10px;
        }

        .detail-card{
          border:1px solid #dbe3ee;
          border-radius:12px;
          padding:11px;
          background:#fff;
        }

        .detail-label{
          color:#94a3b8;
          font-size:9px;
          font-weight:850;
          text-transform:uppercase;
          letter-spacing:.35px;
        }

        .detail-value{
          margin-top:6px;
          color:#0f172a;
          font-size:13px;
          font-weight:900;
          word-break:break-word;
        }

        .notes-card{
          margin-top:10px;
          border:1px solid #dbe3ee;
          border-radius:12px;
          padding:12px;
          background:#fff;
        }

        @media(max-width:900px){
          .summary-grid,
          .calculation-grid{
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .form-grid,
          .details-grid{
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .span-3{grid-column:span 2}
        }

        @media(max-width:640px){
          .employee-salary-page{padding:10px}
          .top-card{padding:19px 15px;border-radius:17px}
          .page-title{font-size:25px}
          .actions .btn{flex:1}
          .summary-grid,
          .form-grid,
          .details-grid,
          .calculation-grid{
            grid-template-columns:1fr;
          }
          .span-2,
          .span-3{grid-column:span 1}
          .salary-table th,
          .salary-table td{padding:12px 8px}
          .salary-table th{font-size:9px}
          .view-btn span{display:none}
          .modal-footer{flex-direction:column-reverse}
          .modal-footer .btn{width:100%}
        }
      `}</style>

      {message.text && (
        <div
          className={`toast ${
            message.type === "error"
              ? "toast-error"
              : "toast-success"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="page-wrap">
        <section className="top-card">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">
            {t.subtitle}
          </p>

          <div className="actions">
            <button
              type="button"
              className="btn btn-language"
              onClick={() =>
                setLang((previous) =>
                  previous === "en" ? "ur" : "en"
                )
              }
            >
              <i className="bi bi-translate" />
              {t.toggleLang}
            </button>

            <button
              type="button"
              className="btn btn-summary"
              onClick={() =>
                setShowSummary((previous) => !previous)
              }
            >
              <i className="bi bi-bar-chart-fill" />
              {showSummary
                ? t.hideSummary
                : t.viewSummary}
            </button>

            <button
              type="button"
              className="btn btn-dark"
              disabled={!filteredRecords.length}
              onClick={() => printDocument(false)}
            >
              <i className="bi bi-printer" />
              {t.printList}
            </button>

            <button
              type="button"
              className="btn btn-white"
              disabled={!filteredRecords.length}
              onClick={() => printDocument(true)}
            >
              <i className="bi bi-file-earmark-pdf" />
              {t.downloadPdf}
            </button>

            <button
              type="button"
              className="btn btn-white"
              onClick={fetchData}
            >
              <i className="bi bi-arrow-clockwise" />
              {t.refresh}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={openAdd}
            >
              <i className="bi bi-person-plus-fill" />
              {t.newSalary}
            </button>
          </div>
        </section>

        {showSummary && (
          <section className="summary-grid">
            <article className="summary-card">
              <div className="summary-label">
                {t.totalRecords}
              </div>
              <div className="summary-value">
                {summary.totalRecords}
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-label">
                {t.paidRecords}
              </div>
              <div className="summary-value">
                {summary.paidRecords}
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-label">
                {t.pendingRecords}
              </div>
              <div className="summary-value">
                {summary.pendingRecords}
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-label">
                {t.totalBalance}
              </div>
              <div className="summary-value">
                PKR {money(summary.totalBalance)}
              </div>
            </article>
          </section>
        )}

        <div className="search-row">
          <div className="search-box">
            <i className="bi bi-search search-icon" />
            <input
              className="search-input"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={t.searchPlaceholder}
            />
          </div>
        </div>

        <section className="table-card">
          <table className="salary-table">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "50%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "22%" }} />
            </colgroup>

            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>#</th>
                <th
                  style={{
                    textAlign: isUrdu
                      ? "right"
                      : "left",
                  }}
                >
                  {t.employee}
                </th>
                <th style={{ textAlign: "center" }}>
                  {t.status}
                </th>
                <th style={{ textAlign: "center" }}>
                  {t.viewDetails}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="empty">
                    <i className="bi bi-arrow-repeat" />{" "}
                    {t.loading}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty">
                    <i className="bi bi-inbox" />{" "}
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                filteredRecords.map(
                  (record, index) => {
                    const employeeName =
                      getRecordEmployeeName(record);
                    const status = normalizeStatus(
                      record.status
                    );

                    return (
                      <tr key={getRecordId(record)}>
                        <td
                          style={{
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          {index + 1}
                        </td>

                        <td>
                          <div className="employee-cell">
                            <div className="avatar">
                              {employeeName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="employee-name">
                              {employeeName}
                            </div>
                          </div>
                        </td>

                        <td
                          style={{ textAlign: "center" }}
                        >
                          <span
                            className={`status-badge ${
                              status === "Paid"
                                ? "status-paid"
                                : "status-pending"
                            }`}
                          >
                            {status === "Paid"
                              ? t.paid
                              : t.pending}
                          </span>
                        </td>

                        <td
                          style={{ textAlign: "center" }}
                        >
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() =>
                              openDetails(record)
                            }
                          >
                            <i className="bi bi-eye-fill" />
                            <span>
                              {t.viewDetails}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </section>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className="modal" dir={dir}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {editingId
                    ? t.editTitle
                    : t.createTitle}
                </h2>
                <div className="modal-subtitle">
                  {t.formSubtitle}
                </div>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeForm}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="span-2">
                  <label className="field-label">
                    {t.employee} *
                  </label>
                  <select
                    className="field-select"
                    value={form.employee_id}
                    onChange={(event) =>
                      handleEmployeeChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {t.selectEmployee}
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={getEmployeeId(employee)}
                        value={getEmployeeId(employee)}
                      >
                        {getEmployeeName(employee)}
                      </option>
                    ))}
                  </select>

                  {!loading &&
                    employees.length === 0 && (
                      <div
                        style={{
                          marginTop: 5,
                          color: "#dc2626",
                          fontSize: 10,
                        }}
                      >
                        {t.noEmployees}
                      </div>
                    )}
                </div>

                <div>
                  <label className="field-label">
                    {t.salaryMonth} *
                  </label>
                  <input
                    type="month"
                    className="field-input"
                    value={form.salary_month}
                    onChange={(event) =>
                      updateField(
                        "salary_month",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.basicSalary} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.basic_salary}
                    onChange={(event) =>
                      handleSalaryChange(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.perDaySalary}
                  </label>
                  <input
                    className="field-input readonly"
                    readOnly
                    value={`PKR ${money(
                      calculations.perDaySalary
                    )}`}
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.status}
                  </label>
                  <select
                    className="field-select"
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="Pending">
                      {t.pending}
                    </option>
                    <option value="Paid">
                      {t.paid}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="field-label">
                    {t.extraDays}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="field-input"
                    value={form.extra_days}
                    onChange={(event) =>
                      updateField(
                        "extra_days",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.extraDayAmount}
                  </label>
                  <input
                    className="field-input readonly"
                    readOnly
                    value={`PKR ${money(
                      calculations.extraDayAmount
                    )}`}
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.absentDays}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="field-input"
                    value={form.absent_days}
                    onChange={(event) =>
                      updateField(
                        "absent_days",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.absentAmount}
                  </label>
                  <input
                    className="field-input readonly"
                    readOnly
                    value={`PKR ${money(
                      calculations.absentAmount
                    )}`}
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.timeDeductionHours}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={
                      form.time_deduction_hours
                    }
                    onChange={(event) =>
                      updateField(
                        "time_deduction_hours",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.timeDeductionRate}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.time_deduction_rate}
                    onChange={(event) =>
                      updateField(
                        "time_deduction_rate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.timeDeductionAmount}
                  </label>
                  <input
                    className="field-input readonly"
                    readOnly
                    value={`PKR ${money(
                      calculations.timeDeductionAmount
                    )}`}
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.overtimeHours}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.overtime_hours}
                    onChange={(event) =>
                      updateField(
                        "overtime_hours",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.overtimeRate}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.overtime_rate}
                    onChange={(event) =>
                      updateField(
                        "overtime_rate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.overtimeAmount}
                  </label>
                  <input
                    className="field-input readonly"
                    readOnly
                    value={`PKR ${money(
                      calculations.overtimeAmount
                    )}`}
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.advance}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.advance}
                    onChange={(event) =>
                      updateField(
                        "advance",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.previousAdvance}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.previous_advance}
                    onChange={(event) =>
                      updateField(
                        "previous_advance",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="span-3">
                  <label className="field-label">
                    {t.notes}
                  </label>
                  <textarea
                    className="field-textarea"
                    value={form.notes}
                    placeholder={t.notesPlaceholder}
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="calculation-box">
                <div className="calculation-grid">
                  <div className="calculation-item">
                    <small>
                      {t.calculatedAmount}
                    </small>
                    <strong>
                      PKR{" "}
                      {money(
                        calculations.calculatedAmount
                      )}
                    </strong>
                  </div>

                  <div className="calculation-item">
                    <small>{t.advance}</small>
                    <strong>
                      PKR {money(calculations.advance)}
                    </strong>
                  </div>

                  <div className="calculation-item">
                    <small>
                      {t.previousAdvance}
                    </small>
                    <strong>
                      PKR{" "}
                      {money(
                        calculations.previousAdvance
                      )}
                    </strong>
                  </div>

                  <div className="calculation-item balance-item">
                    <small>
                      {t.remainingBalance}
                    </small>
                    <strong>
                      PKR{" "}
                      {money(
                        calculations.remainingBalance
                      )}
                    </strong>
                  </div>
                </div>

                <div className="formula">
                  {t.formula}
                  <br />
                  {t.balanceFormula}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-white"
                disabled={submitting}
                onClick={closeForm}
              >
                {t.cancel}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleSave}
              >
                <i
                  className={`bi ${
                    submitting
                      ? "bi-arrow-repeat"
                      : "bi-check2-circle"
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
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setShowDetails(false);
            }
          }}
        >
          <div className="modal details-modal" dir={dir}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {t.detailsTitle}
                </h2>
                <div className="modal-subtitle">
                  {getRecordEmployeeName(detailRecord)}
                </div>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                {details.map(([label, value]) => (
                  <div
                    className="detail-card"
                    key={label}
                  >
                    <div className="detail-label">
                      {label}
                    </div>
                    <div className="detail-value">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="notes-card">
                <div className="detail-label">
                  {t.notes}
                </div>
                <div className="detail-value">
                  {detailRecord.notes || "-"}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-white"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                {t.close}
              </button>

              <button
                type="button"
                className="btn btn-summary"
                onClick={() =>
                  openEdit(detailRecord)
                }
              >
                <i className="bi bi-pencil-square" />
                {t.edit}
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                }}
                onClick={() =>
                  handleDelete(
                    getRecordId(detailRecord)
                  )
                }
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
