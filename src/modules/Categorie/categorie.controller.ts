import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const getAllCategories = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const categories = await prisma.categorie.findMany({
      include: {
        produits: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      lenght: categories.length,
      data: {
        categories,
      },
    });
  },
);

export const getCategorieById = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (!isNaN(id)) {
      return next(new AppError("ID not accepted", 400));
    }

    const categorie = await prisma.categorie.findUnique({
      where: { id },
      include: {
        produits: true,
      },
    });

    if (!categorie) {
      return next(new AppError("categorie not found", 400));
    }

    res.status(200).json({
      status: "success",
      data: {
        categorie,
      },
    });
  },
);

export const creatCategorie = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { libelle } = req.body;

    if (!libelle) {
      return next(new AppError("libelle not existe", 400));
    }

    const existelabel = await prisma.categorie.findFirst({
      where: { libelle },
    });

    if (existelabel) {
      return next(new AppError("Cette catégorie existe déjà", 400));
    }

    const category = await prisma.categorie.create({
      data: { libelle },
    });

    res.status(201).json({
      status: "success",
      data: { category },
    });
  },
);



export const updateCategory = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const { libelle } = req.body;

    const existing = await prisma.categorie.findUnique({
      where: { id },
    });

    if (!existing) {
      return next(new AppError("Catégorie non trouvée", 404));
    }

    const updated = await prisma.categorie.update({
      where: { id },
      data: { libelle },
    });

    res.status(200).json({
      status: "success",
      data: { category: updated },
    });
  },
);

export const deleteCategory = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const existing = await prisma.categorie.findUnique({
      where: { id },
      include: {
        produits: true,
      },
    });

    if (!existing) {
      return next(new AppError("Catégorie non trouvée", 404));
    }

    if (existing.produits.length > 0) {
      return next(
        new AppError(
          "Impossible de supprimer une catégorie qui contient des produits",
          400,
        ),
      );
    }

    await prisma.categorie.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Catégorie supprimée avec succès",
    });
  },
);