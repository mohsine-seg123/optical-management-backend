import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const getAllVentes = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const ventes = await prisma.vente.findMany({
      include: {
        client: true,
        utilisateur: true,
        devis: true,
        lignes: {
          include: {
            produit: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      results: ventes.length,
      data: { ventes },
    });
  },
);

export const getVenteById = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const vente = await prisma.vente.findUnique({
      where: { id },
      include: {
        client: true,
        utilisateur: true,
        devis: true,
        lignes: {
          include: {
            produit: true,
          },
        },
      },
    });

    if (!vente) {
      return next(new AppError("Vente non trouvée", 404));
    }

    res.status(200).json({
      status: "success",
      data: { vente },
    });
  },
);

export const createVente = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      dateVente,
      modePaiement,
      clientId,
      utilisateurId,
      devisId,
      lignes,
    } = req.body;

    if (
      !dateVente ||
      !modePaiement ||
      !clientId ||
      !utilisateurId ||
      !devisId ||
      !lignes
    ) {
      throw new AppError(
        "Veuillez fournir toutes les informations nécessaires pour créer une vente.",
        400,
      );
    }

    const result = await prisma.$transaction(async (tx) => {

        
      const vente = await tx.vente.create({
        data: {
          dateVente: new Date(dateVente),
          modePaiement,
          clientId: Number(clientId),
          utilisateurId: Number(utilisateurId),
          devisId: Number(devisId),
          montantTotal: 0,
        },
      });

      let total = 0;

      for (const ligne of lignes) {
        const produit = await tx.produit.findUnique({
          where: { id: Number(ligne.produitId) },
        });

        if (!produit) {
          throw new AppError(
            `Produit avec l'ID ${ligne.produitId} introuvable`,
            404,
          );
        }

        const sousTotal =
          Number(ligne.quantite) *
          (Number(ligne.prixUnitaire) - Number(ligne.remise || 0));
        total += sousTotal;

        await tx.ligneVente.create({
          data: {
            produitId: Number(ligne.produitId),
            venteId: vente.id,
            quantite: Number(ligne.quantite),
            prixUnitaire: Number(ligne.prixUnitaire),
            remise: Number(ligne.remise || 0),
          },
        });

        await tx.produit.update({
          where: { id: Number(ligne.produitId) },
          data: {
            stockActuel: produit.stockActuel - Number(ligne.quantite),
          },
        });
      }

      const updatedVente = await tx.vente.update({
        where: { id: vente.id },
        data: { montantTotal: total },
      });

      return updatedVente;
    });

    res.status(201).json({
      status: "success",
      data: { vente: result },
    });
  },
);



export const deleteVente = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return next(new AppError("ID invalide", 400));
    }

    const vente = await prisma.vente.findUnique({
      where: { id },
    });

    if (!vente) {
      return next(new AppError("Vente introuvable", 404));
    }

    await prisma.vente.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Vente supprimée avec succès",
    });
  },
);