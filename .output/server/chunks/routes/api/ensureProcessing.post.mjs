import { u as useRuntimeConfig, d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import isRunning from 'is-running';
import { S as Submission } from '../../_/Submission.mjs';
import { execa } from 'execa';
import { join } from 'path';
import { F as File } from '../../_/File.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import 'fs/promises';
import 'yaml';

async function proceed(submission, extraArgs = []) {
  var _a;
  const config = useRuntimeConfig();
  const uploadsPath = join(".", "uploads");
  const configPath = join(uploadsPath, submission.uuid, "config.yaml");
  const inputFolderPath = join(uploadsPath, submission.uuid, "input");
  const outputFolderPath = join(uploadsPath, submission.uuid, "output");
  const fullResInputFolderPath = join(inputFolderPath, "full");
  const fullResOutputFolderPath = join(outputFolderPath, "full");
  const args = [
    "--use_on_server",
    "--source_folder",
    fullResInputFolderPath,
    "--destination_folder",
    fullResOutputFolderPath,
    "--filter_settings",
    configPath,
    ...extraArgs
  ];
  console.log("RUNNING:", config.batchProcessPath, args.join(" "));
  const subprocess = execa(config.batchProcessPath, args);
  submission.processingPID = (_a = subprocess.pid) == null ? void 0 : _a.toString();
  await submission.save();
  try {
    const result = await subprocess;
    console.log("DONE!", result);
  } catch (err) {
    console.error("Processing error:", err);
  }
  submission.processedAll = true;
  submission.processingPID = void 0;
  await submission.save();
}
async function runProcessAll(submission) {
  if (submission.hasScaleCard) {
    const uploadFile = await File.findById(submission.previewFile).exec();
    if (uploadFile) {
      const extraArgs = [
        "--scale_image_name",
        uploadFile.filename,
        "--scale_card_side_length",
        String(submission.scaleCM)
      ];
      return proceed(submission, extraArgs);
    }
  }
  return proceed(submission, []);
}

const ensureProcessing_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { submission: submissionId } = body;
  if (!submissionId) {
    return { error: "no submission supplied" };
  }
  try {
    const submission = await Submission.findById(submissionId).exec();
    if (!submission) {
      return { error: "no such submission" };
    }
    if (!submission.processedAll && !submission.preLoading) {
      submission.preLoading = true;
      await submission.save();
      runProcessAll(submission).then(() => console.log("DONE processing")).catch((err) => console.error("Processing error:", err));
      return { submission: submission.toJSON() };
    } else {
      const reallyRunning = submission.processingPID ? isRunning(parseInt(submission.processingPID)) : false;
      if (!reallyRunning) {
        console.log("Process was not running, restarting...");
        runProcessAll(submission).then(() => console.log("DONE processing")).catch((err) => console.error("Processing error:", err));
      }
      return { submission: submission.toJSON() };
    }
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { ensureProcessing_post as default };
//# sourceMappingURL=ensureProcessing.post.mjs.map
