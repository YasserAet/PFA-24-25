"use client"

import { useState, useEffect } from "react"
import PremiumBuildingViewer from "../../components/premium-building-viewer/index"
import { UserControls } from "@/components/user-controls"
import { useRouter } from "next/navigation"

interface ApartmentUser {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  telephone?: string
}

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication for projects page...")
        const response = await fetch("/api/verify")
        console.log("Verify response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("User authenticated:", data.user)
          setUser(data.user)
        } else {
          console.log("Authentication failed, redirecting to login")
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("Authentication error:", error)
        router.push("/login")
        return
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2DD4BF]/30 border-t-[#2DD4BF] rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#2DD4BF]/50 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-montserrat">Loading...</h2>
          <p className="text-[#2DD4BF]/80 font-montserrat">Authenticating user...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <PremiumBuildingViewer />
      </main>

      {/* User Controls - Added at bottom */}
    </>
  )
}