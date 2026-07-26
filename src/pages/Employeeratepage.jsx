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

const API_BASE = `${API_ROOT}/api`;

const LANG = {
  en: {
    title: "Employee Salary",
    subtitle:
      "Prepare monthly payroll with attendance, overtime, deductions and advances",
    addSalary: "New Salary",
    searchPlaceholder: "Search employee, month or status...",
    allMonths: "All Months",
    allStatuses: "All Statuses",
    employee: "Employee",
    selectEmployee: "-- Select Employee --",
    salaryMonth: "Salary Month",
    basicSalary: "Basic Salary",
    perDaySalary: "Per Day Salary",
    perHourSalary: "Per Hour Salary",
    extraDays: "Extra Days",
    extraDayAmount: "Extra Day Amount",
    absentDays: "Absent Days",
    absentDeduction: "Absent Deduction",
    overtimeHours: "Overtime Hours",
    overtimeRate: "Overtime Rate / Hour",
    overtimeAmount: "Overtime Amount",
    timeDeduction: "Time Deduction",
    currentAdvance: "Current Advance",
    previousAdvance: "Previous Advance",
    grossSalary: "Gross Salary",
    totalAdditions: "Total Additions",
    totalDeductions: "Total Deductions",
    netSalary: "Net Payable Salary",
    status: "Status",
    pending: "Pending",
    paid: "Paid",
    notes: "Notes",
    notesPlaceholder: "Optional payroll note...",
    save: "Save Salary",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    noRecords: "No salary records found.",
    loading: "Loading payroll...",
    toggleLang: "اردو",
    print: "Print",
    pdf: "PDF",
    refresh: "Refresh",
    totalPayroll: "Total Payroll",
    paidPayroll: "Paid Payroll",
    pendingPayroll: "Pending Payroll",
    totalAdvances: "Total Advances",
    salaryDetails: "Salary Details",
    attendanceAdditions: "Attendance & Additions",
    deductionsAdvances: "Deductions & Advances",
    calculationSummary: "Salary Calculation",
    previousAdvanceHint:
      "Automatically loaded from the employee or latest outstanding salary record.",
    overtimeRateHint:
      "Automatically calculated from basic salary; you can change it.",
    successSave: "Salary record saved successfully.",
    successUpdate: "Salary record updated successfully.",
    successDelete: "Salary record deleted successfully.",
    errorRequired: "Please select employee and salary month.",
    deleteConfirm: "Are you sure you want to delete this salary record?",
    apiFallback:
      "API was unavailable, so demo records are being shown locally.",
    printedOn: "Printed On",
    reportTitle: "Employee Salary Report",
    formula:
      "Net Salary = Basic + Extra Days + Overtime − Absents − Time Deduction − Current Advance − Previous Advance",
    showing: "Showing",
    records: "records",
    employeeInfo: "Employee Information",
    designation: "Designation",
    department: "Department",
    month: "Month",
  },
  ur: {
    title: "ملازمین کی تنخواہ",
    subtitle:
      "حاضری، اوور ٹائم، کٹوتی اور ایڈوانس کے ساتھ ماہانہ تنخواہ تیار کریں",
    addSalary: "نئی تنخواہ",
    searchPlaceholder: "ملازم، مہینہ یا حالت سے تلاش کریں...",
    allMonths: "تمام مہینے",
    allStatuses: "تمام حالتیں",
    employee: "ملازم",
    selectEmployee: "-- ملازم منتخب کریں --",
    salaryMonth: "تنخواہ کا مہینہ",
    basicSalary: "بنیادی تنخواہ",
    perDaySalary: "فی دن تنخواہ",
    perHourSalary: "فی گھنٹہ تنخواہ",
    extraDays: "اضافی دن",
    extraDayAmount: "اضافی دنوں کی رقم",
    absentDays: "غیر حاضر دن",
    absentDeduction: "غیر حاضری کی کٹوتی",
    overtimeHours: "اوور ٹائم گھنٹے",
    overtimeRate: "اوور ٹائم فی گھنٹہ",
    overtimeAmount: "اوور ٹائم رقم",
    timeDeduction: "وقت کی کٹوتی",
    currentAdvance: "موجودہ ایڈوانس",
    previousAdvance: "سابقہ ایڈوانس",
    grossSalary: "مجموعی تنخواہ",
    totalAdditions: "کل اضافہ",
    totalDeductions: "کل کٹوتی",
    netSalary: "قابل ادائیگی خالص تنخواہ",
    status: "حالت",
    pending: "زیر التواء",
    paid: "ادا شدہ",
    notes: "نوٹس",
    notesPlaceholder: "اختیاری تنخواہ نوٹ...",
    save: "تنخواہ محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "اقدامات",
    noRecords: "تنخواہ کا کوئی ریکارڈ نہیں ملا۔",
    loading: "پے رول لوڈ ہو رہا ہے...",
    toggleLang: "English",
    print: "پرنٹ",
    pdf: "پی ڈی ایف",
    refresh: "ری فریش",
    totalPayroll: "کل پے رول",
    paidPayroll: "ادا شدہ پے رول",
    pendingPayroll: "زیر التواء پے رول",
    totalAdvances: "کل ایڈوانس",
    salaryDetails: "تنخواہ کی تفصیل",
    attendanceAdditions: "حاضری اور اضافہ",
    deductionsAdvances: "کٹوتی اور ایڈوانس",
    calculationSummary: "تنخواہ کا حساب",
    previousAdvanceHint:
      "ملازم یا آخری بقایا تنخواہ ریکارڈ سے خودکار طور پر لوڈ ہوگا۔",
    overtimeRateHint:
      "بنیادی تنخواہ سے خودکار حساب، ضرورت پر تبدیل کیا جا سکتا ہے۔",
    successSave: "تنخواہ کا ریکارڈ کامیابی سے محفوظ ہو گیا۔",
    successUpdate: "تنخواہ کا ریکارڈ اپڈیٹ ہو گیا۔",
    successDelete: "تنخواہ کا ریکارڈ حذف ہو گیا۔",
    errorRequired: "براہ کرم ملازم اور تنخواہ کا مہینہ منتخب کریں۔",
    deleteConfirm: "کیا آپ واقعی یہ تنخواہ ریکارڈ حذف کرنا چاہتے ہیں؟",
    apiFallback:
      "اے پی آئی دستیاب نہیں، اس لیے ڈیمو ریکارڈ مقامی طور پر دکھائے جا رہے ہیں۔",
    printedOn: "پرنٹ کی تاریخ",
    reportTitle: "ملازمین کی تنخواہ رپورٹ",
    formula:
      "خالص تنخواہ = بنیادی + اضافی دن + اوور ٹائم − غیر حاضری − وقت کٹوتی − موجودہ ایڈوانس − سابقہ ایڈوانس",
    showing: "دکھائے جا رہے ہیں",
    records: "ریکارڈ",
    employeeInfo: "ملازم کی معلومات",
    designation: "عہدہ",
    department: "محکمہ",
    month: "مہینہ",
  },
};

const EMPTY_FORM = {
  employee_id: "",
  salary_month: "",
  basic_salary: "",
  extra_days: "0",
  absent_days: "0",
  overtime_hours: "0",
  overtime_rate: "",
  time_deduction: "0",
  current_advance: "0",
  previous_advance: "0",
  status: "Pending",
  notes: "",
};

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  numberValue(value).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const normalizeStatus = (status) =>
  String(status || "Pending").toLowerCase() === "paid" ? "Paid" : "Pending";

const getEmployeeName = (record, employees) => {
  if (record.employee_name) return record.employee_name;
  const employee = employees.find(
    (item) => String(item.id) === String(record.employee_id)
  );
  return employee?.full_name || employee?.name || "-";
};

const getEmployeeSalary = (employee) =>
  numberValue(
    employee?.basic_salary ??
      employee?.salary ??
      employee?.monthly_salary ??
      employee?.current_salary
  );

const getEmployeePreviousAdvance = (employee) =>
  numberValue(
    employee?.previous_advance ??
      employee?.outstanding_advance ??
      employee?.advance_balance ??
      employee?.remaining_advance
  );

export default function EmployeeSalaryPage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 3200);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [salaryResponse, employeeResponse] = await Promise.all([
        axios.get(`${API_BASE}/employee-salary`),
        axios.get(`${API_BASE}/employees`),
      ]);

      setRecords(getList(salaryResponse.data));
      setEmployees(getList(employeeResponse.data));
      setUsingFallback(false);
    } catch (error) {
      console.error("Employee salary fetch failed:", error);

      const fallbackEmployees = [
        {
          id: 1,
          full_name: "Ahmed Raza",
          designation: "Machine Operator",
          department_name: "Production",
          basic_salary: 45000,
          outstanding_advance: 3000,
        },
        {
          id: 2,
          full_name: "Hassan Ali",
          designation: "Sales Executive",
          department_name: "Sales",
          basic_salary: 55000,
          outstanding_advance: 0,
        },
        {
          id: 3,
          full_name: "Usman Khan",
          designation: "Supervisor",
          department_name: "Administration",
          basic_salary: 65000,
          outstanding_advance: 5000,
        },
      ];

      const fallbackRecords = [
        {
          id: 1,
          employee_id: 1,
          employee_name: "Ahmed Raza",
          salary_month: getCurrentMonth(),
          basic_salary: 45000,
          extra_days: 2,
          extra_day_amount: 3000,
          absent_days: 1,
          absent_deduction: 1500,
          overtime_hours: 8,
          overtime_rate: 187.5,
          overtime_amount: 1500,
          time_deduction: 500,
          current_advance: 2000,
          previous_advance: 3000,
          gross_salary: 49500,
          total_deductions: 7000,
          net_salary: 42500,
          status: "Pending",
          notes: "",
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: "Hassan Ali",
          salary_month: getCurrentMonth(),
          basic_salary: 55000,
          extra_days: 0,
          extra_day_amount: 0,
          absent_days: 0,
          absent_deduction: 0,
          overtime_hours: 4,
          overtime_rate: 229.17,
          overtime_amount: 916.68,
          time_deduction: 0,
          current_advance: 0,
          previous_advance: 0,
          gross_salary: 55916.68,
          total_deductions: 0,
          net_salary: 55916.68,
          status: "Paid",
          notes: "",
        },
      ];

      setEmployees(fallbackEmployees);
      setRecords(fallbackRecords);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => String(employee.id) === String(form.employee_id)
      ) || null,
    [employees, form.employee_id]
  );

  const calculations = useMemo(() => {
    const basicSalary = numberValue(form.basic_salary);
    const extraDays = numberValue(form.extra_days);
    const absentDays = numberValue(form.absent_days);
    const overtimeHours = numberValue(form.overtime_hours);
    const overtimeRate = numberValue(form.overtime_rate);
    const timeDeduction = numberValue(form.time_deduction);
    const currentAdvance = numberValue(form.current_advance);
    const previousAdvance = numberValue(form.previous_advance);

    const perDaySalary = basicSalary / 30;
    const perHourSalary = perDaySalary / 8;
    const extraDayAmount = extraDays * perDaySalary;
    const absentDeduction = absentDays * perDaySalary;
    const overtimeAmount = overtimeHours * overtimeRate;
    const totalAdditions = extraDayAmount + overtimeAmount;
    const grossSalary = basicSalary + totalAdditions;
    const totalDeductions =
      absentDeduction +
      timeDeduction +
      currentAdvance +
      previousAdvance;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    return {
      basicSalary,
      perDaySalary,
      perHourSalary,
      extraDayAmount,
      absentDeduction,
      overtimeAmount,
      totalAdditions,
      grossSalary,
      totalDeductions,
      netSalary,
    };
  }, [form]);

  const getLatestPreviousAdvance = useCallback(
    (employeeId) => {
      const employee = employees.find(
        (item) => String(item.id) === String(employeeId)
      );
      const employeeBalance = getEmployeePreviousAdvance(employee);

      if (employeeBalance > 0) return employeeBalance;

      const latestRecord = [...records]
        .filter(
          (record) =>
            String(record.employee_id) === String(employeeId) &&
            String(record.id) !== String(editingId || "")
        )
        .sort((a, b) =>
          String(b.salary_month || "").localeCompare(
            String(a.salary_month || "")
          )
        )[0];

      return numberValue(
        latestRecord?.remaining_advance ??
          latestRecord?.advance_balance ??
          latestRecord?.outstanding_advance ??
          0
      );
    },
    [employees, records, editingId]
  );

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(
      (item) => String(item.id) === String(employeeId)
    );
    const basicSalary = getEmployeeSalary(employee);
    const defaultHourlyRate = basicSalary > 0 ? basicSalary / 30 / 8 : 0;
    const previousAdvance = getLatestPreviousAdvance(employeeId);

    setForm((previous) => ({
      ...previous,
      employee_id: employeeId,
      basic_salary: basicSalary ? String(basicSalary) : "",
      overtime_rate: defaultHourlyRate
        ? defaultHourlyRate.toFixed(2)
        : "",
      previous_advance: String(previousAdvance || 0),
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      salary_month: getCurrentMonth(),
    });
    setShowForm(true);
  };

  const openEdit = (record) => {
    const employee = employees.find(
      (item) => String(item.id) === String(record.employee_id)
    );
    const basicSalary =
      numberValue(record.basic_salary) || getEmployeeSalary(employee);
    const hourlyRate =
      numberValue(record.overtime_rate) ||
      (basicSalary > 0 ? basicSalary / 30 / 8 : 0);

    setEditingId(record.id);
    setForm({
      employee_id: String(record.employee_id || ""),
      salary_month: record.salary_month || "",
      basic_salary: String(basicSalary || ""),
      extra_days: String(record.extra_days ?? 0),
      absent_days: String(record.absent_days ?? record.leaves ?? 0),
      overtime_hours: String(record.overtime_hours ?? 0),
      overtime_rate: String(hourlyRate ? hourlyRate.toFixed(2) : ""),
      time_deduction: String(record.time_deduction ?? 0),
      current_advance: String(
        record.current_advance ?? record.advance ?? 0
      ),
      previous_advance: String(record.previous_advance ?? 0),
      status: normalizeStatus(record.status),
      notes: record.notes || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const buildPayload = () => ({
    employee_id: Number(form.employee_id),
    salary_month: form.salary_month,
    basic_salary: calculations.basicSalary,
    extra_days: numberValue(form.extra_days),
    extra_day_amount: calculations.extraDayAmount,
    absent_days: numberValue(form.absent_days),
    absent_deduction: calculations.absentDeduction,
    overtime_hours: numberValue(form.overtime_hours),
    overtime_rate: numberValue(form.overtime_rate),
    overtime_amount: calculations.overtimeAmount,
    time_deduction: numberValue(form.time_deduction),
    current_advance: numberValue(form.current_advance),
    previous_advance: numberValue(form.previous_advance),
    gross_salary: calculations.grossSalary,
    total_additions: calculations.totalAdditions,
    total_deductions: calculations.totalDeductions,
    net_salary: calculations.netSalary,
    status: form.status,
    notes: form.notes.trim(),
  });

  const handleSave = async () => {
    if (!form.employee_id || !form.salary_month) {
      showToast("error", t.errorRequired);
      return;
    }

    const payload = buildPayload();
    const employeeName =
      selectedEmployee?.full_name || selectedEmployee?.name || "-";

    setSubmitting(true);

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/employee-salary/${editingId}`,
          payload
        );
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/employee-salary`, payload);
        showToast("success", t.successSave);
      }

      await fetchData();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error("Employee salary save failed:", error);

      const localRecord = {
        ...payload,
        id: editingId || Date.now(),
        employee_name: employeeName,
      };

      if (editingId) {
        setRecords((previous) =>
          previous.map((record) =>
            String(record.id) === String(editingId)
              ? localRecord
              : record
          )
        );
        showToast("success", t.successUpdate);
      } else {
        setRecords((previous) => [localRecord, ...previous]);
        showToast("success", t.successSave);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setUsingFallback(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await axios.delete(`${API_BASE}/employee-salary/${id}`);
      await fetchData();
      showToast("success", t.successDelete);
    } catch (error) {
      console.error("Employee salary delete failed:", error);
      setRecords((previous) =>
        previous.filter((record) => String(record.id) !== String(id))
      );
      setUsingFallback(true);
      showToast("success", t.successDelete);
    }
  };

  const availableMonths = useMemo(
    () =>
      [...new Set(records.map((record) => record.salary_month).filter(Boolean))]
        .sort()
        .reverse(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const employeeName = getEmployeeName(record, employees);
      const status = normalizeStatus(record.status);

      const matchesSearch =
        !query ||
        [
          employeeName,
          record.salary_month,
          status,
          record.notes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesMonth =
        !monthFilter || record.salary_month === monthFilter;
      const matchesStatus =
        !statusFilter ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [records, employees, search, monthFilter, statusFilter]);

  const summary = useMemo(() => {
    return filteredRecords.reduce(
      (result, record) => {
        const status = normalizeStatus(record.status);
        const netSalary = numberValue(record.net_salary);
        const totalAdvance =
          numberValue(record.current_advance ?? record.advance) +
          numberValue(record.previous_advance);

        result.totalPayroll += netSalary;
        result.totalAdvances += totalAdvance;

        if (status === "Paid") result.paidPayroll += netSalary;
        else result.pendingPayroll += netSalary;

        return result;
      },
      {
        totalPayroll: 0,
        paidPayroll: 0,
        pendingPayroll: 0,
        totalAdvances: 0,
      }
    );
  }, [filteredRecords]);

  const printReport = (asPdf = false) => {
    const rows = filteredRecords
      .map((record, index) => {
        const employeeName = getEmployeeName(record, employees);

        return `
          <tr>
            <td class="center">${index + 1}</td>
            <td><strong>${employeeName}</strong></td>
            <td class="center">${record.salary_month || "-"}</td>
            <td class="money">PKR ${money(record.basic_salary)}</td>
            <td class="center">${numberValue(record.extra_days)}</td>
            <td class="center">${numberValue(
              record.absent_days ?? record.leaves
            )}</td>
            <td class="money">PKR ${money(record.overtime_amount)}</td>
            <td class="money">PKR ${money(record.time_deduction)}</td>
            <td class="money">PKR ${money(
              record.current_advance ?? record.advance
            )}</td>
            <td class="money">PKR ${money(record.previous_advance)}</td>
            <td class="money net">PKR ${money(record.net_salary)}</td>
            <td class="center">${normalizeStatus(record.status)}</td>
          </tr>
        `;
      })
      .join("");

    const reportHtml = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${t.reportTitle}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#0f172a;background:#fff;margin:0;padding:22px}
    .sheet{max-width:1450px;margin:0 auto}
    .header{background:#0f172a;color:#fff;padding:22px 24px;border-radius:18px 18px 0 0;display:flex;justify-content:space-between;gap:20px;align-items:center}
    h1{margin:0;font-size:25px}
    .sub{margin-top:5px;color:#cbd5e1;font-size:13px}
    .meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;line-height:1.8}
    .pdf-note{margin:14px 0;padding:10px 12px;background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;border-radius:10px;text-align:center}
    .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px;background:#f8fafc;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px}
    .card small{display:block;color:#64748b;margin-bottom:6px}
    .card strong{font-size:17px}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#1e293b;color:#fff;padding:9px 6px;border:1px solid #334155;text-align:${isUrdu ? "right" : "left"}}
    td{padding:8px 6px;border:1px solid #e2e8f0;vertical-align:middle}
    tbody tr:nth-child(even){background:#f8fafc}
    .center{text-align:center}
    .money{text-align:${isUrdu ? "left" : "right"};white-space:nowrap}
    .net{font-weight:800;color:#4338ca}
    .footer{background:#0f172a;color:#cbd5e1;padding:9px 14px;font-size:10px;border-radius:0 0 18px 18px;display:flex;justify-content:space-between}
    @media print{
      @page{size:A4 landscape;margin:7mm}
      body{padding:0}
      .pdf-note{display:none}
      .header{border-radius:0}
      .footer{border-radius:0}
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${asPdf ? `<div class="pdf-note">Choose <strong>Save as PDF</strong> in the print destination.</div>` : ""}
    <div class="header">
      <div>
        <h1>Ali Cages</h1>
        <div class="sub">${t.reportTitle}</div>
      </div>
      <div class="meta">
        <div>${t.printedOn}: ${new Date().toLocaleString(
          isUrdu ? "ur-PK" : "en-PK"
        )}</div>
        <div>${t.showing}: ${filteredRecords.length} ${t.records}</div>
      </div>
    </div>

    <div class="summary">
      <div class="card"><small>${t.totalPayroll}</small><strong>PKR ${money(
      summary.totalPayroll
    )}</strong></div>
      <div class="card"><small>${t.paidPayroll}</small><strong>PKR ${money(
      summary.paidPayroll
    )}</strong></div>
      <div class="card"><small>${t.pendingPayroll}</small><strong>PKR ${money(
      summary.pendingPayroll
    )}</strong></div>
      <div class="card"><small>${t.totalAdvances}</small><strong>PKR ${money(
      summary.totalAdvances
    )}</strong></div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="center">#</th>
          <th>${t.employee}</th>
          <th class="center">${t.month}</th>
          <th>${t.basicSalary}</th>
          <th class="center">${t.extraDays}</th>
          <th class="center">${t.absentDays}</th>
          <th>${t.overtimeAmount}</th>
          <th>${t.timeDeduction}</th>
          <th>${t.currentAdvance}</th>
          <th>${t.previousAdvance}</th>
          <th>${t.netSalary}</th>
          <th class="center">${t.status}</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows ||
          `<tr><td colspan="12" class="center" style="padding:30px">${t.noRecords}</td></tr>`
        }
      </tbody>
    </table>

    <div class="footer">
      <span>${t.formula}</span>
      <span>Ali Cages ERP</span>
    </div>
  </div>
  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
        ${asPdf ? "" : "window.onafterprint = () => window.close();"}
      }, 250);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open(
      "",
      "_blank",
      "width=1450,height=900"
    );

    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="salary-page" dir={dir}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        * {
          box-sizing: border-box;
        }

        .salary-page {
          min-height: 100vh;
          padding: 18px;
          color: #0f172a;
          background:
            radial-gradient(circle at top right, rgba(99,102,241,.12), transparent 28%),
            linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #f1f5f9 100%);
          font-family: ${
            isUrdu
              ? "'Noto Nastaliq Urdu', Arial, sans-serif"
              : "Inter, Helvetica, Arial, sans-serif"
          };
        }

        .salary-wrap {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
        }

        .salary-header {
          background: rgba(255,255,255,.96);
          border: 1px solid #dbe3ee;
          border-radius: 22px;
          box-shadow: 0 18px 50px rgba(15,23,42,.08);
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .title-icon {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          box-shadow: 0 12px 25px rgba(79,70,229,.28);
          flex-shrink: 0;
        }

        .page-title {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: -.7px;
        }

        .page-subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .header-actions,
        .toolbar-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .salary-btn {
          border: 0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: .15s ease;
          white-space: nowrap;
        }

        .salary-btn:hover {
          transform: translateY(-1px);
          filter: brightness(.98);
        }

        .salary-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background: #4f46e5;
          color: #fff;
          box-shadow: 0 12px 25px rgba(79,70,229,.25);
        }

        .btn-dark {
          background: #0f172a;
          color: #fff;
        }

        .btn-white {
          background: #fff;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-edit {
          background: #eef2ff;
          color: #4338ca;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 14px 0;
        }

        .summary-card {
          background: rgba(255,255,255,.96);
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(15,23,42,.05);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .summary-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        .summary-card:nth-child(1) .summary-icon {
          background: #eef2ff;
          color: #4f46e5;
        }

        .summary-card:nth-child(2) .summary-icon {
          background: #dcfce7;
          color: #15803d;
        }

        .summary-card:nth-child(3) .summary-icon {
          background: #fef3c7;
          color: #b45309;
        }

        .summary-card:nth-child(4) .summary-icon {
          background: #fce7f3;
          color: #be185d;
        }

        .summary-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .45px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .summary-value {
          margin-top: 4px;
          font-size: 20px;
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fallback-alert {
          margin-bottom: 14px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          border-radius: 14px;
          padding: 11px 14px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .salary-toolbar {
          background: rgba(255,255,255,.96);
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 10px 30px rgba(15,23,42,.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 14px;
        }

        .filters {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 240px;
        }

        .search-box i {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          ${isUrdu ? "right: 13px;" : "left: 13px;"}
        }

        .search-input,
        .filter-select {
          width: 100%;
          height: 42px;
          border: 1px solid #cbd5e1;
          background: #fff;
          border-radius: 11px;
          color: #334155;
          font-size: 13px;
          outline: none;
          transition: .15s;
        }

        .search-input {
          ${isUrdu ? "padding: 0 39px 0 13px;" : "padding: 0 13px 0 39px;"}
        }

        .filter-select {
          width: auto;
          min-width: 145px;
          padding: 0 12px;
        }

        .search-input:focus,
        .filter-select:focus,
        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }

        .table-card {
          background: rgba(255,255,255,.97);
          border: 1px solid #dbe3ee;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(15,23,42,.07);
        }

        .table-scroll {
          overflow: auto;
          max-width: 100%;
        }

        .salary-table {
          width: 100%;
          min-width: 1540px;
          border-collapse: collapse;
          font-size: 12px;
        }

        .salary-table thead th {
          background: #0f172a;
          color: #fff;
          padding: 12px 10px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .45px;
          font-weight: 850;
          text-align: ${isUrdu ? "right" : "left"};
          white-space: nowrap;
          border-right: 1px solid rgba(255,255,255,.08);
        }

        .salary-table tbody td {
          padding: 11px 10px;
          color: #475569;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
          white-space: nowrap;
        }

        .salary-table tbody tr:hover td {
          background: #f8faff;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 185px;
        }

        .employee-avatar {
          width: 33px;
          height: 33px;
          border-radius: 11px;
          background: #eef2ff;
          color: #4338ca;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: 900;
        }

        .employee-name {
          font-weight: 900;
          color: #0f172a;
        }

        .employee-sub {
          margin-top: 2px;
          font-size: 10px;
          color: #94a3b8;
        }

        .money-cell {
          text-align: ${isUrdu ? "left" : "right"};
          font-variant-numeric: tabular-nums;
          font-weight: 750;
        }

        .positive {
          color: #15803d !important;
          background: #f0fdf4;
        }

        .negative {
          color: #b91c1c !important;
          background: #fff7f7;
        }

        .net-cell {
          color: #4338ca !important;
          background: #f5f3ff;
          font-size: 13px;
          font-weight: 950;
        }

        .center {
          text-align: center !important;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .35px;
        }

        .status-paid {
          background: #dcfce7;
          color: #166534;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .row-actions {
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .icon-btn {
          width: 31px;
          height: 31px;
          border: 0;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: .15s;
        }

        .icon-btn:hover {
          transform: translateY(-1px);
        }

        .empty-state {
          padding: 48px 20px !important;
          text-align: center !important;
          color: #94a3b8 !important;
          font-size: 13px;
        }

        .table-footer {
          padding: 11px 14px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          border-top: 1px solid #e2e8f0;
        }

        .toast {
          position: fixed;
          bottom: 22px;
          ${isUrdu ? "left: 22px;" : "right: 22px;"}
          z-index: 120;
          min-width: 260px;
          max-width: 430px;
          border-radius: 14px;
          padding: 12px 14px;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 20px 50px rgba(15,23,42,.25);
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .toast-success {
          background: #059669;
        }

        .toast-error {
          background: #dc2626;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15,23,42,.64);
          backdrop-filter: blur(4px);
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .salary-modal {
          width: 100%;
          max-width: 1080px;
          max-height: calc(100vh - 36px);
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 28px 90px rgba(15,23,42,.3);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 18px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: linear-gradient(135deg, #ffffff, #f8faff);
        }

        .modal-title-row {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .modal-title-icon {
          width: 41px;
          height: 41px;
          border-radius: 13px;
          background: #eef2ff;
          color: #4338ca;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
        }

        .modal-subtitle {
          margin-top: 3px;
          font-size: 11px;
          color: #64748b;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          cursor: pointer;
          font-size: 17px;
        }

        .modal-body {
          padding: 18px;
          overflow-y: auto;
          background: #f8fafc;
        }

        .section-card {
          background: #fff;
          border: 1px solid #dbe3ee;
          border-radius: 17px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .section-title {
          margin: 0 0 13px;
          font-size: 13px;
          font-weight: 950;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .section-title i {
          color: #4f46e5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .field {
          min-width: 0;
        }

        .span-2 {
          grid-column: span 2;
        }

        .span-4 {
          grid-column: span 4;
        }

        .field-label {
          display: block;
          margin-bottom: 6px;
          color: #475569;
          font-size: 11px;
          font-weight: 850;
        }

        .field-label .required {
          color: #dc2626;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 11px;
          background: #fff;
          color: #0f172a;
          font-size: 13px;
          outline: none;
          transition: .15s;
        }

        .field-input,
        .field-select {
          height: 42px;
          padding: 0 11px;
        }

        .field-textarea {
          min-height: 76px;
          padding: 10px 11px;
          resize: vertical;
        }

        .field-input[readonly] {
          background: #f1f5f9;
          color: #475569;
          font-weight: 800;
        }

        .field-hint {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.45;
        }

        .employee-info-strip {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .info-chip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          padding: 9px 10px;
        }

        .info-chip small {
          display: block;
          color: #94a3b8;
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 850;
          letter-spacing: .4px;
        }

        .info-chip strong {
          display: block;
          margin-top: 4px;
          color: #334155;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .calculation-panel {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 12px;
        }

        .formula-box {
          border-radius: 16px;
          padding: 15px;
          background: linear-gradient(135deg, #eef2ff, #f5f3ff);
          border: 1px solid #c7d2fe;
        }

        .formula-title {
          color: #3730a3;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .formula-text {
          color: #4f46e5;
          font-size: 11px;
          line-height: 1.6;
        }

        .calc-list {
          background: #0f172a;
          color: #fff;
          border-radius: 16px;
          padding: 14px 15px;
        }

        .calc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,.1);
          font-size: 11px;
        }

        .calc-row:last-child {
          border-bottom: 0;
        }

        .calc-row strong {
          font-size: 12px;
          font-variant-numeric: tabular-nums;
        }

        .calc-net {
          margin-top: 6px;
          padding-top: 11px;
          color: #c7d2fe;
          font-size: 13px;
          font-weight: 950;
        }

        .calc-net strong {
          color: #fff;
          font-size: 18px;
        }

        .modal-footer {
          padding: 14px 18px;
          border-top: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        @media (max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .span-4 {
            grid-column: span 2;
          }
        }

        @media (max-width: 720px) {
          .salary-page {
            padding: 10px;
          }

          .salary-header {
            padding: 16px;
            border-radius: 17px;
          }

          .page-title {
            font-size: 23px;
          }

          .header-actions,
          .toolbar-actions,
          .salary-btn {
            width: 100%;
          }

          .header-actions .salary-btn,
          .toolbar-actions .salary-btn {
            flex: 1;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .salary-toolbar,
          .filters {
            align-items: stretch;
          }

          .filters,
          .search-box,
          .filter-select {
            width: 100%;
            min-width: 100%;
          }

          .modal-backdrop {
            padding: 7px;
          }

          .salary-modal {
            max-height: calc(100vh - 14px);
            border-radius: 16px;
          }

          .modal-header {
            padding: 14px;
          }

          .modal-body {
            padding: 10px;
          }

          .section-card {
            padding: 12px;
          }

          .form-grid,
          .employee-info-strip,
          .calculation-panel {
            grid-template-columns: 1fr;
          }

          .span-2,
          .span-4 {
            grid-column: span 1;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .modal-footer .salary-btn {
            width: 100%;
          }
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
          <i
            className={`bi ${
              message.type === "error"
                ? "bi-exclamation-triangle-fill"
                : "bi-check-circle-fill"
            }`}
          />
          <span>{message.text}</span>
        </div>
      )}

      <div className="salary-wrap">
        <header className="salary-header">
          <div className="title-row">
            <div className="title-icon">
              <i className="bi bi-cash-stack" />
            </div>
            <div>
              <h1 className="page-title">{t.title}</h1>
              <p className="page-subtitle">{t.subtitle}</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="salary-btn btn-dark"
              onClick={() => setLang((previous) =>
                previous === "en" ? "ur" : "en"
              )}
            >
              <i className="bi bi-translate" />
              {t.toggleLang}
            </button>

            <button
              type="button"
              className="salary-btn btn-primary"
              onClick={openAdd}
            >
              <i className="bi bi-plus-lg" />
              {t.addSalary}
            </button>
          </div>
        </header>

        <section className="summary-grid">
          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-wallet2" />
            </div>
            <div>
              <div className="summary-label">{t.totalPayroll}</div>
              <div className="summary-value">
                PKR {money(summary.totalPayroll)}
              </div>
            </div>
          </article>

          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-check2-circle" />
            </div>
            <div>
              <div className="summary-label">{t.paidPayroll}</div>
              <div className="summary-value">
                PKR {money(summary.paidPayroll)}
              </div>
            </div>
          </article>

          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-hourglass-split" />
            </div>
            <div>
              <div className="summary-label">{t.pendingPayroll}</div>
              <div className="summary-value">
                PKR {money(summary.pendingPayroll)}
              </div>
            </div>
          </article>

          <article className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-cash-coin" />
            </div>
            <div>
              <div className="summary-label">{t.totalAdvances}</div>
              <div className="summary-value">
                PKR {money(summary.totalAdvances)}
              </div>
            </div>
          </article>
        </section>

        {usingFallback && (
          <div className="fallback-alert">
            <i className="bi bi-info-circle-fill" />
            {t.apiFallback}
          </div>
        )}

        <section className="salary-toolbar">
          <div className="filters">
            <div className="search-box">
              <i className="bi bi-search" />
              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
              />
            </div>

            <select
              className="filter-select"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            >
              <option value="">{t.allMonths}</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">{t.allStatuses}</option>
              <option value="Paid">{t.paid}</option>
              <option value="Pending">{t.pending}</option>
            </select>
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className="salary-btn btn-white"
              onClick={fetchData}
            >
              <i className="bi bi-arrow-clockwise" />
              {t.refresh}
            </button>

            <button
              type="button"
              className="salary-btn btn-white"
              onClick={() => printReport(false)}
              disabled={!filteredRecords.length}
            >
              <i className="bi bi-printer" />
              {t.print}
            </button>

            <button
              type="button"
              className="salary-btn btn-white"
              onClick={() => printReport(true)}
              disabled={!filteredRecords.length}
            >
              <i className="bi bi-file-earmark-pdf text-danger" />
              {t.pdf}
            </button>
          </div>
        </section>

        <section className="table-card">
          <div className="table-scroll">
            <table className="salary-table">
              <thead>
                <tr>
                  <th className="center">#</th>
                  <th>{t.employee}</th>
                  <th className="center">{t.salaryMonth}</th>
                  <th>{t.basicSalary}</th>
                  <th className="center">{t.extraDays}</th>
                  <th>{t.extraDayAmount}</th>
                  <th className="center">{t.absentDays}</th>
                  <th>{t.absentDeduction}</th>
                  <th>{t.overtimeAmount}</th>
                  <th>{t.timeDeduction}</th>
                  <th>{t.currentAdvance}</th>
                  <th>{t.previousAdvance}</th>
                  <th>{t.netSalary}</th>
                  <th className="center">{t.status}</th>
                  <th className="center">{t.actions}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="15" className="empty-state">
                      <i className="bi bi-arrow-repeat" /> {t.loading}
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="empty-state">
                      <i className="bi bi-inbox" /> {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => {
                    const employeeName = getEmployeeName(
                      record,
                      employees
                    );
                    const employee = employees.find(
                      (item) =>
                        String(item.id) === String(record.employee_id)
                    );
                    const status = normalizeStatus(record.status);

                    return (
                      <tr key={record.id}>
                        <td className="center">{index + 1}</td>

                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">
                              {employeeName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="employee-name">
                                {employeeName}
                              </div>
                              <div className="employee-sub">
                                {employee?.designation ||
                                  employee?.department_name ||
                                  "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="center">
                          {record.salary_month || "-"}
                        </td>

                        <td className="money-cell">
                          PKR {money(record.basic_salary)}
                        </td>

                        <td className="center">
                          {numberValue(record.extra_days)}
                        </td>

                        <td className="money-cell positive">
                          + PKR {money(record.extra_day_amount)}
                        </td>

                        <td className="center">
                          {numberValue(
                            record.absent_days ?? record.leaves
                          )}
                        </td>

                        <td className="money-cell negative">
                          - PKR {money(record.absent_deduction)}
                        </td>

                        <td className="money-cell positive">
                          + PKR {money(record.overtime_amount)}
                        </td>

                        <td className="money-cell negative">
                          - PKR {money(record.time_deduction)}
                        </td>

                        <td className="money-cell negative">
                          - PKR{" "}
                          {money(
                            record.current_advance ?? record.advance
                          )}
                        </td>

                        <td className="money-cell negative">
                          - PKR {money(record.previous_advance)}
                        </td>

                        <td className="money-cell net-cell">
                          PKR {money(record.net_salary)}
                        </td>

                        <td className="center">
                          <span
                            className={`status-badge ${
                              status === "Paid"
                                ? "status-paid"
                                : "status-pending"
                            }`}
                          >
                            <i
                              className={`bi ${
                                status === "Paid"
                                  ? "bi-check-circle-fill"
                                  : "bi-clock-fill"
                              }`}
                            />
                            {status === "Paid" ? t.paid : t.pending}
                          </span>
                        </td>

                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn btn-edit"
                              title={t.edit}
                              onClick={() => openEdit(record)}
                            >
                              <i className="bi bi-pencil-square" />
                            </button>

                            <button
                              type="button"
                              className="icon-btn btn-danger"
                              title={t.delete}
                              onClick={() => handleDelete(record.id)}
                            >
                              <i className="bi bi-trash3" />
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

          <div className="table-footer">
            <span>
              {t.showing}: <strong>{filteredRecords.length}</strong>{" "}
              {t.records}
            </span>
            <span>{t.formula}</span>
          </div>
        </section>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="salary-modal" dir={dir}>
            <div className="modal-header">
              <div className="modal-title-row">
                <div className="modal-title-icon">
                  <i className="bi bi-receipt-cutoff" />
                </div>
                <div>
                  <h2 className="modal-title">
                    {editingId ? t.edit : t.addSalary}
                  </h2>
                  <div className="modal-subtitle">
                    {t.formula}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                aria-label="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              <section className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-person-badge" />
                  {t.salaryDetails}
                </h3>

                <div className="form-grid">
                  <div className="field span-2">
                    <label className="field-label">
                      {t.employee}{" "}
                      <span className="required">*</span>
                    </label>
                    <select
                      className="field-select"
                      value={form.employee_id}
                      onChange={(event) =>
                        handleEmployeeChange(event.target.value)
                      }
                    >
                      <option value="">{t.selectEmployee}</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name || employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.salaryMonth}{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="month"
                      className="field-input"
                      value={form.salary_month}
                      onChange={(event) =>
                        updateField("salary_month", event.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">{t.status}</label>
                    <select
                      className="field-select"
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                    >
                      <option value="Pending">{t.pending}</option>
                      <option value="Paid">{t.paid}</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.basicSalary}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input"
                      value={form.basic_salary}
                      onChange={(event) => {
                        const salary = event.target.value;
                        const hourly =
                          numberValue(salary) > 0
                            ? numberValue(salary) / 30 / 8
                            : 0;

                        setForm((previous) => ({
                          ...previous,
                          basic_salary: salary,
                          overtime_rate: hourly
                            ? hourly.toFixed(2)
                            : "",
                        }));
                      }}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.perDaySalary}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        calculations.perDaySalary
                      )}`}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.perHourSalary}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        calculations.perHourSalary
                      )}`}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.previousAdvance}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        form.previous_advance
                      )}`}
                    />
                    <div className="field-hint">
                      {t.previousAdvanceHint}
                    </div>
                  </div>
                </div>

                {selectedEmployee && (
                  <div className="employee-info-strip">
                    <div className="info-chip">
                      <small>{t.employee}</small>
                      <strong>
                        {selectedEmployee.full_name ||
                          selectedEmployee.name ||
                          "-"}
                      </strong>
                    </div>

                    <div className="info-chip">
                      <small>{t.designation}</small>
                      <strong>
                        {selectedEmployee.designation || "-"}
                      </strong>
                    </div>

                    <div className="info-chip">
                      <small>{t.department}</small>
                      <strong>
                        {selectedEmployee.department_name ||
                          selectedEmployee.department ||
                          "-"}
                      </strong>
                    </div>
                  </div>
                )}
              </section>

              <section className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-calendar2-check" />
                  {t.attendanceAdditions}
                </h3>

                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">{t.extraDays}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="field-input"
                      value={form.extra_days}
                      onChange={(event) =>
                        updateField("extra_days", event.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.extraDayAmount}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        calculations.extraDayAmount
                      )}`}
                    />
                  </div>

                  <div className="field">
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
                        updateField("absent_days", event.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.absentDeduction}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        calculations.absentDeduction
                      )}`}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.overtimeHours}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
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

                  <div className="field">
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
                    <div className="field-hint">
                      {t.overtimeRateHint}
                    </div>
                  </div>

                  <div className="field span-2">
                    <label className="field-label">
                      {t.overtimeAmount}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        calculations.overtimeAmount
                      )}`}
                    />
                  </div>
                </div>
              </section>

              <section className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-dash-circle" />
                  {t.deductionsAdvances}
                </h3>

                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">
                      {t.timeDeduction}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input"
                      value={form.time_deduction}
                      onChange={(event) =>
                        updateField(
                          "time_deduction",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {t.currentAdvance}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input"
                      value={form.current_advance}
                      onChange={(event) =>
                        updateField(
                          "current_advance",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field">
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

                  <div className="field">
                    <label className="field-label">
                      {t.totalDeductions}
                    </label>
                    <input
                      className="field-input"
                      readOnly
                      value={`PKR ${money(
                        calculations.totalDeductions
                      )}`}
                    />
                  </div>

                  <div className="field span-4">
                    <label className="field-label">{t.notes}</label>
                    <textarea
                      className="field-textarea"
                      value={form.notes}
                      placeholder={t.notesPlaceholder}
                      onChange={(event) =>
                        updateField("notes", event.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="section-card">
                <h3 className="section-title">
                  <i className="bi bi-calculator" />
                  {t.calculationSummary}
                </h3>

                <div className="calculation-panel">
                  <div className="formula-box">
                    <div className="formula-title">{t.formula}</div>
                    <div className="formula-text">
                      {t.basicSalary}: PKR{" "}
                      {money(calculations.basicSalary)}
                      <br />
                      + {t.extraDayAmount}: PKR{" "}
                      {money(calculations.extraDayAmount)}
                      <br />
                      + {t.overtimeAmount}: PKR{" "}
                      {money(calculations.overtimeAmount)}
                      <br />
                      − {t.absentDeduction}: PKR{" "}
                      {money(calculations.absentDeduction)}
                      <br />
                      − {t.timeDeduction}: PKR{" "}
                      {money(form.time_deduction)}
                      <br />
                      − {t.currentAdvance}: PKR{" "}
                      {money(form.current_advance)}
                      <br />
                      − {t.previousAdvance}: PKR{" "}
                      {money(form.previous_advance)}
                    </div>
                  </div>

                  <div className="calc-list">
                    <div className="calc-row">
                      <span>{t.basicSalary}</span>
                      <strong>
                        PKR {money(calculations.basicSalary)}
                      </strong>
                    </div>

                    <div className="calc-row">
                      <span>{t.totalAdditions}</span>
                      <strong>
                        + PKR {money(calculations.totalAdditions)}
                      </strong>
                    </div>

                    <div className="calc-row">
                      <span>{t.grossSalary}</span>
                      <strong>
                        PKR {money(calculations.grossSalary)}
                      </strong>
                    </div>

                    <div className="calc-row">
                      <span>{t.totalDeductions}</span>
                      <strong>
                        − PKR {money(calculations.totalDeductions)}
                      </strong>
                    </div>

                    <div className="calc-row calc-net">
                      <span>{t.netSalary}</span>
                      <strong>
                        PKR {money(calculations.netSalary)}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="salary-btn btn-white"
                onClick={closeForm}
                disabled={submitting}
              >
                {t.cancel}
              </button>

              <button
                type="button"
                className="salary-btn btn-primary"
                onClick={handleSave}
                disabled={submitting}
              >
                <i
                  className={`bi ${
                    submitting
                      ? "bi-arrow-repeat"
                      : "bi-check2-circle"
                  }`}
                />
                {submitting ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
