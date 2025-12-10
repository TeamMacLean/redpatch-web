import bodyParser from 'body-parser'
import Submission from './models/Submission'
// const fs = require('fs');
// const path = require('path');

function sendOutput(res, object) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(object, null, 3))
}

export default function (req, res) {
  bodyParser.json()(req, res, function () {
    const uuid = req.body.uuid
    const hasScaleCard = req.body.hasScaleCard

    if (uuid) {
      Submission.findOne({ uuid })
        .populate('files')
        .populate('previewFile')
        .then((submission) => {
          if (submission) {
            if (submission.files.length === 1) {
              submission.previewFile = submission.files[0].id
            }

            submission.hasScaleCard = !!hasScaleCard

            submission
              .save()
              .then(() => {
                return sendOutput(res, { success: true })
              })
              .catch((err) => {
                return sendOutput(res, { error: err })
              })
          } else {
            return sendOutput(res, { error: 'uuid does not exist' })
          }
        })
    } else {
      return sendOutput(res, { error: 'Did not receive "uuid" AND "hasScaleCard"' })
    }
  })
}
