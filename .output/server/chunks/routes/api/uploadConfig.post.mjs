import { d as defineEventHandler, a as readMultipartFormData, b as getHeader } from '../../nitro/nitro.mjs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { S as Submission, p as parseConfigFile } from '../../_/Submission.mjs';
import { r as runPreLoad } from '../../_/runPreLoad.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import 'yaml';
import '../../_/generatePreview.mjs';
import 'execa';

const uploadConfig_post = defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    return { success: false, error: "No file uploaded" };
  }
  const fileData = formData.find((f) => f.name === "file");
  if (!fileData || !fileData.data) {
    return { success: false, error: "No file data found" };
  }
  const uuid = getHeader(event, "redpatch-id");
  if (!uuid) {
    return { success: false, error: "Missing REDPATCH-ID header" };
  }
  try {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const configDir = join(process.cwd(), "uploads", "configs");
    const { mkdir } = await import('fs/promises');
    await mkdir(configDir, { recursive: true });
    const pathToFile = join(configDir, filename);
    await writeFile(pathToFile, fileData.data);
    const submission = await Submission.findOne({ uuid }).populate("files").populate("previewFile").exec();
    if (!submission) {
      return { success: false, error: "Submission not found via UUID" };
    }
    const parsedConfig = await parseConfigFile(pathToFile);
    await submission.updateConfig(parsedConfig);
    await runPreLoad(submission);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: String(err) };
  }
});

export { uploadConfig_post as default };
//# sourceMappingURL=uploadConfig.post.mjs.map
