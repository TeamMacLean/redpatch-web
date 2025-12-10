import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import Submission from '../models/Submission'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const submissionId = query.submission as string

  if (!submissionId) {
    return { error: 'no submission received' }
  }

  try {
    const submission = await Submission.findById(submissionId).exec()

    if (!submission) {
      return { error: 'submission not found!' }
    }

    const directory = join(process.cwd(), 'uploads', submission.uuid, 'output', 'full')
    const baseURL = `/api/uploads/${submission.uuid}/output/full/`

    const files = await readdir(directory)

    const fileList = files.map((f) => ({
      filename: f,
      url: baseURL + f
    }))

    return { files: fileList }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
