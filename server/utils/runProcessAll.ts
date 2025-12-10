import { execa } from 'execa'
import { join } from 'node:path'
import File from '../models/File'
import type { ISubmission } from '../models/Submission'

async function proceed(submission: ISubmission, extraArgs: string[] = []): Promise<void> {
  const config = useRuntimeConfig()
  const uploadsPath = join('.', 'uploads')
  const configPath = join(uploadsPath, submission.uuid, 'config.yaml')

  const inputFolderPath = join(uploadsPath, submission.uuid, 'input')
  const outputFolderPath = join(uploadsPath, submission.uuid, 'output')
  const fullResInputFolderPath = join(inputFolderPath, 'full')
  const fullResOutputFolderPath = join(outputFolderPath, 'full')

  const args = [
    '--use_on_server',
    '--source_folder',
    fullResInputFolderPath,
    '--destination_folder',
    fullResOutputFolderPath,
    '--filter_settings',
    configPath,
    ...extraArgs
  ]

  console.log('RUNNING:', config.batchProcessPath, args.join(' '))

  const subprocess = execa(config.batchProcessPath, args)

  submission.processingPID = subprocess.pid?.toString()
  await submission.save()

  try {
    const result = await subprocess
    console.log('DONE!', result)
  } catch (err) {
    console.error('Processing error:', err)
  }

  submission.processedAll = true
  submission.processingPID = undefined
  await submission.save()
}

export default async function runProcessAll(submission: ISubmission): Promise<void> {
  if (submission.hasScaleCard) {
    const uploadFile = await File.findById(submission.previewFile).exec()

    if (uploadFile) {
      const extraArgs = [
        '--scale_image_name',
        uploadFile.filename,
        '--scale_card_side_length',
        String(submission.scaleCM)
      ]
      return proceed(submission, extraArgs)
    }
  }

  return proceed(submission, [])
}
