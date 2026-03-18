"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Wallet, 
  CreditCard, 
  ArrowLeft,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Smartphone
} from "lucide-react"
import Link from "next/link"

interface PaymentRecord {
  id: string
  amount: number
  credits: number
  status: string
  screenshotUrl: string | null
  createdAt: string
  adminNotes: string | null
}

interface SchoolInfo {
  totalCredits: number
  usedCredits: number
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [school, setSchool] = useState<SchoolInfo>({ totalCredits: 5, usedCredits: 0 })
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Payment form
  const [amount, setAmount] = useState("")
  const [credits, setCredits] = useState("")
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user) {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [profileRes, paymentsRes] = await Promise.all([
        fetch("/api/school/profile"),
        fetch("/api/payments")
      ])
      
      if (profileRes.ok) {
        const data = await profileRes.json()
        setSchool(data.school)
      }
      
      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    // Auto-calculate credits (10 PKR per credit)
    const numAmount = parseInt(value) || 0
    setCredits(String(numAmount / 10))
  }

  const handleCreditsChange = (value: string) => {
    setCredits(value)
    // Auto-calculate amount (10 PKR per credit)
    const numCredits = parseInt(value) || 0
    setAmount(String(numCredits * 10))
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !credits || !screenshotFile) {
      alert("Please fill all fields")
      return
    }

    setSubmitting(true)
    setSuccess("")

    try {
      // Convert file to base64 for storage (in production, use proper file storage)
      const reader = new FileReader()
      reader.onload = async () => {
        const screenshotUrl = reader.result as string
        
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(amount),
            credits: parseInt(credits),
            screenshotUrl
          })
        })

        if (response.ok) {
          setSuccess("Payment request submitted successfully! It will be reviewed within 24 hours.")
          setAmount("")
          setCredits("")
          setScreenshotFile(null)
          fetchData()
        } else {
          alert("Failed to submit payment request")
        }
        setSubmitting(false)
      }
      reader.readAsDataURL(screenshotFile)
    } catch (error) {
      console.error("Payment submission error:", error)
      alert("Failed to submit payment request")
      setSubmitting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const availableCredits = school.totalCredits - school.usedCredits
  const creditPercentage = (school.usedCredits / school.totalCredits) * 100

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Credit Wallet</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Credit Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-slate-500">Available Credits</p>
                  <p className="text-4xl font-bold text-emerald-600">{availableCredits}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Used Credits</p>
                  <p className="text-4xl font-bold text-slate-900">{school.usedCredits}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Total Credits</p>
                  <p className="text-4xl font-bold text-slate-900">{school.totalCredits}</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Credits Used</span>
                  <span>{creditPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={creditPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Recharge Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Recharge Credits
              </CardTitle>
              <CardDescription>
                Pay via EasyPaisa and upload payment screenshot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* EasyPaisa Instructions */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-green-800">EasyPaisa Payment</span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Send payment to: <strong>03409161473</strong>
                </p>
                <p className="text-xs text-green-600">
                  Account Name: ALI HAIDER<br />
                  Note: Save transaction screenshot after payment
                </p>
              </div>

              {success && (
                <Alert className="mb-6 bg-emerald-50 border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      min="10"
                      step="10"
                    />
                    <p className="text-xs text-slate-500">10 PKR = 1 Credit</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits to Add</Label>
                    <Input
                      id="credits"
                      type="number"
                      placeholder="Enter credits"
                      value={credits}
                      onChange={(e) => handleCreditsChange(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment Screenshot</Label>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-slate-500">
                    Upload a screenshot of your EasyPaisa transaction
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Payment Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {payment.status === 'approved' ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : payment.status === 'rejected' ? (
                          <XCircle className="w-6 h-6 text-red-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            PKR {payment.amount} - {payment.credits} credits
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </p>
                          {payment.adminNotes && (
                            <p className="text-sm text-slate-600 mt-1">
                              Note: {payment.adminNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          payment.status === 'approved' ? 'default' : 
                          payment.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                        className={
                          payment.status === 'approved' ? 'bg-emerald-600' : 
                          payment.status === 'pending' ? 'bg-amber-500' : ''
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">PKR 10</p>
                  <p className="text-sm text-slate-500">Per ID Card</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">PKR 500</p>
                  <p className="text-sm text-slate-500">50 Cards Package</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">PKR 900</p>
                  <p className="text-sm text-slate-500">100 Cards Package (10% off)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
