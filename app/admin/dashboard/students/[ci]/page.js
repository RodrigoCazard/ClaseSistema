"use client"

import { useEffect, useState,use } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { FaArrowLeft } from "react-icons/fa"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

export default function StudentDetailPage({ params }) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { ci } = use(params)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDoc = await getDoc(doc(db, "estudiantes", ci))
        if (studentDoc.exists()) {
          setStudent({ id: studentDoc.id, ...studentDoc.data() })
        } else {
          router.push("/admin/dashboard/students")
        }
      } catch (error) {
        console.error("Error fetching student:", error)
        router.push("/admin/dashboard/students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [ci, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-start p-8 relative overflow-hidden`}
    >
      <NeoBrutalButton
        onClick={() => router.push("/admin/dashboard/students")}
        className={`absolute top-8 left-8 bg-[${neoBrutalColors.accent2}] text-white`}
      >
        <FaArrowLeft /> Atrás
      </NeoBrutalButton>
      <NeoBrutalCard className="w-full max-w-4xl mt-16">
        <h1 className="text-3xl font-black mb-8 text-center">DETALLE DEL ESTUDIANTE</h1>

        <div className="space-y-6">
          <div className={`bg-[${neoBrutalColors.accent1}] p-6 border-4 border-black`}>
            <h2 className="text-xl font-semibold mb-4">Datos Básicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700">CI:</p>
                <p className="font-medium">{student.id}</p>
              </div>
              <div>
                <p className="text-gray-700">Nombre Completo:</p>
                <p className="font-medium">{student.nombreCompleto || "No especificado"}</p>
              </div>
              <div>
                <p className="text-gray-700">Puntos:</p>
                <p className="font-medium">{student.Puntos}</p>
              </div>
              <div>
                <p className="text-gray-700">Perfil Completado:</p>
                <p className="font-medium">{student.perfilCompletado ? "Sí" : "No"}</p>
              </div>
            </div>
          </div>

          <div className={`bg-[${neoBrutalColors.accent2}] p-6 border-4 border-black`}>
            <h2 className="text-xl font-semibold mb-4">Detalles Adicionales</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-200">Fecha de Registro:</p>
                <p className="font-medium">
                  {student.fechaRegistro
                    ? new Date(student.fechaRegistro.toDate()).toLocaleDateString()
                    : "No disponible"}
                </p>
              </div>
              <div>
                <p className="text-gray-200">Última Actualización:</p>
                <p className="font-medium">
                  {student.ultimaActualizacion
                    ? new Date(student.ultimaActualizacion.toDate()).toLocaleDateString()
                    : "No disponible"}
                </p>
              </div>
              <div>
                <p className="text-gray-200">Estado:</p>
                <p className="font-medium">{student.activo ? "Activo" : "Inactivo"}</p>
              </div>
            </div>
          </div>

          <div className={`bg-[${neoBrutalColors.card}] p-6 border-4 border-black`}>
            <h2 className="text-xl font-semibold mb-4">Notas o Comentarios</h2>
            <p className="text-gray-700">{student.notas || "No hay notas o comentarios registrados."}</p>
          </div>
        </div>
      </NeoBrutalCard>
    </div>
  )
}

