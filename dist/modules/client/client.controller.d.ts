import { Response, Request, NextFunction } from "express";
export declare const getAllClients: (req: Request, res: Response, next: NextFunction) => void;
export declare const getClientById: (req: Request, res: Response, next: NextFunction) => void;
export declare const createClient: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateClient: (req: Request, res: Response, next: NextFunction) => void;
export declare const removeClient: (req: Request, res: Response, next: NextFunction) => void;
