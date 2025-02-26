'use client'
// app/dashboard/page.js
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaStore, FaQuestionCircle, FaUser, FaSignOutAlt, FaMedal, FaCrown, FaTasks } from "react-icons/fa"
import PuntosDisplay from "@/components/dashboard/PuntosDisplay"
import toast from "react-hot-toast"

export default function DashboardPage() {
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

  const handleLogout = () => {
    localStorage.removeItem("userData")
    toast.success("Sesión cerrada exitosamente")
    router.push("/")
  }

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
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
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSignOutAlt />
        </motion.button>
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard del Estudiante</h1>
        <PuntosDisplay puntos={userData.puntos} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <DashboardButton icon={FaStore} text="Tienda" onClick={() => router.push("/dashboard/tienda")} />
          <DashboardButton
            icon={FaQuestionCircle}
            text="Trivia"
            onClick={() => router.push("/dashboard/trivia")}
          />
          <DashboardButton
            icon={FaUser}
            text="Info del Estudiante"
            onClick={() => router.push("/dashboard/info")}
          />
          <DashboardButton
            icon={FaMedal}
            text="Medallas"
            onClick={() => router.push("/dashboard/medallas")}
          />
          <DashboardButton
            icon={FaCrown}
            text="Leaderboard"
            onClick={() => router.push("/dashboard/leaderboard")}
          />
          <DashboardButton
            icon={FaTasks}
            text="Misiones Semanales"
            onClick={() => router.push("/dashboard/misiones")}
          />
        </div>
      </motion.div>
    </div>
  )
}

function DashboardButton({ icon: Icon, text, onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-6 bg-blue-600 rounded-lg shadow-lg ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      }`}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <Icon className="text-4xl mb-2" />
      <span className="text-lg font-semibold">{text}</span>
    </motion.button>
  )
}