import React from 'react';

// Bootstrap Icons via CDN
const BootstrapIconsLink = () => (
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
  />
);

const DashboardHome = () => {
  return (
    <>
      <BootstrapIconsLink />
      <div>
        {/* Bilingual Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-base text-slate-500 mt-1 text-right" style={{ fontFamily: 'serif', direction: 'rtl' }}>
            ڈیش بورڈ کا جائزہ
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            urduTitle="کل فروخت"
            value="₨ 12,450"
            icon="bi-currency-rupee"
            color="bg-blue-500"
            shadow="shadow-blue-500/20"
          />
          <StatCard
            title="Total Orders"
            urduTitle="کل آرڈرز"
            value="45"
            icon="bi-bag-check"
            color="bg-purple-500"
            shadow="shadow-purple-500/20"
          />
          <StatCard
            title="New Customers"
            urduTitle="نئے گاہک"
            value="12"
            icon="bi-people"
            color="bg-orange-500"
            shadow="shadow-orange-500/20"
          />
          <StatCard
            title="Low Stock"
            urduTitle="کم اسٹاک"
            value="5 اشیاء"
            icon="bi-box-seam"
            color="bg-red-500"
            shadow="shadow-red-500/20"
          />
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-700">Recent Transactions</h2>
              <p className="text-xs text-slate-400 mt-0.5" style={{ direction: 'rtl', fontFamily: 'serif' }}>حالیہ لین دین</p>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:underline">
              View All / <span style={{ fontFamily: 'serif' }}>سب دیکھیں</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-3">
                    Order ID<br />
                    <span className="normal-case text-slate-400" style={{ fontFamily: 'serif' }}>آرڈر نمبر</span>
                  </th>
                  <th className="px-6 py-3">
                    Customer<br />
                    <span className="normal-case text-slate-400" style={{ fontFamily: 'serif' }}>گاہک</span>
                  </th>
                  <th className="px-6 py-3">
                    Date<br />
                    <span className="normal-case text-slate-400" style={{ fontFamily: 'serif' }}>تاریخ</span>
                  </th>
                  <th className="px-6 py-3 text-right">
                    Amount<br />
                    <span className="normal-case text-slate-400" style={{ fontFamily: 'serif' }}>رقم</span>
                  </th>
                  <th className="px-6 py-3 text-center">
                    Status<br />
                    <span className="normal-case text-slate-400" style={{ fontFamily: 'serif' }}>حالت</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <TableRow id="#ORD-001" customer="Ali Traders" date="Oct 24, 2023" amount="₨ 1,200" status="Completed" />
                <TableRow id="#ORD-002" customer="Global Tech" date="Oct 24, 2023" amount="₨ 850" status="Pending" />
                <TableRow id="#ORD-003" customer="Smart Solutions" date="Oct 23, 2023" amount="₨ 2,300" status="Completed" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper Components
const StatCard = ({ title, urduTitle, value, icon, color, shadow }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4 overflow-hidden">
    {/* Icon box — flex-shrink-0 prevents overflow */}
    <div
      className={`flex-shrink-0 w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center shadow-lg ${shadow}`}
    >
      <i className={`${icon} text-xl`}></i>
    </div>

    {/* Text */}
    <div className="min-w-0">
      <div className="text-slate-500 text-xs font-medium">{title}</div>
      <div className="text-slate-400 text-xs" style={{ fontFamily: 'serif', direction: 'rtl' }}>
        {urduTitle}
      </div>
      <div className="text-xl font-bold text-slate-800 mt-1">{value}</div>
    </div>
  </div>
);

const TableRow = ({ id, customer, date, amount, status }) => {
  const isCompleted = status === 'Completed';
  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4 font-medium text-slate-900">{id}</td>
      <td className="px-6 py-4">{customer}</td>
      <td className="px-6 py-4">{date}</td>
      <td className="px-6 py-4 text-right font-mono">{amount}</td>
      <td className="px-6 py-4 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isCompleted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}
        >
          {isCompleted ? 'Completed / مکمل' : 'Pending / زیر التواء'}
        </span>
      </td>
    </tr>
  );
};

export default DashboardHome;