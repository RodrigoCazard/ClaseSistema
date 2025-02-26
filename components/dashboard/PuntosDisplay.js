"use client"

import { motion } from "framer-motion"
import { FaCoins } from "react-icons/fa"

export default function PuntosDisplay({ puntos }) {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <FaCoins className="text-3xl text-yellow-500 mr-2" />
      <motion.h3
        className="text-2xl font-bold"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        Tus puntos: {puntos !== null ? puntos : "Cargando..."}
      </motion.h3>
    </motion.div>
  )
}

