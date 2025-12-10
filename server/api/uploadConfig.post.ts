import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import Submission from '../models/Submission'
import runPreLoad from '../utils/runPreLoad'
import { parseConfigFile } from '../utils/config'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    return { success: false, error: 'No file uploaded' }
  }

  const fileData = formData.find((f) => f.name === 'file')
  if (!fileData || !fileData.data) {
    return { success: false, error: 'No file data found' }
  }

  const uuid = getHeader(event, 'redpatch-id')
  if (!uuid) {
    return { success: false, error: 'Missing REDPATCH-ID header' }
  }

  try {
    // Save config file temporarily
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const configDir = join(process.cwd(), 'uploads', 'configs')
    const { mkdir } = await import('node:fs/promises')
    await mkdir(configDir, { recursive: true })

    const pathToFile = join(configDir, filename)
    await writeFile(pathToFile, fileData.data)

    // Find submission and parse config
    const submission = await Submission.findOne({ uuid })
      .populate('files')
      .populate('previewFile')
      .exec()

    if (!submission) {
      return { success: false, error: 'Submission not found via UUID' }
    }

    const parsedConfig = await parseConfigFile(pathToFile)
    await submission.updateConfig(parsedConfig)

    // Run preload with new config
    await runPreLoad(submission)

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: String(err) }
  }
})
