const mongoose = require('mongoose-fill')

const schema = new mongoose.Schema(
  {
    // name: { type: String, required: true },
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
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    mimetype: {
      required: true,
      type: String
    }
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

let File
try {
  File = mongoose.model('File')
} catch (error) {
  File = mongoose.model('File', schema)
}
export default File
