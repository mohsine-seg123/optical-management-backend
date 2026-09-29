import {Router} from "express";
import {login, logout,getMe, changePassword, updateMe} from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router=Router();

router.post("/login",login).post("/logout",logout);

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);

router.patch("/change-password", authMiddleware, changePassword);

export default router;