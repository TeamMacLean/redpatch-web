import mongoose, { Schema } from 'mongoose';

const fileSchema = new Schema({
  originalname: {
    required: true,
    type: String
  },
  destination: {
    required: true,
    type: String
  },
  filename: {
    required: true,
    type: String
  },
  path: {
    required: true,
    type: String
  },
  submission: {
    type: Schema.Types.ObjectId,
    ref: "Submission",
    required: true
  },
  mimetype: {
    required: true,
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});
const File = mongoose.models.File || mongoose.model("File", fileSchema);

export { File as F };
//# sourceMappingURL=File.mjs.map
