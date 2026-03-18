import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { school: true }
    })

    if (!user || !user.school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    return NextResponse.json({ school: user.school })
  } catch (error) {
    console.error("Error fetching school:", error)
    return NextResponse.json({ error: "Failed to fetch school" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      schoolName, 
      address, 
      phone, 
      website, 
      socialLink, 
      primaryColor,
      logoUrl,
      principalSignUrl,
      usedCredits
    } = body

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { school: true }
    })

    if (!user || !user.school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    // Build update data object
    const updateData: Record<string, unknown> = {}
    
    if (schoolName) updateData.schoolName = schoolName
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (website !== undefined) updateData.website = website
    if (socialLink !== undefined) updateData.socialLink = socialLink
    if (primaryColor) updateData.primaryColor = primaryColor
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (principalSignUrl !== undefined) updateData.principalSignUrl = principalSignUrl
    if (usedCredits !== undefined) updateData.usedCredits = usedCredits

    const updatedSchool = await db.school.update({
      where: { id: user.school.id },
      data: updateData
    })

    return NextResponse.json({ school: updatedSchool })
  } catch (error) {
    console.error("Error updating school:", error)
    return NextResponse.json({ error: "Failed to update school" }, { status: 500 })
  }
}
