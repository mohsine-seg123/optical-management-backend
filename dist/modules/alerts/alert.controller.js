import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};
export const getLowStockProducts = catchAsync(async (req, res, next) => {
    const produits = await prisma.produit.findMany({
        include: {
            categorie: true,
            fournisseur: true,
        },
        orderBy: {
            stockActuel: "asc",
        },
    });
    const produitsStockFaible = produits.filter((produit) => produit.stockActuel <= produit.stockMinimum);
    res.status(200).json({
        status: "success",
        results: produitsStockFaible.length,
        data: {
            produits: produitsStockFaible,
        },
    });
});
export const getTodayRappels = catchAsync(async (req, res, next) => {
    const { start, end } = getTodayRange();
    const rappels = await prisma.rappel.findMany({
        where: {
            datePrevue: {
                gte: start,
                lte: end,
            },
            statut: "en_attente",
        },
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
});
//# sourceMappingURL=alert.controller.js.map