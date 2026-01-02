/**
 * Firebase Cloud Functions for PDF DEVIS Generation
 *
 * Deploy this file to Firebase Functions to generate PDFs via HTTP requests
 */

// ===== ALL REQUIRE STATEMENTS AT TOP =====
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");
const https = require("https");
const http = require("http");


exports.generateEstimatePDFModel01 = functions.https.onRequest(async (req, res) => {
  try {
    const {
      devisNumber,
      date,
      colorTemplate,
      listRoomEstimate,
      subject,
      footerText,
      footerTextPart2,
      logoUrl,
      companyName,
      companyAddress,
      companyPostalCode,
      companyCity,
      companySiret,
      companyTel,
      companyEmail,
      clientCivility,
      clientLastName,
      clientNumber,
      clientCity,
      clientAddress,
      templateModelName,
      discountPercent,
      discountAmount,
      travelFees,
      deliveryFees,
      estimateDuration,
      estimateStartDate
    } = req.body;
    
    
console.log("estimateDuration");
console.log(estimateDuration);
console.log("estimateStartDate");
console.log(estimateStartDate);
    if (!listRoomEstimate || !Array.isArray(listRoomEstimate) || listRoomEstimate.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "listRoomEstimate" array in request body.',
      });
    }

    if (!devisNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: "devisNumber".',
      });
    }

    const estimateData = {
      devisNumber,
      date: date || new Date().toLocaleDateString("fr-FR"),
      colorTemplate,
      companyName,
      companyAddress,
      companyPostalCode,
      companyCity,
      companySiret,
      companyTel,
      companyEmail,
      clientCivility,
      clientLastName,
      clientNumber,
      clientCity,
      clientAddress,
      estimateData: {
        companyName,
        companyAddress,
        companyPostalCode,
        companyCity,
        companySiret,
        companyTel,
        companyEmail,
        clientCivility,
        clientLastName,
        clientNumber,
        clientCity,
        clientAddress,
        listRoomEstimate,
        subject,
      },
      title: subject || "DEVIS TRAVAUX",
      footerText,
      footerTextPart2,
      logoUrl: logoUrl || null,
      discountPercent: parseFloat(discountPercent) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      travelFees: parseFloat(travelFees) || 0,
      deliveryFees: parseFloat(deliveryFees) || 0,
      estimateDuration: estimateDuration,
      estimateStartDate: estimateStartDate
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
          clientName: clientLastName || "Unknown",
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

/**
 * Transforms new input structure (listRoomEstimate) into PDF-ready items
 * @param {Object} data - full input JSON from body
 * @returns {Array} - flattened array for PDF
 */


function transformNewEstimateStructure(data) {
  const items = [];

  (data.listRoomEstimate || []).forEach((room, roomIndex) => {
    let roomName = "";
    let roomTotal = 0;
    let itemCounter = 0;

    // Try to find first task that has a Place value
    if (room.listCategoryEstimate?.length > 0) {
      const firstCat = room.listCategoryEstimate[0];
      if (firstCat.listTaskEstimate?.length > 0) {
        roomName =
          firstCat.listTaskEstimate[0].Place ||
          firstCat.listTaskEstimate[0].Task ||
          "";
      }
    }

    // If no name found, fallback:
    if (!roomName || roomName.trim() === "") {
      roomName = room.RoomName || `Pièce ${roomIndex + 1}`;
    }

    // Compute total for this room
    (room.listCategoryEstimate || []).forEach((cat) => {
      (cat.listTaskEstimate || []).forEach((task) => {
        const qty = Number(task.Qty) || 0;
        const price = Number(task.UnitPriceExcludingVAT) || 0;
        roomTotal += qty * price;
      });
    });

    // Add Room row
    items.push({
      no: "",
      designation: roomName,
      level: 1,
      showTotal: true,
      totalHT: roomTotal,
    });

    // Loop through categories
    (room.listCategoryEstimate || []).forEach((cat) => {
      const catName = cat.listTaskEstimate?.[0]?.Type;
      if (catName && catName.trim() !== "") {
        items.push({
          no: "",
          designation: catName,
          level: 2,
        });
      }

      // Loop through tasks
      (cat.listTaskEstimate || []).forEach((task) => {
        const qty = Number(task.Qty) || 0;
        const price = Number(task.UnitPriceExcludingVAT) || 0;
        const total = qty * price;

        items.push({
          no: `${roomIndex + 1}.${itemCounter + 1}`,
          designation:
            task.Description ||
            task.descriptionBrief ||
            task.UserTask ||
            task.Task ||
            "Travail",
          quantity: qty,
          quantityUnit: task.Dimensions || "",
          unitPrice: price,
          tva: task.tvaRate || "10%",
          totalHT: total,
          level: 3,
        });

        itemCounter++;
      });
    });
  });

  return items;
}

/**
 * Helper function to generate PDF as Buffer
 */
async function generatePDFBuffer(estimateData) {
  return new Promise(async (resolve, reject) => {
    try {
      // Transform estimate to items (using top-level require)
      //const items = transformEstimateToItems(estimateData.estimate);
      const items = transformNewEstimateStructure(estimateData.estimateData || estimateData);
      // Calculate totals with remise and additional fees
      const totals = calculateTotals(
        items,
        estimateData.discountPercent,
        estimateData.discountAmount,
        estimateData.travelFees,
        estimateData.deliveryFees
      );

      // Fetch logo if URL is provided
      let logoBuffer = null;
      if (estimateData.logoUrl) {
        try {
          logoBuffer = await fetchImageFromUrl(estimateData.logoUrl);
        } catch (logoError) {
          console.warn("Failed to fetch logo:", logoError.message);
          // Continue without logo
        }
      }



      // Build devis data structure
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
        duration: estimateData.estimateDuration,
        startDate: estimateData.estimateStartDate,
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
    .fillColor(data.colorTemplate)
    .text("DEVIS", leftColumnX, yPosition, { align: "left" });

  let leftY = yPosition + 35;

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#000000")
    .text(`N° ${data.devisNumber}`, leftColumnX, leftY, { width: contentWidth / 2 });

  leftY += 15;

  doc.text(`Date : ${data.date}`, leftColumnX, leftY, { width: contentWidth / 2 });

 leftY += 15;

  // Add duration if provided
if (data.duration && data.duration !== '' && data.duration !== null && data.duration !== undefined) {
    doc.text(`Durée estimée à : ${data.duration}`, leftColumnX, leftY, {
      width: contentWidth / 2,
    });
    leftY += 15;
  }

  // Add start date if provided and not empty
  if (data.startDate && data.startDate !== '' && data.startDate !== null && data.startDate !== undefined) {
    const formattedStartDate = formatStartDate(data.startDate);
    doc.text(`Démarrage : ${formattedStartDate}`, leftColumnX, leftY, {
      width: contentWidth / 2,
    });
    leftY += 15;
  }

  yPosition = Math.max(yPosition + 15, leftY);



  // Right side - Logo
  const logoY = part1StartY;
  const logoHeight = 113;
  const logoWidth = contentWidth / 2 - 40;

  if (data.logoBuffer) {
    try {
      // Display the actual logo image
      doc.image(data.logoBuffer, rightColumnX - 55, logoY, {
        fit: [logoWidth, logoHeight],
        align: "center",
        valign: "center",
      });
    } catch (logoError) {
      console.warn("Failed to embed logo in PDF:", logoError.message);
    }
  }
  // Move 8cm below Part 1 start
  yPosition = part1StartY + 126;

  // ===== PART 2: COMPANY AND CLIENT INFO =====
  const part2StartY = yPosition;

  // Calculate heights for both boxes
  const companyInfoHeight = 84; // 5 lines * 14 + padding
  const clientInfoHeight = 84; // Same height for consistency

  // Draw gray background for company info (left side)
  doc
    .fillColor("#efefef")
    .rect(leftColumnX - 5, part2StartY - 5, contentWidth / 2 - 10, companyInfoHeight)
    .fill();

  // Draw gray background for client info (right side)
  doc
    .fillColor("#efefef")
    .rect(rightColumnX - 5, part2StartY - 5, contentWidth / 2 - 10, clientInfoHeight)
    .fill();

  // Left side - Company info
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#000000")
    .text(capitalizeFirst(data.companyName), leftColumnX, yPosition, {
      width: contentWidth / 2,
    });

  yPosition += 14;

  doc.text(`${data.companyAddress} ${data.companyCity} ${data.companyPostalCode}`, leftColumnX, yPosition, {
    width: contentWidth / 2,
  });

  yPosition += 14;

  doc.text(`SIRET : ${data.companySiret}`, leftColumnX, yPosition, {
    width: contentWidth / 2,
  });

  yPosition += 14;

  doc.text(`Tél : ${data.companyTel}`, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 14;

  doc.text(`Email : ${data.companyEmail}`, leftColumnX, yPosition, {
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
    .text(`${data.clientCivility} ${capitalizeFirst(data.clientLastName)}`);

  clientY += 14;

  doc.text(`${data.clientCity} ${data.clientAddress}`, rightColumnX, clientY, {
    width: contentWidth / 2,
  });

  clientY += 15;

  clientY += 10;

  doc.text(`N° client : ${data.clientNumber}`, rightColumnX, clientY, {
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
  const colWidths = [35, 220, 50, 85, 50, 95];
  const colPositions = [];

  let xPos = margin;
  for (let i = 0; i < colWidths.length; i++) {
    colPositions.push(xPos);
    xPos += colWidths[i];
  }

  // Table header
  doc.fillColor(data.colorTemplate).rect(margin, tableTop, contentWidth, 20).fill();

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

 //   if (item.designation && item.designation.length > 0) {
   //   const charsPerLine = 45;
  //    const estimatedLines = Math.ceil(item.designation.length / charsPerLine);
    //  const newlineCount = (item.designation.match(/\n/g) || []).length;
   //   const totalLines = Math.max(estimatedLines, newlineCount + 1);

    //  if (totalLines > 1) {
     //   rowHeight = 20 + totalLines * 14;
    //  }
   // }
   

    if (item.designation && item.designation.length > 0) {
      if (item.level === 1) {
        doc.font("Helvetica-Bold").fontSize(12);
      } else if (item.level === 2) {
        doc.font("Helvetica-Bold").fontSize(11);
      } else {
        doc.font("Helvetica").fontSize(11);
      }

      // Measure actual text height using PDFKit's heightOfString
      const textHeight = doc.heightOfString(item.designation, {
        width: colWidths[1] - 4,
        lineGap: 3,
        align: "left",
      });

      // Calculate row height based on actual text height plus padding
      rowHeight = Math.max(25, textHeight + 14);
    }


    if (yPosition + rowHeight > doc.page.height - 100) {
      doc.addPage();
      yPosition = 30;
    }


    if (item.level === 1) {
      // Draw background with 40% opacity of colorTemplate
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

  // ===== ADDITIONAL FEES TABLE =====
  const feesTableWidth = 310;
  const feesStartX = pageWidth - margin - feesTableWidth - 90;
  const feesLabelWidth = 150;
  const feesValueWidth = 50;
  const feesTvaWidth = 50;
  const feesRowHeight = 20;
  const feesOffset = 60; // Offset for value and TVA columns

  // Build fees rows
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

  // Draw fees table if there are any fees
  if (feesRows.length > 0) {
    feesRows.forEach((row, index) => {
      const rowY = yPosition + index * feesRowHeight;

      // Draw text
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

  // ===== TOTALS SECTION =====
  const totalsTableWidth = 160;
  const totalsStartX = pageWidth - margin - totalsTableWidth;
  const totalsStartXLine = pageWidth - margin - totalsTableWidth/2;
  const totalsLabelWidth = 120;
  const totalsValueWidth = 100;
  const totalsRowHeight = 20;

  // Build totals rows
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


  // ===== PAYMENT CONDITIONS (Left of totals) =====
  const paymentConditionsX = margin;
  const paymentConditionsWidth = contentWidth - totalsTableWidth - 40;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000000")
    .text("Conditions de paiement", paymentConditionsX, yPosition, {
      width: paymentConditionsWidth,
      align: "left",
    });

  const paymentConditionsY = yPosition + 15;

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#000000")
    .text(
      "Les travaux se rapportent à des locaux d'habitation achevés depuis plus de 2 ans et ne consistent pas en des travaux exclus du taux réduit",
      paymentConditionsX,
      paymentConditionsY,
      {
        width: paymentConditionsWidth,
        align: "left",
        lineGap: 3,
      }
    );

  const paymentMethodsY = paymentConditionsY + 35;

  doc.text(
    "Méthodes de paiement acceptées : Espèces, Virement bancaire.",
    paymentConditionsX,
    paymentMethodsY,
    {
      width: paymentConditionsWidth,
      align: "left",
      lineGap: 3,
    }
  );

  // Draw totals table
  totalsRows.forEach((row, index) => {
    const isLastRow = index === totalsRows.length - 1;
    const rowY = yPosition + index * totalsRowHeight;

    // Draw top border for first row
    if (index === 0) {
      doc
        .strokeColor("#E0E0E0")
        .moveTo(totalsStartXLine, rowY)
        .lineTo(totalsStartXLine + totalsTableWidth / 2, rowY)
        .stroke();
    }

    // Draw bottom border for each row
    doc
      .moveTo(totalsStartXLine, rowY + totalsRowHeight)
      .lineTo(totalsStartXLine + totalsTableWidth / 2, rowY + totalsRowHeight)
      .stroke();

    // Draw right border
    doc
      .moveTo(totalsStartXLine + totalsTableWidth / 2, rowY)
      .lineTo(totalsStartXLine + totalsTableWidth / 2, rowY + totalsRowHeight)
      .stroke();

    // Draw text
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

  // ===== FOOTER =====
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

  // Add Date and Signature line
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#000000")
    .text("Date :                      Signature :", margin, yPosition, {
      width: contentWidth,
      align: "left",
    });
}

// Helper functions
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "";
  const numAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return numAmount.toFixed(2).replace(".", ",") + " €";
}

module.exports = exports;

/**
 * Helper function to fetch image from URL
 * @param {string} url - Image URL
 * @returns {Promise<Buffer>} - Image buffer
 */

 function formatStartDate(microseconds) {
  if (!microseconds) return "";
  // Convert microseconds to milliseconds
  const timestamp = typeof microseconds === "string" ? parseInt(microseconds) : microseconds;
  const milliseconds = Math.floor(timestamp / 1000);
  const date = new Date(milliseconds);
  return date.toLocaleDateString("fr-FR");
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

/**
 * Calculate totals from items
 * @param {Array} items - Array of items
 * @param {Number} discountPercent - Discount percentage (0-100)
 * @param {Number} discountAmount - Discount amount in euros
 * @param {Number} travelFees - Travel fees in euros
 * @param {Number} deliveryFees - Delivery fees in euros
 * @returns {Object} - Totals object
 */
function calculateTotals(items, discountPercent = 0, discountAmount = 0, travelFees = 0, deliveryFees = 0) {
  let totalHT = 0;
  let tva10Total = 0;
  let tva20Total = 0;

  items.forEach((item) => {
    if (item.totalHT && item.no != '') {
      totalHT += item.totalHT;

      if (item.tva === "10%") {
        tva10Total += item.totalHT * 0.1;
      } else if (item.tva === "20%") {
        tva20Total += item.totalHT * 0.2;
      }
    }
  });


  // Add additional fees to the total
  const travelFeesHT = travelFees || 0;
  const deliveryFeesHT = deliveryFees || 0;

  // Add fees to total HT
  totalHT += travelFeesHT + deliveryFeesHT;

  // Add TVA for fees (10% for both travel fees and delivery fees)
  if (travelFeesHT > 0) {
    tva10Total += travelFeesHT * 0.1;
  }
  if (deliveryFeesHT > 0) {
    tva10Total += deliveryFeesHT * 0.1;
  }

  // Calculate discount - applied to subtotal including fees
  let discount = 0;
  if (discountPercent > 0) {
    // If percentage is provided, calculate discount as percentage of totalHT
    discount = totalHT * (discountPercent / 100);
  } else if (discountAmount > 0) {
    // If amount is provided, use it directly
    discount = discountAmount;
  }

  // Calculate total after discount
  const totalAfterDiscount = totalHT - discount;

  // Recalculate TVA based on discounted total (proportionally)
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



// Helper functions
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "";
  const numAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return numAmount.toFixed(2).replace(".", ",") + " €";
}