"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface SignupFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          telephone: formData.telephone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-[#2DD4BF]/20">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-[#0B4D43] font-montserrat">Create Account</CardTitle>
        <CardDescription className="text-gray-600 font-montserrat text-sm">Join us to explore virtual tours</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information - Compact Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#0B4D43] font-montserrat font-medium text-sm">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9"
                placeholder="John"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#0B4D43] font-montserrat font-medium text-sm">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#0B4D43] font-montserrat font-medium text-sm">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9"
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0B4D43] font-montserrat font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Phone Number - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="telephone" className="text-[#0B4D43] font-montserrat font-medium text-sm">
              Phone Number (Optional)
            </Label>
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleChange}
              className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0B4D43] font-montserrat font-medium text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9 pr-9"
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 px-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#0B4D43] font-montserrat font-medium text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9 pr-9"
                  placeholder="Confirm password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 px-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center font-montserrat py-2">{error}</div>}

          {/* Action Buttons */}
          <div className="flex flex-col items-center space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0B4D43] to-[#134E44] hover:from-[#134E44] hover:to-[#0B4D43] text-white font-montserrat font-semibold h-10 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="text-[#0B4D43] hover:text-[#2DD4BF] font-montserrat text-sm h-8"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
