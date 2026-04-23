const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const User = require('../models/User');
const BloodUnit = require('../models/BloodUnit');

/**
 * Certificate Service for LifeChain
 * Generates PDF donation certificates with QR codes
 */

/**
 * Generate QR code as data URL
 * @param {Object} data - Data to encode in QR code
 * @returns {Promise<string>} QR code data URL
 */
async function generateQRCode(data) {
  try {
    const qrDataString = JSON.stringify(data);
    const qrDataURL = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
      margin: 1
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate donation certificate PDF
 * @param {string} bloodUnitID - Blood unit ID
 * @param {string} donorID - Donor ID
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateCertificate(bloodUnitID, donorID) {
  try {
    // Query blood unit
    const bloodUnit = await BloodUnit.findOne({ bloodUnitID })
      .populate('donorID', 'name bloodGroup email')
      .populate('originalHospitalID', 'hospitalName city');
    
    if (!bloodUnit) {
      throw new Error('Blood unit not found');
    }
    
    // Verify donor owns the blood unit
    if (bloodUnit.donorID._id.toString() !== donorID) {
      throw new Error('You do not have permission to download this certificate');
    }
    
    const donor = bloodUnit.donorID;
    const hospital = bloodUnit.originalHospitalID;
    
    // Generate QR code with verification URL
    // When frontend is deployed, this will link to the verification page
    // For now, link directly to blockchain explorer
    const verificationURL = bloodUnit.donationTxHash 
      ? `https://amoy.polygonscan.com/tx/${bloodUnit.donationTxHash}`
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${bloodUnit.bloodUnitID}`;
    
    const qrCodeDataURL = await generateQRCode(verificationURL);
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Buffer to store PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    const pdfPromise = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
    
    // Header - LifeChain Logo and Title
    doc.fontSize(28)
       .fillColor('#dc2626')
       .text('LifeChain', { align: 'center' });
    
    doc.fontSize(20)
       .fillColor('#333')
       .text('Blood Donation Certificate', { align: 'center' });
    
    doc.moveDown(1);
    
    // Decorative line
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor('#dc2626')
       .lineWidth(2)
       .stroke();
    
    doc.moveDown(2);
    
    // Certificate body
    doc.fontSize(14)
       .fillColor('#333')
       .text('This is to certify that', { align: 'center' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(22)
       .fillColor('#dc2626')
       .font('Helvetica-Bold')
       .text(donor.name, { align: 'center' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(14)
       .fillColor('#333')
       .font('Helvetica')
       .text('has generously donated blood on', { align: 'center' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(16)
       .fillColor('#000')
       .font('Helvetica-Bold')
       .text(bloodUnit.collectionDate.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       }), { align: 'center' });
    
    doc.moveDown(2);
    
    // Donation details box
    const boxY = doc.y;
    doc.rect(100, boxY, 395, 120)
       .fillAndStroke('#f9f9f9', '#dc2626');
    
    doc.fillColor('#333')
       .fontSize(12)
       .font('Helvetica');
    
    const detailsY = boxY + 20;
    doc.text(`Blood Group: ${bloodUnit.bloodGroup}`, 120, detailsY);
    doc.text(`Blood Unit ID: ${bloodUnit.bloodUnitID}`, 120, detailsY + 20);
    doc.text(`Hospital: ${hospital.hospitalName}`, 120, detailsY + 40);
    doc.text(`Location: ${hospital.city}`, 120, detailsY + 60);
    doc.text(`Status: ${bloodUnit.status}`, 120, detailsY + 80);
    
    doc.moveDown(2);
    
    // Blockchain verification section
    doc.fontSize(12)
       .fillColor('#666')
       .text('Blockchain Verification:', { align: 'left' });
    
    doc.fontSize(10)
       .fillColor('#333');
    
    if (bloodUnit.donationTxHash) {
      doc.text(`Transaction Hash: ${bloodUnit.donationTxHash}`, { align: 'left' });
      doc.fillColor('#0066cc')
         .text('Verify on Polygon Amoy Explorer', {
           link: `https://amoy.polygonscan.com/tx/${bloodUnit.donationTxHash}`,
           underline: true,
           align: 'left'
         });
    } else {
      doc.text('Blockchain recording pending...', { align: 'left' });
    }
    
    doc.moveDown(3);
    
    // QR Code section - centered with plenty of space
    doc.fontSize(12)
       .fillColor('#666')
       .text('Scan QR Code to Verify on Blockchain:', { align: 'center' });
    
    doc.moveDown(1);
    
    // Convert QR code data URL to buffer and embed
    const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    const qrYPosition = doc.y;
    const qrXPosition = (doc.page.width - 150) / 2;
    
    doc.image(qrBuffer, qrXPosition, qrYPosition, {
      width: 150,
      height: 150
    });
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;
    
    console.log(`✅ Certificate generated for ${bloodUnitID}`);
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

module.exports = {
  generateCertificate,
  generateQRCode
};
