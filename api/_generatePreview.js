import path from 'path'
import { PythonShell } from 'python-shell'

// import config from './_config';

function _run(scriptPath, filePostfix, submission, PID_NAME) {
  return new Promise((good, bad) => {
    let uploadsPath = path.join('.', 'uploads')
    /* const oldUuploadsPath = path.join(__dirname, '..', 'uploads')*/
    const configPath = path.join(uploadsPath, submission.uuid, 'config.yaml')

    //what type to run
    const inputFolderPath = path.join(uploadsPath, submission.uuid, 'input', 'preview')
    const outputFolderPath = path.join(uploadsPath, submission.uuid, 'output', 'preview')

    const previewInputFile = path.join(inputFolderPath, submission.previewFile.filename)
    const previewOutputFile =
      path.join(outputFolderPath, submission.previewFile.filename) + filePostfix

    let options = {
      mode: 'text',
      pythonPath: process.env.PYTHON,
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: __dirname,
      args: [previewInputFile, previewOutputFile, configPath]
    }
    const pythonShell = new PythonShell(scriptPath, options)
    submission[PID_NAME] = pythonShell.childProcess.pid
    submission
      .save()
      .then(() => {})
      .catch((err) => {
        console.error(err)
      })

    pythonShell.end(function (err) {
      if (err) {
        bad(err)
      } else {
        good()
      }
    })
  })
}

function healthyArea(submission) {
  return _run('_get_healthy_regions.py', '_healthy_area.jpeg', submission, 'leafAreaPID')
}
function leafArea(submission) {
  return _run('_get_leaf_regions.py', '_leaf_area.jpeg', submission, 'healthyAreaPID')
}
function lesionArea(submission) {
  return _run('_get_lesion_regions.py', '_lesion_area.jpeg', submission, 'lesionAreaPID')
}
function scaleCard(submission) {
  return _run('_get_scale_card.py', '_scale_card.jpeg', submission, 'scaleCardPID')
}

export default { healthyArea, leafArea, lesionArea, scaleCard }
