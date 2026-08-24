import { Router } from "express";
import {
  getAllFactures,
  getFactureById,
  createFacture,
  updateFacture,
  deleteFacture,
  generateFacturePDF,
} from "./facture.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);

router.route("/").get(getAllFactures).post(createFacture);

router.get("/:id/pdf", generateFacturePDF);

router
  .route("/:id")
  .get(getFactureById)
  .patch(updateFacture)
  .delete(rolemidlware("admin"),deleteFacture);

export default router;
