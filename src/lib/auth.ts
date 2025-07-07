import bcrypt from 'bcryptjs';
import { getUserByEmail } from './db';
import { User } from '@/types';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = getUserByEmail(email);
  if (!user) {
    return null;
  }
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }
  return user;
}

export function createSession(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
}