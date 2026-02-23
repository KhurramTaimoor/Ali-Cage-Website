import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  Box, LogIn, Menu, ShieldCheck, ArrowRight, 
  Boxes, ClipboardList, TrendingUp, Check, CircleCheck 
} from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize Animations and Scroll Listener
  useEffect(() => {
    AOS.init({
      once: true,
      offset: 50,
      duration: 800,
      easing: 'ease-out-cubic',
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="antialiased">
      {/* NAVBAR */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 border-b border-gray-100 ${
          isScrolled ? 'bg-white/95 shadow-md' : 'glass-nav'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/20">
                <Box size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">CageMaster</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enterprise System</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-700 transition">System Modules</a>
              <a href="#analytics" className="text-sm font-semibold text-slate-600 hover:text-blue-700 transition">Analytics</a>
              
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </div>
            </div>
            
            {/* Login Button */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm flex items-center gap-2">
                <LogIn size={16} className="text-slate-400" /> Login / Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button className="text-slate-600 focus:outline-none">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HEADER / HERO SECTION */}
      <header className="hero-gradient relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div data-aos="fade-right" data-aos-duration="1000">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-sm">
                <ShieldCheck size={14} /> Secure Corporate Environment
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Inventory & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-white">Workforce Logic.</span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg font-light">
                A centralized dashboard engineered for cage manufacturing and sales. Monitor stock levels, track employee DWRs, and generate PDF audits in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] transition transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-blue-500">
                  Access Admin Portal <ArrowRight size={18} />
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-800 pt-8">
                <div>
                  <div className="text-2xl font-bold text-white">2.5k+</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Units in Stock</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Secure</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">SSL Encrypted</div>
                </div>
              </div>
            </div>

            {/* Right Content - 3D Dashboard Mockup */}
            <div className="relative hidden lg:block" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="200">
              <div className="glass rounded-xl p-1 shadow-2xl animate-float relative z-20">
                <div className="bg-slate-900/80 rounded-lg overflow-hidden border border-slate-700/50">
                  {/* Mock Browser Header */}
                  <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">dashboard_view.php</div>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                        <div className="text-slate-400 text-[10px] uppercase mb-1">Daily Revenue</div>
                        <div className="text-white text-xl font-mono">$12,450.00</div>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                        <div className="text-slate-400 text-[10px] uppercase mb-1">Low Stock Items</div>
                        <div className="text-orange-400 text-xl font-mono">12 Items</div>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                        <div className="text-slate-400 text-[10px] uppercase mb-1">Active Employees</div>
                        <div className="text-green-400 text-xl font-mono">18 Active</div>
                      </div>
                    </div>

                    {/* Mock Chart Bars */}
                    <div className="flex items-end justify-between h-40 gap-3 px-2">
                      <div className="w-full bg-slate-700/30 rounded-t h-[30%]"></div>
                      <div className="w-full bg-slate-700/30 rounded-t h-[50%]"></div>
                      <div className="w-full bg-blue-600 rounded-t h-[75%] shadow-[0_0_15px_rgba(37,99,235,0.5)] relative"></div>
                      <div className="w-full bg-slate-700/30 rounded-t h-[45%]"></div>
                      <div className="w-full bg-slate-700/30 rounded-t h-[60%]"></div>
                      <div className="w-full bg-slate-700/30 rounded-t h-[40%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Alert */}
              <div 
                className="absolute -bottom-6 -right-6 z-30 bg-white p-4 rounded-lg shadow-xl border-l-4 border-green-500 flex items-center gap-4 animate-bounce" 
                style={{ animationDuration: '3s' }}
              >
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Check size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">System Alert</div>
                  <div className="text-sm font-bold text-slate-800">Daily Report Generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div data-aos="fade-right">
              <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Internal Modules</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Operational Capabilities</h3>
            </div>
            <div className="mt-4 md:mt-0 text-slate-500 text-sm max-w-sm text-right" data-aos="fade-left">
              Manage your entire supply chain from raw materials to final customer delivery.
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 group hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden" data-aos="fade-up" data-aos-delay="0">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-6 relative z-10 shadow-lg shadow-blue-500/30">
                <Boxes size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Inventory Control</h4>
              <p className="text-slate-500 leading-relaxed text-sm relative z-10">
                Complete database of cages, accessories, and raw parts. Features include category sorting, low-stock triggers, and supplier management.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 group hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden" data-aos="fade-up" data-aos-delay="100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white mb-6 relative z-10 shadow-lg shadow-purple-500/30">
                <ClipboardList size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Employee & DWR</h4>
              <p className="text-slate-500 leading-relaxed text-sm relative z-10">
                Digital "Daily Working Reports". Employees log tasks daily. Admin panel allows performance review and attendance tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 group hover:border-green-500/30 transition-all duration-300 relative overflow-hidden" data-aos="fade-up" data-aos-delay="200">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white mb-6 relative z-10 shadow-lg shadow-green-500/30">
                <TrendingUp size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Sales & Export</h4>
              <p className="text-slate-500 leading-relaxed text-sm relative z-10">
                Generate invoices and track revenue. One-click PDF generation for monthly sales reports and inventory audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section id="analytics" className="py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2" data-aos="fade-right">
              <div className="w-12 h-1 bg-blue-600 mb-6"></div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Data Visualization Engine</h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                The dashboard converts raw data into actionable intelligence. View sales trends over time, compare employee efficiency, and identify your best-selling cage models instantly.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Real-time Stock Updates",
                  "PDF/CSV Data Export",
                  "Employee Efficiency Metrics"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-slate-700 font-medium">
                    <CircleCheck size={20} className="text-blue-600 mr-3" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2 relative" data-aos="fade-left">
              <div className="absolute -inset-4 bg-gradient-to-r from-slate-100 to-blue-50 rounded-3xl transform -rotate-2"></div>
              
              <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Revenue Overview</h4>
                    <p className="text-xs text-slate-400">Jan 01 - Jan 31, 2026</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold">Monthly View</div>
                </div>
                
                <div className="flex items-end justify-between h-56 gap-4 pb-4 border-b border-slate-100">
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-slate-100 rounded-t-sm h-16 group-hover:bg-blue-200 transition-all duration-500 relative"></div>
                    <span className="text-xs text-slate-400">W1</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-slate-100 rounded-t-sm h-24 group-hover:bg-blue-200 transition-all duration-500"></div>
                    <span className="text-xs text-slate-400">W2</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-blue-600 rounded-t-sm h-40 shadow-lg shadow-blue-500/40 relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-100">$8,400</div>
                    </div>
                    <span className="text-xs text-slate-800 font-bold">W3</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-slate-100 rounded-t-sm h-32 group-hover:bg-blue-200 transition-all duration-500"></div>
                    <span className="text-xs text-slate-400">W4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="font-bold text-lg text-white">CageMaster.</span>
              <span className="ml-3 text-xs bg-slate-800 px-2 py-1 rounded text-slate-500">v2.4.0 (Stable)</span>
            </div>
            <div className="text-sm">
              Authorized Personnel Only. &copy; 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;