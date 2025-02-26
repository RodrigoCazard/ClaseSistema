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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-gray-900 text-white flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <motion.button
        onClick={() => router.push("/admin/dashboard")}
        className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowLeft />
      </motion.button>
      <motion.div
        className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-4xl backdrop-filter backdrop-blur-lg relative mt-16"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Productos</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="flex flex-col space-y-2">
            <input
              {...register("nombre")}
              type="text"
              placeholder="Nombre del producto"
              className="p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nombre && <p className="text-red-500">{errors.nombre.message}</p>}
            <input
              {...register("precio", { valueAsNumber: true })}
              type="number"
              placeholder="Precio en puntos"
              className="p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.precio && <p className="text-red-500">{errors.precio.message}</p>}
            <textarea
              {...register("descripcion")}
              placeholder="Descripción del producto"
              className="p-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.descripcion && <p className="text-red-500">{errors.descripcion.message}</p>}
            <button
              type="submit"
              className={`${editingProduct ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"} text-white p-2 rounded-lg transition-colors`}
            >
              {editingProduct ? "Actualizar Producto" : "Agregar Producto"}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Precio</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-700">
                  <td className="py-2 px-4">{product.nombre}</td>
                  <td className="py-2 px-4">{product.precio}</td>
                  <td className="py-2 px-4">{product.descripcion}</td>
                  <td className="py-2 px-4 flex items-center">
                    <motion.button
                      onClick={() => {
                        setEditingProduct(product)
                        setValue("nombre", product.nombre)
                        setValue("precio", product.precio)
                        setValue("descripcion", product.descripcion)
                      }}
                      className="mr-2 bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
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

