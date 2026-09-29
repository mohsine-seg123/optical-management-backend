import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
declare const rolemidlware: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export default rolemidlware;
