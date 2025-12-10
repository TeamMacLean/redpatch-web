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

const postUploadStuff_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { uuid, hasScaleCard } = body;
  if (!uuid) {
    return { error: 'Did not receive "uuid"' };
  }
  try {
    const submission = await Submission.findOne({ uuid }).populate("files").populate("previewFile").exec();
    if (!submission) {
      return { error: "uuid does not exist" };
    }
    if (submission.files && submission.files.length === 1) {
      submission.previewFile = submission.files[0]._id;
    }
    submission.hasScaleCard = !!hasScaleCard;
    await submission.save();
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { postUploadStuff_post as default };
//# sourceMappingURL=postUploadStuff.post.mjs.map
