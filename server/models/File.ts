import mongoose, { Schema, type Document } from 'mongoose'

export interface IFile extends Document {
  originalname: string
  destination: string
  filename: string
  path: string
  submission: mongoose.Types.ObjectId
  mimetype: string
  createdAt: Date
  updatedAt: Date
}

const fileSchema = new Schema<IFile>(
  {
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
      ref: 'Submission',
      required: true
    },
    mimetype: {
      required: true,
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
)

// Use existing model if available, otherwise create new one
const File = mongoose.models.File || mongoose.model<IFile>('File', fileSchema)

export default File
