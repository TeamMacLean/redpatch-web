import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import { readdir, unlink } from 'fs/promises';
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

async function removeUnusedPreviews(directory, fileToKeep) {
  const files = await readdir(directory);
  await Promise.all(files.map(async (file) => {
    if (file !== fileToKeep.filename) {
      try {
        await unlink(join(directory, file));
      } catch (e) {
      }
    }
  }));
}
const setselected_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { submission: submissionId, file: previewFileId } = body;
  if (!submissionId || !previewFileId) {
    return { error: 'Did not receive "submission" AND "file"' };
  }
  try {
    const submission = await Submission.findById(submissionId).populate("files").exec();
    if (!submission) {
      return { error: "submission does not exist" };
    }
    submission.previewFile = previewFileId;
    await submission.save();
    const filterFiles = submission.files.filter((f) => f.id === previewFileId);
    if (filterFiles.length > 0) {
      const previewDir = join(
        process.cwd(),
        filterFiles[0].destination,
        "..",
        "preview"
      );
      await removeUnusedPreviews(previewDir, filterFiles[0]);
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { setselected_post as default };
//# sourceMappingURL=setselected.post.mjs.map
