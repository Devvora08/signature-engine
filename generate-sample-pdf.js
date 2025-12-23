const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function generateSamplePDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);

  const { width, height } = page.getSize();

  page.drawText('Sample Document - A4 Size', {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0, 0, 0),
  });

  page.drawText('This is a sample document for signature injection testing.', {
    x: 50,
    y: height - 100,
    size: 12,
    color: rgb(0, 0, 0),
  });

  page.drawText('Document ID: SAMPLE-001', {
    x: 50,
    y: height - 130,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Date: ' + new Date().toLocaleDateString(), {
    x: 50,
    y: height - 150,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Drag and drop signature fields on this document.', {
    x: 50,
    y: height - 200,
    size: 12,
    color: rgb(0, 0, 0),
  });

  page.drawText('The signature will be permanently embedded when you sign.', {
    x: 50,
    y: height - 220,
    size: 12,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const outputPath = path.join(__dirname, 'public', 'sample.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  console.log('Sample PDF generated at:', outputPath);
}

generateSamplePDF().catch(console.error);
