import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, schoolName } = body

    // Validate input
    if (!name || !email || !password || !schoolName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Create user and school in a transaction
    const user = await db.user.create({
      data: {
        email,
        name,
        password, // In production, hash this with bcrypt
        role: "school",
        school: {
          create: {
            schoolName,
            schoolCode: `SC${nanoid(6).toUpperCase()}`,
            totalCredits: 5, // Free credits
            usedCredits: 0,
            primaryColor: "#1e3a5f"
          }
        }
      },
      include: {
        school: true
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
