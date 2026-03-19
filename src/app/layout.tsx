import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/providers/SessionProvider"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SmartCard - Student ID Card Generator",
  description: "Professional Student ID Card Generator for Pakistani Schools. Generate ID cards from Excel data in minutes.",
  keywords: ["ID Card", "Student ID", "School Management", "Pakistan", "Card Generator"],
  authors: [{ name: "SmartCard Team" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "SmartCard - Student ID Card Generator",
    description: "Professional Student ID Card Generator for Pakistani Schools",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <Sonner position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
