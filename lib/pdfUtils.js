import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';

export function calculateHash(pdfBuffer) {
  return crypto.createHash('sha256').update(pdfBuffer).digest('hex');
}

export async function embedSignature(pdfBuffer, signatureBase64, coords, pageNumber = 1) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const targetPage = pages[pageNumber - 1];

  const imageBytes = Buffer.from(signatureBase64.split(',')[1] || signatureBase64, 'base64');

  let image;
  try {
    image = await pdfDoc.embedPng(imageBytes);
  } catch {
    image = await pdfDoc.embedJpg(imageBytes);
  }

  const imageDims = image.scale(1);
  const imageAspectRatio = imageDims.width / imageDims.height;
  const boxAspectRatio = coords.width / coords.height;

  let drawWidth, drawHeight, drawX, drawY;

  if (imageAspectRatio > boxAspectRatio) {
    drawWidth = coords.width;
    drawHeight = coords.width / imageAspectRatio;
    drawX = coords.x;
    drawY = coords.y + (coords.height - drawHeight) / 2;
  } else {
    drawHeight = coords.height;
    drawWidth = coords.height * imageAspectRatio;
    drawX = coords.x + (coords.width - drawWidth) / 2;
    drawY = coords.y;
  }

  targetPage.drawImage(image, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  });

  return await pdfDoc.save();
}
