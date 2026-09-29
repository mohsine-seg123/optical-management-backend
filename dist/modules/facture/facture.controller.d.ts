import { Response, NextFunction } from "express";
export declare const getAllFactures: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const getFactureById: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const createFacture: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const updateFacture: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const deleteFacture: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const generateFacturePDF: (req: import("express").Request, res: Response, next: NextFunction) => void;
