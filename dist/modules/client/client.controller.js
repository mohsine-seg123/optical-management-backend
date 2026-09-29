import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
export const getAllClients = catchAsync(async (req, res) => {
    const clients = await prisma.client.findMany({
        include: {
            mutuelle: {
                select: {
                    id: true,
                    nom: true,
                    tauxRemboursement: true,
                },
            },
            dossier: {
                select: {
                    id: true,
                    numeroDossier: true,
                    dateCreation: true,
                    dateDernierExamen: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        results: clients.length,
        data: {
            clients,
        },
    });
});
export const getClientById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID client invalide", 400));
    }
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            mutuelle: true,
            dossier: {
                include: {
                    examens: {
                        orderBy: {
                            dateExamen: "desc",
                        },
                    },
                    ordonnances: {
                        orderBy: {
                            dateOrdonnance: "desc",
                        },
                    },
                },
            },
            ventes: {
                orderBy: {
                    dateVente: "desc",
                },
            },
            devis: {
                orderBy: {
                    dateDevis: "desc",
                },
            },
            rappels: {
                orderBy: {
                    datePrevue: "desc",
                },
            },
        },
    });
    if (!client) {
        return next(new AppError("Client non trouvé", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            client,
        },
    });
});
export const createClient = catchAsync(async (req, res, next) => {
    const { nom, prenom, telephone, email, adresse, dateNaissance, mutuelleId, } = req.body;
    const parsedDateNaissance = new Date(dateNaissance);
    if (isNaN(parsedDateNaissance.getTime())) {
        return next(new AppError("Date de naissance invalide", 400));
    }
    if (!nom || !prenom || !telephone || !email) {
        return next(new AppError("Tous les champs sont requis", 400));
    }
    const existingClient = await prisma.client.findFirst({
        where: {
            OR: [{ telephone }, { email }],
        },
    });
    if (existingClient) {
        return next(new AppError("Un client avec ce téléphone ou email existe déjà", 400));
    }
    if (mutuelleId) {
        const mutuelle = await prisma.mutuelle.findUnique({
            where: { id: Number(mutuelleId) },
        });
        if (!mutuelle) {
            return next(new AppError("Mutuelle non trouvée", 404));
        }
    }
    const newClient = await prisma.client.create({
        data: {
            nom,
            prenom,
            telephone,
            email,
            adresse,
            dateNaissance: parsedDateNaissance,
            mutuelleId: mutuelleId ? Number(mutuelleId) : undefined,
        },
        include: {
            mutuelle: true,
        },
    });
    res.status(201).json({
        status: "success",
        data: {
            client: newClient,
        },
    });
});
export const updateClient = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID client invalide", 400));
    }
    const existingClient = await prisma.client.findUnique({
        where: { id },
    });
    if (!existingClient) {
        return next(new AppError("Client non trouvé", 404));
    }
    const { nom, prenom, telephone, email, adresse, dateNaissance, mutuelleId, } = req.body;
    if (mutuelleId) {
        const mutuelle = await prisma.mutuelle.findUnique({
            where: { id: Number(mutuelleId) },
        });
        if (!mutuelle) {
            return next(new AppError("Mutuelle non trouvée", 404));
        }
    }
    const updatedClient = await prisma.client.update({
        where: { id },
        data: {
            nom,
            prenom,
            telephone,
            email,
            adresse,
            dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
            mutuelleId: mutuelleId !== undefined && mutuelleId !== null
                ? Number(mutuelleId)
                : undefined,
        },
        include: {
            mutuelle: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            client: updatedClient,
        },
    });
});
export const removeClient = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID client invalide", 400));
    }
    const existingClient = await prisma.client.findUnique({
        where: { id },
    });
    if (!existingClient) {
        return next(new AppError("Client non trouvé", 404));
    }
    await prisma.client.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Client supprimé avec succès",
    });
});
//# sourceMappingURL=client.controller.js.map