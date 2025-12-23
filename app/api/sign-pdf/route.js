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
    const signedPdfPath = path.join(process.cwd(), 'public', 'signed', signedFileName);

    fs.writeFileSync(signedPdfPath, signedPdfBuffer);

    await connectDB();

    const signatureRecord = new Signature({
      pdfId,
      originalHash,
      signedHash,
      signedPdfPath: `/signed/${signedFileName}`,
      coordinates: normalizedCoords,
    });

    await signatureRecord.save();

    return NextResponse.json({
      success: true,
      signedPdfUrl: `/signed/${signedFileName}`,
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
