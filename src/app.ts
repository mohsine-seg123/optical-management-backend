import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import AppError from "./utils/AppError.js";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import globalError from "./middlewares/error.middleware.js";
import utilisateurRoutes from "./modules/utilisateur/utilisateur.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import dossierRoutes from "./modules/dossier-optique/dossier.routes.js";
import ordonnanceRoutes from "./modules/ordonnance/ordonnance.routes.js";
import examenRoutes from "./modules/examen/examen.routes.js";
import clientRoutes from "./modules/client/client.routes.js";
import mutuelleRoutes from "./modules/mutuelle/mutuelle.routes.js";
import rappelRoutes from "./modules/rappel/rappel.routes.js";
import categoryRoutes from "./modules/Categorie/categorie.routes.js";
import fournisseurRoutes from "./modules/fournisseur/fournisseur.routes.js";
import produitRoutes from "./modules/produit/produit.routes.js";
import bonLivraisonRoutes from "./modules/bon-livraison/bonLivraison.routes.js";
import devisRoutes from "./modules/DEVIS/devis.routes.js";
import venteRoutes from "./modules/vente/vente.routes.js";
import factureRoutes from "./modules/facture/facture.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import alertRoutes from "./modules/alerts/alert.routes.js";


const app = express();

// Middleware de limitation de taux
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: "Trop de requêtes créées à partir de cette IP, veuillez réessayer après 15 minutes"
});

// Middlewares globaux
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use('/api',limiter);
app.use(express.json());
app.use(cookieParser());

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API OpticApp fonctionne" });
});


// les routes de l'application
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/ordonnances", ordonnanceRoutes);
app.use("/api/examens", examenRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/mutuelles", mutuelleRoutes);
app.use("/api/rappels",rappelRoutes)
app.use("/api/categories", categoryRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/bon-livraison", bonLivraisonRoutes);
app.use("/api/devis", devisRoutes);
app.use("/api/ventes", venteRoutes);
app.use("/api/factures",factureRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/alerts",alertRoutes);



// aucun route corespondante trouvée
app.all("/*splat", (req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(
      `Impossible de trouver ${req.originalUrl} sur ce serveur`,
      404,
    ),
  );
});

app.use(globalError)

// exportation de l'application Express
export default app;
