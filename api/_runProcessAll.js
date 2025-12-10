import execa from 'execa'
import path from 'path'
import File from '../api/models/File'

const proceed = (submission, extraArgs = []) => {
  return new Promise((good, bad) => {
    let uploadsPath = path.join('.', 'uploads')
    /* const oldUuploadsPath = path.join(__dirname, '..', 'uploads')*/
    const configPath = path.join(uploadsPath, submission.uuid, 'config.yaml')

    const inputFolderPath = path.join(uploadsPath, submission.uuid, 'input')
    const outputFolderPath = path.join(uploadsPath, submission.uuid, 'output')
    const fullResInputFolderPath = path.join(inputFolderPath, 'full')
    const fullResOutputFolderPath = path.join(outputFolderPath, 'full')

    const args = [
      '--use_on_server',
      '--source_folder',
      `${fullResInputFolderPath}`,
      '--destination_folder',
      `${fullResOutputFolderPath}`,
      '--filter_settings',
      `${configPath}`,
      ...extraArgs
    ]

    console.log('RUNNING:')
    console.log(process.env.BATCH_PROCESS_PATH, args.join(' '))

    //--source_folder ~/Desktop/single_image --destination_folder ~/Desktop/test_out --filter_settings ~/Desktop/default_filter.yml
    const exePromise = execa(process.env.BATCH_PROCESS_PATH, args)
    const PID = exePromise.pid

    submission.processingPID = PID
    submission
      .save()
      .then(() => {})
      .catch((err) => {
        console.error('failed to save submission')
      })

    exePromise
      .then((out) => {
        console.log('DONE!', out)

        submission.processedAll = true
        submission.processingPID = null
        submission
          .save()
          .then(() => {
            good()
          })
          .catch((err) => {
            console.error('failed to save submission')
            bad(err)
          })
      })
      .catch((err) => {
        console.error('err!', err)

        submission.processedAll = true
        submission.processingPID = null
        submission
          .save()
          .then(() => {
            good()
          })
          .catch((err) => {
            console.error('failed to save submission', err)
            bad(err)
          })

        // bad(err)
      })
  })
}

export default (submission) => {
  if (submission.hasScaleCard) {
    File.findById(submission.previewFile)
      .exec()
      .then((uploadFile) => {
        let extraArgs = []

        extraArgs.push('--scale_image_name')
        extraArgs.push(`${uploadFile.filename}`)

        extraArgs.push('--scale_card_side_length')
        extraArgs.push(`${submission.scaleCM}`)

        return proceed(submission, extraArgs)
      })
  } else {
    return proceed(submission, [])
  }
}
