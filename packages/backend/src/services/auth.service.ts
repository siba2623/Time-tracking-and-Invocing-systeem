/**
 * Authentication Service
 * Validates: Requirements 10.1, 10.2, 10.5
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockDb } from '../lib/mock-db.js';
import { config } from '../config/env.js';
import { ApiError } from '../types/errors.js';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'employee' | 'administrator';
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'employee' | 'administrator';
  };
}

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';

/**
 * Hash a password using bcrypt
 * Validates: Requirements 10.5
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}


/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthPayload;
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

/**
 * Login a user with email and password
 * Validates: Requirements 10.1, 10.2
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  await mockDb.initialize();
  const user = mockDb.findUserByEmail(email);

  // Generic error message to not reveal which credential was incorrect
  // Validates: Requirements 10.2
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Get user profile by ID
 */
export async function getUserById(userId: string) {
  await mockDb.initialize();
  const user = mockDb.findUserById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
