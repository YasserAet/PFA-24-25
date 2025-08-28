"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import IntroScreen from "@/components/intro-screen"
import LandingPage from "@/components/landing-page"

export default function HomePage() {
  const [introState, setIntroState] = useState<"showing" | "transitioning" | "hidden">("showing")
  const [contentVisible, setContentVisible] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/verify")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/login")
          return
        }
      } catch (error) {
        router.push("/login")
        return
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Handle intro screen transition
  useEffect(() => {
    if (isLoading) return // Don't start intro until auth is checked

    // Start showing intro
    const introTimer = setTimeout(() => {
      // After 2.5 seconds, start transition
      setIntroState("transitioning")

      // After transition starts, begin fading in the content
      const contentTimer = setTimeout(() => {
        setContentVisible(true)

        // After content is visible, complete the transition
        const completeTimer = setTimeout(() => {
          setIntroState("hidden")
        }, 1000) // Complete transition after 1 second

        return () => clearTimeout(completeTimer)
      }, 500) // Start showing content 0.5 seconds after transition begins

      return () => clearTimeout(contentTimer)
    }, 2500) // Show intro for 2.5 seconds

    return () => clearTimeout(introTimer)
  }, [isLoading])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-montserrat">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    // Add a background color to the main wrapper
    <div className="bg-gray-900 min-h-screen">
      {introState !== "hidden" && <IntroScreen isTransitioning={introState === "transitioning"} />}

      <div
        className={cn(
          "w-full h-screen transition-opacity duration-1000 bg-gray-900", // Added bg-gray-900 here
          introState === "showing" ? "opacity-0" : "opacity-100"
        )}
      >
        {contentVisible && (
          <div
            className={cn(
              "w-full h-full transition-all duration-700 bg-gray-900", // Added bg-gray-900 here
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <LandingPage />
          </div>
        )}
      </div>
    </div>
  )
} 

