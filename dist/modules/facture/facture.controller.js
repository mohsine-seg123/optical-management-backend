import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import puppeteer from "puppeteer";
export const getAllFactures = catchAsync(async (req, res) => {
    const factures = await prisma.facture.findMany({
        include: {
            vente: {
                include: {
                    client: true,
                    lignes: {
                        include: {
                            produit: true,
                        },
                    },
                },
            },
            mutuelle: true,
        },
        orderBy: {
            id: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        results: factures.length,
        data: { factures },
    });
});
export const getFactureById = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const facture = await prisma.facture.findUnique({
        where: { id },
        include: {
            vente: {
                include: {
                    client: true,
                    lignes: {
                        include: {
                            produit: true,
                        },
                    },
                },
            },
            mutuelle: true,
        },
    });
    if (!facture) {
        return next(new AppError("Facture introuvable", 404));
    }
    res.status(200).json({
        status: "success",
        data: { facture },
    });
});
export const createFacture = catchAsync(async (req, res, next) => {
    const { numeroFacture, dateFacture, venteId, mutuelleId, statutRemboursement, } = req.body;
    if (!numeroFacture || !dateFacture || !venteId || !statutRemboursement) {
        return next(new AppError("Champs obligatoires manquants", 400));
    }
    const vente = await prisma.vente.findUnique({
        where: { id: Number(venteId) },
        include: {
            lignes: {
                include: {
                    produit: true,
                },
            },
        },
    });
    if (!vente) {
        return next(new AppError("Vente introuvable", 404));
    }
    const existing = await prisma.facture.findUnique({
        where: { venteId: Number(venteId) },
    });
    if (existing) {
        return next(new AppError("Une facture existe déjà pour cette vente", 400));
    }
    let total = 0;
    for (const ligne of vente.lignes) {
        const prix = Number(ligne.prixUnitaire) * Number(ligne.quantite) -
            Number(ligne.remise);
        total += prix;
    }
    // 🧠 logique mutuelle
    let partMutuelle = 0;
    let partPatient = total;
    if (mutuelleId) {
        partMutuelle = total * 0.7; // exemple 70%
        partPatient = total - partMutuelle;
    }
    const facture = await prisma.facture.create({
        data: {
            numeroFacture,
            dateFacture: new Date(dateFacture),
            montantTotal: total,
            partPatient,
            partMutuelle,
            statutRemboursement,
            venteId: Number(venteId),
            mutuelleId: mutuelleId ? Number(mutuelleId) : null,
        },
        include: {
            vente: true,
            mutuelle: true,
        },
    });
    res.status(201).json({
        status: "success",
        data: { facture },
    });
});
export const updateFacture = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const existing = await prisma.facture.findUnique({
        where: { id },
    });
    if (!existing) {
        return next(new AppError("Facture introuvable", 404));
    }
    const { statutRemboursement, mutuelleId } = req.body;
    const updated = await prisma.facture.update({
        where: { id },
        data: {
            statutRemboursement,
            mutuelleId: mutuelleId ? Number(mutuelleId) : undefined,
        },
    });
    res.status(200).json({
        status: "success",
        data: { facture: updated },
    });
});
export const deleteFacture = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    const existing = await prisma.facture.findUnique({
        where: { id },
    });
    if (!existing) {
        return next(new AppError("Facture introuvable", 404));
    }
    await prisma.facture.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Facture supprimée avec succès",
    });
});
export const generateFacturePDF = catchAsync(async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return next(new AppError("ID invalide", 400));
    }
    // 1. récupérer facture complète
    const facture = await prisma.facture.findUnique({
        where: { id },
        include: {
            vente: {
                include: {
                    client: true,
                    lignes: {
                        include: {
                            produit: true,
                        },
                    },
                },
            },
            mutuelle: true,
        },
    });
    if (!facture) {
        return next(new AppError("Facture introuvable", 404));
    }
    // 2. HTML TEMPLATE FACTURE
    const html = `
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }

    .header {
      text-align: center;
      border-bottom: 2px solid #222;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 26px;
      color: #111;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .box {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      width: 48%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th {
      background: #1f2937;
      color: white;
      padding: 10px;
      font-size: 14px;
    }

    td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: center;
      font-size: 14px;
    }

    .totals {
      margin-top: 25px;
      display: flex;
      justify-content: space-between;
    }

    .total-box {
      width: 32%;
      padding: 15px;
      border-radius: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .total-box h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #111;
    }

    .highlight {
      font-size: 18px;
      font-weight: bold;
      color: #16a34a;
    }

    .mutuelle {
      color: #2563eb;
      font-weight: bold;
    }

    .patient {
      color: #dc2626;
      font-weight: bold;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 20px;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="header">
    <h1>FACTURE OPTIQUE</h1>
    <span class="badge">Document Officiel</span>
  </div>

  <div class="meta">
    <div class="box">
      <p><strong>Numéro :</strong> ${facture.numeroFacture}</p>
      <p><strong>Date :</strong> ${facture.dateFacture}</p>
      <p><strong>Statut :</strong> ${facture.statutRemboursement}</p>
    </div>

    <div class="box">
      <p><strong>Client :</strong> ${facture.vente.client.nom} ${facture.vente.client.prenom}</p>
      <p><strong>Téléphone :</strong> ${facture.vente.client.telephone}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th>Qté</th>
        <th>PU</th>
        <th>Remise</th>
        <th>Total</th>
      </tr>
    </thead>

    <tbody>
      ${facture.vente.lignes
        .map((l) => `
        <tr>
          <td>${l.produit.designation}</td>
          <td>${l.quantite}</td>
          <td>${l.prixUnitaire} DH</td>
          <td>${l.remise || 0} DH</td>
          <td>${l.quantite * Number(l.prixUnitaire) - Number(l.remise || 0)} DH</td>
        </tr>
      `)
        .join("")}
    </tbody>
  </table>

  <div class="totals">

    <div class="total-box">
      <h3>Total Général</h3>
      <p class="highlight">${facture.montantTotal} DH</p>
    </div>

    <div class="total-box">
      <h3>Part Mutuelle</h3>
      <p class="mutuelle">${facture.partMutuelle} DH</p>
      <p style="font-size:12px;">Prise en charge assurance santé</p>
    </div>

    <div class="total-box">
      <h3>Part Patient</h3>
      <p class="patient">${facture.partPatient} DH</p>
      <p style="font-size:12px;">Reste à payer par client</p>
    </div>

  </div>

  <div class="footer">
    Merci pour votre confiance 👓 | Système Optique Management
  </div>

</body>
</html>
`;
    // 3. lancer puppeteer
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, {
        waitUntil: "load",
    });
    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
    });
    await browser.close();
    // 4. envoyer PDF
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=facture-${facture.numeroFacture}.pdf`,
    });
    res.send(pdfBuffer);
});
//# sourceMappingURL=facture.controller.js.map