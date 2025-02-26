"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FaCoins, FaCheckCircle, FaTimesCircle, FaQuestion } from "react-icons/fa"

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

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, type = "default" }) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-4xl mb-4" />
      case "warning":
        return <FaTimesCircle className="text-yellow-500 text-4xl mb-4" />
      case "default":
        return <FaCoins className="text-blue-500 text-4xl mb-4" />
      default:
        return <FaQuestion className="text-blue-500 text-4xl mb-4" />
    }
  }

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
              {getIcon()}
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex gap-4 w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={onConfirm}
              >
                {confirmText || "Confirmar"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                onClick={onClose}
              >
                Cancelar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

