"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSignInAlt, FaArrowLeft } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { NeoBrutalButton, NeoBrutalInput, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

const schema = z.object({
  code: z.string().length(11, "El código de administrador debe tener 11 caracteres"),
})

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    setLoading(true)
    if (data.code === "033-EMS-584") {
      localStorage.setItem("adminAuth", "true")
      toast.success("Inicio de sesión exitoso")
      router.push("/admin/dashboard")
    } else {
      toast.error("Código de administrador incorrecto")
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-screen bg-[${neoBrutalColors.background}] text-black flex flex-col items-center justify-center p-8 relative overflow-hidden`}
    >
      <NeoBrutalCard className="w-full max-w-lg relative">
        <NeoBrutalButton
          onClick={() => router.push("/")}
          className={`absolute top-4 right-4 bg-[${neoBrutalColors.accent2}] text-white`}
        >
          <FaArrowLeft />
        </NeoBrutalButton>
        <div className="flex items-center justify-center mb-6">
          <FaSignInAlt className={`text-3xl text-[${neoBrutalColors.accent1}] mr-2`} />
          <h1 className="text-2xl font-black">ACCESO ADMINISTRATIVO</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <NeoBrutalInput
            {...register("code")}
            type="text"
            placeholder="Ingresa el código de administrador"
            className="w-full mb-4"
          />
          {errors.code && <p className="text-red-500 mb-4 font-bold">{errors.code.message}</p>}
          <NeoBrutalButton
            type="submit"
            disabled={loading}
            className={`w-full bg-[${neoBrutalColors.accent1}] text-black ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Cargando..." : "Iniciar sesión como administrador"}
          </NeoBrutalButton>
        </form>
      </NeoBrutalCard>
    </div>
  )
}

