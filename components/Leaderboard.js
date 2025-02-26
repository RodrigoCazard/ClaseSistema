"use client"; // Asegúrate de que este componente sea de cliente

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loggedInStudent, setLoggedInStudent] = useState(null); // Estudiante logueado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        // Obtener el estudiante logueado desde localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setLoggedInStudent(parsedUserData);
        }

        // Obtener todos los estudiantes ordenados por puntos
        const q = query(collection(db, "estudiantes"), orderBy("Puntos", "desc"));
        const querySnapshot = await getDocs(q);
        const estudiantesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calcular la posición del estudiante logueado
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          const estudianteIndex = estudiantesList.findIndex((e) => e.id === parsedUserData.ci);
          if (estudianteIndex !== -1) {
            parsedUserData.posicion = estudianteIndex + 1; // Guardar la posición
            setLoggedInStudent(parsedUserData);
          }
        }

        // Obtener el top 3
        setEstudiantes(estudiantesList.slice(0, 3));
      } catch (error) {
        console.error("Error fetching estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiantes();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400">Cargando...</p>;
  }

  return (
    <div>
      {/* Top 3 */}
      <div className="space-y-4 mb-8">
        {estudiantes.map((estudiante, index) => (
          <motion.div
            key={estudiante.id}
            className={`p-4 rounded-lg flex items-center justify-between ${
              index === 0
                ? "bg-gradient-to-r from-yellow-600 to-yellow-500" // Oro
                : index === 1
                ? "bg-gradient-to-r from-gray-400 to-gray-300" // Plata
                : "bg-gradient-to-r from-yellow-800 to-yellow-700" // Bronce
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </span>
              <span className="text-white">{estudiante.nombre || "Anónimo"}</span>
            </div>
            <span className="text-white font-bold">Top {index + 1}</span>
          </motion.div>
        ))}
      </div>

      {/* Posición del estudiante logueado */}
      {loggedInStudent && (
        <div className="bg-blue-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-white">Tu posición:</span>
            <span className="text-white font-bold">#{loggedInStudent.posicion || "N/A"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;