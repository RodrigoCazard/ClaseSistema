"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaArrowLeft, FaCoins, FaSave, FaEdit, FaTrophy } from "react-icons/fa"

import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors, neoBrutalStyles } from "@/styles/neobrutalism"

import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const profileSchema = z.object({
  favoriteMovie: z.string(),
  favoriteHobby: z.string(),
  favoriteSportTeam: z.string(),
  favoriteMusic: z.string(),
  favoriteGame: z.string(),
  additionalInfo: z.string(),  // Campo adicional
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
        const newPoints = currentData.puntos + PROFILE_POINTS_REWARD

        // Registrar el movimiento de puntos
        const movementRef = doc(collection(db, "movimientos"))
        await updateDoc(studentRef, {
          ...data,
          puntos: newPoints,
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
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-start p-8 relative overflow-hidden`}
    >
      <NeoBrutalCard className="w-full max-w-4xl relative mt-16">
        <NeoBrutalButton
          onClick={() => router.push("/dashboard")}
          className={`absolute top-4 left-4 bg-[${neoBrutalColors.accent2}] text-white`}
        >
          <FaArrowLeft />
        </NeoBrutalButton>
        <h1 className="text-3xl font-black mb-6 text-center">INFORMACIÓN DEL ESTUDIANTE</h1>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            {userData?.nombreCompleto || "Nombre no especificado"} (CI: {userData?.ci})
          </h2>
          <div className="flex items-center justify-center">
            <FaCoins className="text-[${neoBrutalColors.accent1}] mr-2" />
            <span className="text-xl">puntos actuales: {userData?.puntos}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Perfil Personal</h3>
            {!isEditing && (
              <NeoBrutalButton
                onClick={() => setIsEditing(true)}
                className={`bg-[${neoBrutalColors.accent1}] text-black`}
              >
                <FaEdit className="mr-2" />
                Editar Perfil
              </NeoBrutalButton>
            )}
          </div>

          {!userData?.perfilCompletado && !isEditing && (
            <NeoBrutalCard className="mb-4 flex items-center gap-4 bg-[${neoBrutalColors.accent2}]">
              <FaTrophy className="text-[${neoBrutalColors.accent1}] text-2xl" />
              <div>
                <p className="font-semibold">¡Completa tu perfil y gana {PROFILE_POINTS_REWARD} puntos!</p>
                <p className="text-sm text-gray-700">Comparte tus gustos y preferencias con tus compañeros.</p>
              </div>
            </NeoBrutalCard>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* ... (keep the existing form fields, but use NeoBrutalInput instead of regular input) */}
              <div className="flex justify-end gap-4">
                <NeoBrutalButton
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    reset()
                  }}
                  className="bg-[${neoBrutalColors.background}] text-black"
                >
                  Cancelar
                </NeoBrutalButton>
                <NeoBrutalButton type="submit" className={`bg-[${neoBrutalColors.accent1}] text-black`}>
                  <FaSave className="mr-2" />
                  Guardar
                </NeoBrutalButton>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileItem label="Película Favorita" value={userData?.favoriteMovie} icon="🎬" />
              <ProfileItem label="Pasatiempo" value={userData?.favoriteHobby} icon="⭐" />
              <ProfileItem label="Equipo favorito" value={userData?.favoriteSportTeam} icon="⚽" />
              <ProfileItem label="Música Favorita" value={userData?.favoriteMusic} icon="🎵" />
              <ProfileItem label="Juego Favorito" value={userData?.favoriteGame} icon="🎮" />
              <ProfileItem label="Algo más que te gustaría compartir" value={userData?.additionalInfo} icon="📝" />
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-4">Historial de Movimientos</h3>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`w-full text-left ${neoBrutalStyles.table}`}>
              <thead>
                <tr className={neoBrutalStyles.tableHeader}>
                  <th className="py-2 px-4">Fecha</th>
                  <th className="py-2 px-4">Tipo</th>
                  <th className="py-2 px-4">puntos</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={neoBrutalStyles.tableCell}>
                    <td className="py-2 px-4">{transaction.fecha.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      {transaction.tipo === "perfil" ? "Completar Perfil" : transaction.ganados ? "Ganado" : "Gastado"}
                    </td>
                    <td
                      className={`py-2 px-4 ${transaction.ganados ? "text-[${neoBrutalColors.accent1}]" : "text-[${neoBrutalColors.accent2}]"}`}
                    >
                      {transaction.ganados ? "+" : "-"}
                      {transaction.puntos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-700">No hay movimientos registrados.</p>
        )}
      </NeoBrutalCard>
    </div>
  )
}

function ProfileItem({ label, value, icon }) {
  return (
    <NeoBrutalCard className="p-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <p className="text-lg">{value || "No especificado"}</p>
    </NeoBrutalCard>
  )
}
