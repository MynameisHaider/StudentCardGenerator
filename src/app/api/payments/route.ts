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
      return NextResponse.json({ payments: [] })
    }

    const payments = await db.payment.findMany({
      where: { schoolId: user.school.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ payments: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, credits, screenshotUrl } = body

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { school: true }
    })

    if (!user || !user.school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    const payment = await db.payment.create({
      data: {
        schoolId: user.school.id,
        amount,
        credits,
        screenshotUrl,
        status: 'pending'
      }
    })

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 })
  }
}
