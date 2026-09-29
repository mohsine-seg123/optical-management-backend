import { Router } from "express";
import { getAllRappels, getRappelById, createRappel, updateRappel, deleteRappel, } from "./rappel.controller.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
const router = Router();
router.use(authMiddleware);
router.route("/").get(getAllRappels).post(createRappel);
router.route("/:id").get(getRappelById).patch(updateRappel);
router.delete("/:id", rolemidlware('admin'), deleteRappel);
export default router;
//# sourceMappingURL=rappel.routes.js.map