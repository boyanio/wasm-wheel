const { exec } = require('child_process');

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;

    const ls = exec(`rustc +nightly --target wasm32-unknown-unknown --crate-type=cdylib -o ${buildDir}/wheel-part-rust.wasm ${__dirname}/wheel-part.rs`);
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