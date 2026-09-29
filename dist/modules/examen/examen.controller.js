import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
export const getAllExamen = catchAsync(async (req, res) => {
    const examens = await prisma.examenVue.findMany({
        include: {
            dossier: {
                include: {
                    client: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            },
        },
        orderBy: { dateExamen: "desc" },
    });
    res.status(200).json({
        status: "success",
        data: {
            examens,
        },
    });
});
export const getExamenById = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        throw new AppError("ID invalide", 400);
    }
    const examen = await prisma.examenVue.findUnique({
        where: { id },
        include: {
            dossier: {
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
            },
        },
    });
    if (!examen) {
        throw new AppError("Examen de vue non trouvé", 404);
    }
    res.status(200).json({
        status: "success",
        data: {
            examen,
        },
    });
});
export const getExamensByDossierId = catchAsync(async (req, res) => {
    const dossierId = parseInt(req.params.dossierId);
    if (isNaN(dossierId)) {
        throw new AppError("ID dossier invalide", 400);
    }
    const examens = await prisma.examenVue.findMany({
        where: { dossierId },
        orderBy: { dateExamen: "desc" },
    });
    res.status(200).json({
        status: "success",
        data: {
            examens,
        },
    });
});
export const create = catchAsync(async (req, res) => {
    const { dateExamen, sphereOd, cylindreOd, axeOd, additionOd, sphereOg, cylindreOg, axeOg, additionOg, dossierId, } = req.body;
    // Validation des champs obligatoires
    if (!dateExamen ||
        sphereOd === undefined ||
        cylindreOd === undefined ||
        axeOd === undefined ||
        additionOd === undefined ||
        sphereOg === undefined ||
        cylindreOg === undefined ||
        axeOg === undefined ||
        additionOg === undefined ||
        !dossierId) {
        throw new AppError("Tous les champs de correction et le dossier sont obligatoires", 400);
    }
    // Vérifier que le dossier existe
    const dossier = await prisma.dossierOptique.findUnique({
        where: { id: dossierId },
    });
    if (!dossier) {
        throw new AppError("Dossier optique non trouvé", 404);
    }
    // Validation de l'axe (0 à 180 degrés)
    if (axeOd < 0 || axeOd > 180 || axeOg < 0 || axeOg > 180) {
        throw new AppError("L'axe doit être entre 0 et 180 degrés", 400);
    }
    // Créer l'examen
    const examen = await prisma.examenVue.create({
        data: {
            dateExamen: new Date(dateExamen),
            sphereOd,
            cylindreOd,
            axeOd,
            additionOd,
            sphereOg,
            cylindreOg,
            axeOg,
            additionOg,
            dossierId,
        },
        include: {
            dossier: {
                include: {
                    client: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            },
        },
    });
    // Mettre à jour automatiquement dateDernierExamen du dossier
    await prisma.dossierOptique.update({
        where: { id: dossierId },
        data: { dateDernierExamen: new Date(dateExamen) },
    });
    res.status(201).json({
        status: "success",
        data: {
            examen,
        },
    });
});
export const update = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        throw new AppError("ID invalide", 400);
    }
    const existing = await prisma.examenVue.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError("Examen de vue non trouvé", 404);
    }
    const { dateExamen, sphereOd, cylindreOd, axeOd, additionOd, sphereOg, cylindreOg, axeOg, additionOg, } = req.body;
    // Validation de l'axe si modifié
    if (axeOd !== undefined && (axeOd < 0 || axeOd > 180)) {
        throw new AppError("L'axe OD doit être entre 0 et 180 degrés", 400);
    }
    if (axeOg !== undefined && (axeOg < 0 || axeOg > 180)) {
        throw new AppError("L'axe OG doit être entre 0 et 180 degrés", 400);
    }
    const updateData = {};
    if (dateExamen)
        updateData.dateExamen = new Date(dateExamen);
    if (sphereOd !== undefined)
        updateData.sphereOd = sphereOd;
    if (cylindreOd !== undefined)
        updateData.cylindreOd = cylindreOd;
    if (axeOd !== undefined)
        updateData.axeOd = axeOd;
    if (additionOd !== undefined)
        updateData.additionOd = additionOd;
    if (sphereOg !== undefined)
        updateData.sphereOg = sphereOg;
    if (cylindreOg !== undefined)
        updateData.cylindreOg = cylindreOg;
    if (axeOg !== undefined)
        updateData.axeOg = axeOg;
    if (additionOg !== undefined)
        updateData.additionOg = additionOg;
    const examen = await prisma.examenVue.update({
        where: { id },
        data: updateData,
        include: {
            dossier: {
                include: {
                    client: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            },
        },
    });
    // Si la date d'examen a changé, recalculer dateDernierExamen
    if (dateExamen) {
        const dernierExamen = await prisma.examenVue.findFirst({
            where: { dossierId: existing.dossierId },
            orderBy: { dateExamen: "desc" },
        });
        if (dernierExamen) {
            await prisma.dossierOptique.update({
                where: { id: existing.dossierId },
                data: { dateDernierExamen: dernierExamen.dateExamen },
            });
        }
    }
    res.status(200).json({
        status: "success",
        data: {
            examen,
        },
    });
});
// ==========================================
// DELETE /api/examens/:id
// ==========================================
export const remove = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        throw new AppError("ID invalide", 400);
    }
    const existing = await prisma.examenVue.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError("Examen de vue non trouvé", 404);
    }
    await prisma.examenVue.delete({ where: { id } });
    // Recalculer dateDernierExamen après suppression
    const dernierExamen = await prisma.examenVue.findFirst({
        where: { dossierId: existing.dossierId },
        orderBy: { dateExamen: "desc" },
    });
    await prisma.dossierOptique.update({
        where: { id: existing.dossierId },
        data: {
            dateDernierExamen: dernierExamen ? dernierExamen.dateExamen : null,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            message: "Examen de vue supprimé avec succès"
        }
    });
});
//# sourceMappingURL=examen.controller.js.map