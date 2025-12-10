import { d as defineEventHandler, g as getQuery } from '../../nitro/nitro.mjs';
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

const previews_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const uuid = query.uuid;
  if (!uuid) {
    return {};
  }
  try {
    const submission = await Submission.findOne({ uuid }).populate("files").populate("previewFile").exec();
    if (!submission) {
      return { error: "submission not found!" };
    }
    const directory = `/uploads/${uuid}/output/preview`;
    let previewFile;
    if (submission.previewFile) {
      previewFile = submission.previewFile;
    } else if (submission.files && submission.files.length > 0) {
      previewFile = submission.files[0];
    } else {
      return { error: "no preview file available" };
    }
    const urls = {
      original: `${directory}/${previewFile.filename}.jpeg`,
      healthy_area: `${directory}/${previewFile.filename}_healthy_area.jpeg`,
      leaf_area: `${directory}/${previewFile.filename}_leaf_area.jpeg`,
      lesion_area: `${directory}/${previewFile.filename}_lesion_area.jpeg`,
      scale_card: `${directory}/${previewFile.filename}_scale_card.jpeg`
    };
    return { urls };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { previews_get as default };
//# sourceMappingURL=previews.get.mjs.map
