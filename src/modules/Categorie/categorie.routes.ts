import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";

import { getAllCategories,getCategorieById,creatCategorie,updateCategory,deleteCategory } from "./categorie.controller.js";

const router=Router()


router.use(authMiddleware)

router.route("/").get(getAllCategories).post(creatCategorie)

router.route("/:id").get(getCategorieById).patch(updateCategory)

router.delete("/:id",rolemidlware("admin"),deleteCategory)


export default router

