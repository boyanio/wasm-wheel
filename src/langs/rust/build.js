const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;

    exec(`rustc +nightly --target wasm32-unknown-unknown --crate-type=cdylib -o ${buildDir}/wheel-part-rust.wasm ${__dirname}/wheel-part.rs`)
        .then(({ error, stdout }) => {
            console.log(stdout);
            if (error)
                throw error;

            done();
        });
};