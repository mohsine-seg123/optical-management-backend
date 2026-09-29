import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
export const getAllDossiers = catchAsync(async (req, res, next) => {
    const dossiers = await prisma.dossierOptique.findMany({
        include: {
            client: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                },
            },
        },
        orderBy: {
            dateCreation: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        results: dossiers.length,
        data: {
            dossiers,
        },
    });
});
export const getDossierById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const dossier = await prisma.dossierOptique.findUnique({
        where: { id },
        include: {
            client: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                },
            },
            ordonnances: {
                orderBy: {
                    dateOrdonnance: "desc",
                },
            },
            examens: {
                orderBy: {
                    dateExamen: "desc",
                },
            },
        },
    });
    if (!dossier) {
        throw new AppError("Dossier optique non trouvé", 404);
    }
    res.status(200).json({
        status: "success",
        data: {
            dossier,
        },
    });
});
export const getByClientId = catchAsync(async (req, res, next) => {
    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
        return next(new AppError("ID client invalide", 400));
    }
    const dossier = await prisma.dossierOptique.findUnique({
        where: { clientId },
        include: {
            client: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                },
            },
            ordonnances: {
                orderBy: {
                    dateOrdonnance: "desc",
                },
            },
            examens: {
                orderBy: {
                    dateExamen: "desc",
                },
            },
        },
    });
    if (!dossier) {
        return next(new AppError("Aucun dossier trouvé pour ce client", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            dossier,
        },
    });
});
export const create = catchAsync(async (req, res, next) => {
    const { clientId, observations, numeroDossier } = req.body;
    if (!clientId || !numeroDossier) {
        return next(new AppError("clientId et numeroDossier sont requis", 400));
    }
    const client = await prisma.client.findUnique({
        where: { id: clientId },
    });
    if (!client) {
        return next(new AppError("Client non trouvé", 404));
    }
    const existingDossier = await prisma.dossierOptique.findUnique({
        where: { clientId },
    });
    if (existingDossier) {
        return next(new AppError("Un dossier optique existe déjà pour ce client", 400));
    }
    const newDossier = await prisma.dossierOptique.create({
        data: {
            numeroDossier,
            dateCreation: new Date(),
            observations,
            clientId,
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
        data: {
            dossier: newDossier,
        },
    });
});
export const remove = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        throw new AppError("ID invalide", 400);
    }
    const existing = await prisma.dossierOptique.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError("Dossier optique non trouvé", 404);
    }
    await prisma.dossierOptique.delete({ where: { id } });
    res.json({ message: "Dossier optique supprimé avec succès" });
});
//# sourceMappingURL=dossier.controller.js.map