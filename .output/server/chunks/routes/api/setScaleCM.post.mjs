import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
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
import 'fs/promises';
import 'path';
import 'yaml';

const setScaleCM_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { submission: submissionId, scaleCM } = body;
  if (!submissionId || scaleCM === void 0) {
    return { error: "no submission or scaleCM supplied" };
  }
  try {
    const submission = await Submission.findById(submissionId).exec();
    if (!submission) {
      return { error: "no such submission" };
    }
    submission.scaleCM = scaleCM;
    await submission.save();
    return { submission: submission.toJSON() };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { setScaleCM_post as default };
//# sourceMappingURL=setScaleCM.post.mjs.map
