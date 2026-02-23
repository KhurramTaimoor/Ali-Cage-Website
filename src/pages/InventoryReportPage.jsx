import React, { useState, useEffect } from "react";
import { Printer, Download, Search, Filter } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const InventoryReportPage = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/inventory-report")
      .then(r => { setData(r.data); setFiltered(r.data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(data.filter(r =>
      (r.product_name || "").toLowerCase().includes(s) ||
      (r.type_name    || "").toLowerCase().includes(s) ||
      (r.category_name|| "").toLowerCase().includes(s)
    ));
  }, [search, data]);

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cage Master - Inventory Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.autoTable({
      startY: 32,
      head: [["#", "Product", "Type", "Category", "Opening", "Received", "Issued", "Balance", "Rate", "Total Value"]],
      body: filtered.map((r, i) => [
        i + 1, r.product_name, r.type_name, r.category_name,
        r.opening_qty, r.received_qty, r.issued_qty, r.balance_qty,
        `PKR ${Number(r.rate).toFixed(2)}`,
        `PKR ${Number(r.total_value).toFixed(2)}`
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 },
    });
    doc.save("Inventory_Report.pdf");
  };

  const totals = filtered.reduce((acc, r) => ({
    opening:  acc.opening  + Number(r.opening_qty),
    received: acc.received + Number(r.received_qty),
    issued:   acc.issued   + Number(r.issued_qty),
    balance:  acc.balance  + Number(r.balance_qty),
    value:    acc.value    + Number(r.total_value),
  }), { opening: 0, received: 0, issued: 0, balance: 0, value: 0 });

  return (
    <div className="max-w-7xl mx-auto print:max-w-none">

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Report</h1>
          <p className="text-slate-500 text-sm">Current stock balance — all products</p>
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
            placeholder="Search by product, type, category..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Cage Master</h1>
        <p className="text-slate-500">Inventory Report — {new Date().toLocaleDateString()}</p>
        <hr className="my-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Opening</th>
                <th className="px-4 py-3 text-right text-emerald-300">Received</th>
                <th className="px-4 py-3 text-right text-red-300">Issued</th>
                <th className="px-4 py-3 text-right text-blue-300">Balance</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400">Koi record nahi mila</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className={`hover:bg-blue-50 transition-colors ${Number(r.balance_qty) < 0 ? "bg-red-50" : ""}`}>
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.product_name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.type_name || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.category_name || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{r.opening_qty}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600">{r.received_qty}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-500">{r.issued_qty}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${Number(r.balance_qty) < 0 ? "text-red-600" : "text-blue-700"}`}>
                    {r.balance_qty}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">PKR {Number(r.rate).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">PKR {Number(r.total_value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="px-4 py-4 text-right uppercase text-sm">Totals</td>
                <td className="px-4 py-4 text-right font-mono">{totals.opening}</td>
                <td className="px-4 py-4 text-right font-mono text-emerald-600">{totals.received}</td>
                <td className="px-4 py-4 text-right font-mono text-red-500">{totals.issued}</td>
                <td className="px-4 py-4 text-right font-mono text-blue-700">{totals.balance}</td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-right font-mono text-emerald-700">PKR {totals.value.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportPage;
