import { Router } from "express";
import { getAllMutuelles, getMutuelleById, createMutuelle, updateMutuelle, removeMutuelle, } from "./mutuelle.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";
const router = Router();
router.use(authMiddleware);
router.route("/").get(getAllMutuelles).post(createMutuelle);
router.route("/:id").get(getMutuelleById).put(updateMutuelle);
router.delete("/:id", rolemidlware("admin"), removeMutuelle);
export default router;
//# sourceMappingURL=mutuelle.routes.js.map