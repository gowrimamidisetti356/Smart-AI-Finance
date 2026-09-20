import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthPage() {
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Welcome back! Logged in successfully.', 'success');
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        await register(name.trim(), email, password);
        showToast('Account created successfully! Welcome to Smart AI Finance.', 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      showToast('Logged in as Demo User with sample data.', 'success');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0B0F19] to-indigo-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decorative Ambient Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Center Container */}
      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto py-8 z-10">
        {/* Branding Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 mx-auto mb-4 transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-2">
            Smart AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Finance</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Your Personal AI Financial Advisor & Real-time Wealth Guardian
          </p>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="w-full max-w-md bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 animate-slide-up">
          {/* Tab Switcher: Login vs Register */}
          <div className="grid grid-cols-2 p-1 bg-black/20 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 mb-3">Want to test the backend immediately?</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>1-Click Demo Account Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-white/5 z-10">
        <div>&copy; {new Date().getFullYear()} Smart AI Finance. All rights reserved.</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Neon PostgreSQL Encrypted
          </span>
        </div>
      </footer>
    </div>
  );
}
