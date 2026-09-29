import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
export const getAllDevis = catchAsync(async (req, res) => {
    const devis = await prisma.devis.findMany({
        include: {
            client: true,
            utilisateur: true,
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
        results: devis.length,
        data: { devis },
    });
});
export const getDevisById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const devis = await prisma.devis.findUnique({
        where: { id },
        include: {
            client: true,
            utilisateur: true,
            lignes: {
                include: {
                    produit: true,
                },
            },
        },
    });
    if (!devis) {
        return next(new AppError("Devis introuvable", 404));
    }
    res.status(200).json({
        status: "success",
        data: { devis },
    });
});
export const createDevis = catchAsync(async (req, res, next) => {
    const { dateDevis, statut, clientId, utilisateurId, lignes } = req.body;
    if (!dateDevis || !clientId || !utilisateurId || !lignes.length) {
        return next(new AppError("Champs obligatoires manquants", 400));
    }
    const client = await prisma.client.findUnique({
        where: { id: Number(clientId) },
    });
    if (!client) {
        return next(new AppError("Client introuvable", 404));
    }
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: Number(utilisateurId) },
    });
    if (!utilisateur) {
        return next(new AppError("Utilisateur introuvable", 404));
    }
    const result = await prisma.$transaction(async (tx) => {
        const devis = await tx.devis.create({
            data: {
                dateDevis: new Date(dateDevis),
                statut,
                clientId: Number(clientId),
                utilisateurId: Number(utilisateurId),
                montantTotal: 0,
            },
        });
        let total = 0;
        for (const ligne of lignes) {
            const produit = await tx.produit.findUnique({
                where: { id: Number(ligne.produitId) },
            });
            if (!produit) {
                return next(new AppError("produit ID not found", 400));
            }
            const sousTotal = Number(ligne.quantite) *
                (Number(ligne.prixUnitaire) - Number(ligne.remise || 0));
            total += sousTotal;
            await tx.ligneDevis.create({
                data: {
                    devisId: devis.id,
                    produitId: Number(ligne.produitId),
                    quantite: Number(ligne.quantite),
                    prixUnitaire: Number(ligne.prixUnitaire),
                    remise: Number(ligne.remise || 0),
                },
            });
        }
        const update = await tx.devis.update({
            where: { id: devis.id },
            data: {
                montantTotal: total,
            },
        });
        return update;
    });
    res.status(201).json({
        status: "success",
        data: { devis: result },
    });
});
export const deleteDevis = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const devis = await prisma.devis.findUnique({
        where: { id },
    });
    if (!devis) {
        return next(new AppError("Devis introuvable", 404));
    }
    await prisma.devis.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Devis supprimé avec succès",
    });
});
//# sourceMappingURL=devis.controller.js.map