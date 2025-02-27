"use client";
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const actualizarPuntos = (newPuntos) => {
    setUserData((prevData) => {
      const updatedUser = { ...prevData, puntos: newPuntos };
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ userData, actualizarPuntos }}>
      {children}
    </UserContext.Provider>
  );
}
