import { Router } from "express";

import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  removeClient,
} from "./client.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js"
import rolemidlware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);


router.get("/",getAllClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);

router.delete("/:id", rolemidlware("admin"), removeClient);

export default router;