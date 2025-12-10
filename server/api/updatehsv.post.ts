import Submission from '../models/Submission'
import generatePreview from '../utils/generatePreview'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { submission: submissionId, config: newConfig, type } = body

  if (!submissionId || !newConfig || !type) {
    return { error: 'Did not receive "submission", "config", "type"' }
  }

  try {
    const submission = await Submission.findById(submissionId)
      .populate('files')
      .populate('previewFile')
      .exec()

    if (!submission) {
      return { error: 'submission does not exist' }
    }

    // Update config
    await submission.updateConfig(newConfig)
    await submission.save()

    // Generate preview for the changed type
    switch (type) {
      case 'healthy_area':
        await generatePreview.healthyArea(submission)
        break
      case 'leaf_area':
        await generatePreview.leafArea(submission)
        break
      case 'lesion_area':
        await generatePreview.lesionArea(submission)
        break
      case 'scale_card':
        await generatePreview.scaleCard(submission)
        break
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
