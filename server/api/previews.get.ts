import Submission from '../models/Submission'

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
      return { error: 'submission not found!' }
    }

    const directory = `/api/uploads/${uuid}/output/preview`

    let previewFile: any
    if (submission.previewFile) {
      previewFile = submission.previewFile
    } else if (submission.files && submission.files.length > 0) {
      previewFile = submission.files[0]
    } else {
      return { error: 'no preview file available' }
    }

    const urls = {
      original: `${directory}/${previewFile.filename}.jpeg`,
      healthy_area: `${directory}/${previewFile.filename}_healthy_area.jpeg`,
      leaf_area: `${directory}/${previewFile.filename}_leaf_area.jpeg`,
      lesion_area: `${directory}/${previewFile.filename}_lesion_area.jpeg`,
      scale_card: `${directory}/${previewFile.filename}_scale_card.jpeg`
    }

    return { urls }
  } catch (err) {
    console.error(err)
    return { error: String(err) }
  }
})
