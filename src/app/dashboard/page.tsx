"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  Upload, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  LogOut,
  Loader2,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Menu,
  X,
  Home,
  Palette,
  Shield
} from "lucide-react"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"

interface SchoolData {
  id: string
  schoolName: string
  schoolCode: string
  totalCredits: number
  usedCredits: number
  primaryColor: string
  logoUrl: string | null
}

interface PaymentData {
  id: string
  amount: number
  credits: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create demo users on first load
    fetch("/api/demo").then(() => {
      // Demo users initialized
    })
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      const isSuperAdmin = session.user.role === "super_admin"
      
      if (isSuperAdmin) {
        // Super admin doesn't have school data, just stop loading
        setLoading(false)
      } else if (session.user.schoolId) {
        // School admin needs to fetch school data
        fetchSchoolData()
        fetchPayments()
      } else {
        // No school ID but not super admin - stop loading
        setLoading(false)
      }
    }
  }, [session])

  const fetchSchoolData = async () => {
    try {
      const response = await fetch("/api/school/profile")
      if (response.ok) {
        const data = await response.json()
        setSchool(data.school)
      }
    } catch (error) {
      console.error("Failed to fetch school data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4">Please sign in to access the dashboard</p>
          <Button onClick={() => signIn()}>Sign In</Button>
        </Card>
      </div>
    )
  }

  const isSuperAdmin = session.user?.role === "super_admin"
  const availableCredits = school ? school.totalCredits - school.usedCredits : 0
  const creditPercentage = school ? (school.usedCredits / school.totalCredits) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">SmartCard</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2 px-6 py-4 border-b">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">SmartCard</span>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b lg:mt-0 mt-16">
              <p className="font-medium text-slate-900 truncate">{session.user?.name}</p>
              <p className="text-sm text-slate-500 truncate">{session.user?.email}</p>
              <Badge variant={isSuperAdmin ? "default" : "secondary"} className="mt-2">
                {isSuperAdmin ? "Super Admin" : "School Admin"}
              </Badge>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <Link href="/dashboard/generate" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <CreditCard className="w-5 h-5" />
                Generate Cards
              </Link>
              <Link href="/dashboard/wallet" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Wallet className="w-5 h-5" />
                Wallet
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              
              {isSuperAdmin && (
                <>
                  <div className="border-t my-4 pt-4">
                    <p className="text-xs text-slate-400 uppercase mb-2 px-3">Admin</p>
                    <Link href="/dashboard/admin/payments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                      <Shield className="w-5 h-5" />
                      Payment Verification
                    </Link>
                    <Link href="/dashboard/admin/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                      <TrendingUp className="w-5 h-5" />
                      Analytics
                    </Link>
                  </div>
                </>
              )}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {isSuperAdmin ? (
            // Super Admin Dashboard
            <SuperAdminDashboard />
          ) : (
            // School Admin Dashboard
            <>
              {/* Welcome Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Welcome back, {session.user?.name?.split(' ')[0]}! 👋
                  </CardTitle>
                  <CardDescription>
                    {school?.schoolName} - Code: {school?.schoolCode}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Available Credits</p>
                        <p className="text-3xl font-bold text-emerald-600">{availableCredits}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <Progress value={100 - creditPercentage} className="mt-3 h-2" />
                    <p className="text-xs text-slate-400 mt-2">
                      {school?.usedCredits} of {school?.totalCredits} used
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Cards Generated</p>
                        <p className="text-3xl font-bold text-slate-900">{school?.usedCredits || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Pending Payments</p>
                        <p className="text-3xl font-bold text-amber-600">
                          {payments.filter(p => p.status === 'pending').length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Spent</p>
                        <p className="text-3xl font-bold text-slate-900">
                          PKR {((school?.usedCredits || 0) * 10).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-emerald-600" />
                      Generate ID Cards
                    </CardTitle>
                    <CardDescription>
                      Upload Excel data and photos to create student ID cards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/generate">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Start Generating
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                      Add Credits
                    </CardTitle>
                    <CardDescription>
                      Purchase more credits via EasyPaisa (10 PKR/card)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/wallet">
                      <Button variant="outline" className="w-full">
                        Recharge Wallet
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payment Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No payment history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {payment.status === 'approved' ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : payment.status === 'rejected' ? (
                              <X className="w-5 h-5 text-red-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-500" />
                            )}
                            <div>
                              <p className="font-medium">PKR {payment.amount} - {payment.credits} credits</p>
                              <p className="text-sm text-slate-500">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            payment.status === 'approved' ? 'default' : 
                            payment.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Super Admin Dashboard Component
function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalCards: 0,
    totalRevenue: 0,
    pendingPayments: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    fetchStats()
  }, [])

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Super Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage schools, payments, and view analytics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Schools</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalSchools}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Cards Generated</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalCards}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">PKR {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Payments</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Payment Verification
            </CardTitle>
            <CardDescription>
              Review and approve pending payment screenshots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/payments">
              <Button className="w-full">
                View Pending Payments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed statistics and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
