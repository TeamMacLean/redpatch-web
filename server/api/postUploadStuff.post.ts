import Submission from '../models/Submission'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uuid, hasScaleCard } = body

  if (!uuid) {
    return { error: 'Did not receive "uuid"' }
  }

  try {
    const submission = await Submission.findOne({ uuid })
      .populate('files')
      .populate('previewFile')
      .exec()

    if (!submission) {
      return { error: 'uuid does not exist' }
    }

    // If only one file, set it as preview file
    if (submission.files && submission.files.length === 1) {
      submission.previewFile = (submission.files[0] as any)._id
    }

    submission.hasScaleCard = !!hasScaleCard
    await submission.save()

    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
