"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaSignInAlt, FaArrowLeft } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"

const schema = z.object({
  code: z.string().length(11, "El código de administrador debe tener 11 caracteres"),
})

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    setLoading(true)
    if (data.code === "033-EMS-584") {
      localStorage.setItem("adminAuth", "true")
      toast.success("Inicio de sesión exitoso")
      router.push("/admin/dashboard")
    } else {
      toast.error("Código de administrador incorrecto")
      setLoading(false)
    }
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
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <div className="flex items-center justify-center mb-6">
          <FaSignInAlt className="text-3xl text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold">Acceso Administrativo</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.input
            {...register("code")}
            type="text"
            placeholder="Ingresa el código de administrador"
            className="w-full p-3 bg-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          {errors.code && <p className="text-red-500 mb-4">{errors.code.message}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Cargando..." : "Iniciar sesión como administrador"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

