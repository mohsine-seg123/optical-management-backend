import {Router} from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";

import {
  getProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit
} from "./produit.controller.js";


const router= Router();

router.use(authMiddleware);


router.route("/").get(getProduits).post(rolemidlware("admin"),createProduit);


router.route("/:id").get(getProduitById).patch(rolemidlware("admin"),updateProduit);



router.delete("/:id",rolemidlware("admin"), deleteProduit);

export default router;
