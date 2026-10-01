import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface JwtPayload {
  userId: string;
  tenantId: string;
  role: 'employer' | 'employee';
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Token lives in an HttpOnly cookie — never exposed to JavaScript
  const token = req.cookies?.champs_session;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      !payload.userId || !payload.tenantId || !payload.role ||
      !UUID_RE.test(payload.userId) || !UUID_RE.test(payload.tenantId) ||
      !['employer', 'employee'].includes(payload.role)
    ) {
      res.status(401).json({ error: 'Invalid token claims' });
      return;
    }

    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireEmployer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'employer') {
      res.status(403).json({ error: 'Employer access required' });
      return;
    }
    next();
  });
}

const IS_PROD = process.env.NODE_ENV === 'production';

export const SESSION_COOKIE = 'champs_session';

export const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
