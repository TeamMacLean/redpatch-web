const queue = require('fastq')(worker, 1)
const { PythonShell } = require('python-shell');
const path = require('path');

const redpatchBatchProcess = path.join(__dirname, '../lib/redpatch-batch-process.py')


function worker(arg, cb) {

    const inputFolderPath = path.join(__dirname, '../runs/1/input')
    const outputFolderPath = path.join(__dirname, '../runs/1/output')
    const filterPath = path.join(__dirname, '../runs/1/filter.yml')


    let options = {
        mode: 'text',
        pythonPath: 'python3',
        pythonOptions: ['-u'], // get print results in real-time
        args: [`-s ${inputFolderPath}`, `-d ${outputFolderPath}`, `-f ${filterPath}`]
    };

    console.log('running:', redpatchBatchProcess, options.args.join(' '))

    PythonShell.run(redpatchBatchProcess, options, function (err) {
        if (err) {
            cb(err)
        } else {
            cb(null, 1)
        }
    });

}

const add = () => {
    queue.push(42, function (err, result) {
        if (err) {
            console.error(err)
        } else {
            console.log('the result is', result)
        }
    })
}

export { add }