import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import isRunning from 'is-running';
import { S as Submission, r as readConfig } from '../../_/Submission.mjs';
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
import 'fs/promises';
import 'path';
import 'yaml';
import '../../_/generatePreview.mjs';
import 'execa';

const ensurepreloading_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { uuid } = body;
  if (!uuid) {
    return { error: "no uuid supplied" };
  }
  try {
    const submission = await Submission.findOne({ uuid }).populate("files").populate("previewFile").exec();
    if (!submission) {
      return {};
    }
    let config = null;
    try {
      config = await readConfig(uuid);
    } catch (e) {
    }
    if (!submission.preLoading) {
      submission.preLoading = true;
      await submission.save();
      runPreLoad(submission).then(() => console.log("DONE preload")).catch((err) => console.error("Preload error:", err));
      return {
        submission: {
          ...submission.toJSON(),
          config
        }
      };
    } else {
      const reallyRunningLeaf = submission.leafAreaPID ? isRunning(parseInt(submission.leafAreaPID)) : false;
      const reallyRunningHealthy = submission.healthyAreaPID ? isRunning(parseInt(submission.healthyAreaPID)) : false;
      const reallyRunningLesion = submission.lesionAreaPID ? isRunning(parseInt(submission.lesionAreaPID)) : false;
      const reallyRunningScaleCard = submission.hasScaleCard && submission.scaleCardPID ? isRunning(parseInt(submission.scaleCardPID)) : false;
      if (!reallyRunningLeaf && !reallyRunningHealthy && !reallyRunningLesion && !reallyRunningScaleCard) {
        runPreLoad(submission).then(() => console.log("DONE preload")).catch((err) => console.error("Preload error:", err));
      }
      return {
        submission: {
          ...submission.toJSON(),
          config
        }
      };
    }
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
});

export { ensurepreloading_post as default };
//# sourceMappingURL=ensurepreloading.post.mjs.map
