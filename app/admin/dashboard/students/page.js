"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaPlus, FaMinus, FaTrash, FaArrowLeft } from "react-icons/fa"
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

const schema = z.object({
  ci: z.string().length(8, "La CI debe tener exactamente 8 caracteres"),
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  points: z.number().int().min(0, "Los puntos deben ser un número entero positivo"),
})

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const pointsRefs = useRef({})

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

  const handleUpdatePoints = async (studentId, currentPoints, pointsToUpdate) => {
    if (isNaN(pointsToUpdate) || pointsToUpdate === 0) return

    try {
      const studentRef = doc(db, "estudiantes", studentId)
      const newPoints = currentPoints + pointsToUpdate

      await updateDoc(studentRef, { Puntos: newPoints })

      const movementRef = doc(collection(db, "movimientos"))
      await setDoc(movementRef, {
        ci: studentId,
        fecha: new Date(),
        ganados: pointsToUpdate > 0,
        puntos: Math.abs(pointsToUpdate),
      })

      fetchStudents()
      toast.success("Puntos actualizados correctamente y movimiento registrado")
    } catch (error) {
      console.error("Error updating points and recording transaction:", error)
      toast.error("Error al actualizar los puntos o registrar el movimiento")
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

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, "estudiantes", studentId))
      fetchStudents()
      toast.success("Estudiante eliminado correctamente")
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Error al eliminar el estudiante")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <motion.button
        onClick={() => router.push("/admin/dashboard")}
        className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowLeft />
      </motion.button>
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Estudiantes</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                {...register("ci")}
                type="text"
                placeholder="CI del nuevo estudiante"
                className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.ci && <p className="text-red-500 mt-1 text-sm">{errors.ci.message}</p>}
            </div>
            <div>
              <input
                {...register("fullName")}
                type="text"
                placeholder="Nombre completo"
                className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && <p className="text-red-500 mt-1 text-sm">{errors.fullName.message}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              {...register("points", { valueAsNumber: true })}
              type="number"
              placeholder="Puntos iniciales"
              className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaPlus />
            </button>
          </div>
          {errors.points && <p className="text-red-500 mt-1 text-sm">{errors.points.message}</p>}
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4">CI</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Puntos</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-700">
                  <td className="py-2 px-4">{student.id}</td>
                  <td className="py-2 px-4">{student.nombreCompleto || "No especificado"}</td>
                  <td className="py-2 px-4">{student.Puntos}</td>
                  <td className="py-2 px-4 flex items-center">
                    <input
                      type="number"
                      defaultValue={0}
                      ref={(el) => (pointsRefs.current[student.id] = el)}
                      onChange={(e) => (e.target.value = Math.max(0, Number.parseInt(e.target.value) || 0))}
                      className="w-20 p-1 mr-2 bg-gray-700 rounded"
                    />
                    <motion.button
                      onClick={() =>
                        handleUpdatePoints(
                          student.id,
                          student.Puntos,
                          Number.parseInt(pointsRefs.current[student.id].value),
                        )
                      }
                      className="mr-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaPlus />
                    </motion.button>
                    <motion.button
                      onClick={() =>
                        handleUpdatePoints(
                          student.id,
                          student.Puntos,
                          -Number.parseInt(pointsRefs.current[student.id].value),
                        )
                      }
                      className="mr-2 bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaMinus />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

