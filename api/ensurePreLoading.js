import bodyParser from 'body-parser';
import Submission from './models/Submission';

import _runPreLoad from './_runPreLoad'

function sendOutput(res, object) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {
    bodyParser.json()(req, res, function () {
        const uuid = req.body.uuid;
        if (uuid) {
            Submission.findOne({ uuid })
                .populate('files')
                .populate('previewFile')
                .fill('config')
                .exec()
                .then(submission => {
                    if (submission) {

                        if (!submission.preLoading) {

                            submission.preLoading = true;
                            submission.save()
                                .then(() => {
                                    //start preloading then instantly send response (let it run in bg)
                                    _runPreLoad(submission)
                                        .then(() => {
                                            console.log('DONE preload')
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


                            //START IT!
                            // console.log('stating preload')
                            // _runPreLoad(submission)
                            //     .then(() => {
                            //         console.log('DONE preload')
                            //         //TODO should we do anything here?
                            //     })
                            //     .catch(err => {
                            //         console.error(err);
                            //     })
                            // console.log('while preloading...')
                            // submission.preLoading = true;
                            // submission.save()
                            //     .then(() => {
                            //         sendOutput(res, { submission })
                            //     })
                            //     .catch(err => {
                            //         sendOutput(res, { error: err })
                            //     })
                        } else {

                            //TODO is it tho!?
                            //IS IT THO!?
                            const reallyRunningLeaf = isRunning(submission.leafAreaPID);
                            const reallyRunningHealthy = isRunning(submission.healthyAreaPID);
                            const reallyRunningLesion = isRunning(submission.lesionAreaPID);
                            const reallyRunningScaleCard = submission.hasScaleCard && isRunning(submission.scaleCardPID);

                            if (!reallyRunningLeaf && !reallyRunningHealthy && !reallyRunningLesion && !reallyRunningScaleCard) {
                                //not really running, making it so!
                                _runPreLoad(submission)
                                    .then(() => {
                                        console.log('DONE preload')
                                        //TODO should we do anything here?
                                    })
                                    .catch(err => {
                                        console.error(err);
                                    })
                            }


                            sendOutput(res, { submission })
                        }


                    } else {
                        sendOutput(res, {})
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