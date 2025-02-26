"use client"

import { useEffect, useState } from "react"
import { FaTasks, FaCheckCircle, FaUpload, FaLink, FaSpinner } from "react-icons/fa"
import toast from "react-hot-toast"

export default function MisionesSemanalesPage() {
  const [misiones, setMisiones] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [link, setLink] = useState("")
  const [uploading, setUploading] = useState(false)

  // Misiones hardcodeadas (solo una misión)
  const misionesHardcodeadas = [
    {
      id: "1",
      nombre: "Misión 1: Subir un archivo o enviar un link",
      descripcion: "Sube un archivo o envía un link para completar la misión.",
      puntos: 100,
      completada: false,
    },
  ]

  useEffect(() => {
    // Usamos las misiones hardcodeadas
    setMisiones(misionesHardcodeadas)
    setLoading(false) // Marcamos como no cargando
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setLink("") // Limpia el link si se selecciona un archivo
    }
  }

  const handleLinkChange = (e) => {
    setLink(e.target.value)
    setSelectedFile(null) // Limpia el archivo si se escribe un link
  }

  const handleUploadFile = async (misionId) => {
    if (!selectedFile && !link) {
      toast.error("Por favor, selecciona un archivo o ingresa un link")
      return
    }
  
    setUploading(true)
    try {
      let entregaUrl = ""
  
      if (selectedFile) {
        // Subir archivo a Cloudflare R2
        const formData = new FormData()
        formData.append("file", selectedFile)
  
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al subir el archivo")
        }
  
        const data = await response.json()
        entregaUrl = data.fileUrl // Accede a la propiedad fileUrl del objeto devuelto
      } else if (link) {
        // Guardar el link directamente
        entregaUrl = link
      }
  
      // Actualizar la misión en el estado local
      setMisiones((prevMisiones) =>
        prevMisiones.map((mision) =>
          mision.id === misionId
            ? { ...mision, entregaUrl, completada: true }
            : mision
        )
      )
  
      toast.success("Misión completada con éxito")
    } catch (error) {
      console.error("Error al completar la misión:", error)
      toast.error(error.message || "Error al completar la misión")
    } finally {
      setUploading(false)
      setSelectedFile(null)
      setLink("")
    }
  }

  const handleViewEntrega = async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("No se pudo acceder al archivo")
      }

      // Si es un archivo, lo descargamos
      if (url.startsWith("http")) {
        window.open(url, "_blank")
      } else {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = "entrega"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error al ver la entrega:", error)
      toast.error("No se pudo acceder a la entrega. Verifica los permisos.")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando misiones...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-2xl backdrop-filter backdrop-blur-lg relative">
        <h1 className="text-3xl font-bold mb-6 text-center">Misiones Semanales</h1>
        <div className="grid grid-cols-1 gap-6">
          {misiones.map((mision) => (
            <div
              key={mision.id}
              className="bg-gray-700 bg-opacity-80 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
            >
              <FaTasks className="text-4xl mb-4 text-blue-500" />
              <h2 className="text-xl font-bold mb-2 text-center">{mision.nombre}</h2>
              <p className="text-center mb-4 text-gray-300">{mision.descripcion}</p>
              <p className="text-blue-500 font-bold mb-4">{mision.puntos} puntos</p>
              {mision.completada ? (
                <div className="flex flex-col items-center text-green-500">
                  <FaCheckCircle className="text-2xl mb-2" />
                  <span>Completada</span>
                  {mision.entregaUrl && (
                    <button
                      onClick={() => handleViewEntrega(mision.entregaUrl)}
                      className="text-blue-500 underline mt-2"
                    >
                      {mision.entregaUrl.startsWith("http") ? "Ver entrega" : "Descargar entrega"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="mb-4 p-2 bg-gray-600 rounded-lg w-full"
                    disabled={uploading}
                  />
                  <div className="flex items-center mb-4 w-full">
                    <span className="mr-2">O</span>
                    <input
                      type="text"
                      placeholder="Ingresa un link"
                      value={link}
                      onChange={handleLinkChange}
                      className="p-2 bg-gray-600 rounded-lg flex-1"
                      disabled={uploading}
                    />
                  </div>
                  <button
                    onClick={() => handleUploadFile(mision.id)}
                    disabled={uploading || (!selectedFile && !link)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        Completar misión
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}