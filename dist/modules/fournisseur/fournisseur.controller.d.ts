import { Response, NextFunction } from "express";
export declare const getAllFournisseurs: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const getFournisseurById: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const createFournisseur: (req: import("express").Request, res: Response, next: NextFunction) => void;
export declare const updateFournisseur: (req: import("express").Request, res: Response, next: NextFunction) => void;
/**
 * DELETE FOURNISSEUR
 */
export declare const deleteFournisseur: (req: import("express").Request, res: Response, next: NextFunction) => void;
