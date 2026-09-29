import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import { getLowStockProducts, getTodayRappels } from "./alert.controller.js";
const router = Router();
router.use(authMiddleware);
router.get("/low-stock", rolemidlware("admin"), getLowStockProducts);
router.get("/today-rappels", rolemidlware("admin"), getTodayRappels);
export default router;
//# sourceMappingURL=alert.routes.js.map