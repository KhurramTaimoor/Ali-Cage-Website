import React, { useState, useEffect } from "react";
import { Printer, Filter, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import axios from "axios";

const CashBookReportPage = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ from_date: "", to_date: "" });

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    const r = await axios.get(`http://localhost:5000/api/cash-book-report?${params}`);
    setRecords(r.data);
  };

  const totalIn = records.reduce((s, r) => s + parseFloat(r.cash_in||0), 0);
  const totalOut = records.reduce((s, r) => s + parseFloat(r.cash_out||0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cash Book Report</h1>
          <p className="text-slate-500 text-sm">Cash in Hand: <span className="font-semibold text-blue-600">All Transactions</span></p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex gap-4">
        <input type="date" value={filters.from_date} onChange={e => setFilters({...filters, from_date: e.target.value})}
          className="px-4 py-2 rounded border border-slate-300 text-sm outline-none" />
        <input type="date" value={filters.to_date} onChange={e => setFilters({...filters, to_date: e.target.value})}
          className="px-4 py-2 rounded border border-slate-300 text-sm outline-none" />
        <button onClick={fetchReport} className="bg-slate-800 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3 border-b">#</th>
                <th className="px-6 py-3 border-b">Date</th>
                <th className="px-6 py-3 border-b">Description</th>
                <th className="px-6 py-3 border-b text-right text-green-700">Cash In</th>
                <th className="px-6 py-3 border-b text-right text-red-700">Cash Out</th>
                <th className="px-6 py-3 border-b text-right bg-slate-200">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-6 py-3 text-slate-600">{r.entry_date}</td>
                  <td className="px-6 py-3 text-slate-800 font-medium">
                    <div className="flex items-center gap-2">
                      {parseFloat(r.cash_in) > 0 && <ArrowUpCircle size={14} className="text-green-500" />}
                      {parseFloat(r.cash_out) > 0 && <ArrowDownCircle size={14} className="text-red-500" />}
                      {r.description}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-emerald-700">{parseFloat(r.cash_in) > 0 ? `PKR ${parseFloat(r.cash_in).toLocaleString()}` : "-"}</td>
                  <td className="px-6 py-3 text-right font-mono text-red-600">{parseFloat(r.cash_out) > 0 ? `PKR ${parseFloat(r.cash_out).toLocaleString()}` : "-"}</td>
                  <td className="px-6 py-3 text-right font-bold font-mono bg-slate-50">{`PKR ${parseFloat(r.balance).toLocaleString()}`}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Koi record nahi mila</td></tr>
              )}
            </tbody>
            {records.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right uppercase">Total</td>
                  <td className="px-6 py-4 text-right text-emerald-700">PKR {totalIn.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-600">PKR {totalOut.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right bg-slate-200">PKR {(totalIn - totalOut).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashBookReportPage;
