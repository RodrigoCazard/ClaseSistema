"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaSignOutAlt, FaUserGraduate, FaStore, FaClipboardList, FaMedal } from "react-icons/fa"
import { NeoBrutalCard, neoBrutalColors, neoBrutalStyles } from "@/styles/neobrutalism"

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/")
  }

  return (
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-start p-8 relative overflow-hidden`}
    >
      <motion.button
        onClick={handleLogout}
        className={`absolute top-8 right-8 ${neoBrutalStyles.button} bg-[${neoBrutalColors.accent2}] text-white`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaSignOutAlt />
      </motion.button>
      <NeoBrutalCard className="w-full max-w-4xl mt-16">
        <h1 className="text-3xl font-black mb-8 text-center">DASHBOARD ADMINISTRATIVO</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <AdminButton
            icon={FaUserGraduate}
            text="Estudiantes"
            onClick={() => router.push("/admin/dashboard/students")}
          />
          <AdminButton icon={FaStore} text="Productos" onClick={() => router.push("/admin/dashboard/products")} />
          <AdminButton
            icon={FaClipboardList}
            text="Actividades"
            onClick={() => router.push("/admin/dashboard/actividades")}
          />
          <AdminButton icon={FaClipboardList} text="Trivia" onClick={() => router.push("/admin/dashboard/trivia")} />
          <AdminButton icon={FaMedal} text="Medallas" onClick={() => router.push("/admin/dashboard/medallas")} />
        </div>
      </NeoBrutalCard>
    </div>
  )
}

function AdminButton({ icon: Icon, text, onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${neoBrutalStyles.button} bg-[${neoBrutalColors.accent1}] flex flex-col items-center justify-center p-6 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <Icon className="text-4xl mb-2" />
      <span className="text-lg font-semibold">{text}</span>
    </motion.button>
  )
}

