import multer from 'multer'
import path from 'path'

import Submission from './models/Submission'
import _runPreLoad from './_runPreLoad'
import _config from './_config'
const upload = multer({ dest: 'uploads/configs' })

export default function (req, res, next) {
  // req is the Node.js http request object

  upload.single('file')(req, res, function () {
    const uuid = req.headers['redpatch-id']
    const file = req.file

    //TODO parse config file
    const pathToFile = path.join(__dirname, '..', 'uploads', 'configs', file.filename)

    Promise.all([
      Submission.findOne({ uuid }).populate('files').populate('previewFile').fill('config'),
      _config.parseFile(pathToFile)
    ])
      .then((output) => {
        // updateConfig
        const foundSubmission = output[0]
        const parsedConfig = output[1]

        if (foundSubmission) {
          return new Promise((good, bad) => {
            foundSubmission.updateConfig(parsedConfig, function (err) {
              if (err) {
                bad(err)
              } else {
                good(foundSubmission)
              }
            })
          })
        } else {
          return Promise.reject('Submission not found via UUID')
        }
      })
      .then((foundSubmission) => {
        return _runPreLoad(foundSubmission)
      })
      .then(() => {
        //TODO reload everything!
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true }, null, 3))
      })
      .catch((err) => {
        console.error(err)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: false, error: err }, null, 3))
      })
  })
}
