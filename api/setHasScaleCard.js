import bodyParser from 'body-parser'
import Submission from './models/Submission';
const fs = require('fs');
const path = require('path');

function sendOutput(res, object) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {

    bodyParser.json()(req, res, function () {

        const submissionID = req.body.submission;
        const hasScaleCard = req.body.hasScaleCard;

        if (submissionID && previewFileID) {
            Submission.findById(submissionID)
                .then(submission => {
                    if (submission) {

                        submission.hasScaleCard = hasScaleCard;

                        submission.save()
                            .then(() => {
                                return sendOutput(res, { success: true })
                            })
                            .catch(err => {
                                return sendOutput(res, { error: err })
                            })

                    } else {
                        return sendOutput(res, { error: 'submission does not exist' })
                    }
                })
        } else {
            return sendOutput(res, { error: 'Did not receive "submission" AND "hasScaleCard"' })
        }

    })

}