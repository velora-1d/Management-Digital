import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, R2_BUCKET, R2_PUBLIC_URL, R2_PREFIX } from "@/lib/s3";
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

    // 1. Coba upload ke Cloudflare R2 jika konfigurasi lengkap
    const hasR2 = Boolean(
      R2_BUCKET && 
      process.env.R2_ACCESS_KEY_ID && 
      process.env.R2_SECRET_ACCESS_KEY
    );

    if (hasR2) {
      try {
        const fileName = `${R2_PREFIX}${uuidv4()}.${cleanExtension}`;
        const command = new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        });

        await s3Client.send(command);

        const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
        const publicUrl = `${baseUrl}/${fileName}`;

        return NextResponse.json({
          success: true,
          url: publicUrl,
          key: fileName,
        }, { headers: corsHeaders });
      } catch (r2Error) {
        console.warn('Upload Cloudflare R2 gagal, beralih ke local storage fallback:', r2Error);
      }
    }

    // 2. Local Storage Fallback (Simpan ke public/uploads)
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
