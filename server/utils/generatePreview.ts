import { execa } from 'execa'
import { join } from 'node:path'
import type { ISubmission } from '../models/Submission'

async function runPythonScript(
  scriptName: string,
  filePostfix: string,
  submission: ISubmission,
  pidName: keyof ISubmission
): Promise<void> {
  const config = useRuntimeConfig()
  const uploadsPath = join('.', 'uploads')
  const configPath = join(uploadsPath, submission.uuid, 'config.yaml')

  const inputFolderPath = join(uploadsPath, submission.uuid, 'input', 'preview')
  const outputFolderPath = join(uploadsPath, submission.uuid, 'output', 'preview')

  const previewFile = submission.previewFile as any
  const previewInputFile = join(inputFolderPath, previewFile.filename)
  const previewOutputFile = join(outputFolderPath, previewFile.filename) + filePostfix

  const scriptPath = join(process.cwd(), 'server', 'scripts', scriptName)

  const subprocess = execa(config.python, [
    scriptPath,
    previewInputFile,
    previewOutputFile,
    configPath
  ])

  // Save PID
  ;(submission as any)[pidName] = subprocess.pid?.toString()
  await submission.save()

  // Wait for completion
  await subprocess
}

export async function generateHealthyArea(submission: ISubmission): Promise<void> {
  return runPythonScript(
    '_get_healthy_regions.py',
    '_healthy_area.jpeg',
    submission,
    'healthyAreaPID'
  )
}

export async function generateLeafArea(submission: ISubmission): Promise<void> {
  return runPythonScript('_get_leaf_regions.py', '_leaf_area.jpeg', submission, 'leafAreaPID')
}

export async function generateLesionArea(submission: ISubmission): Promise<void> {
  return runPythonScript('_get_lesion_regions.py', '_lesion_area.jpeg', submission, 'lesionAreaPID')
}

export async function generateScaleCard(submission: ISubmission): Promise<void> {
  return runPythonScript('_get_scale_card.py', '_scale_card.jpeg', submission, 'scaleCardPID')
}

export default {
  healthyArea: generateHealthyArea,
  leafArea: generateLeafArea,
  lesionArea: generateLesionArea,
  scaleCard: generateScaleCard
}
