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

        if (args.hasScaleCard) {
            args.push('--scale_card_side_length')
            args.push(`${submission.scaleCM}`)
        }

        //--source_folder ~/Desktop/single_image --destination_folder ~/Desktop/test_out --filter_settings ~/Desktop/default_filter.yml
        execa(process.env.BATCH_PROCESS_PATH, args)
            .then((out) => {
                console.log('DONE!', out)
                good(out);
            })
            .catch(err => {
                console.error('err!', err);
                bad(err)
            })
        console.log('subProcess', subProcess)
    })

}