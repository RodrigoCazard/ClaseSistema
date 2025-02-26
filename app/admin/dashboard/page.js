"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaSignOutAlt, FaUserGraduate, FaStore, FaClipboardList } from "react-icons/fa"

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
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
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
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard Administrativo</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <AdminButton
            icon={FaUserGraduate}
            text="Manejo de Estudiantes"
            onClick={() => router.push("/admin/dashboard/students")}
          />
          <AdminButton
            icon={FaStore}
            text="Manejo de Productos"
            onClick={() => router.push("/admin/dashboard/products")}
          />
          <AdminButton
            icon={FaClipboardList}
            text="Actividades"
            onClick={() => router.push("/admin/dashboard/actividades")}
           
          />
          <AdminButton
            icon={FaClipboardList}
            text="Trivia"
            onClick={() => router.push("/admin/dashboard/trivia")}
          
          />
        </div>
      </motion.div>
    </div>
  )
}

function AdminButton({ icon: Icon, text, onClick, disabled }) {
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

