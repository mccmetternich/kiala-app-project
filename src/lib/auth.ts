import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { createQueries } from './db-enhanced';
import { z } from 'zod';

// JWT configuration - NO FALLBACK for secret (security requirement)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validate JWT_SECRET exists before operations
const getJwtSecret = (): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return JWT_SECRET;
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'editor';
  tenantId: string;
  permissions: Permission[];
  createdAt: Date;
  lastLogin?: Date;
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'site' | 'article' | 'page' | 'user' | 'tenant';
  conditions?: Record<string, any>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  iat: number;
  exp: number;
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT utilities
export const generateToken = (user: Pick<User, 'id' | 'email' | 'role' | 'tenantId'>): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId
  };
  
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Extract token from request
export const extractToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Also check cookies for browser requests
  const tokenCookie = req.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
};

// Get user from request
export const getUserFromRequest = async (req: NextRequest): Promise<User | null> => {
  try {
    const token = extractToken(req);
    if (!token) return null;
    
    const payload = verifyToken(token);
    const queries = createQueries(payload.tenantId);
    const dbUser = await queries.userQueries.getById(payload.userId) as any;

    if (!dbUser) return null;

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as User['role'],
      tenantId: dbUser.tenant_id,
      permissions: getPermissionsForRole(dbUser.role as User['role']),
      createdAt: new Date(dbUser.created_at),
      lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : undefined
    };
    
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
};

// Permission system
export const getPermissionsForRole = (role: User['role']): Permission[] => {
  const permissions: Record<User['role'], Permission[]> = {
    admin: [
      // Admin can do everything
      { action: 'create', resource: 'site' },
      { action: 'read', resource: 'site' },
      { action: 'update', resource: 'site' },
      { action: 'delete', resource: 'site' },
      { action: 'create', resource: 'article' },
      { action: 'read', resource: 'article' },
      { action: 'update', resource: 'article' },
      { action: 'delete', resource: 'article' },
      { action: 'create', resource: 'page' },
      { action: 'read', resource: 'page' },
      { action: 'update', resource: 'page' },
      { action: 'delete', resource: 'page' },
      { action: 'create', resource: 'user' },
      { action: 'read', resource: 'user' },
      { action: 'update', resource: 'user' },
      { action: 'delete', resource: 'user' },
      { action: 'read', resource: 'tenant' },
      { action: 'update', resource: 'tenant' }
    ],
    manager: [
      // Manager can manage sites and content
      { action: 'create', resource: 'site' },
      { action: 'read', resource: 'site' },
      { action: 'update', resource: 'site' },
      { action: 'delete', resource: 'site' },
      { action: 'create', resource: 'article' },
      { action: 'read', resource: 'article' },
      { action: 'update', resource: 'article' },
      { action: 'delete', resource: 'article' },
      { action: 'create', resource: 'page' },
      { action: 'read', resource: 'page' },
      { action: 'update', resource: 'page' },
      { action: 'delete', resource: 'page' },
      { action: 'read', resource: 'user' }
    ],
    editor: [
      // Editor can only manage content
      { action: 'read', resource: 'site' },
      { action: 'create', resource: 'article' },
      { action: 'read', resource: 'article' },
      { action: 'update', resource: 'article' },
      { action: 'create', resource: 'page' },
      { action: 'read', resource: 'page' },
      { action: 'update', resource: 'page' }
    ]
  };
  
  return permissions[role] || [];
};

// Check if user has permission
export const hasPermission = (
  user: User, 
  action: Permission['action'], 
  resource: Permission['resource'],
  resourceData?: any
): boolean => {
  // Check if user has the required permission
  const hasBasicPermission = user.permissions.some(p => 
    p.action === action && p.resource === resource
  );
  
  if (!hasBasicPermission) return false;
  
  // Additional checks can be added here for resource-specific conditions
  // For example, editors can only edit their own articles
  if (user.role === 'editor' && resourceData?.authorId && resourceData.authorId !== user.id) {
    return false;
  }
  
  return true;
};

// Middleware helpers
export const requireAuth = () => {
  return async (req: NextRequest): Promise<User> => {
    const user = await getUserFromRequest(req);
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  };
};

export const requirePermission = (action: Permission['action'], resource: Permission['resource']) => {
  return async (req: NextRequest, resourceData?: any): Promise<User> => {
    const user = await requireAuth()(req);
    
    if (!hasPermission(user, action, resource, resourceData)) {
      throw new Error(`Permission denied: ${action} ${resource}`);
    }
    
    return user;
  };
};

// Rate limiting helpers
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  config: RateLimitConfig
): { allowed: boolean; resetTime: number; remaining: number } => {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  const existing = rateLimitMap.get(identifier);
  
  if (!existing) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, resetTime: now + config.windowMs, remaining: config.maxRequests - 1 };
  }
  
  if (existing.resetTime < now) {
    // Reset window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, resetTime: now + config.windowMs, remaining: config.maxRequests - 1 };
  }
  
  if (existing.count >= config.maxRequests) {
    return { allowed: false, resetTime: existing.resetTime, remaining: 0 };
  }
  
  existing.count++;
  return { 
    allowed: true, 
    resetTime: existing.resetTime, 
    remaining: config.maxRequests - existing.count 
  };
};

// Session management
export const createSession = (user: User) => {
  const token = generateToken(user);
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
};

// Tenant isolation helpers
export const withTenantContext = (tenantId: string) => {
  return {
    sites: (query: string, params: any[] = []) => {
      return `${query} AND tenant_id = ?`;
    },
    params: (originalParams: any[] = []) => {
      return [...originalParams, tenantId];
    }
  };
};

// Security headers
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
};