import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error in GET /api/user/profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      xp, 
      username, 
      avatarUrl, 
      bio, 
      preferredRoles, 
      experienceLevel, 
      settings,
      subscriptionPlan
    } = body;

    if (username !== undefined) user.username = username;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (preferredRoles !== undefined) user.preferredRoles = preferredRoles;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    
    // Theme and notifications
    if (settings !== undefined) {
      user.settings = {
        ...user.settings,
        ...settings
      };
    }

    // Direct mock subscription plan update
    if (subscriptionPlan !== undefined) {
      user.subscriptionPlan = subscriptionPlan;
      // Adjust usage limits based on subscription tier
      if (subscriptionPlan === 'free') {
        user.subscriptionUsage.interviewLimit = 5;
      } else if (subscriptionPlan === 'pro') {
        user.subscriptionUsage.interviewLimit = 25;
      } else if (subscriptionPlan === 'enterprise') {
        user.subscriptionUsage.interviewLimit = 9999;
      }
    }

    if (xp) {
      user.xp += xp;
      const oldLevel = user.level;
      user.level = Math.floor(user.xp / 500) + 1;

      const badgeNames = user.badges.map((b: any) => b.name);

      if (user.level > oldLevel) {
        user.badges.push({
          name: `Level ${user.level} Climber`,
          icon: '🧗',
          dateUnlocked: new Date()
        });
      }

      if (user.xp >= 300 && !badgeNames.includes('Code Scholar')) {
        user.badges.push({ name: 'Code Scholar', icon: '📚', dateUnlocked: new Date() });
      }
      if (user.xp >= 1000 && !badgeNames.includes('Mock Champion')) {
        user.badges.push({ name: 'Mock Champion', icon: '🏆', dateUnlocked: new Date() });
      }
    }

    await user.save();
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error in PUT /api/user/profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
