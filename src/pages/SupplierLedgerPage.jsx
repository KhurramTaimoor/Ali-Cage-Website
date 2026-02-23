import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, Printer } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const SupplierLedgerPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ supplier_id: "", from_date: "", to_date: "" });
  const [ledger, setLedger] = useState({ supplier: null, summary: null, transactions: [] });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/supplier-ledger/suppliers`)
      .then((r) => setSuppliers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSuppliers([]));
  }, []);

  const fetchLedger = async () => {
    if (!filters.supplier_id) {
      setMessage("Supplier select karo.");
      return;
    }
    setMessage("");
    const params = new URLSearchParams();
    params.append("supplier_id", filters.supplier_id);
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);

    const response = await axios.get(`${API_BASE}/supplier-ledger?${params.toString()}`);
    setLedger({
      supplier: response.data?.supplier || null,
      summary: response.data?.summary || null,
      transactions: Array.isArray(response.data?.transactions) ? response.data.transactions : [],
    });
  };

  const filteredRows = useMemo(() => {
    const s = search.toLowerCase();
    return (ledger.transactions || []).filter((row) =>
      [row.type, row.ref_no, row.status]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(s))
    );
  }, [ledger.transactions, search]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Search size={18} className="text-blue-400" /> Supplier Ledger
          </h1>
          <button
            onClick={() => window.print()}
            className="text-xs text-slate-400 bg-white/10 px-3 py-1 rounded flex items-center gap-1 hover:bg-white/20"
          >
            <Printer size={13} /> Print
          </button>
        </div>
        <div className="p-6">
          {message && (
            <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Supplier</label>
              <select
                name="supplier_id"
                value={filters.supplier_id}
                onChange={(e) => setFilters({ ...filters, supplier_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">From Date</label>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">To Date</label>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchLedger}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded shadow flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Search size={15} /> Show Ledger
              </button>
            </div>
          </div>
        </div>
      </div>

      {ledger.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-500 uppercase font-bold">Total Debit</p>
            <p className="text-xl font-bold text-blue-700">PKR {Number(ledger.summary.total_debit || 0).toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <p className="text-xs text-emerald-500 uppercase font-bold">Total Credit</p>
            <p className="text-xl font-bold text-emerald-700">PKR {Number(ledger.summary.total_credit || 0).toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-xs text-amber-500 uppercase font-bold">Closing Balance</p>
            <p className="text-xl font-bold text-amber-700">PKR {Number(ledger.summary.closing_balance || 0).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 text-sm uppercase">
            Transactions{" "}
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{filteredRows.length}</span>
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Ref No</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((r, i) => (
                <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">{r.tx_date || "-"}</td>
                  <td className="px-4 py-3 capitalize">{r.type}</td>
                  <td className="px-4 py-3">{r.ref_no || "-"}</td>
                  <td className="px-4 py-3">{r.status || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-blue-700">PKR {Number(r.debit || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">PKR {Number(r.credit || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">PKR {Number(r.balance || 0).toFixed(2)}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400 text-sm">
                    Koi record nahi mila
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierLedgerPage;
