const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Generate a government-style FIR PDF
 * @param {Object} fir - Populated FIR document
 * @returns {Promise<string>} Path to generated PDF
 */
const generateFIRPdf = (fir) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `FIR-${fir.firNumber.replace(/\//g, '-')}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── Header ──
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('FIRST INFORMATION REPORT', { align: 'center' });
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('(Under Section 154 Cr.P.C.)', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .lineWidth(2)
        .stroke();
      doc.moveDown(0.5);

      // ── FIR Details ──
      const leftCol = 50;
      const rightCol = 300;

      doc.fontSize(11).font('Helvetica-Bold');
      doc.text(`FIR Number: `, leftCol, doc.y, { continued: true }).font('Helvetica').text(fir.firNumber);
      doc.font('Helvetica-Bold').text(`FIR Date: `, leftCol, doc.y, { continued: true })
        .font('Helvetica').text(new Date(fir.firDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'long', year: 'numeric'
        }));

      doc.moveDown(0.3);

      // Police Station Info
      if (fir.policeStation) {
        doc.font('Helvetica-Bold').text(`Police Station: `, leftCol, doc.y, { continued: true })
          .font('Helvetica').text(`${fir.policeStation.name} (${fir.policeStation.stationCode})`);
        doc.font('Helvetica-Bold').text(`District: `, leftCol, doc.y, { continued: true })
          .font('Helvetica').text(fir.policeStation.district);
        doc.font('Helvetica-Bold').text(`State: `, leftCol, doc.y, { continued: true })
          .font('Helvetica').text(fir.policeStation.state);
      }

      doc.moveDown(0.3);

      // Officer Info
      if (fir.filedByOfficer) {
        doc.font('Helvetica-Bold').text(`Filed By: `, leftCol, doc.y, { continued: true })
          .font('Helvetica').text(`${fir.filedByOfficer.name} (${fir.filedByOfficer.rank})`);
        doc.font('Helvetica-Bold').text(`Badge Number: `, leftCol, doc.y, { continued: true })
          .font('Helvetica').text(fir.filedByOfficer.badgeNumber);
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.5);

      // ── Linked Complaint ──
      if (fir.linkedComplaint) {
        doc.fontSize(13).font('Helvetica-Bold').text('COMPLAINT DETAILS');
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text(`Complaint ID: `, { continued: true })
          .font('Helvetica').text(fir.linkedComplaint.complaintId || 'N/A');
        doc.font('Helvetica-Bold').text(`Title: `, { continued: true })
          .font('Helvetica').text(fir.linkedComplaint.title || 'N/A');
        doc.font('Helvetica-Bold').text(`Category: `, { continued: true })
          .font('Helvetica').text(fir.linkedComplaint.category || 'N/A');
        doc.font('Helvetica-Bold').text(`Description: `);
        doc.font('Helvetica').text(fir.linkedComplaint.description || 'N/A', { indent: 20 });
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.5);

      // ── IPC Sections ──
      doc.fontSize(13).font('Helvetica-Bold').text('APPLICABLE IPC SECTIONS');
      doc.moveDown(0.3);
      if (fir.ipcSections && fir.ipcSections.length > 0) {
        doc.fontSize(11).font('Helvetica').text(fir.ipcSections.join(', '));
      } else {
        doc.fontSize(11).font('Helvetica').text('None specified');
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.5);

      // ── Accused Details ──
      doc.fontSize(13).font('Helvetica-Bold').text('ACCUSED DETAILS');
      doc.moveDown(0.3);
      if (fir.accusedDetails && fir.accusedDetails.length > 0) {
        fir.accusedDetails.forEach((accused, index) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${accused.name || 'Unknown'}`);
          if (accused.age) {
            doc.font('Helvetica').text(`   Age: ${accused.age}`);
          }
          if (accused.address) {
            doc.font('Helvetica').text(`   Address: ${accused.address}`);
          }
          if (accused.description) {
            doc.font('Helvetica').text(`   Description: ${accused.description}`);
          }
          doc.moveDown(0.2);
        });
      } else {
        doc.fontSize(11).font('Helvetica').text('No accused details provided');
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.5);

      // ── Witnesses ──
      doc.fontSize(13).font('Helvetica-Bold').text('WITNESSES');
      doc.moveDown(0.3);
      if (fir.witnesses && fir.witnesses.length > 0) {
        fir.witnesses.forEach((witness, index) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${witness.name || 'Anonymous'}`);
          if (witness.contact) {
            doc.font('Helvetica').text(`   Contact: ${witness.contact}`);
          }
          if (witness.statement) {
            doc.font('Helvetica').text(`   Statement: ${witness.statement}`);
          }
          doc.moveDown(0.2);
        });
      } else {
        doc.fontSize(11).font('Helvetica').text('No witnesses recorded');
      }

      // Check if we need a new page for narrative
      if (doc.y > 600) {
        doc.addPage();
      } else {
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
        doc.moveDown(0.5);
      }

      // ── Narrative ──
      doc.fontSize(13).font('Helvetica-Bold').text('OFFICER NARRATIVE');
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica').text(fir.narrative || 'No narrative provided', {
        align: 'justify',
        lineGap: 3,
      });

      doc.moveDown(1);

      // ── Status ──
      doc.fontSize(11).font('Helvetica-Bold').text(`Status: `, { continued: true })
        .font('Helvetica').text(fir.status);

      // ── Footer ──
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke();
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').text(
        'This is a computer-generated document. Generated on ' +
          new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        { align: 'center' }
      );

      // Signature block
      doc.moveDown(2);
      doc.fontSize(11).font('Helvetica').text('_________________________', 350, doc.y);
      doc.text('Signature of the Officer', 370, doc.y);

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateFIRPdf };
