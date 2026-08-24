import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const getAllRappels = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const rappels = await prisma.rappel.findMany({
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true,
          },
        },
      },
      orderBy: {
        datePrevue: "asc",
      },
    });

    res.status(200).json({
      status: "success",
      results: rappels.length,
      data: {
        rappels,
      },
    });
  },
);





export const getRappelById = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const rappel = await prisma.rappel.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!rappel) {
      return next(new AppError("Rappel non trouvé", 404));
    }

    res.status(200).json({
      status: "success",
      data: { rappel },
    });
  },
);

export const createRappel = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { typeRappel, datePrevue, statut, canal, clientId } = req.body;

    if (!typeRappel || !datePrevue || !statut || !canal || !clientId) {
      return next(new AppError("Tous les champs sont requis", 400));
    }

    const client = await prisma.client.findUnique({
      where: { id: Number(clientId) },
    });

    if (!client) {
      return next(new AppError("Client non trouvé", 404));
    }

    const rappel = await prisma.rappel.create({
      data: {
        typeRappel,
        datePrevue: new Date(datePrevue),
        statut,
        canal,
        clientId: Number(clientId),
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      data: { rappel },
    });
  },
);

export const updateRappel = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const existing = await prisma.rappel.findUnique({
      where: { id },
    });

    if (!existing) {
      return next(new AppError("Rappel non trouvé", 404));
    }

    const { typeRappel, datePrevue, statut, canal } = req.body;

    const updated = await prisma.rappel.update({
      where: { id },
      data: {
        typeRappel,
        statut,
        canal,
        datePrevue: datePrevue ? new Date(datePrevue) : undefined,
      },
      include: {
        client: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: { rappel: updated },
    });
  },
);

export const deleteRappel = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const existing = await prisma.rappel.findUnique({
      where: { id },
    });

    if (!existing) {
      return next(new AppError("Rappel non trouvé", 404));
    }

    await prisma.rappel.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Rappel supprimé avec succès",
    });
  },
);