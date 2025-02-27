"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion } from "framer-motion"
import { NeoBrutalCard, neoBrutalColors, neoBrutalStyles } from "@/styles/neobrutalism"

const Leaderboard = () => {
  const [estudiantes, setEstudiantes] = useState([])
  const [loggedInStudent, setLoggedInStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const storedUserData = localStorage.getItem("userData")
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData)
          setLoggedInStudent(parsedUserData)
        }

        const q = query(collection(db, "estudiantes"), orderBy("Puntos", "desc"))
        const querySnapshot = await getDocs(q)
        const estudiantesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData)
          const estudianteIndex = estudiantesList.findIndex((e) => e.id === parsedUserData.ci)
          if (estudianteIndex !== -1) {
            parsedUserData.posicion = estudianteIndex + 1
            setLoggedInStudent(parsedUserData)
          }
        }

        setEstudiantes(estudiantesList.slice(0, 3))
      } catch (error) {
        console.error("Error fetching estudiantes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEstudiantes()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-700">Cargando...</p>
  }

  return (
    <div>
      {/* Top 3 */}
      <div className="space-y-4 mb-8">
        {estudiantes.map((estudiante, index) => (
          <motion.div
            key={estudiante.id}
            className={`${neoBrutalStyles.card} flex items-center justify-between ${
              index === 0
                ? `bg-[${neoBrutalColors.accent1}]`
                : index === 1
                  ? `bg-[${neoBrutalColors.accent2}]`
                  : `bg-[${neoBrutalColors.background}]`
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
              <span className="text-black font-bold">{estudiante.nombreCompleto || "Anónimo"}</span>
            </div>
            <span className="text-black font-bold">Top {index + 1}</span>
          </motion.div>
        ))}
      </div>

      {/* Posición del estudiante logueado */}
      {loggedInStudent && (
        <NeoBrutalCard className={`bg-[${neoBrutalColors.accent1}]`}>
          <div className="flex items-center justify-between">
            <span className="text-black font-bold">Tu posición:</span>
            <span className="text-black font-bold">#{loggedInStudent.posicion || "N/A"}</span>
          </div>
        </NeoBrutalCard>
      )}
    </div>
  )
}

export default Leaderboard

