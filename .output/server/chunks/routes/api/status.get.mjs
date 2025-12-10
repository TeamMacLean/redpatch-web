import { d as defineEventHandler, g as getQuery } from '../../nitro/nitro.mjs';
import { S as Submission, r as readConfig } from '../../_/Submission.mjs';
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

const status_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const uuid = query.uuid;
  if (!uuid) {
    return {};
  }
  try {
    const submission = await Submission.findOne({ uuid }).populate("files").populate("previewFile").exec();
    if (!submission) {
      return { error: "no such submission" };
    }
    let config = null;
    try {
      config = await readConfig(uuid);
    } catch (e) {
    }
    return {
      submission: {
        ...submission.toJSON(),
        config
      }
    };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { status_get as default };
//# sourceMappingURL=status.get.mjs.map
