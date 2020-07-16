import url from 'url';
import fs from 'fs';
import path from 'path';
// import Submission from './models/Submission';

function sendOutput(res, object) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(object, null, 3));
}

export default function (req, res) {
    const queryObject = url.parse(req.url, true).query;
    const uuid = queryObject && queryObject.uuid;

    if (uuid) {

        const directory = path.join(__dirname, '..', 'uploads', uuid, 'output', 'preview');

        fs.readdir(directory, (err, files) => {
            if (err) {
                //TODO:err
                sendOutput(res, { error: err })
            } else {
                const urls = files.map(file => {
                    return path.join('/', 'uploads', uuid, 'output', 'preview', file);
                })
                sendOutput(res, { urls })
            }
        })
    } else {
        sendOutput(res, {})
    }

}