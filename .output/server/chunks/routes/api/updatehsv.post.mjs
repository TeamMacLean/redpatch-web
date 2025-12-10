import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import { S as Submission } from '../../_/Submission.mjs';
import { g as generatePreview } from '../../_/generatePreview.mjs';
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
import 'execa';

const updatehsv_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { submission: submissionId, config: newConfig, type } = body;
  if (!submissionId || !newConfig || !type) {
    return { error: 'Did not receive "submission", "config", "type"' };
  }
  try {
    const submission = await Submission.findById(submissionId).populate("files").populate("previewFile").exec();
    if (!submission) {
      return { error: "submission does not exist" };
    }
    await submission.updateConfig(newConfig);
    await submission.save();
    switch (type) {
      case "healthy_area":
        await generatePreview.healthyArea(submission);
        break;
      case "leaf_area":
        await generatePreview.leafArea(submission);
        break;
      case "lesion_area":
        await generatePreview.lesionArea(submission);
        break;
      case "scale_card":
        await generatePreview.scaleCard(submission);
        break;
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { updatehsv_post as default };
//# sourceMappingURL=updatehsv.post.mjs.map
