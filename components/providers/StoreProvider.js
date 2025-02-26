"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Login from "@/components/auth/Login"
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import Popup from "@/components/ui/Popup"

import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export default function StoreProvider() {
  const [ci, setCi] = useState("")
  const [puntos, setPuntos] = useState(null)
  const [message, setMessage] = useState("")
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [puntosGastados, setPuntosGastados] = useState(0)
  const [puntosRestantes, setPuntosRestantes] = useState(0)

  const handleLogin = async (ci) => {
    try {
      const docRef = doc(db, "estudiantes", ci)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        setPuntos(userData.Puntos)
        setCi(ci)
        setUserAuthenticated(true)
        setMessage("")
      } else {
        setMessage("Usuario no encontrado")
        setUserAuthenticated(false)
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setMessage("Error al iniciar sesión. Inténtalo de nuevo.")
      setUserAuthenticated(false)
    }
  }

  const handleGastarPuntos = async (cantidad) => {
    if (puntos !== null && puntos >= cantidad) {
      const newPuntos = puntos - cantidad
      const docRef = doc(db, "estudiantes", ci)

      try {
        await updateDoc(docRef, { Puntos: newPuntos })
        setPuntos(newPuntos)
        setPuntosGastados(cantidad)
        setPuntosRestantes(newPuntos)
        setShowPopup(true)
        setMessage(`Has gastado ${cantidad} puntos.`)
      } catch (error) {
        console.error("Error al gastar puntos:", error)
        setMessage("Error al gastar puntos. Inténtalo de nuevo.")
      }
    } else {
      setMessage("No tienes suficientes puntos para esta acción.")
    }
  }

  const closePopup = () => {
    setShowPopup(false)
  }

  const handleLogout = () => {
    setCi("")
    setPuntos(null)
    setUserAuthenticated(false)
    setMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {!userAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Login onLogin={handleLogin} message={message} />
          </motion.div>
        ) : (
          <StudentDashboard
            ci={ci}
            puntos={puntos}
            message={message}
            onLogout={handleLogout}
            onGastarPuntos={handleGastarPuntos}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && <Popup puntosGastados={puntosGastados} puntosRestantes={puntosRestantes} onClose={closePopup} />}
      </AnimatePresence>
    </div>
  )
}

