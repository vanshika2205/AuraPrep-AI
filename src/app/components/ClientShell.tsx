'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Flame, 
  User as UserIcon,
  Sparkles,
  Settings,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isAuthenticated,
    username, 
    email,
    xp, 
    level, 
    streak, 
    badges, 
    subscriptionPlan,
    toasts,
    dismissToast,
    fetchUser, 
    loadingUser,
    logout
  } = useAppStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Public vs Protected Route Check
  const publicPaths = ['/', '/login', '/register', '/register/verify', '/forgot-password'];
  const isPublicRoute = publicPaths.includes(pathname);
  const authPaths = ['/login', '/register', '/register/verify', '/forgot-password'];
  const isAuthRoute = authPaths.includes(pathname);

  // Redirect Logic
  useEffect(() => {
    if (!loadingUser) {
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loadingUser, isPublicRoute, pathname, router]);

  // Determine active route
  const isTabActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  // XP Progress calculations (500 XP per level threshold)
  const xpInCurrentLevel = xp % 500;
  const xpPercentage = Math.round((xpInCurrentLevel / 500) * 100);
  const nextLevelXp = 500 - xpInCurrentLevel;

  // Render Loader spinner when checking session on protected route OR auth pages that might redirect
  if (loadingUser && (!isPublicRoute || isAuthRoute)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
        <p className="font-outfit font-medium text-sm animate-pulse">Initializing secure workspace...</p>
      </div>
    );
  }

  // Render direct public route without sidebar (landing page & auth cards)
  if (isPublicRoute || (!isAuthenticated && isPublicRoute)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        {/* Floating Toasts container */}
        <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      </div>
    );
  }

  // Render protected shell
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background radial aura nodes */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Sidebar navigation */}
      <aside className="w-[280px] shrink-0 border-r border-white/5 bg-slate-950/80 backdrop-blur-xl fixed h-screen z-50 flex flex-col p-6">
        {/* Brand header */}
        <div 
          onClick={() => router.push(isAuthenticated ? '/dashboard' : '/')} 
          className="flex items-center gap-3 cursor-pointer group mb-10"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-outfit font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              AuraPrep AI
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              Interview Simulator
            </span>
          </div>
        </div>

        {/* Links stack */}
        <nav className="flex-1">
          <ul className="space-y-1.5 list-none pl-0">
            <li>
              <button
                onClick={() => router.push('/dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isTabActive('/dashboard') 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.05)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/resume')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isTabActive('/resume') 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.05)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <FileText className="w-4.5 h-4.5" />
                <span>Resume Intelligence</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/learning')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isTabActive('/learning') 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.05)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <BookOpen className="w-4.5 h-4.5" />
                <span>Learning Hub</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isTabActive('/settings') 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.05)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Settings className="w-4.5 h-4.5" />
                <span>Settings & Billing</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Gamified Profile Box */}
        <div className="border-t border-white/5 pt-6 mt-auto space-y-4">
          <div className="space-y-4">
            {/* User Identity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate text-slate-200">{username}</div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {subscriptionPlan}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { logout(); router.push('/login'); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 flex items-center justify-center border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-indigo-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Level {level}
                </span>
                <span className="text-slate-500">{xpInCurrentLevel}/500 XP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Badges Drawer Peek */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                {badges.slice(0, 4).map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-sm relative group cursor-pointer"
                    title={badge.name}
                  >
                    <span>{badge.icon}</span>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-white/10 text-[10px] font-medium text-slate-200 px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                      {badge.name}
                    </div>
                  </div>
                ))}
                {badges.length > 4 && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    +{badges.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main scrolling window */}
      <div className="flex-1 pl-[280px]">
        <main className="max-w-7xl mx-auto p-8 md:p-10 min-h-screen relative z-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Toasts container */}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}

// Toast UI Notification overlay component
function ToastContainer({ toasts, dismissToast }: { toasts: any[]; dismissToast: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
      {toasts.map((toast) => {
        let typeStyles = 'bg-slate-900/95 border-slate-800 text-slate-200';
        let Icon = Info;
        
        if (toast.type === 'success') {
          typeStyles = 'bg-slate-950/95 border-emerald-500/20 text-slate-100 shadow-emerald-950/20';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          typeStyles = 'bg-slate-950/95 border-red-500/20 text-slate-100 shadow-red-950/20';
          Icon = AlertCircle;
        }
        
        return (
          <div 
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${typeStyles}`}
          >
            <div className={`mt-0.5 shrink-0 ${toast.type === 'success' ? 'text-emerald-500' : toast.type === 'error' ? 'text-red-500' : 'text-indigo-400'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
            <button 
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
