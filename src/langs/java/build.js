const { exec } = require('child_process');

exports.task = (done) => {
    const ls = exec('mvn clean install', { cwd: __dirname });
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stdout)
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Java wheel part');

        done();
    });
};