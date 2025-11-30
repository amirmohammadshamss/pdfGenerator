/**
 * Complete Test Script for PDF Generation with HTTP Simulation
 * This simulates the Firebase Cloud Function behavior locally
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const https = require("https");
const http = require("http");

/**
 * CUSTOMIZE YOUR TEST DATA HERE
 * Modify these values to test different scenarios
 */
const TEST_SCENARIOS = {
  // Basic test with minimal data
  basic: {
    devisNumber: "DEVIS-2025-001",
    date: "23/11/2025",
    colorTemplate: "#3498db", // Blue
    subject: "Travaux de rénovation",
    companyName: "Ma Société",
    companyAddress: "123 Rue de Test",
    companyPostalCode: "75001",
    companyCity: "Paris",
    companySiret: "123 456 789 00012",
    companyTel: "01 23 45 67 89",
    companyEmail: "contact@masociete.fr",
    clientCivility: "M.",
    clientLastName: "Dupont",
    clientNumber: "CLI-001",
    clientCity: "Lyon",
    clientAddress: "45 Avenue Test",
    footerText: "Devis valable 30 jours. Acompte de 30% à la commande.",
    footerTextPart2: "TVA non applicable, art. 293 B du CGI",
    logoUrl: "",
    discountPercent: 0,
    discountAmount: 0,
    travelFees: 0,
    deliveryFees: 0,
    listRoomEstimate: [
      {
        listCategoryEstimate: [
          {
            listTaskEstimate: [
              {
                Place: "Salon",
                Type: "Peinture",
                Description: "Peinture murs",
                Qty: 25,
                Dimensions: "m²",
                UnitPriceExcludingVAT: 15.5,
              },
            ],
          },
        ],
      },
    ],
  },

  // Full test with discount and fees
  fullFeatures: {
    devisNumber: "DEVIS-2025-002",
    date: "23/11/2025",
    colorTemplate: "#C75B2A", // Red
    subject: "Rénovation complète appartement",
    companyName: "Entreprise Rénovation Pro",
    companyAddress: "456 Boulevard des Artisans",
    companyPostalCode: "69001",
    companyCity: "Lyon",
    companySiret: "987 654 321 00098",
    companyTel: "04 78 00 00 00",
    companyEmail: "contact@renovpro.fr",
    clientCivility: "Mme",
    clientLastName: "Martin",
    clientNumber: "CLI-002",
    clientCity: "Lyon",
    clientAddress: "12 Rue de la République",
    footerText: "Devis valable 30 jours. Acompte de 30% à la commande.",
    footerTextPart2: "TVA applicable selon taux en vigueur",
    logoUrl: "",
    discountPercent: 10, // 10% discount
    discountAmount: 0,
    travelFees: 50,
    deliveryFees: 30,
    listRoomEstimate: [
      {
        listCategoryEstimate: [
          {
            listTaskEstimate: [
              {
                Place: "Salon",
                Type: "Peinture",
                Description: "Peinture murs et plafond avec finition mate",
                Qty: 25,
                Dimensions: "m²",
                UnitPriceExcludingVAT: 15.5,
              },
              {
                Place: "Salon",
                Type: "Peinture",
                Description: "Sous-couche isolante anti-humidité",
                Qty: 25,
                Dimensions: "m²",
                UnitPriceExcludingVAT: 8.0,
              },
            ],
          },
          {
            listTaskEstimate: [
              {
                Place: "Salon",
                Type: "Revêtement sol",
                Description: "Pose parquet flottant chêne massif",
                Qty: 20,
                Dimensions: "m²",
                UnitPriceExcludingVAT: 45.0,
              },
              {
                Place: "Salon",
                Type: "Revêtement sol",
                Description: "Fourniture plinthes assorties",
                Qty: 15,
                Dimensions: "ml",
                UnitPriceExcludingVAT: 12.0,
              },
            ],
          },
        ],
      },
    ],
  },
};
// listRoomEstimate: [
//     {
//       listCategoryEstimate: [
//         {
//           listTaskEstimate: [
//             {
//               Place: "Salon",
//               Type: "Peinture",
//               Description: "Peinture murs et plafond avec finition mate",
//               Qty: 25,
//               Dimensions: "m²",
//               UnitPriceExcludingVAT: 15.5,
//             },
//             {
//               Place: "Salon",
//               Type: "Peinture",
//               Description: "Sous-couche isolante anti-humidité",
//               Qty: 25,
//               Dimensions: "m²",
//               UnitPriceExcludingVAT: 8.0,
//             },
//           ],
//         },
//         {
//           listTaskEstimate: [
//             {
//               Place: "Salon",
//               Type: "Revêtement sol",
//               Description: "Pose parquet flottant chêne massif",
//               Qty: 20,
//               Dimensions: "m²",
//               UnitPriceExcludingVAT: 45.0,
//             },
//             {
//               Place: "Salon",
//               Type: "Revêtement sol",
//               Description: "Fourniture plinthes assorties",
//               Qty: 15,
//               Dimensions: "ml",
//               UnitPriceExcludingVAT: 12.0,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       listCategoryEstimate: [
//         {
//           listTaskEstimate: [
//             {
//               Place: "Cuisine",
//               Type: "Peinture",
//               Description: "Peinture lessivable spéciale cuisine",
//               Qty: 15,
//               Dimensions: "m²",
//               UnitPriceExcludingVAT: 18.0,
//             },
//           ],
//         },
//         {
//           listTaskEstimate: [
//             {
//               Place: "Cuisine",
//               Type: "Carrelage",
//               Description: "Pose carrelage mural 20x20",
//               Qty: 10,
//               Dimensions: "m²",
//               UnitPriceExcludingVAT: 35.0,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       listCategoryEstimate: [
//         {
//           listTaskEstimate: [
//             {
//               Place: "Chambre",
//               Type: "Peinture",
//               Description: "Peinture décorative",
//               Qty: 20,
//               Dimensions: "m²",
//               UnitPriceExcludingVAT: 16.0,
//             },
//           ],
//         },
//       ],
//     },
//   ],
// Copy all helper functions from the cloud function
function transformNewEstimateStructure(data) {
  const items = [];

  (data.listRoomEstimate || []).forEach((room, roomIndex) => {
    const roomName = room.listCategoryEstimate[0].listTaskEstimate[0].Place;
    let roomTotal = 0;
    let itemCounter = 0;

    items.push({
      no: "",
      designation: roomName,
      level: 1,
      showTotal: true,
    });

    (room.listCategoryEstimate || []).forEach((cat) => {
      const catName = cat.listTaskEstimate[0].Type;

      if (catName && catName.trim() !== "") {
        items.push({
          no: "",
          designation: catName,
          level: 2,
        });
      }

      (cat.listTaskEstimate || []).forEach((task) => {
        const qty = task.Qty || 0;
        const price = task.UnitPriceExcludingVAT || 0;
        const total = qty * price;

        roomTotal += total;

        items.push({
          no: `${roomIndex + 1}.${itemCounter + 1}`,
          designation: task.Description || task.UserTask || task.Task || "Travail",
          quantity: qty,
          quantityUnit: task.Dimensions || "",
          unitPrice: price,
          tva: "10%",
          totalHT: total,
          level: 3,
        });

        itemCounter++;
      });
    });

    if (roomTotal > 0) {
      items.push({
        no: "",
        designation: `Sous-total pour ${roomName}`,
        totalHT: roomTotal,
        level: 3,
      });
    }
  });

  return items;
}

function calculateTotals(items, discountPercent = 0, discountAmount = 0, travelFees = 0, deliveryFees = 0) {
  let totalHT = 0;
  let tva10Total = 0;
  let tva20Total = 0;

  items.forEach((item) => {
    if (item.totalHT && item.no != "") {
      totalHT += item.totalHT;
      if (item.tva === "10%") {
        tva10Total += item.totalHT * 0.1;
      } else if (item.tva === "20%") {
        tva20Total += item.totalHT * 0.2;
      }
    }
  });

  const travelFeesHT = travelFees || 0;
  const deliveryFeesHT = deliveryFees || 0;

  totalHT += travelFeesHT + deliveryFeesHT;

  if (travelFeesHT > 0) {
    tva10Total += travelFeesHT * 0.1;
  }
  if (deliveryFeesHT > 0) {
    tva10Total += deliveryFeesHT * 0.1;
  }

  let discount = 0;
  if (discountPercent > 0) {
    discount = totalHT * (discountPercent / 100);
  } else if (discountAmount > 0) {
    discount = discountAmount;
  }

  const totalAfterDiscount = totalHT - discount;

  if (discount > 0 && totalHT > 0) {
    const discountRatio = totalAfterDiscount / totalHT;
    tva10Total = tva10Total * discountRatio;
    tva20Total = tva20Total * discountRatio;
  }

  const totalTTC = totalAfterDiscount + tva10Total + tva20Total;

  return {
    sousTotalHT: totalHT,
    remise: discount,
    totalApresRemise: totalAfterDiscount,
    tva10: tva10Total,
    tva20: tva20Total,
    totalTTC: totalTTC,
    travelFees: travelFeesHT,
    deliveryFees: deliveryFeesHT,
  };
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "";
  const numAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return numAmount.toFixed(2).replace(".", ",") + " €";
}

function fetchImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });

        response.on("error", (error) => {
          reject(error);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function generatePDFContent(doc, data) {
  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = 30;

  const leftColumnX2 = margin + 30;
  const rightColumnX = margin + contentWidth / 2 + 150;
  const centrColumnX = margin + contentWidth / 2 + 20;
  const part1StartY = yPosition;
  const centerColumnX = centrColumnX - (contentWidth / 2 - 40) + 60 + 60;
  const centerColumnXDEVIS = centrColumnX - 70;
  const part2StartY = yPosition;

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(data.colorTemplate)
    .text("DEVIS", centerColumnXDEVIS, yPosition + 10, { align: "left" });

  let leftY = yPosition + 65;

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#000000")
    .text(`N° ${data.devisNumber}`, rightColumnX, leftY + 10, { width: contentWidth / 2 });

  leftY += 15;

  doc.text(`Date : ${data.date}`, rightColumnX, leftY + 10, { width: contentWidth / 2 });

  const logoY = part1StartY + 75;
  const logoHeight = 113;
  const logoWidth = contentWidth / 2 - 40;

  if (data.logoBuffer) {
    try {
      doc.image(data.logoBuffer, leftColumnX2 - 55, logoY, {
        fit: [logoWidth, logoHeight],
        align: "center",
        valign: "center",
      });
    } catch (logoError) {
      console.warn("Failed to embed logo in PDF:", logoError.message);
    }
  } else {
    doc.rect(leftColumnX2 - 35, logoY, logoWidth, logoHeight).stroke();
    doc
      .fontSize(9)
      .fillColor("#999999")
      .text("LOGO", leftColumnX2 - 55, logoY + logoHeight / 2 - 5, {
        width: logoWidth + 40,
        align: "center",
      });
  }

  yPosition = part1StartY + 210;

  const leftPosionX = margin;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#000000")
    .text(capitalizeFirst(data.companyName), leftPosionX, yPosition, {
      width: contentWidth / 2,
    });

  yPosition += 14;

  doc.text(`${data.companyAddress} ${data.companyCity} ${data.companyPostalCode}`, leftPosionX, yPosition, {
    width: contentWidth / 2,
  });

  yPosition += 14;

  doc.text(`SIRET : ${data.companySiret}`, leftPosionX, yPosition, {
    width: contentWidth / 2,
  });

  yPosition += 14;

  doc.text(`Tél : ${data.companyTel}`, leftPosionX, yPosition, { width: contentWidth / 2 });

  yPosition += 14;

  doc.text(`Email : ${data.companyEmail}`, leftPosionX, yPosition, {
    width: contentWidth / 2,
  });

  let clientY = part2StartY + 215;

  doc
    .fillColor("#000000")
    .font("Helvetica")
    .fontSize(11)
    .text("Client : ", centerColumnX, clientY, { continued: true })
    .font("Helvetica-Bold")
    .text(`${data.clientCivility} ${capitalizeFirst(data.clientLastName)}`);

  clientY += 14;

  doc.text(`${data.clientCity} ${data.clientAddress}`, centerColumnX, clientY, {
    width: contentWidth / 2,
  });

  clientY += 15;

  clientY += 10;

  doc.text(`N° client : ${data.clientNumber}`, centerColumnX, clientY, {
    width: contentWidth / 2,
  });

  yPosition = Math.max(yPosition + 15, clientY + 15);

  yPosition += 56;

  if (data.title) {
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#000000").text(capitalizeFirst(data.title), margin, yPosition, {
      width: contentWidth,
      align: "left",
    });

    yPosition += 30;
  }

  const tableTop = yPosition;
  const tableHeaders = ["N°", "Désignation", "Qté", "Prix U.", "TVA", "TOTAL HT"];
  const colWidths = [35, 220, 50, 85, 50, 95];
  const colPositions = [];

  let xPos = margin;
  for (let i = 0; i < colWidths.length; i++) {
    colPositions.push(xPos);
    xPos += colWidths[i];
  }

  doc.fillColor(data.colorTemplate).rect(margin, tableTop, contentWidth, 20).fill();

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#FFFFFF");

  for (let i = 0; i < tableHeaders.length; i++) {
    doc.text(tableHeaders[i], colPositions[i] + 2, tableTop + 5, {
      width: colWidths[i] - 4,
      align: i === 0 ? "left" : i > 1 ? "center" : "left",
    });
  }

  yPosition = tableTop + 20;

  doc.fillColor("#000000");

  for (const item of data.items) {
    let rowHeight = 25;

    if (item.designation && item.designation.length > 0) {
      const charsPerLine = 45;
      const estimatedLines = Math.ceil(item.designation.length / charsPerLine);
      const newlineCount = (item.designation.match(/\n/g) || []).length;
      const totalLines = Math.max(estimatedLines, newlineCount + 1);

      if (totalLines > 1) {
        rowHeight = 20 + totalLines * 14;
      }
    }

    if (yPosition + rowHeight > doc.page.height - 100) {
      doc.addPage();
      yPosition = 30;
    }

    if (item.level === 1) {
      doc.fillColor(data.colorTemplate).opacity(0.4).rect(margin, yPosition, contentWidth, rowHeight).fill();

      doc.opacity(1).fillColor("#000000").font("Helvetica-Bold").fontSize(12);

      if (item.no) {
        doc.text(item.no, colPositions[0] + 2, yPosition + 7, { width: colWidths[0] - 4 });
      }

      doc.text(item.designation, colPositions[1] + 2, yPosition + 7, {
        width: colWidths[1] - 4,
        lineGap: 3,
        align: "left",
      });

      if (item.showTotal && item.totalHT) {
        doc.text(formatCurrency(item.totalHT), colPositions[5] + 2, yPosition + 7, {
          width: colWidths[5] - 4,
          align: "right",
        });
      }
    } else if (item.level === 2) {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(item.designation, colPositions[1] + 2, yPosition + 7, {
          width: colWidths[1] - 4,
          lineGap: 3,
          align: "left",
        });
    } else {
      doc.font("Helvetica").fontSize(11);

      if (item.no) {
        doc.text(item.no, colPositions[0] + 2, yPosition + 7, { width: colWidths[0] - 4 });
      }

      doc.text(item.designation, colPositions[1] + 2, yPosition + 7, {
        width: colWidths[1] - 4,
        lineGap: 3,
        align: "left",
        ellipsis: false,
      });

      if (item.quantity !== null && item.quantity !== undefined) {
        const qtyText = item.quantityUnit ? `${item.quantity} ${item.quantityUnit}` : item.quantity.toString();
        doc.text(qtyText, colPositions[2] + 2, yPosition + 7, {
          width: colWidths[2] - 4,
          align: "center",
        });
      }

      if (item.unitPrice !== null && item.unitPrice !== undefined && item.unitPrice > 0) {
        doc.text(formatCurrency(item.unitPrice), colPositions[3] + 2, yPosition + 7, {
          width: colWidths[3] - 4,
          align: "right",
        });
      }

      if (item.tva) {
        doc.text(item.tva, colPositions[4] + 2, yPosition + 7, {
          width: colWidths[4] - 4,
          align: "center",
        });
      }

      if (item.totalHT !== null && item.totalHT !== undefined && item.totalHT > 0) {
        doc.text(formatCurrency(item.totalHT), colPositions[5] + 2, yPosition + 7, {
          width: colWidths[5] - 4,
          align: "right",
        });
      }
    }

    doc
      .strokeColor("#CCCCCC")
      .lineWidth(0.5)
      .moveTo(margin, yPosition + rowHeight)
      .lineTo(pageWidth - margin, yPosition + rowHeight)
      .stroke();

    yPosition += rowHeight;
  }

  yPosition += 20;

  if (yPosition > doc.page.height - 250) {
    doc.addPage();
    yPosition = 30;
  }

  const feesTableWidth = 310;
  const feesStartX = pageWidth - margin - feesTableWidth - 90;
  const feesLabelWidth = 150;
  const feesValueWidth = 50;
  const feesTvaWidth = 50;
  const feesRowHeight = 20;
  const feesOffset = 60;

  const feesRows = [];

  if (data.totals.travelFees > 0) {
    feesRows.push({
      label: "Frais de déplacement",
      value: formatCurrency(data.totals.travelFees),
      tva: "10%",
    });
  }

  if (data.totals.deliveryFees > 0) {
    feesRows.push({
      label: "Frais de livraison",
      value: formatCurrency(data.totals.deliveryFees),
      tva: "10%",
    });
  }

  if (data.totals.deliveryFees > 0) {
    feesRows.push({
      label: "Remise",
      value: formatCurrency(data.totals.remise),
      tva: "20%",
    });
  }

  if (feesRows.length > 0) {
    feesRows.forEach((row, index) => {
      const rowY = yPosition + index * feesRowHeight;

      doc.font("Helvetica").fontSize(11).fillColor("#000000");

      doc.text(row.label, feesStartX + 5, rowY + 5, {
        width: feesLabelWidth - 10,
        align: "right",
      });

      doc.text(row.value, feesStartX + feesLabelWidth + feesOffset, rowY + 5, {
        width: feesValueWidth - 5,
        align: "right",
      });

      doc.text(row.tva, feesStartX + feesLabelWidth + feesValueWidth + feesOffset, rowY + 5, {
        width: feesTvaWidth - 5,
        align: "center",
      });
    });

    yPosition += feesRows.length * feesRowHeight + 20;
  }

  const totalsTableWidth = 160;
  const totalsStartX = pageWidth - margin - totalsTableWidth;
  const totalsStartXLine = pageWidth - margin - totalsTableWidth / 2;
  const totalsLabelWidth = 120;
  const totalsValueWidth = 100;
  const totalsRowHeight = 20;

  const totalsRows = [];

  if (data.totals.sousTotalHT > 0) {
    totalsRows.push({
      label: "Sous-Total HT",
      value: formatCurrency(data.totals.sousTotalHT),
      bold: true,
      fontSize: 11,
    });
  }

  if (data.totals.remise > 0) {
    totalsRows.push({
      label: "Remise",
      value: formatCurrency(-data.totals.remise),
      bold: true,
      fontSize: 11,
    });

    totalsRows.push({
      label: "Total après remise",
      value: formatCurrency(data.totals.totalApresRemise),
      bold: true,
      fontSize: 11,
    });
  }

  if (data.totals.tva10 > 0) {
    totalsRows.push({
      label: "TVA à 10%",
      value: formatCurrency(data.totals.tva10),
      bold: false,
      fontSize: 11,
    });
  }

  if (data.totals.tva20 > 0) {
    totalsRows.push({
      label: "TVA à 20%",
      value: formatCurrency(data.totals.tva20),
      bold: false,
      fontSize: 11,
    });
  }

  totalsRows.push({
    label: "Total TTC",
    value: formatCurrency(data.totals.totalTTC),
    bold: true,
    fontSize: 13,
  });

  totalsRows.forEach((row, index) => {
    const rowY = yPosition + index * totalsRowHeight;

    if (index === 0) {
      doc
        .strokeColor("#E0E0E0")
        .moveTo(totalsStartXLine, rowY)
        .lineTo(totalsStartXLine + totalsTableWidth / 2, rowY)
        .stroke();
    }

    doc
      .moveTo(totalsStartXLine, rowY + totalsRowHeight)
      .lineTo(totalsStartXLine + totalsTableWidth / 2, rowY + totalsRowHeight)
      .stroke();

    doc
      .moveTo(totalsStartXLine + totalsTableWidth / 2, rowY)
      .lineTo(totalsStartXLine + totalsTableWidth / 2, rowY + totalsRowHeight)
      .stroke();

    doc
      .font(row.bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(row.fontSize)
      .fillColor("#000000");

    doc.text(row.label, totalsStartX + 5, rowY + 5, {
      width: totalsLabelWidth - 10,
      align: "left",
    });

    doc.text(row.value, totalsStartX + totalsLabelWidth / 2, rowY + 5, {
      width: totalsValueWidth - 5,
      align: "right",
    });
  });

  yPosition += totalsRows.length * totalsRowHeight + 20;

  if (data.footerText) {
    doc.font("Helvetica").fontSize(11).fillColor("#000000").text(data.footerText, margin, yPosition, {
      width: contentWidth,
      align: "left",
      lineGap: 5,
    });
    yPosition += 30;
  }

  if (data.footerTextPart2) {
    doc.font("Helvetica").fontSize(11).fillColor("#000000").text(data.footerTextPart2, margin, yPosition, {
      width: contentWidth,
      align: "left",
      lineGap: 5,
    });
    yPosition += 30;
  }

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#000000")
    .text("Date :                      Signature :", margin, yPosition, {
      width: contentWidth,
      align: "left",
    });
}

async function generatePDFBuffer(estimateData) {
  return new Promise(async (resolve, reject) => {
    try {
      const items = transformNewEstimateStructure(estimateData.estimateData || estimateData);
      const totals = calculateTotals(
        items,
        estimateData.discountPercent,
        estimateData.discountAmount,
        estimateData.travelFees,
        estimateData.deliveryFees
      );

      let logoBuffer = null;
      if (estimateData.logoUrl) {
        try {
          logoBuffer = await fetchImageFromUrl(estimateData.logoUrl);
        } catch (logoError) {
          console.warn("Failed to fetch logo:", logoError.message);
        }
      }

      const devisData = {
        devisNumber: estimateData.devisNumber,
        date: estimateData.date,
        colorTemplate: estimateData.colorTemplate,
        companyName: estimateData.companyName,
        companyAddress: estimateData.companyAddress,
        companyPostalCode: estimateData.companyPostalCode,
        companyCity: estimateData.companyCity,
        companySiret: estimateData.companySiret,
        companyTel: estimateData.companyTel,
        companyEmail: estimateData.companyEmail,
        clientCivility: estimateData.clientCivility,
        clientLastName: estimateData.clientLastName,
        clientNumber: estimateData.clientNumber,
        clientAddress: estimateData.clientAddress,
        clientCity: estimateData.clientCity,
        title: estimateData.title,
        items: items,
        totals: totals,
        footerText: estimateData.footerText,
        footerTextPart2: estimateData.footerTextPart2,
        logoBuffer: logoBuffer,
      };

      const doc = new PDFDocument({
        size: "A4",
        margin: 30,
        bufferPages: true,
      });

      const chunks = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on("error", (error) => {
        reject(error);
      });

      generatePDFContent(doc, devisData);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Main test function
async function runTest() {
  console.log("🧪 PDF Generation Test Suite\n");
  console.log("Available test scenarios:");
  console.log("  1. basic - Minimal test data");
  console.log("  2. fullFeatures - Complete test with discount and fees\n");

  // Get scenario from command line or use default
  const scenarioName = process.argv[2] || "fullFeatures";
  const testData = TEST_SCENARIOS[scenarioName];

  if (!testData) {
    console.error(`❌ Unknown scenario: ${scenarioName}`);
    console.log(`Available scenarios: ${Object.keys(TEST_SCENARIOS).join(", ")}`);
    process.exit(1);
  }

  console.log(`📋 Running scenario: ${scenarioName}\n`);

  try {
    // Simulate the cloud function request processing
    const estimateData = {
      devisNumber: testData.devisNumber,
      date: testData.date || new Date().toLocaleDateString("fr-FR"),
      colorTemplate: testData.colorTemplate,
      companyName: testData.companyName,
      companyAddress: testData.companyAddress,
      companyPostalCode: testData.companyPostalCode,
      companyCity: testData.companyCity,
      companySiret: testData.companySiret,
      companyTel: testData.companyTel,
      companyEmail: testData.companyEmail,
      clientCivility: testData.clientCivility,
      clientLastName: testData.clientLastName,
      clientNumber: testData.clientNumber,
      clientCity: testData.clientCity,
      clientAddress: testData.clientAddress,
      estimateData: {
        companyName: testData.companyName,
        companyAddress: testData.companyAddress,
        companyPostalCode: testData.companyPostalCode,
        companyCity: testData.companyCity,
        companySiret: testData.companySiret,
        companyTel: testData.companyTel,
        companyEmail: testData.companyEmail,
        clientCivility: testData.clientCivility,
        clientLastName: testData.clientLastName,
        clientNumber: testData.clientNumber,
        clientCity: testData.clientCity,
        clientAddress: testData.clientAddress,
        listRoomEstimate: testData.listRoomEstimate,
        subject: testData.subject,
      },
      title: testData.subject || "DEVIS TRAVAUX",
      footerText: testData.footerText,
      footerTextPart2: testData.footerTextPart2,
      logoUrl: testData.logoUrl || null,
      discountPercent: parseFloat(testData.discountPercent) || 0,
      discountAmount: parseFloat(testData.discountAmount) || 0,
      travelFees: parseFloat(testData.travelFees) || 0,
      deliveryFees: parseFloat(testData.deliveryFees) || 0,
    };

    console.log(`📝 Generating PDF for: ${testData.devisNumber}`);
    console.log(`   Client: ${testData.clientCivility} ${testData.clientLastName}`);
    console.log(`   Rooms: ${testData.listRoomEstimate.length}`);
    if (testData.discountPercent > 0) {
      console.log(`   Discount: ${testData.discountPercent}%`);
    }
    if (testData.travelFees > 0 || testData.deliveryFees > 0) {
      console.log(`   Extra fees: ${testData.travelFees + testData.deliveryFees}€`);
    }
    console.log();

    const pdfBuffer = await generatePDFBuffer(estimateData);

    const fileName = `test_${scenarioName}_${testData.devisNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    fs.writeFileSync(fileName, pdfBuffer);

    console.log(`✅ PDF generated successfully!`);
    console.log(`📄 File: ${fileName}`);
    console.log(`📊 Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n💡 To test a different scenario, run:`);
    console.log(`   node test-complete-pdf.js basic`);
    console.log(`   node test-complete-pdf.js fullFeatures`);
    console.log(`\n🔧 Edit TEST_SCENARIOS in this file to create custom tests`);
  } catch (error) {
    console.error("\n❌ Error generating PDF:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest();
