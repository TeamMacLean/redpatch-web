import execa from 'execa';
import path from 'path';

export default (submission) => {
    let uploadsPath = path.join('.', 'uploads');
    /* const oldU*/ uploadsPath = path.join(__dirname, '..', 'uploads')
    const configPath = path.join(uploadsPath, submission.uuid, 'config.yaml')

    return new Promise((good, bad) => {

        const inputFolderPath = path.join(uploadsPath, submission.uuid, 'input');
        const outputFolderPath = path.join(uploadsPath, submission.uuid, 'output');
        const fullResInputFolderPath = path.join(inputFolderPath, 'full');
        const fullResOutputFolderPath = path.join(outputFolderPath, 'full')

        const args = ['--source_folder', `${fullResInputFolderPath}`, '--destination_folder', `${fullResOutputFolderPath}`, '--filter_settings', `${configPath}`, '--create_tidy_output']

        if (submission.hasScaleCard) {
            args.push('--scale_card_side_length')
            args.push(`${submission.scaleCM}`)
        } else {
            // TEMP HACK
            console.log('scale card side length of 1 has been set as a default to avoid errors')
            args.push('--scale_card_side_length')
            args.push(`${1}`)
        }

        console.log('RUNNING:')
        console.log(process.env.BATCH_PROCESS_PATH, args.join(' '))

        //--source_folder ~/Desktop/single_image --destination_folder ~/Desktop/test_out --filter_settings ~/Desktop/default_filter.yml
        const exePromise = execa(process.env.BATCH_PROCESS_PATH, args)
        const PID = exePromise.pid;

        submission.processingPID = PID;
        submission.save()
            .then(() => {

            })
            .catch(err => {
                console.error('failed to save submission');
            })

        exePromise
            .then((out) => {
                console.log('DONE!', out)

                submission.processedAll = true;
                submission.processingPID = null;
                submission.save()
                    .then(() => {
                        good();
                    })
                    .catch(err => {
                        console.error('failed to save submission');
                        bad(err)
                    })


            })
            .catch(err => {
                console.error('err!', err);

                submission.processedAll = true;
                submission.processingPID = null;
                submission.save()
                    .then(() => {
                        good();
                    })
                    .catch(err => {
                        console.error('failed to save submission', err);
                        bad(err)
                    })

                // bad(err)
            })

    })

}