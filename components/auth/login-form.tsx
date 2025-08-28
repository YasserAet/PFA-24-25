"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface LoginFormProps {
  onSuccess: (user: any) => void
  onSwitchToSignup: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("Login form submitted with data:", formData)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("Login response status:", response.status)
      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok) {
        console.log("Login successful, calling onSuccess")
        onSuccess(data.user)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred")
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
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-[#2DD4BF]/20">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-[#0B4D43] font-montserrat">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600 font-montserrat text-sm">
          Sign in to access your virtual tours
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#0B4D43] font-montserrat font-medium text-sm">
              Username or Email
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-9"
              placeholder="Enter your username or email"
            />
          </div>

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
                placeholder="Enter your password"
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

          {error && <div className="text-red-500 text-sm text-center font-montserrat py-2">{error}</div>}

          <div className="flex flex-col items-center space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0B4D43] to-[#134E44] hover:from-[#134E44] hover:to-[#0B4D43] text-white font-montserrat font-semibold h-10 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={onSwitchToSignup}
              className="text-[#0B4D43] hover:text-[#2DD4BF] font-montserrat text-sm h-8"
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
