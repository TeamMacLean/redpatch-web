import { u as useRuntimeConfig } from '../nitro/nitro.mjs';
import { execa } from 'execa';
import { join } from 'path';

async function runPythonScript(scriptName, filePostfix, submission, pidName) {
  var _a;
  const config = useRuntimeConfig();
  const uploadsPath = join(".", "uploads");
  const configPath = join(uploadsPath, submission.uuid, "config.yaml");
  const inputFolderPath = join(uploadsPath, submission.uuid, "input", "preview");
  const outputFolderPath = join(uploadsPath, submission.uuid, "output", "preview");
  const previewFile = submission.previewFile;
  const previewInputFile = join(inputFolderPath, previewFile.filename);
  const previewOutputFile = join(outputFolderPath, previewFile.filename) + filePostfix;
  const scriptPath = join(process.cwd(), "server", "scripts", scriptName);
  const subprocess = execa(config.python, [
    scriptPath,
    previewInputFile,
    previewOutputFile,
    configPath
  ]);
  submission[pidName] = (_a = subprocess.pid) == null ? void 0 : _a.toString();
  await submission.save();
  await subprocess;
}
async function generateHealthyArea(submission) {
  return runPythonScript("_get_healthy_regions.py", "_healthy_area.jpeg", submission, "healthyAreaPID");
}
async function generateLeafArea(submission) {
  return runPythonScript("_get_leaf_regions.py", "_leaf_area.jpeg", submission, "leafAreaPID");
}
async function generateLesionArea(submission) {
  return runPythonScript("_get_lesion_regions.py", "_lesion_area.jpeg", submission, "lesionAreaPID");
}
async function generateScaleCard(submission) {
  return runPythonScript("_get_scale_card.py", "_scale_card.jpeg", submission, "scaleCardPID");
}
const generatePreview = {
  healthyArea: generateHealthyArea,
  leafArea: generateLeafArea,
  lesionArea: generateLesionArea,
  scaleCard: generateScaleCard
};

export { generatePreview as g };
//# sourceMappingURL=generatePreview.mjs.map
