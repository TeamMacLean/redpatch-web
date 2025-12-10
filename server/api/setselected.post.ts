import { readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import Submission from '../models/Submission'

async function removeUnusedPreviews(directory: string, fileToKeep: any): Promise<void> {
  const files = await readdir(directory)

  await Promise.all(
    files.map(async (file) => {
      if (file !== fileToKeep.filename) {
        try {
          await unlink(join(directory, file))
        } catch {
          // Ignore errors for missing files
        }
      }
    })
  )
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { submission: submissionId, file: previewFileId } = body

  if (!submissionId || !previewFileId) {
    return { error: 'Did not receive "submission" AND "file"' }
  }

  try {
    const submission = await Submission.findById(submissionId).populate('files').exec()

    if (!submission) {
      return { error: 'submission does not exist' }
    }

    submission.previewFile = previewFileId
    await submission.save()

    const filterFiles = (submission.files as any[]).filter((f) => f.id === previewFileId)

    if (filterFiles.length > 0) {
      const previewDir = join(process.cwd(), filterFiles[0].destination, '..', 'preview')
      await removeUnusedPreviews(previewDir, filterFiles[0])
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
