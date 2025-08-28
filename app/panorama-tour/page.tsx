// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import PanoramaTour from "@/components/panorama-tour"

// export default function PanoramaTourPage() {
//   const [user, setUser] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/verify")
//         if (response.ok) {
//           const data = await response.json()
//           setUser(data.user)
//         } else {
//           router.push("/login")
//           return
//         }
//       } catch (error) {
//         router.push("/login")
//         return
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     checkAuth()
//   }, [router])

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white font-montserrat">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return <PanoramaTour />
// } 