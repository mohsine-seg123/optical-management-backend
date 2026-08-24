import { Response } from "express";
import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const getAllOrdonnances = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const ordonnances = await prisma.ordonnance.findMany({
      include: {
        dossier: {
          include: {
            client: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateOrdonnance: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        ordonnances,
      },
    });
  },
);

export const getOrdonnanceById = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      throw new AppError("ID invalide", 400);
    }

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id },
      include: {
        dossier: {
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
        },
        examens: true,
      },
    });

    if (!ordonnance) {
      throw new AppError("Ordonnance non trouvée", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        ordonnance,
      },
    });
  },
);

export const getByDossierId = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const dossierId = parseInt(req.params.dossierId as string);

    if (isNaN(dossierId)) {
      throw new AppError("ID dossier invalide", 400);
    }

    const ordonnances = await prisma.ordonnance.findMany({
      where: { dossierId },
      orderBy: { dateOrdonnance: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        ordonnances,
      },
    });
  },
);

export const create = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { dateOrdonnance, medecin, dateExpiration, scanUrl, dossierId } =req.body;

    // Validation des champs obligatoires
    if (!dateOrdonnance || !medecin || !dateExpiration || !dossierId) {
      throw new AppError(
        "Date d'ordonnance, médecin, date d'expiration et dossier sont obligatoires",
        400,
      );
    }

    // Vérifier que le dossier existe
    const dossier = await prisma.dossierOptique.findUnique({
      where: { id: dossierId },
    });

    if (!dossier) {
      throw new AppError("Dossier optique non trouvé", 404);
    }

    // Vérifier que la date d'expiration est après la date d'ordonnance
    if (new Date(dateExpiration) <= new Date(dateOrdonnance)) {
      throw new AppError(
        "La date d'expiration doit être après la date d'ordonnance",
        400,
      );
    }

    const ordonnance = await prisma.ordonnance.create({
      data: {
        dateOrdonnance: new Date(dateOrdonnance),
        medecin,
        dateExpiration: new Date(dateExpiration),
        scanUrl: scanUrl || null,
        dossierId,
      },
      include: {
        dossier: {
          include: {
            client: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        ordonnance,
      },
    });
  },
);

export const remove = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      throw new AppError("ID invalide", 400);
    }

    const existing = await prisma.ordonnance.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Ordonnance non trouvée", 404);
    }

    await prisma.ordonnance.delete({ where: { id } });

    res.status(200).json({ message: "Ordonnance supprimée avec succès" });
  },
);