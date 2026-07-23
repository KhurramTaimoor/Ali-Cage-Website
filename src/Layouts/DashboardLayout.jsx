import React, {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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

const SALES_ITEMS = [
  {
    to: "/app/sales/customer",
    key: "customer",
    fallback: "Customer",
  },
  {
    to: "/app/sales/customer-ledger",
    key: "customerLedger",
    fallback: "Customer Ledger",
  },
  {
    to: "/app/sales/rate-list",
    key: "rateList",
    fallback: "Rate List",
  },
  {
    to: "/app/sales/sale-order",
    key: "saleOrder",
    fallback: "Sale Order",
  },
  {
    to: "/app/sales/invoice",
    key: "salesInvoice",
    fallback: "Sales Invoice",
  },
  {
    to: "/app/sales/return",
    key: "salesReturn",
    fallback: "Sales Return",
  },
  {
    divider: true,
  },
  {
    to: "/app/sales/reports",
    key: "salesReport",
    fallback: "Sales Report",
  },
];

const PURCHASE_ITEMS = [
  {
    to: "/app/purchase/supplier",
    key: "supplier",
    fallback: "Supplier",
  },
  {
    to: "/app/purchase/rate",
    key: "purchaseRate",
    fallback: "Purchase Rate",
  },
  {
    to: "/app/purchase/invoice",
    key: "purchaseInvoice",
    fallback: "Purchase Invoice",
  },
  {
    to: "/app/purchase/return",
    key: "purchaseReturn",
    fallback: "Purchase Return",
  },
  {
    to: "/app/purchase/supplier-ledger",
    key: "supplierLedger",
    fallback: "Supplier Ledger",
  },
  {
    divider: true,
  },
  {
    to: "/app/purchase/reports",
    key: "purchaseReport",
    fallback: "Purchase Report",
  },
];

const INVENTORY_ITEMS = [
  {
    to: "/app/inventory/product-type",
    key: "productType",
    fallback: "Product Type",
  },
  {
    to: "/app/inventory/category",
    key: "category",
    fallback: "Category",
  },
  {
    to: "/app/inventory/product",
    key: "product",
    fallback: "Product",
  },
  {
    to: "/app/inventory/unit",
    key: "unit",
    fallback: "Unit",
  },
  {
    to: "/app/inventory/opening",
    key: "openingStock",
    fallback: "Opening Stock",
  },
  {
    to: "/app/inventory/receive",
    key: "stockReceive",
    fallback: "Stock Receive",
  },
  {
    to: "/app/inventory/issue",
    key: "stockIssue",
    fallback: "Stock Issue",
  },
  {
    to: "/app/inventory/stock-demand",
    key: "stockDemand",
    fallback: "Stock Demand",
  },
  {
    divider: true,
  },
  {
    to: "/app/inventory/reports",
    key: "inventoryReport",
    fallback: "Inventory Report",
  },
  {
    to: "/app/inventory/product-ledger",
    key: "productLedger",
    fallback: "Product Ledger",
  },
];

const ACCOUNT_ITEMS = [
  {
    to: "/app/accounts/groups",
    key: "accountGroups",
    fallback: "Account Groups",
  },
  {
    to: "/app/accounts/chart",
    key: "chartOfAccounts",
    fallback: "Chart of Accounts",
  },
  {
    to: "/app/accounts/opening",
    key: "openingBalance",
    fallback: "Opening Balance",
  },
  {
    to: "/app/accounts/journal",
    key: "journalVoucher",
    fallback: "Journal Voucher",
  },
  {
    to: "/app/accounts/cashbook",
    key: "cashBook",
    fallback: "Cash Book",
  },
  {
    divider: true,
  },
  {
    to: "/app/accounts/ledger-summary",
    key: "ledgerSummary",
    fallback: "Ledger Summary",
  },
  {
    to: "/app/accounts/gl-report",
    key: "glReport",
    fallback: "GL Report",
  },
  {
    to: "/app/accounts/cash-report",
    key: "cashBookReport",
    fallback: "Cash Book Report",
  },
];

const REPORT_ITEMS = [
  {
    to: "/app/reports/product-profit-loss",
    key: "productProfitLoss",
    fallback: "Product Profit / Loss",
  },
];

const HR_ITEMS = [
  {
    to: "/app/hr/employee",
    key: "employee",
    fallback: "Employee",
  },
  {
    divider: true,
  },
  {
    to: "/app/hr/reports",
    key: "employeeloan",
    fallback: "Employee Loan",
  },
];

const PRODUCTION_ITEMS = [
  {
    to: "/app/production/bom",
    key: "bom",
    fallback: "BOM",
  },
  {
    to: "/app/production/assembly",
    key: "assembly",
    fallback: "Assembly",
  },
  {
    to: "/app/production/invoice",
    key: "prodInvoice",
    fallback: "Production Invoice",
  },
  {
    to: "/app/production/return-invoice",
    key: "prodReturnInvoice",
    fallback: "Production Return Invoice",
  },
  {
    divider: true,
  },
  {
    to: "/app/production/reports",
    key: "prodReports",
    fallback: "Production Reports",
  },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [lang, setLang] = useState("en");

  const navigate = useNavigate();
  const location = useLocation();

  const t =
    translations[lang] ||
    translations.en ||
    {};

  const isRTL = lang === "ur";

  const text = (key, fallback) =>
    t?.[key] || fallback;

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(
      `${path}/`
    );

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

    setSidebarOpen((previous) => !previous);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const renderItems = (items) =>
    items.map((item, index) => {
      if (item.divider) {
        return (
          <div
            key={`divider-${index}`}
            className="my-1 border-t border-slate-700 mx-4 opacity-50"
          />
        );
      }

      return (
        <SidebarSubItem
          key={item.to}
          to={item.to}
          label={text(
            item.key,
            item.fallback
          )}
          onNavigate={closeMobileSidebar}
        />
      );
    });

  return (
    <div
      className={`flex h-screen bg-slate-50 font-sans overflow-hidden ${
        isRTL
          ? "flex-row-reverse"
          : "flex-row"
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
          ${
            sidebarOpen
              ? "w-60"
              : "w-60 lg:w-16"
          }
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
            type="button"
            onClick={closeMobileSidebar}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <SidebarItem
            icon={
              <LayoutDashboard size={18} />
            }
            label={text(
              "dashboard",
              "Dashboard"
            )}
            to="/app/dashboard"
            isOpen={sidebarOpen}
            active={isActive(
              "/app/dashboard"
            )}
            onNavigate={closeMobileSidebar}
          />

          <div
            className={`pt-3 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${
              !sidebarOpen
                ? "lg:text-center"
                : ""
            }`}
          >
            {sidebarOpen ? "Modules" : "M"}
          </div>

          <SidebarGroup
            icon={
              <ShoppingCart size={18} />
            }
            label={text("sales", "Sales")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive("/app/sales")}
          >
            {renderItems(SALES_ITEMS)}
          </SidebarGroup>

          <SidebarGroup
            icon={<Truck size={18} />}
            label={text(
              "purchase",
              "Purchase"
            )}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive(
              "/app/purchase"
            )}
          >
            {renderItems(PURCHASE_ITEMS)}
          </SidebarGroup>

          <SidebarGroup
            icon={<Package size={18} />}
            label={text(
              "inventory",
              "Inventory"
            )}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive(
              "/app/inventory"
            )}
          >
            {renderItems(INVENTORY_ITEMS)}
          </SidebarGroup>

          <SidebarGroup
            icon={
              <Calculator size={18} />
            }
            label={text(
              "accounts",
              "Accounts"
            )}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive(
              "/app/accounts"
            )}
          >
            {renderItems(ACCOUNT_ITEMS)}
          </SidebarGroup>

          <SidebarGroup
            icon={<BarChart3 size={18} />}
            label={text(
              "reports",
              "Reports"
            )}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive(
              "/app/reports"
            )}
          >
            {renderItems(REPORT_ITEMS)}
          </SidebarGroup>

          <SidebarGroup
            icon={<Users size={18} />}
            label={text("hr", "HR")}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive("/app/hr")}
          >
            {renderItems(HR_ITEMS)}
          </SidebarGroup>

          <SidebarGroup
            icon={<Factory size={18} />}
            label={text(
              "production",
              "Production"
            )}
            isOpen={sidebarOpen}
            isRTL={isRTL}
            active={isActive(
              "/app/production"
            )}
          >
            {renderItems(PRODUCTION_ITEMS)}
          </SidebarGroup>

          <SidebarItem
            icon={
              <ShieldCheck size={18} />
            }
            label={text(
              "permissions",
              "Permissions"
            )}
            to="/app/permissions"
            isOpen={sidebarOpen}
            active={isActive(
              "/app/permissions"
            )}
            onNavigate={closeMobileSidebar}
          />
        </nav>

        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center text-slate-400 hover:text-white transition w-full hover:bg-slate-800 p-2 rounded-md group"
          >
            <LogOut
              size={18}
              className="group-hover:text-red-400 transition-colors"
            />

            {sidebarOpen && (
              <span className="mx-3 text-xs font-medium uppercase tracking-wide">
                {text(
                  "logout",
                  "Logout"
                )}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shadow-sm z-10 shrink-0">
          <button
            type="button"
            onClick={handleMenuClick}
            className="text-slate-500 hover:text-blue-600 transition p-2 rounded-lg hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 sm:gap-6">
            <button
              type="button"
              onClick={() =>
                setLang(
                  lang === "en"
                    ? "ur"
                    : "en"
                )
              }
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-bold"
            >
              <Globe size={14} />
              {lang === "en"
                ? "اردو"
                : "EN"}
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div
                className={`hidden sm:block ${
                  isRTL
                    ? "text-left"
                    : "text-right"
                }`}
              >
                <div className="text-xs font-bold text-slate-700">
                  {text(
                    "welcome",
                    "Welcome"
                  )}{" "}
                  Admin
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
            <Outlet
              context={{
                lang,
                t,
                isRTL,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  to,
  isOpen,
  active,
  onNavigate,
}) => (
  <Link
    to={to}
    onClick={onNavigate}
    className={`flex items-center px-4 py-2 mx-2 rounded-md transition-all duration-200 group mb-0.5 ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "hover:bg-slate-800 text-slate-400 hover:text-white"
    }`}
  >
    <div className="shrink-0">
      {icon}
    </div>

    {isOpen && (
      <span className="mx-3 text-xs font-medium whitespace-nowrap">
        {label}
      </span>
    )}
  </Link>
);

const SidebarGroup = ({
  icon,
  label,
  children,
  isOpen,
  isRTL,
  active = false,
}) => {
  const [expanded, setExpanded] =
    useState(active);

  useEffect(() => {
    if (active) {
      setExpanded(true);
    }
  }, [active]);

  if (!isOpen) {
    return (
      <div className="mx-2 mb-0.5">
        <button
          type="button"
          title={label}
          className={`w-full flex items-center justify-center px-3 py-2 rounded-md ${
            active
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {icon}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-0.5">
      <button
        type="button"
        onClick={() =>
          setExpanded(
            (previous) => !previous
          )
        }
        className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors ${
          expanded || active
            ? "bg-slate-800 text-white"
            : "hover:bg-slate-800 text-slate-400 hover:text-white"
        }`}
      >
        <div
          className={`flex items-center ${
            isRTL
              ? "flex-row-reverse"
              : ""
          }`}
        >
          <div className="shrink-0">
            {icon}
          </div>

          <span className="mx-3 text-xs font-medium whitespace-nowrap">
            {label}
          </span>
        </div>

        <div
          className={`transition-transform duration-200 ${
            expanded
              ? "rotate-180"
              : ""
          }`}
        >
          <ChevronDown size={14} />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded
            ? "max-h-[920px] opacity-100 mt-1"
            : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`bg-slate-950/30 rounded-md py-1 border-slate-700 space-y-0.5 ${
            isRTL
              ? "mr-4 border-r"
              : "ml-4 border-l"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const SidebarSubItem = ({
  to,
  label,
  onNavigate,
}) => {
  const location = useLocation();

  const active =
    location.pathname === to ||
    location.pathname.startsWith(
      `${to}/`
    );

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
