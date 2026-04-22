import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Truck, Package, Calculator, 
  Users, Factory, ShieldCheck, ChevronDown, LogOut, 
  Menu, Globe, FileText 
} from 'lucide-react';
import { translations } from '../data/translations';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState('en'); 
  const navigate = useNavigate();
  const location = useLocation();
  
  const t = translations[lang];
  const isRTL = lang === 'ur';

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`flex h-screen bg-slate-50 font-sans ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl z-30 shrink-0`}>
        
        {/* Brand */}
        <div className="h-14 flex items-center justify-center border-b border-slate-800 shrink-0">
          <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-bold mx-2 shadow-sm">C</div>
          {sidebarOpen && <span className="font-bold text-base tracking-wide text-white">Ali Cage </span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          
          <SidebarItem icon={<LayoutDashboard size={18}/>} label={t.dashboard} to="/app/dashboard" isOpen={sidebarOpen} active={isActive('/app/dashboard')} />
          
          <div className={`pt-3 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${!sidebarOpen && 'text-center'}`}>Modules</div>
          
          {/* Sales */}
          <SidebarGroup icon={<ShoppingCart size={18}/>} label={t.sales} isOpen={sidebarOpen} isRTL={isRTL}>
            <SidebarSubItem to="/app/sales/customer" label={t.customer} />
            <SidebarSubItem to="/app/sales/rate-list" label={t.rateList} />
            <SidebarSubItem to="/app/sales/sale-order" label={t.saleOrder} />
            <SidebarSubItem to="/app/sales/invoice" label={t.salesInvoice} />
            <SidebarSubItem to="/app/sales/return" label={t.salesReturn} />
            <div className="my-1 border-t border-slate-700 mx-4 opacity-50"></div>
            <SidebarSubItem to="/app/sales/reports" label={t.salesReport} />
          </SidebarGroup>

          {/* Purchase */}
          <SidebarGroup icon={<Truck size={18}/>} label={t.purchase} isOpen={sidebarOpen} isRTL={isRTL}>
            <SidebarSubItem to="/app/purchase/supplier" label={t.supplier} />
            <SidebarSubItem to="/app/purchase/rate" label={t.purchaseRate} />
            <SidebarSubItem to="/app/purchase/invoice" label={t.purchaseInvoice} />
            <SidebarSubItem to="/app/purchase/return" label={t.purchaseReturn} />
            <SidebarSubItem to="/app/purchase/supplier-ledger" label={t.supplierLedger} />
            <div className="my-1 border-t border-slate-700 mx-4 opacity-50"></div>
            <SidebarSubItem to="/app/purchase/reports" label={t.purchaseReport} />
          </SidebarGroup>

          {/* Inventory - Sequence: RMS > FTM > PNT > Pkg > FMS */}
          <SidebarGroup icon={<Package size={18}/>} label={t.inventory} isOpen={sidebarOpen} isRTL={isRTL}>
            <SidebarSubItem to="/app/inventory/product-type" label={t.productType} />
            <SidebarSubItem to="/app/inventory/category" label={t.category} />
            <SidebarSubItem to="/app/inventory/product" label={t.product} />
            <SidebarSubItem to="/app/inventory/unit" label={t.unit} />
            <SidebarSubItem to="/app/inventory/opening" label={t.openingStock} />
            <SidebarSubItem to="/app/inventory/receive" label={t.stockReceive} />
            <SidebarSubItem to="/app/inventory/issue" label={t.stockIssue} />
            <div className="my-1 border-t border-slate-700 mx-4 opacity-50"></div>
            <SidebarSubItem to="/app/inventory/reports" label={t.inventoryReport} />
            <SidebarSubItem to="/app/inventory/product-ledger" label={t.productLedger} />
          </SidebarGroup>

          {/* Accounts */}
          <SidebarGroup icon={<Calculator size={18}/>} label={t.accounts} isOpen={sidebarOpen} isRTL={isRTL}>
            <SidebarSubItem to="/app/accounts/opening" label={t.openingBalance} />
            <SidebarSubItem to="/app/accounts/journal" label={t.journalVoucher} />
            <div className="my-1 border-t border-slate-700 mx-4 opacity-50"></div>
            <SidebarSubItem to="/app/accounts/gl-report" label={t.glReport} />
            <SidebarSubItem to="/app/accounts/cash-report" label={t.cashBookReport} />
          </SidebarGroup>

          {/* HR */}
          <SidebarGroup icon={<Users size={18}/>} label={t.hr} isOpen={sidebarOpen} isRTL={isRTL}>
            <SidebarSubItem to="/app/hr/employee" label={t.employee} />
            <div className="my-1 border-t border-slate-700 mx-4 opacity-50"></div>
            <SidebarSubItem to="/app/hr/reports" label={t.employeeloan } />
          
          </SidebarGroup>

          {/* Production */}
          <SidebarGroup icon={<Factory size={18}/>} label={t.production} isOpen={sidebarOpen} isRTL={isRTL}>
            <SidebarSubItem to="/app/production/bom" label={t.bom} />
            <SidebarSubItem to="/app/production/assembly" label={t.assembly} />
            <SidebarSubItem to="/app/production/invoice" label={t.prodInvoice} />
            <SidebarSubItem to="/app/production/return-invoice" label={t.prodReturnInvoice} />
            <div className="my-1 border-t border-slate-700 mx-4 opacity-50"></div>
            <SidebarSubItem to="/app/production/reports" label={t.prodReports} />
          </SidebarGroup>

          {/* Permissions */}
          <SidebarItem icon={<ShieldCheck size={18}/>} label={t.permissions} to="/app/permissions" isOpen={sidebarOpen} active={isActive('/app/permissions')} />

        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center text-slate-400 hover:text-white transition w-full hover:bg-slate-800 p-2 rounded-md group"
          >
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            {sidebarOpen && <span className="mx-3 text-xs font-medium uppercase tracking-wide">{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-blue-600 transition p-1">
              <Menu size={22} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-bold"
            >
              <Globe size={14} />
              {lang === 'en' ? 'اردو' : 'EN'}
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className={`text-right hidden sm:block ${isRTL ? 'text-left' : 'text-right'}`}>
                <div className="text-xs font-bold text-slate-700">{t.welcome} Admin</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Administrator</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f1f5f9] p-6">
          <Outlet context={{ lang, t, isRTL }} />
        </main>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon, label, to, isOpen, active }) => (
  <Link 
    to={to} 
    className={`flex items-center px-4 py-2 mx-2 rounded-md transition-all duration-200 group mb-0.5
      ${active ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
  >
    <div className="shrink-0">{icon}</div>
    {isOpen && <span className="mx-3 text-xs font-medium whitespace-nowrap">{label}</span>}
  </Link>
);

const SidebarGroup = ({ icon, label, children, isOpen, isRTL }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!isOpen) return <SidebarItem icon={icon} label={label} to="#" isOpen={false} />;

  return (
    <div className="mx-2 mb-0.5">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors 
          ${expanded ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
      >
        <div className="flex items-center">
          <div className="shrink-0">{icon}</div>
          <span className="mx-3 text-xs font-medium whitespace-nowrap">{label}</span>
        </div>
        <div className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
           <ChevronDown size={14} />
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        <div className="bg-slate-950/30 rounded-md py-1 border-l border-slate-700 ml-4 space-y-0.5">
          {children}
        </div>
      </div>
    </div>
  );
};

const SidebarSubItem = ({ to, label }) => (
  <Link to={to} className="block px-4 py-1.5 text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative group rounded-r-md">
    <span className="group-hover:translate-x-1 transition-transform inline-block">{label}</span>
  </Link>
);

export default DashboardLayout;
