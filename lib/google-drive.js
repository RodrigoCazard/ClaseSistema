// lib/google-drive.js
const { google } = require("googleapis")
const fs = require("fs")
const path = require("path")

// Cargar credenciales desde el archivo JSON
const credentials = require("./google-drive-credentials.json")

// Configurar OAuth2
const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
)

// Configurar el cliente de Google Drive
const drive = google.drive({ version: "v3", auth: oauth2Client })

// Función para subir un archivo a Google Drive
const uploadFile = async (filePath, fileName) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: "application/octet-stream",
      },
      media: {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(filePath),
      },
    })
    return response.data
  } catch (error) {
    console.error("Error al subir el archivo:", error)
    throw error
  }
}

module.exports = { oauth2Client, uploadFile }