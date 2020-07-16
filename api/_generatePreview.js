import path from 'path';
import execa from 'execa';
import config from './_config';

function run(fileInPath, fileOutPath, submission) {

    const configPath = config.getPath(submission.uuid)

    return new Promise((good, bad) => {
        const args = ['--source_folder', `${fileInPath}`, '--destination_folder', `${fileOutPath}`, '--filter_settings', `${configPath}`]
        //--source_folder ~/Desktop/single_image --destination_folder ~/Desktop/test_out --filter_settings ~/Desktop/default_filter.yml
        console.log('starting preview', args)
        execa(process.env.BATCH_PROCESS_PATH, args)
            .then((out) => {
                console.log('DONE!', out)
                good(out);
            })
            .catch(err => {
                console.error('err!', err);
                bad(err)
            })
    })
}

export default { run }

