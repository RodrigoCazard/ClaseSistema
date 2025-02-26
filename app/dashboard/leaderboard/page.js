"use client"; // Asegúrate de que este componente sea de cliente

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import Leaderboard from "@/components/Leaderboard";

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      {/* Contenedor principal */}
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Botón "Atrás" */}
        <motion.button
          onClick={() => router.push("/dashboard")} // Redirige al dashboard
          className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft />
        </motion.button>

        {/* Título del Leaderboard */}
        <h1 className="text-3xl font-bold mb-6 text-center">🏆 Tabla de Clasificación</h1>

        {/* Componente del Leaderboard */}
        <Leaderboard />
      </motion.div>
    </div>
  );
}