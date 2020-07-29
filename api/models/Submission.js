const mongoose = require('mongoose-fill')

import config from '../_config';
// import path from 'path';
// import fs from 'fs';

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String
    },
    previewFile: {
        type: mongoose.Schema.Types.ObjectId, ref: 'File', required: false
    },
    preLoading: {
        default: false,
        type: Boolean
    },
    preLoaded: {
        default: false,
        type: Boolean
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
    legionAreaPID: {
        type: String
    },
    scaleCardPID: {
        type: String
    },
}, { timestamps: true, toJSON: { virtuals: true } });


schema.fill('config', function (callback) {
    config.read(this.uuid)
        .then(data => {
            return callback(null, data)
        })
        .catch(err => {
            return callback(err, null)
        })
})

schema.virtual('files', {
    ref: 'File',
    localField: '_id',
    foreignField: 'submission',
    justOne: false, // set true for one-to-one relationship
});

schema.pre('save', function (next) {
    const self = this;
    if (self.isNew) {

        config.write(self.uuid, config.DEFAULTS)
            .then(() => {
                return next();
            })
            .catch(err => {
                console.log('failed to write', err)
                return next(err);
            })
    } else {
        next();
    }
})

schema.methods.updateConfig = function updateConfig(newConfig, cb) {
    config.write(this.uuid, newConfig)
        .then(() => {
            cb();
        })
        .catch(err => {
            cb(err);
        })
};

let Submission
try {
    Submission = mongoose.model('Submission')
} catch (error) {
    Submission = mongoose.model('Submission', schema)
}

export default Submission