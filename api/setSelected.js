import bodyParser from 'body-parser'
import Submission from './models/Submission'
const fs = require('fs')
const path = require('path')

function sendOutput(res, object) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(object, null, 3))
}

function removeUnusedPreviews(directory, fileToKeep) {
  return new Promise((good, bad) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        bad(err)
      } else {
        Promise.all(
          files.map((file) => {
            return new Promise((resolve, reject) => {
              if (file === fileToKeep.filename) {
                resolve()
              } else {
                fs.unlink(path.join(directory, file), (err) => {
                  if (err) {
                    reject()
                  } else {
                    resolve()
                  }
                })
              }
            })
          })
        )
          .then(() => {
            good()
          })
          .catch((err) => bad(err))
      }
    })
  })
}

export default function (req, res) {
  bodyParser.json()(req, res, function () {
    const submissionID = req.body.submission
    const previewFileID = req.body.file

    if (submissionID && previewFileID) {
      Submission.findById(submissionID)
        .populate('files')
        .then((submission) => {
          if (submission) {
            submission.previewFile = previewFileID

            submission
              .save()
              .then(() => {
                const filterFiles = submission.files.filter((f) => f.id === previewFileID)
                if (filterFiles.length < 1) {
                  return Promise.reject('NO FILES ATTACTICED TO SUBMISSION WITH file.id')
                } else {
                  removeUnusedPreviews(
                    path.join(__dirname, '..', filterFiles[0].destination, '..', 'preview'),
                    filterFiles[0]
                  )
                }
              })
              .then(() => {
                return sendOutput(res, { success: true })
              })
              .catch((err) => {
                return sendOutput(res, { error: err })
              })
          } else {
            return sendOutput(res, { error: 'submission does not exist' })
          }
        })
    } else {
      return sendOutput(res, { error: 'Did not receive "submission" AND "file"' })
    }
  })
}
