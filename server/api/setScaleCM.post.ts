import Submission from '../models/Submission'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { submission: submissionId, scaleCM } = body

  if (!submissionId || scaleCM === undefined) {
    return { error: 'no submission or scaleCM supplied' }
  }

  try {
    const submission = await Submission.findById(submissionId).exec()

    if (!submission) {
      return { error: 'no such submission' }
    }

    submission.scaleCM = scaleCM
    await submission.save()

    return { submission: submission.toJSON() }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
