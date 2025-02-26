import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import formidable from "formidable"
import fs from "fs"

// Configura el cliente de S3 para Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
})

export const config = {
  api: {
    bodyParser: false, // Desactiva el bodyParser para manejar FormData manualmente
  },
}

export default async function handler(req, res) {

    console.log("Método recibido:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    // Procesa el cuerpo de la solicitud como FormData
    const form = formidable({ multiples: false })
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })
  
    const file = files.file
  
    if (!file) {
      return res.status(400).json({ error: "No se proporcionó un archivo" })
    }
  
    // Lee el archivo como un buffer
    const fileBuffer = fs.readFileSync(file.filepath)
  
    // Sube el archivo a R2
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: file.originalFilename, // Usa el nombre original del archivo
      Body: fileBuffer,
      ContentType: file.mimetype, // Usa el tipo de archivo
    })
  
    await s3Client.send(command)
  
    // Devuelve la URL del archivo subido (usando un Worker para acceso público)
    const fileUrl = `https://r2-public-access.tu-subdominio.workers.dev/${file.originalFilename}`
    res.status(200).json({ fileUrl })
  } catch (error) {
    console.error("Error al subir el archivo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}