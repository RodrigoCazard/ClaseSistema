import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import fs from "fs";

// Configura el cliente de S3 para Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    // Lee el cuerpo de la solicitud como FormData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó un archivo" },
        { status: 400 }
      );
    }

    // Convierte el archivo a un buffer
    const fileBuffer = await file.arrayBuffer();

    // Sube el archivo a R2
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: file.name, // Usa el nombre original del archivo
      Body: Buffer.from(fileBuffer),
      ContentType: file.type, // Usa el tipo de archivo
    });

    await s3Client.send(command);

    // Devuelve la URL del archivo subido (usando un Worker para acceso público)
    const fileUrl = `https://r2-public-access.tu-subdominio.workers.dev/${file.name}`;
    return NextResponse.json({ fileUrl }, { status: 200 });
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}