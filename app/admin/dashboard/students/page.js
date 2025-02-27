"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaPlus, FaArrowLeft } from "react-icons/fa"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { NeoBrutalButton, NeoBrutalInput, NeoBrutalCard, neoBrutalStyles, neoBrutalColors } from "@/styles/neobrutalism.js"

const schema = z.object({
  ci: z.string().length(8, "La CI debe tener exactamente 8 caracteres"),
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  points: z.number().int().min(0, "Los puntos deben ser un número entero positivo"),
})

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
    } else {
      fetchStudents()
    }
  }, [router])

  const fetchStudents = async () => {
    try {
      const studentsCollection = collection(db, "estudiantes")
      const studentsSnapshot = await getDocs(studentsCollection)
      const studentsList = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStudents(studentsList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Error al cargar los estudiantes")
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      await setDoc(doc(db, "estudiantes", data.ci), {
        Puntos: data.points,
        nombreCompleto: data.fullName,
        perfilCompletado: false,
      })
      reset()
      fetchStudents()
      toast.success("Estudiante agregado correctamente")
    } catch (error) {
      console.error("Error adding student:", error)
      toast.error("Error al agregar el estudiante")
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.id.includes(searchTerm) ||
      (student.nombreCompleto && student.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
        onClick={() => router.push("/admin/dashboard")}
        className={`absolute top-8 left-8 bg-[${neoBrutalColors.accent2}] text-white`}
      >
        <FaArrowLeft />
      </NeoBrutalButton>
      <NeoBrutalCard className="w-full max-w-4xl relative mt-16">
        <h1 className="text-3xl font-black mb-8 text-center">GESTIÓN DE ESTUDIANTES</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <NeoBrutalInput
                {...register("ci")}
                type="text"
                placeholder="CI del nuevo estudiante"
                className={errors.ci ? "border-red-500" : ""}
              />
              {errors.ci && <p className="text-red-700 font-bold mt-1">{errors.ci.message}</p>}
            </div>
            <div>
              <NeoBrutalInput
                {...register("fullName")}
                type="text"
                placeholder="Nombre completo"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && <p className="text-red-700 font-bold mt-1">{errors.fullName.message}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <NeoBrutalInput
              {...register("points", { valueAsNumber: true })}
              type="number"
              placeholder="Puntos iniciales"
              className={errors.points ? "border-red-500" : ""}
            />
            <NeoBrutalButton type="submit" className={`bg-[${neoBrutalColors.accent1}]`}>
              <FaPlus />
            </NeoBrutalButton>
          </div>
          {errors.points && <p className="text-red-700 font-bold mt-1">{errors.points.message}</p>}
        </form>

        <div className="mb-4">
          <NeoBrutalInput
            type="text"
            placeholder="Buscar por CI o nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full ${neoBrutalStyles.table}`}>
            <thead>
              <tr className={neoBrutalStyles.tableHeader}>
                <th className="p-3">CI</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className={`${neoBrutalStyles.tableCell} hover:bg-gray-100 cursor-pointer`}
                  onClick={() => router.push(`/admin/dashboard/students/${student.id}`)}
                >
                  <td className="p-3">{student.id}</td>
                  <td className="p-3">{student.nombreCompleto || "No especificado"}</td>
                  <td className="p-3">{student.Puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeoBrutalCard>
    </div>
  )
}

