import isRunning from 'is-running'
import Submission from '../models/Submission'
import runProcessAll from '../utils/runProcessAll'

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

    if (!submission.processedAll && !submission.preLoading) {
      submission.preLoading = true
      await submission.save()

      // Start processing in background
      runProcessAll(submission)
        .then(() => console.log('DONE processing'))
        .catch((err) => console.error('Processing error:', err))

      return { submission: submission.toJSON() }
    } else {
      // Check if process is actually running
      const reallyRunning = submission.processingPID
        ? isRunning(Number.parseInt(submission.processingPID))
        : false

      if (!reallyRunning) {
        console.log('Process was not running, restarting...')
        runProcessAll(submission)
          .then(() => console.log('DONE processing'))
          .catch((err) => console.error('Processing error:', err))
      }

      return { submission: submission.toJSON() }
    }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
