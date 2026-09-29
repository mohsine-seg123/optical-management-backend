import { Router } from "express";
import utilisateurController from "./utilisateur.controller.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
const router = Router();
router.use(authMiddleware).use(rolemidlware("admin"));
router
    .get("/", rolemidlware("admin"), utilisateurController.getAllUsers)
    .get("/:id", utilisateurController.getById)
    .post("/", utilisateurController.create)
    .put("/:id", utilisateurController.update)
    .delete("/:id", utilisateurController.remove);
export default router;
//# sourceMappingURL=utilisateur.routes.js.map