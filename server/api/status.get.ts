import Submission from '../models/Submission'
import { readConfig } from '../utils/config'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const uuid = query.uuid as string

  if (!uuid) {
    return {}
  }

  try {
    const submission = await Submission.findOne({ uuid })
      .populate('files')
      .populate('previewFile')
      .exec()

    if (!submission) {
      return { error: 'no such submission' }
    }

    // Load config
    let config = null
    try {
      config = await readConfig(uuid)
    } catch {
      // Config might not exist yet
    }

    return {
      submission: {
        ...submission.toJSON(),
        config
      }
    }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
