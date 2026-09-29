import { Request, Response, NextFunction } from "express";
declare const _default: {
    getAllUsers: (req: Request, res: Response, next: NextFunction) => void;
    getById: (req: Request, res: Response, next: NextFunction) => void;
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
    remove: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
