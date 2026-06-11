'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, Mail, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useAppStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [step, setStep] = useState(1); // Step 1: request code, Step 2: verify and change password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Step 1 request reset code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`A password reset code has been generated: ${res.otp} (Sandbox mode code).`);
      if (res.otp) {
        setOtp(res.otp);
      }
      setStep(2);
    } else {
      setErrorMsg(res.error || 'Failed to send password reset code.');
    }
  };

  // Handle Step 2 reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmNewPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await resetPassword({ email, otp, newPassword, confirmNewPassword });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setErrorMsg(res.error || 'Password reset failed.');
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

      {/* Main card */}
      <div className="w-full max-w-[440px] glass-panel rounded-3xl p-8 backdrop-blur z-10 space-y-6 border border-white/5 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h2 className="font-outfit font-bold text-2xl text-slate-100">Reset password</h2>
          <p className="text-xs text-slate-400 font-medium">
            {step === 1 ? 'Enter your email to receive a password reset code.' : 'Enter the verification code and your new password.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium leading-normal">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          // Step 1 Form
          <form onSubmit={handleRequestOtp} className="space-y-4">
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold font-outfit text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          // Step 2 Form
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* OTP Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
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
              ) : 'Update Password'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 font-medium">
          Remember your password?{' '}
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
