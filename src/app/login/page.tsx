'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginOAuth, showToast } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    
    const res = await login(email, password, rememberMe);
    setLoading(false);
    
    if (res.success) {
      router.push('/dashboard');
    } else if (res.requiresVerification) {
      // Route directly to OTP verification page
      router.push(`/register/verify?email=${encodeURIComponent(res.email || '')}`);
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  // Mock Social OAuth Trigger
  const handleSocialLogin = async (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    showToast(`Initiating ${provider} login simulation...`, 'info');
    
    // Simulate API latency
    setTimeout(async () => {
      const mockEmail = `${provider.toLowerCase()}_developer@auraprep.ai`;
      const mockUsername = `${provider} Practitioner`;
      const success = await loginOAuth(provider, mockEmail, mockUsername);
      setLoading(false);
      if (success) {
        router.push('/dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background Radial Aura Nodes */}
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

      {/* Login Card */}
      <div className="w-full max-w-[440px] glass-panel rounded-3xl p-8 backdrop-blur z-10 space-y-6 relative border border-white/5 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h2 className="font-outfit font-bold text-2xl text-slate-100">Welcome back</h2>
          <p className="text-xs text-slate-400 font-medium">Continue your streak and elevate your skills.</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Password</label>
              <button 
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter password"
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
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 font-medium select-none cursor-pointer">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-slate-950 border border-white/10 rounded accent-indigo-500 focus:ring-0"
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold font-outfit text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative px-3 bg-slate-950 text-[10px] font-semibold text-slate-500 tracking-widest uppercase">Or continue with</span>
        </div>

        {/* Social logins */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => handleSocialLogin('Google')}
            className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-xs text-slate-300 font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {/* Simple Mock Google Icon svg */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          <button 
            type="button" 
            onClick={() => handleSocialLogin('GitHub')}
            className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-xs text-slate-300 font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-200 fill-slate-200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Don&apos;t have an account?{' '}
          <button 
            type="button"
            onClick={() => router.push('/register')}
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
