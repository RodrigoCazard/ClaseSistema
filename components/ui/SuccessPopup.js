"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FaCheckCircle, FaCoins, FaTimes, FaGift, FaHeart } from "react-icons/fa"

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const popupVariants = {
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

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.3,
    },
  },
}

export default function SuccessPopup({ isOpen, onClose, details }) {
  if (!isOpen || !details) return null

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
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
          variants={popupVariants}
        >
          <motion.button
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>

          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <FaCheckCircle className="text-6xl text-green-500 mb-4" />
              </motion.div>
              <motion.div variants={contentVariants} initial="hidden" animate="visible">
                <h2 className="text-2xl font-bold mb-6">¡Transacción Exitosa!</h2>

                <div className="bg-gray-700/50 rounded-lg p-4 w-full mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Producto:</span>
                    <div className="flex items-center">
                      {details.type === "purchase" ? (
                        <FaGift className="text-blue-500 mr-2" />
                      ) : (
                        <FaHeart className="text-red-500 mr-2" />
                      )}
                      <span className="font-semibold">{details.productName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Tipo:</span>
                    <span className="font-semibold">
                      {details.type === "purchase" ? (
                        <span className="text-blue-400">Compra</span>
                      ) : (
                        <span className="text-red-400">Donación</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Puntos:</span>
                    <motion.div
                      className="flex items-center text-yellow-500"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <FaCoins className="mr-1" />
                      <span className="font-bold">{details.points}</span>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="bg-blue-500/20 rounded-lg p-4 w-full mb-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Puntos restantes:</span>
                    <div className="flex items-center text-blue-400">
                      <FaCoins className="mr-1" />
                      <span className="font-bold">{details.remainingPoints}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={onClose}
                  className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Aceptar
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

