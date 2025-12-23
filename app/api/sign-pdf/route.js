import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { connectDB } from '@/lib/db';
import Signature from '@/models/Signature';
import { denormalizeCoords } from '@/lib/coordinateUtils';
import { calculateHash, embedSignature } from '@/lib/pdfUtils';

export async function POST(request) {
  try {
    const { pdfPath: pdfUrlPath, signatureBase64, normalizedCoords, pageNumber } = await request.json();

    const pdfPath = path.join(process.cwd(), 'public', pdfUrlPath);
    const originalPdfBuffer = fs.readFileSync(pdfPath);

    const originalHash = calculateHash(originalPdfBuffer);

    const pdfCoords = denormalizeCoords(normalizedCoords);

    const signedPdfBuffer = await embedSignature(
      originalPdfBuffer,
      signatureBase64,
      pdfCoords,
      pageNumber
    );

    const signedHash = calculateHash(Buffer.from(signedPdfBuffer));

    const timestamp = Date.now();
    const pdfId = path.basename(pdfUrlPath, '.pdf');
    const signedFileName = `signed-${pdfId}-${timestamp}.pdf`;

    await connectDB();

    const signatureRecord = new Signature({
      pdfId,
      originalHash,
      signedHash,
      signedPdfPath: signedFileName,
      coordinates: normalizedCoords,
    });

    await signatureRecord.save();

    const signedPdfBase64 = Buffer.from(signedPdfBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      signedPdfBase64,
      signedFileName,
      originalHash,
      signedHash,
    });
  } catch (error) {
    console.error('Error signing PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
