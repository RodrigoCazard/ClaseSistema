"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { FaHeartbeat, FaLightbulb, FaUsers, FaDice } from "react-icons/fa"

export default function Card({
  card,
  isFlipped,
  onSelect,
  showOptions,
  showComparison,
  
  index,
  isSelected,
  onRevealClick,
}) {
  return (
    <motion.div
      className="card-container"
      initial={false}
      animate={{
        scale: isSelected ? 1.1 : 1,
        opacity: isSelected || !showOptions ? 1 : 0.3,
        zIndex: isSelected ? 10 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={() => !isFlipped && onSelect(index)}>
        <div className="card-face card-back">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700/50 to-gray-900/50 z-10" />
          <Image src="/card-back.jpg" alt="Card back" fill className="object-cover" priority />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="text-6xl">🏝️</span>
          </div>
        </div>
        <div className="card-face card-front">
          <div className="relative w-full h-40">
            <Image
              src={`https://picsum.photos/seed/${card.id}/800/400`}
              alt={card.situation}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
          </div>
          <div className="p-4 bg-gray-900 flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-center">{card.situation}</h3>
            {showOptions && (
              <div className="grid grid-cols-1 gap-3 flex-1">
                {card.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-center mt-auto transition-all ${
                      showComparison ? ( "bg-gray-700") : "bg-blue-600"
                    }`}
                  >
                    <p className="text-base font-medium">{option.text}</p>
                    {showComparison && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-300">{option.consequence}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                          <StatDisplay icon={FaHeartbeat} value={option.survival} label="Supervivencia" />
                          <StatDisplay icon={FaLightbulb} value={option.ingenuity} label="Ingenio" />
                          <StatDisplay icon={FaUsers} value={option.teamwork} label="Equipo" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isFlipped && !showComparison && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onRevealClick()
                }}
                className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDice className="text-xl" />
                ¡Descubre tu destino!
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatDisplay({ icon: Icon, value, label }) {
  const getColor = () => {
    if (value > 0) return "text-green-400"
    if (value < 0) return "text-red-400"
    return "text-gray-400"
  }

  const getValueDisplay = (value) => {
    if (value > 0) return `+${value}`
    return value
  }

  return (
    <div className="flex  items-center gap-2">
      <Icon className={`text-lg ${getColor()}`} />
      <span className={`text-sm font-bold ${getColor()}`}>{getValueDisplay(value)}</span>
    </div>
  )
}

