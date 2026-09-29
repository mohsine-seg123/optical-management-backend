import { Request, Response } from "express";
import { Utilisateur } from "@prisma/client";
export declare const signToken: (userId: number, role: string) => string;
export declare const createAndSendToken: (utilisateur: Utilisateur, res: Response) => void;
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
