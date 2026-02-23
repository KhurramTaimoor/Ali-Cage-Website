import React, { useState, useEffect } from "react";
import { Printer, Download, Search } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ProductLedgerPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/product-ledger/products")
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]));
  }, []);

  const handleProductChange = (e) => {
    const pid = e.target.value;
    const pname = products.find(p => p.id == pid)?.product_name || "";
    setSelectedProduct(pid);
    setProductName(pname);
    if (!pid) { setLedger([]); return; }
    setLoading(true);
    axios.get(`http://localhost:5000/api/product-ledger/${pid}`)
      .then(r => { setLedger(r.data); setLoading(false); })
      .catch(() => { setLedger([]); setLoading(false); });
  };

  let runningBalance = 0;
  const ledgerWithBalance = ledger.map(row => {
    runningBalance = runningBalance + Number(row.debit) - Number(row.credit);
    return { ...row, balance: runningBalance };
  });

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cage Master - Product Ledger", 14, 18);
    doc.setFontSize(11);
    doc.text(`Product: ${productName}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.autoTable({
      startY: 42,
      head: [["Date", "Description", "Ref", "In (Debit)", "Out (Credit)", "Balance"]],
      body: ledgerWithBalance.map(r => [
        r.date?.split("T")[0], r.description, r.ref,
        r.debit > 0 ? r.debit : "-",
        r.credit > 0 ? r.credit : "-",
        r.balance
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 },
    });
    doc.save(`Product_Ledger_${productName}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto print:max-w-none">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Ledger</h1>
          <p className="text-slate-500 text-sm">Product ki saari transactions — running balance ke saath</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} disabled={!selectedProduct}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition disabled:opacity-40">
            <Printer size={18} /> Print
          </button>
          <button onClick={handlePDF} disabled={!selectedProduct}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition disabled:opacity-40">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 print:hidden">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Product Select Karo</label>
        <select value={selectedProduct} onChange={handleProductChange}
          className="w-full md:w-80 px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm bg-white">
          <option value="">-- Select Product --</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
        </select>
      </div>

      <div className="hidden print:block text-center mb-6">
        <h1 className="text-3xl font-bold">Cage Master</h1>
        <p className="text-slate-500">Product Ledger — {productName}</p>
        <hr className="my-3" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {!selectedProduct ? (
          <div className="text-center py-16 text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p>Upar se product select karo ledger dekhne ke liye</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : (
          <>
            <div className="px-4 py-3 bg-slate-800 text-white flex justify-between items-center">
              <span className="font-bold">{productName}</span>
              <span className="text-xs text-slate-400">{ledgerWithBalance.length} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Ref</th>
                    <th className="px-4 py-3 text-right text-emerald-600">In (Qty)</th>
                    <th className="px-4 py-3 text-right text-red-500">Out (Qty)</th>
                    <th className="px-4 py-3 text-right text-blue-700">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerWithBalance.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-400">Koi transaction nahi mili</td></tr>
                  ) : ledgerWithBalance.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.date?.split("T")[0]}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.description}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{r.ref}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">{r.debit > 0 ? r.debit : "-"}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-500">{r.credit > 0 ? r.credit : "-"}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${r.balance < 0 ? "text-red-600" : "text-blue-700"}`}>{r.balance}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-right uppercase text-sm text-slate-700">Closing Balance</td>
                    <td className="px-4 py-4 text-right font-mono text-emerald-600">{ledgerWithBalance.reduce((a, b) => a + Number(b.debit), 0)}</td>
                    <td className="px-4 py-4 text-right font-mono text-red-500">{ledgerWithBalance.reduce((a, b) => a + Number(b.credit), 0)}</td>
                    <td className="px-4 py-4 text-right font-mono text-blue-700">{runningBalance}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductLedgerPage;


