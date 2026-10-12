import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight, Wallet, TrendingUp, Sparkles, BrainCircuit, CheckCircle2, User, Loader2 } from 'lucide-react';

export default function AuthPage({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'onboarding'
  const [showPassword, setShowPassword] = useState(false);
  const [incomeType, setIncomeType] = useState(null); // 'salaried' | 'irregular'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setView('onboarding');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setView('onboarding');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (incomeType) {
      onLogin(); // complete onboarding and login
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-between p-4 font-sans selection:bg-purple-100">
      
      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto py-12">
        
        {/* Top Header / Branding */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="w-16 h-16 bg-gradient-to-tr from-finance-purple to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto flex-shrink-0 mb-6 transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Smart AI Finance Guardian
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto relative group">
            Your Personal AI Agent for Smarter Money Decisions
            <span className="absolute -bottom-2 left-1/2 w-12 h-1 bg-gradient-to-r from-finance-purple to-indigo-500 rounded-full transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 overflow-hidden relative backdrop-blur-sm animate-in fade-in zoom-in-[0.98] duration-500 delay-150">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-finance-purple via-indigo-500 to-emerald-400"></div>
          
          <div className="p-8 sm:p-10">
            {view === 'login' || view === 'signup' ? (
              <form onSubmit={view === 'login' ? handleLoginSubmit : handleSignupSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                  <p className="text-sm text-gray-400 mt-2">{view === 'login' ? 'Securely login to your financial hub' : 'Join thousands of users managing money better'}</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm py-2.5 px-4 rounded-xl text-center animate-shake">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  {view === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-finance-purple/20 focus:border-finance-purple focus:bg-white transition-all shadow-sm bg-gray-50"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-finance-purple/20 focus:border-finance-purple focus:bg-white transition-all shadow-sm bg-gray-50"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      {view === 'login' && <a href="#" className="text-sm font-semibold text-finance-purple hover:text-finance-purple/80 transition-colors">Forgot password?</a>}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-finance-purple/20 focus:border-finance-purple focus:bg-white transition-all shadow-sm bg-gray-50"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      >
                       {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {view === 'login' && (
                  <div className="flex items-center ml-1">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="w-4 h-4 text-finance-purple bg-gray-100 border-gray-300 rounded focus:ring-finance-purple cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-finance-purple to-[#8B5CF6] hover:from-[#5A38A9] hover:to-[#7444D8] text-white rounded-xl font-bold text-[15px] shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'login' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />)}
                  {view === 'login' ? 'Secure Login' : 'Create Account'}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    {view === 'login' ? "New user?" : "Already have an account?"}{' '}
                    <button type="button" onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="font-semibold text-finance-purple hover:text-finance-purple/80 transition-colors">
                      {view === 'login' ? 'Create account' : 'Login here'}
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Tell us about your income style</h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    To create a personalized financial plan, our AI agent needs to understand how you earn.
                  </p>
                </div>

                <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                  <div className="space-y-4">
                    
                    {/* Salaried Option */}
                    <label className={`block relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${incomeType === 'salaried' ? 'border-finance-purple bg-purple-50/50 shadow-md shadow-purple-500/10' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="income_type" 
                        value="salaried" 
                        onChange={() => setIncomeType('salaried')}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 transition-colors duration-200 ${incomeType === 'salaried' ? 'bg-finance-purple text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`text-base font-bold ${incomeType === 'salaried' ? 'text-gray-900' : 'text-gray-700'}`}>Salaried</h4>
                          <p className={`text-sm mt-1 ${incomeType === 'salaried' ? 'text-purple-900/70' : 'text-gray-500'}`}>I receive a consistent salary every month.</p>
                        </div>
                        {incomeType === 'salaried' && (
                          <div className="absolute top-5 right-5 text-finance-purple animate-in zoom-in duration-200">
                            <CheckCircle2 className="w-6 h-6 fill-current text-white/90 drop-shadow-sm" />
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Irregular Income Option */}
                    <label className={`block relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${incomeType === 'irregular' ? 'border-[#3B82F6] bg-blue-50/50 shadow-md shadow-blue-500/10' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="income_type" 
                        value="irregular" 
                        onChange={() => setIncomeType('irregular')}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 transition-colors duration-200 ${incomeType === 'irregular' ? 'bg-[#3B82F6] text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`text-base font-bold ${incomeType === 'irregular' ? 'text-gray-900' : 'text-gray-700'}`}>Irregular Income</h4>
                          <p className={`text-sm mt-1 ${incomeType === 'irregular' ? 'text-blue-900/70' : 'text-gray-500'}`}>My income varies week to week or month to month (Freelancer, Business).</p>
                        </div>
                        {incomeType === 'irregular' && (
                          <div className="absolute top-5 right-5 text-[#3B82F6] animate-in zoom-in duration-200">
                            <CheckCircle2 className="w-6 h-6 fill-current text-white/90 drop-shadow-sm" />
                          </div>
                        )}
                      </div>
                    </label>

                  </div>

                  <button 
                    type="submit" 
                    disabled={!incomeType}
                    className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-[15px] transition-all duration-300 ${incomeType ? 'bg-gradient-to-r from-finance-purple to-[#8B5CF6] hover:from-[#5A38A9] hover:to-[#7444D8] text-white shadow-lg shadow-purple-500/25 transform hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Continue to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <div className="mt-4 text-center">
                    <button 
                      type="button" 
                      onClick={() => setView('login')}
                      className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors cursor-pointer"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 space-y-4 sm:space-y-0 px-6 border-t border-gray-200/50 mt-auto">
        <div>
          &copy; {new Date().getFullYear()} Smart AI Finance Guardian. All rights reserved.
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}