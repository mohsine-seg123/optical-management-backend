import router from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { getAllExamen,getExamenById,getExamensByDossierId,create,update,remove } from "./examen.controller.js";


const route= router();


route.use(authMiddleware);

route.get("/", getAllExamen);
route.get("/:id", getExamenById);
route.get("/dossier/:dossierId", getExamensByDossierId);
route.post("/", create);
route.put("/:id", update);
route.delete("/:id", roleMiddleware("admin"), remove);


export default route;