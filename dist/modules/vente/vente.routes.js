import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import { getAllVentes, getVenteById, createVente, deleteVente } from "./vente.controller.js";
const router = Router();
router.use(authMiddleware);
router.route("/").get(getAllVentes).post(createVente);
router.get("/:id", getVenteById);
router.delete("/:id", rolemidlware("admin"), deleteVente);
export default router;
//# sourceMappingURL=vente.routes.js.map