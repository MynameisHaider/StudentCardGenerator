import * as XLSX from 'xlsx'

export interface StudentRow {
  rollNo: string
  name: string
  fatherName: string
  className: string
  section?: string
  bloodGroup?: string
  contactNo?: string
  address?: string
  dateOfBirth?: string
}

export function generateExcelTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  
  const templateData = [
    {
      'Roll No': '101',
      'Name': 'Ahmed Khan',
      'Father Name': 'Muhammad Khan',
      'Class': '10',
      'Section': 'A',
      'Blood Group': 'A+',
      'Contact No': '03001234567',
      'Address': 'House 123, Street 4, Lahore',
      'Date of Birth': '2008-05-15'
    },
    {
      'Roll No': '102',
      'Name': 'Fatima Ali',
      'Father Name': 'Syed Ali',
      'Class': '10',
      'Section': 'B',
      'Blood Group': 'B+',
      'Contact No': '03007654321',
      'Address': 'House 456, Street 7, Karachi',
      'Date of Birth': '2008-08-20'
    }
  ]
  
  const ws = XLSX.utils.json_to_sheet(templateData)
  
  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, // Roll No
    { wch: 20 }, // Name
    { wch: 20 }, // Father Name
    { wch: 8 },  // Class
    { wch: 8 },  // Section
    { wch: 12 }, // Blood Group
    { wch: 15 }, // Contact No
    { wch: 30 }, // Address
    { wch: 12 }, // DOB
  ]
  
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

export function parseExcelFile(buffer: ArrayBuffer): StudentRow[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
  
  return data.map(row => ({
    rollNo: String(row['Roll No'] || row['roll_no'] || row['RollNo'] || '').trim(),
    name: String(row['Name'] || row['name'] || '').trim(),
    fatherName: String(row['Father Name'] || row['father_name'] || row['FatherName'] || '').trim(),
    className: String(row['Class'] || row['class'] || row['className'] || '').trim(),
    section: String(row['Section'] || row['section'] || '').trim() || undefined,
    bloodGroup: String(row['Blood Group'] || row['blood_group'] || row['BloodGroup'] || '').trim().toUpperCase() || undefined,
    contactNo: String(row['Contact No'] || row['contact_no'] || row['ContactNo'] || row['Phone'] || '').trim() || undefined,
    address: String(row['Address'] || row['address'] || '').trim() || undefined,
    dateOfBirth: String(row['Date of Birth'] || row['date_of_birth'] || row['DOB'] || '').trim() || undefined
  }))
}

export function downloadExcelTemplate() {
  const buffer = generateExcelTemplate()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'SmartCard_Student_Template.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
