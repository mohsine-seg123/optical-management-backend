-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");
