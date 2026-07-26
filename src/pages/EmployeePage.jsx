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

const EMPLOYEES_API = `${API_ROOT}/api/employees`;
const DEPARTMENTS_API = `${API_ROOT}/api/departments`;

const LANG = {
  en: {
    title: "Employee Registration",
    subtitle:
      "Manage company employees, departments, designations and salaries",
    addBtn: "New Employee",
    searchPlaceholder:
      "Search by name, designation, department, CNIC or phone...",
    toggleLang: "اردو",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    refresh: "Refresh",

    employee: "Employee",
    designation: "Designation",
    department: "Department",
    viewDetails: "View Details",
    actions: "Actions",
    status: "Status",
    active: "Active",

    totalEmployees: "Total Employees",
    visibleRecords: "Visible Records",
    totalSalary: "Total Basic Salary",

    fullName: "Full Name",
    fatherName: "Father Name",
    cnic: "CNIC",
    phone: "Phone No",
    selectDepartment: "-- Select Department --",
    joiningDate: "Joining Date",
    basicSalary: "Basic Salary",

    employeeDetails: "Employee Details",
    formSubtitle:
      "Employee personal, employment and salary information",
    addTitle: "New Employee",
    editTitle: "Edit Employee",
    detailsTitle: "Employee Details",

    save: "Save Employee",
    update: "Update Employee",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    delete: "Delete",

    notes: "Information",
    noRecords: "No employees found.",
    noDepartments: "No departments found from backend.",
    loading: "Loading employees...",
    loadError: "Employees could not be loaded from backend.",
    saveError: "Employee could not be saved.",
    deleteError: "Employee could not be deleted.",
    requiredError:
      "Full name, designation and department are required.",
    successSave: "Employee saved successfully.",
    successUpdate: "Employee updated successfully.",
    successDelete: "Employee deleted successfully.",
    deleteConfirm:
      "Are you sure you want to delete this employee?",

    reportHeader: "Employees List",
    printedOn: "Printed On",
  },

  ur: {
    title: "ملازمین کی رجسٹریشن",
    subtitle:
      "کمپنی کے ملازمین، محکموں، عہدوں اور تنخواہوں کا انتظام کریں",
    addBtn: "نیا ملازم",
    searchPlaceholder:
      "نام، عہدہ، محکمہ، شناختی کارڈ یا فون سے تلاش کریں...",
    toggleLang: "English",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    refresh: "ری فریش",

    employee: "ملازم",
    designation: "عہدہ",
    department: "محکمہ",
    viewDetails: "تفصیل دیکھیں",
    actions: "ایکشن",
    status: "حالت",
    active: "فعال",

    totalEmployees: "کل ملازمین",
    visibleRecords: "نظر آنے والے ریکارڈ",
    totalSalary: "کل بنیادی تنخواہ",

    fullName: "پورا نام",
    fatherName: "والد کا نام",
    cnic: "شناختی کارڈ نمبر",
    phone: "فون نمبر",
    selectDepartment: "-- محکمہ منتخب کریں --",
    joiningDate: "تاریخ شمولیت",
    basicSalary: "بنیادی تنخواہ",

    employeeDetails: "ملازم کی تفصیل",
    formSubtitle:
      "ملازم کی ذاتی، ملازمت اور تنخواہ کی معلومات",
    addTitle: "نیا ملازم",
    editTitle: "ملازم میں ترمیم",
    detailsTitle: "ملازم کی مکمل تفصیل",

    save: "ملازم محفوظ کریں",
    update: "ملازم اپڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    close: "بند کریں",
    edit: "ترمیم",
    delete: "حذف",

    notes: "معلومات",
    noRecords: "کوئی ملازم نہیں ملا۔",
    noDepartments: "بیک اینڈ سے کوئی محکمہ نہیں ملا۔",
    loading: "ملازمین لوڈ ہو رہے ہیں...",
    loadError: "بیک اینڈ سے ملازمین لوڈ نہیں ہوئے۔",
    saveError: "ملازم محفوظ نہیں ہوا۔",
    deleteError: "ملازم حذف نہیں ہوا۔",
    requiredError: "پورا نام، عہدہ اور محکمہ ضروری ہیں۔",
    successSave: "ملازم کامیابی سے محفوظ ہو گیا۔",
    successUpdate: "ملازم کامیابی سے اپڈیٹ ہو گیا۔",
    successDelete: "ملازم کامیابی سے حذف ہو گیا۔",
    deleteConfirm:
      "کیا آپ واقعی اس ملازم کو حذف کرنا چاہتے ہیں؟",

    reportHeader: "ملازمین کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
  },
};

const createEmptyForm = () => ({
  full_name: "",
  father_name: "",
  cnic: "",
  phone: "",
  designation: "",
  department_id: "",
  joining_date: "",
  basic_salary: "",
});

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.employees)) return value.employees;
  if (Array.isArray(value?.departments)) return value.departments;
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

const getDepartmentId = (department) =>
  department?.id ?? department?.department_id ?? "";

const getDepartmentLabel = (department) =>
  department?.department_name ??
  department?.name ??
  department?.name_en ??
  "";

const getEmployeeId = (record) =>
  record?.id ?? record?.employee_id ?? "";

const normalizeDate = (value) => {
  if (!value) return "";

  const stringValue = String(value);
  return stringValue.includes("T")
    ? stringValue.slice(0, 10)
    : stringValue.slice(0, 10);
};

export default function EmployeePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const departmentMap = useMemo(() => {
    const map = {};

    departments.forEach((department) => {
      map[String(getDepartmentId(department))] =
        getDepartmentLabel(department);
    });

    return map;
  }, [departments]);

  const getDepartmentName = useCallback(
    (record) =>
      record?.department_name ||
      departmentMap[String(record?.department_id)] ||
      "-",
    [departmentMap]
  );

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });

    window.setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3200);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [employeeResponse, departmentResponse] =
        await Promise.all([
          axios.get(EMPLOYEES_API),
          axios.get(DEPARTMENTS_API),
        ]);

      setRecords(getList(employeeResponse.data));
      setDepartments(getList(departmentResponse.data));
    } catch (error) {
      console.error("Employee load error:", error);
      setRecords([]);
      setDepartments([]);

      showToast(
        "error",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          t.loadError
      );
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

  const openAdd = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setShowForm(true);
  };

  const openEdit = (record) => {
    setEditingId(getEmployeeId(record));

    setForm({
      full_name: record?.full_name || "",
      father_name: record?.father_name || "",
      cnic: record?.cnic || "",
      phone: record?.phone || "",
      designation: record?.designation || "",
      department_id: String(
        record?.department_id || ""
      ),
      joining_date: normalizeDate(
        record?.joining_date
      ),
      basic_salary: String(
        record?.basic_salary ?? ""
      ),
    });

    setShowDetails(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const buildPayload = () => ({
    full_name: form.full_name.trim(),
    father_name: form.father_name.trim() || null,
    cnic: form.cnic.trim() || null,
    phone: form.phone.trim() || null,
    designation: form.designation.trim(),
    department_id: Number(form.department_id),
    joining_date: form.joining_date || null,
    basic_salary: toNumber(form.basic_salary),
  });

  const handleSave = async () => {
    if (
      !form.full_name.trim() ||
      !form.designation.trim() ||
      !form.department_id
    ) {
      showToast("error", t.requiredError);
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await axios.put(
          `${EMPLOYEES_API}/${editingId}`,
          buildPayload()
        );
        showToast("success", t.successUpdate);
      } else {
        await axios.post(
          EMPLOYEES_API,
          buildPayload()
        );
        showToast("success", t.successSave);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(createEmptyForm());
      await fetchData();
    } catch (error) {
      console.error("Employee save error:", error);

      showToast(
        "error",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
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
        `${EMPLOYEES_API}/${recordId}`
      );

      setShowDetails(false);
      setDetailRecord(null);
      await fetchData();
      showToast("success", t.successDelete);
    } catch (error) {
      console.error("Employee delete error:", error);

      showToast(
        "error",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          t.deleteError
      );
    }
  };

  const openDetails = (record) => {
    setDetailRecord(record);
    setShowDetails(true);
  };

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [
        record?.full_name,
        record?.father_name,
        record?.cnic,
        record?.phone,
        record?.designation,
        getDepartmentName(record),
        normalizeDate(record?.joining_date),
        record?.basic_salary,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search, getDepartmentName]);

  const summary = useMemo(
    () => ({
      totalEmployees: records.length,
      visibleRecords: filteredRecords.length,
      totalSalary: filteredRecords.reduce(
        (sum, record) =>
          sum + toNumber(record?.basic_salary),
        0
      ),
    }),
    [records, filteredRecords]
  );

  const printDocument = (saveAsPdf = false) => {
    const rows = filteredRecords
      .map(
        (record, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td>
              <strong>${record.full_name || "-"}</strong>
              <small>S/O ${record.father_name || "-"}</small>
            </td>
            <td>${record.cnic || "-"}</td>
            <td>${record.phone || "-"}</td>
            <td>${record.designation || "-"}</td>
            <td>${getDepartmentName(record)}</td>
            <td class="center">${normalizeDate(
              record.joining_date
            ) || "-"}</td>
            <td class="money">PKR ${money(
              record.basic_salary
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
        <title>${t.reportHeader}</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:Arial,sans-serif;background:#fff;color:#0f172a;padding:20px}
          .sheet{max-width:1200px;margin:auto;border:1px solid #dbe3ee}
          .header{background:#0f172a;color:#fff;padding:20px;display:flex;justify-content:space-between}
          h1{margin:0;font-size:24px}
          .sub{margin-top:4px;color:#cbd5e1;font-size:12px}
          .hint{padding:10px;background:#eef2ff;color:#3730a3;text-align:center}
          table{width:100%;border-collapse:collapse;font-size:11px}
          th{background:#0f172a;color:#fff;padding:10px 8px;border:1px solid #334155}
          td{padding:9px 8px;border:1px solid #e2e8f0}
          tbody tr:nth-child(even){background:#f8fafc}
          .center{text-align:center}
          .money{text-align:right;white-space:nowrap;font-weight:bold;color:#047857}
          small{display:block;margin-top:3px;color:#64748b}
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
            ? `<div class="hint">Select <strong>Save as PDF</strong> in print destination.</div>`
            : ""
        }

        <div class="sheet">
          <div class="header">
            <div>
              <h1>Ali Cage</h1>
              <div class="sub">${t.reportHeader}</div>
            </div>
            <div>
              ${t.printedOn}: ${new Date().toLocaleString(
      isUrdu ? "ur-PK" : "en-PK"
    )}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t.employee}</th>
                <th>${t.cnic}</th>
                <th>${t.phone}</th>
                <th>${t.designation}</th>
                <th>${t.department}</th>
                <th>${t.joiningDate}</th>
                <th>${t.basicSalary}</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows ||
                `<tr><td colspan="8" class="center">${t.noRecords}</td></tr>`
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

  const detailItems = detailRecord
    ? [
        [t.fullName, detailRecord.full_name || "-"],
        [t.fatherName, detailRecord.father_name || "-"],
        [t.cnic, detailRecord.cnic || "-"],
        [t.phone, detailRecord.phone || "-"],
        [t.designation, detailRecord.designation || "-"],
        [t.department, getDepartmentName(detailRecord)],
        [
          t.joiningDate,
          normalizeDate(detailRecord.joining_date) ||
            "-",
        ],
        [
          t.basicSalary,
          `PKR ${money(detailRecord.basic_salary)}`,
        ],
      ]
    : [];

  return (
    <div className="employee-page" dir={dir}>
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

        .employee-page{
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

        .btn-danger{
          background:#fee2e2;
          color:#991b1b;
        }

        .summary-grid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
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
        .field-select:focus{
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

        .employee-table{
          width:100%;
          table-layout:fixed;
          border-collapse:collapse;
        }

        .employee-table th{
          padding:14px 13px;
          background:#0f172a;
          color:#fff;
          font-size:10px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:.45px;
        }

        .employee-table td{
          padding:16px 13px;
          border-bottom:1px solid #e5e7eb;
          color:#475569;
          font-size:13px;
          vertical-align:middle;
        }

        .employee-table tbody tr:last-child td{
          border-bottom:0;
        }

        .employee-table tbody tr:hover td{
          background:#f8faff;
        }

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

        .employee-copy{
          min-width:0;
        }

        .employee-name{
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:#0f172a;
          font-weight:900;
        }

        .employee-sub{
          margin-top:3px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:#94a3b8;
          font-size:10px;
          font-weight:750;
        }

        .pill{
          display:inline-flex;
          max-width:100%;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          border:1px solid #e2e8f0;
          border-radius:999px;
          padding:6px 10px;
          background:#f1f5f9;
          color:#334155;
          font-size:10px;
          font-weight:900;
        }

        .department-pill{
          border-color:#c7d2fe;
          background:#eef2ff;
          color:#4338ca;
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
          max-width:850px;
          max-height:calc(100vh - 24px);
          background:#fff;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 30px 90px rgba(15,23,42,.3);
          display:flex;
          flex-direction:column;
        }

        .details-modal{
          max-width:800px;
        }

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
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:12px;
        }

        .field-label{
          display:block;
          margin-bottom:6px;
          color:#475569;
          font-size:11px;
          font-weight:850;
        }

        .field-input,
        .field-select{
          width:100%;
          height:42px;
          border:1px solid #cbd5e1;
          border-radius:10px;
          background:#fff;
          color:#0f172a;
          padding:0 11px;
          font-size:13px;
          outline:none;
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
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:10px;
        }

        .detail-card{
          border:1px solid #dbe3ee;
          border-radius:12px;
          padding:12px;
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

        @media(max-width:800px){
          .summary-grid{
            grid-template-columns:1fr;
          }

          .form-grid,
          .details-grid{
            grid-template-columns:1fr;
          }
        }

        @media(max-width:640px){
          .employee-page{padding:10px}
          .top-card{padding:19px 15px;border-radius:17px}
          .page-title{font-size:25px}
          .actions .btn{flex:1}
          .employee-table th,
          .employee-table td{padding:12px 7px}
          .employee-table th{font-size:8px}
          .employee-sub{display:none}
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
              {t.printBtn}
            </button>

            <button
              type="button"
              className="btn btn-white"
              disabled={!filteredRecords.length}
              onClick={() => printDocument(true)}
            >
              <i className="bi bi-file-earmark-pdf" />
              {t.pdfBtn}
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
              {t.addBtn}
            </button>
          </div>
        </section>

        {showSummary && (
          <section className="summary-grid">
            <article className="summary-card">
              <div className="summary-label">
                {t.totalEmployees}
              </div>
              <div className="summary-value">
                {summary.totalEmployees}
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-label">
                {t.visibleRecords}
              </div>
              <div className="summary-value">
                {summary.visibleRecords}
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-label">
                {t.totalSalary}
              </div>
              <div className="summary-value">
                PKR {money(summary.totalSalary)}
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
          <table className="employee-table">
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "40%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>

            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>
                  #
                </th>
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
                  {t.designation}
                </th>
                <th style={{ textAlign: "center" }}>
                  {t.department}
                </th>
                <th style={{ textAlign: "center" }}>
                  {t.viewDetails}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty">
                    <i className="bi bi-arrow-repeat" />{" "}
                    {t.loading}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    <i className="bi bi-inbox" />{" "}
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                filteredRecords.map(
                  (record, index) => {
                    const employeeName =
                      record.full_name || "-";

                    return (
                      <tr key={getEmployeeId(record)}>
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

                            <div className="employee-copy">
                              <div className="employee-name">
                                {employeeName}
                              </div>
                              <div className="employee-sub">
                                S/O{" "}
                                {record.father_name || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          style={{ textAlign: "center" }}
                        >
                          <span className="pill">
                            {record.designation || "-"}
                          </span>
                        </td>

                        <td
                          style={{ textAlign: "center" }}
                        >
                          <span className="pill department-pill">
                            {getDepartmentName(record)}
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
                    : t.addTitle}
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
                <div>
                  <label className="field-label">
                    {t.fullName} *
                  </label>
                  <input
                    className="field-input"
                    value={form.full_name}
                    onChange={(event) =>
                      updateField(
                        "full_name",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.fatherName}
                  </label>
                  <input
                    className="field-input"
                    value={form.father_name}
                    onChange={(event) =>
                      updateField(
                        "father_name",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.cnic}
                  </label>
                  <input
                    className="field-input"
                    value={form.cnic}
                    onChange={(event) =>
                      updateField(
                        "cnic",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.phone}
                  </label>
                  <input
                    className="field-input"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.designation} *
                  </label>
                  <input
                    className="field-input"
                    value={form.designation}
                    onChange={(event) =>
                      updateField(
                        "designation",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.department} *
                  </label>
                  <select
                    className="field-select"
                    value={form.department_id}
                    onChange={(event) =>
                      updateField(
                        "department_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {t.selectDepartment}
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={getDepartmentId(
                            department
                          )}
                          value={getDepartmentId(
                            department
                          )}
                        >
                          {getDepartmentLabel(
                            department
                          )}
                        </option>
                      )
                    )}
                  </select>

                  {!loading &&
                    departments.length === 0 && (
                      <div
                        style={{
                          marginTop: 5,
                          color: "#dc2626",
                          fontSize: 10,
                        }}
                      >
                        {t.noDepartments}
                      </div>
                    )}
                </div>

                <div>
                  <label className="field-label">
                    {t.joiningDate}
                  </label>
                  <input
                    type="date"
                    className="field-input"
                    value={form.joining_date}
                    onChange={(event) =>
                      updateField(
                        "joining_date",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    {t.basicSalary}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input"
                    value={form.basic_salary}
                    onChange={(event) =>
                      updateField(
                        "basic_salary",
                        event.target.value
                      )
                    }
                  />
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
          <div
            className="modal details-modal"
            dir={dir}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {t.detailsTitle}
                </h2>
                <div className="modal-subtitle">
                  {detailRecord.full_name || "-"}
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
                {detailItems.map(([label, value]) => (
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
                className="btn btn-danger"
                onClick={() =>
                  handleDelete(
                    getEmployeeId(detailRecord)
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
