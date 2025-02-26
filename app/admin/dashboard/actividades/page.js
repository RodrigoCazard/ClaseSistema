"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft, FaMapMarked } from "react-icons/fa"

export default function ActivitiesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={() => router.push("/admin/dashboard")}
          className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <h1 className="text-3xl font-bold mb-6 text-center">Actividades</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <ActivityCard
            title="La Isla"
            description="Un juego de supervivencia donde las decisiones importan"
            icon={FaMapMarked}
            onClick={() => router.push("/admin/dashboard/actividades/la-isla")}
          />
        </div>
      </motion.div>
    </div>
  )
}

function ActivityCard({ title, description, icon: Icon, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg hover:from-green-500 hover:to-green-600 transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="text-5xl mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-center text-gray-200">{description}</p>
    </motion.button>
  )
}
