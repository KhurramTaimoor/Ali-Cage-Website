import React from 'react';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

const DashboardHome = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Sales" value="$12,450" icon={<DollarSign size={24} />} color="bg-blue-500" />
        <StatCard title="Total Orders" value="45" icon={<ShoppingBag size={24} />} color="bg-purple-500" />
        <StatCard title="New Customers" value="12" icon={<Users size={24} />} color="bg-orange-500" />
        <StatCard title="Low Stock" value="5 Items" icon={<Package size={24} />} color="bg-red-500" />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Recent Transactions</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <TableRow id="#ORD-001" customer="Ali Traders" date="Oct 24, 2023" amount="$1,200" status="Completed" />
              <TableRow id="#ORD-002" customer="Global Tech" date="Oct 24, 2023" amount="$850" status="Pending" />
              <TableRow id="#ORD-003" customer="Smart Solutions" date="Oct 23, 2023" amount="$2,300" status="Completed" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center">
    <div className={`w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20`}>
      {icon}
    </div>
    <div>
      <div className="text-slate-500 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  </div>
);

const TableRow = ({ id, customer, date, amount, status }) => (
  <tr className="hover:bg-slate-50 transition">
    <td className="px-6 py-4 font-medium text-slate-900">{id}</td>
    <td className="px-6 py-4">{customer}</td>
    <td className="px-6 py-4">{date}</td>
    <td className="px-6 py-4 text-right font-mono">{amount}</td>
    <td className="px-6 py-4 text-center">
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
        {status}
      </span>
    </td>
  </tr>
);

export default DashboardHome;