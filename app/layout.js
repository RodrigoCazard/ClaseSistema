import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Tienda de Puntos Estudiantil",
  description: "Sistema de canje de puntos para estudiantes",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
   
 
      <Toaster position="left-bottom" />
        {children}
      
      
      </body>
    </html>
  )
}

