import isRunning from 'is-running'
import Submission from '../models/Submission'
import runPreLoad from '../utils/runPreLoad'
import { readConfig } from '../utils/config'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uuid } = body

  if (!uuid) {
    return { error: 'no uuid supplied' }
  }

  try {
    const submission = await Submission.findOne({ uuid })
      .populate('files')
      .populate('previewFile')
      .exec()

    if (!submission) {
      return {}
    }

    // Load config
    let config = null
    try {
      config = await readConfig(uuid)
    } catch {
      // Config might not exist yet
    }

    if (!submission.preLoading) {
      submission.preLoading = true
      await submission.save()

      // Start preloading in background
      runPreLoad(submission)
        .then(() => console.log('DONE preload'))
        .catch((err) => console.error('Preload error:', err))

      return {
        submission: {
          ...submission.toJSON(),
          config
        }
      }
    } else {
      // Check if processes are actually running
      const reallyRunningLeaf = submission.leafAreaPID
        ? isRunning(Number.parseInt(submission.leafAreaPID))
        : false
      const reallyRunningHealthy = submission.healthyAreaPID
        ? isRunning(Number.parseInt(submission.healthyAreaPID))
        : false
      const reallyRunningLesion = submission.lesionAreaPID
        ? isRunning(Number.parseInt(submission.lesionAreaPID))
        : false
      const reallyRunningScaleCard =
        submission.hasScaleCard && submission.scaleCardPID
          ? isRunning(Number.parseInt(submission.scaleCardPID))
          : false

      if (
        !reallyRunningLeaf &&
        !reallyRunningHealthy &&
        !reallyRunningLesion &&
        !reallyRunningScaleCard
      ) {
        // Not really running, restart
        runPreLoad(submission)
          .then(() => console.log('DONE preload'))
          .catch((err) => console.error('Preload error:', err))
      }

      return {
        submission: {
          ...submission.toJSON(),
          config
        }
      }
    }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
