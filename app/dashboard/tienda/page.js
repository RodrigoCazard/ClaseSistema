"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft } from "react-icons/fa"
import PuntosDisplay from "@/components/dashboard/PuntosDisplay"
import Tienda from "@/components/dashboard/Tienda"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

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
          className={`w-16 h-16 border-4 border-[${neoBrutalColors.accent1}] border-t-transparent rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-center p-8 relative overflow-hidden`}
    >
      <NeoBrutalCard className="w-full max-w-4xl relative">
        <NeoBrutalButton
          onClick={() => router.push("/dashboard")}
          className={`absolute top-4 left-4 bg-[${neoBrutalColors.accent2}] text-white`}
        >
          <FaArrowLeft />
        </NeoBrutalButton>
        <h1 className="text-3xl font-black mb-6 text-center">TIENDA DE PUNTOS</h1>
        <PuntosDisplay puntos={userData.puntos} />
        <Tienda puntos={userData.puntos} userData={userData} onActualizarPuntos={handleActualizarPuntos} />
      </NeoBrutalCard>
    </div>
  )
}

