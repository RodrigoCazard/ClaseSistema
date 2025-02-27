"use client"

import { useState } from "react"
import { FaTasks, FaCheckCircle, FaUpload, FaSpinner, FaLink } from "react-icons/fa"
import toast from "react-hot-toast"
import { NeoBrutalButton, NeoBrutalCard, NeoBrutalInput, neoBrutalColors } from "@/styles/neobrutalism"

export default function MisionesSemanalesPage() {
  const [misiones] = useState([
    {
      id: "1",
      nombre: "Misión 1: Subir un archivo o enlace",
      descripcion: "Sube un archivo o proporciona un enlace para completar la misión.",
      puntos: 100,
      completada: false,
    },
  ])
  const [selectedFile, setSelectedFile] = useState(null)
  const [link, setLink] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setLink("")
    }
  }

  const handleLinkChange = (e) => {
    setLink(e.target.value)
    setSelectedFile(null)
  }

  const handleUpload = async (misionId) => {
    if (!selectedFile && !link) {
      toast.error("Por favor, selecciona un archivo o proporciona un enlace")
      return
    }

    setUploading(true)
    try {
      let entregaUrl

      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Error al subir el archivo")
        }

        const data = await response.json()
        entregaUrl = data.fileUrl
      } else {
        entregaUrl = link
      }

      // Aquí deberías actualizar el estado de la misión en tu base de datos
      // Por ejemplo: await updateMisionStatus(misionId, entregaUrl)

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
      if (url.startsWith("http")) {
        window.open(url, "_blank")
      } else {
        const response = await fetch(`/api/download?file=${url}`)
        if (!response.ok) {
          throw new Error("No se pudo descargar el archivo")
        }

        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = url
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error("Error al ver la entrega:", error)
      toast.error("No se pudo acceder a la entrega. Verifica los permisos.")
    }
  }

  return (
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-center p-4 relative overflow-hidden`}
    >
      <NeoBrutalCard className="w-full max-w-2xl">
        <h1 className="text-3xl font-black mb-6 text-center">Misiones Semanales</h1>
        <div className="grid grid-cols-1 gap-6">
          {misiones.map((mision) => (
            <NeoBrutalCard key={mision.id} className="flex flex-col items-center justify-center">
              <FaTasks className={`text-4xl mb-4 text-[${neoBrutalColors.accent1}]`} />
              <h2 className="text-xl font-black mb-2 text-center">{mision.nombre}</h2>
              <p className="text-center mb-4">{mision.descripcion}</p>
              <p className={`text-[${neoBrutalColors.accent1}] font-black mb-4`}>{mision.puntos} puntos</p>
              {mision.completada ? (
                <div className="flex flex-col items-center text-[${neoBrutalColors.accent1}]">
                  <FaCheckCircle className="text-2xl mb-2" />
                  <span className="font-black">Completada</span>
                  {mision.entregaUrl && (
                    <NeoBrutalButton
                      onClick={() => handleViewEntrega(mision.entregaUrl)}
                      className={`mt-2 bg-[${neoBrutalColors.accent2}] text-black`}
                    >
                      Ver entrega
                    </NeoBrutalButton>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <NeoBrutalInput type="file" onChange={handleFileChange} className="mb-4" disabled={uploading} />
                  <NeoBrutalInput
                    type="text"
                    placeholder="O ingresa un enlace"
                    value={link}
                    onChange={handleLinkChange}
                    className="mb-4"
                    disabled={uploading}
                  />
                  <NeoBrutalButton
                    onClick={() => handleUpload(mision.id)}
                    disabled={uploading || (!selectedFile && !link)}
                    className={`bg-[${neoBrutalColors.accent1}] text-black font-black flex items-center justify-center gap-2 w-full`}
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        {selectedFile ? <FaUpload /> : <FaLink />}
                        Completar misión
                      </>
                    )}
                  </NeoBrutalButton>
                </div>
              )}
            </NeoBrutalCard>
          ))}
        </div>
      </NeoBrutalCard>
    </div>
  )
}

