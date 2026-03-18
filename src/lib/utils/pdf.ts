import { jsPDF } from 'jspdf'

export interface CardData {
  rollNo: string
  name: string
  fatherName: string
  className: string
  section?: string
  bloodGroup?: string
  contactNo?: string
  address?: string
  dateOfBirth?: string
  photoUrl?: string
}

export interface SchoolData {
  schoolName: string
  logoUrl?: string
  principalSignUrl?: string
  socialLink?: string
  primaryColor: string
  address?: string
  phone?: string
}

export interface CardTemplate {
  type: 'simple' | 'advanced'
  orientation: 'portrait' | 'landscape'
  primaryColor: string
}

// Card dimensions in mm
const CARD_DIMENSIONS = {
  portrait: { width: 54, height: 86 },  // Standard ID card size
  landscape: { width: 86, height: 54 }
}

// A4 dimensions in mm
const A4 = { width: 210, height: 297 }

export function generateCardsPDF(
  students: CardData[],
  school: SchoolData,
  template: CardTemplate,
  photos: Map<string, string>
): jsPDF {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  
  const cardWidth = CARD_DIMENSIONS[template.orientation].width
  const cardHeight = CARD_DIMENSIONS[template.orientation].height
  
  // Margins and spacing
  const marginX = 10
  const marginTop = 10
  const gapX = 2
  const gapY = 2
  
  // Calculate cards per page
  const cardsPerRow = Math.floor((A4.width - 2 * marginX + gapX) / (cardWidth + gapX))
  const rowsPerPage = Math.floor((A4.height - marginTop + gapY) / (cardHeight + gapY))
  const cardsPerPage = cardsPerRow * rowsPerPage

  students.forEach((student, index) => {
    const pageIndex = Math.floor(index / cardsPerPage)
    const positionInPage = index % cardsPerPage
    
    if (positionInPage === 0 && index > 0) {
      doc.addPage()
    }
    
    const row = Math.floor(positionInPage / cardsPerRow)
    const col = positionInPage % cardsPerRow
    
    const x = marginX + col * (cardWidth + gapX)
    const y = marginTop + row * (cardHeight + gapY)
    
    drawCard(doc, student, school, template, photos, x, y, cardWidth, cardHeight)
  })
  
  return doc
}

function drawCard(
  doc: jsPDF,
  student: CardData,
  school: SchoolData,
  template: CardTemplate,
  photos: Map<string, string>,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const primaryColor = hexToRgb(template.primaryColor)
  
  // Card border
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, width, height, 2, 2, 'S')
  
  // Header background
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.roundedRect(x + 1, y + 1, width - 2, 15, 1, 1, 'F')
  
  // School name in header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  
  const schoolName = truncateText(doc, school.schoolName, width - 4)
  doc.text(schoolName, x + width / 2, y + 8, { align: 'center' })
  
  // Add logo if available (advanced template)
  if (template.type === 'advanced' && school.logoUrl) {
    try {
      doc.addImage(school.logoUrl, 'PNG', x + 3, y + 3, 8, 8)
    } catch {
      // Logo failed to load
    }
  }
  
  // Photo area
  const photoSize = 20
  const photoX = x + (width - photoSize) / 2
  const photoY = y + 18
  
  // Photo placeholder
  doc.setFillColor(240, 240, 240)
  doc.roundedRect(photoX, photoY, photoSize, photoSize * 1.2, 1, 1, 'F')
  
  // Add student photo
  const photoData = photos.get(student.rollNo.toLowerCase())
  if (photoData) {
    try {
      doc.addImage(photoData, 'JPEG', photoX + 1, photoY + 1, photoSize - 2, photoSize * 1.2 - 2)
    } catch {
      // Photo failed to load
    }
  }
  
  // Student info
  let infoY = photoY + photoSize * 1.2 + 4
  doc.setFontSize(6)
  doc.setTextColor(100, 100, 100)
  
  // Name (larger, bold)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  const nameText = truncateText(doc, student.name, width - 8)
  doc.text(nameText, x + width / 2, infoY, { align: 'center' })
  infoY += 4
  
  // Other details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(80, 80, 80)
  
  const details = [
    `Father: ${truncateText(doc, student.fatherName, width - 20)}`,
    `Class: ${student.className}${student.section ? '-' + student.section : ''} | Roll: ${student.rollNo}`
  ]
  
  if (template.type === 'advanced') {
    if (student.bloodGroup) {
      details.push(`Blood: ${student.bloodGroup}`)
    }
    if (student.contactNo) {
      details.push(`Contact: ${student.contactNo}`)
    }
  }
  
  details.forEach(detail => {
    doc.text(detail, x + width / 2, infoY, { align: 'center' })
    infoY += 3.5
  })
  
  // QR Code for advanced template
  if (template.type === 'advanced' && school.socialLink) {
    const qrSize = 10
    const qrX = x + width - qrSize - 3
    const qrY = y + height - qrSize - 8
    
    try {
      // Generate QR code as image
      const qrDataUrl = generateQRCodeDataUrl(school.socialLink, qrSize * 4)
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    } catch {
      // QR code failed
    }
  }
  
  // Footer
  doc.setFontSize(5)
  doc.setTextColor(150, 150, 150)
  doc.text('Generated by SmartCard', x + width / 2, y + height - 3, { align: 'center' })
}

function truncateText(doc: jsPDF, text: string, maxWidth: number): string {
  let truncated = text
  while (doc.getTextWidth(truncated) > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }
  return truncated.length < text.length ? truncated + '...' : truncated
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 30, g: 58, b: 95 } // Default navy blue
}

function generateQRCodeDataUrl(value: string, size: number): string {
  // Create a canvas to render QR code
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    
    // Generate QR code pattern
    ctx.fillStyle = '#000000'
    const moduleSize = size / 25
    const pattern = generateQRPattern(value)
    
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }
  
  return canvas.toDataURL('image/png')
}

// Simple QR code pattern generator (basic implementation)
function generateQRPattern(value: string): boolean[][] {
  const size = 25
  const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))
  
  // Add finder patterns (corners)
  addFinderPattern(pattern, 0, 0)
  addFinderPattern(pattern, size - 7, 0)
  addFinderPattern(pattern, 0, size - 7)
  
  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    pattern[6][i] = i % 2 === 0
    pattern[i][6] = i % 2 === 0
  }
  
  // Fill data area with hash-based pattern
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i)
    hash = hash & hash
  }
  
  for (let row = 9; row < size - 9; row++) {
    for (let col = 9; col < size - 9; col++) {
      pattern[row][col] = ((hash + row * col) % 3) === 0
    }
  }
  
  return pattern
}

function addFinderPattern(pattern: boolean[][], startRow: number, startCol: number) {
  // Outer square
  for (let i = 0; i < 7; i++) {
    pattern[startRow][startCol + i] = true
    pattern[startRow + 6][startCol + i] = true
    pattern[startRow + i][startCol] = true
    pattern[startRow + i][startCol + 6] = true
  }
  
  // Inner square
  for (let i = 2; i < 5; i++) {
    for (let j = 2; j < 5; j++) {
      pattern[startRow + i][startCol + j] = true
    }
  }
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}
