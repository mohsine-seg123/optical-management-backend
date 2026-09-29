import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import rolemidlware from "../../middlewares/role.middleware.js";
import { getDashboardOverview, getBestProducts, getPendingFactures, getDevisConversion, getPaymentModesStats, getRecentClients, getRecentSales, getMonthlyRevenue } from "./dashboard.controller.js";
const router = Router();
router.use(authMiddleware);
router.get("/overview", rolemidlware("admin"), getDashboardOverview);
router.get("/best-products", rolemidlware("admin"), getBestProducts);
router.get("/pending-factures", rolemidlware("admin"), getPendingFactures);
router.get("/devis-conversion", rolemidlware("admin"), getDevisConversion);
router.get("/payment-modes", rolemidlware("admin"), getPaymentModesStats);
router.get("/recent-clients", rolemidlware("admin"), getRecentClients);
router.get("/recent-sales", rolemidlware("admin"), getRecentSales);
router.get("/monthly-revenue", rolemidlware("admin"), getMonthlyRevenue);
export default router;
//# sourceMappingURL=dashboard.routes.js.map