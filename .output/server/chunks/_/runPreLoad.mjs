import { g as generatePreview } from './generatePreview.mjs';

async function runPreLoad(submission) {
  try {
    await generatePreview.leafArea(submission);
    await generatePreview.healthyArea(submission);
    await generatePreview.lesionArea(submission);
    if (submission.hasScaleCard) {
      await generatePreview.scaleCard(submission);
    }
    submission.preLoaded = true;
    await submission.save();
  } catch (err) {
    console.error("PreLoad error:", err);
    throw err;
  }
}

export { runPreLoad as r };
//# sourceMappingURL=runPreLoad.mjs.map
