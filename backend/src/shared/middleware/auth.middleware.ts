import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload } from '../utils/jwt.service';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const payload = jwtService.verify(token);

    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Invalid or expired token',
      details: error.message,
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      req.user = jwtService.verify(token);
    }

    next();
  } catch (error) {
    // Silently continue if token is invalid
    next();
  }
};
