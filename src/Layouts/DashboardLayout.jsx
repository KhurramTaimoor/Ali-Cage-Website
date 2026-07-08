import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Package,
  Calculator,
  Users,
  Factory,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Menu,
  Globe,
  BarChart3,
  X,
} from "lucide-react";
import { translations } from "../data/translations";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lang, setLang] = useState("en");

  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[lang] || translations.en || {};
  const isRTL = lang === "ur";

  const text = (key, fallback) => t?.[key] || fallback;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(true);
      setMobileSidebarOpen(true);
      return;
    }

    setSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div
      className={`flex h-screen bg-slate-50 font-sans overflow-hidden ${
        isRTL ? "flex-row-reverse" : "flex-row"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {mobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 z-50 lg:z-30
          ${isRTL ? "right-0" : "left-0"}
          ${
            mobileSidebarOpen
              ? "translate-x-0"
              : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${sidebarOpen ? "w-60" : "w-60 lg:w-16"}
          bg-slate-900 text-slate-300 flex flex-col
          transition-all duration-300 shadow-xl shrink-0
        `}
      >
        <div className="h-14 flex items-center justify-between border-b border-slate-800 shrink-0 px-3">
          <div className="flex items-center min-w-0">
            <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-bold mx-2 shadow-sm shrink-0">
              C
            </div>

            {sidebarOpen && (
              <span className="font-bold text-base tracking-wide text-white truncate">
                Ali Cage
              </span>
            )}
          </div>

          <button
            onClick={closeMobileSidebar}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label={text("dashboard", "Dashboard")}
            to="/app/dashboard"
            isOpen={sidebarOpen}
            active={isActive("/app/dashboard")}
            onNavigate={closeMobileSidebar}
          />

          <div
            className={`pt-3 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${
              !sidebarOpen && "lg:text-center"
            }`}
          >
            {sidebarOpen ? "Modules" : "M"}
          </div>

          <SidebarGroup
            icon={<ShoppingCart size={18} />}
            label={text("sales", "Sales")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/sales/customer"
              label={text("customer", "Customer")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/sales/rate-list"
              label={text("rateList", "Rate List")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/sales/sale-order"
              label={text("saleOrder", "Sale Order")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/sales/invoice"
              label={text("salesInvoice", "Sales Invoice")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/sales/return"
              label={text("salesReturn", "Sales Return")}
              onNavigate={closeMobileSidebar}
            />

            <div className="my-1 border-t border-slate-700 mx-4 opacity-50" />

            <SidebarSubItem
              to="/app/sales/reports"
              label={text("salesReport", "Sales Report")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarGroup
            icon={<Truck size={18} />}
            label={text("purchase", "Purchase")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/purchase/supplier"
              label={text("supplier", "Supplier")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/purchase/rate"
              label={text("purchaseRate", "Purchase Rate")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/purchase/invoice"
              label={text("purchaseInvoice", "Purchase Invoice")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/purchase/return"
              label={text("purchaseReturn", "Purchase Return")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/purchase/supplier-ledger"
              label={text("supplierLedger", "Supplier Ledger")}
              onNavigate={closeMobileSidebar}
            />

            <div className="my-1 border-t border-slate-700 mx-4 opacity-50" />

            <SidebarSubItem
              to="/app/purchase/reports"
              label={text("purchaseReport", "Purchase Report")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarGroup
            icon={<Package size={18} />}
            label={text("inventory", "Inventory")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/inventory/product-type"
              label={text("productType", "Product Type")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/category"
              label={text("category", "Category")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/product"
              label={text("product", "Product")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/unit"
              label={text("unit", "Unit")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/opening"
              label={text("openingStock", "Opening Stock")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/receive"
              label={text("stockReceive", "Stock Receive")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/issue"
              label={text("stockIssue", "Stock Issue")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/stock-demand"
              label={text("stockDemand", "Stock Demand")}
              onNavigate={closeMobileSidebar}
            />

            <div className="my-1 border-t border-slate-700 mx-4 opacity-50" />

            <SidebarSubItem
              to="/app/inventory/reports"
              label={text("inventoryReport", "Inventory Report")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/inventory/product-ledger"
              label={text("productLedger", "Product Ledger")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarGroup
            icon={<Calculator size={18} />}
            label={text("accounts", "Accounts")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/accounts/opening"
              label={text("openingBalance", "Opening Balance")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/accounts/journal"
              label={text("journalVoucher", "Journal Voucher")}
              onNavigate={closeMobileSidebar}
            />

            <div className="my-1 border-t border-slate-700 mx-4 opacity-50" />

            <SidebarSubItem
              to="/app/accounts/gl-report"
              label={text("glReport", "GL Report")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/accounts/cash-report"
              label={text("cashBookReport", "Cash Book Report")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarGroup
            icon={<BarChart3 size={18} />}
            label={text("reports", "Reports")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/reports/product-profit-loss"
              label={text("productProfitLoss", "Product Profit / Loss")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarGroup
            icon={<Users size={18} />}
            label={text("hr", "HR")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/hr/employee"
              label={text("employee", "Employee")}
              onNavigate={closeMobileSidebar}
            />

            <div className="my-1 border-t border-slate-700 mx-4 opacity-50" />

            <SidebarSubItem
              to="/app/hr/reports"
              label={text("employeeloan", "Employee Loan")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarGroup
            icon={<Factory size={18} />}
            label={text("production", "Production")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
          >
            <SidebarSubItem
              to="/app/production/bom"
              label={text("bom", "BOM")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/production/assembly"
              label={text("assembly", "Assembly")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/production/invoice"
              label={text("prodInvoice", "Production Invoice")}
              onNavigate={closeMobileSidebar}
            />
            <SidebarSubItem
              to="/app/production/return-invoice"
              label={text("prodReturnInvoice", "Production Return Invoice")}
              onNavigate={closeMobileSidebar}
            />

            <div className="my-1 border-t border-slate-700 mx-4 opacity-50" />

            <SidebarSubItem
              to="/app/production/reports"
              label={text("prodReports", "Production Reports")}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroup>

          <SidebarItem
            icon={<ShieldCheck size={18} />}
            label={text("permissions", "Permissions")}
            to="/app/permissions"
            isOpen={sidebarOpen}
            active={isActive("/app/permissions")}
            onNavigate={closeMobileSidebar}
          />
        </nav>

        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center text-slate-400 hover:text-white transition w-full hover:bg-slate-800 p-2 rounded-md group"
          >
            <LogOut
              size={18}
              className="group-hover:text-red-400 transition-colors"
            />

            {sidebarOpen && (
              <span className="mx-3 text-xs font-medium uppercase tracking-wide">
                {text("logout", "Logout")}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleMenuClick}
              className="text-slate-500 hover:text-blue-600 transition p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-bold"
            >
              <Globe size={14} />
              {lang === "en" ? "اردو" : "EN"}
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div
                className={`hidden sm:block ${
                  isRTL ? "text-left" : "text-right"
                }`}
              >
                <div className="text-xs font-bold text-slate-700">
                  {text("welcome", "Welcome")} Admin
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                  Administrator
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-auto overflow-y-auto bg-[#f1f5f9] p-3 sm:p-4 lg:p-6">
          <div className="min-w-0 w-full">
            <Outlet context={{ lang, t, isRTL }} />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, isOpen, active, onNavigate }) => (
  <Link
    to={to}
    onClick={onNavigate}
    className={`flex items-center px-4 py-2 mx-2 rounded-md transition-all duration-200 group mb-0.5 ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "hover:bg-slate-800 text-slate-400 hover:text-white"
    }`}
  >
    <div className="shrink-0">{icon}</div>

    {isOpen && (
      <span className="mx-3 text-xs font-medium whitespace-nowrap">
        {label}
      </span>
    )}
  </Link>
);

const SidebarGroup = ({ icon, label, children, isOpen, isRTL }) => {
  const [expanded, setExpanded] = useState(false);

  if (!isOpen) {
    return <SidebarItem icon={icon} label={label} to="#" isOpen={false} />;
  }

  return (
    <div className="mx-2 mb-0.5">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors ${
          expanded
            ? "bg-slate-800 text-white"
            : "hover:bg-slate-800 text-slate-400 hover:text-white"
        }`}
      >
        <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="shrink-0">{icon}</div>
          <span className="mx-3 text-xs font-medium whitespace-nowrap">
            {label}
          </span>
        </div>

        <div
          className={`transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={14} />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[760px] opacity-100 mt-1" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`bg-slate-950/30 rounded-md py-1 border-slate-700 space-y-0.5 ${
            isRTL ? "mr-4 border-r" : "ml-4 border-l"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const SidebarSubItem = ({ to, label, onNavigate }) => {
  const location = useLocation();

  const active =
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`block px-4 py-1.5 text-[11px] transition-colors relative group rounded-r-md ${
        active
          ? "bg-blue-600/20 text-white border-l-2 border-blue-500"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="group-hover:translate-x-1 transition-transform inline-block">
        {label}
      </span>
    </Link>
  );
};

export default DashboardLayout;
