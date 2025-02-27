"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import toast from "react-hot-toast"
import { FaLock, FaUnlock } from "react-icons/fa"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import DonationDialog from "@/components/ui/DonationDialog"
import SuccessPopup from "@/components/ui/SuccessPopup"
import { NeoBrutalButton, NeoBrutalCard, neoBrutalColors } from "@/styles/neobrutalism"

export default function Tienda({ puntos, userData, onActualizarPuntos }) {
  const [productos, setProductos] = useState({ normal: [], unlockable: [] })
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, data: null })
  const [donationDialog, setDonationDialog] = useState({ isOpen: false, data: null })
  const [successPopup, setSuccessPopup] = useState({ isOpen: false, details: null })

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const tiendaCollection = collection(db, "tienda")
        const tiendaSnapshot = await getDocs(tiendaCollection)
        const productosList = tiendaSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        const normal = productosList.filter((p) => !p.desbloqueable)
        const unlockable = productosList.filter((p) => p.desbloqueable)

        setProductos({ normal, unlockable })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching productos:", error)
        toast.error("Error al cargar los productos")
        setLoading(false)
      }
    }

    fetchProductos()
  }, [])

  const handleCompra = async (estudiante, producto) => {
    setConfirmDialog({
      isOpen: true,
      data: {
        title: "Confirmar Compra",
        message: `¿Estás seguro que deseas comprar ${producto.nombre} por ${producto.precio} puntos?`,
        onConfirm: async () => {
          try {
            const studentRef = doc(db, "estudiantes", estudiante.ci)
            const newPoints = estudiante.puntos - producto.precio

            await updateDoc(studentRef, { Puntos: newPoints })
            await addDoc(collection(db, "movimientos"), {
              ci: estudiante.ci,
              fecha: new Date(),
              ganados: false,
              puntos: producto.precio,
            })

            setConfirmDialog({ isOpen: false, data: null })
            setSuccessPopup({
              isOpen: true,
              details: {
                productName: producto.nombre,
                type: "purchase",
                points: producto.precio,
                remainingPoints: newPoints,
              },
            })

            onActualizarPuntos(newPoints, producto.precio)
          } catch (error) {
            console.error("Error al procesar la compra:", error)
            toast.error("Error al realizar la compra")
          }
        },
      },
    })
  }

  const handleDonarClick = (estudiante, producto) => {
    setDonationDialog({
      isOpen: true,
      data: {
        maxPoints: Math.min(estudiante.puntos, producto.precio - (producto.puntosAcumulados || 0)),
        productName: producto.nombre,
        onConfirm: async (pointsToAdd) => {
          try {
            const studentRef = doc(db, "estudiantes", estudiante.ci)
            const productRef = doc(db, "tienda", producto.id)
            const newPoints = estudiante.puntos - pointsToAdd
            const newPuntosAcumulados = (producto.puntosAcumulados || 0) + pointsToAdd

            await updateDoc(studentRef, { Puntos: newPoints })
            await updateDoc(productRef, { puntosAcumulados: newPuntosAcumulados })
            await addDoc(collection(db, "movimientos"), {
              ci: estudiante.ci,
              fecha: new Date(),
              ganados: false,
              puntos: pointsToAdd,
              tipo: "donacion",
              productoId: producto.id,
            })

            setDonationDialog({ isOpen: false, data: null })
            setSuccessPopup({
              isOpen: true,
              details: {
                productName: producto.nombre,
                type: "donation",
                points: pointsToAdd,
                remainingPoints: newPoints,
              },
            })

            onActualizarPuntos(newPoints, pointsToAdd)

            const tiendaCollection = collection(db, "tienda")
            const tiendaSnapshot = await getDocs(tiendaCollection)
            const productosList = tiendaSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))

            setProductos({
              normal: productosList.filter((p) => !p.desbloqueable),
              unlockable: productosList.filter((p) => p.desbloqueable),
            })
          } catch (error) {
            console.error("Error al procesar la donación:", error)
            toast.error("Error al realizar la donación")
          }
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className={`animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[${neoBrutalColors.accent1}]`}
        ></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Normal Products Section */}
      <div>
        <h2 className="text-2xl font-black mb-4">Productos Disponibles</h2>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productos.normal.map((producto) => (
            <NeoBrutalCard
              key={producto.id}
              className="flex flex-col items-center justify-center h-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
              <p className={`text-[${neoBrutalColors.accent1}] font-bold mb-4`}>{producto.precio} puntos</p>
              <p className="text-center mb-4">{producto.descripcion}</p>
              <NeoBrutalButton
                onClick={() => handleCompra(userData, producto)}
                disabled={puntos < producto.precio}
                className={`bg-[${neoBrutalColors.accent1}] text-black ${puntos < producto.precio ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Canjear
              </NeoBrutalButton>
            </NeoBrutalCard>
          ))}
        </motion.div>
      </div>

      {/* Unlockable Products Section */}
      {productos.unlockable.length > 0 && (
        <div>
          <h2 className="text-2xl font-black mb-4">Productos Desbloqueables</h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productos.unlockable.map((producto) => (
              <NeoBrutalCard
                key={producto.id}
                className="flex flex-col items-center justify-center h-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {producto.puntosAcumulados >= producto.precio ? (
                    <FaUnlock className={`text-[${neoBrutalColors.accent1}]`} />
                  ) : (
                    <FaLock className={`text-[${neoBrutalColors.accent2}]`} />
                  )}
                  <h3 className="text-xl font-bold">{producto.nombre}</h3>
                </div>
                <p className={`text-[${neoBrutalColors.accent1}] font-bold mb-2`}>
                  {producto.precio} puntos necesarios
                </p>
                <p className="text-center mb-4">{producto.descripcion}</p>

                {/* Barra de progreso */}
                <div
                  className={`w-full bg-[${neoBrutalColors.background}] rounded-full h-4 mb-4 border-4 border-black`}
                >
                  <div
                    className={`bg-[${neoBrutalColors.accent1}] h-full rounded-full transition-all duration-500`}
                    style={{
                      width: `${Math.min(100, ((producto.puntosAcumulados || 0) / producto.precio) * 100)}%`,
                    }}
                  />
                </div>

                <div className="text-sm mb-4">
                  <span className={`text-[${neoBrutalColors.accent1}]`}>{producto.puntosAcumulados || 0}</span>
                  <span className="text-gray-700"> / </span>
                  <span className={`text-[${neoBrutalColors.accent1}]`}>{producto.precio}</span>
                  <span className="text-gray-700"> puntos acumulados</span>
                </div>

                {producto.puntosAcumulados >= producto.precio ? (
                  <p className={`text-[${neoBrutalColors.accent1}] font-bold`}>¡Producto Desbloqueado!</p>
                ) : (
                  <NeoBrutalButton
                    onClick={() => handleDonarClick(userData, producto)}
                    disabled={puntos <= 0}
                    className={`bg-[${neoBrutalColors.accent2}] text-black ${puntos <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Donar Puntos
                  </NeoBrutalButton>
                )}
              </NeoBrutalCard>
            ))}
          </motion.div>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, data: null })}
        {...confirmDialog.data}
      />
      <DonationDialog
        isOpen={donationDialog.isOpen}
        onClose={() => setDonationDialog({ isOpen: false, data: null })}
        {...donationDialog.data}
      />
      <SuccessPopup
        isOpen={successPopup.isOpen}
        onClose={() => setSuccessPopup({ isOpen: false, details: null })}
        details={successPopup.details}
      />
    </div>
  )
}

