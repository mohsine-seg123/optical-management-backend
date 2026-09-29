import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
export const getDashboardOverview = catchAsync(async (req, res, next) => {
    const today = getTodayRange();
    const month = getCurrentMonthRange();
    const [ventesTodayCount, ventesMonthCount, clientsCount, devisCount, facturesPendingCount, rappelsTodayCount, ventesTodayAmount, ventesMonthAmount, produits,] = await Promise.all([
        prisma.vente.count({
            where: {
                dateVente: {
                    gte: today.start,
                    lte: today.end,
                },
            },
        }),
        prisma.vente.count({
            where: {
                dateVente: {
                    gte: month.start,
                    lte: month.end,
                },
            },
        }),
        prisma.client.count(),
        prisma.devis.count(),
        prisma.facture.count({
            where: {
                statutRemboursement: "en_attente",
            },
        }),
        prisma.rappel.count({
            where: {
                datePrevue: {
                    gte: today.start,
                    lte: today.end,
                },
                statut: "en_attente",
            },
        }),
        prisma.vente.aggregate({
            where: {
                dateVente: {
                    gte: today.start,
                    lte: today.end,
                },
            },
            _sum: {
                montantTotal: true,
            },
        }),
        prisma.vente.aggregate({
            where: {
                dateVente: {
                    gte: month.start,
                    lte: month.end,
                },
            },
            _sum: {
                montantTotal: true,
            },
        }),
        prisma.produit.findMany({
            select: {
                id: true,
                designation: true,
                stockActuel: true,
                stockMinimum: true,
            },
        }),
    ]);
    const produitsStockFaible = produits.filter((produit) => produit.stockActuel < produit.stockMinimum);
    res.status(200).json({
        status: "success",
        data: {
            ventesTodayCount,
            ventesMonthCount,
            clientsCount,
            devisCount,
            facturesPendingCount,
            rappelsTodayCount,
            ventesTodayAmount,
            ventesMonthAmount,
            produitsStockFaible,
        },
    });
});
export const getPendingFactures = catchAsync(async (req, res, next) => {
    const factures = await prisma.facture.findMany({
        where: {
            statutRemboursement: "en_attente",
        },
        include: {
            vente: {
                include: {
                    client: true,
                },
            },
            mutuelle: true,
        },
        orderBy: {
            dateFacture: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            factures,
        },
    });
});
export const getDevisConversion = catchAsync(async (req, res, next) => {
    const devis = await prisma.devis.count();
    const devisConvertis = await prisma.vente.count({
        where: {
            devisId: {
                not: null,
            },
        },
    });
    const tauxConversion = devis > 0 ? (devisConvertis / devis) * 100 : 0;
    res.status(200).json({
        status: "success",
        data: {
            devis,
            devisConvertis,
            tauxConversion: Number(tauxConversion.toFixed(2)),
        },
    });
});
export const getBestProducts = catchAsync(async (req, res, next) => {
    const bestProducts = await prisma.ligneVente.groupBy({
        by: ['produitId'],
        _sum: {
            quantite: true,
        },
        orderBy: {
            _sum: {
                quantite: 'desc',
            },
        },
        take: 5,
    });
    const productsWithDetails = await Promise.all(bestProducts.map(async (product) => {
        const produit = await prisma.produit.findUnique({
            where: {
                id: product.produitId,
            },
            include: {
                categorie: true,
                fournisseur: true,
            },
        });
        return {
            produit,
            quantiteVendue: product._sum.quantite,
        };
    }));
    res.status(200).json({
        status: "success",
        data: {
            bestProducts: productsWithDetails,
        },
    });
});
export const getPaymentModesStats = catchAsync(async (req, res, next) => {
    const period = String(req.query.period || "month");
    let dateFilter = {};
    if (period === "month") {
        const month = getCurrentMonthRange();
        dateFilter = {
            dateVente: {
                gte: month.start,
                lt: month.end,
            },
        };
    }
    if (period === "year") {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now.getFullYear() + 1, 0, 1);
        end.setHours(0, 0, 0, 0);
        dateFilter = {
            dateVente: {
                gte: start,
                lt: end,
            },
        };
    }
    if (period === "all") {
        dateFilter = {};
    }
    const paymentModes = await prisma.vente.groupBy({
        by: ["modePaiement"],
        where: dateFilter,
        _count: {
            id: true,
        },
        _sum: {
            montantTotal: true,
        },
        orderBy: {
            _sum: {
                montantTotal: "desc",
            },
        },
    });
    const totalAmount = paymentModes.reduce((sum, item) => {
        return sum + Number(item._sum.montantTotal || 0);
    }, 0);
    const result = paymentModes.map((item) => {
        const montant = Number(item._sum.montantTotal || 0);
        return {
            modePaiement: item.modePaiement,
            ventesCount: item._count.id,
            montantTotal: montant,
            pourcentage: totalAmount > 0
                ? Number(((montant / totalAmount) * 100).toFixed(2))
                : 0,
        };
    });
    res.status(200).json({
        status: "success",
        data: {
            period,
            totalAmount,
            paymentModes: result,
        },
    });
});
export const getRecentSales = catchAsync(async (req, res, next) => {
    const ventes = await prisma.vente.findMany({
        take: 5,
        orderBy: {
            dateVente: "desc",
        },
        include: {
            client: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                }
            },
            utilisateur: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    role: true,
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            ventes,
        },
    });
});
export const getRecentClients = catchAsync(async (req, res, next) => {
    const clients = await prisma.client.findMany({
        take: 5,
        orderBy: {
            id: "desc",
        },
        include: {
            mutuelle: true,
            dossier: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            clients,
        },
    });
});
export const getMonthlyRevenue = catchAsync(async (req, res, next) => {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
        return next(new AppError("Invalid year", 400));
    }
    const start = new Date(year, 0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year + 1, 0, 1);
    end.setHours(0, 0, 0, 0);
    const ventes = await prisma.vente.findMany({
        where: {
            dateVente: {
                gte: start,
                lt: end,
            },
        },
        select: {
            dateVente: true,
            montantTotal: true,
        },
    });
    const months = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
    ];
    const monthlyRevenue = months.map((month, index) => {
        const ventesOfMonth = ventes.filter((vente) => vente.dateVente.getMonth() === index);
        const revenue = ventesOfMonth.reduce((sum, vente) => sum + Number(vente.montantTotal), 0);
        return {
            month,
            revenue,
            salesCount: ventesOfMonth.length,
        };
    });
    res.status(200).json({
        status: "success",
        data: {
            year,
            monthlyRevenue,
        },
    });
});
//# sourceMappingURL=dashboard.controller.js.map