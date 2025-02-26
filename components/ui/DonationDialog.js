"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaCoins, FaHeart } from "react-icons/fa"

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const dialogVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
}

export default function DonationDialog({ isOpen, onClose, onConfirm, maxPoints, productName }) {
  const [points, setPoints] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const pointsNum = Number(points)

    if (!points) {
      setError("Por favor ingresa una cantidad")
      return
    }

    if (pointsNum <= 0) {
      setError("La cantidad debe ser mayor a 0")
      return
    }

    if (pointsNum > maxPoints) {
      setError(`No puedes donar más de ${maxPoints} puntos`)
      return
    }

    setError("")
    onConfirm(pointsNum)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          variants={overlayVariants}
          onClick={onClose}
        />
        <motion.div
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 overflow-hidden"
          variants={dialogVariants}
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <FaHeart className="text-red-500 text-4xl mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">Donar Puntos</h2>
            <p className="text-gray-300 mb-6">¿Cuántos puntos deseas donar para desbloquear {productName}?</p>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
                  <FaCoins className="text-yellow-500" />
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => {
                      setPoints(e.target.value)
                      setError("")
                    }}
                    min="1"
                    max={maxPoints}
                    className="w-full bg-transparent px-2 py-1 focus:outline-none"
                    placeholder="Cantidad de puntos"
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute text-sm text-red-500 mt-1"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <p className="text-sm text-gray-400">Puntos disponibles: {maxPoints}</p>
              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-500"
                  disabled={!points || Number(points) <= 0 || Number(points) > maxPoints}
                >
                  Donar
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  Cancelar
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

