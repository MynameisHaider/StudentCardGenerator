import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const schools = await db.school.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ schools })
  } catch (error) {
    console.error("Error fetching schools:", error)
    return NextResponse.json({ schools: [] })
  }
}
