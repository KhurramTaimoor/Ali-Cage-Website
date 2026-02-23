import React, { useState, useEffect } from "react";
import { Printer, Download, Search } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const EmployeeLedgerPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/employee-ledger/employees")
      .then(r => setEmployees(r.data))
      .catch(() => setEmployees([]));
  }, []);

  const handleEmpChange = (e) => {
    const id = e.target.value;
    setSelectedEmp(id);
    if (!id) { setLedgerData(null); return; }
    setLoading(true);
    axios.get(`http://localhost:5000/api/employee-ledger?employee_id=${id}`)
      .then(r => { setLedgerData(r.data); setLoading(false); })
      .catch(() => { setLedgerData({ employee: {}, records: [], total_paid: 0, total_due: 0 }); setLoading(false); });
  };

  const handlePrint = () => window.print();

  const handlePDF = () => {
    if (!ledgerData) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cage Master - Employee Ledger", 14, 18);
    doc.setFontSize(11);
    doc.text(`Employee: ${ledgerData.employee.name}`, 14, 28);
    doc.text(`Department: ${ledgerData.employee.department || "-"}`, 14, 35);
    doc.autoTable({
      startY: 42,
      head: [["Month", "Year", "Basic Salary", "Allowances", "Deductions", "Net Salary", "Status"]],
      body: ledgerData.records.map(r => [
        r.month, r.year,
        `PKR ${Number(r.basic_salary).toLocaleString()}`,
        `PKR ${Number(r.allowances).toLocaleString()}`,
        `PKR ${Number(r.deductions).toLocaleString()}`,
        `PKR ${Number(r.net_salary).toLocaleString()}`,
        r.status
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 },
    });
    doc.save(`Employee_Ledger_${ledgerData.employee.name}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto print:max-w-none">

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Ledger</h1>
          <p className="text-slate-500 text-sm">Employee ki monthly salary history</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} disabled={!ledgerData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition disabled:opacity-40">
            <Printer size={18} /> Print
          </button>
          <button onClick={handlePDF} disabled={!ledgerData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition disabled:opacity-40">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* Employee Select */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 print:hidden">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Employee Select Karo</label>
        <select value={selectedEmp} onChange={handleEmpChange}
          className="w-full md:w-80 px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm bg-white">
          <option value="">-- Select Employee --</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-3xl font-bold">Cage Master</h1>
        <p className="text-slate-500">Employee Ledger — {ledgerData?.employee?.name}</p>
        <hr className="my-3" />
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {!selectedEmp ? (
          <div className="text-center py-16 text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p>Upar se employee select karo ledger dekhne ke liye</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : ledgerData?.records?.length === 0 ? (
          <div className="text-center py-16 text-slate-400">Is employee ki koi payroll entry nahi mili</div>
        ) : (
          <>
            {/* Employee Info */}
            <div className="px-6 py-4 bg-slate-800 text-white flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{ledgerData?.employee?.name}</p>
                <p className="text-slate-400 text-xs">{ledgerData?.employee?.department}</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Total Paid</p>
                  <p className="text-emerald-400 font-bold">PKR {Number(ledgerData?.total_paid).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Total Due</p>
                  <p className="text-red-400 font-bold">PKR {Number(ledgerData?.total_due).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Month</th>
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-right">Basic Salary</th>
                    <th className="px-4 py-3 text-right text-emerald-600">Allowances</th>
                    <th className="px-4 py-3 text-right text-red-500">Deductions</th>
                    <th className="px-4 py-3 text-right text-blue-700">Net Salary</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData?.records?.map((r, i) => (
                    <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 text-slate-700">{r.month}</td>
                      <td className="px-4 py-3 text-slate-700">{r.year}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">PKR {Number(r.basic_salary).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">PKR {Number(r.allowances).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-500">PKR {Number(r.deductions).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">PKR {Number(r.net_salary).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeLedgerPage;


