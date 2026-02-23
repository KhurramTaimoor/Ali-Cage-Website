import React, { useState, useEffect } from "react";
import { Save, Trash2, Plus, Search } from "lucide-react";
import axios from "axios";

const PurchaseInvoicePage = () => {
  const [records, setRecords] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ invoice_no: "", supplier_id: "", invoice_date: "", total_amount: "", status: "pending" });
  const [items, setItems] = useState([{ product_id: "", quantity: "", rate: "", amount: "" }]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const fetchAll = async () => {
    const [r, s, p] = await Promise.all([
      axios.get("http://localhost:5000/api/purchase-invoices"),
      axios.get("http://localhost:5000/api/suppliers"),
      axios.get("http://localhost:5000/api/products"),
    ]);
    setRecords(r.data);
    setSuppliers(s.data);
    setProducts(p.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    if (e.target.name === "quantity" || e.target.name === "rate") {
      newItems[index].amount = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
    }
    setItems(newItems);
    const total = newItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    setForm(f => ({ ...f, total_amount: total.toFixed(2) }));
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: "", rate: "", amount: "" }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!form.invoice_no || !form.supplier_id) { setMessage("Invoice No aur Supplier zaroori hain!"); return; }
    await axios.post("http://localhost:5000/api/purchase-invoices", { ...form, items });
    setMessage("Purchase Invoice saved!");
    setForm({ invoice_no: "", supplier_id: "", invoice_date: "", total_amount: "", status: "pending" });
    setItems([{ product_id: "", quantity: "", rate: "", amount: "" }]);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete karna chahte ho?")) return;
    await axios.delete(`http://localhost:5000/api/purchase-invoices/${id}`);
    fetchAll();
  };

  const filtered = records.filter(r =>
    (r.invoice_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.supplier_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={18} className="text-blue-400" /> Purchase Invoice
          </h1>
          <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded">New Entry</span>
        </div>
        <div className="p-6">
          {message && <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded">{message}</div>}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Invoice No</label>
              <input name="invoice_no" value={form.invoice_no} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                placeholder="PI-001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Supplier</label>
              <select name="supplier_id" value={form.supplier_id} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Invoice Date</label>
              <input type="date" name="invoice_date" value={form.invoice_date} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Total Amount (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">PKR</span>
                <input type="number" name="total_amount" value={form.total_amount} readOnly
                  className="w-full pl-12 pr-3 py-2.5 rounded border border-slate-200 bg-slate-50 outline-none text-sm font-mono"
                  placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Items</label>
              <button onClick={addItem} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">+ Add Item</button>
            </div>
            <table className="w-full text-sm border border-slate-200 rounded">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Quantity</th>
                  <th className="px-3 py-2 text-left">Rate</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <select name="product_id" value={item.product_id} onChange={e => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 outline-none text-sm">
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" name="quantity" value={item.quantity} onChange={e => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 outline-none text-sm" placeholder="0" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" name="rate" value={item.rate} onChange={e => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 outline-none text-sm" placeholder="0.00" />
                    </td>
                    <td className="px-3 py-2 font-mono text-emerald-700">PKR {parseFloat(item.amount || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded shadow-lg flex items-center gap-2 font-medium text-sm">
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 text-sm uppercase">Records <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{filtered.length}</span></h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Invoice No</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.invoice_no}</td>
                  <td className="px-4 py-3 text-slate-600">{r.supplier_name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.invoice_date}</td>
                  <td className="px-4 py-3 font-mono text-emerald-700">PKR {r.total_amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "paid" ? "bg-green-100 text-green-700" : r.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">Koi record nahi mila</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoicePage;
