import path from 'path';
// import execa from 'execa';
import { PythonShell } from 'python-shell';

// import config from './_config';

function _run(scriptPath, inputFile, outputFile, submission) {
    return new Promise((good, bad) => {

        const configPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'config.yaml')

        let options = {
            mode: 'text',
            pythonPath: process.env.PYTHON,
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: __dirname,
            args: [inputFile, outputFile, configPath]
        };

        console.log('in', inputFile, 'out', outputFile)
        PythonShell.run(scriptPath, options, function (err, results) {
            if (err) {
                bad(err)
            } else {
                good(results)
            }
        });
    })
}

function healthyArea(inputFile, outputFile, submission) {
    return _run("_get_healthy_regions.py", inputFile, outputFile + "_healthy_area.jpeg", submission)
}
function leafArea(inputFile, outputFile, submission) {
    return _run("_get_leaf_regions.py", inputFile, outputFile + "_leaf_area.jpeg", submission)
}
function lesionArea(inputFile, outputFile, submission) {
    return _run("_get_lesion_regions.py", inputFile, outputFile + "_lesion_area.jpeg", submission)
}
function scaleCard(inputFile, outputFile, submission) {
    return _run("_get_scale_card.py", inputFile, outputFile + "_scale_card.jpeg", submission)
}

export default { healthyArea, leafArea, lesionArea, scaleCard }

// function run(fileInPath, fileOutPath, submission) {

//     const configPath = config.getPath(submission.uuid)

//     return new Promise((good, bad) => {
//         const args = ['--source_folder', `${fileInPath}`, '--destination_folder', `${fileOutPath}`, '--filter_settings', `${configPath}`]
//         //--source_folder ~/Desktop/single_image --destination_folder ~/Desktop/test_out --filter_settings ~/Desktop/default_filter.yml
//         console.log('starting preview', args)
//         execa(process.env.BATCH_PROCESS_PATH, args)
//             .then((out) => {
//                 console.log('DONE!', out)
//                 good(out);
//             })
//             .catch(err => {
//                 console.error('err!', err);
//                 bad(err)
//             })
//     })
// }


