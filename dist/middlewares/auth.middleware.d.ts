import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}
declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
export default authMiddleware;
