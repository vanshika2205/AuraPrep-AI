'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAppStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength logic
  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await register(username, email, password, confirmPassword);
    setLoading(false);

    if (res.success) {
      // Redirect to verification OTP page, passing the email and otp parameters for sandbox helper prefill
      router.push(`/register/verify?email=${encodeURIComponent(email)}&otp=${res.otp || ''}`);
    } else {
      setErrorMsg(res.error || 'Failed to register account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Brand logo */}
      <div className="flex items-center gap-3 cursor-pointer group mb-8 z-10" onClick={() => router.push('/')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5.5 h-5.5" />
        </div>
        <div>
          <h1 className="font-outfit font-extrabold text-xl leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            AuraPrep AI
          </h1>
          <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Interview Simulator</span>
        </div>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-[440px] glass-panel rounded-3xl p-8 backdrop-blur z-10 space-y-6 border border-white/5 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h2 className="font-outfit font-bold text-2xl text-slate-100">Create account</h2>
          <p className="text-xs text-slate-400 font-medium">Join AuraPrep to simulate professional interview boards.</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Your Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {/* Password strength bar */}
            {password && (
              <div className="space-y-1.5 pt-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
                  <span className="text-slate-500">Security strength</span>
                  <span className={strength.label === 'Strong' ? 'text-emerald-400' : strength.label === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${strength.color}`} 
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold font-outfit text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
