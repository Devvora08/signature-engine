import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const tmpDir = '/tmp';
    const filePath = path.join(tmpDir, fileName);

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    const base64Data = buffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      fileName,
      pdfUrl: dataUrl,
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
