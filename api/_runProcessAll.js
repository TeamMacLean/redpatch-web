import execa from 'execa';
import path from 'path';

export default (submission) => {
    const configPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'config.yaml')

    return new Promise((good, bad) => {

        const inputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'input');
        const outputFolderPath = path.join(__dirname, '..', 'uploads', submission.uuid, 'output');
        const fullResInputFolderPath = path.join(inputFolderPath, 'full');
        const fullResOutputFolderPath = path.join(outputFolderPath, 'full')

        const args = ['--source_folder', `${fullResInputFolderPath}`, '--destination_folder', `${fullResOutputFolderPath}`, '--filter_settings', `${configPath}`]

        if (submission.hasScaleCard) {
            args.push('--scale_card_side_length')
            args.push(`${submission.scaleCM}`)
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