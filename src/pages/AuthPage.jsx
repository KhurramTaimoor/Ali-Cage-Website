import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  Box, Server, Lock, ShieldAlert, Key, 
  ArrowRight, Eye, EyeOff, CheckCircle, Loader2, AlertTriangle 
} from 'lucide-react';

const AuthPage = ({ initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  
  // --- STEALTH MODE STATE ---
  const [clickCount, setClickCount] = useState(0); 
  const [showAdminTab, setShowAdminTab] = useState(false); 

  // Form States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Admin Data
  const [adminData, setAdminData] = useState({ email: '', password: '' });

  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
  }, []);

  // --- 1. THE SECRET TRIGGER LOGIC ---
  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Unlocks after 3 clicks
    if (newCount === 3) { 
      setShowAdminTab(true); 
      alert("System Alert: Administrative Gateway Unlocked");
      setClickCount(0); // Reset count
    }
  };

  // --- 2. ADMIN LOGIN HANDLER ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
        // Hardcoded check for 'admin' / 'admin'
        if (adminData.email === 'admin' && adminData.password === 'admin') {
            
            // SAVE SESSION (Critical for preventing logout)
            localStorage.setItem('user', JSON.stringify({ 
              role: 'admin', 
              name: 'Super Admin',
              isLoggedIn: true 
            }));

            navigate('/app/dashboard');
        } else {
            setError("Invalid Admin Credentials");
            setIsLoading(false);
        }
    }, 1500);
  };

  // --- 3. EMPLOYEE LOGIN HANDLER ---
  const handleEmployeeLogin = (e) => {
    e.preventDefault();
    
    // Save Employee Session
    localStorage.setItem('user', JSON.stringify({ 
        role: 'employee', 
        name: 'John Doe',
        isLoggedIn: true 
    }));

    navigate('/app/dashboard');
  };

  return (
    <div className="antialiased text-slate-800 bg-white flex flex-col min-h-screen">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/20">
                <Box size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">CageMaster</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enterprise System</span>
              </div>
            </Link>
            
            {/* --- SECRET BUTTON IS HERE --- */}
            {/* Click this badge 3 times to unlock Admin */}
            <div 
                onClick={handleSecretClick} 
                className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200 cursor-pointer select-none hover:bg-slate-200 transition"
                title="Click 3 times for Admin"
            >
              <Server size={12} className={showAdminTab ? "text-red-500 animate-pulse" : "text-slate-500"} /> 
              {showAdminTab ? "GATEWAY OPEN" : "Server Status: Stable"}
            </div>

          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow hero-gradient pt-32 pb-20 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10" data-aos="zoom-in">
          
          {/* LEFT SIDE IMAGE */}
          <div className={`hidden md:flex w-5/12 relative items-center justify-center overflow-hidden transition-all duration-500 ${activeTab === 'admin' ? 'bg-red-950' : 'bg-slate-900'}`}>
            <div className={`absolute inset-0 bg-gradient-to-br z-10 ${activeTab === 'admin' ? 'from-red-900/80 to-black' : 'from-blue-900/50 to-slate-900'}`}></div>
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Warehouse" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            
            <div className="relative z-20 p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                  {activeTab === 'admin' ? "Restricted Area" : "Welcome Back"}
              </h2>
              <p className="text-slate-300 mb-6 font-light">
                  {activeTab === 'admin' ? "Authorized Personnel Only. All actions are logged." : "Secure access to the CageMaster inventory database."}
              </p>
              {activeTab === 'admin' && (
                  <div className="inline-flex items-center px-4 py-2 border border-red-500/50 rounded-lg bg-red-900/30 backdrop-blur-sm text-sm text-red-200">
                    <ShieldAlert size={14} className="mr-2" /> Level 5 Security
                  </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE FORMS */}
          <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
            
            {/* TABS */}
            <div className="flex space-x-6 mb-10 border-b border-gray-100 pb-1">
              <button onClick={() => setActiveTab('login')} className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Employee Login</button>
              <button onClick={() => setActiveTab('signup')} className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Create Account</button>
              
              {/* HIDDEN ADMIN TAB - Appears after 3 clicks */}
              {showAdminTab && (
                  <button 
                    onClick={() => setActiveTab('admin')} 
                    className={`pb-3 text-sm font-bold transition-colors ml-auto flex items-center animate-fade-in ${activeTab === 'admin' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <ShieldAlert size={14} className="mr-1" /> Admin
                  </button>
              )}
            </div>

            {/* EMPLOYEE LOGIN FORM */}
            {activeTab === 'login' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Employee Portal</h3>
                <p className="text-slate-500 text-sm mb-8">Enter your credentials to access your dashboard.</p>
                <form onSubmit={handleEmployeeLogin}>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                    <input type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white text-sm" placeholder="employee@cagemaster.com" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white text-sm pr-10" 
                        placeholder="••••••••" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* SIGNUP FORM */}
            {activeTab === 'signup' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">New Registration</h3>
                <p className="text-slate-500 text-sm mb-6">Create a new employee profile.</p>
                <form>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                    <input className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm" placeholder="First Name" />
                    <input className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm" placeholder="Last Name" />
                   </div>
                   <div className="mb-4"><input className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm" placeholder="Work Email" /></div>
                   <div className="grid grid-cols-2 gap-4 mb-6">
                    <input type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm" placeholder="Password" />
                    <input type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm" placeholder="Confirm" />
                   </div>
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> Create Account
                  </button>
                </form>
              </div>
            )}

            {/* --- STEALTH ADMIN LOGIN FORM --- */}
            {activeTab === 'admin' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">High Security</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Admin Access</h3>
                <p className="text-slate-500 text-sm mb-8">Secure login for system administrators.</p>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 flex items-center">
                        <AlertTriangle className="text-red-500 mr-2" size={16} />
                        <span className="text-xs text-red-700 font-bold">{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleAdminLogin}>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Admin ID</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400"><ShieldAlert size={16} /></span>
                      <input 
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition bg-slate-50 focus:bg-white text-sm" 
                        placeholder="admin"
                        onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400"><Lock size={16} /></span>
                      <input 
                        type="password" 
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition bg-slate-50 focus:bg-white text-sm" 
                        placeholder="admin" 
                        onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                       />
                    </div>
                  </div>
                  <button disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/30 transition transform hover:-translate-y-0.5 flex items-center justify-center">
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Key size={16} className="mr-2" />}
                    Secure Login
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">&copy; 2026 CageMaster Systems.</div>
      </footer>
    </div>
  );
};

export default AuthPage;