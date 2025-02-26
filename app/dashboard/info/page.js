"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft, FaCoins, FaSave, FaEdit, FaTrophy } from "react-icons/fa"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const profileSchema = z.object({
  favoriteMovie: z.string().min(1, "Este campo es requerido"),
  favoriteHobby: z.string().min(1, "Este campo es requerido"),
  favoriteSportTeam: z.string().min(1, "Este campo es requerido"),
  favoriteMusic: z.string().min(1, "Este campo es requerido"),
  favoriteGame: z.string().min(1, "Este campo es requerido"),
  additionalInfo: z.string().optional(),  // Campo adicional
})

const PROFILE_POINTS_REWARD = 50

export default function StudentInfoPage() {
  const [userData, setUserData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData")
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData)
      setUserData(parsedUserData)
      fetchStudentData(parsedUserData.ci)
      fetchTransactions(parsedUserData.ci)
    } else {
      router.push("/")
    }
  }, [router])

  const fetchStudentData = async (ci) => {
    try {
      const studentDoc = await getDoc(doc(db, "estudiantes", ci))
      if (studentDoc.exists()) {
        const data = studentDoc.data()
        reset({
          favoriteMovie: data.favoriteMovie || "",
          favoriteHobby: data.favoriteHobby || "",
          dreamJob: data.dreamJob || "",
          favoriteMusic: data.favoriteMusic || "",
          favoriteGame: data.favoriteGame || "",
        })
        setUserData((prev) => ({
          ...prev,
          ...data,
        }))
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Error al cargar los datos del estudiante")
    }
  }

  const fetchTransactions = async (ci) => {
    try {
      const q = query(collection(db, "movimientos"), where("ci", "==", ci), orderBy("fecha", "desc"))
      const querySnapshot = await getDocs(q)
      const transactionList = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha.toDate(),
        }
      })
      setTransactions(transactionList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Error al cargar los movimientos")
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const studentRef = doc(db, "estudiantes", userData.ci)
      const studentDoc = await getDoc(studentRef)
      const currentData = studentDoc.data()

      // Si el perfil no estaba completado anteriormente, otorgar puntos
      if (!currentData.perfilCompletado) {
        // Actualizar puntos
        const newPoints = currentData.Puntos + PROFILE_POINTS_REWARD

        // Registrar el movimiento de puntos
        const movementRef = doc(collection(db, "movimientos"))
        await updateDoc(studentRef, {
          ...data,
          Puntos: newPoints,
          perfilCompletado: true,
        })
        await setDoc(movementRef, {
          ci: userData.ci,
          fecha: new Date(),
          ganados: true,
          puntos: PROFILE_POINTS_REWARD,
          tipo: "perfil",
        })

        // Actualizar el estado local y localStorage
        setUserData((prev) => {
          const updated = {
            ...prev,
            ...data,
            puntos: newPoints,
            perfilCompletado: true,
          }
          localStorage.setItem("userData", JSON.stringify(updated))
          return updated
        })

        toast.success(`¡Perfil completado! Has ganado ${PROFILE_POINTS_REWARD} puntos`)
      } else {
        // Solo actualizar los datos del perfil
        await updateDoc(studentRef, {
          ...data,
        })
        setUserData((prev) => {
          const updated = {
            ...prev,
            ...data,
          }
          localStorage.setItem("userData", JSON.stringify(updated))
          return updated
        })
        toast.success("Perfil actualizado correctamente")
      }

      setIsEditing(false)
      fetchTransactions(userData.ci)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error al actualizar el perfil")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>
        <h1 className="text-3xl font-bold mb-6 text-center">Información del Estudiante</h1>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            {userData?.nombreCompleto || "Nombre no especificado"} (CI: {userData?.ci})
          </h2>
          <div className="flex items-center justify-center">
            <FaCoins className="text-yellow-500 mr-2" />
            <span className="text-xl">Puntos actuales: {userData?.puntos}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Perfil Personal</h3>
            {!isEditing && (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEdit />
                Editar Perfil
              </motion.button>
            )}
          </div>

          {!userData?.perfilCompletado && !isEditing && (
            <motion.div
              className="bg-blue-500/20 p-4 rounded-lg mb-4 flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaTrophy className="text-yellow-500 text-2xl" />
              <div>
                <p className="font-semibold">¡Completa tu perfil y gana {PROFILE_POINTS_REWARD} puntos!</p>
                <p className="text-sm text-gray-300">Comparte tus gustos y preferencias con tus compañeros.</p>
              </div>
            </motion.div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Película Favorita</label>
                  <input
                    {...register("favoriteMovie")}
                    className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: El Padrino"
                  />
                  {errors.favoriteMovie && <p className="text-red-500 text-sm mt-1">{errors.favoriteMovie.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pasatiempo Favorito</label>
                  <input
                    {...register("favoriteHobby")}
                    className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Jugar fútbol"
                  />
                  {errors.favoriteHobby && <p className="text-red-500 text-sm mt-1">{errors.favoriteHobby.message}</p>}
                </div>
                <div>
        <label className="block text-sm font-medium mb-1">Equipo de Fútbol o Otro Deporte</label> {/* Cambiado */}
        <input
          {...register("favoriteSportTeam")}
          className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Real Madrid o Miami Heat"
        />
        {errors.favoriteSportTeam && <p className="text-red-500 text-sm mt-1">{errors.favoriteSportTeam.message}</p>} {/* Nuevo campo de error */}
      </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Música Favorita</label>
                  <input
                    {...register("favoriteMusic")}
                    className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Rock"
                  />
                  {errors.favoriteMusic && <p className="text-red-500 text-sm mt-1">{errors.favoriteMusic.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Juego Favorito</label>
                  <input
                    {...register("favoriteGame")}
                    className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Minecraft"
                  />
                  {errors.favoriteGame && <p className="text-red-500 text-sm mt-1">{errors.favoriteGame.message}</p>}
                </div>
                <div>
  <label className="block text-sm font-medium mb-1">Algo más que te gustaría compartir</label>
  <input
    {...register("additionalInfo")}
    className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Ej: Me encanta aprender cosas nuevas"
  />
</div>
              </div>
              <div className="flex justify-end gap-4">
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    reset()
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSave />
                  Guardar
                </motion.button>
              </div>
            </form>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ProfileItem label="Película Favorita" value={userData?.favoriteMovie} icon="🎬" />
              <ProfileItem label="Pasatiempo" value={userData?.favoriteHobby} icon="⭐" />
              <ProfileItem label="Equipo favorito" value={userData?.favoriteSportTeam} icon="⚽" /> {/* Mostramos el nuevo campo */}
              <ProfileItem label="Música Favorita" value={userData?.favoriteMusic} icon="🎵" />
              <ProfileItem label="Juego Favorito" value={userData?.favoriteGame} icon="🎮" />
              <ProfileItem label="Algo más que te gustaría compartir" value={userData?.additionalInfo} icon="📝" />

            </motion.div>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-4">Historial de Movimientos</h3>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 px-4">Fecha</th>
                  <th className="py-2 px-4">Tipo</th>
                  <th className="py-2 px-4">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700">
                    <td className="py-2 px-4">{transaction.fecha.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      {transaction.tipo === "perfil" ? "Completar Perfil" : transaction.ganados ? "Ganado" : "Gastado"}
                    </td>
                    <td className={`py-2 px-4 ${transaction.ganados ? "text-green-500" : "text-red-500"}`}>
                      {transaction.ganados ? "+" : "-"}
                      {transaction.puntos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-400">No hay movimientos registrados.</p>
        )}
      </motion.div>
    </div>
  )
}

function ProfileItem({ label, value, icon }) {
  return (
    <motion.div className="bg-gray-700/50 p-4 rounded-lg" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-lg">{value || "No especificado"}</p>
    </motion.div>
  )
}

