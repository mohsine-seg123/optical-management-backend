import { Router } from "express";
import { getAllFournisseurs, getFournisseurById, createFournisseur, updateFournisseur, deleteFournisseur, } from "./fournisseur.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
const router = Router();
router.use(authMiddleware);
router.route("/").get(getAllFournisseurs).post(createFournisseur);
router
    .route("/:id")
    .get(getFournisseurById)
    .patch(updateFournisseur);
router.delete("/:id", roleMiddleware("admin"), deleteFournisseur);
export default router;
//# sourceMappingURL=fournisseur.routes.js.map