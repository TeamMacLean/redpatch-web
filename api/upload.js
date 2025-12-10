// import jimp from 'jimp';
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

import File from './models/File'
import Submission from './models/Submission'
import multer from 'multer'
const upload = multer({ dest: 'uploads/' })

// const PREVIEW_MAX_DIMENTIONS = { width: 400, height: 400 }
const PREVIEW_MAX_DIMENTIONS = { width: 1600, height: 1600 }

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return { width: Math.round(srcWidth * ratio), height: Math.round(srcHeight * ratio) }
}

function findOrMakeSubmission(uuid) {
  return Submission.findOne({ uuid }).then((submission) => {
    if (submission) {
      return Promise.resolve(submission)
    } else {
      return new Submission({ uuid }).save()
    }
  })
}

export default function (req, res, next) {
  // req is the Node.js http request object

  upload.single('file')(req, res, function () {
    const uuid = req.headers['redpatch-id']

    //TODO make uuidfolder, uuid/input folder, uuid/output folder

    // const fileDestination = path.join('uploads', uuid, 'input');
    const fullResDestination = path.join('uploads', uuid, 'input', 'full')
    const inputFolderPath = path.join(__dirname, '..', 'uploads', uuid, 'input')
    const fullResInputFolderPath = path.join(inputFolderPath, 'full')
    const previewResInputFolderPath = path.join(inputFolderPath, 'preview')
    const outputFolderPath = path.join(__dirname, '..', 'uploads', uuid, 'output')

    const fullResOutputFolderPath = path.join(outputFolderPath, 'full')
    const previewResOutputFolderPath = path.join(outputFolderPath, 'preview')

    const oldPath = path.join(__dirname, '..', req.file.destination, req.file.filename)
    const newPath = path.join(fullResInputFolderPath, req.file.filename)

    Promise.all([
      new Promise((good, bad) => {
        fs.mkdir(fullResInputFolderPath, { recursive: true }, function (err) {
          if (err) {
            bad(err)
          } else {
            good()
          }
        })
      }),
      new Promise((good, bad) => {
        fs.mkdir(previewResInputFolderPath, { recursive: true }, function (err) {
          if (err) {
            bad(err)
          } else {
            good()
          }
        })
      }),
      new Promise((good, bad) => {
        fs.mkdir(fullResOutputFolderPath, { recursive: true }, function (err) {
          if (err) {
            bad(err)
          } else {
            good()
          }
        })
      }),
      new Promise((good, bad) => {
        fs.mkdir(previewResOutputFolderPath, { recursive: true }, function (err) {
          if (err) {
            bad(err)
          } else {
            good()
          }
        })
      })
    ])
      .then(() => {
        return new Promise((good, bad) => {
          fs.rename(oldPath, newPath, function (err) {
            if (err) {
              return bad(err)
            } else {
              return good()
            }
          })
        })
      })
      .then(() => {
        return findOrMakeSubmission(uuid)
      })
      .then((submission) => {
        const image = sharp(newPath)
        return image.metadata().then((imageMetadata) => {
          const newSize = calculateAspectRatioFit(
            imageMetadata.width,
            imageMetadata.height,
            PREVIEW_MAX_DIMENTIONS.width,
            PREVIEW_MAX_DIMENTIONS.height
          )
          const previewInputPath = path.join(previewResInputFolderPath, req.file.filename)
          const previewOutputPath =
            path.join(previewResOutputFolderPath, req.file.filename) + '.jpeg'

          const pre = image.resize({ width: newSize.width, height: newSize.height })

          Promise.all([
            new Promise((good, bad) => {
              pre.toFile(previewInputPath, (err, info) => {
                if (err) {
                  bad(err)
                } else {
                  good()
                }
              })
            }),
            new Promise((good, bad) => {
              pre.toFile(previewOutputPath, (err, info) => {
                if (err) {
                  bad(err)
                } else {
                  good()
                }
              })
            })
          ]).then(() => {
            return new File({
              originalname: req.file.originalname,
              destination: fullResDestination,
              filename: req.file.filename,
              path: path.join(fullResDestination, req.file.filename),
              submission: submission.id,
              mimetype: req.file.mimetype
            }).save()
          })
        })
      })
      .then((savedFile) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true }, null, 3))
      })
      .catch((err) => {
        console.error(err)
        next(err)
      })
  })
}
