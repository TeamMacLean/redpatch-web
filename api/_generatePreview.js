import path from 'path';
// import execa from 'execa';
import { PythonShell } from 'python-shell';

// import config from './_config';

function _run(scriptPath, filePostfix, submission) {
    return new Promise((good, bad) => {

        const configPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'config.yaml')


        //what type to run
        const inputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'input', 'preview');
        const outputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'output', 'preview');

        const previewInputFile = path.join(inputFolderPath, submission.previewFile.filename);
        const previewOutputFile = path.join(outputFolderPath, submission.previewFile.filename) + filePostfix;


        let options = {
            mode: 'text',
            pythonPath: process.env.PYTHON,
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: __dirname,
            args: [previewInputFile, previewOutputFile, configPath]
        };

        const pythonShell = PythonShell.run(scriptPath, options, function (err, results) {
            if (err) {
                bad(err)
            } else {
                good(results)
            }
        });

        console.log('TODO: childProcess',)

        if (!submission.processes) {
            submission.processes = [];
        }
        submission.processes.push(pythonShell.childProcess.pid)
        submission.save();

        //TODO 

        // pythonShell.childProcess
        // submission.
    })
}

function healthyArea(submission) {
    return _run("_get_healthy_regions.py", "_healthy_area.jpeg", submission)
}
function leafArea(submission) {
    return _run("_get_leaf_regions.py", "_leaf_area.jpeg", submission)
}
function lesionArea(submission) {
    return _run("_get_lesion_regions.py", "_lesion_area.jpeg", submission)
}
function scaleCard(submission) {
    return _run("_get_scale_card.py", "_scale_card.jpeg", submission)
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


