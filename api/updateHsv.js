import bodyParser from 'body-parser';
import path from 'path';

import Submission from './models/Submission';
import _generatePreview from './_generatePreview';

function sendOutput(res, object) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {
    bodyParser.json()(req, res, function () {
        const submissionID = req.body.submission;
        const newConfig = req.body.config

        if (submissionID && newConfig) {
            Submission.findById(submissionID)
                .populate('files')
                .populate('previewFile')
                .fill('config')
                .exec()
                .then(submission => {
                    if (submission) {

                        let fileToUpdate = null;

                        if (submission.previewFile) {
                            fileToUpdate = submission.previewFile;
                        } else {
                            fileToUpdate = submission.files[0];
                        }

                        const inputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'input', 'preview');
                        const outputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'output', 'preview');


                        submission.updateConfig(newConfig, function (err) {

                            if (err) {
                                sendOutput(res, { error: err })
                            } else {
                                submission.save()
                                    .then(savedSubmission => {
                                        savedSubmission.config = newConfig; //tmp
                                        return _generatePreview.run(inputFolderPath, outputFolderPath, savedSubmission)
                                    })
                                    .then(() => {
                                        sendOutput(res, { success: true })
                                    })
                                    .catch(err => {
                                        sendOutput(res, { error: err })
                                    })
                            }
                        })
                    } else {
                        return sendOutput(res, { error: 'submission does not exist' })
                    }
                })
        } else {
            return sendOutput(res, { error: 'Did not receive "submission", "config"' })
        }

    })

}