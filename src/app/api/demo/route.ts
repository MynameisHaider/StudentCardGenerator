import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

// Create demo users if they don't exist
export async function GET(request: NextRequest) {
  try {
    // Check if demo users exist
    const existingSchool = await db.user.findUnique({
      where: { email: "school@demo.com" }
    })

    const existingAdmin = await db.user.findUnique({
      where: { email: "admin@demo.com" }
    })

    if (!existingSchool) {
      await db.user.create({
        data: {
          email: "school@demo.com",
          name: "Demo School Admin",
          password: "demo123",
          role: "school",
          school: {
            create: {
              schoolName: "Demo Public School",
              schoolCode: "DEM001",
              totalCredits: 50,
              usedCredits: 0,
              primaryColor: "#1e3a5f"
            }
          }
        }
      })
    }

    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: "admin@demo.com",
          name: "Super Admin",
          password: "admin123",
          role: "super_admin"
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Demo users ready",
      users: {
        school: { email: "school@demo.com", password: "demo123" },
        admin: { email: "admin@demo.com", password: "admin123" }
      }
    })
  } catch (error) {
    console.error("Error creating demo users:", error)
    return NextResponse.json(
      { error: "Failed to create demo users" },
      { status: 500 }
    )
  }
}
