import JSZip from 'jszip'

export interface PhotoMapping {
  rollNo: string
  filename: string
  blob: Blob
  dataUrl: string
}

export async function processZipFile(file: File): Promise<{
  photos: PhotoMapping[]
  errors: string[]
}> {
  const photos: PhotoMapping[] = []
  const errors: string[] = []

  try {
    const zip = new JSZip()
    const contents = await zip.loadAsync(file)
    
    const imageFiles = Object.keys(contents.files).filter(filename => {
      const lower = filename.toLowerCase()
      return !contents.files[filename].dir && 
             (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp'))
    })

    for (const filename of imageFiles) {
      try {
        const file = contents.files[filename]
        const blob = await file.async('blob')
        
        // Extract roll number from filename
        const baseName = filename.split('/').pop() || filename
        const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '')
        const rollNo = nameWithoutExt.trim()
        
        if (!rollNo) {
          errors.push(`Could not extract roll number from: ${filename}`)
          continue
        }

        // Create data URL for preview
        const dataUrl = await blobToDataUrl(blob)
        
        photos.push({
          rollNo,
          filename: baseName,
          blob,
          dataUrl
        })
      } catch {
        errors.push(`Failed to process: ${filename}`)
      }
    }
  } catch (error) {
    errors.push(`Failed to read ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { photos, errors }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function findMissingPhotos(
  students: { rollNo: string }[],
  photos: PhotoMapping[]
): { rollNo: string; name: string }[] {
  const photoRollNos = new Set(photos.map(p => p.rollNo.toLowerCase()))
  
  return students
    .filter(s => !photoRollNos.has(s.rollNo.toLowerCase()))
    .map(s => ({ rollNo: s.rollNo, name: '' }))
}
