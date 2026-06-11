import { create } from 'zustand';

export interface IBadge {
  name: string;
  icon: string;
  dateUnlocked: string;
}

export interface IRoadmapTopic {
  _id?: string;
  topic: string;
  difficulty: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  resources: { title: string; url: string }[];
}

export interface IToast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // Authentication & Verification State
  isAuthenticated: boolean;
  isVerified: boolean;
  loadingUser: boolean;
  
  // User Profile fields
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  preferredRoles: string[];
  experienceLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  
  // Gamified & Learning Stats
  xp: number;
  level: number;
  streak: number;
  badges: IBadge[];
  resumeText: string;
  resumeSkills: string[];
  resumeWeaknesses: string[];
  learningRoadmap: IRoadmapTopic[];
  
  // Subscription parameters
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  subscriptionUsage: { interviewsThisMonth: number; interviewLimit: number };
  
  // Settings
  settings: {
    theme: 'dark' | 'light';
    notificationsEnabled: boolean;
    emailAlerts: boolean;
    isPrivateProfile: boolean;
  };

  // Toast UI alerts
  toasts: IToast[];

  // Action Methods
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  
  fetchUser: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string; error?: string }>;
  loginOAuth: (provider: string, mockEmail: string, mockUsername: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string; otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; otp?: string }>;
  resetPassword: (payload: any) => Promise<{ success: boolean; error?: string }>;
  
  updateProfile: (data: any) => Promise<boolean>;
  updateSettings: (data: any) => Promise<boolean>;
  updateSubscription: (plan: 'free' | 'pro' | 'enterprise') => Promise<boolean>;
  
  addXp: (amount: number) => Promise<void>;
  completeRoadmapTopic: (topicId: string, status: 'todo' | 'in_progress' | 'done') => Promise<void>;
  setResumeData: (data: { skills: string[]; weaknesses: string[]; text: string; roadmap?: any[] }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isVerified: false,
  loadingUser: false,
  
  username: 'Candidate',
  email: '',
  avatarUrl: '',
  bio: '',
  preferredRoles: [],
  experienceLevel: 'Mid',
  
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  resumeText: '',
  resumeSkills: [],
  resumeWeaknesses: [],
  learningRoadmap: [],
  
  subscriptionPlan: 'free',
  subscriptionUsage: { interviewsThisMonth: 0, interviewLimit: 5 },
  
  settings: {
    theme: 'dark',
    notificationsEnabled: true,
    emailAlerts: true,
    isPrivateProfile: false
  },

  toasts: [],

  // Toast UI management
  showToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      get().dismissToast(id);
    }, 3500);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  // Fetch User Info
  fetchUser: async () => {
    try {
      set({ loadingUser: true });
      const res = await fetch('/api/user/profile');
      const json = await res.json();
      if (json.success && json.data) {
        set({
          isAuthenticated: true,
          isVerified: json.data.isVerified,
          username: json.data.username,
          email: json.data.email,
          avatarUrl: json.data.avatarUrl,
          bio: json.data.bio,
          preferredRoles: json.data.preferredRoles || [],
          experienceLevel: json.data.experienceLevel || 'Mid',
          xp: json.data.xp,
          level: json.data.level,
          streak: json.data.streak,
          badges: json.data.badges,
          resumeText: json.data.resumeText,
          resumeSkills: json.data.resumeSkills,
          resumeWeaknesses: json.data.resumeWeaknesses,
          learningRoadmap: json.data.learningRoadmap,
          subscriptionPlan: json.data.subscriptionPlan || 'free',
          subscriptionUsage: json.data.subscriptionUsage || { interviewsThisMonth: 0, interviewLimit: 5 },
          settings: json.data.settings || { theme: 'dark', notificationsEnabled: true, emailAlerts: true, isPrivateProfile: false }
        });
      } else {
        set({ isAuthenticated: false });
      }
    } catch (err) {
      console.error('Failed to fetch user profiles:', err);
      set({ isAuthenticated: false });
    } finally {
      set({ loadingUser: false });
    }
  },

  // Login credentials flow
  login: async (email, password, rememberMe) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const json = await res.json();
      if (json.success) {
        get().showToast('Login successful! Welcome back.', 'success');
        await get().fetchUser();
        return { success: true };
      } else {
        get().showToast(json.error || 'Login failed.', 'error');
        if (json.requiresVerification) {
          return { success: false, requiresVerification: true, email: json.email };
        }
        return { success: false, error: json.error };
      }
    } catch (err: any) {
      get().showToast('Failed to connect to authentication server.', 'error');
      return { success: false, error: err.message };
    }
  },

  // Simulated Google/GitHub OAuth login
  loginOAuth: async (provider, mockEmail, mockUsername) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMockOAuth: true,
          provider,
          mockEmail,
          mockUsername
        })
      });
      const json = await res.json();
      if (json.success) {
        get().showToast(`Welcome! Logged in with ${provider} successfully.`, 'success');
        await get().fetchUser();
        return true;
      }
      get().showToast(json.error || 'OAuth verification failed.', 'error');
      return false;
    } catch (err) {
      get().showToast('Failed to connect to OAuth service.', 'error');
      return false;
    }
  },

  // Sign up credentials flow
  register: async (username, email, password, confirmPassword) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });
      const json = await res.json();
      if (json.success) {
        get().showToast('Account registered! OTP verification code sent.', 'success');
        return { success: true, otp: json.otp };
      }
      get().showToast(json.error || 'Registration failed.', 'error');
      return { success: false, error: json.error };
    } catch (err: any) {
      get().showToast('Server connection failed.', 'error');
      return { success: false, error: err.message };
    }
  },

  // Confirm registration OTP
  verifyOtp: async (email, otp) => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const json = await res.json();
      if (json.success) {
        get().showToast('Account verified and activated!', 'success');
        await get().fetchUser();
        return { success: true };
      }
      get().showToast(json.error || 'Invalid OTP code.', 'error');
      return { success: false, error: json.error };
    } catch (err: any) {
      get().showToast('Activation failed.', 'error');
      return { success: false, error: err.message };
    }
  },

  // Terminate session cookie
  logout: async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        set({
          isAuthenticated: false,
          isVerified: false,
          username: 'Candidate',
          email: '',
          avatarUrl: '',
          bio: '',
          preferredRoles: [],
          badges: [],
          learningRoadmap: [],
          resumeSkills: [],
          resumeWeaknesses: []
        });
        get().showToast('Logged out successfully.', 'info');
      }
    } catch (err) {
      get().showToast('Failed to log out.', 'error');
    }
  },

  // Forgot password request
  forgotPassword: async (email) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (json.success) {
        get().showToast('Password reset code generated and sent.', 'success');
        return { success: true, otp: json.otp };
      }
      get().showToast(json.error || 'Error sending password reset.', 'error');
      return { success: false, error: json.error };
    } catch (err: any) {
      get().showToast('Server connection error.', 'error');
      return { success: false, error: err.message };
    }
  },

  // Reset password
  resetPassword: async (payload) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        get().showToast('Password reset successful! You can now login.', 'success');
        return { success: true };
      }
      get().showToast(json.error || 'Password reset failed.', 'error');
      return { success: false, error: json.error };
    } catch (err: any) {
      get().showToast('Failed to reset password.', 'error');
      return { success: false, error: err.message };
    }
  },

  // Update Profile
  updateProfile: async (data) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.data) {
        set({
          username: json.data.username,
          avatarUrl: json.data.avatarUrl,
          bio: json.data.bio,
          preferredRoles: json.data.preferredRoles || [],
          experienceLevel: json.data.experienceLevel || 'Mid'
        });
        get().showToast('Profile updated successfully!', 'success');
        return true;
      }
      get().showToast(json.error || 'Failed to save profile.', 'error');
      return false;
    } catch (err) {
      get().showToast('Failed to save profile changes.', 'error');
      return false;
    }
  },

  // Update Settings
  updateSettings: async (data) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data })
      });
      const json = await res.json();
      if (json.success && json.data) {
        set({ settings: json.data.settings });
        get().showToast('Settings saved.', 'success');
        return true;
      }
      get().showToast('Failed to save settings.', 'error');
      return false;
    } catch (err) {
      get().showToast('Failed to update settings preferences.', 'error');
      return false;
    }
  },

  // Update Subscription Plan tier
  updateSubscription: async (plan) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionPlan: plan })
      });
      const json = await res.json();
      if (json.success && json.data) {
        set({
          subscriptionPlan: json.data.subscriptionPlan,
          subscriptionUsage: json.data.subscriptionUsage
        });
        get().showToast(`Plan updated to ${plan.toUpperCase()} successfully!`, 'success');
        return true;
      }
      get().showToast('Subscription billing sync failed.', 'error');
      return false;
    } catch (err) {
      get().showToast('Failed to change subscription plan.', 'error');
      return false;
    }
  },

  addXp: async (amount: number) => {
    try {
      const currentXp = get().xp + amount;
      const currentLevel = Math.floor(currentXp / 500) + 1;
      const leveledUp = currentLevel > get().level;

      set({ xp: currentXp, level: currentLevel });

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: amount })
      });
      const json = await res.json();
      if (json.success && json.data) {
        set({
          xp: json.data.xp,
          level: json.data.level,
          badges: json.data.badges
        });
        if (leveledUp) {
          get().showToast(`Congratulations! You leveled up to Level ${json.data.level}! 🧗`, 'success');
        }
      }
    } catch (err) {
      console.error('Failed to sync XP updates:', err);
    }
  },

  completeRoadmapTopic: async (topicId, status) => {
    try {
      const updatedRoadmap = get().learningRoadmap.map((topic) => 
        topic._id === topicId ? { ...topic, status } : topic
      );
      set({ learningRoadmap: updatedRoadmap });

      const res = await fetch('/api/user/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, status })
      });
      const json = await res.json();
      if (json.success) {
        get().showToast(`Roadmap topic marked as ${status.replace('_', ' ')}.`, 'success');
      }
    } catch (err) {
      console.error('Failed to update roadmap topic:', err);
      get().showToast('Failed to update roadmap topic status.', 'error');
    }
  },

  setResumeData: (data) => {
    set({
      resumeSkills: data.skills,
      resumeWeaknesses: data.weaknesses,
      resumeText: data.text,
      learningRoadmap: data.roadmap || get().learningRoadmap
    });
  }
}));
