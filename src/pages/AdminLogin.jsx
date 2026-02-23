import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Key, Server, Loader2, AlertTriangle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  // Security State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code2fa: '',
    honeypot: '' // Hidden field to catch bots
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSecureLogin = (e) => {
    e.preventDefault();

    // 1. LOCKOUT CHECK
    if (isLocked) return;

    // 2. BOT CHECK (Honeypot)
    if (formData.honeypot) {
      console.warn("Bot detected."); return; 
    }

    // 3. INPUT VALIDATION
    if (!formData.email || !formData.password || !formData.code2fa) {
      setError("All fields + 2FA are required."); return;
    }

    setIsLoading(true);

    // 4. SIMULATE SECURE VERIFICATION
    setTimeout(() => {
      // Replace with your real Admin API Check
      if (formData.email === 'admin@cagemaster.com' && formData.password === 'admin123') {
        
        // --- THIS IS THE FIX: SAVE THE SESSION ---
        // We save the user token so ProtectedRoute lets us in
        localStorage.setItem('user', JSON.stringify({ 
          role: 'admin', 
          name: 'System Administrator',
          isLoggedIn: true 
        }));
        // ----------------------------------------

        navigate('/app/dashboard');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setIsLoading(false);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setError("SECURITY ALERT: Too many failed attempts. System locked.");
        } else {
          setError(`Invalid Credentials. Attempts left: ${3 - newAttempts}`);
        }
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Red Security Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-900 to-black"></div>
      <div className="absolute w-96 h-96 bg-red-900/10 rounded-full blur-[100px] -top-20 -left-20"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        
        <div className="bg-slate-950/50 p-8 border-b border-slate-800 text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/30 text-red-500">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Restricted Access</h2>
          <p className="text-slate-500 text-sm mt-2">CageMaster Admin Gateway</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-950/30 border border-red-900/50 p-4 rounded flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSecureLogin} className="space-y-5">
            {/* HONEYPOT (Hidden) */}
            <input type="text" name="honeypot" className="hidden" autoComplete="off" onChange={handleChange} />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Admin ID</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500"><ShieldAlert size={16} /></span>
                <input type="email" name="email" onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-red-900 transition text-sm" placeholder="admin@cagemaster.com" disabled={isLocked} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500"><Lock size={16} /></span>
                <input type="password" name="password" onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-red-900 transition text-sm" placeholder="••••••••" disabled={isLocked} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Authenticator Code</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500"><Key size={16} /></span>
                <input type="text" name="code2fa" onChange={handleChange} maxLength="6" className="w-full bg-slate-950 border border-slate-800 text-red-500 font-mono tracking-[0.5em] text-center pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-red-900 transition text-sm" placeholder="000000" disabled={isLocked} />
              </div>
            </div>

            <button disabled={isLoading || isLocked} className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600 text-white'}`}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
              {isLocked ? 'SYSTEM LOCKED' : 'SECURE LOGIN'}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-950 p-3 text-center border-t border-slate-800 text-xs text-slate-600">
          IP Logged & Monitored.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;