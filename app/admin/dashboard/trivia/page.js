"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaPlus, FaToggleOn, FaToggleOff, FaEdit, FaArrowLeft } from "react-icons/fa"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminAddTrivia from "@/components/AdminAddTrivia"
import toast from "react-hot-toast"

export default function TriviaDashboardPage() {
  const [trivias, setTrivias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTrivia, setShowAddTrivia] = useState(false)
  const [editingTrivia, setEditingTrivia] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
    } else {
      fetchTrivias()
    }
  }, [router])

  const fetchTrivias = async () => {
    setLoading(true)
    try {
      const triviaCollection = collection(db, "trivia")
      const triviaSnapshot = await getDocs(triviaCollection)
      const triviaList = triviaSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTrivias(triviaList)
    } catch (error) {
      console.error("Error fetching trivias:", error)
      toast.error("Error al cargar las trivias")
    } finally {
      setLoading(false)
    }
  }

  const toggleTriviaStatus = async (triviaId, currentStatus) => {
    try {
      const triviaRef = doc(db, "trivia", triviaId)
      await updateDoc(triviaRef, { activo: !currentStatus })
      fetchTrivias()
      toast.success("Estado de la trivia actualizado")
    } catch (error) {
      console.error("Error toggling trivia status:", error)
      toast.error("Error al actualizar el estado de la trivia")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <motion.button
        onClick={() => router.push("/admin/dashboard")}
        className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowLeft />
      </motion.button>
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Trivias</h1>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trivias Disponibles</h2>
            <motion.button
              onClick={() => setShowAddTrivia(true)}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaPlus />
            </motion.button>
          </div>
          {loading ? (
            <p>Cargando trivias...</p>
          ) : (
            <ul className="space-y-4">
              {trivias.map((trivia) => (
                <li key={trivia.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                  <span>
                    {trivia.titulo} - {trivia.fecha}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleTriviaStatus(trivia.id, trivia.activo)}
                      className={`p-2 rounded-full transition-colors ${trivia.activo ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                    >
                      {trivia.activo ? (
                        <FaToggleOn className="text-white text-xl" />
                      ) : (
                        <FaToggleOff className="text-white text-xl" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingTrivia(trivia)}
                      className="bg-yellow-500 p-2 rounded-full hover:bg-yellow-600 transition-colors"
                    >
                      <FaEdit className="text-white" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showAddTrivia && (
          <AdminAddTrivia
            onTriviaAdded={() => {
              fetchTrivias()
              setShowAddTrivia(false)
            }}
            onCancel={() => setShowAddTrivia(false)}
          />
        )}

        {editingTrivia && (
          <AdminAddTrivia
            trivia={editingTrivia}
            onTriviaUpdated={() => {
              fetchTrivias()
              setEditingTrivia(null)
            }}
            onCancel={() => setEditingTrivia(null)}
          />
        )}
      </motion.div>
    </div>
  )
}

