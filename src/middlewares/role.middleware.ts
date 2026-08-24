import { Request,Response,NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import AppError from "../utils/AppError.js";


const rolemidlware= (...roles:string[])=>{
       return (req:AuthRequest,res:Response,next:NextFunction)=>{
          if(!req.userId || !roles.includes(req.userRole as string)){
              return next(new AppError("Accès refusé : droits insuffisants", 403));
          }
          next()
       }
    }


export default rolemidlware