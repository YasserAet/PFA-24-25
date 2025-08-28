"use client"

import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "../components/theme-provider"
import SidebarNavigation from "@/components/sidebar-navigation"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "App",
//   description: "Modern app with a clean design",
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  return (
    <html lang="en" style={{ backgroundColor: "#0B4D43" }} suppressHydrationWarning>
      <head>
        {/* Add this inline style tag */}
        <style dangerouslySetInnerHTML={{ __html: `
          body, html { backgroundColor: #0B4D43 !important; }
          *, *::before, *::after { transition: none !important; }
        `}} />
      </head>
      <body className={isAuthPage ? "h-screen" : "flex h-screen"}>
        {!isAuthPage && <SidebarNavigation />}
        <main className={`${isAuthPage ? "h-full" : "flex-1 h-full overflow-auto"}`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </main>
      </body>
    </html>
  )
}
