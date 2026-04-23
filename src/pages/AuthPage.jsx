import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import {
  Box,
  Lock,
  ShieldAlert,
  Key,
  Loader2,
  AlertTriangle,
  Mail,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AuthPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState({ email: '', password: '' });

  const cageImage =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...'; // same image rakh lo

  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminData.email.trim() || !adminData.password.trim()) {
      setError('Email aur password required hain');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: adminData.email,
        password: adminData.password,
      });

      const data = response.data;

      if (data?.success) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            isLoggedIn: true,
          })
        );

        navigate('/app/dashboard');
      } else {
        setError(data?.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Login failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="antialiased text-slate-800 bg-white flex flex-col min-h-screen">
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/20">
                <Box size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">
                  Ali Cages
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Inventory System
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100">
              <ShieldAlert size={12} className="text-red-500" />
              Admin Access Only
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow hero-gradient pt-32 pb-20 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
          <div className="hidden md:flex w-5/12 relative items-center justify-center overflow-hidden bg-red-950 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br z-10 from-red-900/80 to-black"></div>

            <img
              src={cageImage}
              alt="Ali Cages Inventory"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />

            <div className="relative z-20 p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Restricted Area</h2>
              <p className="text-slate-300 mb-6 font-light">
                Authorized Personnel Only
              </p>

              <div className="inline-flex items-center px-4 py-2 border border-red-500/50 rounded-lg bg-red-900/30 backdrop-blur-sm text-sm text-red-200">
                <ShieldAlert size={14} className="mr-2" /> Admin Zone
              </div>
            </div>
          </div>

          <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
            <div className="mb-10 border-b border-gray-100 pb-4">
              <div className="pb-3 text-sm font-bold text-red-600 border-b-2 border-red-600 inline-flex items-center gap-2">
                <ShieldAlert size={14} /> Admin Login
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-1">Admin Access</h3>
            <p className="text-slate-500 text-sm mb-8">
              Secure login for system administrators.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={16} />
                <span className="text-xs text-red-700 font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Gmail
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={adminData.email}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition bg-slate-50 focus:bg-white text-sm"
                    placeholder="admin@gmail.com"
                    onChange={(e) =>
                      setAdminData({ ...adminData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={adminData.password}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition bg-slate-50 focus:bg-white text-sm"
                    placeholder="Enter password"
                    onChange={(e) =>
                      setAdminData({ ...adminData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/30 transition flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Key size={16} className="mr-2" />
                )}
                {isLoading ? 'Signing In...' : 'Secure Login'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          &copy; 2026 Ali Cages Inventory System.
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;