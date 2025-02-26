"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaQuestionCircle } from "react-icons/fa"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import toast from "react-hot-toast"



export default function StudentTrivia({ studentCI, onTriviaComplete }) {
  const [trivia, setTrivia] = useState<Trivia | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [triviaStarted, setTriviaStarted] = useState(false)

  const fetchTrivia = async () => {
    setLoading(true)
    try {
      const triviaId = selectedDate.replace(/-/g, "")
      const triviaDoc = await getDoc(doc(db, "trivias", triviaId))

      if (triviaDoc.exists()) {
        setTrivia(triviaDoc.data())
        setTriviaStarted(true)
      } else {
        toast.error("No hay trivia disponible para la fecha seleccionada")
      }
    } catch (error) {
      console.error("Error fetching trivia:", error)
      toast.error("Error al cargar la trivia")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const newUserAnswers = [...userAnswers, selectedAnswer]
    setUserAnswers(newUserAnswers)

    if (selectedAnswer === trivia.preguntas[currentQuestion].respuesta_correcta) {
      setScore(score + 1)
    }

    if (currentQuestion + 1 < trivia.preguntas.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      finishTrivia(newUserAnswers)
    }
  }

  const finishTrivia = async (finalUserAnswers) => {
    try {
      await setDoc(
        doc(db, "respuestasUsuarios", studentCI),
        {
          [selectedDate.replace(/-/g, "")]: {
            respuestas: finalUserAnswers,
            puntaje: score,
          },
        },
        { merge: true },
      )

      onTriviaComplete(score)

      toast.success(`¡Trivia completada! Tu puntaje: ${score}/${trivia.preguntas.length}`)
      setTriviaStarted(false)
    } catch (error) {
      console.error("Error al finalizar la trivia:", error)
      toast.error("Error al guardar los resultados de la trivia")
    }
  }

  if (loading) {
    return <div>Cargando trivia...</div>
  }

  if (!triviaStarted) {
    return (
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-2xl backdrop-filter backdrop-blur-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6">Seleccionar Trivia</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded mb-4"
        />
        <button
          onClick={fetchTrivia}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Comenzar Trivia
        </button>
      </motion.div>
    )
  }

  const currentQuestionData = trivia.preguntas[currentQuestion]

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-2xl backdrop-filter backdrop-blur-lg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{trivia.titulo}</h2>
        <FaQuestionCircle className="text-3xl text-blue-500" />
      </div>
      <div className="mb-4">
        <p className="text-lg font-semibold mb-2">
          Pregunta {currentQuestion + 1} de {trivia.preguntas.length}
        </p>
        <p className="text-xl">{currentQuestionData.pregunta}</p>
      </div>
      <div className="space-y-2">
        {currentQuestionData.opciones.map((opcion, index) => (
          <motion.button
            key={index}
            className={`w-full p-3 text-left rounded-lg ${
              selectedAnswer === index ? "bg-blue-600" : "bg-gray-700"
            } hover:bg-blue-500 transition-colors`}
            onClick={() => handleAnswer(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {opcion}
          </motion.button>
        ))}
      </div>
      <motion.button
        className="mt-6 w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-500"
        onClick={handleNextQuestion}
        disabled={selectedAnswer === null}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentQuestion + 1 < trivia.preguntas.length ? "Siguiente Pregunta" : "Finalizar Trivia"}
      </motion.button>
    </motion.div>
  )
}

