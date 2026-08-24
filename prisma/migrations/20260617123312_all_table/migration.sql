-- CreateTable
CREATE TABLE "bon_livraison" (
    "id" SERIAL NOT NULL,
    "numero_bon" VARCHAR(50) NOT NULL,
    "date_reception" DATE NOT NULL,
    "id_fournisseur" INTEGER NOT NULL,

    CONSTRAINT "bon_livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ligne_bon_livraison" (
    "id_produit" INTEGER NOT NULL,
    "id_bon" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_achat" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ligne_bon_livraison_pkey" PRIMARY KEY ("id_produit","id_bon")
);

-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "mutuelle_id" INTEGER,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutuelle" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "taux_remboursement" DECIMAL(5,2) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,

    CONSTRAINT "mutuelle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" SERIAL NOT NULL,
    "date_devis" DATE NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "statut" VARCHAR(20) NOT NULL,
    "id_client" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ligne_devis" (
    "id_produit" INTEGER NOT NULL,
    "id_devis" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DECIMAL(10,2) NOT NULL,
    "remise" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "ligne_devis_pkey" PRIMARY KEY ("id_produit","id_devis")
);

-- CreateTable
CREATE TABLE "dossier_optique" (
    "id" SERIAL NOT NULL,
    "numero_dossier" VARCHAR(20) NOT NULL,
    "date_creation" DATE NOT NULL,
    "date_dernier_examen" DATE,
    "observations" TEXT,
    "id_client" INTEGER NOT NULL,

    CONSTRAINT "dossier_optique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordonnance" (
    "id" SERIAL NOT NULL,
    "date_ordonnance" DATE NOT NULL,
    "medecin" VARCHAR(100) NOT NULL,
    "date_expiration" DATE NOT NULL,
    "scan_url" VARCHAR(255),
    "id_dossier" INTEGER NOT NULL,

    CONSTRAINT "ordonnance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examen_vue" (
    "id" SERIAL NOT NULL,
    "date_examen" DATE NOT NULL,
    "sphere_od" DECIMAL(4,2) NOT NULL,
    "cylindre_od" DECIMAL(4,2) NOT NULL,
    "axe_od" INTEGER NOT NULL,
    "addition_od" DECIMAL(4,2) NOT NULL,
    "sphere_og" DECIMAL(4,2) NOT NULL,
    "cylindre_og" DECIMAL(4,2) NOT NULL,
    "axe_og" INTEGER NOT NULL,
    "addition_og" DECIMAL(4,2) NOT NULL,
    "id_dossier" INTEGER NOT NULL,
    "id_ordonnance" INTEGER,

    CONSTRAINT "examen_vue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rappel" (
    "id" SERIAL NOT NULL,
    "type_rappel" VARCHAR(30) NOT NULL,
    "date_prevue" DATE NOT NULL,
    "statut" VARCHAR(20) NOT NULL,
    "canal" VARCHAR(20) NOT NULL,
    "id_client" INTEGER NOT NULL,

    CONSTRAINT "rappel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facture" (
    "id" SERIAL NOT NULL,
    "numero_facture" VARCHAR(50) NOT NULL,
    "date_facture" DATE NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "part_patient" DECIMAL(10,2) NOT NULL,
    "part_mutuelle" DECIMAL(10,2) NOT NULL,
    "statut_remboursement" VARCHAR(20) NOT NULL,
    "id_vente" INTEGER NOT NULL,
    "id_mutuelle" INTEGER,

    CONSTRAINT "facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorie" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(50) NOT NULL,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseur" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,

    CONSTRAINT "fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produit" (
    "id" SERIAL NOT NULL,
    "designation" VARCHAR(150) NOT NULL,
    "marque" VARCHAR(50) NOT NULL,
    "modele" VARCHAR(50) NOT NULL,
    "couleur" VARCHAR(30),
    "traitement" VARCHAR(50),
    "indice" DECIMAL(3,2),
    "code_barre" VARCHAR(50) NOT NULL,
    "prix_achat" DECIMAL(10,2) NOT NULL,
    "prix_vente" DECIMAL(10,2) NOT NULL,
    "stock_actuel" INTEGER NOT NULL,
    "stock_minimum" INTEGER NOT NULL,
    "image_url" VARCHAR(255),
    "id_categorie" INTEGER NOT NULL,
    "id_fournisseur" INTEGER NOT NULL,

    CONSTRAINT "produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vente" (
    "id" SERIAL NOT NULL,
    "date_vente" DATE NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "mode_paiement" VARCHAR(20) NOT NULL,
    "id_client" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_devis" INTEGER,

    CONSTRAINT "vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ligne_vente" (
    "id_produit" INTEGER NOT NULL,
    "id_vente" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DECIMAL(10,2) NOT NULL,
    "remise" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "ligne_vente_pkey" PRIMARY KEY ("id_produit","id_vente")
);

-- CreateIndex
CREATE UNIQUE INDEX "bon_livraison_numero_bon_key" ON "bon_livraison"("numero_bon");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "dossier_optique_numero_dossier_key" ON "dossier_optique"("numero_dossier");

-- CreateIndex
CREATE UNIQUE INDEX "dossier_optique_id_client_key" ON "dossier_optique"("id_client");

-- CreateIndex
CREATE UNIQUE INDEX "facture_numero_facture_key" ON "facture"("numero_facture");

-- CreateIndex
CREATE UNIQUE INDEX "facture_id_vente_key" ON "facture"("id_vente");

-- CreateIndex
CREATE UNIQUE INDEX "categorie_libelle_key" ON "categorie"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "produit_code_barre_key" ON "produit"("code_barre");

-- CreateIndex
CREATE UNIQUE INDEX "vente_id_devis_key" ON "vente"("id_devis");

-- AddForeignKey
ALTER TABLE "bon_livraison" ADD CONSTRAINT "bon_livraison_id_fournisseur_fkey" FOREIGN KEY ("id_fournisseur") REFERENCES "fournisseur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_bon_livraison" ADD CONSTRAINT "ligne_bon_livraison_id_produit_fkey" FOREIGN KEY ("id_produit") REFERENCES "produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_bon_livraison" ADD CONSTRAINT "ligne_bon_livraison_id_bon_fkey" FOREIGN KEY ("id_bon") REFERENCES "bon_livraison"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_mutuelle_id_fkey" FOREIGN KEY ("mutuelle_id") REFERENCES "mutuelle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_devis" ADD CONSTRAINT "ligne_devis_id_produit_fkey" FOREIGN KEY ("id_produit") REFERENCES "produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_devis" ADD CONSTRAINT "ligne_devis_id_devis_fkey" FOREIGN KEY ("id_devis") REFERENCES "devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_optique" ADD CONSTRAINT "dossier_optique_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnance" ADD CONSTRAINT "ordonnance_id_dossier_fkey" FOREIGN KEY ("id_dossier") REFERENCES "dossier_optique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen_vue" ADD CONSTRAINT "examen_vue_id_dossier_fkey" FOREIGN KEY ("id_dossier") REFERENCES "dossier_optique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen_vue" ADD CONSTRAINT "examen_vue_id_ordonnance_fkey" FOREIGN KEY ("id_ordonnance") REFERENCES "ordonnance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rappel" ADD CONSTRAINT "rappel_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_id_vente_fkey" FOREIGN KEY ("id_vente") REFERENCES "vente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_id_mutuelle_fkey" FOREIGN KEY ("id_mutuelle") REFERENCES "mutuelle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produit" ADD CONSTRAINT "produit_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produit" ADD CONSTRAINT "produit_id_fournisseur_fkey" FOREIGN KEY ("id_fournisseur") REFERENCES "fournisseur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vente" ADD CONSTRAINT "vente_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vente" ADD CONSTRAINT "vente_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vente" ADD CONSTRAINT "vente_id_devis_fkey" FOREIGN KEY ("id_devis") REFERENCES "devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_vente" ADD CONSTRAINT "ligne_vente_id_produit_fkey" FOREIGN KEY ("id_produit") REFERENCES "produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_vente" ADD CONSTRAINT "ligne_vente_id_vente_fkey" FOREIGN KEY ("id_vente") REFERENCES "vente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
