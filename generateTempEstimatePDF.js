/**
 * Firebase Cloud Functions for PDF DEVIS Generation
 *
 * Deploy this file to Firebase Functions to generate PDFs via HTTP requests
 */

// ===== ALL REQUIRE STATEMENTS AT TOP =====
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const PDFDocument = require("pdfkit");

/**
 * Cloud Function: Create Estimate PDF
 *
 * Endpoint: POST /generateTempEstimatePDF
 *
 * Request Body:
 * {
 *   "devisNumber": "D202500001",
 *   "date": "07/11/2025",
 *   "color2": "#4A90E2",
 *   "company": { name, address, postalCode, city, siret, tel, email, logoPath },
 *   "client": { civility, lastName, address, postalCode, city, clientNumber },
 *   "title": "Project Title",
 *   "estimate": [ { L1, L2, work, description, dimensionsValue, dimensionsUnit, priceUnit, priceTotal, emplacement } ]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "PDF generated successfully",
 *   "data": {
 *     "pdfUrl": "https://storage.googleapis.com/...",
 *     "pdfPath": "devis/D202500001.pdf",
 *     "fileName": "devis_D202500001.pdf"
 *   }
 * }
 */
exports.generateTempEstimatePDF = functions
  .runWith({
    timeoutSeconds: 100,
    memory: "512MB", // Increased memory for PDF generation
  })
  .https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      try {
        // Validate request method
        if (req.method !== "POST") {
          return res.status(405).json({
            success: false,
            error: "Method not allowed. Use POST.",
          });
        }

        // Extract data from request body
        const { devisNumber, date, color2, company, client, title, estimate, footerText } = req.body;

        // Validate required fields
        if (!estimate || !Array.isArray(estimate) || estimate.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing or invalid "estimate" array in request body.',
          });
        }

        if (!devisNumber) {
          return res.status(400).json({
            success: false,
            error: 'Missing required field: "devisNumber".',
          });
        }

        // Prepare estimate data
        const estimateData = {
          devisNumber: devisNumber,
          // || 'D202500001'
          date: date || new Date().toLocaleDateString("fr-FR"),
          color2: color2,
          // || '#4A90E2'
          company: company,
          // || {
          //   name: 'MA SOCIÉTÉ',
          //   address: '123 Rue de la République',
          //   postalCode: '75001',
          //   city: 'Paris',
          //   siret: '123 456 789 00010',
          //   tel: '01 23 45 67 89',
          //   email: 'contact@masociete.fr',
          //   logoPath: null,
          // }
          client: client,
          // || {
          //   civility: 'Mr.',
          //   lastName: 'CLIENT',
          //   address: '45 Avenue des Champs',
          //   postalCode: '75008',
          //   city: 'Paris',
          //   clientNumber: 'C001',
          // }
          title: title,
          // || 'DEVIS TRAVAUX'
          estimate: estimate,
          footerText: footerText,
          // ||
          // 'Si ce devis vous convient, veuillez nous le retourner signé précédé de la mention :\n\n"BON POUR ACCORD ET EXÉCUTION DU DEVIS"\n\nDate :                     Signature :'
        };

        console.log(`Generating PDF for devis: ${devisNumber}`);

        // Generate PDF in memory
        const pdfBuffer = await generatePDFBuffer(estimateData);

        // Generate file name
        const fileName = `devis_${devisNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        const filePath = `devis/${fileName}`;

        // Upload to Firebase Storage
        const bucket = admin.storage().bucket();
        const file = bucket.file(filePath);

        await file.save(pdfBuffer, {
          contentType: "application/pdf",
          metadata: {
            metadata: {
              devisNumber: devisNumber,
              generatedAt: new Date().toISOString(),
              clientName: client?.lastName || "Unknown",
            },
          },
        });

        // Generate a signed URL (valid for 7 days)
        const [signedUrl] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 7 days
        });

        console.log(`PDF generated successfully: ${signedUrl}`);

        // Return success response
        return res.status(200).json({
          success: true,
          message: "PDF generated successfully",
          data: {
            pdfUrl: signedUrl,
            pdfPath: filePath,
            fileName: fileName,
            devisNumber: devisNumber,
          },
        });
      } catch (error) {
        console.error("Error generating PDF:", error);

        return res.status(500).json({
          success: false,
          error: "Failed to generate PDF",
          message: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    });
  });

/**
 * Helper function to generate PDF as Buffer
 */
async function generatePDFBuffer(estimateData) {
  return new Promise((resolve, reject) => {
    try {
      // Transform estimate to items (using top-level require)
      const items = transformEstimateToItems(estimateData.estimate);

      // Calculate totals
      const totals = calculateTotals(items);

      // Build devis data structure
      const devisData = {
        devisNumber: estimateData.devisNumber,
        date: estimateData.date,
        color2: estimateData.color2,
        company: estimateData.company,
        client: estimateData.client,
        title: estimateData.title,
        items: items,
        totals: totals,
        footerText: estimateData.footerText,
      };

      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 30,
        bufferPages: true,
      });

      // Collect PDF chunks in memory
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

      // Generate PDF content (same as generateDevis function)
      generatePDFContent(doc, devisData);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate PDF content (extracted from generateDevis.js)
 */
function generatePDFContent(doc, data) {
  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = 30;

  // ===== PART 1: HEADER ROW (DEVIS + LOGO) =====
  const leftColumnX = margin;
  const rightColumnX = margin + contentWidth / 2 + 20;
  const part1StartY = yPosition;

  // Left side - DEVIS title, N°, Date
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(data.color2)
    .text("DEVIS", leftColumnX, yPosition, { align: "left" });

  let leftY = yPosition + 35;

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#000000")
    .text(`N° ${data.devisNumber}`, leftColumnX, leftY, { width: contentWidth / 2 });

  leftY += 15;

  doc.text(`Date : ${data.date}`, leftColumnX, leftY, { width: contentWidth / 2 });

  // Right side - Logo placeholder
  const logoY = part1StartY;
  const logoHeight = 113;
  const logoWidth = contentWidth / 2 - 40;

  doc.rect(rightColumnX + 20, logoY, logoWidth, logoHeight).stroke();
  doc
    .fontSize(9)
    .fillColor("#999999")
    .text("LOGO", rightColumnX, logoY + logoHeight / 2 - 5, {
      width: logoWidth + 40,
      align: "center",
    });

  // Move 8cm below Part 1 start
  yPosition = part1StartY + 226;

  // ===== PART 2: COMPANY AND CLIENT INFO =====
  const part2StartY = yPosition;

  // Left side - Company info
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#000000")
    .text(capitalizeFirst(data.company.name), leftColumnX, yPosition, {
      width: contentWidth / 2,
    });

  yPosition += 15;

  doc
    .font("Helvetica")
    .fontSize(11)
    .text(data.company.address, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 12;

  doc.text(`${data.company.postalCode} ${data.company.city}`, leftColumnX, yPosition, {
    width: contentWidth / 2,
  });

  yPosition += 12;

  doc.text(`SIRET : ${data.company.siret}`, leftColumnX, yPosition, {
    width: contentWidth / 2,
  });

  yPosition += 12;

  doc.text(`Tél : ${data.company.tel}`, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 12;

  doc.text(`Email : ${data.company.email}`, leftColumnX, yPosition, {
    width: contentWidth / 2,
  });

  // Right side - Client info
  let clientY = part2StartY;

  doc
    .fillColor("#000000")
    .font("Helvetica")
    .fontSize(11)
    .text("Client : ", rightColumnX, clientY, { continued: true })
    .font("Helvetica-Bold")
    .text(`${data.client.civility} ${capitalizeFirst(data.client.lastName)}`);

  clientY += 15;

  doc.font("Helvetica").text(data.client.address, rightColumnX, clientY, { width: contentWidth / 2 });

  clientY += 12;

  doc.text(`${data.client.postalCode} ${data.client.city}`, rightColumnX, clientY, {
    width: contentWidth / 2,
  });

  clientY += 15;

  clientY += 10;

  doc.text(`N° client : ${data.client.clientNumber}`, rightColumnX, clientY, {
    width: contentWidth / 2,
  });

  yPosition = Math.max(yPosition + 15, clientY + 15);

  yPosition += 56; // 2cm spacing

  // ===== TITLE =====
  if (data.title) {
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#000000").text(capitalizeFirst(data.title), margin, yPosition, {
      width: contentWidth,
      align: "left",
    });

    yPosition += 30;
  }

  // ===== TABLE =====
  const tableTop = yPosition;
  const tableHeaders = ["N°", "Désignation", "Qté", "Prix U.", "TVA", "TOTAL HT"];
  const colWidths = [35, 250, 50, 70, 50, 80];
  const colPositions = [];

  let xPos = margin;
  for (let i = 0; i < colWidths.length; i++) {
    colPositions.push(xPos);
    xPos += colWidths[i];
  }

  // Table header
  doc.fillColor(data.color2).rect(margin, tableTop, contentWidth, 20).fill();

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#FFFFFF");

  for (let i = 0; i < tableHeaders.length; i++) {
    doc.text(tableHeaders[i], colPositions[i] + 2, tableTop + 5, {
      width: colWidths[i] - 4,
      align: i === 0 ? "left" : i > 1 ? "center" : "left",
    });
  }

  yPosition = tableTop + 20;

  // Table rows
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
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(12);

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

  // ===== TOTALS SECTION =====
  const totalsStartX = pageWidth - margin - 250;

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000");

  if (data.totals.sousTotalHT > 0) {
    doc.text("Sous-Total HT", totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.sousTotalHT), totalsStartX + 150, yPosition, {
      width: 100,
      align: "right",
    });
    yPosition += 15;
  }

  if (data.totals.remise > 0) {
    doc.text("Remise", totalsStartX, yPosition);
    doc.text(formatCurrency(-data.totals.remise), totalsStartX + 150, yPosition, {
      width: 100,
      align: "right",
    });
    yPosition += 15;

    doc.text("Total après remise", totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.totalApresRemise), totalsStartX + 150, yPosition, {
      width: 100,
      align: "right",
    });
    yPosition += 15;
  }

  doc.font("Helvetica");

  if (data.totals.tva10 > 0) {
    doc.text("TVA à 10%", totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.tva10), totalsStartX + 150, yPosition, {
      width: 100,
      align: "right",
    });
    yPosition += 15;
  }

  if (data.totals.tva20 > 0) {
    doc.text("TVA à 20%", totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.tva20), totalsStartX + 150, yPosition, {
      width: 100,
      align: "right",
    });
    yPosition += 15;
  }

  yPosition += 5;

  doc.font("Helvetica-Bold").fontSize(13);

  doc.text("Total TTC", totalsStartX, yPosition);
  doc.text(formatCurrency(data.totals.totalTTC), totalsStartX + 150, yPosition, {
    width: 100,
    align: "right",
  });

  yPosition += 40;

  // ===== FOOTER =====
  if (data.footerText) {
    doc.font("Helvetica").fontSize(11).fillColor("#000000").text(data.footerText, margin, yPosition, {
      width: contentWidth,
      align: "left",
      lineGap: 5,
    });
  }
}

// Helper functions
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "";
  return amount.toFixed(2).replace(".", ",") + " €";
}

/**
 * Alternative Cloud Function: Create Estimate PDF (Private/Authenticated)
 *
 * This version requires Firebase Authentication
 */
exports.createEstimateProfessionalTempAuth = functions
  .runWith({
    timeoutSeconds: 100,
    memory: "512MB",
  })
  .https.onCall(async (data, context) => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to generate PDF.");
      }

      // Extract user info
      const userId = context.auth.uid;
      const userEmail = context.auth.token.email;

      console.log(`PDF generation requested by user: ${userEmail} (${userId})`);

      // Validate input data
      const { estimate, devisNumber, company, client, title } = data;

      if (!estimate || !Array.isArray(estimate) || estimate.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", 'Missing or invalid "estimate" array.');
      }

      if (!devisNumber) {
        throw new functions.https.HttpsError("invalid-argument", 'Missing required field: "devisNumber".');
      }

      // Prepare estimate data
      const estimateData = {
        devisNumber: devisNumber,
        date: data.date || new Date().toLocaleDateString("fr-FR"),
        color2: data.color2 || "#4A90E2",
        company: company,
        client: client,
        title: title || "DEVIS TRAVAUX",
        estimate: estimate,
        footerText: data.footerText,
      };

      // Generate PDF
      const pdfBuffer = await generatePDFBuffer(estimateData);

      // Generate file name
      const fileName = `devis_${devisNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      const filePath = `users/${userId}/devis/${fileName}`;

      // Upload to Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);

      await file.save(pdfBuffer, {
        contentType: "application/pdf",
        metadata: {
          metadata: {
            userId: userId,
            userEmail: userEmail,
            devisNumber: devisNumber,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      // Generate signed URL (valid for 1 hour)
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 3600000, // 1 hour
      });

      console.log(`PDF generated successfully for user: ${userId}`);

      return {
        success: true,
        message: "PDF generated successfully",
        data: {
          pdfUrl: signedUrl,
          pdfPath: filePath,
          fileName: fileName,
          devisNumber: devisNumber,
        },
      };
    } catch (error) {
      console.error("Error generating PDF:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError("internal", "Failed to generate PDF", error.message);
    }
  });

module.exports = exports;

/**
 * Transforms estimate array (Scenario 2 & 3) into PDF items
 * @param {Array} estimate - Array of estimate items
 * @returns {Array} - Formatted items for PDF generation
 */
function transformEstimateToItems(estimate) {
  const items = [];
  const l1Groups = {};
  let itemCounter = 0;

  // Group by L1
  estimate.forEach((item) => {
    if (!l1Groups[item.L1]) {
      l1Groups[item.L1] = [];
    }
    l1Groups[item.L1].push(item);
  });

  // Process each L1 group
  Object.keys(l1Groups).forEach((l1Key, l1Index) => {
    const l1Items = l1Groups[l1Key];

    // Calculate L1 total
    const l1Total = l1Items.reduce((sum, item) => sum + (item.priceTotal || 0), 0);

    // Add L1 header
    items.push({
      no: (l1Index + 1).toString(),
      designation: l1Key,
      quantity: null,
      unitPrice: null,
      tva: null,
      totalHT: l1Total > 0 ? l1Total : null,
      isHeader: true,
      level: 1,
      showTotal: true,
    });

    // Group by L2 within this L1
    const l2Groups = {};
    l1Items.forEach((item) => {
      if (!l2Groups[item.L2]) {
        l2Groups[item.L2] = [];
      }
      l2Groups[item.L2].push(item);
    });

    // Process each L2 group
    Object.keys(l2Groups).forEach((l2Key) => {
      const l2Items = l2Groups[l2Key];

      // Add L2 header
      items.push({
        no: "",
        designation: l2Key,
        quantity: null,
        unitPrice: null,
        tva: null,
        totalHT: null,
        isHeader: true,
        level: 2,
      });

      // Add L3 work items
      l2Items.forEach((workItem, idx) => {
        itemCounter++;

        // Build designation with description and emplacement
        let designation = workItem.work || workItem.userWork;

        if (workItem.description) {
          designation = workItem.description;
        }

        // Add emplacement to the end if it exists (Scenario 3)
        if (workItem.emplacement) {
          designation += `\n${workItem.emplacement}`;
        }

        // Determine TVA percentage
        let tvaText = null;
        if (workItem.priceUnit > 0) {
          tvaText = "20%"; // Default, can be customized based on workMatch
        }

        items.push({
          no: `${l1Index + 1}.${idx + 1}`,
          designation: designation,
          quantity: workItem.dimensionsValue || null,
          quantityUnit: workItem.dimensionsUnit || "",
          unitPrice: workItem.priceUnit || null,
          tva: tvaText,
          totalHT: workItem.priceTotal || null,
          isHeader: false,
          level: 3,
        });
      });
    });
  });

  return items;
}

/**
 * Calculate totals from items
 * @param {Array} items - Array of items
 * @returns {Object} - Totals object
 */
function calculateTotals(items) {
  let totalHT = 0;
  let tva10Total = 0;
  let tva20Total = 0;

  items.forEach((item) => {
    if (item.totalHT) {
      totalHT += item.totalHT;

      if (item.tva === "10%") {
        tva10Total += item.totalHT * 0.1;
      } else if (item.tva === "20%") {
        tva20Total += item.totalHT * 0.2;
      }
    }
  });

  const totalTTC = totalHT + tva10Total + tva20Total;

  return {
    sousTotalHT: totalHT,
    remise: 0,
    totalApresRemise: totalHT,
    tva10: tva10Total,
    tva20: tva20Total,
    totalTTC: totalTTC,
  };
}

// Helper functions
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "";
  return amount.toFixed(2).replace(".", ",") + " €";
}
