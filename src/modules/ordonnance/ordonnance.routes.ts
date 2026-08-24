import router from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import {
  getAllOrdonnances,
    getOrdonnanceById,
    create as createOrdonnance,
    remove as removeOrdonnance,
} from "./ordonnance.controller.js";

const route= router();

route.use(authMiddleware);

route.get("/", getAllOrdonnances);
route.get("/:id", getOrdonnanceById);
route.post("/",createOrdonnance);
route.delete("/:id", roleMiddleware("admin"), removeOrdonnance);

export default route;