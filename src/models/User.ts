import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge {
  name: string;
  icon: string;
  dateUnlocked: Date;
}

export interface IRoadmapTopic {
  topic: string;
  difficulty: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  resources: { title: string; url: string }[];
}

export interface ISubscriptionUsage {
  interviewsThisMonth: number;
  interviewLimit: number;
}

export interface IUserSettings {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  isPrivateProfile: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  isVerified: boolean;
  verificationOTP?: string;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  
  // Profile Info
  avatarUrl?: string;
  bio?: string;
  preferredRoles: string[];
  experienceLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  
  // Gamified & Learning stats
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: Date;
  badges: IBadge[];
  resumeText: string;
  resumeSkills: string[];
  resumeWeaknesses: string[];
  learningRoadmap: IRoadmapTopic[];
  
  // Subscription info
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  subscriptionUsage: ISubscriptionUsage;
  
  // App settings
  settings: IUserSettings;
  
  createdAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  dateUnlocked: { type: Date, default: Date.now }
});

const RoadmapTopicSchema = new Schema<IRoadmapTopic>({
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  resources: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true }
    }
  ]
});

const UserSchema = new Schema<IUser>({
  username: { type: String, default: 'Candidate' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },
  
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferredRoles: { type: [String], default: [] },
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead'], default: 'Mid' },
  
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  badges: { type: [BadgeSchema], default: [] },
  resumeText: { type: String, default: '' },
  resumeSkills: { type: [String], default: [] },
  resumeWeaknesses: { type: [String], default: [] },
  learningRoadmap: { type: [RoadmapTopicSchema], default: [] },
  
  subscriptionPlan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  subscriptionUsage: {
    type: {
      interviewsThisMonth: { type: Number, default: 0 },
      interviewLimit: { type: Number, default: 5 } // 5 mocks for free plan
    },
    default: () => ({ interviewsThisMonth: 0, interviewLimit: 5 })
  },
  
  settings: {
    type: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      notificationsEnabled: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true },
      isPrivateProfile: { type: Boolean, default: false }
    },
    default: () => ({ theme: 'dark', notificationsEnabled: true, emailAlerts: true, isPrivateProfile: false })
  },
  
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
