import catchAsync from "../../utils/catchAsync.js";
import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";
const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await prisma.utilisateur.findMany({
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
        },
        orderBy: {
            nom: "asc",
        },
    });
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});
const getById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { id },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
        },
    });
    if (!utilisateur) {
        return next(new AppError("Utilisateur non trouvé", 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            utilisateur
        }
    });
});
const create = catchAsync(async (req, res, next) => {
    const { nom, prenom, email, motDePasse, role } = req.body;
    if (!nom || !prenom || !email || !motDePasse || !role) {
        return next(new AppError("Tous les champs sont obligatoires", 400));
    }
    if (motDePasse.length < 6) {
        return next(new AppError("Le mot de passe doit faire au moins 6 caractères", 400));
    }
    if (!["admin", "vendeur"].includes(role)) {
        return next(new AppError("Rôle invalide. Doit être 'admin' ou 'vendeur'", 400));
    }
    const existing = await prisma.utilisateur.findUnique({
        where: { email },
    });
    if (existing) {
        return next(new AppError("Cet email est déjà utilisé", 400));
    }
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    const utilisateur = await prisma.utilisateur.create({
        data: {
            nom,
            prenom,
            email,
            motDePasse: motDePasseHash,
            role,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
        },
    });
    res.status(201).json({
        status: 'success',
        data: utilisateur
    });
});
const update = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const { nom, prenom, email, motDePasse, role } = req.body;
    const existing = await prisma.utilisateur.findUnique({ where: { id } });
    if (!existing) {
        return next(new AppError("Utilisateur non trouvé", 404));
    }
    if (motDePasse && motDePasse.length < 6) {
        return next(new AppError("Le mot de passe doit faire au moins 6 caractères", 400));
    }
    if (role && !["admin", "vendeur"].includes(role)) {
        return next(new AppError("Rôle invalide", 400));
    }
    if (email && email !== existing.email) {
        const emailExists = await prisma.utilisateur.findUnique({ where: { email } });
        if (emailExists) {
            return next(new AppError("Cet email est déjà utilisé", 400));
        }
    }
    const updatedData = {};
    if (nom !== undefined)
        updatedData.nom = nom;
    if (prenom !== undefined)
        updatedData.prenom = prenom;
    if (email !== undefined)
        updatedData.email = email;
    if (motDePasse !== undefined)
        updatedData.motDePasse = await bcrypt.hash(motDePasse, 10);
    if (role !== undefined)
        updatedData.role = role;
    const utilisateur = await prisma.utilisateur.update({
        where: { id },
        data: updatedData,
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
        },
    });
    res.status(200).json({
        status: 'success',
        data: utilisateur
    });
});
const remove = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    if (req.userId === id) {
        return next(new AppError("Vous ne pouvez pas supprimer votre propre compte", 400));
    }
    const existing = await prisma.utilisateur.findUnique({ where: { id } });
    if (!existing) {
        return next(new AppError("Utilisateur non trouvé", 404));
    }
    await prisma.utilisateur.delete({ where: { id } });
    res.json({ message: "Utilisateur supprimé avec succès" });
});
export default {
    getAllUsers,
    getById,
    create,
    update,
    remove,
};
//# sourceMappingURL=utilisateur.controller.js.map