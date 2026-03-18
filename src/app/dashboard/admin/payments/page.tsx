"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Building2,
  Mail,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Payment {
  id: string
  amount: number
  credits: number
  status: string
  screenshotUrl: string | null
  createdAt: string
  adminNotes: string | null
  school: {
    id: string
    schoolName: string
    user: {
      name: string | null
      email: string
    }
  }
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Selected payment for review
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "super_admin") {
      router.push("/dashboard")
    } else {
      fetchPayments()
    }
  }, [session, status, router])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedPayment) return
    
    setProcessing(true)
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: "approve",
          adminNotes
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Approved! ${selectedPayment.credits} credits added to ${selectedPayment.school.schoolName}`)
        setPayments(payments.filter(p => p.id !== selectedPayment.id))
        setShowDialog(false)
        setSelectedPayment(null)
        setAdminNotes("")
      } else {
        toast.error(data.error || "Failed to approve payment")
      }
    } catch (error) {
      console.error("Approval error:", error)
      toast.error("Failed to approve payment")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPayment) return
    
    setProcessing(true)
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: "reject",
          adminNotes
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Payment rejected")
        setPayments(payments.filter(p => p.id !== selectedPayment.id))
        setShowDialog(false)
        setSelectedPayment(null)
        setAdminNotes("")
      } else {
        toast.error(data.error || "Failed to reject payment")
      }
    } catch (error) {
      console.error("Rejection error:", error)
      toast.error("Failed to reject payment")
    } finally {
      setProcessing(false)
    }
  }

  const openReviewDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setAdminNotes("")
    setShowDialog(true)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Payment Verification</h1>
              <p className="text-sm text-slate-500">Super Admin Panel</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            {payments.length} Pending
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h2>
                <p className="text-slate-500">No pending payments to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-4">
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* School Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {payment.school.schoolName}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Mail className="w-3 h-3" />
                              {payment.school.user.email}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Credits */}
                        <div className="flex items-center gap-4">
                          <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-600">
                              PKR {payment.amount}
                            </p>
                            <p className="text-xs text-slate-500">{payment.credits} credits</p>
                          </div>
                          
                          <Button
                            onClick={() => openReviewDialog(payment)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review & Approve
                          </Button>
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Review Payment</DialogTitle>
            <DialogDescription>
              Verify the payment screenshot and take action
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 py-4">
              {/* School Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedPayment.school.schoolName}</p>
                    <p className="text-sm text-slate-500">{selectedPayment.school.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-600">PKR {selectedPayment.amount}</p>
                  <p className="text-sm text-slate-500">Amount Paid</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{selectedPayment.credits}</p>
                  <p className="text-sm text-slate-500">Credits to Add</p>
                </div>
              </div>

              {/* Screenshot */}
              {selectedPayment.screenshotUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Screenshot</Label>
                  <div className="border rounded-lg overflow-hidden bg-slate-50">
                    <img 
                      src={selectedPayment.screenshotUrl} 
                      alt="Payment Screenshot"
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the school..."
                />
              </div>

              {/* Action Info */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">
                  <strong>Approve:</strong> Credits will be added to the school's account immediately.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons - Always visible */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t bg-white sticky bottom-0">
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve & Add Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
