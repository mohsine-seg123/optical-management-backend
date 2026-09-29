import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
export const getAllMutuelles = catchAsync(async (req, res, next) => {
    const mutuelles = await prisma.mutuelle.findMany({
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
            id: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        results: mutuelles.length,
        data: {
            mutuelles,
        },
    });
});
export const getMutuelleById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID mutuelle invalide", 400));
    }
    const mutuelle = await prisma.mutuelle.findUnique({
        where: { id },
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
    });
    if (!mutuelle) {
        return next(new AppError("Mutuelle non trouvée", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            mutuelle,
        },
    });
});
export const createMutuelle = catchAsync(async (req, res, next) => {
    const { nom, tauxRemboursement, telephone, email, adresse } = req.body;
    if (!nom) {
        return next(new AppError("Le nom de la mutuelle est requis", 400));
    }
    const existingMutuelle = await prisma.mutuelle.findFirst({
        where: {
            nom,
        },
    });
    if (existingMutuelle) {
        return next(new AppError("Cette mutuelle existe déjà", 400));
    }
    const newMutuelle = await prisma.mutuelle.create({
        data: {
            nom,
            tauxRemboursement,
            telephone,
            email,
        },
    });
    res.status(201).json({
        status: "success",
        data: {
            mutuelle: newMutuelle,
        },
    });
});
export const updateMutuelle = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID mutuelle invalide", 400));
    }
    const existingMutuelle = await prisma.mutuelle.findUnique({
        where: { id },
    });
    if (!existingMutuelle) {
        return next(new AppError("Mutuelle non trouvée", 404));
    }
    const { nom, tauxRemboursement, telephone, email, adresse } = req.body;
    const updatedMutuelle = await prisma.mutuelle.update({
        where: { id },
        data: {
            nom,
            tauxRemboursement: tauxRemboursement !== undefined && tauxRemboursement !== null
                ? Number(tauxRemboursement)
                : undefined,
            telephone,
            email,
            adresse,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            mutuelle: updatedMutuelle,
        },
    });
});
export const removeMutuelle = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID mutuelle invalide", 400));
    }
    const existingMutuelle = await prisma.mutuelle.findUnique({
        where: { id },
        include: {
            client: true,
        },
    });
    if (!existingMutuelle) {
        return next(new AppError("Mutuelle non trouvée", 404));
    }
    if (existingMutuelle.client.length > 0) {
        return next(new AppError("Impossible de supprimer cette mutuelle car elle est liée à des clients", 400));
    }
    await prisma.mutuelle.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Mutuelle supprimée avec succès",
    });
});
//# sourceMappingURL=mutuelle.controller.js.map