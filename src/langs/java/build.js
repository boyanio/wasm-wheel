const { exec } = require('child_process');

exports.task = (done) => {
    const ls = exec('mvn clean install', { cwd: __dirname });
    ls.stdout.on('data', (data) => {
        console.log(data);
    });
    ls.stderr.on('data', (data) => {
        console.log(data);
    });
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Java wheel part');

        done();
    });
};