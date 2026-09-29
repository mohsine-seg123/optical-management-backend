import cron from "node-cron";
import prisma from "../../utils/prisma.js";
import { transporter } from "../../utils/mailer.js";
export const startRappelJob = () => {
    cron.schedule("56 12 * * *", async () => {
        console.log("📩 CRON RAPPEL CLIENT START");
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const rappels = await prisma.rappel.findMany({
                where: {
                    datePrevue: {
                        gte: today,
                        lte: end,
                    },
                    statut: "en_attente",
                },
                include: {
                    client: true,
                },
            });
            for (const rappel of rappels) {
                const emailHTML = `
                <div style="font-family:Arial;padding:20px;">
                    <h2>👓 Rappel Opticien</h2>

                    <p>Bonjour <strong>${rappel.client.nom} ${rappel.client.prenom}</strong>,</p>

                    <p>
                    Ceci est un rappel pour votre rendez-vous :
                    </p>

                    <ul>
                    <li><strong>Type :</strong> ${rappel.typeRappel}</li>
                    <li><strong>Date prévue :</strong> ${rappel.datePrevue}</li>
                    <li><strong>Canal :</strong> ${rappel.canal}</li>
                    </ul>

                    <p>
                    Merci de votre confiance 👓<br/>
                    Votre centre optique
                    </p>
                </div>
                `;
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: rappel.client.email,
                    subject: "Rappel Opticien - Rendez-vous prévu",
                    html: emailHTML,
                });
                await prisma.rappel.update({
                    where: { id: rappel.id },
                    data: {
                        statut: "envoye"
                    },
                });
                console.log(`📩 Rappel envoyé à ${rappel.client.email} pour le rappel ID: ${rappel.id}`);
            }
        }
        catch (error) {
            console.error("Erreur lors de l'envoi des rappels :", error);
        }
    });
};
//# sourceMappingURL=rappel.job.js.map