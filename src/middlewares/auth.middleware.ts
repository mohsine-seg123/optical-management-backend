import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Lire le token depuis le cookie
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      role: string;
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
};

export default authMiddleware;
