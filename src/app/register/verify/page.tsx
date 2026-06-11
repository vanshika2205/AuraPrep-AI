'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, KeyRound } from 'lucide-react';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, showToast } = useAppStore();
  
  const email = searchParams.get('email') || '';
  const otpFromUrl = searchParams.get('otp') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract email and auto-fill OTP for developer sandbox mode
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
    if (otpFromUrl) {
      setOtp(otpFromUrl);
    }
  }, [email, otpFromUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await verifyOtp(email, otp);
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrorMsg(res.error || 'Verification failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Brand logo */}
      <div className="flex items-center gap-3 mb-8 z-10">
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

      {/* Verification Card */}
      <div className="w-full max-w-[440px] glass-panel rounded-3xl p-8 backdrop-blur z-10 space-y-6 border border-white/5 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h2 className="font-outfit font-bold text-2xl text-slate-100">Verify your email</h2>
          <p className="text-xs text-slate-400 font-medium">We sent a 6-digit confirmation code to:</p>
          <p className="text-xs text-indigo-400 font-semibold truncate max-w-full">{email}</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // numbers only
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-center text-lg tracking-[0.4em] font-bold text-indigo-400 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:border-indigo-500/50"
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
            ) : 'Verify Code'}
          </button>
        </form>

        {/* Mocking notice box */}
        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-[11px] leading-relaxed text-center">
          <span className="font-bold">Sandbox Developer Mode:</span> Check your browser dev console or terminal logs for the OTP code, or type any 6 digits (Mock OTP will be output inside the registration response for convenience).
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Wrong email address?{' '}
          <button 
            type="button"
            onClick={() => router.push('/register')}
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Go back
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
        <p className="font-outfit font-medium text-sm animate-pulse">Initializing verification screen...</p>
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}
