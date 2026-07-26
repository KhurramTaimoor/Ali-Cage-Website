import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const EMPLOYEES_API = `${API_ROOT}/api/employees`;
const DEPARTMENTS_API = `${API_ROOT}/api/departments`;
const DESIGNATIONS_API = `${API_ROOT}/api/designations`;

const LANG = {
  en: {
    title: "Employee Registration",
    subtitle: "Manage salaried and contractor employees, departments and designations",
    newEmployee: "New Employee",
    viewSummary: "View Summary",
    hideSummary: "Hide Summary",
    printList: "Print List",
    downloadPdf: "Download PDF",
    refresh: "Refresh",
    toggleLang: "اردو",
    searchPlaceholder: "Search employee, CNIC, phone, type, department or designation...",
    employee: "Employee",
    employeeName: "Employee Name",
    cnic: "CNIC",
    cnicOptional: "CNIC (Optional)",
    phone: "Phone Number",
    employeeType: "Employee Type",
    salaried: "Salaried",
    contractor: "Contractor",
    department: "Department",
    designation: "Designation",
    joiningDate: "Joining Date",
    basicSalary: "Basic Salary / Rate",
    viewDetails: "View Details",
    selectType: "-- Select Type --",
    selectDepartment: "-- Select Department --",
    selectDesignation: "-- Select Designation --",
    addDepartment: "Add Department",
    addDesignation: "Add Designation",
    departmentName: "Department Name",
    designationName: "Designation Name",
    totalEmployees: "Total Employees",
    salariedEmployees: "Salaried Employees",
    contractorEmployees: "Contractors",
    totalSalary: "Total Salary / Rate",
    employeeDetails: "Employee Details",
    addEmployeeTitle: "New Employee",
    editEmployeeTitle: "Edit Employee",
    employeeFormSubtitle: "Enter employee identity, employment type and job information",
    addMasterTitle: "Add New Option",
    save: "Save",
    saveEmployee: "Save Employee",
    updateEmployee: "Update Employee",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading employees...",
    noRecords: "No employees found.",
    noDepartments: "No departments found.",
    noDesignations: "No designations found.",
    loadError: "Employee master data could not be loaded.",
    employeeRequired: "Employee name, phone, type, department and designation are required.",
    salaryRequired: "Basic salary is required for a salaried employee.",
    masterRequired: "Name is required.",
    saveError: "Employee could not be saved.",
    masterSaveError: "New option could not be saved.",
    deleteError: "Employee could not be deleted.",
    employeeSaved: "Employee saved successfully.",
    employeeUpdated: "Employee updated successfully.",
    employeeDeleted: "Employee deleted successfully.",
    departmentSaved: "Department added successfully.",
    designationSaved: "Designation added successfully.",
    duplicateCnic: "An employee with this CNIC already exists.",
    duplicatePhone: "An employee with this phone number already exists.",
    duplicateMaster: "This option already exists.",
    deleteConfirm: "Are you sure you want to delete this employee?",
    reportTitle: "Employee List",
    printedOn: "Printed On",
  },
  ur: {
    title: "ملازمین کی رجسٹریشن",
    subtitle: "تنخواہ دار اور کنٹریکٹر ملازمین، محکموں اور عہدوں کا انتظام کریں",
    newEmployee: "نیا ملازم",
    viewSummary: "سمری دیکھیں",
    hideSummary: "سمری بند کریں",
    printList: "فہرست پرنٹ کریں",
    downloadPdf: "پی ڈی ایف ڈاؤنلوڈ",
    refresh: "ری فریش",
    toggleLang: "English",
    searchPlaceholder: "ملازم، شناختی کارڈ، فون، قسم، محکمہ یا عہدے سے تلاش کریں...",
    employee: "ملازم",
    employeeName: "ملازم کا نام",
    cnic: "شناختی کارڈ",
    cnicOptional: "شناختی کارڈ (اختیاری)",
    phone: "فون نمبر",
    employeeType: "ملازم کی قسم",
    salaried: "تنخواہ دار",
    contractor: "کنٹریکٹر",
    department: "محکمہ",
    designation: "عہدہ",
    joiningDate: "تاریخ شمولیت",
    basicSalary: "بنیادی تنخواہ / ریٹ",
    viewDetails: "تفصیل دیکھیں",
    selectType: "-- قسم منتخب کریں --",
    selectDepartment: "-- محکمہ منتخب کریں --",
    selectDesignation: "-- عہدہ منتخب کریں --",
    addDepartment: "محکمہ شامل کریں",
    addDesignation: "عہدہ شامل کریں",
    departmentName: "محکمے کا نام",
    designationName: "عہدے کا نام",
    totalEmployees: "کل ملازمین",
    salariedEmployees: "تنخواہ دار ملازمین",
    contractorEmployees: "کنٹریکٹر",
    totalSalary: "کل تنخواہ / ریٹ",
    employeeDetails: "ملازم کی تفصیل",
    addEmployeeTitle: "نیا ملازم",
    editEmployeeTitle: "ملازم میں ترمیم",
    employeeFormSubtitle: "ملازم کی شناخت، ملازمت کی قسم اور جاب کی معلومات درج کریں",
    addMasterTitle: "نیا آپشن شامل کریں",
    save: "محفوظ کریں",
    saveEmployee: "ملازم محفوظ کریں",
    updateEmployee: "ملازم اپڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    close: "بند کریں",
    edit: "ترمیم",
    delete: "حذف",
    loading: "ملازمین لوڈ ہو رہے ہیں...",
    noRecords: "کوئی ملازم نہیں ملا۔",
    noDepartments: "کوئی محکمہ نہیں ملا۔",
    noDesignations: "کوئی عہدہ نہیں ملا۔",
    loadError: "ملازمین کا ماسٹر ڈیٹا لوڈ نہیں ہوا۔",
    employeeRequired: "ملازم کا نام، فون، قسم، محکمہ اور عہدہ ضروری ہیں۔",
    salaryRequired: "تنخواہ دار ملازم کے لیے بنیادی تنخواہ ضروری ہے۔",
    masterRequired: "نام درج کرنا ضروری ہے۔",
    saveError: "ملازم محفوظ نہیں ہوا۔",
    masterSaveError: "نیا آپشن محفوظ نہیں ہوا۔",
    deleteError: "ملازم حذف نہیں ہوا۔",
    employeeSaved: "ملازم کامیابی سے محفوظ ہو گیا۔",
    employeeUpdated: "ملازم کامیابی سے اپڈیٹ ہو گیا۔",
    employeeDeleted: "ملازم کامیابی سے حذف ہو گیا۔",
    departmentSaved: "محکمہ کامیابی سے شامل ہو گیا۔",
    designationSaved: "عہدہ کامیابی سے شامل ہو گیا۔",
    duplicateCnic: "اس شناختی کارڈ کے ساتھ ملازم پہلے سے موجود ہے۔",
    duplicatePhone: "اس فون نمبر کے ساتھ ملازم پہلے سے موجود ہے۔",
    duplicateMaster: "یہ آپشن پہلے سے موجود ہے۔",
    deleteConfirm: "کیا آپ واقعی اس ملازم کو حذف کرنا چاہتے ہیں؟",
    reportTitle: "ملازمین کی فہرست",
    printedOn: "پرنٹ کی تاریخ",
  },
};

const emptyForm = () => ({
  full_name: "",
  cnic: "",
  phone: "",
  employee_type: "",
  department_id: "",
  designation_id: "",
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
  if (Array.isArray(value?.designations)) return value.designations;
  return [];
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : "");
const employeeId = (row) => row?.id ?? row?.employee_id ?? "";
const departmentId = (row) => row?.id ?? row?.department_id ?? "";
const departmentName = (row) => row?.department_name ?? row?.name ?? "";
const designationId = (row) => row?.id ?? row?.designation_id ?? "";
const designationName = (row) => row?.designation_name ?? row?.designation ?? row?.name ?? "";
const employeeType = (value) =>
  String(value || "").toLowerCase() === "contractor" ? "Contractor" : "Salaried";

const Button = ({ children, className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function EmployeePage() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailRecord, setDetailRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [master, setMaster] = useState({ open: false, type: "", name: "" });
  const [masterSubmitting, setMasterSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const departmentMap = useMemo(
    () => Object.fromEntries(departments.map((row) => [String(departmentId(row)), departmentName(row)])),
    [departments]
  );
  const designationMap = useMemo(
    () => Object.fromEntries(designations.map((row) => [String(designationId(row)), designationName(row)])),
    [designations]
  );

  const rowDepartment = useCallback(
    (row) => row?.department_name || departmentMap[String(row?.department_id)] || "-",
    [departmentMap]
  );
  const rowDesignation = useCallback(
    (row) =>
      row?.designation_name || row?.designation || designationMap[String(row?.designation_id)] || "-",
    [designationMap]
  );

  const toast = useCallback((type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 3200);
  }, []);

  const fetchMasterData = useCallback(async () => {
    const [employeeRes, departmentRes, designationRes] = await Promise.all([
      axios.get(EMPLOYEES_API),
      axios.get(DEPARTMENTS_API),
      axios.get(DESIGNATIONS_API),
    ]);
    setEmployees(getList(employeeRes.data));
    setDepartments(getList(departmentRes.data));
    setDesignations(getList(designationRes.data));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchMasterData();
    } catch (error) {
      console.error("Employee master load error:", error);
      setEmployees([]);
      setDepartments([]);
      setDesignations([]);
      toast("error", error?.response?.data?.message || error?.response?.data?.error || t.loadError);
    } finally {
      setLoading(false);
    }
  }, [fetchMasterData, t.loadError, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(employeeId(row));
    setForm({
      full_name: row?.full_name || "",
      cnic: row?.cnic || "",
      phone: row?.phone || "",
      employee_type: employeeType(row?.employee_type),
      department_id: String(row?.department_id || ""),
      designation_id: String(row?.designation_id || ""),
      joining_date: normalizeDate(row?.joining_date),
      basic_salary: String(row?.basic_salary ?? ""),
    });
    setShowDetails(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const payload = () => ({
    full_name: form.full_name.trim(),
    cnic: form.cnic.trim() || null,
    phone: form.phone.trim(),
    employee_type: form.employee_type,
    department_id: Number(form.department_id),
    designation_id: Number(form.designation_id),
    joining_date: form.joining_date || null,
    basic_salary: toNumber(form.basic_salary),
  });

  const saveEmployee = async () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.employee_type || !form.department_id || !form.designation_id) {
      toast("error", t.employeeRequired);
      return;
    }
    if (form.employee_type === "Salaried" && toNumber(form.basic_salary) <= 0) {
      toast("error", t.salaryRequired);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${EMPLOYEES_API}/${editingId}`, payload());
        toast("success", t.employeeUpdated);
      } else {
        await axios.post(EMPLOYEES_API, payload());
        toast("success", t.employeeSaved);
      }
      closeForm();
      await fetchMasterData();
    } catch (error) {
      const code = error?.response?.data?.code;
      let text = error?.response?.data?.message || error?.response?.data?.error || t.saveError;
      if (code === "DUPLICATE_CNIC") text = t.duplicateCnic;
      if (code === "DUPLICATE_PHONE") text = t.duplicatePhone;
      toast("error", text);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await axios.delete(`${EMPLOYEES_API}/${id}`);
      setShowDetails(false);
      setDetailRecord(null);
      await fetchMasterData();
      toast("success", t.employeeDeleted);
    } catch (error) {
      toast("error", error?.response?.data?.message || error?.response?.data?.error || t.deleteError);
    }
  };

  const openMaster = (type) => setMaster({ open: true, type, name: "" });
  const closeMaster = () => {
    if (!masterSubmitting) setMaster({ open: false, type: "", name: "" });
  };

  const saveMaster = async () => {
    const name = master.name.trim();
    if (!name) {
      toast("error", t.masterRequired);
      return;
    }

    setMasterSubmitting(true);
    try {
      if (master.type === "department") {
        const response = await axios.post(DEPARTMENTS_API, {
          department_name: name,
          head_of_dept: null,
          extension_no: null,
        });
        await fetchMasterData();
        if (response?.data?.id) update("department_id", String(response.data.id));
        toast("success", t.departmentSaved);
      } else {
        const response = await axios.post(DESIGNATIONS_API, { designation_name: name });
        await fetchMasterData();
        if (response?.data?.id) update("designation_id", String(response.data.id));
        toast("success", t.designationSaved);
      }
      closeMaster();
    } catch (error) {
      const duplicate = error?.response?.status === 409 || error?.response?.data?.code === "ER_DUP_ENTRY";
      toast("error", duplicate ? t.duplicateMaster : error?.response?.data?.message || t.masterSaveError);
    } finally {
      setMasterSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((row) =>
      [
        row?.full_name,
        row?.cnic,
        row?.phone,
        row?.employee_type,
        rowDepartment(row),
        rowDesignation(row),
        row?.joining_date,
        row?.basic_salary,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [employees, rowDepartment, rowDesignation, search]);

  const summary = useMemo(
    () => ({
      total: employees.length,
      salaried: employees.filter((row) => employeeType(row.employee_type) === "Salaried").length,
      contractors: employees.filter((row) => employeeType(row.employee_type) === "Contractor").length,
      totalSalary: filtered.reduce((sum, row) => sum + toNumber(row.basic_salary), 0),
    }),
    [employees, filtered]
  );

  const printDocument = (saveAsPdf = false) => {
    const rows = filtered
      .map(
        (row, index) => `<tr>
          <td>${index + 1}</td><td>${row.full_name || "-"}</td><td>${row.cnic || "-"}</td>
          <td>${row.phone || "-"}</td><td>${employeeType(row.employee_type)}</td>
          <td>${rowDepartment(row)}</td><td>${rowDesignation(row)}</td>
          <td>${normalizeDate(row.joining_date) || "-"}</td><td>${money(row.basic_salary)}</td>
        </tr>`
      )
      .join("");

    const popup = window.open("", "_blank", "width=1250,height=850");
    if (!popup) return;
    popup.document.write(`<!doctype html><html dir="${dir}"><head><title>${t.reportTitle}</title>
      <style>body{font-family:Arial;padding:20px;color:#0f172a}.head{background:#0f172a;color:white;padding:20px;display:flex;justify-content:space-between}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#0f172a;color:white}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}.hint{background:#eef2ff;padding:10px;text-align:center}@media print{@page{size:A4 landscape;margin:8mm}.hint{display:none}body{padding:0}}</style>
      </head><body>${saveAsPdf ? '<div class="hint">Select <b>Save as PDF</b> in print destination.</div>' : ""}
      <div class="head"><b>Ali Cage — ${t.reportTitle}</b><span>${t.printedOn}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-US")}</span></div>
      <table><thead><tr><th>#</th><th>${t.employeeName}</th><th>${t.cnic}</th><th>${t.phone}</th><th>${t.employeeType}</th><th>${t.department}</th><th>${t.designation}</th><th>${t.joiningDate}</th><th>${t.basicSalary}</th></tr></thead><tbody>${rows || `<tr><td colspan="9">${t.noRecords}</td></tr>`}</tbody></table>
      <script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`);
    popup.document.close();
  };

  const details = detailRecord
    ? [
        [t.employeeName, detailRecord.full_name || "-"],
        [t.cnic, detailRecord.cnic || "-"],
        [t.phone, detailRecord.phone || "-"],
        [t.employeeType, employeeType(detailRecord.employee_type) === "Contractor" ? t.contractor : t.salaried],
        [t.department, rowDepartment(detailRecord)],
        [t.designation, rowDesignation(detailRecord)],
        [t.joiningDate, normalizeDate(detailRecord.joining_date) || "-"],
        [t.basicSalary, money(detailRecord.basic_salary)],
      ]
    : [];

  return (
    <div
      dir={dir}
      className={`min-h-full bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100 p-3 text-slate-900 sm:p-5 ${
        isUrdu ? "[font-family:'Noto_Nastaliq_Urdu',serif]" : "font-sans"
      }`}
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
      {isUrdu && <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />}

      {message.text && (
        <div
          className={`fixed bottom-5 z-[150] max-w-md rounded-xl px-4 py-3 text-sm font-bold text-white shadow-2xl ${
            isUrdu ? "left-5" : "right-5"
          } ${message.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}
        >
          {message.text}
        </div>
      )}

      <div className="mx-auto w-full max-w-[1220px]">
        <section className="rounded-[22px] border border-slate-200 bg-white/95 px-5 py-6 shadow-xl shadow-slate-900/5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{t.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="border border-slate-300 bg-white text-slate-600" onClick={() => setLang(isUrdu ? "en" : "ur")}>
              <i className="bi bi-translate" /> {t.toggleLang}
            </Button>
            <Button className="border border-indigo-200 bg-indigo-50 text-indigo-700" onClick={() => setShowSummary((value) => !value)}>
              <i className="bi bi-bar-chart-fill" /> {showSummary ? t.hideSummary : t.viewSummary}
            </Button>
            <Button className="bg-slate-900 text-white" disabled={!filtered.length} onClick={() => printDocument(false)}>
              <i className="bi bi-printer" /> {t.printList}
            </Button>
            <Button className="border border-slate-300 bg-white text-slate-600" disabled={!filtered.length} onClick={() => printDocument(true)}>
              <i className="bi bi-file-earmark-pdf" /> {t.downloadPdf}
            </Button>
            <Button className="border border-slate-300 bg-white text-slate-600" onClick={fetchData}>
              <i className="bi bi-arrow-clockwise" /> {t.refresh}
            </Button>
            <Button className="bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" onClick={openAdd}>
              <i className="bi bi-person-plus-fill" /> {t.newEmployee}
            </Button>
          </div>
        </section>

        {showSummary && (
          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [t.totalEmployees, summary.total],
              [t.salariedEmployees, summary.salaried],
              [t.contractorEmployees, summary.contractors],
              [t.totalSalary, money(summary.totalSalary)],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-800">{value}</p>
              </article>
            ))}
          </section>
        )}

        <div className="relative my-4 max-w-xl">
          <i className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${isUrdu ? "right-4" : "left-4"}`} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
            className={`h-11 w-full rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
              isUrdu ? "pl-4 pr-11" : "pl-11 pr-4"
            }`}
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[6%]" /><col className="w-[30%]" /><col className="w-[14%]" />
              <col className="w-[18%]" /><col className="w-[18%]" /><col className="w-[14%]" />
            </colgroup>
            <thead className="bg-slate-900 text-white">
              <tr className="text-[9px] font-black uppercase tracking-wide">
                <th className="px-2 py-4 text-center">#</th>
                <th className={`px-2 py-4 ${isUrdu ? "text-right" : "text-left"}`}>{t.employee}</th>
                <th className="px-2 py-4 text-center">{t.employeeType}</th>
                <th className="px-2 py-4 text-center">{t.department}</th>
                <th className="px-2 py-4 text-center">{t.designation}</th>
                <th className="px-2 py-4 text-center">{t.viewDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-slate-400">{t.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-slate-400">{t.noRecords}</td></tr>
              ) : (
                filtered.map((row, index) => {
                  const type = employeeType(row.employee_type);
                  return (
                    <tr key={employeeId(row)} className="hover:bg-indigo-50/40">
                      <td className="px-2 py-4 text-center text-xs text-slate-400">{index + 1}</td>
                      <td className="px-2 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600">
                            {(row.full_name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">{row.full_name || "-"}</p>
                            <p className="truncate text-[10px] font-semibold text-slate-400">{row.phone || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-black ${
                          type === "Contractor"
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}>
                          {type === "Contractor" ? t.contractor : t.salaried}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center"><span className="inline-flex max-w-full truncate rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-700">{rowDepartment(row)}</span></td>
                      <td className="px-2 py-4 text-center"><span className="inline-flex max-w-full truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-600">{rowDesignation(row)}</span></td>
                      <td className="px-2 py-4 text-center">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-[10px] font-black text-indigo-700" onClick={() => { setDetailRecord(row); setShowDetails(true); }}>
                          <i className="bi bi-eye-fill" /><span className="hidden sm:inline">{t.viewDetails}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}>
          <div dir={dir} className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div><h2 className="text-xl font-black">{editingId ? t.editEmployeeTitle : t.addEmployeeTitle}</h2><p className="mt-1 text-xs text-slate-500">{t.employeeFormSubtitle}</p></div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" onClick={closeForm}><i className="bi bi-x-lg" /></button>
            </div>

            <div className="overflow-y-auto bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={`${t.employeeName} *`}><input className="field" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} /></Field>
                <Field label={t.cnicOptional}><input className="field" placeholder="XXXXX-XXXXXXX-X" value={form.cnic} onChange={(e) => update("cnic", e.target.value)} /></Field>
                <Field label={`${t.phone} *`}><input className="field" placeholder="03XX-XXXXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
                <Field label={`${t.employeeType} *`}>
                  <select className="field" value={form.employee_type} onChange={(e) => update("employee_type", e.target.value)}>
                    <option value="">{t.selectType}</option><option value="Salaried">{t.salaried}</option><option value="Contractor">{t.contractor}</option>
                  </select>
                </Field>

                <Field label={`${t.department} *`}>
                  <div className="flex gap-2">
                    <select className="field min-w-0 flex-1" value={form.department_id} onChange={(e) => update("department_id", e.target.value)}>
                      <option value="">{t.selectDepartment}</option>
                      {departments.map((row) => <option key={departmentId(row)} value={departmentId(row)}>{departmentName(row)}</option>)}
                    </select>
                    <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700" title={t.addDepartment} onClick={() => openMaster("department")}><i className="bi bi-plus-lg" /></button>
                  </div>
                  {!loading && departments.length === 0 && <p className="mt-1 text-[10px] text-red-500">{t.noDepartments}</p>}
                </Field>

                <Field label={`${t.designation} *`}>
                  <div className="flex gap-2">
                    <select className="field min-w-0 flex-1" value={form.designation_id} onChange={(e) => update("designation_id", e.target.value)}>
                      <option value="">{t.selectDesignation}</option>
                      {designations.map((row) => <option key={designationId(row)} value={designationId(row)}>{designationName(row)}</option>)}
                    </select>
                    <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700" title={t.addDesignation} onClick={() => openMaster("designation")}><i className="bi bi-plus-lg" /></button>
                  </div>
                  {!loading && designations.length === 0 && <p className="mt-1 text-[10px] text-red-500">{t.noDesignations}</p>}
                </Field>

                <Field label={t.joiningDate}><input type="date" className="field" value={form.joining_date} onChange={(e) => update("joining_date", e.target.value)} /></Field>
                <Field label={`${t.basicSalary}${form.employee_type === "Salaried" ? " *" : ""}`}>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2"><input type="number" min="0" step="0.01" className="field" value={form.basic_salary} onChange={(e) => update("basic_salary", e.target.value)} /></div>
                </Field>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
              <Button className="border border-slate-300 bg-white text-slate-600" disabled={submitting} onClick={closeForm}>{t.cancel}</Button>
              <Button className="bg-indigo-600 text-white" disabled={submitting} onClick={saveEmployee}><i className="bi bi-check2-circle" />{submitting ? t.saving : editingId ? t.updateEmployee : t.saveEmployee}</Button>
            </div>
          </div>
        </div>
      )}

      {showDetails && detailRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setShowDetails(false)}>
          <div dir={dir} className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div><h2 className="text-xl font-black">{t.employeeDetails}</h2><p className="mt-1 text-xs text-slate-500">{detailRecord.full_name}</p></div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" onClick={() => setShowDetails(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="grid gap-3 overflow-y-auto bg-slate-50 p-4 sm:grid-cols-2">
              {details.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-black text-slate-800">{value}</p></div>)}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
              <Button className="border border-slate-300 bg-white text-slate-600" onClick={() => setShowDetails(false)}>{t.close}</Button>
              <Button className="border border-indigo-200 bg-indigo-50 text-indigo-700" onClick={() => openEdit(detailRecord)}><i className="bi bi-pencil-square" />{t.edit}</Button>
              <Button className="bg-red-100 text-red-700" onClick={() => deleteEmployee(employeeId(detailRecord))}><i className="bi bi-trash3" />{t.delete}</Button>
            </div>
          </div>
        </div>
      )}

      {master.open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && closeMaster()}>
          <div dir={dir} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div><h2 className="text-lg font-black">{master.type === "department" ? t.addDepartment : t.addDesignation}</h2><p className="mt-1 text-xs text-slate-500">{t.addMasterTitle}</p></div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" onClick={closeMaster}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="bg-slate-50 p-5">
              <Field label={`${master.type === "department" ? t.departmentName : t.designationName} *`}>
                <input autoFocus className="field" value={master.name} onChange={(e) => setMaster((previous) => ({ ...previous, name: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && saveMaster()} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <Button className="border border-slate-300 bg-white text-slate-600" disabled={masterSubmitting} onClick={closeMaster}>{t.cancel}</Button>
              <Button className="bg-indigo-600 text-white" disabled={masterSubmitting} onClick={saveMaster}>{masterSubmitting ? t.saving : t.save}</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`.field{height:44px;width:100%;border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:0 12px;font-size:13px;outline:none}.field:focus{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.1)}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-bold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
