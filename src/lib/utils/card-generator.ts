// Card generator utilities
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const CARD_TEMPLATES = {
  simple: {
    name: 'Simple',
    description: 'Basic student info + Photo',
    fields: ['name', 'fatherName', 'className', 'rollNo', 'photo']
  },
  advanced: {
    name: 'Advanced',
    description: 'School Logo + QR Code + Full Info',
    fields: ['name', 'fatherName', 'className', 'section', 'rollNo', 'bloodGroup', 'contactNo', 'photo', 'logo', 'qr']
  }
}

export const THEME_COLORS = [
  { name: 'Navy Blue', value: '#1e3a5f' },
  { name: 'Maroon', value: '#800020' },
  { name: 'Dark Green', value: '#0d5c2e' },
  { name: 'Purple', value: '#4a1a6b' },
  { name: 'Teal', value: '#0d7377' },
  { name: 'Charcoal', value: '#36454f' }
]

export const VALID_ROLL_NO_PATTERN = /^[a-zA-Z0-9]+$/

export function validateStudentData(data: Record<string, unknown>[]): {
  valid: Record<string, unknown>[]
  invalid: { row: number; data: Record<string, unknown>; errors: string[] }[]
} {
  const valid: Record<string, unknown>[] = []
  const invalid: { row: number; data: Record<string, unknown>; errors: string[] }[] = []

  data.forEach((row, index) => {
    const errors: string[] = []
    
    // Check required fields
    if (!row.name || String(row.name).trim() === '') {
      errors.push('Name is required')
    }
    if (!row.fatherName && !row.father_name) {
      errors.push('Father Name is required')
    }
    if (!row.className && !row.class) {
      errors.push('Class is required')
    }
    if (!row.rollNo && !row.roll_no) {
      errors.push('Roll No is required')
    }

    // Validate blood group if provided
    const bloodGroup = row.bloodGroup || row.blood_group
    if (bloodGroup && !BLOOD_GROUPS.includes(String(bloodGroup).toUpperCase())) {
      errors.push(`Invalid blood group. Valid: ${BLOOD_GROUPS.join(', ')}`)
    }

    if (errors.length === 0) {
      valid.push(row)
    } else {
      invalid.push({ row: index + 2, data: row, errors }) // +2 for header row
    }
  })

  return { valid, invalid }
}

export function normalizeFieldName(name: string): string {
  const fieldMap: Record<string, string> = {
    'roll_no': 'rollNo',
    'roll number': 'rollNo',
    'father_name': 'fatherName',
    'fathers name': 'fatherName',
    'father name': 'fatherName',
    'class': 'className',
    'class_name': 'className',
    'blood_group': 'bloodGroup',
    'blood group': 'bloodGroup',
    'contact_no': 'contactNo',
    'contact number': 'contactNo',
    'phone': 'contactNo',
    'date_of_birth': 'dateOfBirth',
    'date of birth': 'dateOfBirth',
    'dob': 'dateOfBirth'
  }
  
  const lowerName = name.toLowerCase().trim()
  return fieldMap[lowerName] || name
}

export function normalizeStudentData(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}
  
  Object.keys(data).forEach(key => {
    const normalizedKey = normalizeFieldName(key)
    normalized[normalizedKey] = data[key]
  })
  
  return normalized
}
