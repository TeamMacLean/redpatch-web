import _generatePreview from './_generatePreview';

export default (submission) => {
    const promises = [
        _generatePreview.leafArea(submission),
        _generatePreview.healthyArea(submission),
        _generatePreview.lesionArea(submission),
    ]
    if (submission.hasScaleCard) {
        promises.push(_generatePreview.scaleCard(submission))
    }
    return Promise.all(promises)
        .then(() => {
            submission.preLoaded = true;
            return submission.save()
        })
}