import { Request, Response, NextFunction } from "express";
declare const habdlingError: (err: any, req: Request, res: Response, next: NextFunction) => void;
export default habdlingError;
