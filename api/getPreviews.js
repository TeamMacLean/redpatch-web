import url from 'url';
// import fs from 'fs';
// import path from 'path';
import Submission from './models/Submission';

function sendOutput(res, object) {
    if (object.error) {
        console.error(object.error);
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {
    const queryObject = url.parse(req.url, true).query;
    const uuid = queryObject && queryObject.uuid;

    if (uuid) {

        Submission.findOne({ uuid: uuid })
            .populate('files')
            .populate('previewFile')
            .then(foundSubmission => {
                if (foundSubmission) {
                    const directory = `/uploads/${uuid}/output/preview`;

                    let previewFile;

                    if (foundSubmission.previewFile) {
                        previewFile = foundSubmission.previewFile;
                    } else {
                        previewFile = foundSubmission.files[0];
                    }

                    const urls = {
                        "original": `${directory}/${previewFile.filename}.jpeg`,
                        "healthy_area": `${directory}/${previewFile.filename}` + "_healthy_area" + ".jpeg",
                        "leaf_area": `${directory}/${previewFile.filename}` + "_leaf_area" + ".jpeg",
                        "lesion_area": `${directory}/${previewFile.filename}` + "_lesion_area" + ".jpeg",
                        "scale_card": `${directory}/${previewFile.filename}` + "_scale_card" + ".jpeg",
                    }

                    sendOutput(res, { urls })
                } else {
                    sendOutput(res, { error: "submission not found!" })
                }
            })
            .catch(err => {
                sendOutput(res, { error: err })
            })

    } else {
        sendOutput(res, {})
    }

}