"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  Building2,
  Link as LinkIcon,
  Palette
} from "lucide-react"
import { THEME_COLORS } from "@/lib/utils/card-generator"
import Link from "next/link"

interface SchoolProfile {
  id: string
  schoolName: string
  schoolCode: string
  address: string | null
  phone: string | null
  website: string | null
  socialLink: string | null
  primaryColor: string
  logoUrl: string | null
  principalSignUrl: string | null
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  
  const [profile, setProfile] = useState<SchoolProfile>({
    id: "",
    schoolName: "",
    schoolCode: "",
    address: "",
    phone: "",
    website: "",
    socialLink: "",
    primaryColor: "#1e3a5f",
    logoUrl: null,
    principalSignUrl: null
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [signFile, setSignFile] = useState<File | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user) {
      fetchProfile()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/school/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.school)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess("")
    setError("")

    try {
      let logoUrl = profile.logoUrl
      let signUrl = profile.principalSignUrl

      // Convert files to base64 if selected
      if (logoFile) {
        logoUrl = await fileToBase64(logoFile)
      }
      if (signFile) {
        signUrl = await fileToBase64(signFile)
      }

      const response = await fetch("/api/school/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: profile.schoolName,
          address: profile.address,
          phone: profile.phone,
          website: profile.website,
          socialLink: profile.socialLink,
          primaryColor: profile.primaryColor,
          logoUrl,
          principalSignUrl: signUrl
        })
      })

      if (response.ok) {
        setSuccess("Settings saved successfully!")
        setProfile(prev => ({ ...prev, logoUrl, principalSignUrl: signUrl }))
        setLogoFile(null)
        setSignFile(null)
      } else {
        setError("Failed to save settings")
      }
    } catch (error) {
      console.error("Save error:", error)
      setError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
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
            <h1 className="text-xl font-bold text-slate-900">School Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {success && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={profile.schoolName}
                  onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                  placeholder="Enter school name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolCode">School Code</Label>
                <Input
                  id="schoolCode"
                  value={profile.schoolCode}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">This code is auto-generated and cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address || ""}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Enter school address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website || ""}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="www.school.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Signature */}
          <Card>
            <CardHeader>
              <CardTitle>Logo & Signature</CardTitle>
              <CardDescription>
                Upload your school logo and principal&apos;s signature for advanced templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logo">School Logo</Label>
                <div className="flex items-center gap-4">
                  {profile.logoUrl && (
                    <img 
                      src={profile.logoUrl} 
                      alt="School Logo" 
                      className="w-16 h-16 object-contain border rounded"
                    />
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500">Recommended: Square image, PNG with transparent background</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Principal Signature</Label>
                <div className="flex items-center gap-4">
                  {profile.principalSignUrl && (
                    <img 
                      src={profile.principalSignUrl} 
                      alt="Principal Signature" 
                      className="h-10 object-contain border rounded"
                    />
                  )}
                  <Input
                    id="signature"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSignFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500">Recommended: Transparent PNG, 200x50px</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-600" />
                Social Media Link
              </CardTitle>
              <CardDescription>
                This link will be embedded as a QR code on ID cards (Advanced template)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="socialLink">URL</Label>
                <Input
                  id="socialLink"
                  value={profile.socialLink || ""}
                  onChange={(e) => setProfile({ ...profile, socialLink: e.target.value })}
                  placeholder="https://facebook.com/yourschool"
                />
                <p className="text-xs text-slate-500">
                  Facebook, Instagram, or any website URL
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Theme Color */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                Theme Color
              </CardTitle>
              <CardDescription>
                Choose a primary color for your ID cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setProfile({ ...profile, primaryColor: color.value })}
                    className={`w-12 h-12 rounded-full border-2 transition-transform ${
                      profile.primaryColor === color.value 
                        ? 'border-slate-800 ring-2 ring-slate-300 scale-110' 
                        : 'border-slate-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Selected: {THEME_COLORS.find(c => c.value === profile.primaryColor)?.name || 'Custom'}
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
