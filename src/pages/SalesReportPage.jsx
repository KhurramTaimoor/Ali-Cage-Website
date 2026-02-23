import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const SalesReportPage = () => {
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [filters, setFilters] = useState({ from_date: "", to_date: "", customer_id: "", salesman_id: "" });
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/customers`).then(r => setCustomers(r.data));
    axios.get(`${API_BASE}/salesmen`).then(r => setSalesmen(r.data));
  }, []);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    if (filters.customer_id) params.append("customer_id", filters.customer_id);
    if (filters.salesman_id) params.append("salesman_id", filters.salesman_id);
    const r = await axios.get(`${API_BASE}/sales-report?${params.toString()}`);
    setRecords(r.data);
    setSearched(true);
  };

  const totalNet = records.reduce((sum, r) => sum + parseFloat(r.net_total || 0), 0);
  const totalGross = records.reduce((sum, r) => sum + parseFloat(r.gross_amount || 0), 0);
  const totalDiscount = records.reduce((sum, r) => sum + parseFloat(r.discount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 rounded-t-lg">
          <h1 className="text-lg font-bold text-white">Sales Report</h1>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">From Date</label>
              <input type="date" className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">To Date</label>
              <input type="date" className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Customer</label>
              <select className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.customer_id} onChange={e => setFilters({ ...filters, customer_id: e.target.value })}>
                <option value="">-- All Customers --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Salesman</label>
              <select className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.salesman_id} onChange={e => setFilters({ ...filters, salesman_id: e.target.value })}>
                <option value="">-- All Salesmen --</option>
                {salesmen.map(s => <option key={s.id} value={s.id}>{s.salesman_name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium text-sm">
              Search
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs text-blue-500 uppercase font-bold">Total Gross</p>
              <p className="text-xl font-bold text-blue-700">{totalGross.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-xs text-orange-500 uppercase font-bold">Total Discount</p>
              <p className="text-xl font-bold text-orange-700">{totalDiscount.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-xs text-green-500 uppercase font-bold">Total Net</p>
              <p className="text-xl font-bold text-green-700">{totalNet.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-700 text-sm uppercase">
                Records <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{records.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Invoice No</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Salesman</th>
                    <th className="px-4 py-3 text-left">Gross Amount</th>
                    <th className="px-4 py-3 text-left">Discount</th>
                    <th className="px-4 py-3 text-left">Net Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((row, i) => (
                    <tr key={row.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">{row.invoice_no}</td>
                      <td className="px-4 py-3">{row.invoice_date}</td>
                      <td className="px-4 py-3">{row.customer_name}</td>
                      <td className="px-4 py-3">{row.salesman_name}</td>
                      <td className="px-4 py-3">{row.gross_amount}</td>
                      <td className="px-4 py-3">{row.discount}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{row.net_total}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-400">Koi record nahi mila</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReportPage;
