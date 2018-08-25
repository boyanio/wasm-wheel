const { exec } = require('child_process');

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;

    const ls = exec(`rustc --target wasm32-unknown-unknown --crate-type=cdylib -o ${buildDir}/wheel-part-rust.wasm ${__dirname}/wheel-part.rs`);
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stdout)
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Rust wheel part');

        done();
    });
};