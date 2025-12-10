import Submission from '../models/Submission'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { submission: submissionId } = body

  if (!submissionId) {
    return { error: 'no submission supplied' }
  }

  try {
    const submission = await Submission.findById(submissionId).exec()

    if (!submission) {
      return { error: 'no such submission' }
    }

    submission.processingAll = true
    await submission.save()

    return { submission: submission.toJSON() }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
