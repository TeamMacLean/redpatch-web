import url from 'url'
import fs from 'fs'
import path from 'path'

import Submission from './models/Submission'

function sendOutput(res, object) {
  if (object.error) {
    console.error(object.error)
  }
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(object, null, 3))
}

export default function (req, res) {
  const queryObject = url.parse(req.url, true).query
  const submission = queryObject && queryObject.submission

  if (submission) {
    Submission.findById(submission)
      // .populate('files')
      // .populate('previewFile')
      .then((foundSubmission) => {
        if (foundSubmission) {
          const directory = path.join(
            __dirname,
            '..',
            'uploads',
            foundSubmission.uuid,
            'output',
            'full'
          )
          const baseURL = `/uploads/${foundSubmission.uuid}/output/full/`

          fs.readdir(directory, function (err, files) {
            //handling error
            if (err) {
              sendOutput(res, { error: err })
            }

            //todo make urls

            files = files.map((f) => {
              return { filename: f, url: baseURL + f }
            })

            sendOutput(res, { files })
          })
        } else {
          sendOutput(res, { error: 'submission not found!' })
        }
      })
      .catch((err) => {
        sendOutput(res, { error: err })
      })
  } else {
    sendOutput(res, { error: 'no submission received' })
  }
}
