import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import { getAllDevis,getDevisById,createDevis,deleteDevis } from "./devis.controller.js";


const router= Router()

router.use(authMiddleware)


router.route("/").get(getAllDevis).post(createDevis)

router.get("/:id",getDevisById)

router.delete("/:id",rolemidlware("admin"),deleteDevis)


export default router