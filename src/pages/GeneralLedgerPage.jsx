import React, { useState, useEffect } from "react";
import { Printer, Download, Search, Filter, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import axios from "axios";

const GeneralLedgerPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ account_id: "", from_date: "", to_date: "" });
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/chart-of-accounts").then(r => setAccounts(r.data));
  }, []);

  const fetchLedger = async () => {
    if (!filters.account_id) return;
    const params = new URLSearchParams();
    params.append("account_id", filters.account_id);
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    const r = await axios.get(`http://localhost:5000/api/general-ledger?${params}`);
    setRecords(r.data);
    const acc = accounts.find(a => a.id == filters.account_id);
    setSelectedAccount(acc ? acc.account_title : "");
  };

  let runningBalance = 0;
  const ledgerData = records.map(row => {
    runningBalance = runningBalance + parseFloat(row.debit||0) - parseFloat(row.credit||0);
    return { ...row, balance: runningBalance };
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">General Ledger Report</h1>
          <p className="text-slate-500 text-sm">Account: <span className="font-semibold text-blue-600">{selectedAccount || "Select Account"}</span></p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex gap-4">
        <select value={filters.account_id} onChange={e => setFilters({...filters, account_id: e.target.value})}
          className="px-3 py-2 rounded border border-slate-300 text-sm outline-none flex-1">
          <option value="">Select Account</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} - {a.account_title}</option>)}
        </select>
        <input type="date" value={filters.from_date} onChange={e => setFilters({...filters, from_date: e.target.value})}
          className="px-4 py-2 rounded border border-slate-300 text-sm outline-none" />
        <input type="date" value={filters.to_date} onChange={e => setFilters({...filters, to_date: e.target.value})}
          className="px-4 py-2 rounded border border-slate-300 text-sm outline-none" />
        <button onClick={fetchLedger} className="bg-slate-800 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200">Date</th>
                <th className="px-6 py-3 border-b border-slate-200">Description</th>
                <th className="px-6 py-3 border-b border-slate-200">Ref</th>
                <th className="px-6 py-3 border-b border-slate-200 text-right text-green-700">Debit</th>
                <th className="px-6 py-3 border-b border-slate-200 text-right text-red-700">Credit</th>
                <th className="px-6 py-3 border-b border-slate-200 text-right bg-slate-200">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-600">{row.date}</td>
                  <td className="px-6 py-3 text-slate-800 font-medium">
                    <div className="flex items-center gap-2">
                      {parseFloat(row.debit) > 0 && <ArrowUpCircle size={14} className="text-green-500" />}
                      {parseFloat(row.credit) > 0 && <ArrowDownCircle size={14} className="text-red-500" />}
                      {row.desc}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{row.ref}</td>
                  <td className="px-6 py-3 text-right font-mono text-slate-700">{parseFloat(row.debit) > 0 ? parseFloat(row.debit).toLocaleString() : "-"}</td>
                  <td className="px-6 py-3 text-right font-mono text-slate-700">{parseFloat(row.credit) > 0 ? parseFloat(row.credit).toLocaleString() : "-"}</td>
                  <td className={`px-6 py-3 text-right font-bold font-mono bg-slate-50 ${row.balance < 0 ? "text-red-600" : "text-slate-900"}`}>
                    {row.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
              {ledgerData.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Account select karo aur Filter dabao</td></tr>
              )}
            </tbody>
            {ledgerData.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right uppercase">Closing Balance</td>
                  <td className="px-6 py-4 text-right text-green-700">{ledgerData.reduce((a,b) => a + parseFloat(b.debit||0), 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-700">{ledgerData.reduce((a,b) => a + parseFloat(b.credit||0), 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right bg-slate-200">{runningBalance.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralLedgerPage;
