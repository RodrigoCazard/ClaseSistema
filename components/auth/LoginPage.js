"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSignInAlt, FaUserCog } from "react-icons/fa"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { NeoBrutalButton, NeoBrutalInput, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

const schema = z.object({
  ci: z.string().min(5, "El CI debe tener al menos 5 caracteres"),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const docRef = doc(db, "estudiantes", data.ci)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        localStorage.setItem("userData", JSON.stringify({ ci: data.ci, puntos: userData.Puntos }))

        window.dispatchEvent(new Event("storage"))

        toast.success("Inicio de sesión exitoso")
        router.push("/dashboard")
      } else {
        toast.error("Usuario no encontrado")
      }
    } catch (error) {
      toast.error("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    router.push("/admin/login")
  }

  return (
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-center p-8 relative overflow-hidden`}
    >
      <NeoBrutalCard className="w-full max-w-lg relative">
        <NeoBrutalButton
          onClick={handleAdminLogin}
          className={`absolute top-4 right-4 bg-[${neoBrutalColors.accent2}] text-white`}
        >
          <FaUserCog />
        </NeoBrutalButton>
        <div className="flex items-center justify-center mb-6">
          <FaSignInAlt className={`text-3xl text-[${neoBrutalColors.accent1}] mr-2`} />
          <h1 className="text-2xl font-black">INICIAR SESIÓN CON CI</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <NeoBrutalInput {...register("ci")} type="text" placeholder="Ingresa tu CI" className="w-full mb-4" />
          {errors.ci && <p className="text-red-500 mb-4 font-bold">{errors.ci.message}</p>}
          <NeoBrutalButton
            type="submit"
            disabled={loading}
            className={`w-full bg-[${neoBrutalColors.accent1}] text-black ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </NeoBrutalButton>
        </form>
      </NeoBrutalCard>
    </div>
  )
}

