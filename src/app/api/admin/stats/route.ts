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

    const [totalSchools, cardsData, pendingPayments] = await Promise.all([
      db.school.count(),
      db.school.aggregate({
        _sum: { usedCredits: true }
      }),
      db.payment.count({
        where: { status: 'pending' }
      })
    ])

    const totalCards = cardsData._sum.usedCredits || 0
    const totalRevenue = totalCards * 10 // 10 PKR per card

    return NextResponse.json({
      totalSchools,
      totalCards,
      totalRevenue,
      pendingPayments
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({
      totalSchools: 0,
      totalCards: 0,
      totalRevenue: 0,
      pendingPayments: 0
    })
  }
}
