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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Reject tokens with non-UUID claims — prevents DB type errors and injection
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
    res.status(401).json({ error: 'Invalid or expired token' });
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
