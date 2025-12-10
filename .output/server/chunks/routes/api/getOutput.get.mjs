import { d as defineEventHandler, g as getQuery } from '../../nitro/nitro.mjs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { S as Submission } from '../../_/Submission.mjs';
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

const getOutput_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const submissionId = query.submission;
  if (!submissionId) {
    return { error: "no submission received" };
  }
  try {
    const submission = await Submission.findById(submissionId).exec();
    if (!submission) {
      return { error: "submission not found!" };
    }
    const directory = join(process.cwd(), "uploads", submission.uuid, "output", "full");
    const baseURL = `/uploads/${submission.uuid}/output/full/`;
    const files = await readdir(directory);
    const fileList = files.map((f) => ({
      filename: f,
      url: baseURL + f
    }));
    return { files: fileList };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { getOutput_get as default };
//# sourceMappingURL=getOutput.get.mjs.map
