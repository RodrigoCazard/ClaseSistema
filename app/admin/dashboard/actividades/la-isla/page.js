"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { FaArrowLeft, FaPlay, FaRedo, FaArrowRight, FaHeartbeat, FaLightbulb, FaUsers } from "react-icons/fa"
import Card from "@/components/games/Card"

// Todas las 20 cartas de ejemplo
const cardData = [
  {
    id: "storm",
    situation: "Una tormenta tropical se acerca a la isla",
    options: [
      {
        text: "Buscar refugio en una cueva cercana",
        consequence: "Encuentran un refugio seguro y seco",
        survival: 2,
        ingenuity: 0,
        teamwork: 1,
      },
      {
        text: "Construir un refugio temporal",
        consequence: "El refugio resiste pero requiere reparaciones",
        survival: 1,
        ingenuity: 2,
        teamwork: 1,
      },
      {
        text: "Escalar a un terreno más alto",
        consequence: "La exposición causa problemas",
        survival: -1,
        ingenuity: 1,
        teamwork: 0,
      },
    ],
  },
  {
    id: "food",
    situation: "Los suministros de comida están bajos",
    options: [
      { text: "Pescar en la costa", consequence: "Consiguen varios peces", survival: 2, ingenuity: 1, teamwork: 0 },
      {
        text: "Buscar frutas en la jungla",
        consequence: "Encuentran cocos y plátanos",
        survival: 1,
        ingenuity: 0,
        teamwork: 1,
      },
      {
        text: "Poner trampas para animales",
        consequence: "Las trampas no funcionan bien",
        survival: 0,
        ingenuity: 1,
        teamwork: -1,
      },
    ],
  },
  {
    id: "water",
    situation: "La fuente de agua dulce está contaminada",
    options: [
      {
        text: "Hervir el agua antes de beberla",
        consequence: "Eliminan la mayoría de los contaminantes",
        survival: 1,
        ingenuity: 1,
        teamwork: 0,
      },
      {
        text: "Construir un filtro de arena",
        consequence: "Obtienen agua más limpia",
        survival: 0,
        ingenuity: 2,
        teamwork: 1,
      },
      {
        text: "Ignorar la contaminación",
        consequence: "Enferman gravemente",
        survival: -2,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "shelter",
    situation: "El refugio principal ha sido destruido por animales",
    options: [
      {
        text: "Reconstruir el refugio con materiales más fuertes",
        consequence: "El nuevo refugio es más resistente",
        survival: 1,
        ingenuity: 2,
        teamwork: 1,
      },
      {
        text: "Buscar una nueva ubicación para el refugio",
        consequence: "Encuentran un lugar más seguro",
        survival: 0,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Dormir a la intemperie",
        consequence: "Sufren de picaduras de insectos y frío",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "navigation",
    situation: "Se han perdido durante una excursión",
    options: [
      {
        text: "Usar el sol y las estrellas para orientarse",
        consequence: "Regresan al campamento",
        survival: 1,
        ingenuity: 2,
        teamwork: 0,
      },
      {
        text: "Seguir un río en dirección descendente",
        consequence: "Llegan a la costa",
        survival: 0,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Vagar sin rumbo fijo",
        consequence: "Se pierden aún más",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "fire",
    situation: "No pueden encender una fogata",
    options: [
      {
        text: "Usar un arco y un taladro de madera",
        consequence: "Logran encender una pequeña llama",
        survival: 1,
        ingenuity: 2,
        teamwork: 0,
      },
      {
        text: "Frotar dos piedras para crear chispas",
        consequence: "Después de mucho esfuerzo, encienden el fuego",
        survival: 0,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Rendirse y esperar el amanecer",
        consequence: "Pasan la noche con frío",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "illness",
    situation: "Un miembro del grupo se enferma gravemente",
    options: [
      {
        text: "Usar hierbas medicinales locales",
        consequence: "El miembro del grupo mejora lentamente",
        survival: 1,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Darle descanso y líquidos",
        consequence: "Se recupera completamente",
        survival: 2,
        ingenuity: 0,
        teamwork: 1,
      },
      {
        text: "Ignorar la enfermedad",
        consequence: "Empeora la situación",
        survival: -2,
        ingenuity: 0,
        teamwork: -1,
      },
    ],
  },
  {
    id: "animals",
    situation: "Un grupo de animales salvajes se acerca al campamento",
    options: [
      {
        text: "Hacer ruido y ahuyentarlos",
        consequence: "Los animales se alejan",
        survival: 1,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Encender una fogata para mantenerlos alejados",
        consequence: "Los animales evitan el fuego",
        survival: 2,
        ingenuity: 1,
        teamwork: 0,
      },
      {
        text: "Enfrentarlos directamente",
        consequence: "Sufren heridas",
        survival: -1,
        ingenuity: 0,
        teamwork: -1,
      },
    ],
  },
  {
    id: "tools",
    situation: "Se rompe una herramienta esencial",
    options: [
      {
        text: "Improvisar una herramienta de reemplazo",
        consequence: "La herramienta improvisada funciona bien",
        survival: 1,
        ingenuity: 2,
        teamwork: 0,
      },
      {
        text: "Reparar la herramienta rota",
        consequence: "La herramienta queda como nueva",
        survival: 0,
        ingenuity: 2,
        teamwork: 1,
      },
      {
        text: "No hacer nada",
        consequence: "Sufren por la falta de la herramienta",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "communication",
    situation: "Necesitan comunicarse con el mundo exterior",
    options: [
      {
        text: "Construir una señal de humo",
        consequence: "La señal es vista por un avión",
        survival: 2,
        ingenuity: 2,
        teamwork: 1,
      },
      {
        text: "Escribir un mensaje en una botella",
        consequence: "La botella es encontrada por alguien",
        survival: 1,
        ingenuity: 1,
        teamwork: 0,
      },
      {
        text: "Esperar a ser encontrados",
        consequence: "La espera se hace larga",
        survival: 0,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "climate",
    situation: "Un cambio climático repentino dificulta la supervivencia",
    options: [
      {
        text: "Adaptarse a las nuevas condiciones",
        consequence: "Logran sobrevivir",
        survival: 2,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Buscar un nuevo refugio",
        consequence: "Encuentran un lugar más adecuado",
        survival: 1,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Resistirse al cambio",
        consequence: "Sufren las consecuencias",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "exploration",
    situation: "Deciden explorar una parte desconocida de la isla",
    options: [
      {
        text: "Preparar una expedición bien equipada",
        consequence: "Descubren recursos valiosos",
        survival: 1,
        ingenuity: 2,
        teamwork: 1,
      },
      {
        text: "Ir sin preparación",
        consequence: "Se enfrentan a peligros inesperados",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
      {
        text: "No explorar",
        consequence: "Pierden la oportunidad de encontrar recursos",
        survival: 0,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "leadership",
    situation: "Hay desacuerdos sobre quién debería liderar el grupo",
    options: [
      {
        text: "Elegir un líder democráticamente",
        consequence: "El grupo trabaja mejor junto",
        survival: 1,
        ingenuity: 0,
        teamwork: 2,
      },
      {
        text: "Dejar que la persona más fuerte lidere",
        consequence: "Crea resentimiento en el grupo",
        survival: 0,
        ingenuity: 0,
        teamwork: -1,
      },
      {
        text: "No tener líder",
        consequence: "El grupo se desorganiza",
        survival: -1,
        ingenuity: 0,
        teamwork: -2,
      },
    ],
  },
  {
    id: "morale",
    situation: "La moral del grupo está baja",
    options: [
      {
        text: "Organizar actividades recreativas",
        consequence: "Mejora el ánimo del grupo",
        survival: 0,
        ingenuity: 1,
        teamwork: 2,
      },
      {
        text: "Ignorar el problema",
        consequence: "La moral empeora",
        survival: 0,
        ingenuity: 0,
        teamwork: -1,
      },
      {
        text: "Establecer metas alcanzables",
        consequence: "El grupo se siente más motivado",
        survival: 1,
        ingenuity: 1,
        teamwork: 1,
      },
    ],
  },
  {
    id: "resources",
    situation: "Descubren un nuevo recurso valioso",
    options: [
      {
        text: "Usar el recurso sabiamente",
        consequence: "Mejora la calidad de vida",
        survival: 2,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Acumular el recurso",
        consequence: "Crea conflictos en el grupo",
        survival: 0,
        ingenuity: 0,
        teamwork: -1,
      },
      {
        text: "Desperdiciar el recurso",
        consequence: "Pierden una oportunidad valiosa",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "safety",
    situation: "La seguridad del campamento está en riesgo",
    options: [
      {
        text: "Mejorar las defensas del campamento",
        consequence: "El campamento es más seguro",
        survival: 2,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Ignorar el riesgo",
        consequence: "El campamento es atacado",
        survival: -2,
        ingenuity: 0,
        teamwork: 0,
      },
      {
        text: "Evacuar el campamento",
        consequence: "Pierden recursos valiosos",
        survival: 0,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
  {
    id: "trade",
    situation: "Encuentran otra civilización en la isla",
    options: [
      {
        text: "Establecer relaciones comerciales",
        consequence: "Ambos grupos se benefician",
        survival: 1,
        ingenuity: 1,
        teamwork: 2,
      },
      {
        text: "Evitar el contacto",
        consequence: "Pierden la oportunidad de intercambiar recursos",
        survival: 0,
        ingenuity: 0,
        teamwork: 0,
      },
      {
        text: "Atacar a la otra civilización",
        consequence: "Sufren grandes pérdidas",
        survival: -2,
        ingenuity: 0,
        teamwork: -2,
      },
    ],
  },
  {
    id: "unity",
    situation: "La unidad del grupo está en peligro",
    options: [
      {
        text: "Organizar una reunión para resolver conflictos",
        consequence: "El grupo se une de nuevo",
        survival: 0,
        ingenuity: 1,
        teamwork: 2,
      },
      {
        text: "Ignorar los conflictos",
        consequence: "El grupo se divide",
        survival: -1,
        ingenuity: 0,
        teamwork: -2,
      },
      {
        text: "Establecer reglas claras",
        consequence: "El grupo trabaja mejor junto",
        survival: 1,
        ingenuity: 1,
        teamwork: 1,
      },
    ],
  },
  {
    id: "weather",
    situation: "Un clima extremo pone a prueba al grupo",
    options: [
      {
        text: "Adaptarse al clima",
        consequence: "El grupo sobrevive",
        survival: 2,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Buscar refugio",
        consequence: "El grupo se protege",
        survival: 1,
        ingenuity: 1,
        teamwork: 1,
      },
      {
        text: "Resistirse al clima",
        consequence: "El grupo sufre",
        survival: -1,
        ingenuity: 0,
        teamwork: 0,
      },
    ],
  },
]

export default function LaIslaPage() {
  const router = useRouter()
  const [gameStarted, setGameStarted] = useState(false)
  const [deck, setDeck] = useState([])
  const [currentCards, setCurrentCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const MAX_ROUNDS = 5



  const handleCardSelect = (cardIndex) => {
    if (selectedCard === null) {
      setSelectedCard(cardIndex)
    }
  }

  const handleRevealClick = () => {
    setShowComparison(true)
  }

  const shuffleDeck = () => {
    return [...cardData].sort(() => Math.random() - 0.5)
  }

  const startGame = () => {
    const shuffledDeck = shuffleDeck()
    setDeck(shuffledDeck.slice(3))
    setCurrentCards(shuffledDeck.slice(0, 3))
    setGameStarted(true)
    setSelectedCard(null)
    setShowComparison(false)
    setCurrentRound(1)
  }

  const nextRound = () => {
    if (currentRound < MAX_ROUNDS && deck.length >= 3) {
      setCurrentCards(deck.slice(0, 3))
      setDeck(deck.slice(3))
      setSelectedCard(null)
      setShowComparison(false)
      setCurrentRound(currentRound + 1)
    } else {
      setCurrentCards([])
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 relative overflow-hidden bg-gradient-to-b from-blue-900 to-purple-900">
      <Image
        src="/palm-tree.png"
        alt="Palm Tree Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0 opacity-20"
      />
      <div className="z-10 w-full max-w-7xl">
        <motion.div
          className="bg-gray-800 bg-opacity-90 p-4 sm:p-8 rounded-3xl shadow-2xl backdrop-filter backdrop-blur-lg relative mt-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.button
            onClick={() => router.push("/admin/dashboard/actividades")}
            className="absolute top-4 left-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-colors shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowLeft />
          </motion.button>
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 sm:mb-8 text-center text-white">La Isla</h1>

          {!gameStarted ? (
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <p className="mb-6 sm:mb-10 text-lg sm:text-2xl text-gray-300">
                Bienvenidos a La Isla, un juego de supervivencia donde cada decisión cuenta. Trabajen en equipo para
                sobrevivir y prosperar.
              </p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Image src="/campfire.png" alt="Campfire" width={150} height={150} className="mx-auto mb-6 sm:mb-10" />
              </motion.div>
              <motion.button
                onClick={startGame}
                className="inline-flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-green-600 hover:bg-green-500 rounded-full text-xl sm:text-2xl font-semibold transition-colors text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlay />
                Comenzar Aventura
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6 sm:space-y-10">
              <motion.div
                className="flex flex-col sm:flex-row justify-between items-center gap-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-semibold text-white">
                    Ronda {currentRound} de {MAX_ROUNDS}
                  </p>
                  <p className="text-base sm:text-lg text-gray-400">Cartas restantes: {deck.length}</p>
                </div>

                <div className="flex gap-4 sm:gap-8 bg-gray-700 p-3 sm:p-5 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaHeartbeat className="text-red-500 text-xl sm:text-3xl" />
                    <span className="text-sm sm:text-lg font-medium text-white">Supervivencia</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaLightbulb className="text-yellow-500 text-xl sm:text-3xl" />
                    <span className="text-sm sm:text-lg font-medium text-white">Ingenio</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaUsers className="text-blue-500 text-xl sm:text-3xl" />
                    <span className="text-sm sm:text-lg font-medium text-white">Trabajo en Equipo</span>
                  </div>
                </div>

                <motion.button
                  onClick={startGame}
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-4 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors text-white shadow-lg text-base sm:text-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaRedo />
                  Reiniciar
                </motion.button>
              </motion.div>

              <AnimatePresence>
                <motion.div
                  className="flex justify-center items-center gap-4 sm:gap-8 relative min-h-[50vh] sm:min-h-[60vh]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentCards.map((card, index) => (
                    <Card
                      key={card.id}
                      card={card}
                      index={index}
                      isFlipped={selectedCard === index}
                      showOptions={selectedCard === index}
                      showComparison={showComparison && selectedCard === index}
                      onSelect={handleCardSelect}
                      isSelected={selectedCard === index}
                      onRevealClick={handleRevealClick}
                      selectedOption={selectedCard}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {showComparison && (
                <motion.div
                  className="text-center mt-6 sm:mt-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={nextRound}
                    className="inline-flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-green-600 hover:bg-green-500 rounded-full text-xl sm:text-2xl font-semibold transition-colors text-white shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentRound < MAX_ROUNDS ? "Siguiente Desafío" : "Finalizar Aventura"}
                    <FaArrowRight />
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

