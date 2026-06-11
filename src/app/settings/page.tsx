'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  User as UserIcon, 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  Check, 
  Zap, 
  Save, 
  Sliders
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    username, 
    email, 
    avatarUrl, 
    bio, 
    preferredRoles, 
    experienceLevel,
    subscriptionPlan,
    subscriptionUsage,
    settings,
    updateProfile,
    updateSettings,
    updateSubscription,
    showToast
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'preferences'>('profile');
  
  // Profile edit states
  const [editUsername, setEditUsername] = useState(username);
  const [editBio, setEditBio] = useState(bio);
  const [editExp, setEditExp] = useState(experienceLevel);
  const [newRole, setNewRole] = useState('');
  const [roles, setRoles] = useState<string[]>(preferredRoles);

  // Settings edit states
  const [emailAlerts, setEmailAlerts] = useState(settings.emailAlerts);
  const [soundEnabled, setSoundEnabled] = useState(settings.notificationsEnabled);
  const [isPrivate, setIsPrivate] = useState(settings.isPrivateProfile);

  const [saving, setSaving] = useState(false);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfile({
      username: editUsername,
      bio: editBio,
      experienceLevel: editExp,
      preferredRoles: roles
    });
    setSaving(false);
  };

  // Handle Preferences Save
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateSettings({
      emailAlerts,
      notificationsEnabled: soundEnabled,
      isPrivateProfile: isPrivate
    });
    setSaving(false);
  };

  // Roles tags operations
  const handleAddRole = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newRole.trim()) {
      e.preventDefault();
      if (!roles.includes(newRole.trim())) {
        setRoles([...roles, newRole.trim()]);
      }
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter((r) => r !== roleToRemove));
  };

  // Subscription upgrade trigger
  const handleUpgradePlan = async (plan: 'free' | 'pro' | 'enterprise') => {
    setSaving(true);
    const success = await updateSubscription(plan);
    setSaving(false);
  };

  // Mock Invoice History
  const invoices = [
    { id: 'INV-2026-001', date: 'June 1, 2026', amount: '$29.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'May 1, 2026', amount: '$29.00', status: 'Paid' },
    { id: 'INV-2026-003', date: 'April 1, 2026', amount: '$29.00', status: 'Paid' }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <header>
        <h1 className="font-outfit font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
          Settings & Billing
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Manage your account credentials, edit your developer profile, and monitor subscription plan limits.
        </p>
      </header>

      {/* Tabs list row */}
      <div className="flex border-b border-white/5 gap-1 pt-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Info</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Billing Portal</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Profile Form Pane */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <h2 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            Developer Profile Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Display Name</label>
              <input 
                type="text" 
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Experience Level</label>
              <select 
                value={editExp}
                onChange={(e) => setEditExp(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="Junior">Junior (0-2 years)</option>
                <option value="Mid">Mid-Level (2-5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
                <option value="Lead">Lead / Principal (8+ years)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Bio / Summary</label>
            <textarea 
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              placeholder="Tell us about your background and target career objectives..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Preferred Job Roles (Press Enter to add)</label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-950 border border-white/5 rounded-xl min-h-[48px] items-center">
              {roles.map((role) => (
                <span 
                  key={role} 
                  className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 animate-in scale-in duration-100"
                >
                  <span>{role}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRole(role)}
                    className="hover:text-indigo-200 text-indigo-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input 
                type="text" 
                placeholder={roles.length === 0 ? "e.g. Frontend Engineer, Product Architect" : "Add role..."}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={handleAddRole}
                className="bg-transparent border-0 outline-none text-xs text-slate-300 focus:ring-0 p-1 flex-1 min-w-[120px]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Info</span>
          </button>
        </form>
      )}

      {/* Billing Portal Pane */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Subscription Usage progress */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-outfit font-bold text-base text-slate-100">Plan Usage Limits</h3>
                <p className="text-xs text-slate-400">Mock assessments initiated in current billing cycle.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                {subscriptionPlan} Active
              </span>
            </div>

            {/* Usage Progress Meter */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Interviews Created</span>
                <span>{subscriptionUsage.interviewsThisMonth} / {subscriptionUsage.interviewLimit === 9999 ? '∞' : subscriptionUsage.interviewLimit}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(100, (subscriptionUsage.interviewsThisMonth / (subscriptionUsage.interviewLimit === 9999 ? 1 : subscriptionUsage.interviewLimit)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* SaaS Tiers upgraders grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Free plan */}
            <div className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border ${subscriptionPlan === 'free' ? 'border-indigo-500/30 bg-indigo-500/2 shadow-lg shadow-indigo-500/2' : ''}`}>
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-200">Free Tier</h4>
                <div className="text-xl font-extrabold font-outfit text-white">$0 <span className="text-[10px] text-slate-500 font-semibold uppercase">/ mo</span></div>
                <p className="text-[10px] text-slate-400 leading-normal">5 mock sessions. Strict AI personality only.</p>
              </div>
              {subscriptionPlan === 'free' ? (
                <div className="w-full text-center py-1.5 rounded-lg border border-indigo-500/20 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 mt-4">
                  CURRENT TIER
                </div>
              ) : (
                <button 
                  onClick={() => handleUpgradePlan('free')}
                  disabled={saving}
                  className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-slate-800 text-[10px] font-bold text-slate-300 mt-4 transition-all cursor-pointer"
                >
                  Downgrade Plan
                </button>
              )}
            </div>

            {/* Pro plan */}
            <div className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border ${subscriptionPlan === 'pro' ? 'border-indigo-500/40 bg-indigo-500/2 shadow-lg shadow-indigo-500/2' : ''}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-200 font-outfit">Pro Developer</h4>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-[8px] font-bold text-indigo-400">BEST VALUE</span>
                </div>
                <div className="text-xl font-extrabold font-outfit text-white">$29 <span className="text-[10px] text-slate-500 font-semibold uppercase">/ mo</span></div>
                <p className="text-[10px] text-slate-400 leading-normal">25 mock sessions. All Personalities, Resume intelligent roadmaps, Code sandboxes.</p>
              </div>
              {subscriptionPlan === 'pro' ? (
                <div className="w-full text-center py-1.5 rounded-lg border border-indigo-500/20 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 mt-4">
                  CURRENT TIER
                </div>
              ) : (
                <button 
                  onClick={() => handleUpgradePlan('pro')}
                  disabled={saving}
                  className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold mt-4 transition-all cursor-pointer shadow shadow-indigo-500/10"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Enterprise plan */}
            <div className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border ${subscriptionPlan === 'enterprise' ? 'border-indigo-500/30 bg-indigo-500/2 shadow-lg shadow-indigo-500/2' : ''}`}>
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-200">Enterprise</h4>
                <div className="text-xl font-extrabold font-outfit text-white">$99 <span className="text-[10px] text-slate-500 font-semibold uppercase">/ mo</span></div>
                <p className="text-[10px] text-slate-400 leading-normal">Unlimited mock sessions. Custom roles, Job descriptions targeting, Support SLA.</p>
              </div>
              {subscriptionPlan === 'enterprise' ? (
                <div className="w-full text-center py-1.5 rounded-lg border border-indigo-500/20 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 mt-4">
                  CURRENT TIER
                </div>
              ) : (
                <button 
                  onClick={() => handleUpgradePlan('enterprise')}
                  disabled={saving}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-white/5 mt-4 transition-all cursor-pointer"
                >
                  Request Enterprise
                </button>
              )}
            </div>
          </div>

          {/* Invoices list */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-outfit font-bold text-base text-slate-200 mb-4">Invoice Ledger History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Invoice ID</th>
                    <th className="py-2.5">Billing Date</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5 text-right">Receipt Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/10">
                      <td className="py-3 font-semibold text-slate-300">{inv.id}</td>
                      <td className="py-3">{inv.date}</td>
                      <td className="py-3 font-semibold text-slate-300">{inv.amount}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold uppercase text-[9px]">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Form Pane */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="glass-panel rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
          <h2 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Alert Preferences & Notifications
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 select-none cursor-pointer">
              <input 
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4.5 h-4.5 mt-0.5 bg-slate-950 border border-white/10 rounded accent-indigo-500 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">Email Reports</div>
                <div className="text-[10px] text-slate-500 font-medium leading-relaxed">Receive complete scorecard critique reports and complexity analysis breakdowns to your email address.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 select-none cursor-pointer border-t border-white/5 pt-4">
              <input 
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4.5 h-4.5 mt-0.5 bg-slate-950 border border-white/10 rounded accent-indigo-500 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">HUD Sound Effects</div>
                <div className="text-[10px] text-slate-500 font-medium leading-relaxed">Enable system vocal signals, sound notifications, and audio analyser calibration alerts.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 select-none cursor-pointer border-t border-white/5 pt-4">
              <input 
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4.5 h-4.5 mt-0.5 bg-slate-950 border border-white/10 rounded accent-indigo-500 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">Private Profile View</div>
                <div className="text-[10px] text-slate-500 font-medium leading-relaxed">Hide your mock scorecards, unlocked milestone badges, and profile metrics from public web searches.</div>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>
      )}
    </div>
  );
}
