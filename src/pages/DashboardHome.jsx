import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Bootstrap Icons via CDN
const BootstrapIconsLink = () => (
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
  />
);

const DashboardHome = () => {
  const [showSummary, setShowSummary] = useState(false);
  const [salesFilter, setSalesFilter] = useState('today');
  const [purchaseFilter, setPurchaseFilter] = useState('today');

  const [salesInvoices, setSalesInvoices] = useState([]);
  const [salesReturns, setSalesReturns] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [saleOrders, setSaleOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        salesInvoicesData,
        salesReturnsData,
        purchaseInvoicesData,
        purchaseReturnsData,
        saleOrdersData,
        productsData,
      ] = await Promise.all([
        fetchJson('/api/sales-invoices'),
        fetchJson('/api/sales-returns'),
        fetchJson('/api/purchase-invoices'),
        fetchJson('/api/purchase-returns'),
        fetchJson('/api/sale-orders'),
        fetchJson('/api/products'),
      ]);

      setSalesInvoices(normalizeArray(salesInvoicesData));
      setSalesReturns(normalizeArray(salesReturnsData));
      setPurchaseInvoices(normalizeArray(purchaseInvoicesData));
      setPurchaseReturns(normalizeArray(purchaseReturnsData));
      setSaleOrders(normalizeArray(saleOrdersData));
      setProducts(normalizeArray(productsData));
    } catch (error) {
      console.error('Dashboard data error:', error);
      setSalesInvoices([]);
      setSalesReturns([]);
      setPurchaseInvoices([]);
      setPurchaseReturns([]);
      setSaleOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const dashboardSummary = useMemo(() => {
    const totalSalesInvoices = sumByDateRange(
      salesInvoices,
      salesFilter,
      'invoice_date',
      ['grand_total', 'invoice_total', 'total_amount', 'amount']
    );

    const totalSalesReturns = sumByDateRange(
      salesReturns,
      salesFilter,
      'return_date',
      ['return_amount', 'total_amount', 'amount']
    );

    const totalPurchaseInvoices = sumByDateRange(
      purchaseInvoices,
      purchaseFilter,
      'invoice_date',
      ['total_amount', 'grand_total', 'invoice_total', 'amount']
    );

    const totalPurchaseReturns = sumByDateRange(
      purchaseReturns,
      purchaseFilter,
      'return_date',
      ['total_amount', 'return_amount', 'amount']
    );

    const totalSales = totalSalesInvoices - totalSalesReturns;
    const totalPurchase = totalPurchaseInvoices - totalPurchaseReturns;

    const pendingOrders = saleOrders.filter((order) => {
      const status = String(
        order.status ||
          order.order_status ||
          order.sale_order_status ||
          order.payment_status ||
          ''
      ).toLowerCase();

      return (
        status.includes('pending') ||
        status.includes('process') ||
        status.includes('unpaid') ||
        status.includes('زیر')
      );
    });

    const lowStockItems = products.filter((product) => {
      const currentStock = Number(
        product.current_stock ??
          product.stock ??
          product.quantity ??
          product.available_stock ??
          product.balance_qty ??
          product.qty ??
          0
      );

      const lowLimit = Number(
        product.low_stock_limit ??
          product.min_stock ??
          product.reorder_level ??
          product.alert_quantity ??
          product.minimum_stock ??
          5
      );

      return currentStock <= lowLimit;
    });

    return {
      totalSales,
      totalPurchase,
      pendingOrders: pendingOrders.length,
      lowStock: lowStockItems.length,
    };
  }, [
    salesInvoices,
    salesReturns,
    purchaseInvoices,
    purchaseReturns,
    saleOrders,
    products,
    salesFilter,
    purchaseFilter,
  ]);

  const todayTransactions = useMemo(() => {
    const sales = salesInvoices
      .filter((item) => isToday(item.invoice_date))
      .map((item) => ({
        id: item.invoice_no || item.id || '-',
        type: 'Sale',
        urduType: 'فروخت',
        party: item.customer_name || item.customer || item.customer_name_en || '-',
        date: item.invoice_date,
        amount: getFirstAmount(item, [
          'grand_total',
          'invoice_total',
          'total_amount',
          'amount',
        ]),
        status: item.status || 'Completed',
      }));

    const saleReturns = salesReturns
      .filter((item) => isToday(item.return_date))
      .map((item) => ({
        id: item.return_no || item.id || '-',
        type: 'Sale Return',
        urduType: 'فروخت واپسی',
        party: item.product_name || item.invoice_ref || '-',
        date: item.return_date,
        amount: getFirstAmount(item, [
          'return_amount',
          'total_amount',
          'amount',
        ]),
        status: 'Returned',
      }));

    const purchases = purchaseInvoices
      .filter((item) => isToday(item.invoice_date))
      .map((item) => ({
        id: item.invoice_no || item.id || '-',
        type: 'Purchase',
        urduType: 'خریداری',
        party: item.supplier_name || item.supplier || '-',
        date: item.invoice_date,
        amount: getFirstAmount(item, [
          'total_amount',
          'grand_total',
          'invoice_total',
          'amount',
        ]),
        status: item.status || 'Pending',
      }));

    const purchaseReturnList = purchaseReturns
      .filter((item) => isToday(item.return_date))
      .map((item) => ({
        id: item.invoice_no || item.id || '-',
        type: 'Purchase Return',
        urduType: 'خریداری واپسی',
        party: item.supplier_name || '-',
        date: item.return_date,
        amount: getFirstAmount(item, [
          'total_amount',
          'return_amount',
          'amount',
        ]),
        status: 'Returned',
      }));

    return [
      ...sales,
      ...saleReturns,
      ...purchases,
      ...purchaseReturnList,
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [salesInvoices, salesReturns, purchaseInvoices, purchaseReturns]);

  return (
    <>
      <BootstrapIconsLink />

      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                  Dashboard Overview
                </h1>

                <p
                  className="text-sm text-slate-500 mt-1"
                  style={{ fontFamily: 'serif', direction: 'rtl' }}
                >
                  ڈیش بورڈ کا جائزہ
                </p>
              </div>

              <button
                onClick={() => setShowSummary((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                  showSummary
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                }`}
              >
                <i className="bi bi-bar-chart-line-fill"></i>
                View Summary /{' '}
                <span style={{ fontFamily: 'serif' }}>
                  سمری دیکھیں
                </span>
                <i
                  className={`bi bi-chevron-${
                    showSummary ? 'up' : 'down'
                  } text-xs`}
                ></i>
              </button>
            </div>

            {/* Summary Section */}
            {showSummary && (
              <div className="mt-5 pt-5 border-t border-sky-100">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Dashboard Summary
                  </h3>

                  <p
                    className="text-sm text-slate-500"
                    style={{ fontFamily: 'serif', direction: 'rtl' }}
                  >
                    ڈیش بورڈ کا خلاصہ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DropdownSummaryCard
                    title="Total Sales"
                    urduTitle="کل فروخت"
                    value={
                      loading
                        ? 'Loading...'
                        : formatCurrency(dashboardSummary.totalSales)
                    }
                    icon="bi-currency-rupee"
                    selected={salesFilter}
                    onChange={setSalesFilter}
                  />

                  <DropdownSummaryCard
                    title="Total Purchase"
                    urduTitle="کل خریداری"
                    value={
                      loading
                        ? 'Loading...'
                        : formatCurrency(dashboardSummary.totalPurchase)
                    }
                    icon="bi-cart-check"
                    selected={purchaseFilter}
                    onChange={setPurchaseFilter}
                  />

                  <SummaryCard
                    title="Pending Orders"
                    urduTitle="زیر التواء آرڈرز"
                    value={loading ? 'Loading...' : dashboardSummary.pendingOrders}
                    icon="bi-hourglass-split"
                  />

                  <SummaryCard
                    title="Low Stock"
                    urduTitle="کم اسٹاک"
                    value={
                      loading
                        ? 'Loading...'
                        : `${dashboardSummary.lowStock} items`
                    }
                    icon="bi-box-seam"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shortcut Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ShortcutCard
              title="Customers"
              urduTitle="گاہک"
              to="/app/sales/customer"
              icon="bi-people-fill"
            />

            <ShortcutCard
              title="Suppliers"
              urduTitle="سپلائرز"
              to="/app/purchase/supplier"
              icon="bi-truck"
            />

            <ShortcutCard
              title="Employees"
              urduTitle="ملازمین"
              to="/app/hr/employee"
              icon="bi-person-badge-fill"
            />
          </div>

          {/* Today Transactions */}
          <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-sky-100 bg-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-extrabold text-slate-800">
                    Today Transactions
                  </h2>

                  <p
                    className="text-xs text-slate-400 mt-0.5"
                    style={{ direction: 'rtl', fontFamily: 'serif' }}
                  >
                    آج کا لین دین
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadDashboardData}
                  className="text-sm text-sky-700 font-semibold hover:underline"
                >
                  Refresh /{' '}
                  <span style={{ fontFamily: 'serif' }}>
                    ریفریش
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600">
                <thead>
                  <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100">
                    <th className="px-5 py-4 text-left">
                      ID
                      <br />
                      <span
                        className="font-normal text-slate-400"
                        style={{ fontFamily: 'serif' }}
                      >
                        نمبر
                      </span>
                    </th>

                    <th className="px-5 py-4 text-left">
                      Type
                      <br />
                      <span
                        className="font-normal text-slate-400"
                        style={{ fontFamily: 'serif' }}
                      >
                        قسم
                      </span>
                    </th>

                    <th className="px-5 py-4 text-left">
                      Customer / Supplier
                      <br />
                      <span
                        className="font-normal text-slate-400"
                        style={{ fontFamily: 'serif' }}
                      >
                        گاہک / سپلائر
                      </span>
                    </th>

                    <th className="px-5 py-4 text-left">
                      Date
                      <br />
                      <span
                        className="font-normal text-slate-400"
                        style={{ fontFamily: 'serif' }}
                      >
                        تاریخ
                      </span>
                    </th>

                    <th className="px-5 py-4 text-right">
                      Amount
                      <br />
                      <span
                        className="font-normal text-slate-400"
                        style={{ fontFamily: 'serif' }}
                      >
                        رقم
                      </span>
                    </th>

                    <th className="px-5 py-4 text-center">
                      Status
                      <br />
                      <span
                        className="font-normal text-slate-400"
                        style={{ fontFamily: 'serif' }}
                      >
                        حالت
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-sky-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                        <p className="mt-2">Loading dashboard data...</p>
                      </td>
                    </tr>
                  ) : todayTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                          <i className="bi bi-inbox text-xl"></i>
                        </div>

                        <p className="font-semibold">
                          No transactions found today
                        </p>

                        <p
                          className="text-xs mt-1"
                          style={{ fontFamily: 'serif' }}
                        >
                          آج کوئی لین دین موجود نہیں
                        </p>
                      </td>
                    </tr>
                  ) : (
                    todayTransactions.map((transaction, index) => (
                      <TransactionRow
                        key={`${transaction.type}-${transaction.id}-${index}`}
                        transaction={transaction}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Shortcut Card
const ShortcutCard = ({ title, urduTitle, to, icon }) => (
  <Link
    to={to}
    className="bg-white p-5 rounded-3xl shadow-sm border border-sky-100 flex items-center justify-between hover:bg-sky-50/60 hover:shadow-md transition"
  >
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
        <i className={`${icon} text-lg`}></i>
      </div>

      <div>
        <div className="font-bold text-slate-950 text-sm">
          {title}
        </div>

        <div
          className="text-slate-400 text-xs"
          style={{ fontFamily: 'serif', direction: 'rtl' }}
        >
          {urduTitle}
        </div>

        <div className="text-xs text-sky-700 mt-1 font-semibold">
          Open /{' '}
          <span style={{ fontFamily: 'serif' }}>
            کھولیں
          </span>
        </div>
      </div>
    </div>

    <i className="bi bi-arrow-right text-slate-400"></i>
  </Link>
);

// Summary Card With Dropdown
const DropdownSummaryCard = ({
  title,
  urduTitle,
  value,
  icon,
  selected,
  onChange,
}) => (
  <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm">
        <i className={`${icon} text-lg`}></i>
      </div>

      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs border border-sky-100 rounded-xl px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
      >
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
        <option value="all">All</option>
      </select>
    </div>

    <p className="text-xs text-slate-500 mb-1">
      {title}
    </p>

    <p
      className="text-xs text-slate-400 mb-2"
      style={{ fontFamily: 'serif', direction: 'rtl' }}
    >
      {urduTitle}
    </p>

    <p className="text-2xl font-extrabold text-slate-950">
      {value}
    </p>
  </div>
);

// Simple Summary Card
const SummaryCard = ({ title, urduTitle, value, icon }) => (
  <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
    <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-3">
      <i className={`${icon} text-lg`}></i>
    </div>

    <p className="text-xs text-slate-500 mb-1">
      {title}
    </p>

    <p
      className="text-xs text-slate-400 mb-2"
      style={{ fontFamily: 'serif', direction: 'rtl' }}
    >
      {urduTitle}
    </p>

    <p className="text-2xl font-extrabold text-slate-950">
      {value}
    </p>
  </div>
);

const TransactionRow = ({ transaction }) => {
  const typeClass = getTypeClass(transaction.type);
  const statusClass = getStatusClass(transaction.status);

  return (
    <tr className="hover:bg-sky-50/60 transition">
      <td className="px-5 py-4 font-bold text-slate-950">
        {transaction.id}
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${typeClass}`}
        >
          {transaction.type} /{' '}
          <span style={{ fontFamily: 'serif' }}>
            {transaction.urduType}
          </span>
        </span>
      </td>

      <td className="px-5 py-4 font-semibold text-slate-950">
        {transaction.party}
      </td>

      <td className="px-5 py-4 font-mono text-xs text-slate-700">
        {formatDate(transaction.date)}
      </td>

      <td className="px-5 py-4 text-right font-mono font-bold text-slate-950">
        {formatCurrency(transaction.amount)}
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}
        >
          {transaction.status}
        </span>
      </td>
    </tr>
  );
};

// Helpers
async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return res.json();
}

function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getFirstAmount(item, fields = []) {
  for (const field of fields) {
    if (item?.[field] !== undefined && item?.[field] !== null && item?.[field] !== '') {
      return Number(item[field]) || 0;
    }
  }

  return 0;
}

function sumByDateRange(items, range, dateField, amountFields) {
  return items
    .filter((item) => isInRange(item?.[dateField], range))
    .reduce((sum, item) => sum + getFirstAmount(item, amountFields), 0);
}

function isInRange(dateValue, range) {
  if (range === 'all') return true;
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return false;

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (range === 'today') {
    return itemDate.getTime() === startToday.getTime();
  }

  if (range === 'week') {
    const startOfWeek = new Date(startToday);
    startOfWeek.setDate(startToday.getDate() - startToday.getDay());

    return itemDate >= startOfWeek && itemDate <= startToday;
  }

  if (range === 'month') {
    return (
      itemDate.getFullYear() === now.getFullYear() &&
      itemDate.getMonth() === now.getMonth()
    );
  }

  if (range === 'year') {
    return itemDate.getFullYear() === now.getFullYear();
  }

  return true;
}

function isToday(dateValue) {
  return isInRange(dateValue, 'today');
}

function formatCurrency(value) {
  return `₨ ${Number(value || 0).toLocaleString('en-PK')}`;
}

function formatDate(dateValue) {
  if (!dateValue) return '-';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB');
}

function getTypeClass(type) {
  if (type === 'Sale') return 'bg-sky-100 text-sky-700';
  if (type === 'Sale Return') return 'bg-rose-100 text-rose-700';
  if (type === 'Purchase') return 'bg-emerald-100 text-emerald-700';
  if (type === 'Purchase Return') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

function getStatusClass(status) {
  const s = String(status || '').toLowerCase();

  if (s.includes('complete') || s.includes('paid')) {
    return 'bg-emerald-100 text-emerald-700';
  }

  if (s.includes('return')) {
    return 'bg-amber-100 text-amber-700';
  }

  if (s.includes('pending') || s.includes('process')) {
    return 'bg-orange-100 text-orange-700';
  }

  return 'bg-slate-100 text-slate-700';
}

export default DashboardHome;
