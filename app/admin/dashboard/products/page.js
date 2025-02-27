"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa"
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  precio: z.number().int().positive("El precio debe ser un número entero positivo"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  desbloqueable: z.boolean().default(false),
  repetido: z.boolean().default(false),
})

export default function ManageProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      desbloqueable: false,
      repetido: false,
    },
  })

  // Watch the repetido field to update desbloqueable automatically
  const repetidoValue = watch("repetido")

  useEffect(() => {
    if (repetidoValue) {
      setValue("desbloqueable", true)
    }
  }, [repetidoValue, setValue])

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
    } else {
      fetchProducts()
    }
  }, [router])

  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, "tienda")
      const productsSnapshot = await getDocs(productsCollection)
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProducts(productsList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Error al cargar los productos")
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingProduct) {
        const productRef = doc(db, "tienda", editingProduct.id)
        await updateDoc(productRef, data)
        toast.success("Producto actualizado correctamente")
      } else {
        await addDoc(collection(db, "tienda"), data)
        toast.success("Producto agregado correctamente")
      }
      reset()
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error("Error adding/updating product:", error)
      toast.error("Error al agregar/actualizar el producto")
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, "tienda", productId))
      fetchProducts()
      toast.success("Producto eliminado correctamente")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar el producto")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Neobrutalism style classes
  const neoBrutalInput =
    "p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white text-black font-bold focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
  const neoBrutalButton =
    "p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none font-bold transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
  const neoBrutalCheckbox = "w-6 h-6 border-4 border-black accent-[#FF8A65] focus:outline-none focus:ring-0"
  const neoBrutalCard = "bg-[#FFD166] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none p-8"
  const neoBrutalTable = "border-4 border-black bg-white text-black"
  const neoBrutalTableHeader = "border-b-4 border-black bg-[#06D6A0] text-black font-bold"
  const neoBrutalTableCell = "border-b-4 border-black p-3"

  return (
    <div className="min-h-screen bg-[#EF476F] text-black flex flex-col items-center justify-start p-8 relative overflow-hidden">
      <motion.button
        onClick={() => router.push("/admin/dashboard")}
        className={`absolute top-8 left-8 ${neoBrutalButton} bg-[#118AB2] text-white`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft />
      </motion.button>
      <motion.div
        className={`${neoBrutalCard} w-full max-w-4xl relative mt-16`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-black mb-8 text-center">GESTIÓN DE PRODUCTOS</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="flex flex-col space-y-4">
            <input
              {...register("nombre")}
              type="text"
              placeholder="Nombre del producto"
              className={`${neoBrutalInput} ${errors.nombre ? "border-red-500" : ""}`}
            />
            {errors.nombre && <p className="text-red-700 font-bold">{errors.nombre.message}</p>}

            <input
              {...register("precio", { valueAsNumber: true })}
              type="number"
              placeholder="Precio en puntos"
              className={`${neoBrutalInput} ${errors.precio ? "border-red-500" : ""}`}
            />
            {errors.precio && <p className="text-red-700 font-bold">{errors.precio.message}</p>}

            <textarea
              {...register("descripcion")}
              placeholder="Descripción del producto"
              className={`${neoBrutalInput} min-h-[100px] ${errors.descripcion ? "border-red-500" : ""}`}
            />
            {errors.descripcion && <p className="text-red-700 font-bold">{errors.descripcion.message}</p>}

            <div className="flex items-center space-x-3 p-3 bg-[#06D6A0] border-4 border-black">
              <input
                type="checkbox"
                id="desbloqueable"
                {...register("desbloqueable")}
                className={neoBrutalCheckbox}
                disabled={repetidoValue}
              />
              <label htmlFor="desbloqueable" className="cursor-pointer font-bold">
                Desbloqueable {repetidoValue && "(Bloqueado por ser repetible)"}
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#118AB2] border-4 border-black">
              <input type="checkbox" id="repetido" {...register("repetido")} className={neoBrutalCheckbox} />
              <label htmlFor="repetido" className="cursor-pointer font-bold text-white">
                Repetible
              </label>
            </div>

            <button
              type="submit"
              className={`${neoBrutalButton} ${editingProduct ? "bg-[#FF8A65]" : "bg-[#06D6A0]"} text-black font-black mt-4`}
            >
              {editingProduct ? "ACTUALIZAR PRODUCTO" : "AGREGAR PRODUCTO"}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className={`w-full ${neoBrutalTable}`}>
            <thead>
              <tr className={neoBrutalTableHeader}>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Desbloqueable</th>
                <th className="p-3">Repetible</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b-4 border-black">
                  <td className={neoBrutalTableCell}>{product.nombre}</td>
                  <td className={neoBrutalTableCell}>{product.precio}</td>
                  <td className={neoBrutalTableCell}>{product.descripcion}</td>
                  <td className={neoBrutalTableCell}>
                    {product.desbloqueable ? (
                      <span className="bg-[#06D6A0] text-black px-3 py-1 border-2 border-black font-bold">Sí</span>
                    ) : (
                      <span className="bg-[#EF476F] text-white px-3 py-1 border-2 border-black font-bold">No</span>
                    )}
                  </td>
                  <td className={neoBrutalTableCell}>
                    {product.repetido ? (
                      <span className="bg-[#06D6A0] text-black px-3 py-1 border-2 border-black font-bold">Sí</span>
                    ) : (
                      <span className="bg-[#EF476F] text-white px-3 py-1 border-2 border-black font-bold">No</span>
                    )}
                  </td>
                  <td className={neoBrutalTableCell}>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => {
                          setEditingProduct(product)
                          setValue("nombre", product.nombre)
                          setValue("precio", product.precio)
                          setValue("descripcion", product.descripcion)
                          setValue("desbloqueable", product.desbloqueable || false)
                          setValue("repetido", product.repetido || false)
                        }}
                        className={`${neoBrutalButton} bg-[#FF8A65] p-2`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`${neoBrutalButton} bg-[#EF476F] text-white p-2`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

