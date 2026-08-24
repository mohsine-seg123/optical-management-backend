import {Router} from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import { getAllBonsLivraison,getAllBonsLivraisonById,createBonLivraison,deleteBonLivraison } from "./bonLivraison.controller.js";


const router= Router();

router.use(authMiddleware);

router.route("/").get(getAllBonsLivraison).post(createBonLivraison);
router.route("/:id").get(getAllBonsLivraisonById).delete(rolemidlware("admin"), deleteBonLivraison);

export default router;