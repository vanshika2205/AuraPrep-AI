import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'auraprep-super-secret-key-12345';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }, rememberMe = false): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '1d'
  });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req?: Request): Promise<IUser | null> {
  try {
    let token = '';
    
    // 1. Try to read from cookies
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value || '';
    } catch (cookieErr) {
      // Ignore cookie extraction error outside active request lifecycle
    }
    
    // 2. Try to read from headers if request is passed
    if (!token && req) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) return null;
    
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;
    
    await dbConnect();
    const user = await User.findById(decoded.userId);
    return user; // Return the user object (verification state checked in auth endpoints)
  } catch (err) {
    console.error('Error authenticating user:', err);
    return null;
  }
}
