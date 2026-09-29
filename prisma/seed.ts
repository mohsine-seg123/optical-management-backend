import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const motDePasseHash = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.utilisateur.create({
    data: {
      nom: "Mohsine",
      prenom: "segaoui",
      email: "mohsine.benali@example.com",
      motDePasse: motDePasseHash,
      role: "admin",
    },
  });

  console.log("Admin créé avec mot de passe haché :", admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
