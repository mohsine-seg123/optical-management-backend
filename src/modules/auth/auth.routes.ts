import {Router} from "express";
import {login, logout,getMe} from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router=Router();

router.post("/login",login)
      .post("/logout",logout);

router.get("/me", authMiddleware, getMe);

export default router;