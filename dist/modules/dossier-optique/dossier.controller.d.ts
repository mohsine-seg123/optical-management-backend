import { Response, NextFunction } from "express";
export declare const getAllDossiers: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const getDossierById: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const getByClientId: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const create: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const remove: (req: import("express").Request, res: Response, next: NextFunction) => void;
