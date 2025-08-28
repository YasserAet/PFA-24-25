// import mysql from "mysql2/promise"

// const dbConfig = {
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "keyone",
//   port: Number.parseInt(process.env.DB_PORT || "3306"),
// }

// export async function connectDB() {
//   try {
//     const connection = await mysql.createConnection(dbConfig)
//     return connection
//   } catch (error) {
//     console.error("Database connection failed:", error)
//     throw error
//   }
// }

// export interface User {
//   id: number
//   username: string
//   password: string
//   first_name: string
//   last_name: string
//   email: string
//   telephone?: string
//   created_at: Date
// }

import mysql from "mysql2/promise"

// Log database configuration (without sensitive data)
console.log("Database configuration:")
console.log("Host:", process.env.DB_HOST || "localhost")
console.log("Database:", process.env.DB_NAME || "keyone")
console.log("Port:", process.env.DB_PORT || "3306")
console.log("User:", process.env.DB_USER || "root")

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "keyone",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,   // adjust as needed
  queueLimit: 0,
})

export async function connectDB() {
  try {
    console.log("Attempting database connection...")
    const connection = await pool.getConnection()
    console.log("Database connection successful")
    return connection
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

export interface User {
  id: number
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
  telephone?: string
  created_at: Date
}
