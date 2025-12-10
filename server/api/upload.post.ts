import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import File from '../models/File'
import Submission from '../models/Submission'

const PREVIEW_MAX_DIMENSIONS = { width: 1600, height: 1600 }

function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  }
}

async function findOrMakeSubmission(uuid: string) {
  const existing = await Submission.findOne({ uuid })
  if (existing) {
    return existing
  }
  return new Submission({ uuid }).save()
}

export default defineEventHandler(async (event) => {
  // Read multipart form data
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded'
    })
  }

  const fileData = formData.find((f) => f.name === 'file')
  if (!fileData || !fileData.data) {
    throw createError({
      statusCode: 400,
      message: 'No file data found'
    })
  }

  const uuid = getHeader(event, 'redpatch-id')
  if (!uuid) {
    throw createError({
      statusCode: 400,
      message: 'Missing REDPATCH-ID header'
    })
  }

  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`
  const originalname = fileData.filename || 'unknown'
  const mimetype = fileData.type || 'application/octet-stream'

  const fullResDestination = join('uploads', uuid, 'input', 'full')
  const inputFolderPath = join(process.cwd(), 'uploads', uuid, 'input')
  const fullResInputFolderPath = join(inputFolderPath, 'full')
  const previewResInputFolderPath = join(inputFolderPath, 'preview')
  const outputFolderPath = join(process.cwd(), 'uploads', uuid, 'output')
  const fullResOutputFolderPath = join(outputFolderPath, 'full')
  const previewResOutputFolderPath = join(outputFolderPath, 'preview')

  try {
    // Create directories
    await Promise.all([
      mkdir(fullResInputFolderPath, { recursive: true }),
      mkdir(previewResInputFolderPath, { recursive: true }),
      mkdir(fullResOutputFolderPath, { recursive: true }),
      mkdir(previewResOutputFolderPath, { recursive: true })
    ])

    // Write file to full res input
    const fullResPath = join(fullResInputFolderPath, filename)
    const { writeFile } = await import('node:fs/promises')
    await writeFile(fullResPath, fileData.data)

    // Find or create submission
    const submission = await findOrMakeSubmission(uuid)

    // Process image with sharp
    const image = sharp(fileData.data)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read image dimensions')
    }

    const newSize = calculateAspectRatioFit(
      metadata.width,
      metadata.height,
      PREVIEW_MAX_DIMENSIONS.width,
      PREVIEW_MAX_DIMENSIONS.height
    )

    const previewInputPath = join(previewResInputFolderPath, filename)
    const previewOutputPath = join(previewResOutputFolderPath, filename) + '.jpeg'

    const resizedImage = image.resize({
      width: newSize.width,
      height: newSize.height
    })

    await Promise.all([
      resizedImage.clone().toFile(previewInputPath),
      resizedImage.clone().jpeg().toFile(previewOutputPath)
    ])

    // Save file record
    await new File({
      originalname,
      destination: fullResDestination,
      filename,
      path: join(fullResDestination, filename),
      submission: submission._id,
      mimetype
    }).save()

    return { success: true }
  } catch (err) {
    console.error(err)
    throw createError({
      statusCode: 500,
      message: String(err)
    })
  }
})
