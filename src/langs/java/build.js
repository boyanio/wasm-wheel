const fs = require('fs');
const { exec } = require('child_process');

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;
    fs.copyFileSync(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-java.wasm-loader.js`);

    const ls = exec('mvn clean install', { cwd: __dirname });
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stdout)
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Java wheel part');

        done();
    });
};