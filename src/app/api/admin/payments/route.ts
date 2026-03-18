import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Fetch all pending payments
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized", payments: [] }, { status: 401 })
    }

    const payments = await db.payment.findMany({
      where: { status: 'pending' },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            user: {
              select: { 
                name: true, 
                email: true 
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching pending payments:", error)
    return NextResponse.json({ payments: [], error: "Failed to fetch payments" })
  }
}

// PUT - Approve or Reject a payment
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, action, adminNotes } = body

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Missing paymentId or action" }, { status: 400 })
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { school: true }
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
    }

    if (action === 'approve') {
      // Update payment status and add credits in a transaction
      await db.$transaction([
        // Update payment status
        db.payment.update({
          where: { id: paymentId },
          data: {
            status: 'approved',
            adminNotes: adminNotes || null,
            reviewedAt: new Date(),
            reviewedBy: session.user.id
          }
        }),
        // Add credits to school
        db.school.update({
          where: { id: payment.schoolId },
          data: {
            totalCredits: { increment: payment.credits }
          }
        })
      ])

      return NextResponse.json({ 
        success: true, 
        message: `Approved! ${payment.credits} credits added to school account.`,
        creditsAdded: payment.credits
      })

    } else if (action === 'reject') {
      // Update payment status only
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'rejected',
          adminNotes: adminNotes || null,
          reviewedAt: new Date(),
          reviewedBy: session.user.id
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: "Payment rejected" 
      })

    } else {
      return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}