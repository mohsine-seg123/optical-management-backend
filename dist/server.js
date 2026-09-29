import app from "./app.js";
import dotenv from "dotenv";
import { startRappelJob } from "./modules/jobs/rappel.job.js";
dotenv.config();
const PORT = process.env.PORT || 3000;
startRappelJob();
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map