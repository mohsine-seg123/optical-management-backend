import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
export const getAllBonsLivraison = catchAsync(async (req, res, next) => {
    const bonsLivraison = await prisma.bonLivraison.findMany({
        include: {
            fournisseur: true,
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
        results: bonsLivraison.length,
        data: {
            bonsLivraison,
        },
    });
});
export const getAllBonsLivraisonById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const bonsLivraison = await prisma.bonLivraison.findUnique({
        where: { id },
        include: {
            fournisseur: true,
            lignes: {
                include: {
                    produit: true,
                },
            },
        },
    });
    if (!bonsLivraison) {
        return next(new AppError("Bon de livraison non trouvé", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            bonsLivraison,
        },
    });
});
export const createBonLivraison = catchAsync(async (req, res, next) => {
    const { numeroBon, dateReception, fournisseurId, lignes } = req.body;
    if (!numeroBon || !dateReception || !fournisseurId || !lignes?.length) {
        return next(new AppError("Tous les champs sont requis", 400));
    }
    const fournisseur = await prisma.fournisseur.findUnique({
        where: { id: fournisseurId },
    });
    if (!fournisseur) {
        return next(new AppError("Fournisseur non trouvé", 404));
    }
    const bonExist = await prisma.bonLivraison.findFirst({
        where: { numeroBon },
    });
    if (bonExist) {
        return next(new AppError("Un bon de livraison avec ce numéro existe déjà", 400));
    }
    const result = await prisma.$transaction(async (tx) => {
        const bon = await tx.bonLivraison.create({
            data: {
                numeroBon,
                dateReception: new Date(dateReception),
                fournisseurId: Number(fournisseurId),
            },
        });
        for (const ligne of lignes) {
            const produit = await tx.produit.findUnique({
                where: { id: Number(ligne.produitId) },
            });
            if (!produit) {
                return next(new AppError("Produit introuvable ID ", 400));
            }
            await tx.ligneBonLivraison.create({
                data: {
                    bonId: bon.id,
                    produitId: Number(ligne.produitId),
                    quantite: Number(ligne.quantite),
                    prixAchat: Number(ligne.prixAchat),
                },
            });
            await tx.produit.update({
                where: { id: Number(ligne.produitId) },
                data: {
                    stockActuel: produit.stockActuel + Number(ligne.quantite),
                },
            });
        }
        return bon;
    });
    res.status(201).json({
        status: "success",
        data: { bon: result },
    });
});
export const deleteBonLivraison = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const bon = await prisma.bonLivraison.findUnique({
        where: { id },
    });
    if (!bon) {
        return next(new AppError("Bon introuvable", 404));
    }
    await prisma.bonLivraison.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Bon supprimé avec succès",
    });
});
//# sourceMappingURL=bonLivraison.controller.js.map