"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  ArrowLeft,
  Users,
  CreditCard,
  Wallet,
  Loader2,
  Building2
} from "lucide-react"
import Link from "next/link"

interface Stats {
  totalSchools: number
  totalCards: number
  totalRevenue: number
  pendingPayments: number
}

interface School {
  id: string
  schoolName: string
  schoolCode: string
  totalCredits: number
  usedCredits: number
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [stats, setStats] = useState<Stats>({
    totalSchools: 0,
    totalCards: 0,
    totalRevenue: 0,
    pendingPayments: 0
  })
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "super_admin") {
      router.push("/dashboard")
    } else {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [statsRes, schoolsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/schools")
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      if (schoolsRes.ok) {
        const data = await schoolsRes.json()
        setSchools(data.schools || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-500">Super Admin Panel</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-3xl font-bold text-emerald-600">
                      PKR {stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-purple-600" />
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
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schools List */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Schools</CardTitle>
              <CardDescription>
                All schools using SmartCard platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schools.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No schools registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">School</th>
                        <th className="text-left py-3 px-4">Code</th>
                        <th className="text-left py-3 px-4">Credits</th>
                        <th className="text-left py-3 px-4">Cards Used</th>
                        <th className="text-left py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map((school) => (
                        <tr key={school.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{school.schoolName}</p>
                              <p className="text-sm text-slate-500">{school.user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{school.schoolCode}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-600 font-medium">{school.totalCredits}</span>
                          </td>
                          <td className="py-3 px-4">{school.usedCredits}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {new Date(school.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
