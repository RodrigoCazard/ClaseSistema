"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft } from "react-icons/fa"
import PuntosDisplay from "@/components/dashboard/PuntosDisplay"
import Tienda from "@/components/dashboard/Tienda"

export default function TiendaPage() {
  const [userData, setUserData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData")
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    } else {
      router.push("/")
    }
  }, [router])

  const handleActualizarPuntos = (newPuntos) => {
    setUserData((prevData) => {
      const updatedUserData = { ...prevData, puntos: newPuntos }
      localStorage.setItem("userData", JSON.stringify(updatedUserData))
      return updatedUserData
    })
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <h1 className="text-3xl font-bold mb-6 text-center">Tienda de Puntos</h1>
        <PuntosDisplay puntos={userData.puntos} />
        <Tienda puntos={userData.puntos} userData={userData} onActualizarPuntos={handleActualizarPuntos} />
      </motion.div>
    </div>
  )
}

