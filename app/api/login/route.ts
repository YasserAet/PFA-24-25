import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB, type User } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "uV3J9kL8x2+7Q9mN5zF1a8P0W4yT6vB9"

export async function POST(request: NextRequest) {
  console.log("Login API called")
  try {
    const { username, password } = await request.json()
    console.log("Login attempt for username:", username)

    if (!username || !password) {
      console.log("Missing username or password")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    console.log("Connecting to database...")
    const connection = await connectDB()

    // Find user by username or email
    console.log("Searching for user...")
    const [users] = await connection.execute("SELECT * FROM users WHERE username = ? OR email = ?", [
      username,
      username,
    ])

    await connection.release()

    if (!Array.isArray(users) || users.length === 0) {
      console.log("User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0] as User
    console.log("User found:", user.username)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Creating JWT token...")
    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    console.log("Creating response with cookie...")
    // Create response with token in cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          telephone: user.telephone,
        },
      },
      { status: 200 },
    )

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/", // Ensure cookie is available for all paths
    })

    console.log("Login successful, cookie set with path: /")
    console.log("Cookie details:", {
      name: "auth-token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/"
    })
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
