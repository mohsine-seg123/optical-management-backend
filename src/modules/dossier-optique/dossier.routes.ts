import { Router } from "express";
import {
  getAllDossiers,
  getDossierById,
  getByClientId,
  create,
  remove
} from "./dossier.controller.js";


import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";


const router = Router();
router.use(authMiddleware);


router.get("/", getAllDossiers);
router.get("/:id", getDossierById);
router.get("/client/:clientId", getByClientId);

router.post("/", create);

router.delete("/:id", roleMiddleware("admin"), remove);


export default router;