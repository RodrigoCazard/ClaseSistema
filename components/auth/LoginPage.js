"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaSignInAlt, FaUserCog } from "react-icons/fa"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"

const schema = z.object({
  ci: z.string().min(5, "El CI debe tener al menos 5 caracteres"),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const docRef = doc(db, "estudiantes", data.ci)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        localStorage.setItem("userData", JSON.stringify({ ci: data.ci, puntos: userData.Puntos }))
        toast.success("Inicio de sesión exitoso")
        router.push("/dashboard")
      } else {
        toast.error("Usuario no encontrado")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      toast.error("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md backdrop-filter backdrop-blur-lg relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={handleAdminLogin}
          className="absolute top-4 right-4 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCog />
        </motion.button>
        <div className="flex items-center justify-center mb-6">
          <FaSignInAlt className="text-3xl text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold">Iniciar sesión con CI</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.input
            {...register("ci")}
            type="text"
            placeholder="Ingresa tu CI"
            className="w-full p-3 bg-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          {errors.ci && <p className="text-red-500 mb-4">{errors.ci.message}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

