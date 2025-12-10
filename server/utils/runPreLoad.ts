import generatePreview from './generatePreview'
import type { ISubmission } from '../models/Submission'

export default async function runPreLoad(submission: ISubmission): Promise<void> {
  try {
    await generatePreview.leafArea(submission)
    await generatePreview.healthyArea(submission)
    await generatePreview.lesionArea(submission)

    if (submission.hasScaleCard) {
      await generatePreview.scaleCard(submission)
    }

    submission.preLoaded = true
    await submission.save()
  } catch (err) {
    console.error('PreLoad error:', err)
    throw err
  }
}
