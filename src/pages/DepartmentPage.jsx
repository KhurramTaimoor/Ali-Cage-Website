import React, { useState, useEffect, useRef } from "react";
import { Save, Trash2, Plus, Search, ChevronDown, X, Check } from "lucide-react";
import axios from "axios";

const DepartmentPage = () => {
  const [records, setRecords] = useState([]);
  const [options, setOptions] = useState([
    { label: "Production", code: "PRD" },
    { label: "Sales", code: "SLS" },
    { label: "Accounts", code: "ACC" },
    { label: "HR", code: "HR" },
    { label: "Admin", code: "ADM" },
  ]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState({ department_name: "", head_of_dept: "", extension_no: "" });
  const [tableSearch, setTableSearch] = useState("");
  const [message, setMessage] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchAll = async () => {
    const res = await axios.get("http://localhost:5000/api/departments");
    setRecords(res.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    const entry = { label: newItem.trim(), code: newItem.trim().toUpperCase().slice(0, 4) };
    await axios.post("http://localhost:5000/api/departments", {
      department_name: newItem.trim(),
      head_of_dept: "",
      extension_no: ""
    });
    setOptions(prev => [...prev, entry]);
    setSelected(entry);
    setForm(f => ({ ...f, department_name: entry.label }));
    setNewItem("");
    setAddingNew(false);
    setOpen(false);
    setSearch("");
    fetchAll();
  };

  const handleSelect = (opt) => {
    setSelected(opt);
    setForm(f => ({ ...f, department_name: opt.label }));
    setOpen(false);
    setSearch("");
  };

  const handleSave = async () => {
    if (!form.department_name) { setMessage("? Department name required hai!"); return; }
    await axios.post("http://localhost:5000/api/departments", form);
    setMessage("? Department save ho gaya!");
    setSelected(null);
    setForm({ department_name: "", head_of_dept: "", extension_no: "" });
    fetchAll();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/departments/${id}`);
    fetchAll();
  };

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const tableFiltered = records.filter(r =>
    (r.department_name || "").toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={18} className="text-blue-400" /> Departments
          </h1>
          <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded">New Entry</span>
        </div>
        <div className="p-6">
          {message && <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded">{message}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department Name</label>
              <div ref={ref} className="relative">
                <button type="button" onClick={() => setOpen(!open)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded border text-sm transition-all ${open ? "border-blue-500 ring-2 ring-blue-100 bg-white" : "border-slate-300 bg-slate-50 hover:border-blue-400"} ${selected ? "text-slate-800" : "text-slate-400"}`}>
                  <span>{selected ? (
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">{selected.code}</span>
                      {selected.label}
                    </span>
                  ) : "Select Department"}</span>
                  <div className="flex items-center gap-1">
                    {selected && <span onClick={(e) => { e.stopPropagation(); setSelected(null); setForm(f => ({ ...f, department_name: "" })); }} className="text-slate-300 hover:text-red-400 cursor-pointer"><X size={12} /></span>}
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400 bg-white"
                        placeholder="Search options..." />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filtered.map((opt, i) => (
                        <button key={i} type="button" onClick={() => handleSelect(opt)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${selected?.code === opt.code ? "bg-blue-50" : ""}`}>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono min-w-[36px] text-center ${selected?.code === opt.code ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{opt.code}</span>
                          <span className={`flex-1 ${selected?.code === opt.code ? "text-blue-700 font-medium" : "text-slate-700"}`}>{opt.label}</span>
                          {selected?.code === opt.code && <Check size={13} className="text-blue-600" />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 p-2 bg-slate-50">
                      {addingNew ? (
                        <div className="flex gap-1.5">
                          <input autoFocus value={newItem} onChange={e => setNewItem(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAddingNew(false); setNewItem(""); } }}
                            className="flex-1 px-2.5 py-1.5 text-xs border border-blue-300 rounded focus:outline-none bg-white"
                            placeholder="New department name..." />
                          <button type="button" onClick={handleAdd} className="px-2.5 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"><Check size={12} /> Add</button>
                          <button type="button" onClick={() => { setAddingNew(false); setNewItem(""); }} className="px-2.5 py-1.5 bg-slate-200 text-slate-600 rounded text-xs"><X size={12} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setAddingNew(true)}
                          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-100 rounded font-semibold">
                          <Plus size={12} /> Add New Option
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Head of Dept</label>
              <input type="text" name="head_of_dept" value={form.head_of_dept} onChange={e => setForm(f => ({ ...f, head_of_dept: e.target.value }))}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                placeholder="e.g. Ahmed Khan" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Extension No</label>
              <input type="text" name="extension_no" value={form.extension_no} onChange={e => setForm(f => ({ ...f, extension_no: e.target.value }))}
                className="w-full px-3 py-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none text-sm"
                placeholder="e.g. 101" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded shadow-lg flex items-center gap-2 font-medium text-sm">
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 text-sm uppercase">Records <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{tableFiltered.length}</span></h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
              placeholder="Search..." value={tableSearch} onChange={e => setTableSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Department Name</th>
                <th className="px-4 py-3 text-left">Head of Dept</th>
                <th className="px-4 py-3 text-left">Extension No</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableFiltered.map((r, i) => (
                <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.department_name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.head_of_dept}</td>
                  <td className="px-4 py-3 text-slate-600">{r.extension_no}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {tableFiltered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">Koi record nahi mila</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPage;

