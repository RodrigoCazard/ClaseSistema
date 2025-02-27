"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaPlus, FaToggleOn, FaToggleOff, FaEdit, FaArrowLeft } from "react-icons/fa"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminAddTrivia from "@/components/AdminAddTrivia"
import toast from "react-hot-toast"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors, neoBrutalStyles } from "@/styles/neobrutalism"

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
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-start p-8 relative overflow-hidden`}
    >
      <NeoBrutalButton
        onClick={() => router.push("/admin/dashboard")}
        className={`absolute top-8 left-8 bg-[${neoBrutalColors.accent2}] text-white`}
      >
        <FaArrowLeft />
      </NeoBrutalButton>
      <NeoBrutalCard className="w-full max-w-4xl relative mt-16">
        <h1 className="text-3xl font-black mb-8 text-center">Gestión de Trivias</h1>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trivias Disponibles</h2>
            <NeoBrutalButton onClick={() => setShowAddTrivia(true)} className={`bg-[${neoBrutalColors.accent1}]`}>
              <FaPlus />
            </NeoBrutalButton>
          </div>
          {loading ? (
            <p>Cargando trivias...</p>
          ) : (
            <ul className="space-y-4">
              {trivias.map((trivia) => (
                <li key={trivia.id} className={`flex items-center justify-between ${neoBrutalStyles.card}`}>
                  <span>
                    {trivia.titulo} - {trivia.fecha}
                  </span>
                  <div className="flex items-center space-x-2">
                    <NeoBrutalButton
                      onClick={() => toggleTriviaStatus(trivia.id, trivia.activo)}
                      className={
                        trivia.activo ? `bg-[${neoBrutalColors.accent1}]` : `bg-[${neoBrutalColors.background}]`
                      }
                    >
                      {trivia.activo ? (
                        <FaToggleOn className="text-white text-xl" />
                      ) : (
                        <FaToggleOff className="text-white text-xl" />
                      )}
                    </NeoBrutalButton>
                    <NeoBrutalButton onClick={() => setEditingTrivia(trivia)} className="bg-[#FF8A65]">
                      <FaEdit className="text-white" />
                    </NeoBrutalButton>
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
      </NeoBrutalCard>
    </div>
  )
}

