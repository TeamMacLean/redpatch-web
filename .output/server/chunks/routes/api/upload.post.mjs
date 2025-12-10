import { d as defineEventHandler, a as readMultipartFormData, c as createError, b as getHeader } from '../../nitro/nitro.mjs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { F as File } from '../../_/File.mjs';
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

const PREVIEW_MAX_DIMENSIONS = { width: 1600, height: 1600 };
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  };
}
async function findOrMakeSubmission(uuid) {
  const existing = await Submission.findOne({ uuid });
  if (existing) {
    return existing;
  }
  return new Submission({ uuid }).save();
}
const upload_post = defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: "No file uploaded"
    });
  }
  const fileData = formData.find((f) => f.name === "file");
  if (!fileData || !fileData.data) {
    throw createError({
      statusCode: 400,
      message: "No file data found"
    });
  }
  const uuid = getHeader(event, "redpatch-id");
  if (!uuid) {
    throw createError({
      statusCode: 400,
      message: "Missing REDPATCH-ID header"
    });
  }
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const originalname = fileData.filename || "unknown";
  const mimetype = fileData.type || "application/octet-stream";
  const fullResDestination = join("uploads", uuid, "input", "full");
  const inputFolderPath = join(process.cwd(), "uploads", uuid, "input");
  const fullResInputFolderPath = join(inputFolderPath, "full");
  const previewResInputFolderPath = join(inputFolderPath, "preview");
  const outputFolderPath = join(process.cwd(), "uploads", uuid, "output");
  const fullResOutputFolderPath = join(outputFolderPath, "full");
  const previewResOutputFolderPath = join(outputFolderPath, "preview");
  try {
    await Promise.all([
      mkdir(fullResInputFolderPath, { recursive: true }),
      mkdir(previewResInputFolderPath, { recursive: true }),
      mkdir(fullResOutputFolderPath, { recursive: true }),
      mkdir(previewResOutputFolderPath, { recursive: true })
    ]);
    const fullResPath = join(fullResInputFolderPath, filename);
    const { writeFile } = await import('fs/promises');
    await writeFile(fullResPath, fileData.data);
    const submission = await findOrMakeSubmission(uuid);
    const image = sharp(fileData.data);
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image dimensions");
    }
    const newSize = calculateAspectRatioFit(
      metadata.width,
      metadata.height,
      PREVIEW_MAX_DIMENSIONS.width,
      PREVIEW_MAX_DIMENSIONS.height
    );
    const previewInputPath = join(previewResInputFolderPath, filename);
    const previewOutputPath = join(previewResOutputFolderPath, filename) + ".jpeg";
    const resizedImage = image.resize({
      width: newSize.width,
      height: newSize.height
    });
    await Promise.all([
      resizedImage.clone().toFile(previewInputPath),
      resizedImage.clone().jpeg().toFile(previewOutputPath)
    ]);
    await new File({
      originalname,
      destination: fullResDestination,
      filename,
      path: join(fullResDestination, filename),
      submission: submission._id,
      mimetype
    }).save();
    return { success: true };
  } catch (err) {
    console.error(err);
    throw createError({
      statusCode: 500,
      message: String(err)
    });
  }
});

export { upload_post as default };
//# sourceMappingURL=upload.post.mjs.map
