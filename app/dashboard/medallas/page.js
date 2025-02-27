"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaAward,
  FaCrown,
  FaGem,
  FaShieldAlt,
  FaRocket,
  FaBrain,
  FaLock,
  FaArrowLeft,
  FaUnlock,
} from "react-icons/fa"
import { collection, doc, getDoc, updateDoc, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

const iconComponents = {
  FaTrophy,
  FaMedal,
  FaStar,
  FaAward,
  FaCrown,
  FaGem,
  FaShieldAlt,
  FaRocket,
  FaBrain,
}

export default function MedallasSystem() {
  const [userMedallas, setUserMedallas] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const storedUserData = localStorage.getItem("userData")
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData)
        setUserData(parsedUserData)

        const userDoc = await getDoc(doc(db, "estudiantes", parsedUserData.ci))
        let userDataFromDB = {}
        if (userDoc.exists()) {
          userDataFromDB = userDoc.data()
          setUserData((prevData) => ({ ...prevData, ...userDataFromDB }))
        }

        const medallasSnapshot = await getDocs(collection(db, "medallas"))
        const medallasData = medallasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const userMedallasData = userDataFromDB.medallas || {}

        const processedMedallas = medallasData.map((medalla) => ({
          ...medalla,
          unlocked: userMedallasData[medalla.id] ? true : false,
          unlockDate: userMedallasData[medalla.id]
            ? userMedallasData[medalla.id] instanceof Timestamp
              ? userMedallasData[medalla.id]
              : new Timestamp(userMedallasData[medalla.id].seconds, userMedallasData[medalla.id].nanoseconds)
            : null,
          clickable: medalla.custom && !userMedallasData[medalla.id],
        }))

        setUserMedallas(processedMedallas)
      } else {
        toast.error("No se encontraron datos de usuario. Por favor, inicia sesión.")
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar las medallas. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!userData || !userMedallas.length) return

    const checkAutomaticMedallas = () => {
      const updatedMedallas = userMedallas.map((medalla) => {
        if (medalla.custom || medalla.unlocked) return medalla

        let unlocked = false
        if (medalla.criterio) {
          const criterio = medalla.criterio
          if (criterio.total_points && userData.puntos >= criterio.total_points) {
            unlocked = true
          } else if (criterio.trivia_wins && userData.triviasCompleted >= criterio.trivia_wins) {
            unlocked = true
          }
          // Add more criteria checks here as needed
        }

        return { ...medalla, unlocked, clickable: false }
      })

      if (JSON.stringify(updatedMedallas) !== JSON.stringify(userMedallas)) {
        setUserMedallas(updatedMedallas)
      }
    }

    checkAutomaticMedallas()
  }, [userData, userMedallas])

  const handleUnlock = async (id, puntos) => {
    try {
      const userRef = doc(db, "estudiantes", userData.ci)
      const unlockDate = Timestamp.now()
      await updateDoc(userRef, {
        [`medallas.${id}`]: unlockDate,
        puntos: userData.puntos + puntos,
      })

      setUserMedallas((prev) =>
        prev.map((medalla) =>
          medalla.id === id ? { ...medalla, unlocked: true, clickable: false, unlockDate } : medalla,
        ),
      )

      setUserData((prev) => ({
        ...prev,
        puntos: prev.puntos + puntos,
        [`medallas.${id}`]: unlockDate,
      }))

      toast.success(`¡Medalla desbloqueada! Has ganado ${puntos} puntos.`)
    } catch (error) {
      console.error("Error unlocking medal:", error)
      toast.error("Error al desbloquear la medalla. Por favor, intenta de nuevo.")
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className={`min-h-screen bg-[${neoBrutalColors.background}] text-black p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <NeoBrutalButton
            onClick={() => router.push("/dashboard")}
            className={`bg-[${neoBrutalColors.accent2}] text-black font-black flex items-center gap-2`}
          >
            <FaArrowLeft />
            Volver al Dashboard
          </NeoBrutalButton>
          <h2 className="text-3xl font-black text-center">🏆 Medallas</h2>
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>
        <p className={`text-xl text-[${neoBrutalColors.accent1}] mb-6 text-center font-black`}>
          ⭐ puntos: {userData?.puntos || 0}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {userMedallas.map((medalla) => (
              <motion.div
                key={medalla.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <NeoBrutalCard
                  className={`flex flex-col justify-between items-center text-center h-full ${
                    medalla.unlocked
                      ? `bg-green-300`
                      : medalla.clickable
                        ? `bg-[${neoBrutalColors.accent1}] cursor-pointer`
                        : `bg-[${neoBrutalColors.accent2}]`
                  }`}
                  onClick={() => medalla.clickable && handleUnlock(medalla.id, medalla.puntos)}
                >
                  <motion.div
                    className="flex flex-col items-center space-y-4"
                    initial={false}
                    animate={medalla.unlocked ? { rotateY: 360 } : { rotateY: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-5xl mb-2 relative">
                      {medalla.unlocked ? (
                        iconComponents[medalla.icon] &&
                        React.createElement(iconComponents[medalla.icon], {
                          className: `text-[${neoBrutalColors.accent1}]`,
                        })
                      ) : (
                        <>
                          <FaLock className="text-gray-700" />
                          {medalla.clickable && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                            >
                              <FaUnlock className={`text-[${neoBrutalColors.accent2}]`} />
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                    <h3 className="font-black text-lg">{medalla.name}</h3>
                    <p className="text-sm">{medalla.description}</p>
                  </motion.div>
                  <div className="mt-4">
                    {medalla.unlocked ? (
                      <motion.span
                        className={`text-sm text-[${neoBrutalColors.accent1}] font-bold`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        ¡Desbloqueada!
                        <br />
                        <span className="text-xs">
                          {medalla.unlockDate instanceof Timestamp
                            ? medalla.unlockDate.toDate().toLocaleDateString()
                            : "Fecha no disponible"}
                        </span>
                      </motion.span>
                    ) : (
                      <motion.span
                        className="text-sm"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {medalla.puntos} puntos
                        {medalla.clickable && (
                          <motion.div
                            className={`mt-2 text-[${neoBrutalColors.accent2}]`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                          >
                            Click para desbloquear
                          </motion.div>
                        )}
                      </motion.span>
                    )}
                  </div>
                </NeoBrutalCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

