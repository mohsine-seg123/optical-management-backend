import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const getProduits = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const produits = await prisma.produit.findMany({
      include: {
        categorie: {
          select: {
            id: true,
            libelle: true,
          },
        },
        fournisseur: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      results: produits.length,
      data: {
        produits,
      },
    });
  },
);



export const getProduitById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const produitId = parseInt(req.params.id as string);

    if (isNaN(produitId)) {
      return next(new AppError("ID de produit invalide", 400));
    }

    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
      include: { categorie: true, fournisseur: true },
    });

    if (!produit) {
      return next(new AppError("Produit non trouvé", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        produit,
      },
    });
  },
);

export const createProduit = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      designation,
      marque,
      modele,
      couleur,
      traitement,
      indice,
      codeBarre,
      prixAchat,
      prixVente,
      stockActuel,
      stockMinimum,
      imageUrl,
      categorieId,
      fournisseurId,
    } = req.body;


    if (!designation || !marque || !modele || !codeBarre || !fournisseurId) {
      return next(
        new AppError("Veuillez remplir tous les champs obligatoires", 400),
      );
    }

    const existing = await prisma.produit.findUnique({
      where: { codeBarre },
    });

    if (existing) {
      return next(
        new AppError("Un produit avec ce code à barre existe déjà", 400),
      );
    }

    const categorie = await prisma.categorie.findUnique({
      where: { id: Number(categorieId) },
    });

    if (!categorie) {
      return next(new AppError("La catégorie spécifiée n'existe pas", 400));
    }

    const fournisseur = await prisma.fournisseur.findUnique({
      where: { id: Number(fournisseurId) },
    });

    if (!fournisseur) {
      return next(new AppError("Le fournisseur spécifié n'existe pas", 400));
    }

    const produit = await prisma.produit.create({
      data: {
        designation,
        marque,
        modele,
        couleur,
        traitement,
        indice: indice ? Number(indice) : null,
        codeBarre,
        prixAchat: Number(prixAchat),
        prixVente: Number(prixVente),
        stockActuel: Number(stockActuel),
        stockMinimum: Number(stockMinimum),
        imageUrl,
        categorieId: Number(categorieId),
        fournisseurId: Number(fournisseurId),
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        produit,
      },
    });
  },
);

export const updateProduit = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const existing = await prisma.produit.findUnique({
      where: { id },
    });

    if (!existing) {
      return next(new AppError("Produit non trouvé", 404));
    }

    const produit = await prisma.produit.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({
      status: "success",
      data: { produit },
    });
  },
);

export const deleteProduit = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const existing = await prisma.produit.findUnique({
      where: { id },
    });

    if (!existing) {
      return next(new AppError("Produit non trouvé", 404));
    }

    await prisma.produit.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Produit supprimé avec succès",
    });
  },
);