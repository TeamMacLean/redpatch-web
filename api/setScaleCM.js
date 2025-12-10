import bodyParser from 'body-parser'
import Submission from './models/Submission'

import _runPreLoad from './_runPreLoad'

function sendOutput(res, object) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(object, null, 3))
}

export default function (req, res) {
  bodyParser.json()(req, res, function () {
    const submission = req.body.submission
    const scaleCM = req.body.scaleCM
    if (submission && scaleCM) {
      Submission.findById(submission)
        // .populate('files')
        // .populate('previewFile')
        // .fill('config')
        .exec()
        .then((submission) => {
          if (submission) {
            submission.scaleCM = scaleCM
            return submission.save()
          } else {
            return Promise.reject('no such submission')
          }
        })
        .then(() => {
          sendOutput(res, { submission })
        })
        .catch((err) => {
          sendOutput(res, { error: err })
        })
    } else {
      sendOutput(res, { error: 'no uuid supplied' })
    }
  })
}
