"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  const [isLogin, setIsLogin] = useState(false) // Start with signup form
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/verify")
        if (response.ok) {
          router.push("/")
        }
      } catch (error) {
        // User not authenticated, stay on auth page
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44] flex items-center justify-center p-4">
      {/* Load Montserrat font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src="/images/logo.svg" 
            alt="KEY1 Logo" 
            className="w-20 h-20 mx-auto mb-3"
            onError={(e) => {
              // Fallback to PNG if SVG fails
              e.currentTarget.src = "/images/logo.png";
            }}
          />
          <p className="text-white/70 font-montserrat text-sm">Create your account to get started</p>
        </div>

        {/* Auth Form */}
        {showSuccess ? (
          <div className="bg-white/95 backdrop-blur-sm border-[#2DD4BF]/20 rounded-lg p-8 text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-[#0B4D43] font-montserrat mb-2">Account Created Successfully!</h2>
            <p className="text-gray-600 font-montserrat">Redirecting to login...</p>
          </div>
        ) : isLogin ? (
          <LoginForm 
            onSuccess={() => router.push("/")} 
            onSwitchToSignup={() => setIsLogin(false)} 
          />
        ) : (
          <SignupForm 
            onSuccess={() => {
              setShowSuccess(true)
              setTimeout(() => {
                setShowSuccess(false)
                setIsLogin(true)
              }, 3000)
            }} 
            onSwitchToLogin={() => setIsLogin(true)} 
          />
        )}
      </div>
    </div>
  )
}
