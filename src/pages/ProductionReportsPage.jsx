import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { tUi, tValue } from "../utils/uiI18n";

const API_BASE = "http://localhost:5000/api";

const ProductionReportsPage = () => {
  const outlet = useOutletContext() || {};
  const isRTL = !!outlet.isRTL;
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    product: "",
    status: "",
  });

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    if (filters.product) params.append("product", filters.product);
    if (filters.status) params.append("status", filters.status);

    const response = await axios.get(`${API_BASE}/production-report?${params.toString()}`);
    setRecords(Array.isArray(response.data) ? response.data : []);
    setSearched(true);
  };

  const totalQty = records.reduce((sum, row) => sum + parseFloat(row.quantity_produced || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 rounded-t-lg">
          <h1 className="text-lg font-bold text-white">{tUi("Production Reports", isRTL)}</h1>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{tUi("From Date", isRTL)}</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{tUi("To Date", isRTL)}</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{tUi("Product", isRTL)}</label>
              <input
                type="text"
                placeholder={tUi("Product name", isRTL)}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.product}
                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{tUi("Status", isRTL)}</label>
              <select
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">{`-- ${tUi("All Status", isRTL)} --`}</option>
                <option value="Pending">{tUi("Pending", isRTL)}</option>
                <option value="Completed">{tUi("Completed", isRTL)}</option>
                <option value="Cancelled">{tUi("Cancelled", isRTL)}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium text-sm"
            >
              {tUi("Search", isRTL)}
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs text-blue-500 uppercase font-bold">{tUi("Records", isRTL)}</p>
              <p className="text-xl font-bold text-blue-700">{records.length}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <p className="text-xs text-emerald-500 uppercase font-bold">{tUi("Total Quantity", isRTL)}</p>
              <p className="text-xl font-bold text-emerald-700">{totalQty.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-700 text-sm uppercase">
                {tUi("Records", isRTL)} <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{records.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">{tUi("Batch No", isRTL)}</th>
                    <th className="px-4 py-3 text-left">{tUi("Production Date", isRTL)}</th>
                    <th className="px-4 py-3 text-left">{tUi("Product", isRTL)}</th>
                    <th className="px-4 py-3 text-left">{tUi("Quantity Produced", isRTL)}</th>
                    <th className="px-4 py-3 text-left">{tUi("Warehouse", isRTL)}</th>
                    <th className="px-4 py-3 text-left">{tUi("Supervisor", isRTL)}</th>
                    <th className="px-4 py-3 text-left">{tUi("Status", isRTL)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((row, i) => (
                    <tr key={row.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">{tValue(row.batch_no || "-", isRTL)}</td>
                      <td className="px-4 py-3">{row.production_date || "-"}</td>
                      <td className="px-4 py-3">{tValue(row.product || "-", isRTL)}</td>
                      <td className="px-4 py-3">{row.quantity_produced || 0}</td>
                      <td className="px-4 py-3">{tValue(row.warehouse || "-", isRTL)}</td>
                      <td className="px-4 py-3">{tValue(row.supervisor || "-", isRTL)}</td>
                      <td className="px-4 py-3">{tValue(row.status || "-", isRTL)}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                        {tUi("Koi record nahi mila", isRTL)}
                      </td>
                    </tr>
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

export default ProductionReportsPage;
