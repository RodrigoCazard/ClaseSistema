"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft } from "react-icons/fa"
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import toast from "react-hot-toast"

export default function TriviaPage() {
  const [trivias, setTrivias] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTrivia, setSelectedTrivia] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [completedTrivias, setCompletedTrivias] = useState([])
  const router = useRouter()

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"))
    if (userData && userData.ci) {
      fetchActiveTrivias(userData.ci)
    } else {
      router.push("/")
    }
  }, [router])

  const fetchActiveTrivias = async (userCI) => {
    setLoading(true)
    try {
      const triviaQuery = query(collection(db, "trivia"), where("activo", "==", true))
      const triviaSnapshot = await getDocs(triviaQuery)
      const triviaList = triviaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Fetch completed trivias for the user
      const userResponsesDoc = await getDoc(doc(db, "respuestasUsuarios", userCI))
      const userResponses = userResponsesDoc.exists() ? userResponsesDoc.data() : {}
      const completedTriviaIds = Object.keys(userResponses)

      setCompletedTrivias(completedTriviaIds)
      setTrivias(triviaList)
    } catch (error) {
      console.error("Error fetching active trivias:", error)
      toast.error("Error al cargar las trivias activas")
    } finally {
      setLoading(false)
    }
  }

  const startTrivia = async (triviaId) => {
    try {
      const triviaDoc = await getDoc(doc(db, "trivia", triviaId))
      if (triviaDoc.exists()) {
        setSelectedTrivia({ id: triviaDoc.id, ...triviaDoc.data() })
        setCurrentQuestion(0)
        setUserAnswers([])
        setScore(0)
      } else {
        toast.error("La trivia seleccionada no existe")
      }
    } catch (error) {
      console.error("Error starting trivia:", error)
      toast.error("Error al iniciar la trivia")
    }
  }

  const handleAnswer = (answerIndex) => {
    const newUserAnswers = [...userAnswers, answerIndex]
    setUserAnswers(newUserAnswers)

    if (answerIndex === selectedTrivia.preguntas[currentQuestion].respuesta_correcta) {
      setScore((prevScore) => prevScore + 1)
    }

    if (currentQuestion + 1 < selectedTrivia.preguntas.length) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishTrivia(newUserAnswers)
    }
  }

  const finishTrivia = async (finalUserAnswers) => {
    const userData = JSON.parse(localStorage.getItem("userData"))
    if (!userData || !userData.ci) {
      toast.error("Error: Datos de usuario no encontrados")
      return
    }

    try {
      const finalScore = finalUserAnswers.reduce((acc, answer, index) => {
        return answer === selectedTrivia.preguntas[index].respuesta_correcta ? acc + 1 : acc
      }, 0)

      await setDoc(
        doc(db, "respuestasUsuarios", userData.ci),
        {
          [selectedTrivia.id]: {
            fecha: new Date().toISOString(),
            respuestas: finalUserAnswers,
            puntaje: finalScore,
          },
        },
        { merge: true },
      )

      // Actualizar los puntos del usuario
      const newPoints = userData.puntos + finalScore
      await setDoc(doc(db, "estudiantes", userData.ci), { Puntos: newPoints }, { merge: true })

      // Actualizar localStorage
      localStorage.setItem("userData", JSON.stringify({ ...userData, puntos: newPoints }))

      toast.success(`¡Trivia completada! Ganaste ${finalScore} puntos.`)
      setSelectedTrivia(null)
      setCompletedTrivias([...completedTrivias, selectedTrivia.id])
    } catch (error) {
      console.error("Error finishing trivia:", error)
      toast.error("Error al finalizar la trivia")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando trivias...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowLeft />
      </motion.button>
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-2xl backdrop-filter backdrop-blur-lg relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {!selectedTrivia ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Trivias Disponibles</h1>
            {trivias.length === 0 ? (
              <p className="text-center">No hay trivias disponibles en este momento.</p>
            ) : (
              <ul className="space-y-4">
                {trivias.map((trivia) => (
                  <li key={trivia.id}>
                    <motion.button
                      onClick={() => startTrivia(trivia.id)}
                      className={`w-full p-4 rounded-lg transition-colors ${
                        completedTrivias.includes(trivia.id)
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      whileHover={completedTrivias.includes(trivia.id) ? {} : { scale: 1.05 }}
                      whileTap={completedTrivias.includes(trivia.id) ? {} : { scale: 0.95 }}
                      disabled={completedTrivias.includes(trivia.id)}
                    >
                      {trivia.titulo} - {trivia.fecha}
                      {completedTrivias.includes(trivia.id) && " (Completada)"}
                    </motion.button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">{selectedTrivia.titulo}</h2>
            <div className="mb-4">
              <p className="text-lg font-semibold">
                Pregunta {currentQuestion + 1} de {selectedTrivia.preguntas.length}
              </p>
              <p className="text-xl mt-2">{selectedTrivia.preguntas[currentQuestion].pregunta}</p>
            </div>
            <div className="space-y-2">
              {selectedTrivia.preguntas[currentQuestion].opciones.map((opcion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {opcion}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

