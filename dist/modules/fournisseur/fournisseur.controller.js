import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
export const getAllFournisseurs = catchAsync(async (req, res) => {
    const fournisseurs = await prisma.fournisseur.findMany({
        include: {
            produits: {
                select: {
                    id: true,
                    designation: true,
                    stockActuel: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        results: fournisseurs.length,
        data: {
            fournisseurs,
        },
    });
});
export const getFournisseurById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const fournisseur = await prisma.fournisseur.findUnique({
        where: { id },
        include: {
            produits: true,
            bonsLivraison: true,
        },
    });
    if (!fournisseur) {
        return next(new AppError("Fournisseur non trouvé", 404));
    }
    res.status(200).json({
        status: "success",
        data: { fournisseur },
    });
});
export const createFournisseur = catchAsync(async (req, res, next) => {
    const { nom, telephone, email, adresse } = req.body;
    if (!nom || !telephone || !email || !adresse) {
        return next(new AppError("Tous les champs sont requis", 400));
    }
    const existing = await prisma.fournisseur.findFirst({
        where: {
            OR: [{ email }, { telephone }],
        },
    });
    if (existing) {
        return next(new AppError("Fournisseur déjà existant (email ou téléphone)", 400));
    }
    const fournisseur = await prisma.fournisseur.create({
        data: {
            nom,
            telephone,
            email,
            adresse,
        },
    });
    res.status(201).json({
        status: "success",
        data: { fournisseur },
    });
});
export const updateFournisseur = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const existing = await prisma.fournisseur.findUnique({
        where: { id },
    });
    if (!existing) {
        return next(new AppError("Fournisseur non trouvé", 404));
    }
    const { nom, telephone, email, adresse } = req.body;
    const updated = await prisma.fournisseur.update({
        where: { id },
        data: {
            nom,
            telephone,
            email,
            adresse,
        },
    });
    res.status(200).json({
        status: "success",
        data: { fournisseur: updated },
    });
});
/**
 * DELETE FOURNISSEUR
 */
export const deleteFournisseur = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const existing = await prisma.fournisseur.findUnique({
        where: { id },
        include: {
            produits: true,
        },
    });
    if (!existing) {
        return next(new AppError("Fournisseur non trouvé", 404));
    }
    if (existing.produits.length > 0) {
        return next(new AppError("Impossible de supprimer un fournisseur qui a des produits", 400));
    }
    await prisma.fournisseur.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Fournisseur supprimé avec succès",
    });
});
//# sourceMappingURL=fournisseur.controller.js.map