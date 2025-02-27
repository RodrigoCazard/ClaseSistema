"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FaStore, FaQuestionCircle, FaUser, FaSignOutAlt, FaMedal, FaCrown, FaTasks } from "react-icons/fa"
import PuntosDisplay from "@/components/dashboard/PuntosDisplay"
import toast from "react-hot-toast"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

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
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-center p-8 relative overflow-hidden`}
    >
      <NeoBrutalCard className="w-full max-w-4xl relative">
        <NeoBrutalButton
          onClick={handleLogout}
          className={`absolute top-4 right-4 bg-[${neoBrutalColors.accent2}] text-white`}
        >
          <FaSignOutAlt />
        </NeoBrutalButton>
        <h1 className="text-3xl font-black mb-6 text-center">DASHBOARD DEL ESTUDIANTE</h1>
        <PuntosDisplay puntos={userData.puntos} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <DashboardButton icon={FaStore} text="Tienda" onClick={() => router.push("/dashboard/tienda")} />
          <DashboardButton icon={FaQuestionCircle} text="Trivia" onClick={() => router.push("/dashboard/trivia")} />
          <DashboardButton icon={FaUser} text="Info del Estudiante" onClick={() => router.push("/dashboard/info")} />
          <DashboardButton icon={FaMedal} text="Medallas" onClick={() => router.push("/dashboard/medallas")} />
          <DashboardButton icon={FaCrown} text="Leaderboard" onClick={() => router.push("/dashboard/leaderboard")} />
          <DashboardButton
            icon={FaTasks}
            text="Misiones Semanales"
            onClick={() => router.push("/dashboard/misiones")}
          />
        </div>
      </NeoBrutalCard>
    </div>
  )
}

function DashboardButton({ icon: Icon, text, onClick, disabled }) {
  return (
    <NeoBrutalButton
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-6 bg-[${neoBrutalColors.accent1}] ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Icon className="text-4xl mb-2" />
      <span className="text-lg font-semibold">{text}</span>
    </NeoBrutalButton>
  )
}

