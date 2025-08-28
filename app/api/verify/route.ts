import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB, type User } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "uV3J9kL8x2+7Q9mN5zF1a8P0W4yT6vB9"

export async function GET(request: NextRequest) {
  try {
    console.log("Verify API called")
    
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    console.log("Token exists:", !!token)
    console.log("All cookies:", request.cookies.getAll())
    console.log("Auth token cookie:", request.cookies.get("auth-token"))

    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    console.log("Verifying JWT token...")
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log("Token decoded successfully, userId:", decoded.userId)

    if (!decoded.userId) {
      console.log("Invalid token structure")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user from database
    console.log("Connecting to database...")
    const connection = await connectDB()
    const [users] = await connection.execute("SELECT * FROM users WHERE id = ?", [decoded.userId])
    await connection.release()
    console.log("Database query completed, users found:", Array.isArray(users) ? users.length : 0)

    if (!Array.isArray(users) || users.length === 0) {
      console.log("User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const user = users[0] as User
    console.log("User retrieved successfully:", user.username)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        telephone: user.telephone,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}