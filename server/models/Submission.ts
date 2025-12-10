import mongoose, { Schema, type Document } from 'mongoose'
import { writeConfig, DEFAULTS } from '../utils/config'

export interface ISubmission extends Document {
  uuid: string
  previewFile?: mongoose.Types.ObjectId
  preLoading: boolean
  preLoaded: boolean
  processingPID?: string
  processingAll: boolean
  processedAll: boolean
  scaleCM: number
  hasScaleCard: boolean
  leafAreaPID?: string
  healthyAreaPID?: string
  lesionAreaPID?: string
  scaleCardPID?: string
  createdAt: Date
  updatedAt: Date
  config?: any
  files?: any[]
  updateConfig(newConfig: any): Promise<void>
}

const submissionSchema = new Schema<ISubmission>(
  {
    uuid: {
      required: true,
      type: String
    },
    previewFile: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: false
    },
    preLoading: {
      default: false,
      type: Boolean
    },
    preLoaded: {
      default: false,
      type: Boolean
    },
    processingPID: {
      type: String
    },
    processingAll: {
      default: false,
      type: Boolean
    },
    processedAll: {
      default: false,
      type: Boolean
    },
    scaleCM: {
      type: Number,
      default: 0
    },
    hasScaleCard: {
      default: false,
      type: Boolean
    },
    leafAreaPID: {
      type: String
    },
    healthyAreaPID: {
      type: String
    },
    lesionAreaPID: {
      type: String
    },
    scaleCardPID: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
)

// Virtual for files relationship
submissionSchema.virtual('files', {
  ref: 'File',
  localField: '_id',
  foreignField: 'submission',
  justOne: false
})

// Pre-save hook to create config file for new submissions
submissionSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      await writeConfig(this.uuid, DEFAULTS)
      next()
    } catch (err) {
      console.log('Failed to write config:', err)
      next(err as Error)
    }
  } else {
    next()
  }
})

// Method to update config
submissionSchema.methods.updateConfig = async function (newConfig: any): Promise<void> {
  await writeConfig(this.uuid, newConfig)
}

// Use existing model if available, otherwise create new one
const Submission =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', submissionSchema)

export default Submission
