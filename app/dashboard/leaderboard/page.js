"use client"

import { useRouter } from "next/navigation"
import { FaArrowLeft } from "react-icons/fa"
import Leaderboard from "@/components/Leaderboard"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

export default function LeaderboardPage() {
  const router = useRouter()

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

        <h1 className="text-3xl font-black mb-6 text-center">🏆 TABLA DE CLASIFICACIÓN</h1>

        <Leaderboard />
      </NeoBrutalCard>
    </div>
  )
}

