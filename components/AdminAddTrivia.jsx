"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { FaPlus, FaTrash } from "react-icons/fa"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"

const questionSchema = z.object({
  id: z.number(),
  pregunta: z.string().min(1, "La pregunta es requerida"),
  opciones: z.array(z.string()).length(4, "Debe haber exactamente 4 opciones"),
  respuesta_correcta: z.number().min(0, "Debe seleccionar la respuesta correcta"),
})

const triviaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  titulo: z.string().min(1, "El título es requerido"),
  preguntas: z
    .array(questionSchema)
    .min(1, "Debe haber al menos una pregunta")
    .max(3, "No puede haber más de 3 preguntas"),
  activo: z.boolean(),
})

export default function AdminAddTrivia({ trivia, onTriviaAdded, onTriviaUpdated, onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(triviaSchema),
    defaultValues: trivia || {
      fecha: new Date().toISOString().split("T")[0],
      titulo: "Trivia del día",
      preguntas: [{ id: 1, pregunta: "", opciones: ["", "", "", ""], respuesta_correcta: 0 }],
      activo: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "preguntas",
  })

  useEffect(() => {
    if (trivia) {
      reset(trivia)
    }
  }, [trivia, reset])

  const onSubmit = async (data) => {
    const triviaId = data.fecha.replace(/-/g, "")
    try {
      if (trivia) {
        await updateDoc(doc(db, "trivia", triviaId), data)
        toast.success("Trivia actualizada correctamente")
        onTriviaUpdated()
      } else {
        await setDoc(doc(db, "trivia", triviaId), data)
        toast.success("Trivia agregada correctamente")
        onTriviaAdded()
      }
      reset()
    } catch (error) {
      console.error("Error al agregar/actualizar trivia:", error)
      toast.error("Error al agregar/actualizar la trivia")
    }
  }

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-6">{trivia ? "Editar Trivia" : "Agregar Nueva Trivia"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input {...register("fecha")} type="date" className="w-full p-2 bg-gray-700 rounded" />
        {errors.fecha && <p className="text-red-500">{errors.fecha.message}</p>}

        <input {...register("titulo")} placeholder="Título de la trivia" className="w-full p-2 bg-gray-700 rounded" />
        {errors.titulo && <p className="text-red-500">{errors.titulo.message}</p>}

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
            <input
              {...register(`preguntas.${index}.pregunta`)}
              placeholder="Pregunta"
              className="w-full p-2 bg-gray-600 rounded"
            />
            {errors.preguntas?.[index]?.pregunta && (
              <p className="text-red-500">{errors.preguntas[index].pregunta.message}</p>
            )}

            {[0, 1, 2, 3].map((optionIndex) => (
              <input
                key={optionIndex}
                {...register(`preguntas.${index}.opciones.${optionIndex}`)}
                placeholder={`Opción ${optionIndex + 1}`}
                className="w-full p-2 bg-gray-600 rounded"
              />
            ))}

            <select
              {...register(`preguntas.${index}.respuesta_correcta`, { valueAsNumber: true })}
              className="w-full p-2 bg-gray-600 rounded"
            >
              {[0, 1, 2, 3].map((optionIndex) => (
                <option key={optionIndex} value={optionIndex}>
                  Opción {optionIndex + 1} es correcta
                </option>
              ))}
            </select>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}

        {fields.length < 3 && (
          <button
            type="button"
            onClick={() =>
              append({ id: fields.length + 1, pregunta: "", opciones: ["", "", "", ""], respuesta_correcta: 0 })
            }
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
          >
            <FaPlus className="inline mr-2" /> Agregar Pregunta
          </button>
        )}

        <div className="flex items-center space-x-2">
          <input {...register("activo")} type="checkbox" id="activo" className="form-checkbox h-5 w-5 text-blue-600" />
          <label htmlFor="activo" className="text-white">
            Trivia activa
          </label>
        </div>

        <div className="flex justify-between">
          <button type="submit" className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors">
            {trivia ? "Actualizar Trivia" : "Agregar Trivia"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  )
}

