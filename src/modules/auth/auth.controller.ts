import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { Utilisateur } from "@prisma/client";

export const signToken = (userId: number, role: string): string => {
  const secretKey = process.env.JWT_SECRET as string;
  const token = jwt.sign({ userId, role }, secretKey, { expiresIn: "24h" });
  return token;
};

export const createAndSendToken = (
  utilisateur: Utilisateur,
  res: Response,
): void => {
  const token = signToken(utilisateur.id, utilisateur.role);

  const cookieOptions = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as const)
        : ("lax" as const),
  };

  res.cookie("token", token, cookieOptions);

  utilisateur.motDePasse = "null";
  res.status(200).json({
    utilisateur: {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      motDePasse: utilisateur.motDePasse,
      role: utilisateur.role,
    },
  });
};

export const login = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email, motDePasse }: { email: string; motDePasse: string } =
      req.body;

    if (!email || !motDePasse) {
      throw new AppError("Email ou mot de passe incorrect", 401);
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!utilisateur) {
      throw new AppError("Email ou mot de passe incorrect", 401);
    }

    const motDePasseValide = await bcrypt.compare(
      motDePasse,
      utilisateur.motDePasse,
    );

    if (!motDePasseValide) {
      throw new AppError("Email ou mot de passe incorrect", 401);
    }
    createAndSendToken(utilisateur, res);
  },
);



// logout function
export const logout = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("token");
    res.status(200).json({ message: "Déconnecté avec succès" });
  },
);


// Get the currently logged-in user's information
export const getMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
      },
    });

    if (!utilisateur) throw new AppError("Utilisateur non trouvé", 404);

    res.status(200).json(utilisateur);
  },
);



// Change password function
export const changePassword = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    // 1. Vérifier que les deux champs sont remplis
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      throw new AppError(
        "L'ancien et le nouveau mot de passe sont obligatoires",
        400,
      );
    }

    // 2. Vérifier la longueur du nouveau mot de passe
    if (nouveauMotDePasse.length < 6) {
      throw new AppError(
        "Le nouveau mot de passe doit faire au moins 6 caractères",
        400,
      );
    }

    // 3. Récupérer l'utilisateur avec son mot de passe haché
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.userId },
    });

    if (!utilisateur) {
      throw new AppError("Utilisateur non trouvé", 404);
    }

    // 4. Vérifier que l'ancien mot de passe est correct
    const ancienValide = await bcrypt.compare(
      ancienMotDePasse,
      utilisateur.motDePasse,
    );

    if (!ancienValide) {
      throw new AppError("Ancien mot de passe incorrect", 401);
    }

    // 5. Hacher le nouveau mot de passe et mettre à jour
    const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);

    await prisma.utilisateur.update({
      where: { id: req.userId },
      data: { motDePasse: nouveauHash },
    });

    res.json({ message: "Mot de passe modifié avec succès" });
  },
);


// Update user information function
export const updateMe = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { nom, prenom, email } = req.body;

    // Vérifier l'unicité de l'email si modifié
    if (email) {
      const emailUsed = await prisma.utilisateur.findUnique({
        where: { email },
      });

      if (emailUsed && emailUsed.id !== req.userId) {
        throw new AppError("Cet email est déjà utilisé", 400);
      }
    }

    const updateData: any = {};
    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (email) updateData.email = email;
 
    const utilisateur = await prisma.utilisateur.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
      },
    });

    res.json(utilisateur);
  },
);