"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft, FaLock } from "react-icons/fa"


export default function TriviaPendingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
    
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md backdrop-filter backdrop-blur-lg relative"
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
        <div className="flex flex-col items-center justify-center">
          <FaLock className="text-6xl mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-center">Trivia</h1>
          <p className="text-center mb-4">Esta función aún no está disponible.</p>
          <p className="text-center">¡Vuelve pronto para participar en emocionantes trivias!</p>
        </div>
      </motion.div>
    </div>
  )
}

