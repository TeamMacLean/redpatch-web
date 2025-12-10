import _generatePreview from './_generatePreview'

export default (submission) => {
  return _generatePreview
    .leafArea(submission)
    .then(() => {
      return _generatePreview.healthyArea(submission)
    })
    .then(() => {
      return _generatePreview.lesionArea(submission)
    })
    .then(() => {
      if (submission.hasScaleCard) {
        return _generatePreview.scaleCard(submission)
      } else {
        return Promise.resolve()
      }
    })
    .then(() => {
      submission.preLoaded = true
      return submission.save()
    })
    .catch((err) => {
      console.error('BIG ERROR', err)
    })
}
