import bodyParser from 'body-parser';
import path from 'path';

import Submission from './models/Submission';
import _generatePreview from './_generatePreview';

function sendOutput(res, object) {
    if (object.error) {
        console.error(object.error);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {
    bodyParser.json()(req, res, function () {
        const submissionID = req.body.submission;
        const newConfig = req.body.config;
        const type = req.body.type;

        if (submissionID && newConfig && type) {
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
                            fileToUpdate.previewFile = submission.files[0];
                        }



                        //TODO figure out what has changed
                        submission.updateConfig(newConfig, function (err) {

                            if (err) {
                                sendOutput(res, { error: err })
                            } else {
                                submission.save()
                                    .then(savedSubmission => {
                                        savedSubmission.config = newConfig; //tmp

                                        //what type to run
                                        const inputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'input', 'preview');
                                        const outputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'output', 'preview');

                                        const previewInputFile = path.join(inputFolderPath, fileToUpdate.filename);
                                        const previewOutputFile = path.join(outputFolderPath, fileToUpdate.filename);

                                        switch (type) {
                                            case "healthy_area":
                                                return _generatePreview.healthyArea(previewInputFile, previewOutputFile, savedSubmission)
                                            case "leaf_area":
                                                return _generatePreview.leafArea(previewInputFile, previewOutputFile, savedSubmission)
                                            case "lesion_area":
                                                return _generatePreview.lesionArea(previewInputFile, previewOutputFile, savedSubmission)
                                            case "scale_card":
                                                return _generatePreview.scaleCard(previewInputFile, previewOutputFile, savedSubmission)
                                        }

                                        // return 
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
            return sendOutput(res, { error: 'Did not receive "submission", "config", "type' })
        }

    })

}