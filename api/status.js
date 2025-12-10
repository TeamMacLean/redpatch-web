import url from 'url'
import Submission from './models/Submission'

function sendOutput(res, object) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(object, null, 3))
}

export default function (req, res) {
  const queryObject = url.parse(req.url, true).query

  const uuid = queryObject && queryObject.uuid

  if (uuid) {
    Submission.findOne({ uuid })
      .populate('files')
      .populate('previewFile')
      .fill('config')
      .exec()
      .then((submission) => {
        if (submission) {
          sendOutput(res, { submission })
        } else {
          sendOutput(res, { error: 'no such submission' })
        }
      })
      .catch((err) => {
        sendOutput(res, { error: err })
      })
  } else {
    sendOutput(res, {})
  }
}
