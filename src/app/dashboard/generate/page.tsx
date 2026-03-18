"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Eye, 
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Trash2
} from "lucide-react"
import { downloadExcelTemplate, parseExcelFile, StudentRow } from "@/lib/utils/excel"
import { processZipFile, PhotoMapping, findMissingPhotos } from "@/lib/utils/zip"
import { validateStudentData, THEME_COLORS, BLOOD_GROUPS } from "@/lib/utils/card-generator"
import { compressToDataUrl } from "@/lib/utils/image-compression"
import Link from "next/link"

interface ValidationError {
  row: number
  data: Record<string, unknown>
  errors: string[]
}

interface ProcessedStudent extends StudentRow {
  photoUrl?: string
  hasPhoto: boolean
}

export default function GenerateCardsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: Excel data
  const [students, setStudents] = useState<StudentRow[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [validStudents, setValidStudents] = useState<StudentRow[]>([])
  
  // Step 2: Photos
  const [photos, setPhotos] = useState<PhotoMapping[]>([])
  const [missingPhotos, setMissingPhotos] = useState<{ rollNo: string; name: string }[]>([])
  const [zipErrors, setZipErrors] = useState<string[]>([])
  
  // Step 3: Preview
  const [selectedTemplate, setSelectedTemplate] = useState<'simple' | 'advanced'>('simple')
  const [selectedOrientation, setSelectedOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0])
  const [processedStudents, setProcessedStudents] = useState<ProcessedStudent[]>([])
  
  // Step 4: Generation
  const [generating, setGenerating] = useState(false)
  const [credits, setCredits] = useState({ total: 0, used: 0 })

  // Fetch school data on mount
  useEffect(() => {
    if (session?.user) {
      const isSuperAdmin = session.user.role === "super_admin"
      if (isSuperAdmin) {
        // Super admin has unlimited credits
        setCredits({ total: Infinity, used: 0 })
      } else if (session.user.schoolId) {
        fetch("/api/school/profile")
          .then(res => res.json())
          .then(data => {
            if (data.school) {
              setCredits({
                total: data.school.totalCredits,
                used: data.school.usedCredits
              })
            }
          })
      }
    }
  }, [session])

  const isSuperAdmin = session?.user?.role === "super_admin"

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  const steps = [
    { number: 1, title: "Upload Excel", icon: FileSpreadsheet },
    { number: 2, title: "Upload Photos", icon: ImageIcon },
    { number: 3, title: "Preview & Customize", icon: Eye },
    { number: 4, title: "Generate PDF", icon: FileText }
  ]

  // Step 1: Handle Excel upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setValidationErrors([])

    try {
      const buffer = await file.arrayBuffer()
      const data = parseExcelFile(buffer)
      
      // Validate data
      const normalizedData = data.map(row => ({
        rollNo: row.rollNo,
        name: row.name,
        fatherName: row.fatherName,
        className: row.className,
        section: row.section,
        bloodGroup: row.bloodGroup,
        contactNo: row.contactNo,
        address: row.address,
        dateOfBirth: row.dateOfBirth
      }))

      const { valid, invalid } = validateStudentData(normalizedData as Record<string, unknown>[])
      
      setStudents(data)
      setValidStudents(valid as StudentRow[])
      setValidationErrors(invalid)

      if (invalid.length === 0 && valid.length > 0) {
        // Auto proceed if all valid
        setTimeout(() => setCurrentStep(2), 500)
      }
    } catch (error) {
      console.error("Excel parse error:", error)
      setValidationErrors([{
        row: 0,
        data: {},
        errors: ["Failed to parse Excel file. Please check the format."]
      }])
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Handle ZIP upload
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setZipErrors([])

    try {
      const { photos: extractedPhotos, errors } = await processZipFile(file)
      
      setPhotos(extractedPhotos)
      setZipErrors(errors)

      // Find missing photos
      const missing = findMissingPhotos(validStudents, extractedPhotos)
      setMissingPhotos(missing)

      // Process students with photos (compress images for better performance)
      const compressedPhotos = await Promise.all(
        extractedPhotos.map(async (p) => {
          try {
            // Compress the photo to reduce PDF size
            const compressedUrl = await compressToDataUrl(p.blob, { maxSizeMB: 0.03, maxWidthOrHeight: 200 })
            return { ...p, dataUrl: compressedUrl }
          } catch {
            return p // Use original if compression fails
          }
        })
      )
      
      const photoMap = new Map(compressedPhotos.map(p => [p.rollNo.toLowerCase(), p.dataUrl]))
      const processed = validStudents.map(student => ({
        ...student,
        photoUrl: photoMap.get(student.rollNo.toLowerCase()),
        hasPhoto: photoMap.has(student.rollNo.toLowerCase())
      }))
      setProcessedStudents(processed)
      setPhotos(compressedPhotos)

      if (errors.length === 0 && extractedPhotos.length > 0) {
        setTimeout(() => setCurrentStep(3), 500)
      }
    } catch (error) {
      console.error("ZIP parse error:", error)
      setZipErrors(["Failed to process ZIP file"])
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Generate PDF
  const handleGeneratePDF = async () => {
    const studentsWithPhotos = processedStudents.filter(s => s.hasPhoto)
    
    if (studentsWithPhotos.length === 0) {
      alert("No students with photos to generate cards")
      return
    }

    const creditsNeeded = studentsWithPhotos.length
    const availableCredits = credits.total === Infinity ? Infinity : credits.total - credits.used

    // Skip credit check for super admin
    if (!isSuperAdmin && creditsNeeded > availableCredits) {
      alert(`Insufficient credits. Need ${creditsNeeded}, have ${availableCredits}`)
      return
    }

    setGenerating(true)

    try {
      // Import PDF generator
      const { generateCardsPDF, downloadPDF } = await import("@/lib/utils/pdf")
      
      // Prepare data
      const cardData = studentsWithPhotos.map(s => ({
        rollNo: s.rollNo,
        name: s.name,
        fatherName: s.fatherName,
        className: s.className,
        section: s.section,
        bloodGroup: s.bloodGroup,
        contactNo: s.contactNo,
        address: s.address,
        dateOfBirth: s.dateOfBirth,
        photoUrl: s.photoUrl
      }))

      const schoolData = {
        schoolName: session?.user?.name || "School",
        primaryColor: selectedColor.value
      }

      const template = {
        type: selectedTemplate,
        orientation: selectedOrientation,
        primaryColor: selectedColor.value
      }

      const photoMap = new Map(photos.map(p => [p.rollNo.toLowerCase(), p.dataUrl]))
      
      // Generate PDF
      const doc = generateCardsPDF(cardData, schoolData, template, photoMap)
      
      // Download
      downloadPDF(doc, `ID_Cards_${new Date().toISOString().split('T')[0]}.pdf`)

      // Update credits (skip for super admin)
      if (!isSuperAdmin) {
        await fetch("/api/school/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usedCredits: credits.used + creditsNeeded
          })
        })

        setCredits(prev => ({
          ...prev,
          used: prev.used + creditsNeeded
        }))
      }

      alert(`Successfully generated ${studentsWithPhotos.length} ID cards!`)
    } catch (error) {
      console.error("PDF generation error:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setStudents([])
    setValidStudents([])
    setValidationErrors([])
    setPhotos([])
    setMissingPhotos([])
    setZipErrors([])
    setProcessedStudents([])
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (zipInputRef.current) zipInputRef.current.value = ""
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
            <h1 className="text-xl font-bold text-slate-900">Generate ID Cards</h1>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-600">
            {isSuperAdmin 
              ? '∞ Unlimited Credits (Admin)'
              : `Credits: ${credits.total === Infinity ? '∞' : credits.total - credits.used} available`
            }
          </Badge>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  ${currentStep >= step.number 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-400'}
                `}>
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                  <span className="sm:hidden text-sm font-medium">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-2 text-slate-300" />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className="mt-4 h-1" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Upload Excel */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Step 1: Upload Student Data
                </CardTitle>
                <CardDescription>
                  Download the template, fill in student data, and upload the Excel file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Download Template */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">
                    First, download our Excel template and fill in your student data:
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={downloadExcelTemplate}
                    className="w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel Template
                  </Button>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-slate-400">
                      Excel files (.xlsx, .xls) or CSV
                    </p>
                  </label>
                </div>

                {/* Validation Results */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                )}

                {validStudents.length > 0 && validationErrors.length === 0 && (
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700">
                      <strong>{validStudents.length}</strong> student records validated successfully!
                      Proceeding to photo upload...
                    </AlertDescription>
                  </Alert>
                )}

                {validationErrors.length > 0 && (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Found <strong>{validationErrors.length}</strong> rows with errors.
                        Please fix them in your Excel file and re-upload.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Row</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Errors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationErrors.map((error, index) => (
                            <tr key={index} className="border-t bg-red-50">
                              <td className="px-4 py-2">{error.row}</td>
                              <td className="px-4 py-2">{error.data.name || '-'}</td>
                              <td className="px-4 py-2 text-red-600">
                                {error.errors.join(', ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setValidationErrors([])
                        setValidStudents(students)
                        setCurrentStep(2)
                      }}
                    >
                      Continue anyway with {students.length} records
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload Photos */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  Step 2: Upload Student Photos
                </CardTitle>
                <CardDescription>
                  Upload a ZIP file containing student photos. Name each photo with the roll number (e.g., 101.jpg)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Instructions */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Instructions:</strong>
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Put all student photos in a folder</li>
                    <li>Name each photo with the roll number (101.jpg, 102.jpg, etc.)</li>
                    <li>Compress the folder into a ZIP file</li>
                    <li>Supported formats: JPG, PNG, WEBP</li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-emerald-600">{validStudents.length}</p>
                    <p className="text-sm text-slate-600">Students to process</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{photos.length}</p>
                    <p className="text-sm text-slate-600">Photos uploaded</p>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    className="hidden"
                    id="zip-upload"
                  />
                  <label htmlFor="zip-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">
                      Click to upload ZIP file
                    </p>
                    <p className="text-sm text-slate-400">
                      ZIP file containing student photos
                    </p>
                  </label>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                )}

                {/* Missing Photos */}
                {missingPhotos.length > 0 && (
                  <div className="space-y-4">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-amber-700">
                        <strong>{missingPhotos.length}</strong> students are missing photos.
                        They will be skipped during card generation.
                      </AlertDescription>
                    </Alert>

                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Roll No</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {missingPhotos.slice(0, 20).map((missing, index) => (
                            <tr key={index} className="border-t bg-amber-50">
                              <td className="px-4 py-2">{missing.rollNo}</td>
                              <td className="px-4 py-2 text-amber-600">Missing photo</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {missingPhotos.length > 20 && (
                        <p className="text-center text-sm text-slate-500 py-2">
                          ...and {missingPhotos.length - 20} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ZIP Errors */}
                {zipErrors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {zipErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Navigation */}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setCurrentStep(3)}
                    disabled={photos.length === 0}
                  >
                    Continue with {processedStudents.filter(s => s.hasPhoto).length} students
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Preview & Customize */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Step 3: Preview & Customize
                </CardTitle>
                <CardDescription>
                  Select template style and customize colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Template Style</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedTemplate('simple')}
                      className={`p-4 border-2 rounded-lg text-left ${
                        selectedTemplate === 'simple' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <p className="font-medium">Simple</p>
                      <p className="text-sm text-slate-500">Basic info + Photo</p>
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('advanced')}
                      className={`p-4 border-2 rounded-lg text-left ${
                        selectedTemplate === 'advanced' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <p className="font-medium">Advanced</p>
                      <p className="text-sm text-slate-500">Logo + QR Code + Full Info</p>
                    </button>
                  </div>
                </div>

                {/* Orientation */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Card Orientation</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedOrientation('portrait')}
                      className={`p-4 border-2 rounded-lg text-left ${
                        selectedOrientation === 'portrait' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <p className="font-medium">Portrait</p>
                      <p className="text-sm text-slate-500">Vertical card</p>
                    </button>
                    <button
                      onClick={() => setSelectedOrientation('landscape')}
                      className={`p-4 border-2 rounded-lg text-left ${
                        selectedOrientation === 'landscape' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <p className="font-medium">Landscape</p>
                      <p className="text-sm text-slate-500">Horizontal card</p>
                    </button>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor.value === color.value 
                            ? 'border-slate-800 ring-2 ring-slate-300' 
                            : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Selected: {selectedColor.name}</p>
                </div>

                {/* Preview Cards */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">
                    Preview ({processedStudents.filter(s => s.hasPhoto).length} cards)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                    {processedStudents.filter(s => s.hasPhoto).slice(0, 8).map((student, index) => (
                      <div 
                        key={index}
                        className="bg-white border rounded-lg overflow-hidden shadow-sm"
                        style={{ borderColor: selectedColor.value }}
                      >
                        {/* Card Header */}
                        <div 
                          className="p-2 text-white text-center text-xs font-medium"
                          style={{ backgroundColor: selectedColor.value }}
                        >
                          {session?.user?.name || 'School Name'}
                        </div>
                        
                        {/* Photo */}
                        <div className="p-2 flex justify-center">
                          <div className="w-16 h-20 bg-slate-200 rounded overflow-hidden">
                            {student.photoUrl && (
                              <img 
                                src={student.photoUrl} 
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="p-2 text-center text-xs">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-slate-500 truncate">{student.fatherName}</p>
                          <p className="text-slate-400">Class {student.className} • #{student.rollNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setCurrentStep(4)}
                  >
                    Proceed to Generate
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Generate PDF */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Step 4: Generate & Download
                </CardTitle>
                <CardDescription>
                  Review the summary and generate your ID cards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Students with Photos</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {processedStudents.filter(s => s.hasPhoto).length}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Credits Required</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isSuperAdmin ? 'Unlimited' : processedStudents.filter(s => s.hasPhoto).length}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Your Credits</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {isSuperAdmin ? '∞ Unlimited' : credits.total - credits.used}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Total Cost</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isSuperAdmin ? 'FREE (Admin)' : `PKR ${processedStudents.filter(s => s.hasPhoto).length * 10}`}
                    </p>
                  </div>
                </div>

                {/* Template Summary */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Selected Options</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedTemplate}</Badge>
                    <Badge variant="secondary">{selectedOrientation}</Badge>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: selectedColor.value, color: 'white' }}
                    >
                      {selectedColor.name}
                    </Badge>
                  </div>
                </div>

                {/* Warning if insufficient credits (skip for super admin) */}
                {!isSuperAdmin && processedStudents.filter(s => s.hasPhoto).length > (credits.total - credits.used) && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Insufficient credits. You need {processedStudents.filter(s => s.hasPhoto).length} credits but only have {credits.total - credits.used}.
                      <Link href="/dashboard/wallet" className="underline ml-1">
                        Recharge your wallet
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Generate Button */}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleGeneratePDF}
                    disabled={
                      generating || 
                      (!isSuperAdmin && processedStudents.filter(s => s.hasPhoto).length > (credits.total - credits.used))
                    }
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>

                {/* Reset */}
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-500"
                  onClick={resetWizard}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
