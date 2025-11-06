const PDFDocument = require('pdfkit');
const fs = require('fs');

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
  estimate.forEach(item => {
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
      showTotal: true
    });

    // Group by L2 within this L1
    const l2Groups = {};
    l1Items.forEach(item => {
      if (!l2Groups[item.L2]) {
        l2Groups[item.L2] = [];
      }
      l2Groups[item.L2].push(item);
    });

    // Process each L2 group
    Object.keys(l2Groups).forEach(l2Key => {
      const l2Items = l2Groups[l2Key];

      // Add L2 header
      items.push({
        no: '',
        designation: l2Key,
        quantity: null,
        unitPrice: null,
        tva: null,
        totalHT: null,
        isHeader: true,
        level: 2
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
          tvaText = '20%'; // Default, can be customized based on workMatch
        }

        items.push({
          no: `${l1Index + 1}.${idx + 1}`,
          designation: designation,
          quantity: workItem.dimensionsValue || null,
          quantityUnit: workItem.dimensionsUnit || '',
          unitPrice: workItem.priceUnit || null,
          tva: tvaText,
          totalHT: workItem.priceTotal || null,
          isHeader: false,
          level: 3
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

  items.forEach(item => {
    if (item.totalHT) {
      totalHT += item.totalHT;

      if (item.tva === '10%') {
        tva10Total += item.totalHT * 0.10;
      } else if (item.tva === '20%') {
        tva20Total += item.totalHT * 0.20;
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
    totalTTC: totalTTC
  };
}

/**
 * Generate PDF from estimate data (Scenarios 2 & 3)
 * @param {Object} estimateData - Input data with estimate array
 * @param {String} outputPath - Output PDF path
 */
function generateDevisFromEstimate(estimateData, outputPath = 'devis.pdf') {
  // Transform estimate to items
  const items = transformEstimateToItems(estimateData.estimate);

  // Calculate totals
  const totals = calculateTotals(items);

  // Build devis data structure
  const devisData = {
    devisNumber: estimateData.devisNumber || 'D202500001',
    date: estimateData.date || new Date().toLocaleDateString('fr-FR'),
    color2: estimateData.color2 || '#4A90E2',

    company: estimateData.company || {
      name: 'MA SOCIÉTÉ',
      address: '123 Rue de la République',
      postalCode: '75001',
      city: 'Paris',
      siret: '123 456 789 00010',
      tel: '01 23 45 67 89',
      email: 'contact@masociete.fr',
      logoPath: null
    },

    client: estimateData.client || {
      civility: 'Mr.',
      lastName: 'DUPONT',
      address: '45 Avenue des Champs',
      postalCode: '75008',
      city: 'Paris',
      clientNumber: 'D23'
    },

    title: estimateData.title || 'DEVIS TRAVAUX',
    items: items,
    totals: totals,
    footerText: estimateData.footerText || 'Si ce devis vous convient, veuillez nous le retourner signé précédé de la mention :\n\n"BON POUR ACCORD ET EXÉCUTION DU DEVIS"\n\nDate :                     Signature :'
  };

  // Generate PDF
  generateDevis(devisData, outputPath);
}

function generateDevis(data, outputPath = 'devis.pdf') {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 30, // Reduced from 50pt to 30pt for more content space
    bufferPages: true
  });

  // Pipe to file
  doc.pipe(fs.createWriteStream(outputPath));

  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = 30; // Match top margin

  // ===== PART 1: HEADER ROW (DEVIS + LOGO) =====
  const leftColumnX = margin;
  const rightColumnX = margin + contentWidth / 2 + 20;
  const part1StartY = yPosition;

  // Left side - DEVIS title, N°, Date
  doc.font('Helvetica-Bold')
     .fontSize(24)
     .fillColor(data.color2)
     .text('DEVIS', leftColumnX, yPosition, { align: 'left' });

  let leftY = yPosition + 35;

  doc.font('Helvetica')
     .fontSize(11)
     .fillColor('#000000')
     .text(`N° ${data.devisNumber}`, leftColumnX, leftY, { width: contentWidth / 2 });

  leftY += 15;

  doc.text(`Date : ${data.date}`, leftColumnX, leftY, { width: contentWidth / 2 });

  // Right side - Logo space (4cm height)
  const logoY = part1StartY;
  const logoHeight = 113; // 4cm ≈ 113 points
  const logoWidth = contentWidth / 2 - 40;

  if (data.company.logoPath && fs.existsSync(data.company.logoPath)) {
    doc.image(data.company.logoPath, rightColumnX, logoY, {
      fit: [logoWidth, logoHeight],
      align: 'center',
      valign: 'center'
    });
  } else {
    // Draw placeholder box for logo
    doc.rect(rightColumnX + 20, logoY, logoWidth, logoHeight)
       .stroke();
    doc.fontSize(9)
       .fillColor('#999999')
       .text('LOGO', rightColumnX, logoY + logoHeight / 2 - 5, {
         width: logoWidth + 40,
         align: 'center'
       });
  }

  // Move 8cm below Part 1 start
  yPosition = part1StartY + 226; // 8cm ≈ 226 points

  // ===== PART 2: COMPANY AND CLIENT INFO (8cm below Part 1) =====
  const part2StartY = yPosition;

  // Left side - Company info
  doc.font('Helvetica-Bold')
     .fontSize(11)
     .fillColor('#000000')
     .text(capitalizeFirst(data.company.name), leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 15;

  doc.font('Helvetica')
     .fontSize(11)
     .text(data.company.address, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 12;

  doc.text(`${data.company.postalCode} ${data.company.city}`, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 12;

  doc.text(`SIRET : ${data.company.siret}`, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 12;

  doc.text(`Tél : ${data.company.tel}`, leftColumnX, yPosition, { width: contentWidth / 2 });

  yPosition += 12;

  doc.text(`Email : ${data.company.email}`, leftColumnX, yPosition, { width: contentWidth / 2 });

  // Right side - Client info
  let clientY = part2StartY;

  doc.fillColor('#000000')
     .font('Helvetica')
     .fontSize(11)
     .text('Client : ', rightColumnX, clientY, { continued: true })
     .font('Helvetica-Bold')
     .text(`${data.client.civility} ${capitalizeFirst(data.client.lastName)}`);

  clientY += 15;

  doc.font('Helvetica')
     .text(data.client.address, rightColumnX, clientY, { width: contentWidth / 2 });

  clientY += 12;

  doc.text(`${data.client.postalCode} ${data.client.city}`, rightColumnX, clientY, { width: contentWidth / 2 });

  clientY += 15;

  // Line
  // doc.strokeColor('#000000')
  //    .lineWidth(0.5)
  //    .moveTo(rightColumnX, clientY)
  //    .lineTo(pageWidth - margin, clientY)
  //    .stroke();

  clientY += 10;

  doc.text(`N° client : ${data.client.clientNumber}`, rightColumnX, clientY, { width: contentWidth / 2 });

  // Use the maximum Y position from both columns
  yPosition = Math.max(yPosition + 15, clientY + 15);

  // Line separator (2cm)
  // doc.strokeColor('#000000')
  //    .lineWidth(0.5)
  //    .moveTo(margin, yPosition)
  //    .lineTo(pageWidth - margin, yPosition)
  //    .stroke();

  yPosition += 56; // 2cm ≈ 56 points

  // ===== TITLE =====
  if (data.title) {
    doc.font('Helvetica-Bold')
       .fontSize(13)
       .fillColor('#000000')
       .text(capitalizeFirst(data.title), margin, yPosition, { width: contentWidth, align: 'left' });

    yPosition += 30;
  }

  // ===== TABLE =====
  const tableTop = yPosition;
  const tableHeaders = ['N°', 'Désignation', 'Qté', 'Prix U.', 'TVA', 'TOTAL HT'];

  // Calculate column widths to fit page width
  // Total contentWidth = 535 points (A4 595pt - 30pt margins × 2)
  const colWidths = [35, 250, 50, 70, 50, 80]; // Total = 535
  const colPositions = [];

  let xPos = margin;
  for (let i = 0; i < colWidths.length; i++) {
    colPositions.push(xPos);
    xPos += colWidths[i];
  }

  // Table header
  doc.fillColor(data.color2)
     .rect(margin, tableTop, contentWidth, 20)
     .fill();

  doc.font('Helvetica-Bold')
     .fontSize(11)
     .fillColor('#FFFFFF');

  for (let i = 0; i < tableHeaders.length; i++) {
    doc.text(tableHeaders[i], colPositions[i] + 2, tableTop + 5, {
      width: colWidths[i] - 4,
      align: i === 0 ? 'left' : (i > 1 ? 'center' : 'left')
    });
  }

  yPosition = tableTop + 20;

  // Table rows
  doc.fillColor('#000000');

  for (const item of data.items) {
    // Calculate row height based on text content
    let rowHeight = 25;

    // For multi-line designations, calculate needed height
    if (item.designation && item.designation.length > 80) {
      const lines = Math.ceil(item.designation.length / 80);
      rowHeight = Math.max(25, lines * 12 + 10);
    }

    // Check if we need a new page
    if (yPosition + rowHeight > doc.page.height - 100) {
      doc.addPage();
      yPosition = 30; // Match top margin
    }

    if (item.level === 1) {
      // Level 1 header - background color at 40%
      const color2Alpha = hexToRgb(data.color2);
      // doc.fillColor(color2Alpha.r, color2Alpha.g, color2Alpha.b, 0.4)
      //    .rect(margin, yPosition, contentWidth, rowHeight)
      //    .fill();

      doc.fillColor('#000000')
         .font('Helvetica-Bold')
         .fontSize(12);

      // Show number
      if (item.no) {
        doc.text(item.no, colPositions[0] + 2, yPosition + 7, { width: colWidths[0] - 4 });
      }

      // Show designation
      doc.text(item.designation, colPositions[1] + 2, yPosition + 7, { width: colWidths[1] - 4 });

      // Show total on the right if available
      if (item.showTotal && item.totalHT) {
        doc.text(formatCurrency(item.totalHT), colPositions[5] + 2, yPosition + 7, {
          width: colWidths[5] - 4,
          align: 'right'
        });
      }
    } else if (item.level === 2) {
      // Level 2 header - bold
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text(item.designation, colPositions[1] + 2, yPosition + 7, {
           width: colWidths[1] - 4,
           lineGap: 2
         });
    } else {
      // Regular item row (Level 3)
      doc.font('Helvetica')
         .fontSize(11);

      // Number
      if (item.no) {
        doc.text(item.no, colPositions[0] + 2, yPosition + 7, { width: colWidths[0] - 4 });
      }

      // Designation (can be multi-line)
      doc.text(item.designation, colPositions[1] + 2, yPosition + 7, {
        width: colWidths[1] - 4,
        lineGap: 2
      });

      // Quantity with unit
      if (item.quantity !== null && item.quantity !== undefined) {
        const qtyText = item.quantityUnit ?
          `${item.quantity} ${item.quantityUnit}` :
          item.quantity.toString();
        doc.text(qtyText, colPositions[2] + 2, yPosition + 7, {
          width: colWidths[2] - 4,
          align: 'center'
        });
      }

      // Unit price
      if (item.unitPrice !== null && item.unitPrice !== undefined && item.unitPrice > 0) {
        doc.text(formatCurrency(item.unitPrice), colPositions[3] + 2, yPosition + 7, {
          width: colWidths[3] - 4,
          align: 'right'
        });
      }

      // TVA
      if (item.tva) {
        doc.text(item.tva, colPositions[4] + 2, yPosition + 7, {
          width: colWidths[4] - 4,
          align: 'center'
        });
      }

      // Total HT
      if (item.totalHT !== null && item.totalHT !== undefined && item.totalHT > 0) {
        doc.text(formatCurrency(item.totalHT), colPositions[5] + 2, yPosition + 7, {
          width: colWidths[5] - 4,
          align: 'right'
        });
      }
    }

    // Row border
    doc.strokeColor('#CCCCCC')
       .lineWidth(0.5)
       .moveTo(margin, yPosition + rowHeight)
       .lineTo(pageWidth - margin, yPosition + rowHeight)
       .stroke();

    yPosition += rowHeight;
  }

  yPosition += 20;

  // Check if we need a new page for totals
  if (yPosition > doc.page.height - 250) {
    doc.addPage();
    yPosition = 30; // Match top margin
  }

  // ===== TOTALS SECTION =====
  const totalsStartX = pageWidth - margin - 250;

  doc.font('Helvetica-Bold')
     .fontSize(11)
     .fillColor('#000000');

  // Sous-Total HT
  if (data.totals.sousTotalHT > 0) {
    doc.text('Sous-Total HT', totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.sousTotalHT), totalsStartX + 150, yPosition, {
      width: 100,
      align: 'right'
    });
    yPosition += 15;
  }

  // Remise (if exists)
  if (data.totals.remise > 0) {
    doc.text('Remise', totalsStartX, yPosition);
    doc.text(formatCurrency(-data.totals.remise), totalsStartX + 150, yPosition, {
      width: 100,
      align: 'right'
    });
    yPosition += 15;

    doc.text('Total après remise', totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.totalApresRemise), totalsStartX + 150, yPosition, {
      width: 100,
      align: 'right'
    });
    yPosition += 15;
  }

  doc.font('Helvetica');

  // TVA à 10%
  if (data.totals.tva10 > 0) {
    doc.text('TVA à 10%', totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.tva10), totalsStartX + 150, yPosition, {
      width: 100,
      align: 'right'
    });
    yPosition += 15;
  }

  // TVA à 20%
  if (data.totals.tva20 > 0) {
    doc.text('TVA à 20%', totalsStartX, yPosition);
    doc.text(formatCurrency(data.totals.tva20), totalsStartX + 150, yPosition, {
      width: 100,
      align: 'right'
    });
    yPosition += 15;
  }

  yPosition += 5;

  doc.font('Helvetica-Bold')
     .fontSize(13);

  // Total TTC
  doc.text('Total TTC', totalsStartX, yPosition);
  doc.text(formatCurrency(data.totals.totalTTC), totalsStartX + 150, yPosition, {
    width: 100,
    align: 'right'
  });

  yPosition += 40;

  // ===== FOOTER SECTION =====
  if (data.footerText) {
    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#000000')
       .text(data.footerText, margin, yPosition, {
         width: contentWidth,
         align: 'left',
         lineGap: 5
       });
  }

  // Finalize PDF
  doc.end();

  console.log(`PDF generated successfully: ${outputPath}`);
}

// Helper functions
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '';
  return amount.toFixed(2).replace('.', ',') + ' €';
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Export functions
module.exports = {
  generateDevis,
  generateDevisFromEstimate,
  transformEstimateToItems,
  calculateTotals
};
