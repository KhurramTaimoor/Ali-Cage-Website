import React, { useState, useEffect } from "react";
import { Printer, Download, Search } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const HRReportPage = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/hr-reports/summary")
      .then(r => { setData(r.data); setFiltered(r.data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(data.filter(r =>
      (r.full_name || "").toLowerCase().includes(s) ||
      (r.department_name || "").toLowerCase().includes(s)
    ));
  }, [search, data]);

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cage Master - HR / Payroll Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.autoTable({
      startY: 32,
      head: [["#", "Employee", "Department", "Joining Date", "Basic Salary", "Rate Type", "Current Rate", "Status"]],
      body: filtered.map((r, i) => [
        i + 1, r.full_name, r.department_name || "-",
        r.joining_date?.split("T")[0] || "-",
        `PKR ${Number(r.basic_salary).toLocaleString()}`,
        r.rate_type || "-",
        r.current_rate ? `PKR ${r.current_rate}` : "-",
        r.status || "active"
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 },
    });
    doc.save("HR_Report.pdf");
  };

  const totalSalary = filtered.reduce((a, r) => a + Number(r.basic_salary || 0), 0);

  return (
    <div className="max-w-7xl mx-auto print:max-w-none">

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">HR / Payroll Report</h1>
          <p className="text-slate-500 text-sm">Employees summary — salary aur rate details</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition">
            <Printer size={18} /> Print
          </button>
          <button onClick={handlePDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input className="w-full pl-10 pr-4 py-2 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
            placeholder="Search by employee, department..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm font-semibold text-blue-700">
          Total Payroll: PKR {totalSalary.toLocaleString()}
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-3xl font-bold">Cage Master</h1>
        <p className="text-slate-500">HR / Payroll Report — {new Date().toLocaleDateString()}</p>
        <hr className="my-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Joining Date</th>
                <th className="px-4 py-3 text-right">Basic Salary</th>
                <th className="px-4 py-3 text-left">Rate Type</th>
                <th className="px-4 py-3 text-right">Current Rate</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Koi record nahi mila</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.department_name || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.joining_date?.split("T")[0] || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">PKR {Number(r.basic_salary).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{r.rate_type || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">{r.current_rate ? `PKR ${r.current_rate}` : "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {r.status || "active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold">
              <tr>
                <td colSpan={4} className="px-4 py-4 text-right uppercase text-sm text-slate-700">Total Payroll</td>
                <td className="px-4 py-4 text-right font-mono text-emerald-700">PKR {totalSalary.toLocaleString()}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRReportPage;
