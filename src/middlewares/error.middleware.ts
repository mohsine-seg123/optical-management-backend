import AppError from "../utils/AppError.js";
import { Request, Response, NextFunction} from "express";
import { Prisma } from "@prisma/client";


const handleJWTError = () =>
  new AppError("Token invalide. Veuillez vous reconnecter !", 401);

const handleJWTExpiredError = () =>
  new AppError("Votre token a expiré ! Veuillez vous reconnecter.", 401);

   
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};


const sendErrorProd = (err:any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};


const handlePrismaError = (err: any) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2003":
        return new AppError(
          "Relation invalide : un élément lié n'existe pas.",
          400,
        );

      case "P2002":
        return new AppError("Valeur déjà existante (contrainte unique).", 400);

      default:
        return new AppError("Erreur base de données Prisma", 500);
    }
  }

  return err;
};


const habdlingError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "JsonWebTokenError") err = handleJWTError();
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

  //  Prisma errors
  err = handlePrismaError(err);

  //  ENV handling
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};


export default habdlingError;