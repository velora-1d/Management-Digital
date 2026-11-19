import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file diunggah' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}. Gunakan JPEG, PNG, WebP, GIF, atau SVG.` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Batas ukuran 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10MB.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const cleanExtension = fileExtension.replace(/[^a-zA-Z0-9]/g, '');

    // Simpan ke local storage (public/uploads)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const localFileName = `${Date.now()}-${uuidv4().substring(0, 8)}.${cleanExtension}`;
    const localFilePath = path.join(uploadsDir, localFileName);

    await writeFile(localFilePath, buffer);

    const localPublicUrl = `/uploads/${localFileName}`;

    return NextResponse.json({
      success: true,
      url: localPublicUrl,
      key: localFileName,
    }, { headers: corsHeaders });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Upload error:', errMsg);
    return NextResponse.json(
      { error: `Gagal mengunggah file: ${errMsg}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
