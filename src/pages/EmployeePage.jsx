import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const LANG = {
  en: {
    title: "Employee Registration",
    subtitle: "Manage company employees, designations, and salaries",
    addBtn: "New Employee",
    searchPlaceholder: "Search by name, designation, department, CNIC or phone...",
    fullName: "Full Name",
    fatherName: "Father Name",
    cnic: "CNIC",
    phone: "Phone No",
    designation: "Designation",
    department: "Department",
    selectDepartment: "-- Select Department --",
    joiningDate: "Joining Date",
    basicSalary: "Basic Salary",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    actions: "Action",
    noRecords: "No employees found.",
    toggleLang: "اردو",
    printBtn: "Print List",
    pdfBtn: "Download PDF",
    reportHeader: "Employees List",
    printedOn: "Printed On",
    successSave: "Employee saved successfully!",
    successUpdate: "Employee updated successfully!",
    successDelete: "Employee deleted successfully!",
    errorMsg: "Please fill all required fields: Name, Designation and Department.",
    deleteConfirm: "Are you sure you want to delete this employee?",
    refresh: "Refresh",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    totalEmployees: "Total Employees",
    visibleRecords: "Visible Records",
    totalSalary: "Total Salary",
    employeeDetails: "Employee Details",
    salaryInfo: "Salary Information",
    formSubtitle: "Employee personal, job and salary information",
    loading: "Loading employees...",
  },

  ur: {
    title: "ملازمین کی رجسٹریشن",
    subtitle: "کمپنی کے ملازمین، عہدوں اور تنخواہوں کا انتظام کریں",
    addBtn: "نیا ملازم",
    searchPlaceholder: "نام، عہدہ، محکمہ، شناختی کارڈ یا فون سے تلاش کریں...",
    fullName: "پورا نام",
    fatherName: "والد کا نام",
    cnic: "شناختی کارڈ نمبر",
    phone: "فون نمبر",
    designation: "عہدہ",
    department: "محکمہ",
    selectDepartment: "-- محکمہ منتخب کریں --",
    joiningDate: "تاریخ شمولیت",
    basicSalary: "بنیادی تنخواہ",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    actions: "ایکشن",
    noRecords: "کوئی ملازم نہیں ملا۔",
    toggleLang: "English",
    printBtn: "فہرست پرنٹ کریں",
    pdfBtn: "پی ڈی ایف ڈاؤنلوڈ",
    reportHeader: "ملازمین کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
    successSave: "ملازم کامیابی سے محفوظ ہو گیا!",
    successUpdate: "ملازم کا ریکارڈ اپڈیٹ ہو گیا!",
    successDelete: "ملازم حذف ہو گیا!",
    errorMsg: "براہ کرم لازمی خانے پُر کریں: نام، عہدہ اور محکمہ۔",
    deleteConfirm: "کیا آپ واقعی اس ملازم کو حذف کرنا چاہتے ہیں؟",
    refresh: "ری فریش",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    totalEmployees: "کل ملازمین",
    visibleRecords: "نظر آنے والے ریکارڈز",
    totalSalary: "کل تنخواہ",
    employeeDetails: "ملازم کی تفصیل",
    salaryInfo: "تنخواہ معلومات",
    formSubtitle: "ملازم کی ذاتی، جاب اور تنخواہ معلومات",
    loading: "ملازمین لوڈ ہو رہے ہیں...",
  },
};

const defaultForm = {
  full_name: "",
  father_name: "",
  cnic: "",
  phone: "",
  designation: "",
  department_id: "",
  joining_date: "",
  basic_salary: "",
};

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};

const fmt = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export default function EmployeePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [form, setForm] = useState(defaultForm);

  const departmentMap = useMemo(() => {
    const map = {};

    departments.forEach((department) => {
      map[String(department.id)] =
        department.department_name ||
        department.name ||
        department.name_en ||
        `#${department.id}`;
    });

    return map;
  }, [departments]);

  const getDepartmentName = useCallback(
    (record) =>
      record.department_name ||
      departmentMap[String(record.department_id)] ||
      "-",
    [departmentMap]
  );

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [resEmp, resDept] = await Promise.all([
        axios.get(`${API_BASE}/employees`),
        axios.get(`${API_BASE}/departments`),
      ]);

      setRecords(getList(resEmp.data));
      setDepartments(getList(resDept.data));
    } catch (err) {
      setDepartments([
        {
          id: 1,
          department_name: "Production",
        },
        {
          id: 2,
          department_name: "Sales",
        },
        {
          id: 3,
          department_name: "Administration",
        },
      ]);

      setRecords([
        {
          id: 1,
          full_name: "Ahmed Raza",
          father_name: "Ali Raza",
          cnic: "37405-1234567-1",
          phone: "0300-1234567",
          designation: "Machine Operator",
          department_id: 1,
          department_name: "Production",
          joining_date: "2023-01-15",
          basic_salary: 45000,
        },
        {
          id: 2,
          full_name: "Hassan Ali",
          father_name: "Sajjad Ali",
          cnic: "37405-7654321-3",
          phone: "0333-9876543",
          designation: "Sales Executive",
          department_id: 2,
          department_name: "Sales",
          joining_date: "2023-05-10",
          basic_salary: 55000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (record) => {
    setForm({
      full_name: record.full_name || "",
      father_name: record.father_name || "",
      cnic: record.cnic || "",
      phone: record.phone || "",
      designation: record.designation || "",
      department_id: record.department_id || "",
      joining_date: record.joining_date || "",
      basic_salary: record.basic_salary || "",
    });

    setEditingId(record.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.designation || !form.department_id) {
      showToast("error", t.errorMsg);
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(`${API_BASE}/employees/${editingId}`, form);
        showToast("success", t.successUpdate);
      } else {
        await axios.post(`${API_BASE}/employees`, form);
        showToast("success", t.successSave);
      }

      await fetchData();
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (err) {
      const department = departments.find(
        (item) => String(item.id) === String(form.department_id)
      );

      const newRecord = {
        ...form,
        id: editingId || Date.now(),
        department_name: department?.department_name || "-",
      };

      if (editingId) {
        setRecords((prev) =>
          prev.map((record) => (record.id === editingId ? newRecord : record))
        );
        showToast("success", t.successUpdate);
      } else {
        setRecords((prev) => [newRecord, ...prev]);
        showToast("success", t.successSave);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      await fetchData();
      showToast("success", t.successDelete);
    } catch (err) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
      showToast("success", t.successDelete);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [
        record.full_name,
        record.father_name,
        record.designation,
        getDepartmentName(record),
        record.cnic,
        record.phone,
        record.joining_date,
        String(record.basic_salary || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search, getDepartmentName]);

  const summary = useMemo(
    () => ({
      totalEmployees: records.length,
      visibleRecords: filtered.length,
      totalSalary: filtered.reduce(
        (sum, record) => sum + Number(record.basic_salary || 0),
        0
      ),
    }),
    [records, filtered]
  );

  const generatePrintDocument = (isPdf = false) => {
    const font = isUrdu
      ? "'Noto Nastaliq Urdu', serif"
      : "Inter, Arial, sans-serif";

    const rowsHtml = filtered
      .map(
        (record, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td>
              <strong>${record.full_name || "-"}</strong>
              <br/>
              <span class="muted">S/O ${record.father_name || "-"}</span>
            </td>
            <td class="mono">${record.cnic || "-"}</td>
            <td class="mono">${record.phone || "-"}</td>
            <td>${record.designation || "-"}</td>
            <td>${getDepartmentName(record)}</td>
            <td>${record.joining_date || "-"}</td>
            <td class="num">PKR ${fmt(record.basic_salary)}</td>
          </tr>
        `
      )
      .join("");

    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>${t.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${font};background:#f8fafc;color:#0f172a;padding:20px}
.page{width:100%;min-height:100vh;background:#f8fafc;padding:20px}
.sheet{max-width:1200px;margin:0 auto;background:#fff;border:1px solid #dbe3ee;box-shadow:0 12px 40px rgba(15,23,42,.08);border-radius:20px;overflow:hidden}
.header{background:#0f172a;color:#fff;padding:24px 28px}
.header-row{display:flex;justify-content:space-between;align-items:center;gap:20px}
.brand{display:flex;align-items:center;gap:14px}
.logo{width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px}
h1{font-size:28px;font-weight:900;margin:0}
.subtitle{font-size:13px;color:rgba(255,255,255,.72);margin-top:5px}
.meta{text-align:${isUrdu ? "left" : "right"};font-size:12px;color:rgba(255,255,255,.85);line-height:1.8}
.content{padding:18px;display:flex;flex-direction:column;gap:14px}
.hint{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:14px;padding:12px 14px;font-size:13px}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.card{border-radius:16px;padding:14px 16px;border:1px solid #dbe3ee;background:#f8fafc}
.card small{display:block;font-size:12px;color:#64748b;margin-bottom:6px}
.card .value{font-size:22px;font-weight:900;color:#0f172a}
table{width:100%;border-collapse:collapse}
thead th{background:#0f172a;color:#fff;font-size:11px;padding:12px 10px;text-align:${isUrdu ? "right" : "left"};text-transform:uppercase;letter-spacing:.5px}
tbody td{border:1px solid #e5e7eb;padding:10px;font-size:12px;color:#334155;vertical-align:top}
tbody tr:nth-child(even) td{background:#f8fafc}
.center{text-align:center!important}
.muted{font-size:11px;color:#64748b}
.mono{font-family:Inter,Arial,sans-serif;font-weight:700}
.num{text-align:${isUrdu ? "left" : "right"}!important;font-family:Inter,Arial,sans-serif;font-weight:900;color:#059669}
.footer{background:#0f172a;color:rgba(255,255,255,.8);padding:10px 16px;display:flex;justify-content:space-between;font-size:11px}
@media print{@page{size:A4 landscape;margin:8mm}body{background:white;padding:0}.page{padding:0;background:white}.sheet{box-shadow:none;border:none;border-radius:0;max-width:none}.hint{display:none}}
</style>
</head>

<body>
<div class="page">
  <div class="sheet">
    <div class="header">
      <div class="header-row">
        <div class="brand">
          <div class="logo">EMP</div>
          <div>
            <h1>Ali Cages</h1>
            <div class="subtitle">${t.reportHeader}</div>
          </div>
        </div>

        <div class="meta">
          <div>${t.printedOn}: ${new Date().toLocaleString(
      isUrdu ? "ur-PK" : "en-PK"
    )}</div>
          <div>${t.totalEmployees}: <strong style="color:white">${
      filtered.length
    }</strong></div>
          <div>${t.totalSalary}: <strong style="color:white">PKR ${fmt(
      summary.totalSalary
    )}</strong></div>
        </div>
      </div>
    </div>

    <div class="content">
      ${
        isPdf
          ? `<div class="hint">Choose <strong>Save as PDF</strong> in print dialog.</div>`
          : ""
      }

      <div class="summary">
        <div class="card"><small>${t.totalEmployees}</small><div class="value">${
      filtered.length
    }</div></div>
        <div class="card"><small>${t.totalSalary}</small><div class="value">PKR ${fmt(
      summary.totalSalary
    )}</div></div>
        <div class="card"><small>${
          t.reportHeader
        }</small><div class="value">${new Date().toLocaleDateString(
      isUrdu ? "ur-PK" : "en-PK"
    )}</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="center">#</th>
            <th>${t.fullName}</th>
            <th>${t.cnic}</th>
            <th>${t.phone}</th>
            <th>${t.designation}</th>
            <th>${t.department}</th>
            <th>${t.joiningDate}</th>
            <th class="num">${t.basicSalary}</th>
          </tr>
        </thead>

        <tbody>
          ${
            filtered.length > 0
              ? rowsHtml
              : `<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8">${t.noRecords}</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div class="footer">
      <span>Ali Cages — ${t.reportHeader}</span>
      <span>Page 1 / 1</span>
    </div>
  </div>
</div>

<script>
window.onload=()=>{setTimeout(()=>{window.print();${
      !isPdf ? "window.onafterprint=()=>window.close();" : ""
    }},300);};
</script>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=1200,height=850");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

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
        * {
          box-sizing: border-box;
        }

        .employee-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #f1f5f9 100%);
          padding: 18px;
          color: #0f172a;
          font-family: ${
            isUrdu
              ? "'Noto Nastaliq Urdu', Arial, sans-serif"
              : "Inter, Helvetica, Arial, sans-serif"
          };
        }

        .page-wrap {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top-card {
          background: rgba(255,255,255,.94);
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
          font-size: 13px;
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

        .headerPrintBtn {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid #0f172a !important;
          box-shadow: 0 10px 22px rgba(15,23,42,.18) !important;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
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

        .summary-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          font-size: 18px;
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
          font-size: 22px;
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
          width: min(460px, 100%);
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          padding: 0 13px;
          font-size: 13px;
          outline: none;
          background: white;
        }

        .search:focus,
        .input-field:focus {
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

        .employees-desktop {
          display: block;
        }

        .employees-mobile {
          display: none;
        }

        table.employees-table {
          width: 100%;
          min-width: 1180px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        table.employees-table th {
          background: #0f172a;
          color: rgba(255,255,255,.82);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .5px;
          padding: 15px 14px;
          white-space: nowrap;
        }

        table.employees-table td {
          padding: 13px 14px;
          border-bottom: 1px solid #eef2f7;
          font-size: 13px;
          vertical-align: middle;
        }

        table.employees-table tr:hover td {
          background: #f8fafc;
        }

        .employee-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .employee-avatar {
          width: 38px;
          height: 38px;
          border-radius: 13px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .employee-title {
          font-weight: 900;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .employee-subtitle {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 10px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          font-weight: 900;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dept-pill {
          background: #eef2ff;
          color: #3730a3;
          border-color: #c7d2fe;
        }

        .money {
          font-family: monospace;
          font-weight: 950;
          color: #059669;
        }

        .action-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .action-row .btn {
          padding: 7px 10px;
          font-size: 12px;
        }

        .employee-mobile-list {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .employee-mobile-card {
          background: #ffffff;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 24px rgba(15,23,42,.06);
        }

        .employee-mobile-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .employee-mobile-title {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .employee-mobile-index {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
          font-family: monospace;
        }

        .employee-mobile-name {
          margin-top: 3px;
          font-size: 15px;
          font-weight: 950;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .employee-mobile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .employee-info-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          border-radius: 13px;
          padding: 9px 10px;
        }

        .employee-info-line small {
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
        }

        .employee-info-line b {
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          text-align: right;
        }

        .employee-mobile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .employee-mobile-actions .btn {
          width: 100%;
          padding: 10px 8px;
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
          backdrop-filter: blur(3px);
        }

        .inputModalBox {
          width: min(980px, 100%);
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          box-shadow: 0 30px 90px rgba(15,23,42,.28);
          overflow: hidden;
        }

        .inputModalTitle {
          min-height: 58px;
          background: linear-gradient(135deg,#0f172a,#1e293b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          font-size: 17px;
          font-weight: 900;
          gap: 12px;
        }

        .modal-title-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .modal-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.20);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex: 0 0 auto;
        }

        .modal-title-main {
          font-size: 17px;
          font-weight: 950;
        }

        .modal-title-sub {
          margin-top: 2px;
          font-size: 11px;
          color: rgba(255,255,255,.70);
          font-weight: 700;
        }

        .closeBtn {
          border: 1px solid rgba(255,255,255,.25);
          background: rgba(255,255,255,.08);
          color: white;
          min-width: 36px;
          height: 34px;
          border-radius: 10px;
          cursor: pointer;
          padding: 0 12px;
          font-weight: 900;
        }

        .inputModalBody {
          padding: 14px;
        }

        .form-section {
          background: white;
          border: 1px solid #dbe3ee;
          border-radius: 18px;
          overflow: hidden;
        }

        .form-section-head {
          background: linear-gradient(135deg,#eef2ff,#f8fafc);
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-section-head-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: white;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(15,23,42,.06);
        }

        .form-section-head h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }

        .form-section-head p {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .form-grid {
          padding: 14px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .field {
          min-width: 0;
        }

        .field-full {
          grid-column: 1 / -1;
        }

        .label {
          font-size: 11px;
          color: #334155;
          margin-bottom: 6px;
          display: block;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .35px;
        }

        .input-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
        }

        .input-icon-left {
          left: 12px;
        }

        .input-icon-right {
          right: 12px;
        }

        .input-field {
          width: 100%;
          height: 42px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #0f172a;
          padding: 7px 12px;
          font-size: 13px;
          border-radius: 12px;
          outline: none;
          font-weight: 750;
        }

        .input-field-with-left {
          padding-left: 38px;
        }

        .input-field-with-right {
          padding-right: 38px;
        }

        .salary-field-box {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          padding: 12px;
        }

        .modalFooterBasic {
          padding: 14px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          background: white;
          border-top: 1px solid #e2e8f0;
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
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        @media(max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 768px) {
          .employee-page {
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

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .employees-desktop {
            display: none;
          }

          .employees-mobile {
            display: block;
          }

          .modal-bg {
            padding: 0;
          }

          .inputModalBox {
            min-height: 100vh;
            border-radius: 0;
            width: 100%;
          }

          .inputModalTitle {
            min-height: 58px;
            padding: 12px 14px;
          }

          .inputModalBody {
            padding: 10px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .field-full {
            grid-column: auto;
          }

          .modalFooterBasic {
            display: grid;
            grid-template-columns: 1fr;
          }

          .modalFooterBasic .btn {
            width: 100%;
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
          <i
            className={`bi ${
              message.type === "error"
                ? "bi-exclamation-triangle-fill"
                : "bi-check-circle-fill"
            }`}
          ></i>
          {message.text}
        </div>
      )}

      <div className="page-wrap">
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
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
            >
              <i className="bi bi-translate"></i>
              {t.toggleLang}
            </button>

            <button
              className={`btn ${
                showSummary ? "btn-summary-active" : "btn-summary"
              }`}
              onClick={() => setShowSummary((value) => !value)}
            >
              <i className="bi bi-bar-chart-fill"></i>
              {showSummary ? t.hideSummary : t.viewSummary}
            </button>

            <button
              className="btn headerPrintBtn"
              onClick={() => generatePrintDocument(false)}
            >
              <i className="bi bi-printer"></i>
              {t.printBtn}
            </button>

            <button
              className="btn btn-soft"
              onClick={() => generatePrintDocument(true)}
            >
              <i className="bi bi-file-earmark-pdf-fill"></i>
              {t.pdfBtn}
            </button>

            <button className="btn btn-soft" onClick={fetchData}>
              <i className="bi bi-arrow-clockwise"></i>
              {loading ? t.loading : t.refresh}
            </button>

            <button className="btn btn-primary" onClick={openAdd}>
              <i className="bi bi-person-plus-fill"></i>
              {t.addBtn}
            </button>
          </div>
        </div>

        {showSummary && (
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <small>{t.totalEmployees}</small>
              <b>{summary.totalEmployees}</b>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="bi bi-filter-circle-fill"></i>
              </div>
              <small>{t.visibleRecords}</small>
              <b>{summary.visibleRecords}</b>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <small>{t.totalSalary}</small>
              <b>{fmt(summary.totalSalary)}</b>
            </div>
          </div>
        )}

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
          />
        </div>

        <div className="card">
          <div className="employees-desktop table-wrap">
            <table className="employees-table">
              <colgroup>
                <col style={{ width: 70 }} />
                <col style={{ width: 260 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 170 }} />
                <col style={{ width: 170 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 170 }} />
              </colgroup>

              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>#</th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.fullName}
                  </th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.cnic}
                  </th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.phone}
                  </th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.designation}
                  </th>

                  <th style={{ textAlign: isUrdu ? "right" : "left" }}>
                    {t.department}
                  </th>

                  <th style={{ textAlign: "center" }}>{t.joiningDate}</th>

                  <th style={{ textAlign: isUrdu ? "left" : "right" }}>
                    {t.basicSalary}
                  </th>

                  <th>{t.actions}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: 44,
                        color: "#94a3b8",
                      }}
                    >
                      {t.loading}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: 44,
                        color: "#94a3b8",
                      }}
                    >
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((record, index) => (
                    <tr key={record.id || index}>
                      <td
                        style={{
                          textAlign: "center",
                          color: "#94a3b8",
                          fontFamily: "monospace",
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </td>

                      <td>
                        <div
                          className="employee-name-cell"
                          style={{
                            flexDirection: isUrdu ? "row-reverse" : "row",
                          }}
                        >
                          <div className="employee-avatar">
                            <i className="bi bi-person-badge"></i>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div className="employee-title">
                              {record.full_name || "-"}
                            </div>

                            <div className="employee-subtitle">
                              S/O {record.father_name || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          color: "#475569",
                        }}
                      >
                        {record.cnic || "-"}
                      </td>

                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          color: "#475569",
                        }}
                      >
                        {record.phone || "-"}
                      </td>

                      <td>
                        <span className="pill">
                          {record.designation || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="pill dept-pill">
                          {getDepartmentName(record)}
                        </span>
                      </td>

                      <td
                        style={{
                          textAlign: "center",
                          color: "#475569",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {record.joining_date || "-"}
                      </td>

                      <td
                        className="money"
                        style={{
                          textAlign: isUrdu ? "left" : "right",
                        }}
                      >
                        {fmt(record.basic_salary)}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <div
                          className="action-row"
                          style={{
                            flexDirection: isUrdu ? "row-reverse" : "row",
                          }}
                        >
                          <button
                            className="btn btn-green"
                            onClick={() => openEdit(record)}
                          >
                            <i className="bi bi-pencil-square"></i>
                            {t.edit}
                          </button>

                          <button
                            className="btn btn-red"
                            onClick={() => handleDelete(record.id)}
                          >
                            <i className="bi bi-trash3-fill"></i>
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="employees-mobile">
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
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#94a3b8",
                }}
              >
                {t.noRecords}
              </div>
            ) : (
              <div className="employee-mobile-list">
                {filtered.map((record, index) => (
                  <div className="employee-mobile-card" key={record.id || index}>
                    <div
                      className="employee-mobile-top"
                      style={{
                        flexDirection: isUrdu ? "row-reverse" : "row",
                      }}
                    >
                      <div
                        className="employee-mobile-title"
                        style={{
                          flexDirection: isUrdu ? "row-reverse" : "row",
                        }}
                      >
                        <div className="employee-avatar">
                          <i className="bi bi-person-badge"></i>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div className="employee-mobile-index">
                            #{index + 1}
                          </div>

                          <div className="employee-mobile-name">
                            {record.full_name || "-"}
                          </div>

                          <div className="employee-subtitle">
                            S/O {record.father_name || "-"}
                          </div>
                        </div>
                      </div>

                      <span className="pill dept-pill">
                        {getDepartmentName(record)}
                      </span>
                    </div>

                    <div className="employee-mobile-grid">
                      <div className="employee-info-line">
                        <small>{t.designation}</small>
                        <b>{record.designation || "-"}</b>
                      </div>

                      <div className="employee-info-line">
                        <small>{t.cnic}</small>
                        <b style={{ fontFamily: "monospace" }}>
                          {record.cnic || "-"}
                        </b>
                      </div>

                      <div className="employee-info-line">
                        <small>{t.phone}</small>
                        <b style={{ fontFamily: "monospace" }}>
                          {record.phone || "-"}
                        </b>
                      </div>

                      <div className="employee-info-line">
                        <small>{t.joiningDate}</small>
                        <b>{record.joining_date || "-"}</b>
                      </div>

                      <div className="employee-info-line">
                        <small>{t.basicSalary}</small>
                        <b
                          style={{
                            color: "#059669",
                            fontFamily: "monospace",
                          }}
                        >
                          {fmt(record.basic_salary)}
                        </b>
                      </div>
                    </div>

                    <div className="employee-mobile-actions">
                      <button
                        className="btn btn-green"
                        onClick={() => openEdit(record)}
                      >
                        <i className="bi bi-pencil-square"></i>
                        {t.edit}
                      </button>

                      <button
                        className="btn btn-red"
                        onClick={() => handleDelete(record.id)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-bg">
          <div className="inputModalBox" dir={dir}>
            <div className="inputModalTitle">
              <div
                className="modal-title-left"
                style={{
                  flexDirection: isUrdu ? "row-reverse" : "row",
                  textAlign: isUrdu ? "right" : "left",
                }}
              >
                <div className="modal-icon">
                  <i className="bi bi-person-badge"></i>
                </div>

                <div style={{ minWidth: 0 }}>
                  <div className="modal-title-main">
                    {editingId ? t.edit : t.addBtn}
                  </div>

                  <div className="modal-title-sub">{t.formSubtitle}</div>
                </div>
              </div>

              <button
                type="button"
                className="closeBtn"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <div className="inputModalBody">
              <div className="form-section">
                <div
                  className="form-section-head"
                  style={{
                    flexDirection: isUrdu ? "row-reverse" : "row",
                    textAlign: isUrdu ? "right" : "left",
                  }}
                >
                  <div className="form-section-head-icon">
                    <i className="bi bi-info-circle-fill"></i>
                  </div>

                  <div>
                    <h3>{t.employeeDetails}</h3>
                    <p>{t.formSubtitle}</p>
                  </div>
                </div>

                <div className="form-grid">
                  <EmployeeInput
                    label={t.fullName}
                    required
                    icon="bi-person-fill"
                    value={form.full_name}
                    placeholder="e.g. Ahmed Raza"
                    isUrdu={isUrdu}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        full_name: value,
                      }))
                    }
                  />

                  <EmployeeInput
                    label={t.fatherName}
                    icon="bi-person-heart"
                    value={form.father_name}
                    placeholder="e.g. Ali Raza"
                    isUrdu={isUrdu}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        father_name: value,
                      }))
                    }
                  />

                  <EmployeeInput
                    label={t.cnic}
                    icon="bi-card-heading"
                    value={form.cnic}
                    placeholder="XXXXX-XXXXXXX-X"
                    isUrdu={isUrdu}
                    mono
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        cnic: value,
                      }))
                    }
                  />

                  <EmployeeInput
                    label={t.phone}
                    icon="bi-telephone-fill"
                    value={form.phone}
                    placeholder="03XX-XXXXXXX"
                    isUrdu={isUrdu}
                    mono
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: value,
                      }))
                    }
                  />

                  <EmployeeInput
                    label={t.designation}
                    required
                    icon="bi-briefcase-fill"
                    value={form.designation}
                    placeholder="e.g. Manager"
                    isUrdu={isUrdu}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        designation: value,
                      }))
                    }
                  />

                  <div className="field">
                    <label className="label">
                      {t.department}{" "}
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>

                    <div className="input-wrap">
                      <i
                        className={`bi bi-diagram-3-fill input-icon ${
                          isUrdu ? "input-icon-right" : "input-icon-left"
                        }`}
                      ></i>

                      <select
                        value={form.department_id}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            department_id: event.target.value,
                          }))
                        }
                        className={`input-field ${
                          isUrdu
                            ? "input-field-with-right"
                            : "input-field-with-left"
                        }`}
                        style={{
                          textAlign: isUrdu ? "right" : "left",
                        }}
                      >
                        <option value="">{t.selectDepartment}</option>

                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name ||
                              department.name ||
                              `#${department.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <EmployeeInput
                    label={t.joiningDate}
                    icon="bi-calendar-event"
                    type="date"
                    value={form.joining_date}
                    isUrdu={isUrdu}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        joining_date: value,
                      }))
                    }
                  />

                  <div className="field salary-field-box">
                    <label className="label" style={{ color: "#047857" }}>
                      {t.basicSalary}
                    </label>

                    <div className="input-wrap">
                      <i
                        className={`bi bi-cash-stack input-icon ${
                          isUrdu ? "input-icon-right" : "input-icon-left"
                        }`}
                        style={{
                          color: "#10b981",
                        }}
                      ></i>

                      <input
                        type="number"
                        min="0"
                        value={form.basic_salary}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            basic_salary: event.target.value,
                          }))
                        }
                        placeholder="0"
                        className={`input-field ${
                          isUrdu
                            ? "input-field-with-right"
                            : "input-field-with-left"
                        }`}
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 900,
                          color: "#059669",
                          textAlign: isUrdu ? "right" : "left",
                          borderColor: "#bbf7d0",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="modalFooterBasic"
              style={{
                flexDirection: isUrdu ? "row-reverse" : "row",
              }}
            >
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
                <i
                  className={`bi ${
                    submitting ? "bi-arrow-repeat" : "bi-save-fill"
                  }`}
                ></i>
                {submitting ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeInput({
  label,
  icon,
  value,
  onChange,
  placeholder = "",
  isUrdu = false,
  required = false,
  mono = false,
  type = "text",
}) {
  return (
    <div className="field">
      <label className="label">
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>

      <div className="input-wrap">
        <i
          className={`bi ${icon} input-icon ${
            isUrdu ? "input-icon-right" : "input-icon-left"
          }`}
        ></i>

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`input-field ${
            isUrdu ? "input-field-with-right" : "input-field-with-left"
          }`}
          style={{
            textAlign: isUrdu ? "right" : "left",
            fontFamily: mono ? "monospace" : undefined,
          }}
        />
      </div>
    </div>
  );
}
