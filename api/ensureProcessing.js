import bodyParser from 'body-parser';
import isRunning from 'is-running';

import Submission from './models/Submission';

// import _runPreLoad from './_runPreLoad'
import _runProcessAll from './_runProcessAll';

function sendOutput(res, object) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {
    bodyParser.json()(req, res, function () {
        const submission = req.body.submission;
        if (submission) {
            Submission.findById(submission)
                // .populate('files')
                // .populate('previewFile')
                // .fill('config')
                .exec()
                .then(submission => {
                    if (submission) {

                        if (!submission.preLoading) {

                            submission.preLoading = true;
                            submission.save()
                                .then(() => {

                                    _runProcessAll(submission)
                                        .then(() => {
                                            console.log('DONE processing')
                                            //TODO should we do anything here?
                                        })
                                        .catch(err => {
                                            console.error(err);
                                        })

                                    sendOutput(res, { submission })
                                })
                                .catch(err => {
                                    sendOutput(res, { error: err })
                                })


                        } else {

                            //IS IT THO!?
                            const reallyRunning = isRunning(submission.processingPID);

                            if(!reallyRunning){
                                //ISSUE!
                                console.log('it wasnt really running, making it so!')
                                _runProcessAll(submission)
                                        .then(() => {
                                            console.log('DONE processing')
                                        })
                                        .catch(err => {
                                            console.error(err);
                                        })
                            }

                            sendOutput(res, { submission })
                        }


                    } else {
                        sendOutput(res, { error: 'no such submission' })
                    }
                })
                .catch(err => {
                    sendOutput(res, { error: err })
                })
        } else {
            sendOutput(res, { error: 'no uuid supplied' })
        }
    });

}