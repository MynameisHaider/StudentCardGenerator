import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 0.05, // 50KB
  maxWidthOrHeight: 300,
  useWebWorker: true
}

export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<Blob> {
  const mergedOptions = { ...defaultOptions, ...options }
  
  try {
    // Convert Blob to File if needed
    const imageFile = file instanceof File 
      ? file 
      : new File([file], 'image.jpg', { type: file.type || 'image/jpeg' })
    
    const compressedBlob = await imageCompression(imageFile, {
      maxSizeMB: mergedOptions.maxSizeMB,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
      useWebWorker: mergedOptions.useWebWorker,
      fileType: 'image/jpeg'
    })
    
    return compressedBlob
  } catch (error) {
    console.error('Image compression error:', error)
    // Return original if compression fails
    return file
  }
}

export async function compressMultipleImages(
  files: (File | Blob)[],
  options: CompressionOptions = {}
): Promise<Blob[]> {
  return Promise.all(files.map(file => compressImage(file, options)))
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

// Compress and convert to data URL in one step
export async function compressToDataUrl(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const compressedBlob = await compressImage(file, options)
  return blobToDataUrl(compressedBlob)
}
