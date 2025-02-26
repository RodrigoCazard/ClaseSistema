"use client"

import { motion } from "framer-motion"
import { FaSignOutAlt } from "react-icons/fa"
import PuntosDisplay from "./PuntosDisplay"
import Tienda from "./Tienda"

export default function StudentDashboard({ ci, puntos, message, onLogout, onGastarPuntos }) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl relative"
    >
      <motion.button
        onClick={onLogout}
        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaSignOutAlt />
      </motion.button>
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg mb-8 backdrop-filter backdrop-blur-lg">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
          <span className="mr-2">👨‍💻</span>
          Bienvenido, estudiante de informática con CI: {ci}
        </h2>
        <PuntosDisplay puntos={puntos} />
      </div>
      <Tienda puntos={puntos} onGastarPuntos={onGastarPuntos} />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-red-500 text-center"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )
}

