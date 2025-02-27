"use client"

import React, { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, setDoc, doc, getDocs, updateDoc, deleteDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaAward,
  FaTrophy,
  FaCrown,
  FaStar,
  FaMedal,
  FaGem,
  FaUserGraduate,
  FaChartLine,
  FaLightbulb,
  FaEdit,
  FaTrash,
} from "react-icons/fa"
import toast from "react-hot-toast"
import { NeoBrutalButton, NeoBrutalInput, NeoBrutalCard, neoBrutalColors, neoBrutalStyles } from "@/styles/neobrutalism"

const iconComponents = {
  FaAward,
  FaTrophy,
  FaCrown,
  FaStar,
  FaMedal,
  FaGem,
  FaUserGraduate,
  FaChartLine,
  FaLightbulb,
}

export default function GestionMedallas() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [points, setPoints] = useState(0)
  const [icon, setIcon] = useState("FaAward")
  const [criteria, setCriteria] = useState("")
  const [custom, setCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [medals, setMedals] = useState([])
  const [editingMedal, setEditingMedal] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchMedals()
  }, [])

  const fetchMedals = async () => {
    try {
      const medalsCollection = collection(db, "medallas")
      const medalsSnapshot = await getDocs(medalsCollection)
      const medalsList = medalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setMedals(medalsList)
    } catch (error) {
      console.error("Error fetching medals:", error)
      toast.error("Error al cargar las medallas")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const medalId = name.toLowerCase().replace(/\s+/g, "_")
    const medalData = {
      icon,
      name,
      puntos: points,
      criterio: custom ? null : criteria ? JSON.parse(criteria) : {},
      custom,
      description,
    }

    try {
      if (editingMedal) {
        await updateDoc(doc(db, "medallas", editingMedal.id), medalData)
        toast.success("Medalla actualizada exitosamente")
      } else {
        await setDoc(doc(db, "medallas", medalId), medalData)
        toast.success("Medalla agregada exitosamente")
      }
      resetForm()
      fetchMedals()
    } catch (error) {
      console.error("Error al guardar la medalla:", error)
      toast.error("Ocurrió un error al guardar la medalla. Intenta nuevamente.")
    }

    setLoading(false)
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPoints(0)
    setIcon("FaAward")
    setCriteria("")
    setCustom(false)
    setEditingMedal(null)
  }

  const handleEdit = (medal) => {
    setEditingMedal(medal)
    setName(medal.name)
    setDescription(medal.description)
    setPoints(medal.puntos)
    setIcon(medal.icon)
    setCriteria(medal.criterio ? JSON.stringify(medal.criterio) : "")
    setCustom(medal.custom)
  }

  const handleDelete = async (medalId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta medalla?")) {
      try {
        await deleteDoc(doc(db, "medallas", medalId))
        toast.success("Medalla eliminada exitosamente")
        fetchMedals()
      } catch (error) {
        console.error("Error deleting medal:", error)
        toast.error("Error al eliminar la medalla")
      }
    }
  }

  const generateRandomMedals = async () => {
    const icons = Object.keys(iconComponents)
    const criteriaOptions = [
      { total_points: 500 },
      { total_points: 1000 },
      { total_points: 2500 },
      { level: "beginner" },
      { level: "intermediate" },
      { level: "advanced" },
      { trivia_wins: 5 },
      { trivia_wins: 10 },
      { la_isla_rounds: 10 },
      { la_isla_rounds: 25 },
    ]

    for (let i = 0; i < 15; i++) {
      const randomMedal = {
        icon: icons[Math.floor(Math.random() * icons.length)],
        name: `Medalla Aleatoria ${i + 1}`,
        puntos: Math.floor(Math.random() * 500) + 100,
        criterio: criteriaOptions[Math.floor(Math.random() * criteriaOptions.length)],
        custom: Math.random() < 0.2, // 20% chance of being custom
        description: `Esta es una medalla aleatoria generada para pruebas.`,
      }

      const medalId = `random_medal_${Date.now()}_${i}`
      await setDoc(doc(db, "medallas", medalId), randomMedal)
    }

    toast.success("Se han generado 15 medallas aleatorias")
    fetchMedals()
  }

  return (
    <div className={`min-h-screen bg-[${neoBrutalColors.background}] text-black p-6`}>
      <NeoBrutalCard className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">
          {editingMedal ? "Editar Medalla" : "Agregar Nueva Medalla"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nombre de la Medalla
              </label>
              <NeoBrutalInput
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="points" className="block text-sm font-medium mb-2">
                Puntos
              </label>
              <NeoBrutalInput
                type="number"
                id="points"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={`${neoBrutalStyles.input} w-full`}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="icon" className="block text-sm font-medium mb-2">
                Icono
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(iconComponents).map(([iconName, IconComponent]) => (
                  <NeoBrutalButton
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 ${icon === iconName ? `bg-[${neoBrutalColors.accent1}]` : `bg-[${neoBrutalColors.card}]`}`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </NeoBrutalButton>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="criteria" className="block text-sm font-medium mb-2">
                Criterios
              </label>
              <select
                id="criteria"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                disabled={custom}
                className={`${neoBrutalStyles.input} w-full ${custom ? "opacity-50" : ""}`}
              >
                <option value="">Seleccionar criterio</option>
                <option value='{"total_points": 500}'>Total de puntos: 500</option>
                <option value='{"total_points": 1000}'>Total de puntos: 1000</option>
                <option value='{"total_points": 2500}'>Total de puntos: 2500</option>
                <option value='{"level": "beginner"}'>Nivel: Principiante</option>
                <option value='{"level": "intermediate"}'>Nivel: Intermedio</option>
                <option value='{"level": "advanced"}'>Nivel: Avanzado</option>
                <option value='{"trivia_wins": 5}'>Victorias en Trivia: 5</option>
                <option value='{"trivia_wins": 10}'>Victorias en Trivia: 10</option>
                <option value='{"la_isla_rounds": 10}'>Rondas en La Isla: 10</option>
                <option value='{"la_isla_rounds": 25}'>Rondas en La Isla: 25</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="custom"
              checked={custom}
              onChange={(e) => setCustom(e.target.checked)}
              className={neoBrutalStyles.checkbox}
            />
            <label htmlFor="custom" className="ml-2 block text-sm">
              Medalla personalizada (activación manual)
            </label>
          </div>
          <NeoBrutalButton
            type="button"
            onClick={generateRandomMedals}
            className={`w-full bg-[${neoBrutalColors.accent2}] text-white`}
          >
            Generar 15 Medallas Aleatorias
          </NeoBrutalButton>
          <NeoBrutalButton
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Guardando..." : editingMedal ? "Actualizar Medalla" : "Agregar Medalla"}
          </NeoBrutalButton>
        </form>
      </NeoBrutalCard>

      <NeoBrutalCard className="max-w-4xl mx-auto mt-8">
        <h2 className="text-3xl font-bold text-center mb-6">Medallas Existentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {medals.map((medal) => (
              <motion.div
                key={medal.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`${neoBrutalStyles.card} bg-[${neoBrutalColors.card}]`}
              >
                <div className="flex items-center justify-between mb-2">
                  {iconComponents[medal.icon] &&
                    React.createElement(iconComponents[medal.icon], { className: "h-6 w-6 text-black" })}
                  <div className="flex space-x-2">
                    <NeoBrutalButton onClick={() => handleEdit(medal)} className="p-1 bg-[#FF8A65]">
                      <FaEdit className="h-4 w-4" />
                    </NeoBrutalButton>
                    <NeoBrutalButton
                      onClick={() => handleDelete(medal.id)}
                      className={`p-1 bg-[${neoBrutalColors.background}]`}
                    >
                      <FaTrash className="h-4 w-4" />
                    </NeoBrutalButton>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">{medal.name}</h3>
                <p className="text-sm text-gray-700 mb-2">{medal.description}</p>
                <p className="text-sm">Puntos: {medal.puntos}</p>
                {medal.custom ? (
                  <p className="text-sm font-bold">Medalla personalizada</p>
                ) : (
                  <p className="text-sm font-bold">Medalla automática</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </NeoBrutalCard>
    </div>
  )
}

