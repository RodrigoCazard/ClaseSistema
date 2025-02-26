import { useState } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaMedal, FaStar, FaAward, FaCrown, FaGem, FaShieldAlt, FaRocket, FaBrain } from "react-icons/fa";

const achievements = [
  { id: "first_trivia", name: "Primer Trivia", description: "Completaste tu primera trivia", icon: <FaTrophy className="text-yellow-400" />, unlocked: false, points: 10, clickable: true },
  { id: "perfect_score", name: "Puntaje Perfecto", description: "Obtuviste un puntaje perfecto en una trivia", icon: <FaStar className="text-yellow-400" />, unlocked: false, points: 20, clickable: false },
  { id: "trivia_master", name: "Maestro de Trivias", description: "Completaste 10 trivias", icon: <FaMedal className="text-yellow-400" />, unlocked: false, points: 50, clickable: false },
  { id: "legend", name: "Leyenda del Conocimiento", description: "Respondiste 50 trivias correctamente", icon: <FaAward className="text-yellow-400" />, unlocked: false, points: 100, clickable: true },
  { id: "quiz_king", name: "Rey del Quiz", description: "Conseguiste la mejor puntuación en 5 trivias seguidas", icon: <FaCrown className="text-yellow-400" />, unlocked: false, points: 150, clickable: false },
  { id: "diamond_brain", name: "Mente de Diamante", description: "Contestaste todas las trivias sin un solo error", icon: <FaGem className="text-blue-400" />, unlocked: true, points: 200, clickable: false },
  { id: "iron_mind", name: "Mente de Hierro", description: "Jugaste 30 trivias sin rendirte", icon: <FaShieldAlt className="text-gray-400" />, unlocked: false, points: 75, clickable: true },
  { id: "fast_thinker", name: "Pensador Rápido", description: "Respondiste 5 preguntas en menos de 10 segundos", icon: <FaRocket className="text-red-400" />, unlocked: false, points: 50, clickable: false },
  { id: "quiz_genius", name: "Genio del Quiz", description: "Acertaste 100 preguntas en total", icon: <FaBrain className="text-purple-400" />, unlocked: false, points: 300, clickable: false },
];

export default function AchievementSystem() {
  const [userAchievements, setUserAchievements] = useState(achievements);
  const [score, setScore] = useState(200);

  const handleUnlock = (id, points) => {
    setUserAchievements((prev) =>
      prev.map((achievement) =>
        achievement.id === id ? { ...achievement, unlocked: true, clickable: false } : achievement
      )
    );
    setScore((prevScore) => prevScore + points);
  };

  return (
    <div className="bg-gray-800 p-6 md:p-10 rounded-lg shadow-lg mx-auto max-w-7xl">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">🏆 Logros</h2>
      <p className="text-lg text-yellow-300 mb-6 text-center">⭐ Puntos: {score}</p>

      {/* Contenedor centrado con padding lateral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center mx-auto px-4 md:px-8">
        {userAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className={`p-4 w-full max-w-xs rounded-lg flex flex-col justify-center items-center text-center transition overflow-hidden mx-auto ${
              achievement.unlocked
                ? "bg-green-600 cursor-default"
                : achievement.clickable
                ? "bg-blue-500 border-4 border-blue-300 shadow-lg shadow-blue-400 cursor-pointer animate-pulse"
                : "bg-gray-700"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => achievement.clickable && handleUnlock(achievement.id, achievement.points)}
            whileHover={achievement.clickable ? { scale: 1.05 } : {}}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="text-3xl">{achievement.icon}</div>
              <div>
                <h3 className="font-semibold text-white">{achievement.name}</h3>
                <p className="text-sm text-gray-300">{achievement.description}</p>
              </div>
            </div>
            {achievement.unlocked && (
              <motion.div
                className="text-sm text-yellow-300 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ¡Desbloqueado! (+{achievement.points} puntos)
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}